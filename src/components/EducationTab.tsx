import React, { useState, useEffect } from 'react';
import { 
  Award, 
  BookOpen, 
  CheckCircle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Filter, 
  GraduationCap, 
  HelpCircle, 
  Lightbulb, 
  Printer, 
  Recycle, 
  RefreshCcw, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  ArrowRight, 
  UserCheck, 
  FileText,
  Play,
  Video,
  Share2
} from 'lucide-react';
import { WasteSortingGuide } from './WasteSortingGuide';
import { TRAINING_MODULES } from '../data/trainingModulesData';
import { TrainingCertificate, TrainingModule } from '../types';
import { TrainingModuleViewer } from './TrainingModuleViewer';
import { TrainingCertificateModal } from './TrainingCertificateModal';
import { PedagogicalVideosSection } from './PedagogicalVideosSection';
import { logFormationToSheet } from '../utils/googleSheets';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const CITIZEN_QUIZ_LIST: QuizQuestion[] = [
  {
    id: 1,
    question: "Pourquoi est-il dangereux de jeter les bouteilles plastiques dans les caniveaux à Kinshasa ?",
    options: [
      "Cela bouche les canalisations et provoque des inondations en saison des pluies",
      "Cela attire les oiseaux rares",
      "C'est sans danger pour la ville",
      "Cela embellit les rues"
    ],
    correct: 0,
    explanation: "Les plastiques non biodégradables obstruent les caniveaux et rivières de Kinshasa, provoquant des inondations destructrices."
  },
  {
    id: 2,
    question: "Quel est le rôle principal de l'Ets ENVIRONNEMENT-PLUS ?",
    options: [
      "Gérer la circulation routière",
      "Organiser la collecte, le traitement et la salubrité des déchets à Kinshasa",
      "Distribuer de l'électricité",
      "Gérer les transports fluviaux"
    ],
    correct: 1,
    explanation: "La Ets ENVIRONNEMENT-PLUS (Ets ENVIRONNEMENT-PLUS - Assainissement & Salubrité) coordonne la salubrité et l'assainissement de la ville."
  },
  {
    id: 3,
    question: "Que faire lorsqu'on découvre un dépotoir sauvage important ?",
    options: [
      "Y mettre le feu",
      "L'ignorer",
      "Le signaler instantanément via l'application EWaste Mobile (ewastemobile.ai.studio) avec photo et géolocalisation",
      "Attendre la saison sèche"
    ],
    correct: 2,
    explanation: "Le signalement instantané sur EWaste Mobile (ewastemobile.ai.studio) permet aux brigades d'assainissement de l'Ets ENVIRONNEMENT-PLUS d'intervenir rapidement."
  },
  {
    id: 4,
    question: "Quelle est la meilleure pratique pour les déchets organiques ménagers ?",
    options: [
      "Les jeter par la fenêtre",
      "Les incinérer sur le trottoir",
      "Leur valorisation par compostage ou tri sélectif",
      "Les mélanger avec des piles électriques"
    ],
    correct: 2,
    explanation: "Le compostage transforme les déchets organiques en engrais naturel de qualité tout en réduisant le volume des poubelles."
  }
];

interface EducationTabProps {
  onNavigateToScanner?: () => void;
}

export function EducationTab({ onNavigateToScanner }: EducationTabProps = {}) {
  const [activeTab, setActiveTab] = useState<'modules' | 'videos' | 'guide' | 'quiz' | 'certificates'>('modules');

  // Learner profile state
  const [learnerName, setLearnerName] = useState<string>(() => {
    return localStorage.getItem('waste_mobile_learner_name') || 'Agent Environnemental';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(learnerName);

  // Active module view state
  const [activeModule, setActiveModule] = useState<TrainingModule | null>(null);

  // Completed lessons state (starts empty / zero by default)
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('waste_mobile_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Completed pedagogical videos state
  const [completedVideos, setCompletedVideos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('waste_mobile_completed_videos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Module scores state
  const [moduleScores, setModuleScores] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('waste_mobile_module_scores');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Earned certificates state (starts empty / zero until earned by real user)
  const [certificates, setCertificates] = useState<TrainingCertificate[]>(() => {
    try {
      const saved = localStorage.getItem('waste_mobile_certificates');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Active viewing certificate modal
  const [selectedCertificate, setSelectedCertificate] = useState<TrainingCertificate | null>(null);

  // Filter and search state
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [selectedAudience, setSelectedAudience] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Citizen Quiz state
  const [currentCitizenQuizIndex, setCurrentCitizenQuizIndex] = useState(0);
  const [selectedCitizenOption, setSelectedCitizenOption] = useState<number | null>(null);
  const [isCitizenAnswered, setIsCitizenAnswered] = useState(false);
  const [citizenScore, setCitizenScore] = useState(0);
  const [citizenQuizFinished, setCitizenQuizFinished] = useState(false);

  // Persist progress
  useEffect(() => {
    localStorage.setItem('waste_mobile_completed_lessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    localStorage.setItem('waste_mobile_module_scores', JSON.stringify(moduleScores));
  }, [moduleScores]);

  useEffect(() => {
    localStorage.setItem('waste_mobile_certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('waste_mobile_learner_name', learnerName);
  }, [learnerName]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setLearnerName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const handleMarkLessonCompleted = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons(prev => [...prev, lessonId]);
    }
  };

  const handleCompleteModule = (moduleId: string, score: number, certificate?: TrainingCertificate) => {
    setModuleScores(prev => ({ ...prev, [moduleId]: score }));
    if (certificate) {
      setCertificates(prev => {
        const filtered = prev.filter(c => c.moduleId !== moduleId);
        return [certificate, ...filtered];
      });
    }

    // Synchronisation en temps réel du résultat de formation sur Google Sheets
    const targetMod = TRAINING_MODULES.find(m => m.id === moduleId);
    logFormationToSheet({
      learnerName,
      type: 'Module Certifiant',
      moduleOrQuiz: targetMod?.title || `Module ${moduleId}`,
      score: `${score}%`,
      result: certificate ? 'Certificat Délivré' : 'Module Complété',
      province: 'RDC',
      ecoPoints: certificate ? 50 : 25
    }).catch(() => {});
  };

  // Citizen Quiz controls
  const handleSelectCitizenOption = (idx: number) => {
    if (isCitizenAnswered) return;
    setSelectedCitizenOption(idx);
    setIsCitizenAnswered(true);
    if (idx === CITIZEN_QUIZ_LIST[currentCitizenQuizIndex].correct) {
      setCitizenScore(prev => prev + 1);
    }
  };

  const handleNextCitizenQuiz = () => {
    if (currentCitizenQuizIndex < CITIZEN_QUIZ_LIST.length - 1) {
      setCurrentCitizenQuizIndex(prev => prev + 1);
      setSelectedCitizenOption(null);
      setIsCitizenAnswered(false);
    } else {
      setCitizenQuizFinished(true);
      // Synchronisation en temps réel du Quiz Citoyen sur Google Sheets
      logFormationToSheet({
        learnerName,
        type: 'Quiz Citoyen',
        moduleOrQuiz: 'Quiz Salubrité & Tri RDC',
        score: `${citizenScore}/${CITIZEN_QUIZ_LIST.length}`,
        result: citizenScore >= 3 ? 'Validé avec Succès' : 'À Renforcer',
        province: 'Kinshasa',
        ecoPoints: citizenScore * 10
      }).catch(() => {});
    }
  };

  const resetCitizenQuiz = () => {
    setCurrentCitizenQuizIndex(0);
    setSelectedCitizenOption(null);
    setIsCitizenAnswered(false);
    setCitizenScore(0);
    setCitizenQuizFinished(false);
  };

  // Filter modules
  const filteredModules = TRAINING_MODULES.filter(mod => {
    const matchCat = selectedCategory === 'Tous' || mod.category === selectedCategory;
    const matchAud = selectedAudience === 'Tous' || mod.targetAudience === selectedAudience;
    const matchSearch = searchQuery.trim() === '' || 
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.lessons.some(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchAud && matchSearch;
  });

  // Aggregate stats
  const totalLessons = TRAINING_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessonsCount = completedLessons.length;
  const globalCompletionRate = Math.round((completedLessonsCount / totalLessons) * 100);

  // If a module is being actively studied, render the viewer
  if (activeModule) {
    return (
      <div className="pb-16">
        <TrainingModuleViewer
          module={activeModule}
          learnerName={learnerName}
          onBack={() => setActiveModule(null)}
          onCompleteModule={handleCompleteModule}
          onOpenCertificate={(cert) => setSelectedCertificate(cert)}
          completedLessons={completedLessons}
          onMarkLessonCompleted={handleMarkLessonCompleted}
        />
        {selectedCertificate && (
          <TrainingCertificateModal
            certificate={selectedCertificate}
            onClose={() => setSelectedCertificate(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header with Title & Learner Profile Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">Centre de Formation & Tri Éco-Responsable</h1>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
              Officiel Ets ENVIRONNEMENT-PLUS
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Programme pédagogique complet certifié par la Ets ENVIRONNEMENT-PLUS - Assainissement & Salubrité et Environnement Plus RDC.
          </p>
        </div>

        {/* Learner Name Customizer */}
        <div className="bg-white p-2.5 px-3.5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-3 text-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Apprenant certifié</div>
            {isEditingName ? (
              <div className="flex items-center space-x-1.5 mt-0.5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-2 py-0.5 border border-emerald-500 rounded text-xs text-gray-900 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-2 py-0.5 bg-emerald-700 text-white rounded text-[10px] font-bold"
                >
                  OK
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900">{learnerName}</span>
                <button
                  onClick={() => {
                    setTempName(learnerName);
                    setIsEditingName(true);
                  }}
                  className="text-[10px] text-emerald-700 hover:underline font-semibold"
                >
                  (Modifier)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex space-x-1.5 sm:space-x-2 bg-gray-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'modules' ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-700" />
          <span>Modules Pédagogiques ({TRAINING_MODULES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'videos' ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Video className="w-4 h-4 text-emerald-700" />
          <span>Vidéothèque (5)</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'certificates' ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-600" />
          <span>Attestations ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'guide' ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Recycle className="w-4 h-4 text-emerald-700" />
          <span>Guide du Tri</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'quiz' ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Quiz Express</span>
        </button>
      </div>

      {/* TAB 1: MODULES DE FORMATION */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Parcours</p>
                <p className="text-lg font-black text-gray-900">{TRAINING_MODULES.length} Cursus</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Leçons terminées</p>
                <p className="text-lg font-black text-gray-900">{completedLessonsCount} / {totalLessons}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Certificats</p>
                <p className="text-lg font-black text-amber-900">{certificates.length} Obtenu{certificates.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Progression</p>
                <p className="text-lg font-black text-purple-900">{globalCompletionRate}%</p>
              </div>
            </div>
          </div>

          {/* Search and Category Filters */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une notion (compost, DASRI, curage, EPI, pavés plastiques, Loi 11/009)..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-gray-400 font-semibold flex items-center space-x-1">
                <Filter className="w-3 h-3" />
                <span>Thématique :</span>
              </span>
              {[
                'Tous',
                'Tri & Valorisation',
                'Hydraulique & Salubrité',
                'Santé & Sécurité EPI',
                'Déchets Dangereux & DASRI',
                'Législation & Police',
                'Entrepreneuriat Vert'
              ].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-medium transition text-xs ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-gray-400 font-semibold">Public :</span>
              {[
                'Tous',
                'Tout Public / Citoyens',
                'Agents & Éboueurs de Terrain',
                'Personnel Médical & Spécialisé',
                'Inspecteurs & Brigades',
                'Coopératives & PME'
              ].map(aud => (
                <button
                  key={aud}
                  onClick={() => setSelectedAudience(aud)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition ${
                    selectedAudience === aud
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredModules.map((mod) => {
              const completedInMod = mod.lessons.filter(l => completedLessons.includes(l.id)).length;
              const isFinished = completedInMod === mod.lessons.length;
              const hasCert = certificates.some(c => c.moduleId === mod.id);
              const score = moduleScores[mod.id];

              return (
                <div
                  key={mod.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header Gradient Banner */}
                    <div className={`bg-gradient-to-r ${mod.bannerGradient} text-white p-4 relative`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur">
                          {mod.code}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-400 text-amber-950 rounded-full text-[10px] font-bold uppercase">
                          {mod.level}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-white leading-snug">
                        {mod.title}
                      </h3>
                      <p className="text-[11px] text-emerald-100/90 mt-1 flex items-center space-x-2">
                        <span>{mod.category}</span>
                        <span>•</span>
                        <span>{mod.durationTotal}</span>
                      </p>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                        {mod.shortDescription}
                      </p>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                          <span>Progression du cours :</span>
                          <span className="font-bold text-gray-800">
                            {completedInMod} / {mod.lessons.length} leçons
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(completedInMod / mod.lessons.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Audience Badge */}
                      <div className="pt-2 flex items-center justify-between text-[11px] border-t border-gray-100">
                        <span className="text-gray-400 font-medium">Cible :</span>
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {mod.targetAudience}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 text-xs">
                      {hasCert ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-[11px] bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          <Award className="w-3 h-3" />
                          <span>Certifié ({score || 100}%)</span>
                        </span>
                      ) : isFinished ? (
                        <span className="inline-flex items-center space-x-1 text-amber-700 font-bold text-[11px] bg-amber-100/80 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Prêt pour l'examen</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-500">
                          {completedInMod === 0 ? 'Non démarré' : 'En cours'}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveModule(mod)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{completedInMod > 0 ? 'Poursuivre le Cursus' : 'Commencer le Module'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 space-y-3">
              <BookOpen className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-semibold text-gray-600">Aucun module ne correspond à vos critères de recherche.</p>
              <button
                onClick={() => {
                  setSelectedCategory('Tous');
                  setSelectedAudience('Tous');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VIDÉOTHÈQUE PÉDAGOGIQUE */}
      {activeTab === 'videos' && (
        <PedagogicalVideosSection
          completedVideos={completedVideos}
          onMarkVideoCompleted={(vidId) => {
            setCompletedVideos(prev => {
              const updated = prev.includes(vidId) ? prev : [...prev, vidId];
              try {
                localStorage.setItem('waste_mobile_completed_videos', JSON.stringify(updated));
              } catch (_) {}
              return updated;
            });
            logFormationToSheet({
              learnerName,
              type: 'Vidéo Pédagogique',
              moduleOrQuiz: `Vidéo ${vidId}`,
              score: '100%',
              result: 'Module Vidéo Validé',
              province: 'RDC',
              ecoPoints: 20
            }).catch(() => {});
          }}
        />
      )}

      {/* TAB 3: ATTESTATIONS & CERTIFICATS */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-800 to-amber-950 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="max-w-2xl space-y-2">
              <span className="px-3 py-1 bg-amber-700/80 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-200">
                Attestations de Compétences Ets ENVIRONNEMENT-PLUS
              </span>
              <h2 className="text-xl font-bold text-white">Registre Officiel de vos Certificats Obtenus</h2>
              <p className="text-xs text-amber-100 leading-relaxed">
                Retrouvez ici l'ensemble de vos titres de formation validés. Chaque certificat est nominatif, vérifiable et certifié par la Ets ENVIRONNEMENT-PLUS - Assainissement & Salubrité et Environnement Plus RDC.
              </p>
            </div>
          </div>

          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-emerald-200/80 p-5 shadow-sm space-y-4 hover:border-emerald-500 transition relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          Code : {cert.code}
                        </span>
                        <h3 className="font-bold text-sm text-gray-900 leading-snug">
                          {cert.moduleTitle}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Titulaire :</span>
                      <span className="font-bold text-gray-900">{cert.learnerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date d'émission :</span>
                      <span>{cert.issueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Score d'examen :</span>
                      <span className="font-bold text-emerald-700">{cert.scorePercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">N° d'enregistrement :</span>
                      <span className="font-mono text-[10px] text-gray-600">{cert.certificateNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => setSelectedCertificate(cert)}
                      className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Afficher & Imprimer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 space-y-3">
              <Award className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-sm font-bold text-gray-900">Aucun certificat pour le moment</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Complétez les leçons d'un module et réussissez le test d'évaluation finale à au moins 75% pour débloquer votre premier titre officiel !
              </p>
              <button
                onClick={() => setActiveTab('modules')}
                className="px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Parcourir les Formations
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GUIDE DU TRI */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          {onNavigateToScanner && (
            <div 
              onClick={onNavigateToScanner}
              className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 cursor-pointer hover:shadow-lg transition border border-emerald-700/50 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-gray-950 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] uppercase font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Reconnaissance Automatique</span>
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    Un doute sur un déchet ? Utilisez l'Analyseur Caméra & IA
                  </h4>
                  <p className="text-[11px] text-emerald-100/80">
                    Visez l'objet avec votre caméra pour obtenir immédiatement sa poubelle officielle.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center space-x-1 text-xs font-bold text-amber-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="hidden sm:inline">Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
          <WasteSortingGuide />
        </div>
      )}

      {/* TAB 4: QUIZ CITOYEN EXPRESS */}
      {activeTab === 'quiz' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl mx-auto">
          {!citizenQuizFinished ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-gray-500 pb-3 border-b border-gray-100">
                <span className="font-semibold text-emerald-700">Question {currentCitizenQuizIndex + 1} sur {CITIZEN_QUIZ_LIST.length}</span>
                <span>Score: {citizenScore}</span>
              </div>

              <h2 className="text-base font-bold text-gray-900 leading-snug">
                {CITIZEN_QUIZ_LIST[currentCitizenQuizIndex].question}
              </h2>

              <div className="space-y-3">
                {CITIZEN_QUIZ_LIST[currentCitizenQuizIndex].options.map((option, idx) => {
                  let btnStyle = "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100";
                  if (isCitizenAnswered) {
                    if (idx === CITIZEN_QUIZ_LIST[currentCitizenQuizIndex].correct) {
                      btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold";
                    } else if (idx === selectedCitizenOption) {
                      btnStyle = "bg-red-50 border-red-500 text-red-900";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectCitizenOption(idx)}
                      disabled={isCitizenAnswered}
                      className={`w-full text-left p-4 rounded-xl border text-xs transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isCitizenAnswered && idx === CITIZEN_QUIZ_LIST[currentCitizenQuizIndex].correct && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isCitizenAnswered && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-3 animate-in fade-in">
                  <p className="font-medium leading-relaxed">💡 {CITIZEN_QUIZ_LIST[currentCitizenQuizIndex].explanation}</p>
                  <button
                    onClick={handleNextCitizenQuiz}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-xl font-medium shadow-sm transition"
                  >
                    {currentCitizenQuizIndex < CITIZEN_QUIZ_LIST.length - 1 ? "Question Suivante" : "Voir mon Résultat"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                🏆
              </div>
              <h2 className="text-xl font-bold text-gray-900">Quiz Terminé !</h2>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Vous avez obtenu <span className="font-bold text-emerald-700">{citizenScore} sur {CITIZEN_QUIZ_LIST.length}</span> bonnes réponses. Vous recevez le badge d'Éco-Citoyen d'Honneur de l'Ets ENVIRONNEMENT-PLUS !
              </p>
              <button
                onClick={resetCitizenQuiz}
                className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-medium shadow-md transition"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Recommencer le Quiz</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Global Certificate Modal */}
      {selectedCertificate && (
        <TrainingCertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}
