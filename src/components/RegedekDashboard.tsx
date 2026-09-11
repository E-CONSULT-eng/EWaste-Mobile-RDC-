import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  CreditCard, 
  MapPin, 
  Users, 
  Clock, 
  Download, 
  Printer, 
  Search, 
  TrendingUp, 
  Building2, 
  ShieldCheck, 
  FileSpreadsheet, 
  ExternalLink,
  RefreshCw,
  Award
} from 'lucide-react';
import { Signalement, AssainissementMission, EvaluationEnv, WastePayment } from '../types';
import { KINSHASA_COMMUNES_LIST, computeCommunePerformance } from '../utils/meMetrics';
import { getStoredScans } from '../utils/databaseStore';

interface RegedekDashboardProps {
  signalements: Signalement[];
  missions: AssainissementMission[];
  evaluations: EvaluationEnv[];
  payments: WastePayment[];
  onNavigateToTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onOpenGoogleWorkspace?: () => void;
}

export function RegedekDashboard({
  signalements = [],
  missions = [],
  evaluations = [],
  payments = [],
  onNavigateToTab = () => {},
  onNavigate,
  onOpenGoogleWorkspace = () => {}
}: RegedekDashboardProps) {
  const navigateTab = onNavigate || onNavigateToTab;
  const [searchCommune, setSearchCommune] = useState('');
  const [lastRefreshTime, setLastRefreshTime] = useState<string>(() => 
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Scans from local database store
  const scans = useMemo(() => {
    try {
      return getStoredScans();
    } catch {
      return [];
    }
  }, [signalements]);

  // Aggregate Real-time KPIs
  const kpis = useMemo(() => {
    const totalSignalements = signalements.length;
    const nettoyed = signalements.filter(s => s.status === 'Nettoyé').length;
    const enCours = signalements.filter(s => s.status === 'En cours').length;
    const alertesEnAttente = signalements.filter(s => s.status === 'Signalé').length;
    const resolutionRate = totalSignalements > 0 ? Math.round((nettoyed / totalSignalements) * 100) : 100;

    const totalTonsCollected = missions.reduce((acc, m) => acc + (m.tonsCollected || 0), 0);
    const activeMissions = missions.filter(m => m.status === 'En cours').length;
    const completedMissions = missions.filter(m => m.status === 'Terminé').length;

    const totalTaxesCDF = payments
      .filter(p => p.status === 'Validé')
      .reduce((acc, p) => acc + (p.amountCDF || 0), 0);

    const totalScansCount = scans.length;

    return {
      totalSignalements,
      nettoyed,
      enCours,
      alertesEnAttente,
      resolutionRate,
      totalTonsCollected,
      activeMissions,
      completedMissions,
      totalTaxesCDF,
      totalScansCount
    };
  }, [signalements, missions, payments, scans]);

  // Commune Performance Data for the 24 Kinshasa Communes
  const communeData = useMemo(() => {
    return computeCommunePerformance(signalements, missions);
  }, [signalements, missions]);

  const filteredCommunes = communeData.filter(c => 
    c.commune.toLowerCase().includes(searchCommune.toLowerCase())
  );

  const handleRefresh = () => {
    setLastRefreshTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Cockpit Opérationnel Central • Ville Province de Kinshasa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Tableau de Bord Ets ENVIRONNEMENT-PLUS en Temps Réel
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Supervision consolidée des 24 communes de Kinshasa : dépotoirs signalés, tonnages évacués par les brigades, reconnaissance IA des flux de déchets et recouvrement de la taxe de salubrité.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-sm transition border border-white/10"
              title="Rafraîchir les flux"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lastRefreshTime}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTab('admin-database')}
              className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Base Centrale & Drive</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Realtime Operations Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Taux de Salubrité Urbaine */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
              <span className="uppercase tracking-wider">Taux de Salubrité Résolue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {kpis.resolutionRate}%
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {kpis.nettoyed} dépotoirs nettoyés sur {kpis.totalSignalements} signalés
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span className="text-rose-600 font-bold">{kpis.alertesEnAttente} alertes actives</span>
            <span className="text-amber-600 font-bold">{kpis.enCours} en cours</span>
          </div>
        </div>

        {/* Metric 2: Tonnage Total Évacué */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
              <span className="uppercase tracking-wider">Tonnage Évacué (Brigades)</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {kpis.totalTonsCollected.toLocaleString('fr-FR')} <span className="text-base font-bold text-slate-500">Tonnes</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {kpis.completedMissions} missions menées à terme
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span className="text-sky-700 font-bold">{kpis.activeMissions} missions sur le terrain</span>
            <span>24 communes</span>
          </div>
        </div>

        {/* Metric 3: Scanners IA et Sensibilisation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
              <span className="uppercase tracking-wider">Scans IA & Tri Citoyen</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {kpis.totalScansCount} <span className="text-base font-bold text-slate-500">Scans</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Reconnaissance automatique et recyclage
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span className="text-emerald-700 font-bold">Plastiques PET majeurs</span>
            <span>Tri sélectif</span>
          </div>
        </div>

        {/* Metric 4: Recouvrement Taxe de Salubrité */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
              <span className="uppercase tracking-wider">Recouvrement Salubrité</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {kpis.totalTaxesCDF.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-500">CDF</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Quittances certifiées Ets ENVIRONNEMENT-PLUS
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span className="text-emerald-700 font-bold">Mobile Money 100%</span>
            <span>Airtel / M-Pesa / Orange</span>
          </div>
        </div>
      </div>

      {/* Realtime Table: 24 Communes Performance */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Performance de Salubrité par Commune (Kinshasa)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Suivi en direct des 24 communes : taux d'évacuation, dépotoirs nettoyés et statut de vigilance.
            </p>
          </div>

          <div className="relative sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchCommune}
              onChange={(e) => setSearchCommune(e.target.value)}
              placeholder="Filtrer une commune..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Commune</th>
                <th className="py-2.5 px-3">Signalements</th>
                <th className="py-2.5 px-3">Dépotoirs Résolus</th>
                <th className="py-2.5 px-3">Taux de Résolution</th>
                <th className="py-2.5 px-3">Tonnage Évacué</th>
                <th className="py-2.5 px-3">Délai Moyen</th>
                <th className="py-2.5 px-3 text-right">Statut Vigilance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCommunes.map((c) => (
                <tr key={c.commune} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-bold text-slate-900 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>{c.commune}</span>
                  </td>
                  <td className="py-3 px-3 font-medium">
                    {c.signalementsTotal}
                  </td>
                  <td className="py-3 px-3 text-emerald-700 font-bold">
                    {c.signalementsResolus}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            c.tauxResolution >= 80 ? 'bg-emerald-500' : c.tauxResolution >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${c.tauxResolution}%` }}
                        />
                      </div>
                      <span className="font-bold">{c.tauxResolution}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium">
                    {c.tonnesCollectees} T
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    ~{c.delaiMoyenHeures}h
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      c.statut === 'Performant'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : c.statut === 'En progression'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {c.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
