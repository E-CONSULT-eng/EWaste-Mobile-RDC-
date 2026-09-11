import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Wifi,
  Cloud,
  Layers,
  ShieldCheck,
  Smartphone,
  Globe,
  X,
  Send,
  RotateCcw,
  Zap,
  Power,
  Trash2,
  Lock,
  ArrowRight
} from 'lucide-react';
import {
  APP_VERSION,
  forceOnlineUpdateCheck,
  applyInstantUpdate,
  isInstalledPwa,
  RemoteVersionInfo
} from '../utils/instantUpdateManager';
import { systemAutomation } from '../utils/systemAutomation';
import { SystemAutomationState, UserRole } from '../types';

interface OnlineUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole;
  onBroadcastSuccess?: () => void;
}

export function OnlineUpdateModal({
  isOpen,
  onClose,
  userRole = 'citoyen',
  onBroadcastSuccess
}: OnlineUpdateModalProps) {
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [remoteInfo, setRemoteInfo] = useState<RemoteVersionInfo | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [checkStatus, setCheckStatus] = useState<'idle' | 'up-to-date' | 'update-available' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [automationState, setAutomationState] = useState<SystemAutomationState>(() => systemAutomation.getState());
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetMode, setResetMode] = useState<'cache' | 'full' | 'server'>('cache');

  const isPwa = isInstalledPwa();

  useEffect(() => {
    const unsub = systemAutomation.subscribe((state) => {
      setAutomationState(state);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpen) {
      handleCheckUpdates();
    }
  }, [isOpen]);

  const handleCheckUpdates = async () => {
    setChecking(true);
    setErrorMessage('');
    try {
      const res = await forceOnlineUpdateCheck();
      setLatency(res.latencyMs);
      setRemoteInfo(res.remoteInfo);
      if (res.updateAvailable) {
        setCheckStatus('update-available');
      } else {
        setCheckStatus('up-to-date');
      }
    } catch (err: any) {
      setCheckStatus('error');
      setErrorMessage(err?.message || "Impossible de contacter ewastemobile.ai.studio. Vérifiez votre connexion Internet.");
    } finally {
      setChecking(false);
    }
  };

  const handleTriggerInstantSync = async () => {
    setChecking(true);
    try {
      const syncResult = await systemAutomation.performAutoSync();
      await handleCheckUpdates();
      if (syncResult.success) {
        setBroadcastMessage(`Synchronisation instantanée réussie (${syncResult.syncedItems} éléments traités).`);
      }
    } catch (e) {
      setErrorMessage("Erreur lors de la synchronisation manuelle.");
    } finally {
      setChecking(false);
    }
  };

  const handleApplyUpdate = async () => {
    setUpdating(true);
    try {
      await applyInstantUpdate(remoteInfo || undefined);
    } catch (err) {
      console.error(err);
      window.location.reload();
    }
  };

  const handleExecuteReset = async (type: 'cache' | 'full' | 'server') => {
    setResetting(true);
    setResetMessage(null);
    try {
      if (type === 'cache') {
        const res = await systemAutomation.executeSystemReset({
          resetLocalCache: true,
          resetOfflineQueues: false,
          resetSessions: false,
          forceReload: true
        });
        setResetMessage(res.message);
      } else if (type === 'full') {
        const res = await systemAutomation.executeSystemReset({
          resetLocalCache: true,
          resetOfflineQueues: true,
          resetSessions: false,
          forceReload: true
        });
        setResetMessage(res.message);
      } else if (type === 'server') {
        const res = await systemAutomation.executeSystemReset({
          resetLocalCache: true,
          resetOfflineQueues: true,
          triggerServerReset: true,
          adminEmail: 'environnementplusrdc@gmail.com',
          adminCode: 'regedek',
          forceReload: true
        });
        setResetMessage(res.message);
      }
    } catch (err: any) {
      setResetMessage("Erreur lors de la réinitialisation du système : " + (err?.message || 'Erreur inconnue'));
    } finally {
      setResetting(false);
      setConfirmResetOpen(false);
    }
  };

  const handleBroadcastToAll = async () => {
    setBroadcasting(true);
    setBroadcastMessage('');
    try {
      const token = localStorage.getItem('regedek_admin_code') || 'regedek-admin-2026';
      const res = await fetch('/api/admin/broadcast-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-code': token,
          'x-admin-email': 'environnementplusrdc@gmail.com'
        },
        body: JSON.stringify({
          version: '3.0.0',
          forceInstantReload: true,
          purgeObsoleteCaches: true,
          announcement: {
            title: "Mise à Jour Automatique & Télédiffusion Déployée",
            message: "Mise à jour automatique et synchronisation continue déployée pour ewastemobile.ai.studio. Rafraîchissement automatique actif.",
            severity: "urgent"
          }
        })
      });

      if (res.ok) {
        setBroadcastMessage("Télédiffusion envoyée à toutes les applications en ligne avec succès !");
        if (onBroadcastSuccess) onBroadcastSuccess();
      } else {
        const errData = await res.json().catch(() => ({}));
        setBroadcastMessage(errData.error || "Erreur lors de la télédiffusion.");
      }
    } catch (e: any) {
      setBroadcastMessage("Erreur réseau lors de la télédiffusion OTA.");
    } finally {
      setBroadcasting(false);
    }
  };

  const toggleAutomation = () => {
    const nextState = !automationState.isAutomated;
    systemAutomation.setAutomated(nextState);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Automatisation & Mises à Jour
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-300 text-slate-950">
                  v{APP_VERSION}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-900 text-emerald-200 border border-emerald-400/40 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Automatisé</span>
                </span>
              </div>
              <p className="text-xs text-emerald-100 flex items-center space-x-1.5 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                <span>Serveur officiel : <strong>ewastemobile.ai.studio</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">

          {/* 1. Master Automation Card */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-950 text-xs sm:text-sm">
                    Automatisation Intégrale du Système
                  </h3>
                  <p className="text-[11px] text-emerald-800">
                    Synchronisation temps réel, détection de version et reprise automatique hors-ligne
                  </p>
                </div>
              </div>

              <button
                onClick={toggleAutomation}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 ${
                  automationState.isAutomated
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{automationState.isAutomated ? 'ACTIF' : 'PAUSE'}</span>
              </button>
            </div>

            {/* 3 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200/70 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-[11px]">Sync Continue</div>
                  <div className="text-[10px] text-slate-500">Toutes les 20s + à chaque action</div>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-200/70 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-[11px]">Mises à Jour OTA</div>
                  <div className="text-[10px] text-slate-500">Détection silencieuse et purge</div>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-200/70 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 text-[11px]">Auto-Reprise</div>
                  <div className="text-[10px] text-slate-500">Vidage file dès retour réseau</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 2. Status & Version Diagnostic Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Diagnostic en Direct</span>
              </span>
              {latency !== null && (
                <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  Ping serveur : {latency} ms
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-[11px]">Version en cours d'exécution :</div>
                <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5 mt-0.5">
                  <span>Version {APP_VERSION}</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded font-semibold">Active</span>
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  Type : {isPwa ? "PWA / WebAPK installée" : "Navigateur web en direct"}
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-[11px]">Version serveur en ligne :</div>
                <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5 mt-0.5">
                  <span>{remoteInfo ? `Version ${remoteInfo.version}` : 'Vérification en cours...'}</span>
                  {remoteInfo && (
                    <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 text-[10px] rounded font-semibold">
                      ewastemobile
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  Dernière synchro : {automationState.lastSyncTimestamp ? new Date(automationState.lastSyncTimestamp).toLocaleTimeString() : 'Automatique'}
                </div>
              </div>
            </div>

            {/* Check status message banner */}
            {checkStatus === 'up-to-date' && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl flex items-start space-x-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Application entièrement à jour et synchronisée (v{APP_VERSION})</div>
                  <div className="text-emerald-800 text-[11px] mt-0.5">
                    Tous les modules de sécurité, Google Sheets et cloisonnement des 3 espaces sont opérationnels.
                  </div>
                </div>
              </div>
            )}

            {checkStatus === 'update-available' && (
              <div className="bg-amber-50 border border-amber-300 text-amber-950 p-3 rounded-xl flex items-start space-x-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold">Nouvelle version prête à être installée !</div>
                  <div className="text-amber-900 text-[11px] mt-0.5">
                    Version disponible : <strong>v{remoteInfo?.version || '3.0.0'}</strong>. Cliquez sur le bouton ci-dessous pour appliquer et purger sans perte de données.
                  </div>
                </div>
              </div>
            )}

            {checkStatus === 'error' && (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-xl flex items-start space-x-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-[11px]">{errorMessage}</div>
              </div>
            )}

            {broadcastMessage && (
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-950 p-2.5 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{broadcastMessage}</span>
              </div>
            )}

            {resetMessage && (
              <div className="bg-amber-50 border border-amber-300 text-amber-950 p-2.5 rounded-xl text-xs flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{resetMessage}</span>
              </div>
            )}
          </div>

          {/* 3. Action Buttons: Sync & Update */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={handleTriggerInstantSync}
              disabled={checking || updating}
              className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-slate-300 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Synchronisation...' : 'Synchroniser & Actualiser'}</span>
            </button>

            <button
              onClick={handleApplyUpdate}
              disabled={updating}
              className="flex-1 flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${updating ? 'animate-spin' : ''}`} />
              <span>{updating ? 'Mise à jour...' : 'Forcer la MàJ & Purger le Cache'}</span>
            </button>
          </div>

          {/* 4. Réinitialisation & Restauration Système (Full System Reset Section) */}
          <div className="border border-slate-200 bg-slate-50/70 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 uppercase tracking-wide">
                <RotateCcw className="w-3.5 h-3.5 text-slate-700" />
                <span>Réinitialisation & Restauration Système</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                ewastemobile.ai.studio
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              En cas de désynchronisation ou de données locales obsolètes, vous pouvez réinitialiser le cache local ou ordonner une remise à zéro certifiée du système.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setResetMode('cache');
                  setConfirmResetOpen(true);
                }}
                disabled={resetting}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs border border-slate-300 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                <span>Réinitialiser le Cache Local</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetMode('full');
                  setConfirmResetOpen(true);
                }}
                disabled={resetting}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold rounded-xl text-xs border border-amber-300 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Remise à Zéro Système (Usine)</span>
              </button>
            </div>

            {/* Admin-only server-wide reset */}
            {(userRole === 'admin' || userRole === 'institutionnel') && (
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode('server');
                    setConfirmResetOpen(true);
                  }}
                  disabled={resetting}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold rounded-xl text-xs border border-rose-300 transition"
                >
                  <Lock className="w-3.5 h-3.5 text-rose-700" />
                  <span>Réinitialisation Centrale Serveur (Admin Principal)</span>
                </button>
              </div>
            )}
          </div>

          {/* Confirmation Dialog for Reset */}
          {confirmResetOpen && (
            <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                    Confirmer la réinitialisation {resetMode === 'cache' ? 'du cache' : resetMode === 'server' ? 'centrale du serveur' : 'complète du système'} ?
                  </h4>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    {resetMode === 'cache' && "Tous les caches temporaires et fichiers en attente seront purgés. L'application rechargera immédiatement un état propre."}
                    {resetMode === 'full' && "Toutes les bases de données locales IndexedDB, caches PWA et files d'attente seront remis à zéro. Vous resterez connecté."}
                    {resetMode === 'server' && "Attention : Cette action réinitialise le flux serveur officiel, purge les caches de tous les utilisateurs connectés et génère un nouvel identifiant de synchronisation certifié."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={() => setConfirmResetOpen(false)}
                  disabled={resetting}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleExecuteReset(resetMode)}
                  disabled={resetting}
                  className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                  <span>{resetting ? 'Réinitialisation...' : 'Confirmer et Exécuter'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Admin Special Control: Universal OTA Broadcast */}
          {(userRole === 'admin' || userRole === 'institutionnel') && (
            <div className="border border-indigo-200 bg-indigo-50/70 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Télédiffusion Universelle OTA (Tous Utilisateurs)</span>
                </span>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  Espace Régie
                </span>
              </div>
              <p className="text-xs text-indigo-800 leading-relaxed">
                Ordonner à toutes les applications citoyennes, superviseurs et brigades en ligne de télécharger immédiatement la dernière version et de purger leurs caches locaux.
              </p>
              <button
                onClick={handleBroadcastToAll}
                disabled={broadcasting}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-800 hover:bg-indigo-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                <Send className={`w-3.5 h-3.5 ${broadcasting ? 'animate-pulse' : ''}`} />
                <span>{broadcasting ? 'Télédiffusion en cours...' : 'Télédiffuser la v3.0.0 à toutes les applications en ligne'}</span>
              </button>
            </div>
          )}

          {/* Specifications summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Garanties du Système Automatisé :</span>
            </h4>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2 text-xs text-slate-700">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Synchronisation transparente :</strong> Vos signalements, quittances et rapports de brigade sont envoyés automatiquement au serveur et à Google Sheets sans manipulation manuelle.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Mise à jour en continu :</strong> Toute nouvelle version publiée sur <em>ewastemobile.ai.studio</em> est détectée et appliquée avec purge des caches obsolètes.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Résilience hors-ligne totale :</strong> Continuez à travailler sans Internet ; la synchronisation se déclenche automatiquement dès la reconnexion.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Smartphone className="w-3.5 h-3.5 text-slate-600" />
            <span>ewastemobile.ai.studio • Automatisé à 100%</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
