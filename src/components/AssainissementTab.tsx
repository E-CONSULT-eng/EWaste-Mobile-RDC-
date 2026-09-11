import React, { useState } from 'react';
import { Trash2, Plus, Calendar, Users, MapPin, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { AssainissementMission } from '../types';
import { PROVINCES_RDC, getVillesByProvince } from '../data/provincesRDC';

interface AssainissementTabProps {
  missions: AssainissementMission[];
  onAddMission: (mission: Partial<AssainissementMission>) => void;
}

export function AssainissementTab({ missions, onAddMission }: AssainissementTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Kinshasa');
  const [commune, setCommune] = useState('Limete');
  const [customVille, setCustomVille] = useState('');
  const [team, setTeam] = useState('Brigade Ets ENVIRONNEMENT-PLUS');
  const [tonsCollected, setTonsCollected] = useState(10);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Planifié' | 'En cours' | 'Terminé'>('En cours');

  const availableVilles = getVillesByProvince(selectedProvince);

  const handleProvinceChange = (newProv: string) => {
    setSelectedProvince(newProv);
    const villes = getVillesByProvince(newProv);
    if (villes.length > 0) {
      setCommune(villes[0]);
    }
    setCustomVille('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveVille = commune === 'Autre' && customVille ? customVille : commune;
    onAddMission({
      title,
      province: selectedProvince,
      ville: effectiveVille,
      commune: effectiveVille,
      startDate: new Date().toISOString().split('T')[0],
      status,
      team,
      tonsCollected: Number(tonsCollected),
      description
    });
    setShowModal(false);
    setTitle('');
    setDescription('');
    setCustomVille('');
    setTonsCollected(10);
  };

  const totalTons = missions.reduce((acc, m) => acc + m.tonsCollected, 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">Assainissement & Nettoyage RDC</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              26 Provinces
            </span>
          </div>
          <p className="text-xs text-gray-500">Suivi des campagnes d'assainissement et des brigades de l'Ets ENVIRONNEMENT-PLUS à travers les 26 provinces de la RDC.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Mission</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <p className="text-xs text-teal-200 font-medium mb-1">Total Déchets Collectés</p>
          <h3 className="text-3xl font-extrabold">{totalTons} <span className="text-lg font-normal text-teal-200">tonnes</span></h3>
          <p className="text-xs text-teal-100 mt-1">Sur l'ensemble des 26 provinces de la RDC.</p>
        </div>
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
          <Trash2 className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Missions et Interventions</h2>
        <div className="grid grid-cols-1 gap-4">
          {missions.map((mission) => (
            <div key={mission.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-semibold flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-emerald-700" />
                      <span>{mission.ville || mission.commune} ({mission.province || 'Kinshasa'})</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      mission.status === 'Terminé' ? 'bg-emerald-100 text-emerald-800' :
                      mission.status === 'En cours' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {mission.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{mission.title}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {mission.tonsCollected} tonnes
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-4 leading-relaxed">{mission.description}</p>

              <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 gap-2">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{mission.team}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{mission.startDate}</span>
                  </span>
                </div>
                <span className="font-mono text-[11px] text-gray-400">{mission.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal nouvelle mission */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Planifier une Mission d'Assainissement</h2>
            <p className="text-xs text-gray-500 mb-4">Créer une opération de nettoyage pour les brigades régionales de l'Ets ENVIRONNEMENT-PLUS.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Titre de l'opération</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Curage collecteur principal Limete"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Province & Ville Selector (26 Provinces) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                <div>
                  <label className="block text-xs font-semibold text-emerald-950 mb-1 flex items-center justify-between">
                    <span>Province (26 RDC)</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Région</span>
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
                    <span>Ville / Commune</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Secteur</span>
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
                      placeholder="Ex: Uvira, Kasumbalesa, Beni, Mwenga..."
                      value={customVille}
                      onChange={(e) => setCustomVille(e.target.value)}
                      className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Planifié">Planifié</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tonnage estimé/collecté</label>
                  <input
                    type="number"
                    min="1"
                    value={tonsCollected}
                    onChange={(e) => setTonsCollected(Number(e.target.value))}
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Équipe / Brigade</label>
                <input
                  type="text"
                  required
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description & Moyens Déployés</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Détails de l'intervention, engins mobilisés..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
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
                  Créer la Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
