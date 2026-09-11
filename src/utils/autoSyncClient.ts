// Universal Real-Time Automatic Synchronization Client
// Handles both Administrator Broadcast Dispatch & Universal Instant Client Sync
import { 
  Signalement, 
  AssainissementMission, 
  EvaluationEnv, 
  WastePayment, 
  GlobalSyncState, 
  AdminAnnouncement,
  AdminBroadcastPayload 
} from '../types';
import { cacheSignalements, cacheMissions, cachePayments } from './offlineStorage';

const LAST_SYNC_ID_KEY = 'regedek_last_applied_sync_id';
const DISMISSED_ANNOUNCEMENTS_KEY = 'regedek_dismissed_announcements';

export interface SyncDataPayload {
  syncId: string;
  timestamp: number;
  signalements: Signalement[];
  missions: AssainissementMission[];
  evaluations: EvaluationEnv[];
  payments: WastePayment[];
  announcement?: AdminAnnouncement | null;
  forceInstantReload?: boolean;
  purgeObsoleteCaches?: boolean;
}

type SyncListener = (payload: SyncDataPayload) => void;
type StatusListener = (status: GlobalSyncState) => void;

class AutoSyncManager {
  private listeners: Set<SyncListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private timer: any = null;
  private currentIntervalSec: number = 15;
  private isChecking: boolean = false;
  private lastAppliedSyncId: string = '';
  private channel: BroadcastChannel | null = null;

  constructor() {
    try {
      this.lastAppliedSyncId = localStorage.getItem(LAST_SYNC_ID_KEY) || '';
    } catch (_) {}

    // Multi-tab / Multi-window cross-browser synchronization channel
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel('regedek_browser_sync_channel');
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'SYNC_APPLIED' && event.data?.data) {
            console.log('[AutoSync] Synchronisation inter-onglets reçue en direct');
            this.listeners.forEach(fn => {
              try { fn(event.data.data); } catch (_) {}
            });
          } else if (event.data?.type === 'STATUS_UPDATED' && event.data?.status) {
            this.statusListeners.forEach(fn => {
              try { fn(event.data.status); } catch (_) {}
            });
          }
        };
      }
    } catch (_) {}

    // Automatic background synchronization stopped per user request.
    // Only manual administrator broadcast/deployment is active.
    if (typeof window !== 'undefined') {
      // Automatic background sync disabled.
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  public start(intervalSec?: number) {
    // Automatic polling disabled. Only manual deployment by principal administrator.
    return;
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async checkNow(): Promise<boolean> {
    if (this.isChecking) return false;
    this.isChecking = true;

    try {
      // 1. Fetch lightweight status
      const res = await fetch(`/api/sync/status?t=${Date.now()}`);
      if (!res.ok) return false;

      const status: GlobalSyncState = await res.json();
      
      // Notify status listeners
      this.statusListeners.forEach(fn => fn(status));

      // Adjust interval if server requested a different pace
      if (status.autoSyncIntervalSec && status.autoSyncIntervalSec !== this.currentIntervalSec && status.autoSyncIntervalSec >= 5) {
        this.currentIntervalSec = status.autoSyncIntervalSec;
        this.start(this.currentIntervalSec);
      }

      // Check if there is a new sync
      if (status.syncId && status.syncId !== this.lastAppliedSyncId) {
        console.log(`[AutoSync] Nouvelle télédiffusion détectée depuis la console Admin : ${status.syncId}`);
        await this.pullAndApplyFullSync(status.syncId);
        return true;
      }
    } catch (err) {
      // Silent in offline mode
    } finally {
      this.isChecking = false;
    }
    return false;
  }

  private async pullAndApplyFullSync(syncId: string) {
    try {
      const res = await fetch(`/api/sync/full-data?t=${Date.now()}`);
      if (!res.ok) return;

      const data: SyncDataPayload = await res.json();

      // Persist in local storage caches immediately for offline robustness
      if (Array.isArray(data.signalements) && data.signalements.length > 0) {
        await cacheSignalements(data.signalements);
      }
      if (Array.isArray(data.missions) && data.missions.length > 0) {
        await cacheMissions(data.missions);
      }
      if (Array.isArray(data.payments) && data.payments.length > 0) {
        await cachePayments(data.payments);
      }

      // Record applied sync id
      this.lastAppliedSyncId = syncId;
      try {
        localStorage.setItem(LAST_SYNC_ID_KEY, syncId);
      } catch (_) {}

      // Handle cache purge if forced by Admin
      if (data.purgeObsoleteCaches && 'caches' in window) {
        try {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map(k => caches.delete(k)));
          console.log('[AutoSync] Caches obsolètes purgés suite à directive administrateur');
        } catch (_) {}
      }

      // Broadcast to all React components
      this.listeners.forEach(fn => {
        try {
          fn(data);
        } catch (e) {
          console.error('[AutoSync] Error notifying listener:', e);
        }
      });

      // Broadcast to other tabs/windows in the same browser
      if (this.channel) {
        try {
          this.channel.postMessage({ type: 'SYNC_APPLIED', data });
        } catch (_) {}
      }

      // If administrator requested an instant application reload
      if (data.forceInstantReload) {
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (e) {
      console.warn('[AutoSync] Error pulling full sync:', e);
    }
  }

  // Administrator trigger method (Strictly protected by Admin code / auth)
  public async triggerAdminBroadcast(payload: AdminBroadcastPayload): Promise<{
    success: boolean;
    syncId?: string;
    message?: string;
    error?: string;
    globalSyncState?: GlobalSyncState;
  }> {
    try {
      const res = await fetch('/api/admin/broadcast-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-code': payload.adminCode || 'regedek',
          'x-admin-email': payload.adminEmail || 'environnementplusrdc@gmail.com'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: json.error || 'Échec de la télédiffusion administrative.'
        };
      }

      // Also mark locally so the admin machine is in sync
      if (json.syncId) {
        this.lastAppliedSyncId = json.syncId;
        try {
          localStorage.setItem(LAST_SYNC_ID_KEY, json.syncId);
        } catch (_) {}
      }

      return {
        success: true,
        syncId: json.syncId,
        message: json.message,
        globalSyncState: json.globalSyncState
      };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message || 'Erreur réseau lors de la télédiffusion administrative.'
      };
    }
  }

  // Get broadcast history for admin audit
  public async getBroadcastHistory(): Promise<{
    globalSyncState: GlobalSyncState;
    history: any[];
  } | null> {
    try {
      const res = await fetch('/api/admin/broadcast-history');
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}
    return null;
  }

  // Announcement dismissal helpers
  public isAnnouncementDismissed(announcementId: string): boolean {
    try {
      const dismissed = JSON.parse(localStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY) || '[]');
      return dismissed.includes(announcementId);
    } catch (_) {
      return false;
    }
  }

  public dismissAnnouncement(announcementId: string): void {
    try {
      const dismissed = JSON.parse(localStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY) || '[]');
      if (!dismissed.includes(announcementId)) {
        dismissed.push(announcementId);
        localStorage.setItem(DISMISSED_ANNOUNCEMENTS_KEY, JSON.stringify(dismissed));
      }
    } catch (_) {}
  }

  // Reset sync marker to force complete fresh sync from server
  public resetSyncMarker(): void {
    this.lastAppliedSyncId = '';
    try {
      localStorage.removeItem(LAST_SYNC_ID_KEY);
      localStorage.removeItem('regedek_last_applied_sync_id');
    } catch (_) {}
  }
}

export const autoSyncClient = new AutoSyncManager();
