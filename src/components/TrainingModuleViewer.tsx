import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  CheckSquare, 
  ChevronRight, 
  HelpCircle, 
  Lightbulb, 
  MapPin, 
  MessageSquare, 
  RefreshCcw, 
  Send, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { TrainingCertificate, TrainingLesson, TrainingModule } from '../types';

interface TrainingModuleViewerProps {
  module: TrainingModule;
  learnerName: string;
  onBack: () => void;
  onCompleteModule: (moduleId: string, score: number, certificate?: TrainingCertificate) => void;
  onOpenCertificate: (cert: TrainingCertificate) => void;
  completedLessons: string[];
  onMarkLessonCompleted: (lessonId: string) => void;
}

interface TutorResponse {
  answer: string;
  practicalAdvice: string;
  keyReference: string;
  followUpSuggestion: string;
}

export function TrainingModuleViewer({
  module,
  learnerName,
  onBack,
  onCompleteModule,
  onOpenCertificate,
  completedLessons,
  onMarkLessonCompleted
}: TrainingModuleViewerProps) {
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'lesson' | 'quiz' | 'tutor'>('lesson');
  
  // Interactive checklist state per lesson
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizDetails, setShowQuizDetails] = useState(false);

  // AI Tutor state
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorHistory, setTutorHistory] = useState<Array<{
    sender: 'user' | 'tutor';
    text: string;
    details?: TutorResponse;
  }>>([
    {
      sender: 'tutor',
      text: `Bonjour ${learnerName || 'Apprenant'} ! Je suis votre tuteur pédagogique REGEDEK pour le module "${module.title}". Posez-moi toute question sur les leçons, les règles de tri, ou les opérations de terrain à Kinshasa.`
    }
  ]);

  const currentLesson: TrainingLesson = module.lessons[activeLessonIndex];
  const isLessonCompleted = completedLessons.includes(currentLesson?.id);

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNextLesson = () => {
    onMarkLessonCompleted(currentLesson.id);
    if (activeLessonIndex < module.lessons.length - 1) {
      setActiveLessonIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Prompt to go to Quiz
      setViewMode('quiz');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Quiz handling
  const handleSelectQuizOption = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    module.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    const finalScore = Math.round((correctCount / module.quiz.length) * 100);
    setQuizScore(finalScore);
    setQuizSubmitted(true);

    if (finalScore >= module.passingScorePercent) {
      const newCert: TrainingCertificate = {
        id: `CERT-${Date.now().toString().slice(-6)}`,
        moduleId: module.id,
        moduleTitle: module.title,
        code: module.code,
        learnerName: learnerName.trim() || 'Citoyen Éco-Responsable',
        issueDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        scorePercent: finalScore,
        certificateNumber: `REGEDEK-${module.code}-${Date.now().toString().slice(-6)}`
      };
      onCompleteModule(module.id, finalScore, newCert);
    } else {
      onCompleteModule(module.id, finalScore);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setCurrentQuizIndex(0);
  };

  // AI Tutor submit
  const handleAskTutor = async (customPrompt?: string) => {
    const question = customPrompt || tutorQuery;
    if (!question.trim() || tutorLoading) return;

    const userMessage = question.trim();
    setTutorHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setTutorQuery('');
    setTutorLoading(true);

    try {
      const res = await fetch('/api/ai/training-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          moduleTitle: module.title,
          lessonTitle: currentLesson?.title,
          context: `Module: ${module.title}. Leçon: ${currentLesson?.title}. Public cible: ${module.targetAudience}.`
        })
      });

      if (!res.ok) throw new Error('Erreur réseau');
      const data: TutorResponse = await res.json();
      setTutorHistory(prev => [
        ...prev,
        {
          sender: 'tutor',
          text: data.answer,
          details: data
        }
      ]);
    } catch (err) {
      setTutorHistory(prev => [
        ...prev,
        {
          sender: 'tutor',
          text: "Je n'ai pas pu joindre le serveur à l'instant, mais souvenez-vous : à Kinshasa, la clé de la salubrité repose sur la séparation à la source et le respect des consignes de la REGEDEK !"
        }
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  // Progress percentage
  const completedLessonsInModule = module.lessons.filter(l => completedLessons.includes(l.id)).length;
  const progressPercent = Math.round((completedLessonsInModule / module.lessons.length) * 100);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
      {/* Top Banner Navigation */}
      <div className={`bg-gradient-to-r ${module.bannerGradient} text-white rounded-3xl p-6 shadow-xl relative overflow-hidden`}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold backdrop-blur transition border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour aux Formations</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur">
              {module.code}
            </span>
            <span className="px-2.5 py-1 bg-amber-400 text-amber-950 rounded-full text-[10px] font-bold uppercase">
              {module.level}
            </span>
          </div>
        </div>

        <div className="max-w-3xl">
          <span className="text-xs font-medium text-emerald-200 uppercase tracking-wider">
            {module.category} • Public : {module.targetAudience}
          </span>
          <h1 className="text-lg sm:text-2xl font-black text-white mt-1 mb-2 leading-tight">
            {module.title}
          </h1>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-2xl">
            {module.shortDescription}
          </p>
        </div>

        {/* Progress Bar inside banner */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-36 sm:w-48 bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-semibold text-white/90">
              {completedLessonsInModule} / {module.lessons.length} leçons ({progressPercent}%)
            </span>
          </div>
          <span className="text-emerald-200 text-[11px]">
            Durée totale estimée : {module.durationTotal}
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-1.5 sm:space-x-2 bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => setViewMode('lesson')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 ${
            viewMode === 'lesson' ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Cours & Leçons ({module.lessons.length})</span>
        </button>

        <button
          onClick={() => setViewMode('quiz')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 ${
            viewMode === 'quiz' ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-600" />
          <span>Évaluation & Certificat ({module.quiz.length} QCM)</span>
        </button>

        <button
          onClick={() => setViewMode('tutor')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2 ${
            viewMode === 'tutor' ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Tuteur IA REGEDEK</span>
        </button>
      </div>

      {/* VIEW MODE 1: LESSON CONTENT */}
      {viewMode === 'lesson' && currentLesson && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar / Lesson Navigation List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              Sommaire des Leçons
            </h3>
            <div className="space-y-2">
              {module.lessons.map((lesson, idx) => {
                const active = idx === activeLessonIndex;
                const completed = completedLessons.includes(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setActiveLessonIndex(idx);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start space-x-3 ${
                      active
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-sm'
                        : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                      completed
                        ? 'bg-emerald-600 text-white'
                        : active
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-tight line-clamp-2">
                        {lesson.title}
                      </p>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {lesson.duration}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Switch to Quiz Card */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl text-xs space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-bold">
                <Award className="w-4 h-4 text-amber-700" />
                <span>Certification Officielle</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Validez le quiz de {module.quiz.length} questions avec au moins {module.passingScorePercent}% pour obtenir votre attestation officielle.
              </p>
              <button
                onClick={() => setViewMode('quiz')}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-center text-xs transition"
              >
                Passer au Quiz
              </button>
            </div>
          </div>

          {/* Main Lesson Body */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Lesson Header */}
              <div className="border-b border-gray-100 pb-5">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="font-bold text-emerald-700 uppercase tracking-wider">
                    Leçon {activeLessonIndex + 1} sur {module.lessons.length}
                  </span>
                  <span className="flex items-center space-x-1 text-gray-400">
                    <span>Durée estimée :</span>
                    <strong className="text-gray-700">{currentLesson.duration}</strong>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                  {currentLesson.title}
                </h2>
              </div>

              {/* Summary Callout */}
              <div className="bg-emerald-50/70 border-l-4 border-emerald-600 p-4 rounded-r-2xl text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                💡 <span className="font-bold">Résumé d'apprentissage :</span> {currentLesson.summary}
              </div>

              {/* Lesson Paragraphs */}
              <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
                {currentLesson.contentParagraphs.map((para, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Field Case Study Kinshasa Card */}
              {currentLesson.kinshasaFieldStudy && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden space-y-3">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <MapPin className="w-4 h-4" />
                    <span>Cas Pratique Réel à Kinshasa</span>
                    <span>•</span>
                    <span className="text-white/80 font-normal">{currentLesson.kinshasaFieldStudy.location}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-300">Contexte / Problématique : </span>
                      <span className="text-slate-200">{currentLesson.kinshasaFieldStudy.context}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-800">
                      <span className="font-bold text-emerald-400">Solution Opérationnelle Appliquée : </span>
                      <span className="text-emerald-100">{currentLesson.kinshasaFieldStudy.solution}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Points Clés à Retenir</span>
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {currentLesson.keyTakeaways.map((takeaway, tIdx) => (
                    <div key={tIdx} className="bg-amber-50/60 border border-amber-200/60 p-3.5 rounded-xl text-xs text-amber-950 flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span className="font-medium leading-normal">{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Field Checklist */}
              {currentLesson.practicalChecklist && currentLesson.practicalChecklist.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                    <span>Checklist Pratique de Terrain (Cochez au fur et à mesure)</span>
                  </h4>
                  <div className="space-y-2">
                    {currentLesson.practicalChecklist.map((item, cIdx) => {
                      const checkKey = `${currentLesson.id}-check-${cIdx}`;
                      const isChecked = !!checkedItems[checkKey];
                      return (
                        <div
                          key={cIdx}
                          onClick={() => toggleCheck(checkKey)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 line-through opacity-80'
                              : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                          }`}
                        >
                          <span className="font-medium">{item}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheck(checkKey)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 ml-3"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Lesson Navigation Controls */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  onClick={handlePrevLesson}
                  disabled={activeLessonIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center space-x-1.5"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>Leçon Précédente</span>
                </button>

                <button
                  onClick={handleNextLesson}
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center space-x-2"
                >
                  <span>
                    {activeLessonIndex < module.lessons.length - 1
                      ? "Leçon Suivante"
                      : "Passer à l'Évaluation Finale"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: QUIZ & CERTIFICATE */}
      {viewMode === 'quiz' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Validation des Compétences
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                Évaluation Officielle : {module.title}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Répondez à l'ensemble des questions. Un score minimal de <strong>{module.passingScorePercent}%</strong> est requis pour débloquer votre attestation REGEDEK nominative.
              </p>
            </div>

            {/* Learner Name input field */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-gray-800">Nom sur le certificat officiel :</span>
              </div>
              <div className="font-bold text-emerald-950 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                {learnerName || "Citoyen Éco-Responsable"}
              </div>
            </div>

            {/* Quiz Questions List */}
            <div className="space-y-6">
              {module.quiz.map((q, qIdx) => {
                const answeredOption = selectedAnswers[qIdx];
                const isSelected = answeredOption !== undefined;

                return (
                  <div key={q.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Question {qIdx + 1} sur {module.quiz.length}
                      </span>
                      {quizSubmitted && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          answeredOption === q.correctIndex
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {answeredOption === q.correctIndex ? 'Correct (+1)' : 'Incorrect'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                      {q.question}
                    </h3>

                    <div className="space-y-2 pt-1">
                      {q.options.map((option, oIdx) => {
                        let btnStyle = "bg-white border-gray-200 text-gray-700 hover:bg-gray-50";

                        if (quizSubmitted) {
                          if (oIdx === q.correctIndex) {
                            btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold";
                          } else if (answeredOption === oIdx) {
                            btnStyle = "bg-red-50 border-red-500 text-red-950";
                          } else {
                            btnStyle = "bg-gray-50 border-gray-200 text-gray-400 opacity-60";
                          }
                        } else if (answeredOption === oIdx) {
                          btnStyle = "bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-2 ring-emerald-400/20";
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                            disabled={quizSubmitted}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{option}</span>
                            {quizSubmitted && oIdx === q.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation after submission */}
                    {quizSubmitted && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
                        <strong>Explication : </strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit / Result Section */}
            {!quizSubmitted ? (
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {Object.keys(selectedAnswers).length} / {module.quiz.length} questions répondues
                </span>
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length < module.quiz.length}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Valider mes Réponses
                </button>
              </div>
            ) : (
              <div className="pt-6 border-t border-gray-100 space-y-4 text-center">
                {quizScore >= module.passingScorePercent ? (
                  <div className="p-6 bg-gradient-to-b from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Award className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-emerald-950">
                      Félicitations ! Examen Réussi avec {quizScore}%
                    </h3>
                    <p className="text-xs text-emerald-900 max-w-md mx-auto leading-relaxed">
                      Vous avez atteint et dépassé le seuil d'admissibilité ({module.passingScorePercent}%). Votre attestation officielle de formation REGEDEK a été générée.
                    </p>
                    <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          const cert: TrainingCertificate = {
                            id: `CERT-${Date.now().toString().slice(-6)}`,
                            moduleId: module.id,
                            moduleTitle: module.title,
                            code: module.code,
                            learnerName: learnerName.trim() || 'Citoyen Éco-Responsable',
                            issueDate: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
                            scorePercent: quizScore,
                            certificateNumber: `REGEDEK-${module.code}-${Date.now().toString().slice(-6)}`
                          };
                          onOpenCertificate(cert);
                        }}
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
                      >
                        <Award className="w-4 h-4" />
                        <span>Voir & Imprimer mon Certificat</span>
                      </button>

                      <button
                        onClick={handleResetQuiz}
                        className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium rounded-xl transition"
                      >
                        Repasser le Quiz
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-red-50 border border-red-200 rounded-2xl space-y-3">
                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-red-950">
                      Score : {quizScore}% (Seuil requis : {module.passingScorePercent}%)
                    </h3>
                    <p className="text-xs text-red-800 max-w-md mx-auto leading-relaxed">
                      Vous n'avez pas encore atteint le seuil minimum. Révisez les leçons du module et retentez votre chance pour décrocher votre certificat officiel !
                    </p>
                    <div className="pt-2 flex items-center justify-center space-x-3">
                      <button
                        onClick={() => setViewMode('lesson')}
                        className="px-4 py-2 bg-white border border-red-300 text-red-900 font-bold text-xs rounded-xl hover:bg-red-50 transition"
                      >
                        Relire les Leçons
                      </button>
                      <button
                        onClick={handleResetQuiz}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition"
                      >
                        Recommencer le Test
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: AI TUTOR (GEMINI) */}
      {viewMode === 'tutor' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2 text-purple-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Assistance Pédagogique Intelligente</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 mt-1">
                Tuteur Pédagogique REGEDEK (IA)
              </h2>
              <p className="text-xs text-gray-500">
                Posez vos questions techniques, juridiques ou de terrain à notre tuteur environnemental certifié pour Kinshasa.
              </p>
            </div>

            {/* Pre-suggested quick prompt chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "Comment démarrer un compost sans odeur ?",
                "Quelle différence entre plastique PET et PEHD ?",
                "Quels sont les EPI obligatoires pour curer un dalot ?",
                "Quelles sont les sanctions légales pour jet d'ordures ?",
                "Comment fabriquer des pavés avec du sable et plastique ?"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskTutor(chip)}
                  disabled={tutorLoading}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-purple-50 hover:text-purple-900 border border-gray-200 text-gray-700 text-[11px] rounded-full transition text-left"
                >
                  💡 {chip}
                </button>
              ))}
            </div>

            {/* Chat History Box */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 min-h-[300px] max-h-[480px] overflow-y-auto space-y-4">
              {tutorHistory.map((item, idx) => {
                const isTutor = item.sender === 'tutor';
                return (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 ${isTutor ? '' : 'flex-row-reverse space-x-reverse'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isTutor ? 'bg-purple-600 text-white' : 'bg-emerald-700 text-white'
                    }`}>
                      {isTutor ? <Sparkles className="w-4 h-4" /> : 'Moi'}
                    </div>

                    <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isTutor
                        ? 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                        : 'bg-emerald-800 text-white'
                    }`}>
                      <p className="whitespace-pre-line">{item.text}</p>

                      {/* Structured Details if provided */}
                      {item.details && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs">
                          {item.details.practicalAdvice && (
                            <div className="bg-emerald-50 text-emerald-950 p-2.5 rounded-xl border border-emerald-200">
                              <strong>Conseil Terrain Kinshasa :</strong> {item.details.practicalAdvice}
                            </div>
                          )}
                          {item.details.keyReference && (
                            <div className="text-[11px] text-gray-500 italic">
                              📚 Référence : {item.details.keyReference}
                            </div>
                          )}
                          {item.details.followUpSuggestion && (
                            <div className="text-[11px] text-purple-700 font-medium">
                              🔍 Pour approfondir : {item.details.followUpSuggestion}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {tutorLoading && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-3 text-xs text-gray-500 flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce delay-200" />
                    <span>Le Tuteur REGEDEK prépare votre réponse...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tutorQuery}
                onChange={(e) => setTutorQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskTutor();
                }}
                placeholder="Posez votre question sur cette formation..."
                className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => handleAskTutor()}
                disabled={!tutorQuery.trim() || tutorLoading}
                className="px-5 py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs transition flex items-center space-x-1.5 shadow-sm"
              >
                <span>Envoyer</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
