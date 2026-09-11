import React, { useRef } from 'react';
import { Award, CheckCircle2, Download, Printer, QrCode, ShieldCheck, X } from 'lucide-react';
import { TrainingCertificate } from '../types';

interface TrainingCertificateModalProps {
  certificate: TrainingCertificate;
  onClose: () => void;
}

export function TrainingCertificateModal({ certificate, onClose }: TrainingCertificateModalProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Toolbar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Attestation de Formation Professionnelle</h3>
              <p className="text-[11px] text-slate-400">Régie de Gestion des Déchets de Kinshasa (REGEDEK)</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition"
              title="Imprimer ou enregistrer en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div ref={certRef} className="p-6 sm:p-10 bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 text-gray-900 relative">
          {/* Border Frame */}
          <div className="border-4 border-double border-emerald-800/40 p-6 sm:p-8 rounded-xl relative">
            {/* Watermark Logo Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
              <ShieldCheck className="w-96 h-96 text-emerald-950" />
            </div>

            {/* Official Header */}
            <div className="text-center space-y-1 mb-6 border-b pb-4 border-emerald-900/20">
              <div className="flex items-center justify-center space-x-2 text-[10px] sm:text-xs tracking-widest uppercase font-bold text-gray-600">
                <span>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
                <span>•</span>
                <span>VILLE-PROVINCE DE KINSHASA</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-emerald-950 tracking-wide uppercase">
                RÉGIE DE GESTION DES DÉCHETS DE KINSHASA (REGEDEK)
              </h2>
              <p className="text-[11px] text-emerald-800 font-medium">
                En partenariat avec Environnement Plus RDC & le Ministère de l'Environnement
              </p>
            </div>

            {/* Certificate Title */}
            <div className="text-center space-y-2 mb-6">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-[10px] tracking-wider uppercase rounded-full border border-amber-300">
                Certificat de Réussite Pédagogique
              </span>
              <p className="text-xs text-gray-500 italic">La présente atteste solennellement que</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight font-serif border-b-2 border-emerald-700/30 inline-block px-6 pb-1">
                {certificate.learnerName || "Citoyen Éco-Responsable"}
              </h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto pt-2">
                a suivi avec assiduité et validé avec succès l'ensemble des modules théoriques et pratiques du cursus :
              </p>
            </div>

            {/* Module Box */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-center my-4">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                Code : {certificate.code}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-emerald-950 mt-0.5">
                {certificate.moduleTitle}
              </h4>
              <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-emerald-800 font-medium">
                <span>Score d'évaluation : <strong className="text-emerald-950 font-bold">{certificate.scorePercent}%</strong></span>
                <span>•</span>
                <span>Mention : <strong className="text-emerald-950 font-bold">{certificate.scorePercent >= 90 ? 'Excellence' : 'Très Bien'}</strong></span>
              </div>
            </div>

            {/* Footer with Signatures & QR */}
            <div className="grid grid-cols-3 items-end pt-6 border-t border-emerald-900/20 text-center gap-2">
              <div className="space-y-1 text-left">
                <p className="text-[10px] uppercase font-bold text-gray-500">Date de délivrance</p>
                <p className="text-xs font-semibold text-gray-800">{certificate.issueDate}</p>
                <p className="text-[10px] text-gray-400 font-mono">ID: {certificate.certificateNumber}</p>
              </div>

              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="w-14 h-14 rounded-full border-2 border-amber-600 bg-amber-50 flex items-center justify-center shadow-inner">
                  <ShieldCheck className="w-8 h-8 text-amber-700" />
                </div>
                <span className="text-[9px] font-bold text-amber-800 uppercase">Sceau d'Homologation</span>
              </div>

              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase font-bold text-gray-500">Direction Générale</p>
                <p className="text-xs font-bold text-emerald-950">REGEDEK / ENV. PLUS</p>
                <p className="text-[10px] text-gray-400 italic">Signature certifiée</p>
              </div>
            </div>

            {/* Verification Note */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Document officiel vérifiable sur la plateforme ewastemobile.ai.studio (REGEDEK RDC)</span>
              </div>
              <span className="font-mono">N° {certificate.id}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Félicitations pour votre engagement en faveur de la salubrité de Kinshasa !
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger / Imprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
