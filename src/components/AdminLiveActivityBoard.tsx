import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  AlertTriangle, 
  CreditCard, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle2, 
  ShieldAlert, 
  RefreshCw, 
  Layers,
  ArrowRight,
  Eye,
  GraduationCap,
  Calendar,
  FileText
} from 'lucide-react';
import { 
  Signalement, 
  AssainissementMission, 
  EvaluationEnv, 
  WastePayment, 
  AdminAuditLog 
} from '../types';
import { getStoredScans, getStoredFormations, DatabaseScanItem, DatabaseFormationItem } from '../utils/databaseStore';

export interface UserActivityEvent {
  id: string;
  timestamp: string;
  timestampMs: number;
  actorType: 'citoyen' | 'brigade' | 'admin';
  actorName: string;
  category: 'scan' | 'signalement' | 'paiement' | 'mission' | 'evaluation' | 'formation' | 'securite';
  title: string;
  description: string;
  location: string;
  status?: string;
  referenceId: string;
  details?: Record<string, any>;
}

interface AdminLiveActivityBoardProps {
  signalements: Signalement[];
  missions: AssainissementMission[];
  evaluations: EvaluationEnv[];
  payments: WastePayment[];
  auditLogs: AdminAuditLog[];
  onNavigateToCollection?: (collection: string) => void;
  isPrincipalAdmin?: boolean;
}

export function AdminLiveActivityBoard({
  signalements = [],
  missions = [],
  evaluations = [],
  payments = [],
  auditLogs = [],
  onNavigateToCollection,
  isPrincipalAdmin = true
}: AdminLiveActivityBoardProps) {
  const [selectedActorFilter, setSelectedActorFilter] = useState<'all' | 'citoyen' | 'brigade' | 'admin'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<UserActivityEvent | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>(() => 
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Load stored scans & formations
  const storedScans: DatabaseScanItem[] = useMemo(() => {
    try {
      return getStoredScans();
    } catch {
      return [];
    }
  }, [signalements]);

  const storedFormations: DatabaseFormationItem[] = useMemo(() => {
    try {
      return getStoredFormations();
    } catch {
      return [];
    }
  }, [signalements]);

  // Aggregate all real activities into a unified chronological stream
  const allEvents: UserActivityEvent[] = useMemo(() => {
    const events: UserActivityEvent[] = [];

    // 1. Citizen Signalements
    signalements.forEach((sig) => {
      const dateObj = new Date(sig.date);
      const timeMs = !isNaN(dateObj.getTime()) ? dateObj.getTime() : Date.now();
      events.push({
        id: `ACT-SIG-${sig.id}`,
        timestamp: sig.date,
        timestampMs: timeMs,
        actorType: 'citoyen',
        actorName: sig.author || 'Citoyen Éco-Vigilant',
        category: 'signalement',
        title: `Signalement Déchet : ${sig.severity}`,
        description: sig.description || 'Dépotoir sauvage déclaré avec géolocalisation',
        location: `${sig.commune || 'Kinshasa'}${sig.quartier ? ' - ' + sig.quartier : ''}`,
        status: sig.status,
        referenceId: sig.id,
        details: {
          commune: sig.commune,
          quartier: sig.quartier,
          tonnageEstime: sig.tonnageEstime,
          severity: sig.severity,
          status: sig.status,
          imageUrl: sig.imageUrl
        }
      });
    });

    // 2. Citizen Waste Payments
    payments.forEach((pay) => {
      const timeMs = pay.timestamp || (pay.date ? new Date(pay.date).getTime() : Date.now());
      events.push({
        id: `ACT-PAY-${pay.id}`,
        timestamp: pay.date,
        timestampMs: timeMs,
        actorType: 'citoyen',
        actorName: pay.payerName || 'Assujetti Salubrité',
        category: 'paiement',
        title: `Paiement Taxe : ${pay.amountCDF?.toLocaleString('fr-FR')} CDF`,
        description: `Quittance fiscale n° ${pay.receiptNumber} payée via ${pay.paymentMethod}`,
        location: `${pay.commune || 'Kinshasa'}${pay.quartier ? ' - ' + pay.quartier : ''}`,
        status: pay.status,
        referenceId: pay.receiptNumber,
        details: {
          payerName: pay.payerName,
          producerType: pay.producerType,
          amountCDF: pay.amountCDF,
          amountUSD: pay.amountUSD,
          paymentMethod: pay.paymentMethod,
          receiptNumber: pay.receiptNumber,
          reference: pay.transactionReference
        }
      });
    });

    // 3. Brigade Sanitation Missions
    missions.forEach((m) => {
      const dateObj = new Date(m.startDate);
      const timeMs = !isNaN(dateObj.getTime()) ? dateObj.getTime() : Date.now();
      events.push({
        id: `ACT-MIS-${m.id}`,
        timestamp: m.startDate,
        timestampMs: timeMs,
        actorType: 'brigade',
        actorName: m.team || 'Brigade Salubrité Environnement-Plus / Ets ENVIRONNEMENT-PLUS',
        category: 'mission',
        title: `Mission Brigade : ${m.title}`,
        description: `${m.description || 'Opération de curage et salubrité publique'} - ${m.tonsCollected || 0} t évacuées`,
        location: m.commune || 'Kinshasa',
        status: m.status,
        referenceId: m.id,
        details: {
          team: m.team,
          commune: m.commune,
          tonsCollected: m.tonsCollected,
          status: m.status
        }
      });
    });

    // 4. Supervisor Environmental Audits (ÉIES)
    evaluations.forEach((ev) => {
      const dateObj = new Date(ev.date);
      const timeMs = !isNaN(dateObj.getTime()) ? dateObj.getTime() : Date.now();
      events.push({
        id: `ACT-EVAL-${ev.id}`,
        timestamp: ev.date,
        timestampMs: timeMs,
        actorType: 'brigade',
        actorName: ev.auditor || 'Inspecteur Salubrité Environnement-Plus / Ets ENVIRONNEMENT-PLUS',
        category: 'evaluation',
        title: `Audit Environnemental : ${ev.commune}`,
        description: `Note de salubrité : ${ev.salubriteScore}/10 - Drainage : ${ev.drainageScore}/10`,
        location: ev.commune || 'Kinshasa',
        status: 'Audit Enregistré',
        referenceId: ev.id,
        details: {
          auditor: ev.auditor,
          commune: ev.commune,
          salubriteScore: ev.salubriteScore,
          drainageScore: ev.drainageScore,
          sensibilisationScore: ev.sensibilisationScore,
          commentaires: ev.commentaires
        }
      });
    });

    // 5. Citizen AI Scans
    storedScans.forEach((scan) => {
      const timeMs = scan.timestamp ? new Date(scan.timestamp).getTime() : Date.now();
      events.push({
        id: `ACT-SCAN-${scan.id}`,
        timestamp: scan.date,
        timestampMs: timeMs,
        actorType: 'citoyen',
        actorName: scan.user || 'Citoyen Éco-Vigilant',
        category: 'scan',
        title: `Scan IA Déchet : ${scan.wasteName}`,
        description: `Détection : ${scan.category} (${scan.confidence}% certitude) -> Bac ${scan.binColor}`,
        location: scan.location || 'Kinshasa',
        status: scan.recyclability,
        referenceId: scan.id,
        details: {
          wasteName: scan.wasteName,
          category: scan.category,
          binName: scan.binName,
          binColor: scan.binColor,
          confidence: scan.confidence,
          outlets: scan.localKinshasaOutlets
        }
      });
    });

    // 6. Citizen Training & Quiz Completions
    storedFormations.forEach((form) => {
      const timeMs = form.timestamp ? new Date(form.timestamp).getTime() : Date.now();
      events.push({
        id: `ACT-FORM-${form.id}`,
        timestamp: form.date,
        timestampMs: timeMs,
        actorType: 'citoyen',
        actorName: form.learnerName || 'Apprenant Citoyen',
        category: 'formation',
        title: `Validation Éducative : ${form.moduleOrQuiz}`,
        description: `Score obtenu : ${form.score} - ${form.result} (+${form.ecoPoints} Pts)`,
        location: form.province || 'Kinshasa',
        status: form.result,
        referenceId: form.id,
        details: {
          learnerName: form.learnerName,
          module: form.moduleOrQuiz,
          score: form.score,
          points: form.ecoPoints
        }
      });
    });

    // 7. Administration & Security Audit Logs
    auditLogs.forEach((log) => {
      const dateObj = new Date(log.timestamp);
      const timeMs = !isNaN(dateObj.getTime()) ? dateObj.getTime() : Date.now();
      events.push({
        id: `ACT-AUD-${log.id}`,
        timestamp: log.timestamp,
        timestampMs: timeMs,
        actorType: 'admin',
        actorName: log.adminUser || 'Administration Centrale',
        category: 'securite',
        title: `Sécurité / Audit : ${log.action}`,
        description: `${log.details} (${log.collection})`,
        location: log.ipAddress || 'Kinshasa / RDC',
        status: log.statut,
        referenceId: log.id,
        details: {
          action: log.action,
          collection: log.collection,
          adminUser: log.adminUser,
          details: log.details,
          statut: log.statut
        }
      });
    });

    // Sort strictly chronological, newest first
    return events.sort((a, b) => b.timestampMs - a.timestampMs);
  }, [signalements, payments, missions, evaluations, storedScans, storedFormations, auditLogs]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      // Actor filter
      if (selectedActorFilter !== 'all' && ev.actorType !== selectedActorFilter) {
        return false;
      }
      // Category filter
      if (selectedCategoryFilter !== 'all' && ev.category !== selectedCategoryFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = ev.description.toLowerCase().includes(q);
        const matchActor = ev.actorName.toLowerCase().includes(q);
        const matchLoc = ev.location.toLowerCase().includes(q);
        const matchRef = ev.referenceId.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchActor && !matchLoc && !matchRef) {
          return false;
        }
      }
      return true;
    });
  }, [allEvents, selectedActorFilter, selectedCategoryFilter, searchQuery]);

  // Summary Metrics computed from actual records
  const metrics = useMemo(() => {
    const totalCitoyen = allEvents.filter(e => e.actorType === 'citoyen').length;
    const totalBrigade = allEvents.filter(e => e.actorType === 'brigade').length;
    const totalAdmin = allEvents.filter(e => e.actorType === 'admin').length;
    const totalRevenueCDF = payments.reduce((acc, p) => acc + (p.amountCDF || 0), 0);
    const totalTons = missions.reduce((acc, m) => acc + (m.tonsCollected || 0), 0);
    const cleanedCount = signalements.filter(s => s.status === 'Nettoyé').length;

    return {
      totalEvents: allEvents.length,
      totalCitoyen,
      totalBrigade,
      totalAdmin,
      totalRevenueCDF,
      totalTons,
      cleanedCount
    };
  }, [allEvents, payments, missions, signalements]);

  const handleRefresh = () => {
    setLastRefreshed(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const getCategoryBadge = (category: UserActivityEvent['category']) => {
    switch (category) {
      case 'scan':
        return {
          label: 'Scan IA',
          icon: Sparkles,
          bg: 'bg-teal-50 text-teal-800 border-teal-200'
        };
      case 'signalement':
        return {
          label: 'Signalement',
          icon: AlertTriangle,
          bg: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'paiement':
        return {
          label: 'Paiement Taxe',
          icon: CreditCard,
          bg: 'bg-blue-50 text-blue-800 border-blue-200'
        };
      case 'mission':
        return {
          label: 'Mission Brigade',
          icon: Trash2,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'evaluation':
        return {
          label: 'Audit ÉIES',
          icon: ShieldCheck,
          bg: 'bg-purple-50 text-purple-800 border-purple-200'
        };
      case 'formation':
        return {
          label: 'Formation',
          icon: GraduationCap,
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200'
        };
      case 'securite':
        return {
          label: 'Sécurité Admin',
          icon: ShieldAlert,
          bg: 'bg-rose-50 text-rose-800 border-rose-200'
        };
    }
  };

  const getActorBadge = (actorType: UserActivityEvent['actorType']) => {
    switch (actorType) {
      case 'citoyen':
        return {
          label: 'Citoyen',
          bg: 'bg-gray-100 text-gray-700'
        };
      case 'brigade':
        return {
          label: 'Superviseur / Brigade',
          bg: 'bg-emerald-100 text-emerald-800'
        };
      case 'admin':
        return {
          label: 'Administration Centrale',
          bg: 'bg-rose-100 text-rose-800'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Header & Live Connectivity Indicator */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-gray-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>FLUX TEMPS RÉEL ACTIF</span>
              </span>
              <span className="text-xs text-slate-400">
                Supervision directe des 26 provinces de la RDC
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Activity className="w-7 h-7 text-emerald-400" />
              <span>Tableau de Bord des Activités Utilisateurs</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Surveillance continue en temps réel de <b>chaque action utilisateur</b> (Scans IA citoyens, signalements de dépotoirs, encaissements de taxes, missions de salubrité brigade et audits ÉIES).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80 text-right">
              <div className="flex items-center justify-end space-x-1 text-slate-400 text-[10px] uppercase font-bold">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Dernière synchro</span>
              </div>
              <p className="text-sm font-black text-emerald-400">{lastRefreshed}</p>
            </div>

            <button
              onClick={handleRefresh}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg transition flex items-center space-x-2"
              title="Rafraîchir le flux en direct"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Real-time Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <p className="text-[11px] font-medium text-slate-400">Actions Utilisateurs</p>
            <p className="text-2xl font-black text-white mt-0.5">{metrics.totalEvents}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">100% données réelles</p>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <p className="text-[11px] font-medium text-slate-400">Actions Citoyennes</p>
            <p className="text-2xl font-black text-amber-400 mt-0.5">{metrics.totalCitoyen}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Scans, signalements, taxes</p>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <p className="text-[11px] font-medium text-slate-400">Actions Brigade</p>
            <p className="text-2xl font-black text-emerald-400 mt-0.5">{metrics.totalBrigade}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Missions & audits ÉIES</p>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <p className="text-[11px] font-medium text-slate-400">Recouvrement Taxe (CDF)</p>
            <p className="text-xl font-black text-blue-400 mt-0.5">
              {metrics.totalRevenueCDF.toLocaleString('fr-FR')} CDF
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{payments.length} quittances émises</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Actor Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-gray-700 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span>Acteur :</span>
            </span>

            {[
              { id: 'all', label: 'Tous les acteurs' },
              { id: 'citoyen', label: 'Citoyens' },
              { id: 'brigade', label: 'Brigade & Superviseurs' },
              { id: 'admin', label: 'Administration' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedActorFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedActorFilter === tab.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par commune, acteur, mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-gray-50/50"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-500 mr-1">Catégorie :</span>
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'signalement', label: 'Signalements Dépotoirs' },
            { id: 'paiement', label: 'Paiements Taxe' },
            { id: 'mission', label: 'Missions Terrain' },
            { id: 'evaluation', label: 'Évaluations ÉIES' },
            { id: 'scan', label: 'Scans IA' },
            { id: 'formation', label: 'Quiz / Formations' },
            { id: 'securite', label: 'Sécurité Admin' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                selectedCategoryFilter === cat.id
                  ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Stream List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Chronologie des Activités Utilisateurs ({filteredEvents.length})
            </h3>
          </div>

          <span className="text-[11px] text-gray-500 font-medium">
            Affichage par ordre chronologique décroissant
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Activity className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-800">Aucune activité trouvée</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Aucune action utilisateur ne correspond aux filtres sélectionnés. Les nouvelles activités apparaîtront ici instantanément.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredEvents.map((ev) => {
              const catBadge = getCategoryBadge(ev.category);
              const actorBadge = getActorBadge(ev.actorType);
              const Icon = catBadge.icon;

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="p-4 sm:p-5 hover:bg-gray-50/80 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-2.5 rounded-2xl border ${catBadge.bg} shrink-0 mt-0.5`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catBadge.bg}`}>
                          {catBadge.label}
                        </span>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${actorBadge.bg}`}>
                          {actorBadge.label}
                        </span>

                        {ev.status && (
                          <span className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                            {ev.status}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-emerald-800 transition">
                        {ev.title}
                      </h4>

                      <p className="text-xs text-gray-600 line-clamp-1">
                        {ev.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-0.5">
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="font-medium text-gray-700">{ev.actorName}</span>
                        </span>

                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{ev.location}</span>
                        </span>

                        <span className="flex items-center space-x-1 font-mono text-[10px] text-gray-400">
                          <span>Réf: {ev.referenceId}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end shrink-0 gap-2">
                    <span className="text-[11px] text-gray-400 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{ev.timestamp}</span>
                    </span>

                    <div className="flex items-center text-xs font-semibold text-emerald-800 group-hover:translate-x-1 transition">
                      <span>Détails</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Détails de l'Activité Utilisateur</h3>
                  <p className="text-[11px] text-gray-400 font-mono">ID: {selectedEvent.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Titre :</span>
                  <span className="font-bold text-gray-900">{selectedEvent.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Acteur :</span>
                  <span className="font-semibold text-gray-800">{selectedEvent.actorName} ({selectedEvent.actorType})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Localisation :</span>
                  <span className="text-gray-800">{selectedEvent.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Heure :</span>
                  <span className="font-mono text-gray-700">{selectedEvent.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Statut :</span>
                  <span className="font-semibold text-emerald-800">{selectedEvent.status || 'Enregistré'}</span>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-gray-800 mb-1">Description Complète :</h5>
                <p className="text-gray-600 bg-white p-3 rounded-xl border border-gray-200">
                  {selectedEvent.description}
                </p>
              </div>

              {selectedEvent.details && (
                <div>
                  <h5 className="font-bold text-gray-800 mb-1">Métadonnées Techniques :</h5>
                  <pre className="bg-gray-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-semibold text-xs transition shadow-xs"
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
