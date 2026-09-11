import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Database, 
  Radio, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { 
  APP_VERSION, 
  subscribeToInstantUpdates, 
  applyInstantUpdate, 
  checkRemoteVersion, 
  isInstalledPwa,
  RemoteVersionInfo 
} from '../utils/instantUpdateManager';

export function InstantUpdateBanner() {
  const [updateInfo, setUpdateInfo] = useState<{
    updateAvailable: boolean;
    remoteInfo: RemoteVersionInfo | null;
    reason?: string;
  }>({ updateAvailable: false, remoteInfo: null });

  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);
  const isPwa = isInstalledPwa();

  useEffect(() => {
    // Subscribe to background checks & Service Worker updates
    const unsubscribe = subscribeToInstantUpdates((info) => {
      setUpdateInfo(info);
      setDismissed(false);
    });

    // Listen to custom event when SW takes over
    const handleSwUpdated = () => {
      setUpdateInfo((prev) => ({
        ...prev,
        updateAvailable: true,
        reason: 'Nouvelle version activée par le système'
      }));
    };
    window.addEventListener('regedek_sw_updated', handleSwUpdated);

    return () => {
      unsubscribe();
      window.removeEventListener('regedek_sw_updated', handleSwUpdated);
    };
  }, []);

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    try {
      await applyInstantUpdate(updateInfo.remoteInfo || undefined);
    } catch (e) {
      console.error(e);
      window.location.reload();
    }
  };

  if (!updateInfo.updateAvailable || dismissed) {
    return null;
  }

  const remoteVersion = updateInfo.remoteInfo?.version || '3.0.0';
  const changelog = updateInfo.remoteInfo?.changelog || [
    "Mise à jour universelle déployée pour ewastemobile.ai.studio",
    "Espace Éco-Citoyen : Scanner IA & Signalement unifié, Taxe salubrité, Éducation (aucune BDD ni reporting)",
    "Espace Superviseur & Brigade : Suivi assainissement de terrain, ÉIES, Reporting officiel",
    "Espace Administrateur Principal : Tableau de bord REGEDEK temps réel, Base Google Sheets & Drive",
    "Purge automatique des caches et actualisation instantanée"
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-gray-950 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md">
        
        {/* Top bar */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-gray-950 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold text-white tracking-wide">
                  Mise à jour instantanée disponible
                </h4>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-400 text-gray-950">
                  v{remoteVersion}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                {isPwa ? "Application installée sur votre smartphone" : "Navigateur & version téléchargée"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            title="Masquer temporairement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-gray-200 mt-2.5 leading-relaxed">
          Une nouvelle version avec les <strong>modules récents (M&E, Base Admin, synchronisation en direct)</strong> est prête. Cliquez ci-dessous pour actualiser vos informations instantanément.
        </p>

        {/* Details accordion */}
        {showDetails && (
          <div className="mt-3 pt-2.5 border-t border-white/10 text-xs text-gray-300 space-y-1.5 bg-black/20 p-2.5 rounded-xl">
            <div className="font-semibold text-emerald-300 text-[11px] uppercase tracking-wider mb-1">
              Améliorations intégrées :
            </div>
            {changelog.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
            <div className="text-[10px] text-gray-400 pt-1 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Vos brouillons locaux et coordonnées restent préservés.</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-emerald-300 hover:text-emerald-200 flex items-center space-x-1 py-1 px-2 rounded-lg hover:bg-white/5 transition"
          >
            <span>{showDetails ? "Masquer détails" : "Voir les nouveautés"}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={handleApplyUpdate}
            disabled={isUpdating}
            className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs py-2 px-4 rounded-xl shadow-lg transition flex items-center space-x-2 shrink-0 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? "Actualisation..." : "Mettre à jour maintenant"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
