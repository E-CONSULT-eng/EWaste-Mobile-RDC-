import React from 'react';
import { ShieldCheck, Copy, CheckCircle2, X, Download } from 'lucide-react';

interface EcoCitizenConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionData: {
    confirmationCode: string;
    actionType: string;
    details: string;
    timestamp: string;
    citizenName: string;
  } | null;
}

export function EcoCitizenConfirmationModal({
  isOpen,
  onClose,
  actionData
}: EcoCitizenConfirmationModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !actionData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(actionData.confirmationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionTitle = (type: string) => {
    switch (type) {
      case 'SCAN_DECHET': return 'Scan & Analyse IA de Déchet';
      case 'SIGNALEMENT': return 'Signalement de Dépotoir';
      case 'PAIEMENT_TAXE': return 'Paiement Taxe de Salubrité';
      case 'MODULE_FORMATION': return 'Validation Module Éco-Citoyen';
      default: return 'Action Éco-Citoyen Enregistrée';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-100 animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white bg-emerald-700/50 hover:bg-emerald-700 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-500/40 px-2.5 py-0.5 rounded-full text-emerald-100">
                Espace Éco-Citoyen Officiel
              </span>
              <h3 className="text-lg font-bold mt-1">Code de Confirmation Unique</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="text-center bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4">
            <p className="text-xs text-emerald-800 font-medium uppercase tracking-wider mb-1">
              {getActionTitle(actionData.actionType)}
            </p>
            <div className="text-2xl font-mono font-bold text-emerald-700 tracking-wider flex items-center justify-center gap-2 my-2">
              <span>{actionData.confirmationCode}</span>
              <button
                onClick={handleCopy}
                title="Copier le code"
                className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && (
              <p className="text-xs text-emerald-600 font-semibold animate-pulse">
                ✓ Code copié dans le presse-papier !
              </p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Conservez ce code pour le suivi officiel de votre action civique.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Citoyen / Auteur :</span>
              <span className="font-semibold text-slate-800">{actionData.citizenName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Détails de l'action :</span>
              <span className="font-medium text-slate-800 text-right max-w-[200px] truncate" title={actionData.details}>
                {actionData.details}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Horodatage :</span>
              <span className="font-medium text-slate-800">
                {new Date(actionData.timestamp).toLocaleString('fr-FR')}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Fermer & Continuer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
