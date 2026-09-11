import React, { useState, useMemo, useCallback } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  MapControl, 
  ControlPosition 
} from '@vis.gl/react-google-maps';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Layers, 
  MapPin, 
  Navigation, 
  Recycle, 
  Sparkles, 
  Trash2, 
  Truck,
  ExternalLink,
  Info
} from 'lucide-react';
import { Signalement, AssainissementMission } from '../types';
import { PROVINCES_RDC } from '../data/provincesRDC';

// Kinshasa Center coordinates
const KINSHASA_CENTER = { lat: -4.325, lng: 15.322 };
const RDC_CENTER = { lat: -4.038, lng: 21.758 };

export interface KinshasaWasteMapProps {
  signalements: Signalement[];
  missions?: AssainissementMission[];
  onSelectSignalement?: (sig: Signalement) => void;
  onUpdateStatus?: (id: string, status: 'Signalé' | 'En cours' | 'Nettoyé') => void;
  onSelectCoordinates?: (coords: { lat: number; lng: number }) => void;
  selectedCoordinates?: { lat: number; lng: number } | null;
  pickerMode?: boolean;
  highlightedId?: string | null;
  height?: string;
}

// Official Ets ENVIRONNEMENT-PLUS Waste Treatment & Sorting Hubs
const REGEDEK_FACILITIES = [
  {
    id: 'FAC-1',
    name: 'Centre de Tri & Valorisation Ets ENVIRONNEMENT-PLUS Limete',
    type: 'Centre de Tri & Recyclage',
    commune: 'Limete (Kinshasa)',
    address: 'Boulevard Lumumba, 7ème Rue',
    position: { lat: -4.342, lng: 15.338 },
    capacity: '120 tonnes/jour',
    materials: 'Plastiques, Métaux, Cartons'
  },
  {
    id: 'FAC-2',
    name: 'Station de Transit & Compostage Cecomaf',
    type: 'Compostage Maraîcher',
    commune: "N'djili (Kinshasa)",
    address: 'Route Cecomaf',
    position: { lat: -4.415, lng: 15.378 },
    capacity: '80 tonnes/jour',
    materials: 'Déchets Organiques & Maraîchers'
  },
  {
    id: 'FAC-3',
    name: 'Centre d’Enfouissement Technique & Traitement de Mpasa',
    type: 'Décharge Contrôlée & Traitement',
    commune: 'Nsele (Kinshasa)',
    address: 'Route de Maluku, Mpasa II',
    position: { lat: -4.430, lng: 15.485 },
    capacity: '600 tonnes/jour',
    materials: 'Tout-venant & Traitement sécurisé'
  },
  {
    id: 'FAC-4',
    name: 'Brigade d’Intervention Rapide Gombe',
    type: 'Base Opérationnelle',
    commune: 'Gombe (Kinshasa)',
    address: 'Avenue de la Justice',
    position: { lat: -4.306, lng: 15.298 },
    capacity: 'Flotte 18 camions bennes',
    materials: 'Logistique & Curage'
  },
  {
    id: 'FAC-5',
    name: 'Antenne Régionale Ets ENVIRONNEMENT-PLUS Katanga',
    type: 'Centre de Tri Minier & Urbain',
    commune: 'Lubumbashi (Haut-Katanga)',
    address: 'Avenue Kasavubu',
    position: { lat: -11.6609, lng: 27.4794 },
    capacity: '150 tonnes/jour',
    materials: 'Plastiques, Ferrailles, Verre'
  },
  {
    id: 'FAC-6',
    name: 'Pôle Écologique & Assainissement Kivu',
    type: 'Collecte & Recyclage Lac',
    commune: 'Goma (Nord-Kivu)',
    address: 'Quartier Himbi',
    position: { lat: -1.6792, lng: 29.2228 },
    capacity: '90 tonnes/jour',
    materials: 'Déchets Fluviaux & Plastiques'
  }
];

export function parseCoordinates(coords?: string, provinceName?: string): { lat: number; lng: number } {
  if (coords) {
    const parts = coords.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
  }
  if (provinceName) {
    const prov = PROVINCES_RDC.find(p => p.nom.toLowerCase() === provinceName.toLowerCase());
    if (prov) return prov.coordinates;
  }
  return KINSHASA_CENTER;
}

export function KinshasaWasteMap({
  signalements,
  missions = [],
  onSelectSignalement,
  onUpdateStatus,
  onSelectCoordinates,
  selectedCoordinates,
  pickerMode = false,
  highlightedId,
  height = '600px'
}: KinshasaWasteMapProps) {
  // Read Google Maps API Key from Vite env or fallback
  const apiKey = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  // Active popup states
  const [selectedSig, setSelectedSig] = useState<Signalement | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<typeof REGEDEK_FACILITIES[0] | null>(null);
  const [selectedMission, setSelectedMission] = useState<AssainissementMission | null>(null);

  // Layer toggles
  const [showDumps, setShowDumps] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showMissions, setShowMissions] = useState(true);

  // Filters
  const [filterProvince, setFilterProvince] = useState<string>('Tous');
  const [filterSeverity, setFilterSeverity] = useState<'Tous' | 'Critique' | 'Élevé' | 'Modéré'>('Tous');
  const [filterStatus, setFilterStatus] = useState<'Tous' | 'Signalé' | 'En cours' | 'Nettoyé'>('Tous');

  // Filtered signalements
  const filteredSignalements = useMemo(() => {
    return signalements.filter(s => {
      if (filterProvince !== 'Tous' && (s.province || 'Kinshasa') !== filterProvince) return false;
      if (filterSeverity !== 'Tous' && s.severity !== filterSeverity) return false;
      if (filterStatus !== 'Tous' && s.status !== filterStatus) return false;
      return true;
    });
  }, [signalements, filterProvince, filterSeverity, filterStatus]);

  // Click on map to pick coordinates (if pickerMode or callback provided)
  const handleMapClick = useCallback((e: any) => {
    if (onSelectCoordinates && e.detail?.latLng) {
      onSelectCoordinates({
        lat: e.detail.latLng.lat,
        lng: e.detail.latLng.lng
      });
    }
  }, [onSelectCoordinates]);

  // Total active tonnage on map
  const activeTons = useMemo(() => {
    return filteredSignalements
      .filter(s => s.status !== 'Nettoyé')
      .reduce((acc, s) => acc + (s.tonnageEstime || 0), 0);
  }, [filteredSignalements]);

  return (
    <div className="space-y-3">
      {/* Map Control Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                Carte Déchets & Assainissement RDC
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                26 Provinces
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              {filteredSignalements.length} points cartographiés • ~{activeTons} tonnes de déchets signalées
            </p>
          </div>
        </div>

        {/* Quick Filter Badges & Province Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Province Filter */}
          <select
            value={filterProvince}
            onChange={(e) => setFilterProvince(e.target.value)}
            className="text-[11px] bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-gray-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Tous">Toutes les 26 Provinces</option>
            {PROVINCES_RDC.map(p => (
              <option key={p.id} value={p.nom}>{p.nom} ({p.chefLieu})</option>
            ))}
          </select>
          <button
            onClick={() => setShowDumps(!showDumps)}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center space-x-1 text-[11px] ${
              showDumps ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-500 line-through'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>Dépotoirs ({filteredSignalements.length})</span>
          </button>

          <button
            onClick={() => setShowFacilities(!showFacilities)}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center space-x-1 text-[11px] ${
              showFacilities ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 line-through'
            }`}
          >
            <Recycle className="w-3 h-3 text-emerald-600" />
            <span>Éco-Points & Tri ({REGEDEK_FACILITIES.length})</span>
          </button>

          <button
            onClick={() => setShowMissions(!showMissions)}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center space-x-1 text-[11px] ${
              showMissions ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-500 line-through'
            }`}
          >
            <Truck className="w-3 h-3 text-blue-600" />
            <span>Brigades ({missions.length})</span>
          </button>
        </div>
      </div>

      {/* If Google Maps API key is not present, display an actionable guide banner */}
      {!apiKey && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start space-x-3 shadow-sm">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900">Configuration de l'API Google Maps requise</h4>
            <p className="text-amber-800 leading-relaxed">
              Pour afficher la carte interactive en direct avec les images satellites et le plan de Kinshasa, configurez la variable d'environnement <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">VITE_GOOGLE_MAPS_API_KEY</code> dans les paramètres du projet.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <a
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 font-bold text-amber-950 underline hover:text-amber-800"
              >
                <span>Obtenir une clé Maps Demo Key gratuite (sans carte bancaire)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-amber-600">•</span>
              <a
                href="https://console.cloud.google.com/google/maps-apis/credentials?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 font-semibold text-amber-900 hover:underline"
              >
                <span>Google Cloud Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Map Container - Explicit height as required by CF2 */}
      <div 
        className="w-full bg-slate-100 rounded-3xl overflow-hidden border border-gray-200 shadow-md relative"
        style={{ height }}
      >
        <APIProvider apiKey={apiKey} libraries={['marker', 'places', 'routes']}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={selectedCoordinates || KINSHASA_CENTER}
            defaultZoom={12}
            gestureHandling="greedy"
            disableDefaultUI={false}
            onClick={handleMapClick}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {/* Legend Map Control */}
            <MapControl position={ControlPosition.TOP_LEFT}>
              <div className="m-3 p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 text-xs space-y-1.5 max-w-[200px]">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Légende Ets ENVIRONNEMENT-PLUS
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-gray-700">
                  <span className="w-3 h-3 rounded-full bg-red-600 inline-block shadow-sm"></span>
                  <span>Critique (Urgent)</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-gray-700">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
                  <span>Élevé (Dépotoir)</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-gray-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shadow-sm"></span>
                  <span>Nettoyé / Salubre</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-gray-700">
                  <span className="w-3 h-3 rounded-full bg-teal-500 inline-block shadow-sm"></span>
                  <span>Éco-Point de Tri</span>
                </div>
              </div>
            </MapControl>

            {/* Signalements Advanced Markers */}
            {showDumps && filteredSignalements.map((sig) => {
              const pos = parseCoordinates(sig.coordinates, sig.province);
              const isCrit = sig.severity === 'Critique';
              const isCleaned = sig.status === 'Nettoyé';
              const isHigh = sig.severity === 'Élevé';
              const isHighlighted = highlightedId === sig.id;

              const bgColor = isCleaned ? '#059669' : isCrit ? '#dc2626' : isHigh ? '#d97706' : '#2563eb';
              const borderColor = isCleaned ? '#047857' : isCrit ? '#991b1b' : isHigh ? '#b45309' : '#1d4ed8';

              return (
                <AdvancedMarker
                  key={sig.id}
                  position={pos}
                  onClick={() => {
                    setSelectedSig(sig);
                    setSelectedFacility(null);
                    setSelectedMission(null);
                    if (onSelectSignalement) onSelectSignalement(sig);
                  }}
                  title={`${sig.commune} - ${sig.quartier} (${sig.severity})`}
                >
                  <Pin
                    background={bgColor}
                    borderColor={borderColor}
                    glyphColor="#ffffff"
                    scale={isHighlighted ? 1.4 : isCrit ? 1.2 : 1.0}
                  >
                    <span className="text-[10px] font-black text-white">
                      {isCleaned ? '✓' : isCrit ? '!' : '~'}
                    </span>
                  </Pin>
                </AdvancedMarker>
              );
            })}

            {/* Official REGEDEK Waste Facilities */}
            {showFacilities && REGEDEK_FACILITIES.map((fac) => (
              <AdvancedMarker
                key={fac.id}
                position={fac.position}
                onClick={() => {
                  setSelectedFacility(fac);
                  setSelectedSig(null);
                  setSelectedMission(null);
                }}
                title={fac.name}
              >
                <Pin
                  background="#0d9488"
                  borderColor="#0f766e"
                  glyphColor="#ffffff"
                  scale={1.15}
                >
                  <span className="text-[10px] font-bold text-white">♻</span>
                </Pin>
              </AdvancedMarker>
            ))}

            {/* Sanitation Missions Markers */}
            {showMissions && missions.map((m, index) => {
              // Offset slightly if no explicit coords
              const baseCoords = [
                { lat: -4.338, lng: 15.310 },
                { lat: -4.348, lng: 15.340 },
                { lat: -4.310, lng: 15.280 }
              ][index % 3];

              return (
                <AdvancedMarker
                  key={m.id}
                  position={baseCoords}
                  onClick={() => {
                    setSelectedMission(m);
                    setSelectedSig(null);
                    setSelectedFacility(null);
                  }}
                  title={m.title}
                >
                  <Pin
                    background="#1e40af"
                    borderColor="#1e3a8a"
                    glyphColor="#ffffff"
                    scale={1.1}
                  >
                    <span className="text-[10px] font-bold text-white">🚜</span>
                  </Pin>
                </AdvancedMarker>
              );
            })}

            {/* Selected Coordinates Pin in Picker Mode */}
            {selectedCoordinates && (
              <AdvancedMarker position={selectedCoordinates} title="Emplacement sélectionné">
                <Pin background="#4f46e5" borderColor="#3730a3" glyphColor="#ffffff" scale={1.3}>
                  <span className="text-[10px] font-bold text-white">📍</span>
                </Pin>
              </AdvancedMarker>
            )}

            {/* InfoWindow for Signalement */}
            {selectedSig && (
              <InfoWindow
                position={parseCoordinates(selectedSig.coordinates)}
                onCloseClick={() => setSelectedSig(null)}
              >
                <div className="p-1 max-w-[260px] text-gray-900 space-y-2">
                  {selectedSig.imageUrl && (
                    <div className="h-28 w-full rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={selectedSig.imageUrl}
                        alt={selectedSig.commune}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-gray-900">
                        {selectedSig.ville || selectedSig.commune} ({selectedSig.province || 'Kinshasa'})
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                        selectedSig.severity === 'Critique' ? 'bg-red-600' :
                        selectedSig.severity === 'Élevé' ? 'bg-amber-500' : 'bg-blue-600'
                      }`}>
                        {selectedSig.severity}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium">
                      Quartier / Réf: {selectedSig.quartier}
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">
                      {selectedSig.description}
                    </p>
                  </div>

                  <div className="p-2 bg-gray-50 rounded-lg text-[10px] space-y-1 text-gray-600 border border-gray-100">
                    <div className="flex justify-between">
                      <span>Tonnage estimé :</span>
                      <span className="font-bold text-gray-900">~{selectedSig.tonnageEstime} tonnes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Statut actuel :</span>
                      <span className={`font-bold ${
                        selectedSig.status === 'Nettoyé' ? 'text-emerald-700' :
                        selectedSig.status === 'En cours' ? 'text-amber-700' : 'text-red-700'
                      }`}>
                        {selectedSig.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signalé par :</span>
                      <span className="font-medium text-gray-700">{selectedSig.author}</span>
                    </div>
                  </div>

                  {onUpdateStatus && selectedSig.status !== 'Nettoyé' && (
                    <button
                      onClick={() => {
                        onUpdateStatus(selectedSig.id, 'Nettoyé');
                        setSelectedSig(prev => prev ? { ...prev, status: 'Nettoyé' } : null);
                      }}
                      className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marquer comme Nettoyé</span>
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}

            {/* InfoWindow for REGEDEK Eco-Point / Facility */}
            {selectedFacility && (
              <InfoWindow
                position={selectedFacility.position}
                onCloseClick={() => setSelectedFacility(null)}
              >
                <div className="p-1 max-w-[260px] text-gray-900 space-y-2">
                  <div className="flex items-center space-x-1.5 text-emerald-800">
                    <Recycle className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Site Agréé Ets ENVIRONNEMENT-PLUS</span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-900">{selectedFacility.name}</h4>
                  <p className="text-[11px] text-gray-600">{selectedFacility.address}, {selectedFacility.commune}</p>
                  
                  <div className="p-2 bg-emerald-50/70 rounded-lg text-[10px] space-y-1 text-emerald-900 border border-emerald-100">
                    <div className="flex justify-between">
                      <span>Type d’installation :</span>
                      <span className="font-bold">{selectedFacility.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacité :</span>
                      <span className="font-bold">{selectedFacility.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Filières :</span>
                      <span className="font-bold">{selectedFacility.materials}</span>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* InfoWindow for Mission */}
            {selectedMission && (
              <InfoWindow
                position={{ lat: -4.338, lng: 15.310 }}
                onCloseClick={() => setSelectedMission(null)}
              >
                <div className="p-1 max-w-[260px] text-gray-900 space-y-2">
                  <div className="flex items-center space-x-1.5 text-blue-800">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Mission d'Assainissement</span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-900">{selectedMission.title}</h4>
                  <p className="text-[11px] text-gray-600">{selectedMission.description}</p>
                  <div className="p-2 bg-blue-50/70 rounded-lg text-[10px] space-y-1 text-blue-900 border border-blue-100">
                    <div className="flex justify-between">
                      <span>Équipe déployée :</span>
                      <span className="font-bold">{selectedMission.team}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Statut :</span>
                      <span className="font-bold">{selectedMission.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tonnes collectées :</span>
                      <span className="font-bold text-emerald-800">{selectedMission.tonsCollected} t</span>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {pickerMode && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              {selectedCoordinates 
                ? `Coordonnées pointées : ${selectedCoordinates.lat.toFixed(4)}, ${selectedCoordinates.lng.toFixed(4)}`
                : "Cliquez n'importe où sur la carte pour épingler l'emplacement précis du dépotoir."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
