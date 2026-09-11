import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Trash2, 
  ArrowRight, 
  Smartphone, 
  ShieldCheck, 
  X,
  CreditCard,
  FileText,
  Activity
} from 'lucide-react';
import { 
  getAllPendingOfflineItems, 
  getAllOfflineQueueStats, 
  isForcedOffline, 
  setForcedOffline,
  removePendingReport,
  removePendingMission,
  removePendingPayment,
  removePendingEvaluation,
  syncEntireOfflineQueueToServer
} from '../utils/offlineStorage';
import { OfflinePendingItem, OfflineQueueStats } from '../types';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncAll?: () => Promise<void>;
  onSyncCompleted?: () => Promise<void> | void;
  isSyncing?: boolean;
  isOnline: boolean;
}

export function OfflineManagerModal({
  isOpen,
  onClose,
  onSyncAll,
  onSyncCompleted,
  isSyncing = false,
  isOnline
}: OfflineManagerModalProps) {
  const [items, setItems] = useState<OfflinePendingItem[]>([]);
  const [stats, setStats] = useState<OfflineQueueStats>({ signalements: 0, missions: 0, payments: 0, evaluations: 0, total: 0 });
  const [forcedOffline, setForcedOfflineState] = useState<boolean>(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [internalSyncing, setInternalSyncing] = useState(false);

  const loadData = async () => {
    const [all, st] = await Promise.all([
      getAllPendingOfflineItems(),
      getAllOfflineQueueStats()
    ]);
    setItems(all);
    setStats(st);
    setForcedOfflineState(isForcedOffline());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, isOnline]);

  const handleToggleForcedOffline = () => {
    const next = !forcedOffline;
    setForcedOffline(next);
    setForcedOfflineState(next);
  };

  const handleManualSync = async () => {
    setInternalSyncing(true);
    try {
      if (onSyncAll) {
        await onSyncAll();
      } else {
        await syncEntireOfflineQueueToServer();
      }
      if (onSyncCompleted) {
        await onSyncCompleted();
      }
      await loadData();
      setSyncSuccessMessage("Tous les éléments hors-ligne valides ont été synchronisés avec succès !");
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setInternalSyncing(false);
    }
  };

  const handleDeleteItem = async (item: OfflinePendingItem) => {
    if (item.type === 'signalement') await removePendingReport(item.id);
    else if (item.type === 'mission') await removePendingMission(item.id);
    else if (item.type === 'paiement') await removePendingPayment(item.id);
    else if (item.type === 'evaluation') await removePendingEvaluation(item.id);
    await loadData();
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: OfflinePendingItem['type']) => {
    switch (type) {
      case 'signalement':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'mission':
        return <Trash2 className="w-4 h-4 text-emerald-600" />;
      case 'paiement':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'evaluation':
        return <FileText className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                Gestionnaire Hors-Ligne & Synchronisation
              </h2>
              <p className="text-xs text-gray-500">Validation et utilisation continue sans connexion Internet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State Banner */}
        <div className={`p-4 rounded-2xl border mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isOnline 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
            : 'bg-amber-50/70 border-amber-200 text-amber-950'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {isOnline ? 'Connecté au réseau (En Ligne)' : 'Mode Hors-Ligne Actif'}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {isOnline 
                ? "Toutes les actions sont synchronisées en direct. Si la connexion est coupée, vos saisies sont sécurisées localement."
                : "Vos signalements, quittances et missions sont enregistrés localement sur cet appareil et seront synchronisés dès le retour du réseau."
              }
            </p>
          </div>

          <div className="shrink-0 flex items-center space-x-2">
            <button
              onClick={handleToggleForcedOffline}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                forcedOffline 
                  ? 'bg-amber-600 text-white border-amber-700' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {forcedOffline ? 'Quitter Hors-ligne Forcé' : 'Simuler Hors-Ligne'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Signalements</span>
            <span className="text-lg font-bold text-gray-900">{stats.signalements}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Missions</span>
            <span className="text-lg font-bold text-gray-900">{stats.missions}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Paiements</span>
            <span className="text-lg font-bold text-gray-900">{stats.payments}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Total Attente</span>
            <span className="text-lg font-bold text-emerald-700">{stats.total}</span>
          </div>
        </div>

        {/* Success Notice */}
        {syncSuccessMessage && (
          <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 mb-4 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>{syncSuccessMessage}</span>
          </div>
        )}

        {/* Pending Items List */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs font-bold text-gray-700">
            <span>Éléments en file d'attente locale ({items.length})</span>
            {items.length > 0 && isOnline && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Synchroniser tout</span>
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {items.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center space-y-1">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-gray-700">Aucun élément en attente</p>
                <p className="text-[11px] text-gray-500">Toutes vos actions sont enregistrées et synchronisées.</p>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-gray-500 truncate">{item.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium border border-amber-200">
                      En attente
                    </span>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-200 transition"
                      title="Supprimer localement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Persistance IndexedDB sécurisée</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              Fermer
            </button>
            <button
              onClick={handleManualSync}
              disabled={isSyncing || items.length === 0 || !isOnline}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition ${
                isSyncing || items.length === 0 || !isOnline
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-800 text-white hover:bg-emerald-700'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronisation...' : 'Valider & Synchroniser'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
