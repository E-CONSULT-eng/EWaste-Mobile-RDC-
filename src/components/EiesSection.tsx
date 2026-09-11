import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  DollarSign, 
  Users, 
  Landmark, 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  Download, 
  ExternalLink,
  Award,
  BookOpen,
  Send,
  Loader2,
  Building,
  MapPin
} from 'lucide-react';
import { EtudeImpact, ImpactItem, PgesAction } from '../types';

interface EiesSectionProps {
  onNotify?: (title: string, msg: string) => void;
}

const KINSHASA_PROJECT_TEMPLATES = [
  {
    titre: "Aménagement d'un Centre de Compostage et Tri Sélectif de Déchets Organiques à Masina",
    commune: "Masina",
    quartier: "Sans-Fil / Abattoir",
    typeOuvrage: "Unité de Compostage Industriel (250 T/j)",
    promoteur: "Ville de Kinshasa & Coopérative Maraîchère Cecomaf",
    coutUSD: 2800000,
    contexte: "Valorisation des résidus organiques du marché et des abattoirs pour fournir du compost bio aux maraîchers de N'djili et Masina, tout en réduisant les dépotoirs sauvages saturés."
  },
  {
    titre: "Modernisation et Sécurisation de l'Incinérateur de Déchets Biomédicaux de Ngaliema",
    commune: "Ngaliema",
    quartier: "Cliniques Universitaires / Camp Militaire",
    typeOuvrage: "Incinérateur Haute Température (1200°C) avec Traitement des Fumées",
    promoteur: "Ministère de la Santé Publique & Ets ENVIRONNEMENT-PLUS",
    coutUSD: 1950000,
    contexte: "Élimination sécurisée des déchets d'activités de soins à risque infectieux (DASRI) des hôpitaux de Kinshasa, évitant la contamination des collecteurs d'eau et des agents de collecte."
  },
  {
    titre: "Construction de 15 Points d'Apport Volontaire Écologiques et Clôturés à Bandalungwa",
    commune: "Bandalungwa",
    quartier: "Makelele & Synkin",
    typeOuvrage: "Réseau d'Éco-points de Quartier avec Bacs Étanches",
    promoteur: "Commune de Bandalungwa & ONG Éco-Kin",
    coutUSD: 650000,
    contexte: "Éradication des dépotoirs d'angle de rue le long de l'avenue Kasa-Vubu et éducation de proximité pour 60 000 habitants avec ramassage quotidien planifié."
  }
];

export function EiesSection({ onNotify }: EiesSectionProps) {
  const [etudes, setEtudes] = useState<EtudeImpact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('EIES-2026-001');

  // AI Generator Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiForm, setAiForm] = useState({
    titreProjet: '',
    commune: 'Limete',
    quartier: '',
    typeOuvrage: "Centre de Tri et Valorisation des Déchets",
    promoteur: 'Ets ENVIRONNEMENT-PLUS / Partenariat Public-Privé',
    coutGlobalUSD: 1800000,
    descriptionContexte: ''
  });

  // Manual creation modal
  const [showManualModal, setShowManualModal] = useState(false);

  useEffect(() => {
    fetchEtudes();
  }, []);

  const fetchEtudes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/eies');
      if (res.ok) {
        const data = await res.json();
        setEtudes(data);
      }
    } catch (err) {
      console.error("Erreur chargement ÉIES:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (tpl: typeof KINSHASA_PROJECT_TEMPLATES[0]) => {
    setAiForm({
      titreProjet: tpl.titre,
      commune: tpl.commune,
      quartier: tpl.quartier,
      typeOuvrage: tpl.typeOuvrage,
      promoteur: tpl.promoteur,
      coutGlobalUSD: tpl.coutUSD,
      descriptionContexte: tpl.contexte
    });
  };

  const handleGenerateAiEies = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/generate-eies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiForm)
      });
      if (!res.ok) throw new Error("Échec de la génération de l'ÉIES");
      const created: EtudeImpact = await res.json();
      setEtudes(prev => [created, ...prev]);
      setExpandedId(created.id);
      setShowAiModal(false);
      if (onNotify) {
        onNotify("ÉIES Générée avec succès", `L'étude "${created.titreProjet}" a été générée selon les normes de l'ACE.`);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération de l'ÉIES. Veuillez réessayer.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleDeliverCertificate = async (id: string) => {
    try {
      const res = await fetch(`/api/eies/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statutAce: "Certificat ACE Délivré"
        })
      });
      if (res.ok) {
        const updated: EtudeImpact = await res.json();
        setEtudes(prev => prev.map(item => item.id === id ? updated : item));
        if (onNotify) {
          onNotify("Certificat ACE Délivré", `Certificat de conformité délivré pour le dossier ${id} (${updated.numeroCertificat})`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEtudes = etudes.filter(item => {
    const matchesSearch = 
      item.titreProjet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.commune.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.quartier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.promoteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || item.statutAce === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || item.categorie === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate stats
  const totalDossiers = etudes.length;
  const certifiedCount = etudes.filter(e => e.statutAce === 'Certificat ACE Délivré').length;
  const totalBudgetPges = etudes.reduce((sum, e) => sum + (e.budgetPgesUSD || 0), 0);
  const totalPopulation = etudes.reduce((sum, e) => sum + (e.populationConcernee || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Legal Context */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-emerald-800">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-gray-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center space-x-1 shadow">
                <Landmark className="w-3 h-3" />
                <span>Réglementation RDC • ACE & MEDD</span>
              </span>
              <span className="bg-emerald-800/80 text-emerald-200 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-emerald-700">
                Loi n° 11/009 du 09 juillet 2011
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAiModal(true)}
                className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition flex items-center space-x-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-emerald-950" />
                <span>Générer une ÉIES (IA Gemini)</span>
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Études d'Impact Environnemental et Social (ÉIES) & PGES
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl mt-1 leading-relaxed">
              Registre officiel et audit des projets d'assainissement urbain, gestion des déchets solides et hydraulique à Kinshasa. Instruction et conformité avec l'Agence Congolaise de l'Environnement (ACE).
            </p>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">Dossiers ÉIES</div>
              <div className="text-xl font-black text-white mt-0.5">{totalDossiers}</div>
              <div className="text-[10px] text-emerald-300 flex items-center space-x-1 mt-0.5">
                <FileText className="w-2.5 h-2.5" />
                <span>Inscrits au registre</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">Certificats ACE</div>
              <div className="text-xl font-black text-amber-300 mt-0.5">{certifiedCount}</div>
              <div className="text-[10px] text-emerald-300 flex items-center space-x-1 mt-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                <span>Conformité validée</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">Budget Total PGES</div>
              <div className="text-xl font-black text-white mt-0.5">
                ${(totalBudgetPges / 1000000).toFixed(2)}M
              </div>
              <div className="text-[10px] text-emerald-300 flex items-center space-x-1 mt-0.5">
                <DollarSign className="w-2.5 h-2.5" />
                <span>Mesures d'atténuation</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">Population Couverte</div>
              <div className="text-xl font-black text-white mt-0.5">
                {(totalPopulation / 1000).toFixed(0)}k hab.
              </div>
              <div className="text-[10px] text-emerald-300 flex items-center space-x-1 mt-0.5">
                <Users className="w-2.5 h-2.5" />
                <span>Bénéficiaires kinois</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle decorative background watermarks */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par projet, commune (ex: Limete, Kalamu, N'sele), promoteur, n° EIES..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Tous les Statuts ACE</option>
              <option value="Certificat ACE Délivré">Certificat ACE Délivré</option>
              <option value="En instruction ACE">En instruction ACE</option>
              <option value="En consultation publique">En consultation publique</option>
              <option value="En révision PGES">En révision PGES</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Toutes Catégories</option>
              <option value="Catégorie A (Impact Majeur)">Catégorie A (Impact Majeur)</option>
              <option value="Catégorie B (Notice NIES / Modéré)">Catégorie B (Notice NIES)</option>
              <option value="Audit Environnemental">Audit Environnemental</option>
            </select>
          </div>
        </div>
      </div>

      {/* List of ÉIES Projects */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Chargement des études d'impact environnemental et social...</p>
        </div>
      ) : filteredEtudes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm space-y-3">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-800">Aucun dossier ÉIES trouvé</h3>
          <p className="text-xs text-gray-500">Modifiez vos critères de recherche ou générez une nouvelle étude avec l'IA.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEtudes.map((item) => {
            const isExpanded = expandedId === item.id;
            const isCertified = item.statutAce === 'Certificat ACE Délivré';

            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl border transition shadow-sm overflow-hidden ${
                  isExpanded ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Header Summary Card */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                          {item.id}
                        </span>
                        
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                          isCertified ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                          item.statutAce === 'En instruction ACE' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}>
                          {isCertified ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <Clock className="w-3 h-3" />}
                          <span>{item.statutAce}</span>
                        </span>

                        <span className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          {item.categorie}
                        </span>

                        {item.numeroCertificat && (
                          <span className="text-[10px] font-mono bg-emerald-900 text-amber-300 px-2 py-0.5 rounded-md">
                            Certificat : {item.numeroCertificat}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-gray-950 leading-snug">
                        {item.titreProjet}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="font-semibold text-gray-700">{item.commune}</span> ({item.quartier})
                        </span>
                        <span className="flex items-center space-x-1">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          <span>Promoteur : <strong className="text-gray-700">{item.promoteur}</strong></span>
                        </span>
                        <span>Dépôt : {item.dateDepot}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Score Conformité ACE</div>
                        <div className="text-lg font-black text-emerald-800">
                          {item.scoreConformiteAce}%
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="flex items-center space-x-1 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition"
                      >
                        <span>{isExpanded ? 'Masquer détails' : 'Consulter le dossier'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Non technical brief excerpt */}
                  <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <strong className="text-gray-900">Résumé Exécutif : </strong>
                    {item.resumeNonTechnique}
                  </p>
                </div>

                {/* Expanded Dossier Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-slate-50/50 p-5 space-y-6">
                    {/* Financial & Population KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                        <div className="text-[10px] text-gray-500 font-bold uppercase">Coût Total Projet</div>
                        <div className="text-base font-black text-gray-900 mt-0.5">
                          ${(item.coutGlobalProjetUSD).toLocaleString()} USD
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{item.typeOuvrage}</div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                        <div className="text-[10px] text-gray-500 font-bold uppercase">Budget PGES Dédié</div>
                        <div className="text-base font-black text-emerald-800 mt-0.5">
                          ${(item.budgetPgesUSD).toLocaleString()} USD
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          {((item.budgetPgesUSD / item.coutGlobalProjetUSD) * 100).toFixed(1)}% du coût global
                        </div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                        <div className="text-[10px] text-gray-500 font-bold uppercase">Population Bénéficiaire</div>
                        <div className="text-base font-black text-blue-900 mt-0.5">
                          {(item.populationConcernee).toLocaleString()} hab.
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">Riverains & usagers</div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                        <div className="text-[10px] text-gray-500 font-bold uppercase">Adhésion Sociale</div>
                        <div className="text-base font-black text-amber-700 mt-0.5">
                          {item.consultationPublique.tauxAdhesion}%
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {item.consultationPublique.nombreParticipants} avis recueillis
                        </div>
                      </div>
                    </div>

                    {/* Section 1: Impacts Matrix */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-emerald-700" />
                          <span>1. Matrice d'Identification et d'Évaluation des Impacts</span>
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded-full">
                          {item.impacts.length} impacts recensés
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {item.impacts.map((imp) => (
                          <div 
                            key={imp.id}
                            className={`bg-white rounded-xl p-3.5 border text-xs space-y-2 ${
                              imp.nature === 'Positif' ? 'border-emerald-200' : 'border-rose-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900">{imp.domaine}</span>
                              <div className="flex items-center space-x-1.5">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  imp.nature === 'Positif' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-rose-100 text-rose-800'
                                }`}>
                                  Impact {imp.nature}
                                </span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  imp.severite === 'Critique' || imp.severite === 'Majeur'
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {imp.severite}
                                </span>
                              </div>
                            </div>

                            <p className="text-gray-700 leading-relaxed">
                              {imp.description}
                            </p>

                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                              <span className="font-bold text-emerald-800 block text-[11px] mb-0.5">
                                Mesure d'Atténuation / Bonification :
                              </span>
                              <span className="text-gray-600 text-[11px] leading-relaxed">
                                {imp.mesureAttenuations}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: PGES (Plan de Gestion Environnementale et Sociale) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>2. Plan de Gestion Environnementale et Sociale (PGES)</span>
                        </h4>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Programme d'atténuation & surveillance
                        </span>
                      </div>

                      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold text-[11px]">
                            <tr>
                              <th className="p-3">Action d'atténuation</th>
                              <th className="p-3">Responsable</th>
                              <th className="p-3">Budget</th>
                              <th className="p-3">Indicateur de Suivi</th>
                              <th className="p-3">Échéance</th>
                              <th className="p-3">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {item.pgesActions.map((act) => (
                              <tr key={act.id} className="hover:bg-slate-50/70 transition">
                                <td className="p-3 font-medium text-gray-900 max-w-[220px]">
                                  {act.mesure}
                                </td>
                                <td className="p-3 text-gray-600">
                                  {act.responsable}
                                </td>
                                <td className="p-3 font-mono font-bold text-gray-900">
                                  ${act.coutEstimeUSD.toLocaleString()}
                                </td>
                                <td className="p-3 text-gray-500 max-w-[180px]">
                                  {act.indicateurSuivi}
                                </td>
                                <td className="p-3 text-gray-600 whitespace-nowrap">
                                  {act.echeance}
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    act.statut === 'Réalisé' ? 'bg-emerald-100 text-emerald-800' :
                                    act.statut === 'En cours' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {act.statut}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Section 3: Consultation Publique & Cadre Juridique */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Consultation Publique */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs text-gray-900 flex items-center space-x-1.5">
                            <Users className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Enquête Publique & Acceptabilité</span>
                          </h5>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {item.consultationPublique.tauxAdhesion}% d'adhésion
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Synthèse des consultations de riverains et parties prenantes (comités de quartier, maraîchers, chefs coutumiers) :
                        </p>
                        <ul className="space-y-1.5 text-xs text-gray-700">
                          {item.consultationPublique.principalesPreoccupations.map((p, idx) => (
                            <li key={idx} className="flex items-start space-x-2 bg-gray-50 p-2 rounded-lg">
                              <span className="text-emerald-700 font-bold">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cadre Juridique */}
                      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2.5">
                        <h5 className="font-bold text-xs text-gray-900 flex items-center space-x-1.5">
                          <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Cadre Juridique & Normes RDC</span>
                        </h5>
                        <p className="text-[11px] text-gray-500">
                          Instruments légaux applicables vérifiés lors de l'instruction ACE :
                        </p>
                        <ul className="space-y-1.5 text-xs text-gray-700">
                          {item.cadreLegal.map((cadre, idx) => (
                            <li key={idx} className="flex items-start space-x-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                              <span className="text-[11px]">{cadre}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Operational Action Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200/80">
                      <div className="flex items-center space-x-2">
                        {!isCertified && (
                          <button
                            onClick={() => handleDeliverCertificate(item.id)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-300" />
                            <span>Délivrer Certificat de Conformité ACE</span>
                          </button>
                        )}
                        <button
                          onClick={() => window.print()}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimer Fiche ÉIES</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-400 italic">
                        Dossier audité et archivé dans le système central Ets ENVIRONNEMENT-PLUS • Kinshasa
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-950">
                    Générateur d'ÉIES & PGES par Intelligence Artificielle
                  </h3>
                  <p className="text-xs text-gray-500">
                    Générez une Étude d'Impact et un PGES complet conformes aux directives de l'ACE (Loi 11/009) avec Gemini.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Kinshasa Templates */}
            <div className="my-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-emerald-900 block">
                Exemples de projets récurrents à Kinshasa (Cliquez pour charger) :
              </span>
              <div className="flex flex-wrap gap-2">
                {KINSHASA_PROJECT_TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="text-left text-[11px] bg-white hover:bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium text-emerald-950 transition"
                  >
                    • {tpl.commune} : {tpl.typeOuvrage}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerateAiEies} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Intitulé officiel du Projet <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Construction d'une Station de Transfert et Tri Sélectif à Barumbu"
                  value={aiForm.titreProjet}
                  onChange={(e) => setAiForm({ ...aiForm, titreProjet: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Commune</label>
                  <select
                    value={aiForm.commune}
                    onChange={(e) => setAiForm({ ...aiForm, commune: e.target.value })}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {["Gombe", "Limete", "Kalamu", "Masina", "Ngaliema", "Mont-Ngafula", "Matete", "Kasa-Vubu", "Bandalungwa", "Lingwala", "Barumbu", "Nsele", "Maluku", "Bumbu", "Makala", "Ndjili", "Selembao"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quartier / Localisation</label>
                  <input
                    type="text"
                    placeholder="Ex: Kingabwa, Matonge, Sans-fil..."
                    value={aiForm.quartier}
                    onChange={(e) => setAiForm({ ...aiForm, quartier: e.target.value })}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Type d'Ouvrage / Infrastructure</label>
                  <input
                    type="text"
                    value={aiForm.typeOuvrage}
                    onChange={(e) => setAiForm({ ...aiForm, typeOuvrage: e.target.value })}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Promoteur du Projet</label>
                  <input
                    type="text"
                    value={aiForm.promoteur}
                    onChange={(e) => setAiForm({ ...aiForm, promoteur: e.target.value })}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Coût Estimatif Global du Projet (USD)</label>
                <input
                  type="number"
                  min="50000"
                  step="50000"
                  value={aiForm.coutGlobalUSD}
                  onChange={(e) => setAiForm({ ...aiForm, coutGlobalUSD: Number(e.target.value) })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contexte, Enjeux et Justification</label>
                <textarea
                  rows={3}
                  placeholder="Décrivez brièvement les objectifs, les problématiques d'assainissement visées et les attentes des riverains..."
                  value={aiForm.descriptionContexte}
                  onChange={(e) => setAiForm({ ...aiForm, descriptionContexte: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAi || !aiForm.titreProjet}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Rédaction ÉIES par Gemini en cours...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Générer l'ÉIES & le PGES</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
