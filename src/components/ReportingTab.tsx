import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Sparkles, FileText, CheckCircle2, Loader2, Calendar, ShieldCheck, Printer, Check } from 'lucide-react';
import { RegedekReport, Signalement, AssainissementMission } from '../types';
import { exportConsolidatedReportPDF } from '../utils/pdfExport';

interface ReportingTabProps {
  signalements: Signalement[];
  missions: AssainissementMission[];
}

export function ReportingTab({ signalements, missions }: ReportingTabProps) {
  const [period, setPeriod] = useState<'journalier' | 'hebdomadaire' | 'mensuel'>('journalier');
  const [reportData, setReportData] = useState<RegedekReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const fetchReport = async (selectedPeriod: 'journalier' | 'hebdomadaire' | 'mensuel') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: selectedPeriod })
      });
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(period);
  }, [period]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      exportConsolidatedReportPDF({
        reportData,
        period,
        signalements,
        missions
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error("Erreur lors de la génération du PDF:", err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
              SUPERVISEURS & BRIGADES
            </span>
            <span className="text-xs text-gray-500">ENVIRONNEMENT-PLUS & REGEDEK</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Reporting Opérationnel de Salubrité</h1>
          <p className="text-xs text-gray-500">Rapports officiels journaliers, hebdomadaires et mensuels pour le suivi des interventions de brigade.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-2 disabled:opacity-50"
            title="Télécharger le rapport consolidé officiel REGEDEK en format PDF"
          >
            {isExportingPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : exportSuccess ? (
              <Check className="w-4 h-4 text-emerald-200" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{exportSuccess ? 'PDF Téléchargé !' : 'Exporter PDF Officiel'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-medium shadow-sm transition flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
        {[
          { id: 'journalier', label: 'Rapport Journalier', desc: 'Fiche opérationnelle du jour' },
          { id: 'hebdomadaire', label: 'Rapport Hebdomadaire', desc: 'Bilan des 7 derniers jours' },
          { id: 'mensuel', label: 'Rapport Mensuel', desc: 'Synthèse consolidée du mois' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setPeriod(item.id as any)}
            className={`flex-1 py-2.5 px-3 rounded-xl transition text-center ${
              period === item.id 
                ? 'bg-emerald-800 text-white shadow-xs' 
                : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
            }`}
          >
            <div className="text-xs font-bold">{item.label}</div>
            <div className={`text-[10px] hidden sm:block ${period === item.id ? 'text-emerald-200' : 'text-gray-400'}`}>
              {item.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Report Container */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Génération du rapport officiel REGEDEK par IA...</p>
        </div>
      ) : reportData ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* Header */}
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                  OFFICIEL REGEDEK
                </span>
                <span className="text-xs text-gray-400">Date: {reportData.date}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">{reportData.title}</h2>
            </div>
            <div className="text-right text-xs text-gray-500">
              Régie de Gestion des Déchets de Kinshasa
            </div>
          </div>

          {/* KPIs */}
          {reportData.kpis && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 text-center">
                <p className="text-[11px] text-emerald-800 font-medium mb-1">Déchets Traités</p>
                <h3 className="text-xl font-extrabold text-emerald-900">{reportData.kpis.totalTons} t</h3>
              </div>
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 text-center">
                <p className="text-[11px] text-amber-800 font-medium mb-1">Dépotoirs Actifs</p>
                <h3 className="text-xl font-extrabold text-amber-900">{reportData.kpis.activeDumps}</h3>
              </div>
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 text-center">
                <p className="text-[11px] text-blue-800 font-medium mb-1">Sites Nettoyés</p>
                <h3 className="text-xl font-extrabold text-blue-900">{reportData.kpis.cleanedDumps}</h3>
              </div>
              <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 text-center">
                <p className="text-[11px] text-purple-800 font-medium mb-1">Taux Résolution</p>
                <h3 className="text-xl font-extrabold text-purple-900">
                  {reportData.kpis.tauxResolution || reportData.kpis.satisfactionSalubrite || "78%"}
                </h3>
              </div>
            </div>
          )}

          {/* Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Synthèse Exécutive</h3>
            <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {reportData.summary}
            </p>
          </div>

          {/* Recommendations */}
          {reportData.recommendations && reportData.recommendations.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Recommandations Stratégiques pour la Direction</span>
              </h3>
              <ul className="space-y-2">
                {reportData.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-gray-700 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
                    <span className="font-bold text-emerald-700 shrink-0">{idx + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Consolidated Export Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Télécharger le dossier consolidé complet REGEDEK</span>
              </h4>
              <p className="text-[11px] text-emerald-800/80">
                Génère un document PDF certifié incluant la synthèse, les {missions.length} missions d'assainissement et les {signalements.length} dépotoirs répertoriés.
              </p>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
            >
              {isExportingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : exportSuccess ? (
                <Check className="w-4 h-4 text-emerald-200" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{exportSuccess ? 'Téléchargé avec succès !' : 'Télécharger le PDF (.pdf)'}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
