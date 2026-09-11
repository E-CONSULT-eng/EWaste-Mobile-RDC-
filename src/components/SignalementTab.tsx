import React, { useState } from 'react';
import { AlertTriangle, MapPin, Plus, Sparkles, Filter, CheckCircle2, Clock, Trash2, Camera, Loader2, Navigation, List, Globe2, Search } from 'lucide-react';
import { Signalement } from '../types';
import { PROVINCES_RDC, getVillesByProvince, getCoordinatesForLocation } from '../data/provincesRDC';

interface SignalementTabProps {
  signalements: Signalement[];
  onAddSignalement: (newItem: Partial<Signalement>) => void;
  onUpdateStatus: (id: string, status: 'Signalé' | 'En cours' | 'Nettoyé') => void;
  highlightedId?: string | null;
}

export function SignalementTab({ signalements, onAddSignalement, onUpdateStatus, highlightedId }: SignalementTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvince, setFilterProvince] = useState<string>('Tous');
  const [filterCommune, setFilterCommune] = useState<string>('Tous');
  const [filterStatus, setFilterStatus] = useState<string>('Tous');
  const [showModal, setShowModal] = useState(false);

  // Form state for 26 provinces
  const [selectedProvince, setSelectedProvince] = useState('Kinshasa');
  const [commune, setCommune] = useState('Limete');
  const [customVille, setCustomVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'Critique' | 'Élevé' | 'Modéré'>('Élevé');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800');
  const [author, setAuthor] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [pickedCoordinates, setPickedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [customCoordsText, setCustomCoordsText] = useState('');

  // Dynamic cities based on active modal province
  const availableVilles = getVillesByProvince(selectedProvince);

  // Dynamic filter cities
  const filterVilles = filterProvince === 'Tous' 
    ? Array.from(new Set(signalements.map(s => s.ville || s.commune).filter(Boolean)))
    : getVillesByProvince(filterProvince);

  const filteredSignalements = signalements.filter(s => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        (s.province && s.province.toLowerCase().includes(q)) ||
        (s.ville && s.ville.toLowerCase().includes(q)) ||
        (s.commune && s.commune.toLowerCase().includes(q)) ||
        (s.quartier && s.quartier.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.author && s.author.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }
    if (filterProvince !== 'Tous') {
      const sigProv = s.province || (PROVINCES_RDC.find(p => p.villes.includes(s.commune))?.nom) || 'Kinshasa';
      if (sigProv.toLowerCase() !== filterProvince.toLowerCase()) return false;
    }
    if (filterCommune !== 'Tous') {
      const sigLoc = (s.ville || s.commune).toLowerCase();
      if (sigLoc !== filterCommune.toLowerCase() && s.commune.toLowerCase() !== filterCommune.toLowerCase()) return false;
    }
    if (filterStatus !== 'Tous' && s.status !== filterStatus) return false;
    return true;
  });

  const handleProvinceChange = (newProv: string) => {
    setSelectedProvince(newProv);
    const villes = getVillesByProvince(newProv);
    if (villes.length > 0) {
      setCommune(villes[0]);
    }
    setCustomVille('');
  };

  const handleAiAnalyze = async () => {
    if (!description) return;
    setIsAnalyzing(true);
    try {
      const effectiveVille = commune === 'Autre' && customVille ? customVille : commune;
      const res = await fetch('/api/ai/analyze-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, commune: `${effectiveVille}, ${selectedProvince}` })
      });
      const data = await res.json();
      setAiResult(data);
      if (data.severity) setSeverity(data.severity);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickedCoordinates({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.warn("Could not retrieve GPS position:", err);
          const coords = getCoordinatesForLocation(selectedProvince, commune);
          setPickedCoordinates({
            lat: coords.lat,
            lng: coords.lng
          });
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveVille = commune === 'Autre' && customVille ? customVille : commune;
    const locCoords = getCoordinatesForLocation(selectedProvince, effectiveVille);
    
    const finalCoords = pickedCoordinates 
      ? `${pickedCoordinates.lat.toFixed(5)}, ${pickedCoordinates.lng.toFixed(5)}`
      : `${locCoords.lat.toFixed(5)}, ${locCoords.lng.toFixed(5)}`;

    // Tonnage déclaré ou calculé selon la gravité réelle sans chiffres fictifs
    const realTonnage = aiResult?.tonnage 
      ? aiResult.tonnage 
      : severity === 'Critique' ? 5.0 : severity === 'Élevée' ? 3.0 : severity === 'Moyenne' ? 1.5 : 0.5;

    onAddSignalement({
      province: selectedProvince,
      ville: effectiveVille,
      commune: effectiveVille,
      quartier: quartier || 'Centre / Territoire',
      description,
      severity,
      imageUrl,
      author: author || `Citoyen (${selectedProvince})`,
      coordinates: finalCoords,
      tonnageEstime: realTonnage
    });
    setShowModal(false);
    setDescription('');
    setQuartier('');
    setCustomVille('');
    setAiResult(null);
    setPickedCoordinates(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">Signalement des Dépotoirs RDC</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              26 Provinces
            </span>
          </div>
          <p className="text-xs text-gray-500">Registre et suivi en temps réel des dépotoirs et signalements citoyens à travers les 26 provinces de la RDC.</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher ville, quartier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl w-48 sm:w-60 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Signaler</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            <span>Filtrer par Province, Ville & Statut</span>
          </div>

          {/* Quick province chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <button
              onClick={() => { setFilterProvince('Tous'); setFilterCommune('Tous'); }}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filterProvince === 'Tous'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes (26)
            </button>
            {['Kinshasa', 'Sud-Kivu', 'Nord-Kivu', 'Haut-Katanga', 'Kongo-Central', 'Tshopo'].map(p => (
              <button
                key={p}
                onClick={() => { setFilterProvince(p); setFilterCommune('Tous'); }}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filterProvince === p
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Province (26)</label>
            <select
              value={filterProvince}
              onChange={(e) => {
                setFilterProvince(e.target.value);
                setFilterCommune('Tous');
              }}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Tous">Toutes les 26 provinces</option>
              {PROVINCES_RDC.map(p => (
                <option key={p.id} value={p.nom}>
                  {p.nom} (Chef-lieu: {p.chefLieu})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Ville / Commune</label>
            <select
              value={filterCommune}
              onChange={(e) => setFilterCommune(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Tous">Toutes les villes</option>
              {filterVilles.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Statut</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Signalé">Signalé</option>
              <option value="En cours">En cours d'intervention</option>
              <option value="Nettoyé">Nettoyé & Validé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Signalements List */}
      <div className="space-y-4">
        {filteredSignalements.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Aucun signalement trouvé pour ces critères.</p>
          </div>
        ) : (
          filteredSignalements.map((sig) => {
            const isHighlighted = highlightedId === sig.id;
            return (
            <div 
              key={sig.id} 
              id={`sig-card-${sig.id}`}
              className={`bg-white rounded-2xl border transition duration-300 overflow-hidden ${
                isHighlighted 
                  ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-lg bg-emerald-50/10' 
                  : 'border-gray-100 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row">
                {sig.imageUrl && (
                  <div className="sm:w-48 h-40 sm:h-auto relative bg-gray-100">
                    <img src={sig.imageUrl} alt={sig.commune} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                        sig.severity === 'Critique' ? 'bg-red-600 text-white' :
                        sig.severity === 'Élevé' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {sig.severity}
                      </span>
                      {isHighlighted && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600 text-white shadow-md animate-pulse">
                          Ciblé par notification
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-semibold text-gray-900 text-sm">
                          {sig.ville || sig.commune}
                        </span>
                        <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                          {sig.province || 'Kinshasa'}
                        </span>
                        <span className="text-xs text-gray-500">
                          - {sig.quartier}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{sig.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">{sig.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-medium">
                        Tonnage estimé: ~{sig.tonnageEstime} tonnes
                      </span>
                      {sig.id.startsWith('LOCAL-') && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-medium flex items-center space-x-1">
                          <span>Stocké localement (Hors-ligne)</span>
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-medium">
                        Par: {sig.author}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-100 mt-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Statut:</span>
                      <select
                        value={sig.status}
                        onChange={(e) => onUpdateStatus(sig.id, e.target.value as any)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none transition ${
                          sig.status === 'Nettoyé' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          sig.status === 'En cours' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <option value="Signalé">Signalé</option>
                        <option value="En cours">En cours d'intervention</option>
                        <option value="Nettoyé">Nettoyé (Résolu)</option>
                      </select>

                      {sig.status !== 'Nettoyé' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(sig.id, 'Nettoyé')}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm transition flex items-center space-x-1"
                          title="Marquer comme nettoyé et avertir le citoyen"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Marquer Nettoyé</span>
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">{sig.id}</span>
                  </div>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Modal nouveau signalement */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Nouveau Signalement de Dépotoir</h2>
            <p className="text-xs text-gray-500 mb-4">Remplissez les détails pour avertir la REGEDEK instantanément.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Province & Ville Selector (26 Provinces) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                <div>
                  <label className="block text-xs font-semibold text-emerald-950 mb-1 flex items-center justify-between">
                    <span>Province (26 RDC)</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Obligatoire</span>
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-3 py-2.5 text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {PROVINCES_RDC.map(p => (
                      <option key={p.id} value={p.nom}>
                        {p.nom} ({p.chefLieu})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-950 mb-1 flex items-center justify-between">
                    <span>Ville / Commune / Territoire</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Rattachée</span>
                  </label>
                  <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-3 py-2.5 text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {availableVilles.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                    <option value="Autre">+ Autre ville / Territoire</option>
                  </select>
                </div>

                {commune === 'Autre' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Préciser la Ville ou le Territoire</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mwenga, Uvira, Beni, Kasumbalesa..."
                      value={customVille}
                      onChange={(e) => setCustomVille(e.target.value)}
                      className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quartier / Avenue / Point de repère</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matonge, Kingabwa, Ndendere, Himbi, Ruashi, Q. Lumumba..."
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">Description du dépotoir</label>
                  <button
                    type="button"
                    onClick={handleAiAnalyze}
                    disabled={isAnalyzing || !description}
                    className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold flex items-center space-x-1 disabled:opacity-50"
                  >
                    {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>Caractériser les déchets</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="Décrivez la nature des déchets (plastiques, gravats, organiques...), l'accès, les nuisances sanitaires..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              {aiResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 space-y-1">
                  <div className="font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Caractérisation Technique REGEDEK :</span>
                  </div>
                  <p>{aiResult.analysis}</p>
                  <div className="text-[11px] text-emerald-800 font-medium">
                    Sévérité estimée : <b>{aiResult.severity}</b> | Tonnage estimé : <b>~{aiResult.tonnage} tonnes</b>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Niveau de Sévérité</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Modéré">Modéré</option>
                    <option value="Élevé">Élevé</option>
                    <option value="Critique">Critique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Votre Nom / Contact</label>
                  <input
                    type="text"
                    placeholder="Nom ou Anonyme"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Photo du site (URL)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Geolocation & Coordonnées GPS */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Coordonnées GPS du site</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    <Navigation className="w-3 h-3 text-emerald-600" />
                    <span>Capturer ma position GPS</span>
                  </button>
                </div>

                <div className="text-[11px] text-gray-600 bg-white p-2.5 rounded-xl border border-gray-100 flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-800">
                    {pickedCoordinates 
                      ? `${pickedCoordinates.lat.toFixed(5)}, ${pickedCoordinates.lng.toFixed(5)}`
                      : 'Coordonnées par défaut (centre de la ville)'}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {pickedCoordinates ? 'GPS Actif' : 'Automatique'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-medium bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition"
                >
                  Soumettre à la REGEDEK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
