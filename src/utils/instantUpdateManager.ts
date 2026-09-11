// Instant OTA Update Manager for EWaste Mobile (ewastemobile.ai.studio)
// Ensures all already downloaded & installed versions (PWA / WebAPK / offline cache)
// receive instant updates to both code and information seamlessly.

export interface RemoteVersionInfo {
  version: string;
  buildTime: number;
  releaseDate: string;
  appName: string;
  forceUpdate?: boolean;
  cacheBuster?: string;
  changelog: string[];
  modules?: Record<string, boolean>;
}

export const APP_VERSION = "3.0.2";
export const APP_BUILD_TIMESTAMP = 1788874000000;
const STORAGE_KEY_LAST_VERSION = "regedek_applied_version";
const STORAGE_KEY_LAST_CHECK = "regedek_last_update_check";

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('regedek_ota_sync');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported:', e);
}

// Check if running as installed standalone PWA / WebAPK
export function isInstalledPwa(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function getLastUpdateCheckTimestamp(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY_LAST_CHECK);
  return raw ? parseInt(raw, 10) : null;
}

// Explicit forced online check with latency tracking for the Online Update Modal
export async function forceOnlineUpdateCheck(): Promise<{
  updateAvailable: boolean;
  remoteInfo: RemoteVersionInfo | null;
  latencyMs: number;
  reason?: string;
}> {
  const startTime = Date.now();
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        await reg.update().catch(() => {});
      }
    } catch (_) {}
  }
  const checkResult = await checkRemoteVersion();
  const latencyMs = Date.now() - startTime;
  return {
    ...checkResult,
    latencyMs
  };
}

// Check for updates against remote /version.json
export async function checkRemoteVersion(): Promise<{
  updateAvailable: boolean;
  remoteInfo: RemoteVersionInfo | null;
  reason?: string;
}> {
  if (typeof window === 'undefined') return { updateAvailable: false, remoteInfo: null };

  try {
    const res = await fetch(`/version.json?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });

    if (!res.ok) {
      return { updateAvailable: false, remoteInfo: null };
    }

    const data: RemoteVersionInfo = await res.json();
    const lastApplied = localStorage.getItem(STORAGE_KEY_LAST_VERSION);

    // Save timestamp of last check
    localStorage.setItem(STORAGE_KEY_LAST_CHECK, Date.now().toString());

    // Update if version string is different, build timestamp is newer, or forced
    const isDifferentVersion = data.version !== APP_VERSION || lastApplied !== data.version;
    const isNewerBuild = data.buildTime > APP_BUILD_TIMESTAMP;
    const isForced = data.forceUpdate && lastApplied !== data.version;

    if (isDifferentVersion || isNewerBuild || isForced) {
      return {
        updateAvailable: true,
        remoteInfo: data,
        reason: isForced ? 'Mise à jour obligatoire du système' : 'Nouvelle version disponible'
      };
    }

    return { updateAvailable: false, remoteInfo: data };
  } catch (err) {
    console.warn('Unable to check remote version (offline):', err);
    return { updateAvailable: false, remoteInfo: null };
  }
}

// Perform instant purge and reload
export async function applyInstantUpdate(remoteInfo?: RemoteVersionInfo): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // 1. Tell Service Worker to skipWaiting and clear caches
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      navigator.serviceWorker.controller.postMessage({ type: 'FORCE_PURGE_AND_UPDATE' });
    }

    // 2. Also register Service Worker updates
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        await reg.update().catch(() => {});
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    }

    // 3. Purge Window Cache Storage directly
    if ('caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map(k => window.caches.delete(k)));
    }

    // 4. Update stored version reference
    const versionToStore = remoteInfo?.version || APP_VERSION;
    localStorage.setItem(STORAGE_KEY_LAST_VERSION, versionToStore);
    localStorage.setItem('regedek_ota_last_updated', new Date().toISOString());

    // 5. Notify any other tabs via BroadcastChannel
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'APP_UPDATED',
        version: versionToStore,
        timestamp: Date.now()
      });
    }

    // 6. Hard reload with query param to bypass any intermediate proxy cache
    const targetUrl = new URL(window.location.href);
    targetUrl.searchParams.set('_ota_sync', Date.now().toString());
    window.location.replace(targetUrl.toString());
  } catch (e) {
    console.error('Error applying instant update:', e);
    // Fallback: simple reload
    window.location.reload();
  }
}

// Subscribe to instant updates (disabled automatic background checks per user instructions)
export function subscribeToInstantUpdates(
  callback: (info: { updateAvailable: boolean; remoteInfo: RemoteVersionInfo | null; reason?: string }) => void
): () => void {
  // Automatic background refreshing and update polling are disabled per user request.
  // Updates are deployed exclusively manually by the principal administrator.
  return () => {};
}
