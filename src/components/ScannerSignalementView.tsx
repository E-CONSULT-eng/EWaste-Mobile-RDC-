import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Camera, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  List, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Upload, 
  ArrowRight,
  Info
} from 'lucide-react';
import { Signalement, WasteAiAnalysisResult } from '../types';
import { WasteAiScanner } from './WasteAiScanner';
import { PROVINCES_RDC, getVillesByProvince, getCoordinatesForLocation } from '../data/provincesRDC';

interface ScannerSignalementViewProps {
  signalements: Signalement[];
  onAddSignalement: (newItem: Partial<Signalement>) => void;
  onUpdateStatus: (id: string, status: 'Signalé' | 'En cours' | 'Nettoyé') => void;
  highlightedId?: string | null;
  onNavigateToEducation?: () => void;
  onNavigateToGuide?: () => void;
  authSession?: any;
  onActionRecorded?: (actionType: string, details: string) => void;
}

const KINSHASA_COMMUNES = [
  'Gombe', 'Limete', 'Kalamu', 'Masina', 'Ngaliema', 
  'Mont-Ngafula', 'Matete', 'Kasa-Vubu', 'Bandalungwa', 'Lingwala', 
  'Barumbu', 'Lemba', 'Bumbu', 'Makala', "N'djili", 'Kintambo', 
  'Kimbanseke', 'Kisenso', 'Maluku', 'Ngaba', 'Ngiri-Ngiri', 'Nsele', 'Selembao', 'Kinshasa'
];

export function ScannerSignalementView({
  signalements,
  onAddSignalement,
  onUpdateStatus,
  highlightedId,
  onNavigateToEducation,
  onNavigateToGuide,
  authSession,
  onActionRecorded
}: ScannerSignalementViewProps) {
  // Mode unifié : soit scanner IA, soit signalement dépotoir, soit consultation
  const [activeSubMode, setActiveSubMode] = useState<'scanner' | 'nouveau-signalement' | 'historique'>('scanner');

  // Form state for signalement
  const [selectedProvince, setSelectedProvince] = useState('Kinshasa');
  const [commune, setCommune] = useState('Limete');
  const [quartier, setQuartier] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'Critique' | 'Élevé' | 'Modéré'>('Élevé');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800');
  const [author, setAuthor] = useState('');
  const [pickedCoordinates, setPickedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Filters for signalement list
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCommune, setFilterCommune] = useState('Tous');
  const [filterStatus, setFilterStatus] = useState('Tous');

  // Geolocation trigger
  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickedCoordinates({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6))
          });
          setIsLocating(false);
        },
        () => {
          // Fallback to Kinshasa coordinates
          setPickedCoordinates({ lat: -4.32758, lng: 15.31357 });
          setIsLocating(false);
        },
        { timeout: 8000 }
      );
    } else {
      setPickedCoordinates({ lat: -4.32758, lng: 15.31357 });
      setIsLocating(false);
    }
  };

  // Submit Signalement
  const handleSubmitSignalement = (e: React.FormEvent) => {
    e.preventDefault();
    const coordsStr = pickedCoordinates 
      ? `${pickedCoordinates.lat}, ${pickedCoordinates.lng}` 
      : '-4.32758, 15.31357';

    onAddSignalement({
      province: selectedProvince,
      commune,
      quartier: quartier || 'Quartier Résidentiel',
      description: description || 'Accumulation anormale de déchets sur la voie publique.',
      severity,
      status: 'Signalé',
      imageUrl,
      date: new Date().toISOString(),
      author: author || 'Éco-Citoyen Kinshasa',
      coordinates: coordsStr,
      tonnageEstime: severity === 'Critique' ? 3.5 : severity === 'Élevé' ? 1.5 : 0.5
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setActiveSubMode('historique');
    }, 1500);

    // Reset fields
    setDescription('');
    setQuartier('');
  };

  // Pre-fill signalement from scanner
  const handleSwitchFromScannerToSignal = (scannedName?: string, img?: string) => {
    if (scannedName) {
      setDescription(`Déchet encombrant détecté par Scanner IA : ${scannedName}. Présence sur la voie publique.`);
    }
    if (img) {
      setImageUrl(img);
    }
    setActiveSubMode('nouveau-signalement');
  };

  // Filter signalements
  const filteredSignalements = signalements.filter(s => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        (s.commune && s.commune.toLowerCase().includes(q)) ||
        (s.quartier && s.quartier.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }
    if (filterCommune !== 'Tous' && s.commune.toLowerCase() !== filterCommune.toLowerCase()) {
      return false;
    }
    if (filterStatus !== 'Tous' && s.status !== filterStatus) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Single unified purpose for Eco-Citizens */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Espace Éco-Citoyen • Service Public Urbain</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Scanner & Signalement des Déchets
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Utilisez l’intelligence artificielle pour identifier vos déchets et les trier convenablement, ou signalez directement les dépotoirs sauvages pour leur évacuation par les brigades de la REGEDEK.
            </p>
          </div>

          {/* Unified Sub-mode Navigation Selector */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveSubMode('scanner')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeSubMode === 'scanner'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>1. Scanner IA Déchet</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubMode('nouveau-signalement')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeSubMode === 'nouveau-signalement'
                  ? 'bg-white text-rose-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>2. Signaler un Dépotoir</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubMode('historique')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeSubMode === 'historique'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4 text-sky-600" />
              <span>3. Suivi ({signalements.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Scanner IA de Déchet */}
      {activeSubMode === 'scanner' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-emerald-900">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Prenez en photo un déchet pour connaître son bac de tri et sa valorisation. S'il s'agit d'une accumulation sur la rue, vous pouvez basculer en signalement en 1 clic.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubMode('nouveau-signalement')}
              className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg shrink-0 transition"
            >
              Signaler un dépotoir ➔
            </button>
          </div>

          <WasteAiScanner
            onNavigateToGuide={onNavigateToEducation}
            onNavigateToSignal={() => setActiveSubMode('nouveau-signalement')}
            onActionRecorded={onActionRecorded}
          />
        </div>
      )}

      {/* Mode 2: Formulaire Rapide de Signalement de Dépotoir */}
      {activeSubMode === 'nouveau-signalement' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-3xl mx-auto">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Signaler une Décharge ou un Dépotoir Sauvage
              </h3>
              <p className="text-xs text-slate-500">
                Alerte directe transmise aux brigades de salubrité REGEDEK pour programmation d'évacuation d'urgence.
              </p>
            </div>
          </div>

          {submittedSuccess ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-emerald-900">Signalement Transmis avec Succès !</h4>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Votre signalement a été enregistré dans le système central REGEDEK. Une brigade sera affectée selon le niveau de gravité.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitSignalement} className="space-y-5">
              {/* Commune et Quartier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Commune (Kinshasa) *
                  </label>
                  <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    {KINSHASA_COMMUNES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Quartier / Avenue / Repère *
                  </label>
                  <input
                    type="text"
                    value={quartier}
                    onChange={(e) => setQuartier(e.target.value)}
                    placeholder="Ex: Quartier Funa, Croisement Victoire"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description de l'encombrement *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Décrivez l'accumulation (sacs poubelles, plastiques, caniveau bouché, gravats...)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Gravité & Coordonnées GPS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Niveau d'Urgence / Gravité *
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Modéré">Modéré (Dépôt ponctuel)</option>
                    <option value="Élevé">Élevé (Dépotoir bloquant la circulation)</option>
                    <option value="Critique">Critique (Caniveau obstrué / Risque d'inondation sanitaire)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Géolocalisation GPS
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 px-3 rounded-xl text-xs font-bold transition border border-slate-200"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isLocating 
                        ? 'Détection satellite...' 
                        : pickedCoordinates 
                          ? `GPS : ${pickedCoordinates.lat}, ${pickedCoordinates.lng}` 
                          : 'Capturer ma position GPS actuelle'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Auteur */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Votre Nom ou Téléphone (Optionnel)
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ex: Éco-Citoyen Kinshasa"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSubMode('scanner')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  Annuler / Retour au Scanner
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center space-x-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Envoyer l'Alerte Dépotoir à la REGEDEK</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Mode 3 : Historique & Suivi des Signalements */}
      {activeSubMode === 'historique' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par commune, quartier..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="Signalé">Signalé</option>
                <option value="En cours">En cours d'évacuation</option>
                <option value="Nettoyé">Nettoyé</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubMode('nouveau-signalement')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Signalement</span>
            </button>
          </div>

          {/* List of Signalements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSignalements.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-bold text-slate-700">Aucun signalement correspondant</p>
                <p className="text-xs text-slate-500 mt-1">Tous les dépotoirs de cette zone ont été traités ou aucun signalement n'a été émis.</p>
              </div>
            ) : (
              filteredSignalements.map((s) => (
                <div
                  key={s.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs transition flex flex-col justify-between ${
                    highlightedId === s.id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        s.status === 'Nettoyé'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : s.status === 'En cours'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {s.status === 'Nettoyé' ? '✓ Nettoyé & Évacué' : s.status === 'En cours' ? '⏳ En cours d’évacuation' : '🚨 Signalé'}
                      </span>

                      <span className={`text-[10px] font-bold ${
                        s.severity === 'Critique' ? 'text-rose-600' : s.severity === 'Élevé' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        Gravité : {s.severity}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-bold text-slate-900 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{s.commune} • {s.quartier}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {s.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(s.date).toLocaleDateString('fr-FR')}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      ~{s.tonnageEstime || 1} T
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
