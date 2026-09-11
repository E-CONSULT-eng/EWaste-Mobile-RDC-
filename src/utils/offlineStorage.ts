// Offline IndexedDB and Local Cache storage for REGEDEK EWaste Mobile (ewastemobile.ai.studio)
import { Signalement, AssainissementMission, EvaluationEnv, WastePayment, OfflineQueueStats, OfflinePendingItem } from '../types';

const DB_NAME = 'regedek_waste_mobile_db';
const DB_VERSION = 3;

export interface OfflinePendingReport {
  id: string;
  data: Partial<Signalement>;
  createdAt: string;
  synced: boolean;
}

export interface OfflinePendingPayment {
  id: string;
  data: WastePayment;
  createdAt: string;
  synced: boolean;
}

export interface OfflinePendingMission {
  id: string;
  data: Partial<AssainissementMission>;
  createdAt: string;
  synced: boolean;
}

export interface OfflinePendingEvaluation {
  id: string;
  data: EvaluationEnv;
  createdAt: string;
  synced: boolean;
}

// Forced offline mode state for testing or low-connectivity zones in DRC
export function isForcedOffline(): boolean {
  try {
    return localStorage.getItem('regedek_force_offline') === 'true';
  } catch {
    return false;
  }
}

export function setForcedOffline(value: boolean): void {
  try {
    localStorage.setItem('regedek_force_offline', value ? 'true' : 'false');
    window.dispatchEvent(new Event(value ? 'offline' : 'online'));
  } catch {}
}

export function getEffectiveOnlineStatus(): boolean {
  if (isForcedOffline()) return false;
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Stores for cached server data
      if (!db.objectStoreNames.contains('signalements')) {
        db.createObjectStore('signalements', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('missions')) {
        db.createObjectStore('missions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('evaluations')) {
        db.createObjectStore('evaluations', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('payments')) {
        db.createObjectStore('payments', { keyPath: 'id' });
      }

      // Stores for offline queues
      if (!db.objectStoreNames.contains('pendingReports')) {
        db.createObjectStore('pendingReports', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingPayments')) {
        db.createObjectStore('pendingPayments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingMissions')) {
        db.createObjectStore('pendingMissions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingEvaluations')) {
        db.createObjectStore('pendingEvaluations', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Cache signalements list locally
export async function cacheSignalements(items: Signalement[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('signalements', 'readwrite');
    const store = tx.objectStore('signalements');
    for (const item of items) {
      store.put(item);
    }
  } catch (e) {
    try {
      localStorage.setItem('regedek_cache_signalements', JSON.stringify(items));
    } catch (_) {}
  }
}

// Get cached signalements
export async function getCachedSignalements(): Promise<Signalement[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('signalements', 'readonly');
      const store = tx.objectStore('signalements');
      const req = store.getAll();
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          resolve(req.result);
        } else {
          const local = localStorage.getItem('regedek_cache_signalements');
          resolve(local ? JSON.parse(local) : []);
        }
      };
      req.onerror = () => {
        const local = localStorage.getItem('regedek_cache_signalements');
        resolve(local ? JSON.parse(local) : []);
      };
    });
  } catch (e) {
    const local = localStorage.getItem('regedek_cache_signalements');
    return local ? JSON.parse(local) : [];
  }
}

// Cache missions
export async function cacheMissions(items: AssainissementMission[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('missions', 'readwrite');
    const store = tx.objectStore('missions');
    for (const item of items) {
      store.put(item);
    }
  } catch (e) {
    try {
      localStorage.setItem('regedek_cache_missions', JSON.stringify(items));
    } catch (_) {}
  }
}

// Get cached missions
export async function getCachedMissions(): Promise<AssainissementMission[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('missions', 'readonly');
      const store = tx.objectStore('missions');
      const req = store.getAll();
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          resolve(req.result);
        } else {
          const local = localStorage.getItem('regedek_cache_missions');
          resolve(local ? JSON.parse(local) : []);
        }
      };
      req.onerror = () => {
        const local = localStorage.getItem('regedek_cache_missions');
        resolve(local ? JSON.parse(local) : []);
      };
    });
  } catch (e) {
    const local = localStorage.getItem('regedek_cache_missions');
    return local ? JSON.parse(local) : [];
  }
}

// Save offline pending report (Signalement)
let reportSequence = 1;
export async function savePendingReport(data: Partial<Signalement>): Promise<OfflinePendingReport> {
  reportSequence++;
  const pendingItem: OfflinePendingReport = {
    id: `OFFLINE-SIG-${Date.now()}-${reportSequence}`,
    data,
    createdAt: new Date().toISOString(),
    synced: false
  };

  try {
    const db = await openDB();
    const tx = db.transaction('pendingReports', 'readwrite');
    tx.objectStore('pendingReports').put(pendingItem);
  } catch (e) {
    const saved = localStorage.getItem('regedek_pending_reports');
    const list: OfflinePendingReport[] = saved ? JSON.parse(saved) : [];
    list.unshift(pendingItem);
    localStorage.setItem('regedek_pending_reports', JSON.stringify(list));
  }

  return pendingItem;
}

// Get pending offline reports
export async function getPendingReports(): Promise<OfflinePendingReport[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('pendingReports', 'readonly');
      const req = tx.objectStore('pendingReports').getAll();
      req.onsuccess = () => {
        const idbResults = req.result || [];
        const localSaved = localStorage.getItem('regedek_pending_reports');
        const localResults: OfflinePendingReport[] = localSaved ? JSON.parse(localSaved) : [];
        const map = new Map<string, OfflinePendingReport>();
        idbResults.forEach(r => map.set(r.id, r));
        localResults.forEach(r => map.set(r.id, r));
        resolve(Array.from(map.values()));
      };
      req.onerror = () => {
        const localSaved = localStorage.getItem('regedek_pending_reports');
        resolve(localSaved ? JSON.parse(localSaved) : []);
      };
    });
  } catch (e) {
    const localSaved = localStorage.getItem('regedek_pending_reports');
    return localSaved ? JSON.parse(localSaved) : [];
  }
}

// Remove pending offline report once successfully synced
export async function removePendingReport(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingReports', 'readwrite');
    tx.objectStore('pendingReports').delete(id);
  } catch (e) {}

  try {
    const saved = localStorage.getItem('regedek_pending_reports');
    if (saved) {
      const list: OfflinePendingReport[] = JSON.parse(saved);
      const filtered = list.filter(r => r.id !== id);
      localStorage.setItem('regedek_pending_reports', JSON.stringify(filtered));
    }
  } catch (_) {}
}

// Save offline pending payment
let paymentSequence = 1;
export async function savePendingPayment(payment: WastePayment): Promise<OfflinePendingPayment> {
  paymentSequence++;
  const pendingItem: OfflinePendingPayment = {
    id: `OFFLINE-PAY-${Date.now()}-${paymentSequence}`,
    data: payment,
    createdAt: new Date().toISOString(),
    synced: false
  };

  try {
    const db = await openDB();
    const tx = db.transaction('pendingPayments', 'readwrite');
    tx.objectStore('pendingPayments').put(pendingItem);
  } catch (e) {
    const saved = localStorage.getItem('regedek_pending_payments');
    const list: OfflinePendingPayment[] = saved ? JSON.parse(saved) : [];
    list.unshift(pendingItem);
    localStorage.setItem('regedek_pending_payments', JSON.stringify(list));
  }

  return pendingItem;
}

// Get pending offline payments
export async function getPendingPayments(): Promise<OfflinePendingPayment[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('pendingPayments', 'readonly');
      const req = tx.objectStore('pendingPayments').getAll();
      req.onsuccess = () => {
        const idbResults = req.result || [];
        const localSaved = localStorage.getItem('regedek_pending_payments');
        const localResults: OfflinePendingPayment[] = localSaved ? JSON.parse(localSaved) : [];
        const map = new Map<string, OfflinePendingPayment>();
        idbResults.forEach(r => map.set(r.id, r));
        localResults.forEach(r => map.set(r.id, r));
        resolve(Array.from(map.values()));
      };
      req.onerror = () => {
        const localSaved = localStorage.getItem('regedek_pending_payments');
        resolve(localSaved ? JSON.parse(localSaved) : []);
      };
    });
  } catch (e) {
    const localSaved = localStorage.getItem('regedek_pending_payments');
    return localSaved ? JSON.parse(localSaved) : [];
  }
}

// Remove pending payment once synced
export async function removePendingPayment(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingPayments', 'readwrite');
    tx.objectStore('pendingPayments').delete(id);
  } catch (e) {}

  try {
    const saved = localStorage.getItem('regedek_pending_payments');
    if (saved) {
      const list: OfflinePendingPayment[] = JSON.parse(saved);
      const filtered = list.filter(r => r.id !== id);
      localStorage.setItem('regedek_pending_payments', JSON.stringify(filtered));
    }
  } catch (_) {}
}

// Save offline pending mission
let missionSequence = 1;
export async function savePendingMission(mission: Partial<AssainissementMission>): Promise<OfflinePendingMission> {
  missionSequence++;
  const pendingItem: OfflinePendingMission = {
    id: `OFFLINE-MIS-${Date.now()}-${missionSequence}`,
    data: mission,
    createdAt: new Date().toISOString(),
    synced: false
  };

  try {
    const db = await openDB();
    const tx = db.transaction('pendingMissions', 'readwrite');
    tx.objectStore('pendingMissions').put(pendingItem);
  } catch (e) {
    const saved = localStorage.getItem('regedek_pending_missions');
    const list: OfflinePendingMission[] = saved ? JSON.parse(saved) : [];
    list.unshift(pendingItem);
    localStorage.setItem('regedek_pending_missions', JSON.stringify(list));
  }

  return pendingItem;
}

// Get pending offline missions
export async function getPendingMissions(): Promise<OfflinePendingMission[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('pendingMissions', 'readonly');
      const req = tx.objectStore('pendingMissions').getAll();
      req.onsuccess = () => {
        const idbResults = req.result || [];
        const localSaved = localStorage.getItem('regedek_pending_missions');
        const localResults: OfflinePendingMission[] = localSaved ? JSON.parse(localSaved) : [];
        const map = new Map<string, OfflinePendingMission>();
        idbResults.forEach(r => map.set(r.id, r));
        localResults.forEach(r => map.set(r.id, r));
        resolve(Array.from(map.values()));
      };
      req.onerror = () => {
        const localSaved = localStorage.getItem('regedek_pending_missions');
        resolve(localSaved ? JSON.parse(localSaved) : []);
      };
    });
  } catch (e) {
    const localSaved = localStorage.getItem('regedek_pending_missions');
    return localSaved ? JSON.parse(localSaved) : [];
  }
}

// Remove pending mission once synced
export async function removePendingMission(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingMissions', 'readwrite');
    tx.objectStore('pendingMissions').delete(id);
  } catch (e) {}

  try {
    const saved = localStorage.getItem('regedek_pending_missions');
    if (saved) {
      const list: OfflinePendingMission[] = JSON.parse(saved);
      const filtered = list.filter(r => r.id !== id);
      localStorage.setItem('regedek_pending_missions', JSON.stringify(filtered));
    }
  } catch (_) {}
}

// Save offline pending evaluation
let evalSequence = 1;
export async function savePendingEvaluation(evalEnv: EvaluationEnv): Promise<OfflinePendingEvaluation> {
  evalSequence++;
  const pendingItem: OfflinePendingEvaluation = {
    id: `OFFLINE-EVAL-${Date.now()}-${evalSequence}`,
    data: evalEnv,
    createdAt: new Date().toISOString(),
    synced: false
  };

  try {
    const db = await openDB();
    const tx = db.transaction('pendingEvaluations', 'readwrite');
    tx.objectStore('pendingEvaluations').put(pendingItem);
  } catch (e) {
    const saved = localStorage.getItem('regedek_pending_evaluations');
    const list: OfflinePendingEvaluation[] = saved ? JSON.parse(saved) : [];
    list.unshift(pendingItem);
    localStorage.setItem('regedek_pending_evaluations', JSON.stringify(list));
  }

  return pendingItem;
}

// Get pending offline evaluations
export async function getPendingEvaluations(): Promise<OfflinePendingEvaluation[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('pendingEvaluations', 'readonly');
      const req = tx.objectStore('pendingEvaluations').getAll();
      req.onsuccess = () => {
        const idbResults = req.result || [];
        const localSaved = localStorage.getItem('regedek_pending_evaluations');
        const localResults: OfflinePendingEvaluation[] = localSaved ? JSON.parse(localSaved) : [];
        const map = new Map<string, OfflinePendingEvaluation>();
        idbResults.forEach(r => map.set(r.id, r));
        localResults.forEach(r => map.set(r.id, r));
        resolve(Array.from(map.values()));
      };
      req.onerror = () => {
        const localSaved = localStorage.getItem('regedek_pending_evaluations');
        resolve(localSaved ? JSON.parse(localSaved) : []);
      };
    });
  } catch (e) {
    const localSaved = localStorage.getItem('regedek_pending_evaluations');
    return localSaved ? JSON.parse(localSaved) : [];
  }
}

// Remove pending evaluation once synced
export async function removePendingEvaluation(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingEvaluations', 'readwrite');
    tx.objectStore('pendingEvaluations').delete(id);
  } catch (e) {}

  try {
    const saved = localStorage.getItem('regedek_pending_evaluations');
    if (saved) {
      const list: OfflinePendingEvaluation[] = JSON.parse(saved);
      const filtered = list.filter(r => r.id !== id);
      localStorage.setItem('regedek_pending_evaluations', JSON.stringify(filtered));
    }
  } catch (_) {}
}

// Global stats of all pending items across all modules
export async function getAllOfflineQueueStats(): Promise<OfflineQueueStats> {
  const [reports, missions, payments, evals] = await Promise.all([
    getPendingReports(),
    getPendingMissions(),
    getPendingPayments(),
    getPendingEvaluations()
  ]);

  return {
    signalements: reports.length,
    missions: missions.length,
    payments: payments.length,
    evaluations: evals.length,
    total: reports.length + missions.length + payments.length + evals.length
  };
}

// Get unified list of all pending items with friendly title and details
export async function getAllPendingOfflineItems(): Promise<OfflinePendingItem[]> {
  const [reports, missions, payments, evals] = await Promise.all([
    getPendingReports(),
    getPendingMissions(),
    getPendingPayments(),
    getPendingEvaluations()
  ]);

  const items: OfflinePendingItem[] = [];

  for (const r of reports) {
    items.push({
      id: r.id,
      type: 'signalement',
      title: `Signalement Dépotoir (${r.data.commune || 'Kinshasa'})`,
      details: `${r.data.quartier || 'Quartier non spécifié'} • ${r.data.severity || 'Modéré'} • Par: ${r.data.author || 'Citoyen'}`,
      createdAt: r.createdAt,
      synced: r.synced,
      data: r.data
    });
  }

  for (const m of missions) {
    items.push({
      id: m.id,
      type: 'mission',
      title: `Mission : ${m.data.title || 'Assainissement'}`,
      details: `${m.data.commune || 'Kinshasa'} • Équipe: ${m.data.team || 'Brigade'} • Statut: ${m.data.status || 'Planifié'}`,
      createdAt: m.createdAt,
      synced: m.synced,
      data: m.data
    });
  }

  for (const p of payments) {
    items.push({
      id: p.id,
      type: 'paiement',
      title: `Quittance Taxe : ${p.data.receiptNumber}`,
      details: `${p.data.payerName} • ${p.data.amountCDF.toLocaleString()} CDF (${p.data.paymentMethod})`,
      createdAt: p.createdAt,
      synced: p.synced,
      data: p.data
    });
  }

  for (const ev of evals) {
    items.push({
      id: ev.id,
      type: 'evaluation',
      title: `ÉIES & Score : ${ev.data.commune || 'Kinshasa'}`,
      details: `Salubrité: ${ev.data.salubriteScore}/100 • Drainage: ${ev.data.drainageScore}/100 • Auditeur: ${ev.data.auditor}`,
      createdAt: ev.createdAt,
      synced: ev.synced,
      data: ev.data
    });
  }

  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Cache payments list locally
export async function cachePayments(items: WastePayment[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('payments', 'readwrite');
    const store = tx.objectStore('payments');
    for (const item of items) {
      store.put(item);
    }
  } catch (e) {
    try {
      localStorage.setItem('regedek_cache_payments', JSON.stringify(items));
    } catch (_) {}
  }
}

// Get cached payments
export async function getCachedPayments(): Promise<WastePayment[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('payments', 'readonly');
      const store = tx.objectStore('payments');
      const req = store.getAll();
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          resolve(req.result);
        } else {
          const local = localStorage.getItem('regedek_cache_payments');
          resolve(local ? JSON.parse(local) : []);
        }
      };
      req.onerror = () => {
        const local = localStorage.getItem('regedek_cache_payments');
        resolve(local ? JSON.parse(local) : []);
      };
    });
  } catch (e) {
    const local = localStorage.getItem('regedek_cache_payments');
    return local ? JSON.parse(local) : [];
  }
}

// Master synchronized push of all queued offline items across all 4 modules
export async function syncEntireOfflineQueueToServer(): Promise<{
  syncedReports: number;
  syncedPayments: number;
  syncedMissions: number;
  syncedEvaluations: number;
  totalSynced: number;
}> {
  let syncedReports = 0;
  let syncedPayments = 0;
  let syncedMissions = 0;
  let syncedEvaluations = 0;

  // 1. Signalements
  const reports = await getPendingReports();
  for (const rep of reports) {
    try {
      const res = await fetch('/api/signalements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rep.data)
      });
      if (res.ok) {
        await removePendingReport(rep.id);
        syncedReports++;
      }
    } catch (_) {
      break;
    }
  }

  // 2. Payments
  const payments = await getPendingPayments();
  for (const p of payments) {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p.data)
      });
      if (res.ok) {
        await removePendingPayment(p.id);
        syncedPayments++;
      }
    } catch (_) {
      break;
    }
  }

  // 3. Missions
  const missions = await getPendingMissions();
  for (const m of missions) {
    try {
      const res = await fetch('/api/assainissement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m.data)
      });
      if (res.ok) {
        await removePendingMission(m.id);
        syncedMissions++;
      }
    } catch (_) {
      break;
    }
  }

  // 4. Evaluations
  const evaluations = await getPendingEvaluations();
  for (const ev of evaluations) {
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev.data)
      });
      if (res.ok) {
        await removePendingEvaluation(ev.id);
        syncedEvaluations++;
      }
    } catch (_) {
      break;
    }
  }

  return {
    syncedReports,
    syncedPayments,
    syncedMissions,
    syncedEvaluations,
    totalSynced: syncedReports + syncedPayments + syncedMissions + syncedEvaluations
  };
}

// Clear all offline caches, queues and IndexedDB stores for clean system reset
export async function clearAllOfflineStorage(): Promise<void> {
  try {
    const db = await openDB();
    const storeNames = [
      'signalements', 
      'missions', 
      'evaluations', 
      'payments', 
      'pendingReports', 
      'pendingPayments', 
      'pendingMissions', 
      'pendingEvaluations'
    ];
    const tx = db.transaction(storeNames, 'readwrite');
    for (const name of storeNames) {
      try {
        tx.objectStore(name).clear();
      } catch (_) {}
    }
  } catch (e) {
    console.warn("Notice: could not clear IndexedDB stores directly:", e);
  }

  // Clear fallback and cached local storage keys
  try {
    const keysToRemove = [
      'regedek_cache_signalements',
      'regedek_cache_missions',
      'regedek_cache_evaluations',
      'regedek_cache_payments',
      'regedek_offline_reports',
      'regedek_offline_payments',
      'regedek_offline_missions',
      'regedek_offline_evaluations'
    ];
    for (const k of keysToRemove) {
      localStorage.removeItem(k);
    }
  } catch (_) {}
}
