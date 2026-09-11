// ============================================================================
// SYSTEM AUTOMATION ENGINE: EWaste Mobile (ewastemobile.ai.studio)
// Gère l'automatisation intégrale :
// 1. Synchronisation automatique continue en temps réel (Auto-Sync)
// 2. Mises à jour automatiques en ligne transparentes (Auto-OTA Update)
// 3. Réinitialisation et Restauration d'usine sécurisée (System Reset & Recovery)
// 4. Vidage et reprise automatique de la file d'attente hors-ligne (Offline Queue Recovery)
// ============================================================================

import { SystemAutomationState, SystemResetOptions } from '../types';
import { autoSyncClient } from './autoSyncClient';
import { 
  clearAllOfflineStorage, 
  syncEntireOfflineQueueToServer, 
  getAllOfflineQueueStats 
} from './offlineStorage';
import { 
  checkRemoteVersion, 
  applyInstantUpdate, 
  RemoteVersionInfo,
  APP_VERSION 
} from './instantUpdateManager';
import { clearAuthSession } from './authSessionManager';

const STORAGE_AUTOMATION_ENABLED = 'ewaste_system_automation_active';
const STORAGE_LAST_RESET = 'ewaste_last_system_reset';
const STORAGE_LAST_AUTO_SYNC = 'ewaste_last_auto_sync_ts';

type AutomationListener = (state: SystemAutomationState) => void;

class SystemAutomationEngine {
  private isAutomated: boolean = false;
  private autoSyncActive: boolean = false;
  private autoUpdateActive: boolean = false;
  private offlineAutoRecovery: boolean = true;
  private lastSyncTimestamp: number | null = null;
  private lastUpdateCheckTimestamp: number | null = null;
  private lastResetTimestamp: number | null = null;
  private pendingCount: number = 0;
  private currentHealth: 'optimal' | 'syncing' | 'updating' | 'recovering' = 'optimal';

  private listeners: Set<AutomationListener> = new Set();
  private syncTimer: any = null;
  private updateTimer: any = null;
  private isRunning: boolean = false;
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_AUTOMATION_ENABLED);
        this.isAutomated = stored === 'true'; // Disabled by default per user request
        const lastReset = localStorage.getItem(STORAGE_LAST_RESET);
        if (lastReset) this.lastResetTimestamp = parseInt(lastReset, 10);
        const lastSync = localStorage.getItem(STORAGE_LAST_AUTO_SYNC);
        if (lastSync) this.lastSyncTimestamp = parseInt(lastSync, 10);
      } catch (_) {}

      // Cross-tab broadcast for automation & reset events
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel('ewaste_automation_channel');
          this.channel.onmessage = (event) => {
            if (event.data?.type === 'SYSTEM_RESET_EXECUTED') {
              console.log('[Automation] Réinitialisation système reçue depuis un autre onglet.');
              window.location.reload();
            } else if (event.data?.type === 'AUTOMATION_TOGGLED') {
              this.isAutomated = !!event.data.enabled;
              this.notify();
            }
          };
        }
      } catch (_) {}
    }
  }

  public getState(): SystemAutomationState {
    return {
      isAutomated: this.isAutomated,
      autoSyncActive: this.autoSyncActive,
      autoUpdateActive: this.autoUpdateActive,
      offlineAutoRecovery: this.offlineAutoRecovery,
      lastSyncTimestamp: this.lastSyncTimestamp,
      lastUpdateCheckTimestamp: this.lastUpdateCheckTimestamp,
      lastResetTimestamp: this.lastResetTimestamp,
      pendingOfflineQueueCount: this.pendingCount,
      systemHealth: this.currentHealth
    };
  }

  public subscribe(listener: AutomationListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => {
      try { fn(state); } catch (_) {}
    });
  }

  public setAutomated(enabled: boolean) {
    this.isAutomated = enabled;
    try {
      localStorage.setItem(STORAGE_AUTOMATION_ENABLED, enabled ? 'true' : 'false');
    } catch (_) {}

    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'AUTOMATION_TOGGLED', enabled });
      } catch (_) {}
    }

    if (enabled) {
      this.start();
    } else {
      this.stop();
    }
    this.notify();
  }

  public start() {
    // Automatic background synchronization and auto-refresh are stopped per user request.
    // Only manual deployment by the principal administrator is active.
    return;
  }

  public stop() {
    this.isRunning = false;
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  private handleOnline = () => {
    if (this.isAutomated) {
      console.log('[Automation] Connexion rétablie : déclenchement immédiat de la synchronisation et de la vérification de mise à jour.');
      this.performAutoSync();
      this.performAutoUpdateCheck();
    }
  };

  private handleVisibility = () => {
    if (document.visibilityState === 'visible' && this.isAutomated && navigator.onLine) {
      this.performAutoSync();
      this.performAutoUpdateCheck();
    }
  };

  public async refreshPendingStats(): Promise<number> {
    try {
      const stats = await getAllOfflineQueueStats();
      this.pendingCount = stats.total;
      this.notify();
      return stats.total;
    } catch {
      return 0;
    }
  }

  // Auto-Sync: flushes queued offline reports/payments/missions and pulls server state
  public async performAutoSync(): Promise<{ success: boolean; syncedItems: number }> {
    if (!navigator.onLine) return { success: false, syncedItems: 0 };

    this.currentHealth = 'syncing';
    this.notify();

    let syncedItems = 0;
    try {
      // 1. Flush offline pending queue
      const queueResult = await syncEntireOfflineQueueToServer();
      syncedItems = queueResult.totalSynced;

      // 2. Check and pull latest broadcast from server
      await autoSyncClient.checkNow();

      this.lastSyncTimestamp = Date.now();
      try {
        localStorage.setItem(STORAGE_LAST_AUTO_SYNC, this.lastSyncTimestamp.toString());
      } catch (_) {}

      await this.refreshPendingStats();
      this.currentHealth = 'optimal';
      this.notify();
      return { success: true, syncedItems };
    } catch (err) {
      console.warn('[Automation] AutoSync notice:', err);
      this.currentHealth = 'optimal';
      this.notify();
      return { success: false, syncedItems };
    }
  }

  // Auto-Update: checks version.json and automatically applies update without breaking user state
  public async performAutoUpdateCheck(): Promise<{ updateAvailable: boolean; remoteInfo: RemoteVersionInfo | null }> {
    if (!navigator.onLine) return { updateAvailable: false, remoteInfo: null };

    this.lastUpdateCheckTimestamp = Date.now();
    try {
      const result = await checkRemoteVersion();
      if (result.updateAvailable && result.remoteInfo) {
        console.log(`[Automation] Mise à jour en ligne détectée : v${result.remoteInfo.version}`);
        this.currentHealth = 'updating';
        this.notify();

        // If forceUpdate or auto-update enabled, apply update transparently
        if (this.autoUpdateActive) {
          console.log('[Automation] Application automatique de la mise à jour...');
          await applyInstantUpdate(result.remoteInfo);
        }
      }
      this.currentHealth = 'optimal';
      this.notify();
      return result;
    } catch (err) {
      this.currentHealth = 'optimal';
      this.notify();
      return { updateAvailable: false, remoteInfo: null };
    }
  }

  // ==========================================================================
  // RÉINITIALISATION DU SYSTÈME (System Reset & Recovery)
  // ==========================================================================
  public async executeSystemReset(options: SystemResetOptions = {}): Promise<{
    success: boolean;
    message: string;
  }> {
    const {
      resetLocalCache = true,
      resetOfflineQueues = true,
      resetSessions = false,
      triggerServerReset = false,
      adminEmail,
      adminCode,
      forceReload = true,
      resetType = 'full_factory_reset'
    } = options;

    console.log('[Automation] Démarrage de la réinitialisation du système...', options);

    let serverMessage = '';

    // 1. Remote Server Reset if requested by Admin
    if (triggerServerReset) {
      try {
        const res = await fetch('/api/system/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-email': adminEmail || 'environnementplusrdc@gmail.com',
            'x-admin-code': adminCode || 'regedek'
          },
          body: JSON.stringify({
            resetType,
            adminEmail: adminEmail || 'environnementplusrdc@gmail.com',
            adminCode: adminCode || 'regedek'
          })
        });
        const serverData = await res.json();
        if (serverData.success) {
          serverMessage = serverData.message;
        } else {
          console.warn('[Automation] Serveur reset notice:', serverData.error);
        }
      } catch (err) {
        console.warn('[Automation] Erreur appel API reset:', err);
      }
    }

    // 2. Clear Local Offline Storage & Queues
    if (resetLocalCache || resetOfflineQueues) {
      await clearAllOfflineStorage();
    }

    // 3. Clear CacheStorage (Service Worker & Static Assets)
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log('[Automation] CacheStorage intégralement purgé.');
      } catch (_) {}
    }

    // 4. Reset AutoSync and Update Markers
    autoSyncClient.resetSyncMarker();
    try {
      localStorage.removeItem('regedek_last_applied_sync_id');
      localStorage.removeItem('regedek_applied_version');
      localStorage.removeItem('regedek_last_update_check');
      localStorage.removeItem('waste_mobile_notifications');
      localStorage.removeItem('regedek_dismissed_announcements');
    } catch (_) {}

    // 5. Reset Authentication Sessions if requested
    if (resetSessions) {
      clearAuthSession();
    }

    // 6. Record timestamp of reset
    this.lastResetTimestamp = Date.now();
    try {
      localStorage.setItem(STORAGE_LAST_RESET, this.lastResetTimestamp.toString());
    } catch (_) {}

    // 7. Notify other tabs via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'SYSTEM_RESET_EXECUTED', timestamp: this.lastResetTimestamp });
      } catch (_) {}
    }

    this.notify();

    const finalMessage = serverMessage 
      ? `Réinitialisation système terminée avec succès. ${serverMessage}`
      : "Réinitialisation et restauration locale effectuées avec succès. Le système ewastemobile.ai.studio est prêt.";

    // 8. Force clean page reload to refresh all React states and service workers
    if (forceReload && typeof window !== 'undefined') {
      setTimeout(() => {
        const targetUrl = new URL(window.location.origin + window.location.pathname);
        targetUrl.searchParams.set('_system_reset', Date.now().toString());
        window.location.replace(targetUrl.toString());
      }, 700);
    }

    return {
      success: true,
      message: finalMessage
    };
  }
}

export const systemAutomation = new SystemAutomationEngine();
