import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  BellRing, 
  Zap, 
  Smartphone, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  RotateCcw,
  Sparkles,
  Info,
  Database
} from 'lucide-react';
import { GlobalSyncState, AdminBroadcastPayload } from '../types';
import { autoSyncClient } from '../utils/autoSyncClient';
import { OFFICIAL_ADMIN_EMAIL } from '../utils/googleSheets';

interface AdminSyncBroadcastSectionProps {
  adminEmail?: string;
  onManualRefreshRequested?: () => void;
}

export function AdminSyncBroadcastSection({
  adminEmail = OFFICIAL_ADMIN_EMAIL,
  onManualRefreshRequested = () => {}
}: AdminSyncBroadcastSectionProps) {
  const [syncStatus, setSyncStatus] = useState<GlobalSyncState | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Form parameters
  const [autoSyncInterval, setAutoSyncInterval] = useState<number>(15);
  const [purgeCaches, setPurgeCaches] = useState(true);
  const [forceReload, setForceReload] = useState(false);
  
  // Optional Announcement
  const [attachAnnouncement, setAttachAnnouncement] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementSeverity, setAnnouncementSeverity] = useState<'info' | 'warning' | 'urgent'>('info');

  // Load status & history
  const loadData = async () => {
    try {
      const data = await autoSyncClient.getBroadcastHistory();
      if (data) {
        setSyncStatus(data.globalSyncState);
        setHistory(data.history || []);
        if (data.globalSyncState?.autoSyncIntervalSec) {
          setAutoSyncInterval(data.globalSyncState.autoSyncIntervalSec);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadData();
    const unsub = autoSyncClient.subscribeStatus((status) => {
      setSyncStatus(status);
    });
    return () => unsub();
  }, []);

  const handleTriggerBroadcast = async () => {
    setIsSending(true);
    setSuccessNotice(null);
    setErrorNotice(null);

    const payload: AdminBroadcastPayload = {
      adminEmail,
      adminCode: 'regedek',
      autoSyncIntervalSec: autoSyncInterval,
      purgeObsoleteCaches: purgeCaches,
      forceInstantReload: forceReload,
      announcement: attachAnnouncement && announcementTitle.trim() && announcementMessage.trim() ? {
        title: announcementTitle.trim(),
        message: announcementMessage.trim(),
        severity: announcementSeverity
      } : undefined
    };

    const result = await autoSyncClient.triggerAdminBroadcast(payload);
    setIsSending(false);

    if (result.success) {
      setSuccessNotice(result.message || "Télédiffusion universelle déclenchée avec succès !");
      if (result.globalSyncState) {
        setSyncStatus(result.globalSyncState);
      }
      onManualRefreshRequested();
      await loadData();

      // Reset announcement fields if sent
      if (attachAnnouncement) {
        setAttachAnnouncement(false);
        setAnnouncementTitle('');
        setAnnouncementMessage('');
      }

      setTimeout(() => {
        setSuccessNotice(null);
      }, 7000);
    } else {
      setErrorNotice(result.error || "Impossible d'émettre la télédiffusion administrative.");
    }
  };

  const handleTriggerSystemReset = async () => {
    setIsResetting(true);
    setSuccessNotice(null);
    setErrorNotice(null);
    try {
      const res = await fetch('/api/system/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail || 'environnementplusrdc@gmail.com',
          'x-admin-code': 'regedek'
        },
        body: JSON.stringify({
          adminEmail: adminEmail || 'environnementplusrdc@gmail.com',
          adminCode: 'regedek',
          resetType: 'full_factory_reset'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessNotice("Le système ewastemobile.ai.studio a été réinitialisé avec succès. Les caches sont purgés et l'état propre est restauré.");
        setShowConfirmReset(false);
        loadData();
      } else {
        setErrorNotice(data.error || "Erreur lors de la réinitialisation.");
      }
    } catch (e: any) {
      setErrorNotice("Erreur réseau lors de la réinitialisation du système.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border-2 border-indigo-500/30 shadow-2xl space-y-6">
      {/* Header with status badge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/40">
              <Radio className="w-5 h-5 animate-pulse text-indigo-400" />
            </span>
            <span className="px-3 py-0.5 bg-red-600/30 text-red-300 rounded-full text-xs font-bold border border-red-500/40 uppercase tracking-wide">
              Exclusivité Administrateur
            </span>
            <span className="flex items-center text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-ping" />
              Canal de Télédiffusion Actif
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Synchronisation Automatique Universelle des Utilisateurs
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Ce module vous permet de <strong>déclencher instantanément la mise à jour de toutes les applications des citoyens, brigadiers et gestionnaires</strong> déjà installées ou connectées, sans qu'ils aient besoin de réinstaller l'application.
          </p>
        </div>

        {/* Live Audience Metrics */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/80 text-center">
            <div className="flex items-center justify-center space-x-1 text-slate-400 text-[10px] uppercase font-bold">
              <Database className="w-3 h-3 text-indigo-400" />
              <span>Données Réelles</span>
            </div>
            <p className="text-lg font-black text-indigo-300">
              {syncStatus?.realActionsCount ?? 
                ((syncStatus?.stats?.signalementsCount || 0) + 
                 (syncStatus?.stats?.missionsCount || 0) + 
                 (syncStatus?.stats?.paymentsCount || 0))}
            </p>
          </div>

          <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/80 text-center">
            <div className="flex items-center justify-center space-x-1 text-slate-400 text-[10px] uppercase font-bold">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Rythme Auto</span>
            </div>
            <p className="text-lg font-black text-emerald-400">
              {syncStatus?.autoSyncIntervalSec || 15}s
            </p>
          </div>
        </div>
      </div>

      {/* Notices */}
      {successNotice && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-200 rounded-2xl text-xs flex items-center space-x-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-bold">Diffusion administrative réussie !</p>
            <p className="text-emerald-300/90">{successNotice}</p>
          </div>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 bg-red-950/80 border border-red-500 text-red-200 rounded-2xl text-xs flex items-center space-x-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-bold">Erreur de télédiffusion</p>
            <p className="text-red-300/90">{errorNotice}</p>
          </div>
        </div>
      )}

      {/* Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Broadcasting controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Rate Selector */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/70 space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Fréquence de Synchronisation Automatique Imposée aux Clients</span>
              </span>
              <span className="text-[10px] text-indigo-400 font-mono">
                {autoSyncInterval} secondes
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { sec: 10, label: 'Temps Réel (10s)', desc: 'Priorité maximale' },
                { sec: 15, label: 'Optimal (15s)', desc: 'Standard recommandé' },
                { sec: 30, label: 'Fluide (30s)', desc: 'Basse bande-passante' },
                { sec: 60, label: 'Éco (1 min)', desc: 'Batterie préservée' }
              ].map(opt => (
                <button
                  key={opt.sec}
                  type="button"
                  onClick={() => setAutoSyncInterval(opt.sec)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    autoSyncInterval === opt.sec
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                      : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{opt.label}</p>
                  <p className="text-[10px] opacity-75">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Options Toggles */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/70 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Directives d'Exécution sur les Terminaux Clients</span>
            </h4>

            <div className="space-y-2.5">
              <label className="flex items-start space-x-3 text-xs text-slate-300 cursor-pointer p-2 rounded-xl hover:bg-slate-700/30 transition">
                <input
                  type="checkbox"
                  checked={purgeCaches}
                  onChange={(e) => setPurgeCaches(e.target.checked)}
                  className="mt-0.5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-semibold text-white">Purger les caches mémoire et hors-ligne obsolètes</span>
                  <p className="text-[11px] text-slate-400">
                    Nettoie le stockage temporaire des téléphones pour forcer la prise en compte des modifications récentes.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 text-xs text-slate-300 cursor-pointer p-2 rounded-xl hover:bg-slate-700/30 transition">
                <input
                  type="checkbox"
                  checked={forceReload}
                  onChange={(e) => setForceReload(e.target.checked)}
                  className="mt-0.5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-semibold text-white">Forcer le rechargement automatique immédiat de l'interface</span>
                  <p className="text-[11px] text-slate-400">
                    Provoque un rafraîchissement transparent de la vue chez tous les utilisateurs connectés.
                  </p>
                </div>
              </label>

              <label className="flex items-start space-x-3 text-xs text-slate-300 cursor-pointer p-2 rounded-xl hover:bg-slate-700/30 transition">
                <input
                  type="checkbox"
                  checked={attachAnnouncement}
                  onChange={(e) => setAttachAnnouncement(e.target.checked)}
                  className="mt-0.5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-semibold text-white">Joindre un Message Officiel Prioritaire ou Alerte Sanitaire</span>
                  <p className="text-[11px] text-slate-400">
                    Affichera une bannière officielle Ets ENVIRONNEMENT-PLUS en haut de l'écran des utilisateurs.
                  </p>
                </div>
              </label>
            </div>

            {/* Announcement form fields if enabled */}
            {attachAnnouncement && (
              <div className="pt-3 border-t border-slate-700/70 space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold text-slate-300">Niveau d'Urgence :</span>
                  {(['info', 'warning', 'urgent'] as const).map(sev => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setAnnouncementSeverity(sev)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                        announcementSeverity === sev
                          ? sev === 'urgent'
                            ? 'bg-red-600 text-white'
                            : sev === 'warning'
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-slate-700/70 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {sev === 'urgent' ? 'Alerte Urgente' : sev === 'warning' ? 'Important' : 'Information'}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Titre de la communication (ex: Alerte Curage N'djili & Salongo Spécial)..."
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />

                <textarea
                  placeholder="Message détaillé pour l'ensemble des citoyens et des brigades de collecte..."
                  rows={2}
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Broadcast Trigger Button */}
          <button
            type="button"
            onClick={handleTriggerBroadcast}
            disabled={isSending}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white rounded-2xl text-sm font-black transition-all shadow-xl hover:shadow-indigo-500/25 flex items-center justify-center space-x-2.5 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Télédiffusion en cours vers tous les utilisateurs...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-indigo-200" />
                <span>Diffuser la Synchronisation Instantanée à Tous les Utilisateurs</span>
              </>
            )}
          </button>

          {/* System Reset & Emergency Recovery */}
          <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Réinitialisation & Restauration Système (ewastemobile.ai.studio)</span>
              </span>
              <span className="text-[10px] text-amber-300/80 font-mono">Usine</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Purger immédiatement les caches de tous les terminaux connectés et réinitialiser le flux dans un état propre et certifié.
            </p>

            {!showConfirmReset ? (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                disabled={isResetting}
                className="w-full py-2.5 px-3 bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-700/50 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser le Système Central</span>
              </button>
            ) : (
              <div className="p-3 bg-red-950/90 border border-red-600 rounded-xl space-y-2 text-xs">
                <p className="text-red-200 font-medium">
                  Confirmer la réinitialisation complète du système ? Cette action va purger tous les caches et synchroniser toutes les applications clientes.
                </p>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-[11px] font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleTriggerSystemReset}
                    disabled={isResetting}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1 shadow-sm"
                  >
                    <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                    <span>{isResetting ? 'Réinitialisation...' : 'Confirmer la Réinitialisation'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Current Live State & Audit History */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Broadcast Summary Card */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                État Actuel du Flux Diffusé
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-mono">
                {syncStatus?.syncId || 'SYNC-LIVE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Signalements</span>
                <span className="text-base font-bold text-white">
                  {syncStatus?.stats?.signalementsCount ?? 0}
                </span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Missions Terrains</span>
                <span className="text-base font-bold text-white">
                  {syncStatus?.stats?.missionsCount ?? 0}
                </span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Quittances Taxes</span>
                <span className="text-base font-bold text-emerald-400">
                  {syncStatus?.stats?.paymentsCount ?? 0}
                </span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">ÉIES ACE</span>
                <span className="text-base font-bold text-blue-400">
                  {syncStatus?.stats?.evaluationsCount ?? 0}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1 space-y-1">
              <p>
                <strong>Dernière impulsion :</strong>{' '}
                {syncStatus?.timestamp ? new Date(syncStatus.timestamp).toLocaleTimeString() : 'En attente'}
              </p>
              <p className="truncate">
                <strong>Émise par :</strong> {syncStatus?.triggeredBy || adminEmail}
              </p>
            </div>
          </div>

          {/* Audit History of Broadcasts */}
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
              <span>Journal des Télédiffusions Récentes</span>
              <span className="text-[10px] text-slate-500">{history.length} entrées</span>
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">Aucune diffusion récente enregistrée.</p>
              ) : (
                history.map((item, idx) => (
                  <div 
                    key={item.syncId || idx}
                    className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-300">{item.title}</span>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{item.details}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>{item.triggeredBy}</span>
                      <span className="text-emerald-400 font-mono">Synchronisé universel</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
