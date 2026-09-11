import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  MapPin, 
  Layers, 
  Activity, 
  FileSpreadsheet, 
  ShieldCheck, 
  Sparkles,
  Info,
  DollarSign,
  Calendar,
  Building2,
  RefreshCw,
  Award
} from 'lucide-react';
import { Signalement, AssainissementMission, EvaluationEnv, WastePayment, MeIndicator } from '../types';
import { computeMeIndicators, computeCommunePerformance, KINSHASA_COMMUNES_LIST } from '../utils/meMetrics';

interface SuiviEvaluationTabProps {
  signalements: Signalement[];
  missions: AssainissementMission[];
  evaluations: EvaluationEnv[];
  payments: WastePayment[];
  onNavigateToTab?: (tab: string) => void;
}

type MeViewMode = 'indicateurs' | 'communes' | 'recommandations';
type AxeFilter = 'ALL' | 'Opérations & Salubrité' | 'Finances & Recouvrement' | 'Gouvernance & Conformité ÉIES' | 'Impact Sanitaire & Environnemental';

export function SuiviEvaluationTab({
  signalements,
  missions,
  evaluations,
  payments,
  onNavigateToTab = () => {}
}: SuiviEvaluationTabProps) {
  const [viewMode, setViewMode] = useState<MeViewMode>('indicateurs');
  const [selectedAxe, setSelectedAxe] = useState<AxeFilter>('ALL');
  const [searchCommune, setSearchCommune] = useState('');
  const [communeFilterStatut, setCommuneFilterStatut] = useState<'ALL' | 'Performant' | 'En progression' | 'Vigilance'>('ALL');
  const [isExporting, setIsExporting] = useState(false);

  // Compute real-time M&E dataset
  const indicators = useMemo(() => {
    return computeMeIndicators(signalements, missions, evaluations, payments);
  }, [signalements, missions, evaluations, payments]);

  const communePerformances = useMemo(() => {
    return computeCommunePerformance(signalements, missions);
  }, [signalements, missions]);

  // Aggregated Summary KPIs
  const kpiSummary = useMemo(() => {
    const totalTons = missions.reduce((acc, m) => acc + (m.tonsCollected || 0), 0);
    const totalSig = signalements.length;
    const cleanedSig = signalements.filter(s => s.status === 'Nettoyé').length;
    const resolutionPercent = totalSig > 0 ? Math.round((cleanedSig / totalSig) * 100) : 100;
    const totalPaymentsCDF = payments.filter(p => p.status === 'Validé').reduce((acc, p) => acc + p.amountCDF, 0);

    // Global performance index
    const targetAttainment = Math.round(
      indicators.reduce((acc, ind) => {
        const ratio = Math.min(100, Math.round((ind.currentValue / ind.target2026) * 100));
        return acc + ratio;
      }, 0) / indicators.length
    );

    return {
      totalTons,
      totalSig,
      cleanedSig,
      resolutionPercent,
      totalPaymentsCDF,
      targetAttainment
    };
  }, [signalements, missions, payments, indicators]);

  // Filtered indicators
  const filteredIndicators = useMemo(() => {
    if (selectedAxe === 'ALL') return indicators;
    return indicators.filter(ind => ind.axe === selectedAxe);
  }, [indicators, selectedAxe]);

  // Filtered communes
  const filteredCommunes = useMemo(() => {
    return communePerformances.filter(c => {
      const matchesSearch = c.commune.toLowerCase().includes(searchCommune.toLowerCase());
      const matchesStatut = communeFilterStatut === 'ALL' || c.statut === communeFilterStatut;
      return matchesSearch && matchesStatut;
    });
  }, [communePerformances, searchCommune, communeFilterStatut]);

  const handlePrintScorecard = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-800/80 px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-emerald-200 border border-emerald-700/50">
              <Activity className="w-3.5 h-3.5" />
              <span>SYSTÈME M&E • REGEDEK & ENVIRONNEMENT-PLUS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Statistiques & Suivi-Évaluation
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Tableau de bord stratégique de suivi des indicateurs de salubrité publique, efficacité d'intervention des brigades et cadre logique opérationnel 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrintScorecard}
              className="px-4 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2"
            >
              <Printer className="w-4 h-4 text-emerald-800" />
              <span>Imprimer Fiche M&E</span>
            </button>
            <button
              onClick={() => onNavigateToTab('reporting')}
              className="px-4 py-2.5 bg-emerald-800/90 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition border border-emerald-600/60 flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Rapports Consolidés</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Scorecards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-emerald-800/50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-emerald-200 text-xs mb-1">
              <span>Indice d'Atteinte</span>
              <Target className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-2xl font-black text-white">{kpiSummary.targetAttainment}%</div>
            <p className="text-[11px] text-emerald-200/80 mt-1">Conformité aux objectifs 2026</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-emerald-200 text-xs mb-1">
              <span>Tonnage Traité</span>
              <TrendingUp className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-2xl font-black text-white">{kpiSummary.totalTons.toLocaleString('fr-FR')} t</div>
            <p className="text-[11px] text-emerald-200/80 mt-1">Évacué vers Mpasa & transit</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-emerald-200 text-xs mb-1">
              <span>Résolution Dépotoirs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-2xl font-black text-white">{kpiSummary.resolutionPercent}%</div>
            <p className="text-[11px] text-emerald-200/80 mt-1">{kpiSummary.cleanedSig} résolus sur {kpiSummary.totalSig}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-emerald-200 text-xs mb-1">
              <span>Communes Suivies</span>
              <Building2 className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-2xl font-black text-white">24 / 24</div>
            <p className="text-[11px] text-emerald-200/80 mt-1">Dispositif Kinshasa complet</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setViewMode('indicateurs')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center space-x-2 transition ${
            viewMode === 'indicateurs'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Cadre Logique & Indicateurs M&E ({indicators.length})</span>
        </button>

        <button
          onClick={() => setViewMode('communes')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center space-x-2 transition ${
            viewMode === 'communes'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Performance des 24 Communes ({communePerformances.length})</span>
        </button>

        <button
          onClick={() => setViewMode('recommandations')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center space-x-2 transition ${
            viewMode === 'recommandations'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyse & Aide à la Décision</span>
        </button>
      </div>

      {/* VIEW 1: Cadre Logique & Indicateurs M&E */}
      {viewMode === 'indicateurs' && (
        <div className="space-y-6">
          {/* Axe Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1" /> Filtrer par axe stratégique :
            </span>
            {[
              { id: 'ALL', label: 'Tous les indicateurs' },
              { id: 'Opérations & Salubrité', label: 'Opérations & Salubrité' },
              { id: 'Finances & Recouvrement', label: 'Finances & Recouvrement' },
              { id: 'Gouvernance & Conformité ÉIES', label: 'Gouvernance & ÉIES' },
              { id: 'Impact Sanitaire & Environnemental', label: 'Impact & Recyclage' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedAxe(tab.id as AxeFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedAxe === tab.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Indicators Grid / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIndicators.map((ind) => {
              const progressPercent = Math.min(100, Math.round((ind.currentValue / ind.target2026) * 100));
              const statusColor = 
                ind.status === 'Atteint' ? 'bg-emerald-100 text-emerald-900 border-emerald-200' :
                ind.status === 'Sur la bonne voie' ? 'bg-blue-100 text-blue-900 border-blue-200' :
                ind.status === 'Attention requise' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                'bg-rose-100 text-rose-900 border-rose-200';

              return (
                <div 
                  key={ind.id} 
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4 hover:border-emerald-500 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {ind.code}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gray-600">
                          {ind.axe}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mt-1.5 leading-snug">
                        {ind.name}
                      </h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${statusColor}`}>
                      {ind.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700">
                    {ind.description}
                  </p>

                  {/* Progress bar and metrics */}
                  <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">Progression vers la cible</span>
                      <span className="font-extrabold text-emerald-900">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          progressPercent >= 80 ? 'bg-emerald-600' :
                          progressPercent >= 50 ? 'bg-blue-600' :
                          'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(5, progressPercent)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 text-center pt-2 text-[11px] border-t border-gray-200/60">
                      <div>
                        <div className="text-gray-600">Base 2025</div>
                        <div className="font-bold text-gray-800">{ind.baseline}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Actuel</div>
                        <div className="font-bold text-emerald-900">{ind.currentValue} {ind.unit.includes('%') ? '%' : ''}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Cible 2026</div>
                        <div className="font-bold text-gray-900">{ind.target2026} {ind.unit.includes('%') ? '%' : ''}</div>
                      </div>
                    </div>
                  </div>

                  {/* Operational details */}
                  <div className="text-[11px] space-y-1 text-gray-700 pt-1 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Responsable :</span>
                      <span className="font-semibold text-gray-800">{ind.responsable}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Source :</span>
                      <span className="font-medium text-gray-800 truncate max-w-[200px]" title={ind.sourceVerification}>
                        {ind.sourceVerification}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Performance des 24 Communes de Kinshasa */}
      {viewMode === 'communes' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher une commune (ex: Kalamu, Gombe)..."
                value={searchCommune}
                onChange={(e) => setSearchCommune(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-gray-500">Statut :</span>
              {(['ALL', 'Performant', 'En progression', 'Vigilance'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setCommuneFilterStatut(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    communeFilterStatut === st
                      ? 'bg-emerald-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st === 'ALL' ? 'Toutes' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Communes Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Commune</th>
                    <th className="px-4 py-3 text-center">Signalements (Résolus/Total)</th>
                    <th className="px-4 py-3 text-center">Taux Résolution</th>
                    <th className="px-4 py-3 text-center">Tonnes Évacuées</th>
                    <th className="px-4 py-3 text-center">Délai Moyen (h)</th>
                    <th className="px-4 py-3 text-center">Indice Salubrité</th>
                    <th className="px-4 py-3 text-right">Statut M&E</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCommunes.map((c) => {
                    const statutBadge =
                      c.statut === 'Performant' ? 'bg-emerald-100 text-emerald-900 border-emerald-200' :
                      c.statut === 'En progression' ? 'bg-blue-100 text-blue-900 border-blue-200' :
                      'bg-amber-100 text-amber-900 border-amber-200';

                    return (
                      <tr key={c.commune} className="hover:bg-gray-50/80 transition">
                        <td className="px-4 py-3.5 font-bold text-gray-900 flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{c.commune}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono">
                          <span className="text-emerald-800 font-bold">{c.signalementsResolus}</span> / <span>{c.signalementsTotal}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center space-x-1 font-bold">
                            <span className={c.tauxResolution >= 70 ? 'text-emerald-800' : 'text-amber-800'}>
                              {c.tauxResolution}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-gray-900">
                          {c.tonnesCollectees > 0 ? `${c.tonnesCollectees} t` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-center text-gray-600">
                          {c.delaiMoyenHeures}h
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="w-16 bg-gray-200 h-2 rounded-full mx-auto overflow-hidden">
                            <div 
                              className={`h-full ${c.conformiteScore >= 75 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                              style={{ width: `${c.conformiteScore}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-600 mt-0.5 block">{c.conformiteScore}/100</span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statutBadge}`}>
                            {c.statut}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Recommandations Stratégiques & Aide à la Décision */}
      {viewMode === 'recommandations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3>Points Noirs Récurrents & Priorités d'Assainissement</h3>
            </div>
            <p className="text-xs text-gray-700">
              L'analyse des signalements récents sur Kinshasa met en évidence trois zones d'engorgement nécessitant des rotations renforcées de bennes tasseuses :
            </p>
            <ul className="space-y-2 text-xs text-gray-800">
              <li className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-2">
                <span className="font-bold text-amber-900 shrink-0">1. Kalamu (Victoire / Matonge) :</span>
                <span>Forte concentration commerciale, nécessite une collecte bi-quotidienne (matin & soir).</span>
              </li>
              <li className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-2">
                <span className="font-bold text-amber-900 shrink-0">2. Limete (Kingabwa Poids Lourds) :</span>
                <span>Dépôts mixtes industriels et ménagers. Priorité curage des collecteurs d'eau avant les fortes précipitations.</span>
              </li>
              <li className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start space-x-2">
                <span className="font-bold text-emerald-900 shrink-0">3. Gombe & Kintambo :</span>
                <span>Taux de résolution supérieur à 85%. Modèle opérationnel à étendre aux communes de l'Est (Masina, Ndjili).</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <h3>Plan d'Optimisation Budgétaire & Recouvrement</h3>
            </div>
            <p className="text-xs text-gray-700">
              Corrélation entre l'efficacité du ramassage et la volonté citoyenne de payer la taxe d'assainissement :
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                <span className="text-gray-700">Coût moyen d'évacuation par tonne :</span>
                <span className="font-bold text-gray-900">42,50 USD / tonne</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                <span className="text-gray-700">Recouvrement par Mobile Money (M-Pesa / Airtel) :</span>
                <span className="font-bold text-emerald-900">84% des encaissements</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span className="text-emerald-900 font-semibold">Taux de couverture des coûts opérationnels :</span>
                <span className="font-extrabold text-emerald-900">68% (+14% vs 2025)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
