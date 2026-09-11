import React from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  GraduationCap, 
  CreditCard, 
  Download, 
  FileSpreadsheet, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone,
  Shield,
  Activity,
  ShieldAlert,
  Sparkles,
  Users,
  KeyRound,
  FileText,
  Radio,
  Clock,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';
import { Signalement, AssainissementMission, WastePayment, UserRole } from '../types';

interface HomeTabProps {
  signalements: Signalement[];
  missions: AssainissementMission[];
  payments?: WastePayment[];
  userRole?: UserRole;
  onNavigate: (tab: string) => void;
  onOpenGoogleWorkspace?: () => void;
  onOpenApkModal?: () => void;
}

export function HomeTab({ 
  signalements = [], 
  missions = [], 
  payments = [],
  userRole = 'citoyen',
  onNavigate, 
  onOpenGoogleWorkspace, 
  onOpenApkModal 
}: HomeTabProps) {
  // Real indicators computed strictly from actual records
  const totalSignalements = signalements.length;
  const activeSignalements = signalements.filter(s => s.status !== 'Nettoyé').length;
  const resolvedSignalements = signalements.filter(s => s.status === 'Nettoyé').length;
  const totalMissions = missions.length;
  const completedMissions = missions.filter(m => m.status === 'Terminé').length;
  const tonsCleaned = missions
    .filter(m => m.status === 'Terminé')
    .reduce((acc, m) => acc + (m.tonsCollected || 0), 0);
  const totalRecouvrementCDF = payments.reduce((acc, p) => acc + (p.amountCDF || 0), 0);

  // ----------------------------------------------------------------------
  // VIEW 1: INTERFACE CITOYEN
  // ----------------------------------------------------------------------
  if (userRole === 'citoyen') {
    return (
      <div className="space-y-6 pb-20">
        {/* Citizen Welcome Banner */}
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-emerald-700/80 text-emerald-100 rounded-full text-[10px] font-bold tracking-wide uppercase border border-emerald-600">
                  PORTAIL ÉCO-CITOYEN RDC
                </span>
                <span className="text-xs text-emerald-200">
                  Kinshasa & 26 Provinces
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Agissez pour la Salubrité de votre Quartier
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Photographiez les déchets pour guider les brigades Ets ENVIRONNEMENT-PLUS, réglez vos taxes de salubrité en toute transparence et découvrez les bonnes pratiques de tri et de compostage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onNavigate('scanner')}
                className="bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Scanner un Déchet (IA)</span>
              </button>

              <button
                onClick={() => onNavigate('signalements')}
                className="bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600 px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Signaler un Dépotoir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Citizen 4 Core Pillars */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fonctionnalités sur l'Interface Utilisateur</span>
            </h2>
            <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Espace Authentifié
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service 1: Scanner Déchet IA */}
            <div 
              onClick={() => onNavigate('scanner')}
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-600 transition shadow-xs cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition flex items-center gap-2">
                  <span>Scanner IA & Tri Intelligent</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-semibold">Vision IA</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Prenez en photo n'importe quel déchet. L'intelligence artificielle identifie instantanément sa matière, son degré de recyclabilité et vous indique dans quelle poubelle le jeter ainsi que les centres de recyclage à Kinshasa.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-emerald-800 group-hover:translate-x-1 transition">
                <span>Démarrer le scanner visuel</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>

            {/* Service 2: Signalement Déchets */}
            <div 
              onClick={() => onNavigate('signalements')}
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-600 transition shadow-xs cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition flex items-center gap-2">
                  <span>Signaler un Dépotoir Sauvage</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">GPS Réel</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Alertez la brigade Ets ENVIRONNEMENT-PLUS sur un amas d'immondices ou un caniveau bouché. La géolocalisation précise permet aux équipes communales d'intervenir et de planifier l'évacuation rapide.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-emerald-800 group-hover:translate-x-1 transition">
                <span>Transmettre une alerte terrain</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>

            {/* Service 3: Paiement Taxe Salubrité */}
            <div 
              onClick={() => onNavigate('paiement')}
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-600 transition shadow-xs cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition flex items-center gap-2">
                  <span>Paiement Électronique Taxe de Salubrité</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">Quittance Fiscale</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Réglez en direct les redevances ménagères ou commerciales via <b>Airtel Money</b>, <b>M-Pesa</b> ou <b>Equity BCDC</b>. Recevez immédiatement une quittance officielle certifiée avec code de traçabilité.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-emerald-800 group-hover:translate-x-1 transition">
                <span>Accéder au guichet de paiement</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>

            {/* Service 4: Sensibilisation & Formation */}
            <div 
              onClick={() => onNavigate('education')}
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-600 transition shadow-xs cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition flex items-center gap-2">
                  <span>Sensibilisation, Formations & Quiz</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">Certificat</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Suivez les modules vidéo pédagogiques, apprenez le compostage des déchets organiques ménagers, testez vos connaissances écologiques et obtenez votre Certificat Officiel d'Éco-Citoyenneté.
                </p>
              </div>
              <div className="flex items-center text-xs font-semibold text-emerald-800 group-hover:translate-x-1 transition">
                <span>Suivre la formation environnementale</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Real Community Impact & Eco-Tip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Alertes Citoyennes Traitées</span>
            <div className="text-2xl font-black text-emerald-800">{resolvedSignalements} / {totalSignalements}</div>
            <p className="text-[10px] text-gray-400">Dépotoirs déclarés et déjà évacués par les brigades</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase">Quittances Fiscales Citoyennes</span>
            <div className="text-2xl font-black text-blue-700">{payments.length}</div>
            <p className="text-[10px] text-gray-400">Paiements de salubrité enregistrés et validés</p>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
            <span className="text-[11px] font-bold text-emerald-900 uppercase flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-700" />
              <span>Éco-Geste du Jour</span>
            </span>
            <p className="text-xs text-emerald-800 font-medium leading-tight">
              Séparez les pelures de manioc et les restes de table des bouteilles en plastique. Les déchets organiques nourrissent le compost !
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW 2: INTERFACE SUPERVISEURS & BRIGADE
  // ----------------------------------------------------------------------
  if (userRole === 'institutionnel') {
    return (
      <div className="space-y-6 pb-20">
        {/* Brigade Hero Banner */}
        <div className="bg-gradient-to-br from-amber-900 via-amber-850 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-amber-700/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold tracking-wide uppercase border border-amber-500/40">
                  COCKPIT SUPERVISEURS & BRIGADE
                </span>
                <span className="text-xs text-amber-200">
                  Ets ENVIRONNEMENT-PLUS RDC
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Gestion Opérationnelle & Interventions Terrain
              </h1>

              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                Suivi des chantiers d'assainissement, évaluation environnementale (ÉIES & PGES) et génération des fiches de reporting journalier, hebdomadaire et mensuel.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onNavigate('assainissement')}
                className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Nouvelle Mission Brigade</span>
              </button>

              <button
                onClick={() => onNavigate('reporting')}
                className="bg-white text-slate-900 hover:bg-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4 text-amber-800" />
                <span>Reporting Régie</span>
              </button>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-amber-800/60">
            <div>
              <p className="text-[11px] text-amber-200 font-medium">Missions Brigade</p>
              <p className="text-2xl font-black text-white mt-0.5">{totalMissions}</p>
              <p className="text-[10px] text-amber-300/80">{completedMissions} achevées</p>
            </div>
            <div>
              <p className="text-[11px] text-amber-200 font-medium">Tonnage Évacué</p>
              <p className="text-2xl font-black text-white mt-0.5">{tonsCleaned} t</p>
              <p className="text-[10px] text-amber-300/80">Validées en décharge</p>
            </div>
            <div>
              <p className="text-[11px] text-amber-200 font-medium">Dépotoirs Actifs</p>
              <p className="text-2xl font-black text-amber-400 mt-0.5">{activeSignalements}</p>
              <p className="text-[10px] text-amber-300/80">À traiter d'urgence</p>
            </div>
            <div>
              <p className="text-[11px] text-amber-200 font-medium">Mode Hors-Ligne</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">Actif</p>
              <p className="text-[10px] text-emerald-300/80">Synchronisation automatique</p>
            </div>
          </div>
        </div>

        {/* Operational Modules */}
        <div>
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
            Outils de Supervision et Brigade
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Suivi Assainissement */}
            <div 
              onClick={() => onNavigate('assainissement')}
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-amber-600 transition shadow-xs cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-amber-800 transition">
                Suivi Assainissement
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Affectation des équipes de curage, suivi des camions-bennes et enregistrement du tonnage collecté par commune.
              </p>
              <div className="flex items-center text-xs font-semibold text-amber-800 pt-1">
                <span>Gérer les missions</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* 2. ÉIES & Évaluation Environnementale */}
            <div 
              onClick={() => onNavigate('evaluation')}
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-amber-600 transition shadow-xs cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-800 transition">
                ÉIES & Évaluation Env.
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Notice NIES, Plan de Gestion Environnementale et Sociale (PGES) et audits de conformité de l'Agence Congolaise de l'Environnement (ACE).
              </p>
              <div className="flex items-center text-xs font-semibold text-purple-800 pt-1">
                <span>Auditer les projets</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* 3. Reporting Journalier/Hebdo/Mois */}
            <div 
              onClick={() => onNavigate('reporting')}
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-amber-600 transition shadow-xs cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition">
                Reporting Périodique
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Génération des bilans journaliers, synthèses hebdomadaires et rapports mensuels consolidés avec export officiel en PDF.
              </p>
              <div className="flex items-center text-xs font-semibold text-emerald-800 pt-1">
                <span>Éditer les rapports</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* 4. Traitement Signalements */}
            <div 
              onClick={() => onNavigate('signalements')}
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-amber-600 transition shadow-xs cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-rose-800 transition">
                Prise en Charge Dépotoirs
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Examen des photos de dépotoirs signalés par les citoyens et mise à jour des statuts ("En cours", "Nettoyé").
              </p>
              <div className="flex items-center text-xs font-semibold text-rose-800 pt-1">
                <span>Traiter les alertes</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW 3: INTERFACE ADMINISTRATION CENTRALE
  // ----------------------------------------------------------------------
  return (
    <div className="space-y-6 pb-20">
      {/* Admin Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-gray-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-red-500/20 text-red-300 rounded-full text-[10px] font-bold tracking-wide uppercase border border-red-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>ADMINISTRATION CENTRALE</span>
              </span>
              <span className="text-xs text-slate-400">
                Ets ENVIRONNEMENT-PLUS (Principal) & Tutelle (Secondaires)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Supervision Temps Réel & Sécurité Administrative
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Surveillance continue de <b>chaque activité utilisateur</b>, partage des clés d'accès aux administrateurs secondaires, contrôle unifié des bases de données et télédiffusion des mises à jour OTA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('admin-database')}
              className="bg-red-700 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Tableau de Bord & BDD</span>
            </button>

            <button
              onClick={() => onNavigate('suivi-evaluation')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Suivi-Éval (M&E)</span>
            </button>
          </div>
        </div>

        {/* Real-time Global Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Recouvrement Réel</p>
            <p className="text-xl sm:text-2xl font-black text-blue-400 mt-0.5">
              {totalRecouvrementCDF.toLocaleString('fr-FR')} CDF
            </p>
            <p className="text-[10px] text-slate-500">{payments.length} quittances vérifiées</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Signalements Réceptionnés</p>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{totalSignalements}</p>
            <p className="text-[10px] text-slate-500">{resolvedSignalements} déjà assainis</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Missions Déployées</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{totalMissions}</p>
            <p className="text-[10px] text-slate-500">{tonsCleaned} tonnes évacuées</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Sécurité & Clés</p>
            <p className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5">Actif</p>
            <p className="text-[10px] text-slate-500">Clés partagées gérées</p>
          </div>
        </div>
      </div>

      {/* Admin Central Modules */}
      <div>
        <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
          Consoles d'Administration & Pilotage
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Tableau de Bord Temps Réel */}
          <div 
            onClick={() => onNavigate('admin-database')}
            className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-red-600 transition shadow-xs cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-700 transition flex items-center gap-2">
              <span>Activités Utilisateurs en Direct</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Flux chronologique complet en temps réel de chaque scan IA, chaque signalement citoyen, chaque quittance de taxe et mission de curage.
            </p>
            <div className="flex items-center text-xs font-semibold text-red-700 pt-1">
              <span>Ouvrir le flux d'activités</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2: Clés Partagées & Admins Secondaires */}
          <div 
            onClick={() => onNavigate('admin-database')}
            className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-red-600 transition shadow-xs cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition">
              Partage des Clés aux Admins Secondaires
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              L'Administrateur Principal (Ets ENVIRONNEMENT-PLUS) génère, transmet et révoque les clés d'accès partagées pour les directions et les ministères de tutelle.
            </p>
            <div className="flex items-center text-xs font-semibold text-indigo-700 pt-1">
              <span>Gérer les clés d'accès</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3: Télédiffusion Universelle OTA */}
          <div 
            onClick={() => onNavigate('admin-database')}
            className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-red-600 transition shadow-xs cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition">
              Synchronisation & Mise à Jour Universelle
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Diffuser instantanément des mises à jour de données et notifications prioritaires à toutes les applications citoyennes et brigades connectées.
            </p>
            <div className="flex items-center text-xs font-semibold text-purple-700 pt-1">
              <span>Déclencher une diffusion OTA</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
