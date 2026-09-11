import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  Search, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  ShieldCheck, 
  GraduationCap, 
  Camera, 
  Clock, 
  ExternalLink, 
  Filter, 
  Layers, 
  Check, 
  Loader2, 
  FileText,
  Radio,
  MapPin,
  TrendingUp,
  User,
  Info,
  Mail
} from 'lucide-react';
import { Signalement, AssainissementMission, EvaluationEnv } from '../types';
import { 
  DatabaseScanItem, 
  DatabaseFormationItem, 
  getStoredScans, 
  getStoredFormations, 
  filterItemsByPeriod 
} from '../utils/databaseStore';
import { exportDatabaseToWord, exportDatabaseToPDF } from '../utils/reportExporter';
import { User as FirebaseUser } from 'firebase/auth';
import { OFFICIAL_ADMIN_EMAIL, getLinkedSpreadsheet } from '../utils/googleSheets';

interface DatabaseHubTabProps {
  signalements: Signalement[];
  missions: AssainissementMission[];
  evaluations: EvaluationEnv[];
  googleUser?: FirebaseUser | null;
  onOpenGoogleWorkspace?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

type PeriodFilter = 'journalier' | 'hebdomadaire' | 'tout';
type StreamTab = 'all' | 'scans' | 'signalements' | 'missions' | 'eies' | 'formations';

export function DatabaseHubTab({
  signalements,
  missions,
  evaluations,
  googleUser,
  onOpenGoogleWorkspace = () => {},
  onNavigateToTab = () => {}
}: DatabaseHubTabProps) {
  const [period, setPeriod] = useState<PeriodFilter>('hebdomadaire');
  const [activeStream, setActiveStream] = useState<StreamTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time streams from storage
  const [scans, setScans] = useState<DatabaseScanItem[]>(getStoredScans());
  const [formations, setFormations] = useState<DatabaseFormationItem[]>(getStoredFormations());

  // Real-time animation feedback
  const [lastSyncTime, setLastSyncTime] = useState<string>('À l’instant');
  const [livePulse, setLivePulse] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Export states
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportSuccessType, setExportSuccessType] = useState<'word' | 'pdf' | null>(null);

  // Selected item modal
  const [selectedDetail, setSelectedDetail] = useState<{ type: string; data: any } | null>(null);

  // Listen to live database events
  useEffect(() => {
    const handleDbUpdate = (event: any) => {
      setLivePulse(true);
      setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setScans(getStoredScans());
      setFormations(getStoredFormations());
      setTimeout(() => setLivePulse(false), 2000);
    };

    window.addEventListener('ewaste_database_updated', handleDbUpdate);
    return () => window.removeEventListener('ewaste_database_updated', handleDbUpdate);
  }, []);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Filter datasets by period
  const filteredScans = useMemo(() => filterItemsByPeriod(scans, period), [scans, period]);
  const filteredSignalements = useMemo(() => filterItemsByPeriod(signalements, period), [signalements, period]);
  const filteredMissions = useMemo(() => filterItemsByPeriod(missions, period), [missions, period]);
  const filteredEvaluations = useMemo(() => filterItemsByPeriod(evaluations, period), [evaluations, period]);
  const filteredFormations = useMemo(() => filterItemsByPeriod(formations, period), [formations, period]);

  // Search filter
  const q = searchQuery.toLowerCase().trim();

  const searchedScans = useMemo(() => {
    if (!q) return filteredScans;
    return filteredScans.filter(s => 
      s.wasteName.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }, [filteredScans, q]);

  const searchedSignalements = useMemo(() => {
    if (!q) return filteredSignalements;
    return filteredSignalements.filter(s => 
      s.commune.toLowerCase().includes(q) ||
      s.quartier.toLowerCase().includes(q) ||
      (s.province && s.province.toLowerCase().includes(q)) ||
      s.description.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q)
    );
  }, [filteredSignalements, q]);

  const searchedMissions = useMemo(() => {
    if (!q) return filteredMissions;
    return filteredMissions.filter(m => 
      m.title.toLowerCase().includes(q) ||
      m.commune.toLowerCase().includes(q) ||
      m.team.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q)
    );
  }, [filteredMissions, q]);

  const searchedEvaluations = useMemo(() => {
    if (!q) return filteredEvaluations;
    return filteredEvaluations.filter(e => 
      e.commune.toLowerCase().includes(q) ||
      e.auditor.toLowerCase().includes(q) ||
      e.commentaires.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q)
    );
  }, [filteredEvaluations, q]);

  const searchedFormations = useMemo(() => {
    if (!q) return filteredFormations;
    return filteredFormations.filter(f => 
      f.learnerName.toLowerCase().includes(q) ||
      f.moduleOrQuiz.toLowerCase().includes(q) ||
      f.province.toLowerCase().includes(q) ||
      f.result.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q)
    );
  }, [filteredFormations, q]);

  // Combined chronologic feed for "all" tab
  const unifiedStream = useMemo(() => {
    const list: Array<{
      streamType: 'scan' | 'signalement' | 'mission' | 'eies' | 'formation';
      id: string;
      date: string;
      title: string;
      subtitle: string;
      tag: string;
      tagColor: string;
      metric?: string;
      raw: any;
    }> = [];

    searchedScans.forEach(s => {
      list.push({
        streamType: 'scan',
        id: s.id,
        date: s.timestamp || s.date,
        title: s.wasteName,
        subtitle: `${s.location} • Tri ${s.binColor}`,
        tag: `IA ${s.confidence}%`,
        tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        metric: s.category,
        raw: s
      });
    });

    searchedSignalements.forEach(sig => {
      list.push({
        streamType: 'signalement',
        id: sig.id,
        date: sig.date,
        title: `Dépotoir ${sig.commune} (${sig.quartier})`,
        subtitle: sig.description.slice(0, 75) + '...',
        tag: sig.status,
        tagColor: sig.status === 'Nettoyé' 
          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
          : sig.status === 'En cours'
            ? 'bg-blue-100 text-blue-800 border-blue-200'
            : 'bg-amber-100 text-amber-800 border-amber-200',
        metric: `${sig.tonnageEstime} tonnes`,
        raw: sig
      });
    });

    searchedMissions.forEach(m => {
      list.push({
        streamType: 'mission',
        id: m.id,
        date: m.startDate,
        title: m.title,
        subtitle: `${m.commune} • ${m.team}`,
        tag: m.status,
        tagColor: m.status === 'Terminé'
          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
          : 'bg-teal-100 text-teal-800 border-teal-200',
        metric: `${m.tonsCollected} t évacuées`,
        raw: m
      });
    });

    searchedEvaluations.forEach(e => {
      list.push({
        streamType: 'eies',
        id: e.id,
        date: e.date,
        title: `Audit ÉIES : ${e.commune}`,
        subtitle: `Auditeur : ${e.auditor}`,
        tag: `Salubrité ${e.salubriteScore}/100`,
        tagColor: 'bg-purple-100 text-purple-800 border-purple-200',
        metric: `Drainage ${e.drainageScore}/100`,
        raw: e
      });
    });

    searchedFormations.forEach(f => {
      list.push({
        streamType: 'formation',
        id: f.id,
        date: f.timestamp || f.date,
        title: `${f.learnerName} • ${f.moduleOrQuiz}`,
        subtitle: `${f.type} • ${f.province}`,
        tag: f.result,
        tagColor: f.result === 'Certifié' 
          ? 'bg-amber-100 text-amber-900 border-amber-300' 
          : 'bg-emerald-100 text-emerald-800 border-emerald-200',
        metric: `+${f.ecoPoints} pts`,
        raw: f
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchedScans, searchedSignalements, searchedMissions, searchedEvaluations, searchedFormations]);

  // Statistics calculation
  const totalTonsCollected = filteredMissions.reduce((acc, m) => acc + (m.tonsCollected || 0), 0);
  const totalTonsEstimated = filteredSignalements.reduce((acc, s) => acc + (s.tonnageEstime || 0), 0);
  const totalCleaned = filteredSignalements.filter(s => s.status === 'Nettoyé').length;
  const totalRecords = filteredScans.length + filteredSignalements.length + filteredMissions.length + filteredEvaluations.length + filteredFormations.length;

  // Handler: Export Word
  const handleExportWord = () => {
    setIsExportingWord(true);
    try {
      exportDatabaseToWord({
        period,
        scans: filteredScans,
        signalements: filteredSignalements,
        missions: filteredMissions,
        evaluations: filteredEvaluations,
        formations: filteredFormations,
        generatedBy: googleUser?.displayName || "Direction de l'Assainissement Ets ENVIRONNEMENT-PLUS RDC"
      });
      setExportSuccessType('word');
      setTimeout(() => setExportSuccessType(null), 3000);
    } catch (err) {
      console.error("Erreur export Word:", err);
      alert("Erreur lors de la génération du document Word.");
    } finally {
      setIsExportingWord(false);
    }
  };

  // Handler: Export PDF
  const handleExportPDF = () => {
    setIsExportingPDF(true);
    try {
      exportDatabaseToPDF({
        period,
        scans: filteredScans,
        signalements: filteredSignalements,
        missions: filteredMissions,
        evaluations: filteredEvaluations,
        formations: filteredFormations,
        generatedBy: googleUser?.displayName || "Direction de l'Assainissement Ets ENVIRONNEMENT-PLUS RDC"
      });
      setExportSuccessType('pdf');
      setTimeout(() => setExportSuccessType(null), 3000);
    } catch (err) {
      console.error("Erreur export PDF:", err);
      alert("Erreur lors de la génération du document PDF.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Refresh streams manually
  const handleRefresh = () => {
    setScans(getStoredScans());
    setFormations(getStoredFormations());
    setLastSyncTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setToastMessage("Base de données actualisée avec succès.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center space-x-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Live Connectivity Indicator */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-gray-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle background ambient circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Réception en Temps Réel</span>
              </span>
              <span className="text-xs text-emerald-200/70 font-medium">
                Dernière maj : {lastSyncTime}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Database className="w-7 h-7 text-emerald-400" />
              <span>Base de Données Nationale & Suivi Temps Réel</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl mt-1.5 leading-relaxed">
              Hub centralisant en continu les 5 flux opérationnels : analyses IA des déchets, signalements citoyens, interventions des brigades Ets ENVIRONNEMENT-PLUS, audits ÉIES et formations en gestion de l'environnement.
            </p>
          </div>

          {/* Quick Real-Time Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRefresh}
              className="bg-emerald-800/80 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-emerald-700/50 shadow-sm transition flex items-center space-x-2"
              title="Rafraîchir les flux temps réel"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${livePulse ? 'animate-spin' : ''}`} />
              <span>Actualiser les flux réels</span>
            </button>

            <button
              onClick={onOpenGoogleWorkspace}
              className="bg-white hover:bg-gray-100 text-emerald-950 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
              title="Consulter le classeur Google Sheets connecté"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Google Sheets RDC</span>
              <ExternalLink className="w-3 h-3 text-emerald-700 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* BANNIÈRE OFFICIELLE LIAISON Ets ENVIRONNEMENT-PLUS */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-900">Base de Données Centrale Liée :</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                Officiel RDC
              </span>
            </div>
            <p className="text-xs font-mono font-bold text-emerald-800 break-all">
              {OFFICIAL_ADMIN_EMAIL}
            </p>
            <p className="text-[11px] text-gray-500">
              Synchronisation continue Google Sheets & Google Drive pour le suivi national de salubrité publique.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={onOpenGoogleWorkspace}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Gérer Google Sheets & Drive</span>
          </button>
        </div>
      </div>

      {/* ESPACE TÉLÉCHARGEMENT & EXPORTATION WORD & PDF (JOURNALIER ET HEBDOMADAIRE) */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Download className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Espace de Téléchargement & Rapports d'Exploitation</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Génération instantanée des rapports officiels consolidés ou spécifiques pour la direction Ets ENVIRONNEMENT-PLUS et le Ministère de l'Environnement.
            </p>
          </div>

          {/* SÉLECTEUR DE FRÉQUENCE / PÉRIODE */}
          <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200 text-xs font-semibold">
            <button
              onClick={() => setPeriod('journalier')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition ${
                period === 'journalier'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Journalier (24h)</span>
            </button>

            <button
              onClick={() => setPeriod('hebdomadaire')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition ${
                period === 'hebdomadaire'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hebdomadaire (7j)</span>
            </button>

            <button
              onClick={() => setPeriod('tout')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition ${
                period === 'tout'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tout l'historique</span>
            </button>
          </div>
        </div>

        {/* ACTIONS DE TÉLÉCHARGEMENT WORD ET PDF */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* Bouton Téléchargement WORD */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                  Format Word .doc
                </span>
                <FileText className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mt-2.5">Rapport Officiel Word</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Document éditable avec en-tête national RDC, cartouche MEDD/Ets ENVIRONNEMENT-PLUS, tableaux de données complets et bloc de signature.
              </p>
            </div>

            <button
              onClick={handleExportWord}
              disabled={isExportingWord}
              className="mt-4 w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isExportingWord ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : exportSuccessType === 'word' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Téléchargé avec succès !</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Télécharger en Word ({period === 'journalier' ? 'Journalier' : period === 'hebdomadaire' ? 'Hebdomadaire' : 'Global'})</span>
                </>
              )}
            </button>
          </div>

          {/* Bouton Téléchargement PDF */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-5 border border-emerald-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Format PDF A4
                </span>
                <Download className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mt-2.5">Rapport Officiel PDF</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Mise en page haute fidélité avec tables formatées, indicateurs de performance, totaux et visa pour les autorités.
              </p>
            </div>

            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="mt-4 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isExportingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : exportSuccessType === 'pdf' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Téléchargé avec succès !</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Télécharger en PDF ({period === 'journalier' ? 'Journalier' : period === 'hebdomadaire' ? 'Hebdomadaire' : 'Global'})</span>
                </>
              )}
            </button>
          </div>

          {/* Impression directe / Aperçu */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  Impression
                </span>
                <Printer className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mt-2.5">Imprimer l'Aperçu</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Envoyez directement la synthèse de la période sélectionnée vers votre imprimante de bureau ou générez un PDF système.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-4 w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span>Imprimer l'Aperçu Écran</span>
            </button>
          </div>
        </div>

        {/* Aperçu du volume sélectionné */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500">
          <span>
            Portée actuelle : <strong className="text-emerald-800 font-semibold">{period === 'journalier' ? 'Dernières 24h (Journalier)' : period === 'hebdomadaire' ? '7 Derniers Jours (Hebdomadaire)' : 'Base complète'}</strong> ({totalRecords} enregistrements inclus)
          </span>
          <span className="flex items-center space-x-1.5 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Données prêtes pour transmission officielle</span>
          </span>
        </div>
      </div>

      {/* 5 CARTES INDICATEURS EN TEMPS RÉEL */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Scans IA */}
        <div 
          onClick={() => setActiveStream('scans')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStream === 'scans' 
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20' 
              : 'bg-white border-gray-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 mb-1.5">
            <Camera className="w-4 h-4" />
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">Flux 1</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{filteredScans.length}</div>
          <div className="text-xs font-bold text-gray-700 mt-0.5">Analyses Déchets IA</div>
          <div className="text-[10px] text-gray-500 mt-1">Caractérisation & Tri</div>
        </div>

        {/* Signalements */}
        <div 
          onClick={() => setActiveStream('signalements')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStream === 'signalements' 
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20' 
              : 'bg-white border-gray-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">Flux 2</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{filteredSignalements.length}</div>
          <div className="text-xs font-bold text-gray-700 mt-0.5">Signalements Citoyens</div>
          <div className="text-[10px] text-gray-500 mt-1">{totalCleaned} dépotoirs nettoyés</div>
        </div>

        {/* Missions Assainissement */}
        <div 
          onClick={() => setActiveStream('missions')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStream === 'missions' 
              ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-500/20' 
              : 'bg-white border-gray-200 hover:border-teal-300'
          }`}
        >
          <div className="flex items-center justify-between text-teal-700 mb-1.5">
            <Trash2 className="w-4 h-4" />
            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded-full">Flux 3</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{totalTonsCollected} <span className="text-sm font-bold text-gray-500">t</span></div>
          <div className="text-xs font-bold text-gray-700 mt-0.5">Assainissement Ets ENVIRONNEMENT-PLUS</div>
          <div className="text-[10px] text-gray-500 mt-1">{filteredMissions.length} missions actives</div>
        </div>

        {/* ÉIES & Évaluations */}
        <div 
          onClick={() => setActiveStream('eies')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeStream === 'eies' 
              ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-500/20' 
              : 'bg-white border-gray-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between text-purple-700 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full">Flux 4</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{filteredEvaluations.length}</div>
          <div className="text-xs font-bold text-gray-700 mt-0.5">ÉIES & Audits Environ.</div>
          <div className="text-[10px] text-gray-500 mt-1">Conformité ACE & PGES</div>
        </div>

        {/* Formations & Sensibilisation */}
        <div 
          onClick={() => setActiveStream('formations')}
          className={`p-4 rounded-2xl border transition cursor-pointer col-span-2 sm:col-span-1 ${
            activeStream === 'formations' 
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20' 
              : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-blue-700 mb-1.5">
            <GraduationCap className="w-4 h-4" />
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">Flux 5</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{filteredFormations.length}</div>
          <div className="text-xs font-bold text-gray-700 mt-0.5">Formations & Quiz</div>
          <div className="text-[10px] text-gray-500 mt-1">Citoyens & Brigades</div>
        </div>
      </div>

      {/* SÉLECTEUR DE FLUX DE DONNÉES & RECHERCHE */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Navigation entre flux */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setActiveStream('all')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeStream === 'all'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tous les Flux ({unifiedStream.length})</span>
            </button>

            <button
              onClick={() => setActiveStream('scans')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeStream === 'scans'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>1. Analyses IA ({searchedScans.length})</span>
            </button>

            <button
              onClick={() => setActiveStream('signalements')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeStream === 'signalements'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>2. Signalements ({searchedSignalements.length})</span>
            </button>

            <button
              onClick={() => setActiveStream('missions')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeStream === 'missions'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>3. Assainissement ({searchedMissions.length})</span>
            </button>

            <button
              onClick={() => setActiveStream('eies')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeStream === 'eies'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4. ÉIES ({searchedEvaluations.length})</span>
            </button>

            <button
              onClick={() => setActiveStream('formations')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeStream === 'formations'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>5. Formations ({searchedFormations.length})</span>
            </button>
          </div>

          {/* Champ de recherche rapide */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par commune, déchet, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* CONTENU DU FLUX EN DIRECT */}

        {/* VUE 1 : TOUS LES FLUX RÉUNIS (CHRONOLOGIQUE) */}
        {activeStream === 'all' && (
          <div className="space-y-2.5">
            {unifiedStream.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                Aucune entrée trouvée pour les critères actuels.
              </div>
            ) : (
              unifiedStream.map((item) => (
                <div
                  key={`${item.streamType}-${item.id}`}
                  onClick={() => setSelectedDetail({ type: item.streamType, data: item.raw })}
                  className="flex items-center justify-between p-3.5 bg-gray-50/60 hover:bg-emerald-50/50 rounded-2xl border border-gray-100 transition cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-xs border border-gray-200">
                      {item.streamType === 'scan' && <Camera className="w-4 h-4 text-emerald-600" />}
                      {item.streamType === 'signalement' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {item.streamType === 'mission' && <Trash2 className="w-4 h-4 text-teal-600" />}
                      {item.streamType === 'eies' && <ShieldCheck className="w-4 h-4 text-purple-600" />}
                      {item.streamType === 'formation' && <GraduationCap className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-xs truncate">{item.title}</span>
                        <span className="text-[10px] font-mono text-gray-400 shrink-0">#{item.id}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 ml-3">
                    {item.metric && (
                      <span className="text-xs font-semibold text-gray-700 hidden sm:inline">
                        {item.metric}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    <span className="text-[10px] text-gray-400 hidden md:inline">
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* VUE 2 : ANALYSES DÉCHETS (SCANNER IA) */}
        {activeStream === 'scans' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold tracking-wider bg-gray-50/70">
                  <th className="py-3 px-3">ID Scan</th>
                  <th className="py-3 px-3">Déchet Identifié</th>
                  <th className="py-3 px-3">Catégorie</th>
                  <th className="py-3 px-3">Bac / Couleur</th>
                  <th className="py-3 px-3">Recyclabilité</th>
                  <th className="py-3 px-3">Confiance IA</th>
                  <th className="py-3 px-3">Localisation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {searchedScans.map((s) => (
                  <tr 
                    key={s.id} 
                    onClick={() => setSelectedDetail({ type: 'scan', data: s })}
                    className="hover:bg-emerald-50/50 cursor-pointer transition"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-emerald-800">{s.id}</td>
                    <td className="py-3 px-3 font-semibold text-gray-900">{s.wasteName}</td>
                    <td className="py-3 px-3">
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-[10px] font-medium">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.binColor === 'Jaune' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        s.binColor === 'Vert' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                        s.binColor === 'Bleu' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                        s.binColor === 'Rouge' ? 'bg-red-100 text-red-900 border border-red-300' :
                        'bg-gray-100 text-gray-900'
                      }`}>
                        <span>{s.binColor}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-700">{s.recyclability}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-emerald-600 h-1.5 rounded-full" 
                            style={{ width: `${s.confidence}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-emerald-800">{s.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{s.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VUE 3 : SIGNALEMENTS CITOYENS */}
        {activeStream === 'signalements' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold tracking-wider bg-gray-50/70">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Localisation</th>
                  <th className="py-3 px-3">Gravité</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-3">Tonnage</th>
                  <th className="py-3 px-3">Déclarant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {searchedSignalements.map((sig) => (
                  <tr 
                    key={sig.id} 
                    onClick={() => setSelectedDetail({ type: 'signalement', data: sig })}
                    className="hover:bg-amber-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-amber-800">{sig.id}</td>
                    <td className="py-3 px-3 text-gray-500">{sig.date}</td>
                    <td className="py-3 px-3 font-semibold text-gray-900">
                      {sig.province || 'Kinshasa'} - {sig.commune} ({sig.quartier})
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sig.severity === 'Critique' ? 'bg-red-100 text-red-800 border border-red-200' :
                        sig.severity === 'Élevé' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {sig.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sig.status === 'Nettoyé' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        sig.status === 'En cours' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {sig.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-800">{sig.tonnageEstime} t</td>
                    <td className="py-3 px-3 text-gray-600">{sig.author || 'Citoyen'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VUE 4 : MISSIONS ASSAINISSEMENT Ets ENVIRONNEMENT-PLUS */}
        {activeStream === 'missions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold tracking-wider bg-gray-50/70">
                  <th className="py-3 px-3">ID Mission</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Intitulé</th>
                  <th className="py-3 px-3">Commune</th>
                  <th className="py-3 px-3">Brigade Mobilisée</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-3">Tonnes Évacuées</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {searchedMissions.map((m) => (
                  <tr 
                    key={m.id} 
                    onClick={() => setSelectedDetail({ type: 'mission', data: m })}
                    className="hover:bg-teal-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-teal-800">{m.id}</td>
                    <td className="py-3 px-3 text-gray-500">{m.startDate}</td>
                    <td className="py-3 px-3 font-semibold text-gray-900">{m.title}</td>
                    <td className="py-3 px-3 text-gray-700">{m.commune}</td>
                    <td className="py-3 px-3 text-gray-700">{m.team}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'Terminé' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-teal-100 text-teal-800 border border-teal-200'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-teal-900">{m.tonsCollected} t</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VUE 5 : ÉIES & ÉVALUATIONS ENVIRONNEMENTALES */}
        {activeStream === 'eies' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold tracking-wider bg-gray-50/70">
                  <th className="py-3 px-3">ID Audit</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Commune</th>
                  <th className="py-3 px-3">Auditeur</th>
                  <th className="py-3 px-3">Score Salubrité</th>
                  <th className="py-3 px-3">Score Drainage</th>
                  <th className="py-3 px-3">Recommandations PGES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {searchedEvaluations.map((e) => (
                  <tr 
                    key={e.id} 
                    onClick={() => setSelectedDetail({ type: 'eies', data: e })}
                    className="hover:bg-purple-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-purple-800">{e.id}</td>
                    <td className="py-3 px-3 text-gray-500">{e.date}</td>
                    <td className="py-3 px-3 font-semibold text-gray-900">{e.commune}</td>
                    <td className="py-3 px-3 text-gray-700">{e.auditor}</td>
                    <td className="py-3 px-3 font-bold text-emerald-700">{e.salubriteScore}/100</td>
                    <td className="py-3 px-3 font-bold text-teal-700">{e.drainageScore}/100</td>
                    <td className="py-3 px-3 text-gray-600 max-w-xs truncate">
                      {e.aiRecommendation || e.commentaires}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VUE 6 : FORMATIONS & SENSIBILISATIONS */}
        {activeStream === 'formations' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold tracking-wider bg-gray-50/70">
                  <th className="py-3 px-3">ID Session</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Nom Apprenant</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Module / Quiz</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">Résultat</th>
                  <th className="py-3 px-3">Points Verts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {searchedFormations.map((f) => (
                  <tr 
                    key={f.id} 
                    onClick={() => setSelectedDetail({ type: 'formation', data: f })}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-blue-800">{f.id}</td>
                    <td className="py-3 px-3 text-gray-500">
                      {f.timestamp ? new Date(f.timestamp).toLocaleDateString('fr-FR') : f.date}
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-900">{f.learnerName}</td>
                    <td className="py-3 px-3 text-gray-600">{f.type}</td>
                    <td className="py-3 px-3 font-medium text-gray-800">{f.moduleOrQuiz}</td>
                    <td className="py-3 px-3 font-bold text-emerald-800">{f.score}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.result === 'Certifié' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        f.result === 'Validé' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {f.result}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700">+{f.ecoPoints} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL WHEN CLICKING ANY ENTRY */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                  Fiche Détaillée Base de Données
                </span>
                <span className="text-xs font-mono text-gray-400">#{selectedDetail.data?.id}</span>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="text-base font-bold text-gray-900">
                {selectedDetail.data?.wasteName || selectedDetail.data?.title || selectedDetail.data?.moduleOrQuiz || `Enregistrement ${selectedDetail.data?.id}`}
              </h3>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                {Object.entries(selectedDetail.data || {}).map(([key, value]) => {
                  if (typeof value === 'object') return null;
                  return (
                    <div key={key} className="flex items-start justify-between gap-4 py-1 border-b border-gray-200/50 last:border-0">
                      <span className="text-gray-500 font-medium capitalize">{key}</span>
                      <span className="text-gray-900 font-semibold text-right max-w-[240px] break-words">
                        {String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDetail(null)}
                className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-gray-800 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
