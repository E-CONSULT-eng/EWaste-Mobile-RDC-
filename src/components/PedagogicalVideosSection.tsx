import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Clock, 
  CheckCircle, 
  BookOpen, 
  Award, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle, 
  ListOrdered, 
  ExternalLink,
  RotateCcw,
  Volume2,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Tv
} from 'lucide-react';
import { PEDAGOGICAL_VIDEOS, PedagogicalVideo } from '../data/trainingVideosData';

interface PedagogicalVideosSectionProps {
  completedVideos: string[];
  onMarkVideoCompleted: (videoId: string) => void;
}

export function PedagogicalVideosSection({
  completedVideos = [],
  onMarkVideoCompleted
}: PedagogicalVideosSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState<PedagogicalVideo>(PEDAGOGICAL_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [filterCategory, setFilterCategory] = useState<string>('Tous');
  const [playerMode, setPlayerMode] = useState<'interactive' | 'stream'>('interactive');
  
  // Interactive Video Quiz State
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [quizEarnedPoints, setQuizEarnedPoints] = useState<boolean>(false);

  // Playback timer simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveChapterIndex(prev => {
          if (prev < selectedVideo.chapters.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 5000); // Progresses through chapters every 5 seconds in preview demo
    }
    return () => clearInterval(timer);
  }, [isPlaying, selectedVideo.chapters.length]);

  // Reset quiz state when switching videos
  useEffect(() => {
    setSelectedQuizOption(null);
    setIsQuizSubmitted(false);
    setQuizEarnedPoints(false);
  }, [selectedVideo.id]);

  const categories = ['Tous', 'Salubrité Urbaine', 'Compostage & Maraîchage', 'Recyclage Plastique', 'Législation & Taxes', 'Santé Publique'];

  const filteredVideos = filterCategory === 'Tous' 
    ? PEDAGOGICAL_VIDEOS 
    : PEDAGOGICAL_VIDEOS.filter(v => v.category === filterCategory);

  const isCurrentCompleted = completedVideos.includes(selectedVideo.id);

  const handleQuizSubmit = () => {
    if (selectedQuizOption === null) return;
    setIsQuizSubmitted(true);
    if (selectedQuizOption === selectedVideo.interactiveQuiz.correctIndex) {
      setQuizEarnedPoints(true);
      onMarkVideoCompleted(selectedVideo.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category selector pills */}
      <div className="flex space-x-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterCategory === cat
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Video Presentation Player */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Top Player Mode Switcher */}
        <div className="bg-gray-900 px-4 py-2 text-xs flex items-center justify-between text-gray-300 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-white">Plateforme d'Éducation Environnementale Interactif</span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPlayerMode('interactive')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                playerMode === 'interactive' 
                  ? 'bg-emerald-700 text-white font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Lecteur Interactif Chapitré
            </button>
            <button
              onClick={() => setPlayerMode('stream')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                playerMode === 'stream' 
                  ? 'bg-emerald-700 text-white font-bold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mode Streaming
            </button>
          </div>
        </div>

        {/* Video Canvas / Screen */}
        <div className="relative aspect-video bg-gray-950 flex items-center justify-center overflow-hidden">
          {playerMode === 'stream' && selectedVideo.videoUrl ? (
            <iframe
              src={selectedVideo.videoUrl}
              title={selectedVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img 
                src={selectedVideo.thumbnailUrl} 
                alt={selectedVideo.title}
                className="w-full h-full object-cover opacity-60"
              />

              {/* Player Overlay Controls */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/20 to-black/40">
                <div className="flex items-center justify-between text-white text-xs">
                  <span className="bg-emerald-800/90 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold border border-emerald-600">
                    {selectedVideo.category}
                  </span>
                  <span className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedVideo.duration}</span>
                  </span>
                </div>

                {/* Play Button & Title */}
                <div className="text-center space-y-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 rounded-full bg-emerald-800 text-white flex items-center justify-center mx-auto shadow-lg hover:bg-emerald-700 hover:scale-105 transition"
                    title={isPlaying ? "Mettre en pause" : "Lancer la vidéo interactive"}
                  >
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                  </button>
                  <h2 className="text-sm sm:text-base font-bold text-white max-w-xl mx-auto drop-shadow-md">
                    {selectedVideo.title}
                  </h2>
                  <p className="text-[11px] text-emerald-300 font-medium">
                    {isPlaying ? "Lecture interactive active..." : "Cliquez pour démarrer la présentation interactive"}
                  </p>
                </div>

                {/* Bottom Playback bar & Current Chapter indicator */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-300">
                    <span>Chapitre en cours : <b>{selectedVideo.chapters[activeChapterIndex]?.title}</b></span>
                    <span>{selectedVideo.chapters[activeChapterIndex]?.time} / {selectedVideo.duration}</span>
                  </div>
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${((activeChapterIndex + 1) / selectedVideo.chapters.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Video Detailed Description & Chapters */}
        <div className="p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="text-xs font-semibold text-emerald-800">{selectedVideo.speaker}</div>
              <div className="text-[11px] text-gray-500">{selectedVideo.institution} • Public cible : {selectedVideo.targetAudience}</div>
            </div>

            <button
              onClick={() => onMarkVideoCompleted(selectedVideo.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                isCurrentCompleted
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isCurrentCompleted ? 'Module Vidéo Validé' : 'Valider ce Module'}</span>
            </button>
          </div>

          <p className="text-xs text-gray-700 leading-relaxed">
            {selectedVideo.description}
          </p>

          {/* Chapters List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
              <ListOrdered className="w-4 h-4 text-emerald-800" />
              <span>Sommaire & Chapitres Pédagogiques Interactifs</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {selectedVideo.chapters.map((ch, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setActiveChapterIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    activeChapterIndex === idx 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-emerald-800 flex items-center space-x-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-800 text-white text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{ch.title}</span>
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">{ch.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-600 pl-5">{ch.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Comprehension Quiz Section */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-5 border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Questionnaire Interactif de Validation Vidéo
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    Testez vos acquis en direct pour valider définitivement ce module et empocher 25 Éco-Points.
                  </p>
                </div>
              </div>
              {isCurrentCompleted && (
                <span className="px-2.5 py-1 bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Validé</span>
                </span>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-2xs space-y-3">
              <p className="text-xs font-bold text-gray-900">
                {selectedVideo.interactiveQuiz.question}
              </p>

              <div className="space-y-2">
                {selectedVideo.interactiveQuiz.options.map((opt, optIdx) => {
                  const isSelected = selectedQuizOption === optIdx;
                  const isCorrect = optIdx === selectedVideo.interactiveQuiz.correctIndex;
                  let optionClass = 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100';

                  if (isQuizSubmitted) {
                    if (isCorrect) {
                      optionClass = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                    } else if (isSelected) {
                      optionClass = 'bg-red-100 border-red-300 text-red-900';
                    }
                  } else if (isSelected) {
                    optionClass = 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-600/20';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isQuizSubmitted}
                      onClick={() => setSelectedQuizOption(optIdx)}
                      className={`w-full p-2.5 rounded-xl border text-xs text-left transition flex items-center justify-between ${optionClass}`}
                    >
                      <span>{opt}</span>
                      {isQuizSubmitted && isCorrect && (
                        <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isQuizSubmitted && (
                <div className={`p-3 rounded-xl text-xs space-y-1 ${
                  selectedQuizOption === selectedVideo.interactiveQuiz.correctIndex
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                    : 'bg-red-50 text-red-950 border border-red-200'
                }`}>
                  <p className="font-bold">
                    {selectedQuizOption === selectedVideo.interactiveQuiz.correctIndex
                      ? '✓ Excellente réponse !'
                      : '✗ Réponse incorrecte.'}
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    {selectedVideo.interactiveQuiz.explanation}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-500">
                  {isQuizSubmitted && quizEarnedPoints 
                    ? '+25 Éco-Points crédités avec succès !' 
                    : '1 seule bonne réponse requise'}
                </span>
                {!isQuizSubmitted ? (
                  <button
                    type="button"
                    disabled={selectedQuizOption === null}
                    onClick={handleQuizSubmit}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-40"
                  >
                    Valider ma réponse
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuizSubmitted(false);
                      setSelectedQuizOption(null);
                    }}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
                  >
                    Recommencer la question
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pedagogical Objectives & Key Takeaways Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Objectives */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
              <h5 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                <span>Objectifs d'Apprentissage</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {selectedVideo.pedagogicalObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-800 font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Takeaways */}
            <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200 space-y-2">
              <h5 className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                <span>Enseignements Clés REGEDEK</span>
              </h5>
              <ul className="space-y-1.5 text-xs text-emerald-900">
                {selectedVideo.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-800 font-bold">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Grid of all videos */}
      <div>
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
          Tous les Modules Vidéo Interactifs ({filteredVideos.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredVideos.map((vid) => {
            const isCompleted = completedVideos.includes(vid.id);
            const isSelected = selectedVideo.id === vid.id;

            return (
              <div
                key={vid.id}
                onClick={() => {
                  setSelectedVideo(vid);
                  setActiveChapterIndex(0);
                  setIsPlaying(false);
                }}
                className={`bg-white rounded-xl border p-3.5 shadow-2xs cursor-pointer transition space-y-2.5 ${
                  isSelected 
                    ? 'border-emerald-700 ring-2 ring-emerald-700/20' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                  <img 
                    src={vid.thumbnailUrl} 
                    alt={vid.title} 
                    className="w-full h-full object-cover opacity-80" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow">
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                    {vid.duration}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                    <span className="font-semibold text-emerald-800">{vid.category}</span>
                    {isCompleted && (
                      <span className="text-emerald-700 font-bold flex items-center space-x-0.5">
                        <CheckCircle className="w-3 h-3" />
                        <span>Validé</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                    {vid.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{vid.speaker}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
