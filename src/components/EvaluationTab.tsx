import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Plus, Award, BarChart2, Loader2, CheckCircle2, FileText, ClipboardList, MapPin } from 'lucide-react';
import { EvaluationEnv } from '../types';
import { EiesSection } from './EiesSection';
import { PROVINCES_RDC, getVillesByProvince } from '../data/provincesRDC';

interface EvaluationTabProps {
  evaluations: EvaluationEnv[];
  onAddEvaluation: (evalData: Partial<EvaluationEnv>) => void;
  onNotify?: (title: string, msg: string) => void;
}

export function EvaluationTab({ evaluations, onAddEvaluation, onNotify }: EvaluationTabProps) {
  const [activeSection, setActiveSection] = useState<'eies' | 'audits'>('eies');
  const [showModal, setShowModal] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('Kinshasa');
  const [commune, setCommune] = useState('Limete');
  const [customVille, setCustomVille] = useState('');
  const [auditor, setAuditor] = useState('Inspecteur REGEDEK');
  const [salubriteScore, setSalubriteScore] = useState(60);
  const [drainageScore, setDrainageScore] = useState(55);
  const [sensibilisationScore, setSensibilisationScore] = useState(70);
  const [commentaires, setCommentaires] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableVilles = getVillesByProvince(selectedProvince);

  const handleProvinceChange = (newProv: string) => {
    setSelectedProvince(newProv);
    const villes = getVillesByProvince(newProv);
    if (villes.length > 0) {
      setCommune(villes[0]);
    }
    setCustomVille('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const effectiveVille = commune === 'Autre' && customVille ? customVille : commune;
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          province: selectedProvince,
          ville: effectiveVille,
          commune: effectiveVille,
          auditor,
          salubriteScore,
          drainageScore,
          sensibilisationScore,
          commentaires
        })
      });
      const newEval = await res.json();
      onAddEvaluation(newEval);
      setShowModal(false);
      setCommentaires('');
      if (onNotify) {
        onNotify("Nouvel Audit Enregistré", `L'audit pour ${effectiveVille} (${selectedProvince}) a été validé avec succès.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Navigation Sub-Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-gray-950">
              Études d'Impact & Évaluation Environnementale
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Dossiers officiels ÉIES (ACE/Loi 11/009), Plans de Gestion Environnementale et Sociale (PGES) et audits communaux.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center p-1 bg-gray-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveSection('eies')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSection === 'eies'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Études d'Impact (ÉIES & PGES)</span>
          </button>
          <button
            onClick={() => setActiveSection('audits')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSection === 'audits'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Audits Communaux ({evaluations.length})</span>
          </button>
        </div>
      </div>

      {activeSection === 'eies' ? (
        <EiesSection onNotify={onNotify} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Audits de Salubrité par Commune</h2>
              <p className="text-xs text-gray-500">Inspections de terrain, drainage des caniveaux et recommandations techniques.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvel Audit</span>
            </button>
          </div>

          {/* Evaluations List */}
          <div className="space-y-4">
            {evaluations.map((item) => {
              const moyenne = Math.round((item.salubriteScore + item.drainageScore + item.sensibilisationScore) / 3);
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-semibold flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-emerald-700" />
                          <span>{item.ville || item.commune} ({item.province || 'Kinshasa'})</span>
                        </span>
                        <span className="text-xs text-gray-400">Auditeur: {item.auditor} ({item.date})</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Indice Global: {moyenne}/100</h3>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      moyenne >= 70 ? 'bg-emerald-100 text-emerald-800' :
                      moyenne >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {moyenne}%
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">Salubrité</span>
                        <span className="font-bold text-gray-900">{item.salubriteScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${item.salubriteScore}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">Drainage & Caniveaux</span>
                        <span className="font-bold text-gray-900">{item.drainageScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.drainageScore}%` }}></div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">Sensibilisation</span>
                        <span className="font-bold text-gray-900">{item.sensibilisationScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${item.sensibilisationScore}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 italic bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    "{item.commentaires}"
                  </p>

                  {item.aiRecommendation && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 space-y-1">
                      <div className="font-semibold flex items-center space-x-1.5 text-emerald-800">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        <span>Recommandation IA REGEDEK:</span>
                      </div>
                      <p className="leading-relaxed">{item.aiRecommendation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal nouvel audit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Nouvelle Évaluation Environnementale</h2>
            <p className="text-xs text-gray-500 mb-4">Évaluez l'état environnemental d'une ville ou commune des 26 provinces de la RDC.</p>

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
                    <span>Ville / Commune</span>
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
                      placeholder="Ex: Uvira, Kasumbalesa, Beni, Mwenga..."
                      value={customVille}
                      onChange={(e) => setCustomVille(e.target.value)}
                      className="w-full text-xs bg-white border border-emerald-200 rounded-xl px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Auditeur / Inspecteur</label>
                <input
                  type="text"
                  required
                  value={auditor}
                  onChange={(e) => setAuditor(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                    <span>Score Salubrité (0-100)</span>
                    <span className="font-bold text-emerald-700">{salubriteScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={salubriteScore}
                    onChange={(e) => setSalubriteScore(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                    <span>Score Drainage / Caniveaux (0-100)</span>
                    <span className="font-bold text-blue-700">{drainageScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={drainageScore}
                    onChange={(e) => setDrainageScore(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                    <span>Score Sensibilisation citoyenne (0-100)</span>
                    <span className="font-bold text-amber-600">{sensibilisationScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sensibilisationScore}
                    onChange={(e) => setSensibilisationScore(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Commentaires et observations</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Observations sur le terrain..."
                  value={commentaires}
                  onChange={(e) => setCommentaires(e.target.value)}
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
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-medium bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition flex items-center space-x-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Enregistrer & Analyser par IA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
