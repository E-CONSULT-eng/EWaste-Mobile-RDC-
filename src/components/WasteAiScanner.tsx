import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  FlipHorizontal, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Recycle, 
  Info, 
  ArrowRight, 
  Lightbulb, 
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  CameraOff
} from 'lucide-react';
import { WasteAiAnalysisResult } from '../types';
import { logScanAiToSheet } from '../utils/googleSheets';

interface WasteAiScannerProps {
  onNavigateToGuide?: () => void;
  onNavigateToSignal?: () => void;
  onActionRecorded?: (actionType: string, details: string) => void;
}

// Sample test presets to try instantly
const SAMPLE_PRESETS = [
  {
    name: "Bouteille Plastique",
    category: "Plastique",
    hint: "Bouteille plastique PET eau",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Épluchures / Organique",
    category: "Organique",
    hint: "Épluchures de fruits et légumes manioc",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Canette Métallique",
    category: "Métal",
    hint: "Canette en aluminium boisson",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Piles Électriques",
    category: "Dangereux",
    hint: "Piles électriques alcalines usagées",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=600",
  }
];

export function WasteAiScanner({ onNavigateToGuide, onNavigateToSignal, onActionRecorded }: WasteAiScannerProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<WasteAiAnalysisResult | null>(null);
  const [history, setHistory] = useState<WasteAiAnalysisResult[]>(() => {
    try {
      const stored = localStorage.getItem('waste_ai_scan_history');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream
  const startCamera = useCallback(async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès à la caméra n'est pas supporté par ce navigateur.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("Camera init error:", err);
      setCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError("Autorisation de la caméra refusée. Veuillez autoriser l'accès pour scanner.");
      } else {
        setCameraError("Impossible d'activer la caméra. Vous pouvez utiliser le téléversement de photo ou les modèles d'essai.");
      }
    }
  }, [facingMode, stream]);

  // Stop camera when unmounted or paused
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  // Start camera on mount
  useEffect(() => {
    startCamera('environment');
    return () => {
      stopCamera();
    };
  }, []);

  // Bind stream to video ref if it becomes available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraActive]);

  // Toggle front/rear camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Run AI analysis on a base64 image
  const analyzeImage = async (base64Data: string, wasteHint?: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/ai/classify-waste-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          wasteHint: wasteHint || ''
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data: WasteAiAnalysisResult = await response.json();
      setAnalysisResult(data);

      // Trigger automatic confirmation code & database registration
      onActionRecorded?.('SCAN_DECHET', `Scan IA: ${data.wasteName} (${data.category}) - ${data.recyclability}`);

      // Instant synchronization of AI Scan result to Google Sheets
      logScanAiToSheet(data, 'Kinshasa (RDC)', 'Citoyen Mobile').catch((err) => {
        console.warn("Notice sync Google Sheets scan IA:", err);
      });

      // Save to local scan history
      setHistory(prev => {
        const updated = [data, ...prev.slice(0, 9)];
        try {
          localStorage.setItem('waste_ai_scan_history', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    } catch (err) {
      console.error("Analysis request failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Capture snapshot from live video
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      analyzeImage(dataUrl);
    }
  };

  // Upload photo from device storage
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      stopCamera();
      analyzeImage(result, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Pick sample preset for instant testing
  const handleSelectPreset = async (preset: typeof SAMPLE_PRESETS[0]) => {
    setCapturedImage(preset.image);
    stopCamera();
    setIsAnalyzing(true);

    // Fetch the sample image and convert to base64
    try {
      const res = await fetch(preset.image);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        analyzeImage(base64, preset.hint);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      // Direct call with hint fallback
      analyzeImage(preset.image, preset.hint);
    }
  };

  // Reset and restart scanner
  const handleResetScanner = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    startCamera(facingMode);
  };

  // Visual styling based on bin color
  const getBinStyle = (color?: string) => {
    const c = (color || '').toLowerCase();
    if (c.includes('jaune')) {
      return {
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        bg: 'bg-amber-500',
        banner: 'bg-amber-50 text-amber-900 border-amber-200',
        accentText: 'text-amber-700',
        dot: 'bg-amber-500'
      };
    } else if (c.includes('vert')) {
      return {
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        bg: 'bg-emerald-600',
        banner: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        accentText: 'text-emerald-700',
        dot: 'bg-emerald-500'
      };
    } else if (c.includes('bleu')) {
      return {
        badge: 'bg-blue-100 text-blue-900 border-blue-300',
        bg: 'bg-blue-600',
        banner: 'bg-blue-50 text-blue-900 border-blue-200',
        accentText: 'text-blue-700',
        dot: 'bg-blue-500'
      };
    } else if (c.includes('rouge')) {
      return {
        badge: 'bg-red-100 text-red-900 border-red-300',
        bg: 'bg-red-600',
        banner: 'bg-red-50 text-red-900 border-red-200',
        accentText: 'text-red-700',
        dot: 'bg-red-500'
      };
    }
    return {
      badge: 'bg-gray-100 text-gray-900 border-gray-300',
      bg: 'bg-gray-600',
      banner: 'bg-gray-50 text-gray-900 border-gray-200',
      accentText: 'text-gray-700',
      dot: 'bg-gray-500'
    };
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input & canvas */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Vision IA Multimodale Gemini 3.8 Flash</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Analyseur de déchets par Caméra & IA
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              Pointez la caméra de votre téléphone vers un objet ou téléversez une photo. Notre IA identifie instantanément sa matière, son bac de tri officiel Ets ENVIRONNEMENT-PLUS et sa filière locale de recyclage à Kinshasa.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateToGuide && (
              <button
                onClick={onNavigateToGuide}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <Recycle className="w-4 h-4 text-emerald-300" />
                <span>Guide complet du tri</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left / Top: Camera Viewport or Captured Image */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gray-950 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center">
            
            {/* 1. Captured or Preset Image */}
            {capturedImage ? (
              <div className="relative w-full h-full">
                <img
                  src={capturedImage}
                  alt="Déchet scanné"
                  className="w-full h-full object-cover"
                />

                {/* Scanning Laser Animation Overlay during AI processing */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-0 animate-[bounce_2s_infinite] shadow-[0_0_15px_#10b981]"></div>
                    <div className="bg-gray-900/90 border border-emerald-500/50 rounded-2xl p-4 shadow-2xl flex flex-col items-center text-center space-y-3 max-w-xs">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center animate-spin">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Analyse Gemini en cours...</h3>
                        <p className="text-xs text-gray-300 mt-1">Identification des polymères, biodégradabilité et filière Ets ENVIRONNEMENT-PLUS</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Retake Button overlay */}
                {!isAnalyzing && (
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
                    <button
                      onClick={handleResetScanner}
                      className="bg-gray-900/90 hover:bg-gray-900 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-bold border border-white/20 shadow-lg flex items-center space-x-2 transition"
                    >
                      <RefreshCw className="w-4 h-4 text-emerald-400" />
                      <span>Reprendre une photo</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-md px-3.5 py-2.5 rounded-2xl text-xs font-bold shadow-lg flex items-center space-x-1.5 transition"
                    >
                      <Upload className="w-4 h-4 text-gray-700" />
                      <span>Changer</span>
                    </button>
                  </div>
                )}
              </div>
            ) : cameraActive ? (
              /* 2. Live Camera View */
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Target Reticle / Viseur */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                  <div className="w-64 h-64 border-2 border-emerald-400/50 rounded-3xl relative flex items-center justify-center">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl -mb-1 -mr-1"></div>
                    
                    <div className="text-center px-4">
                      <span className="text-[11px] font-semibold text-white/90 bg-gray-950/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 shadow">
                        Centrez le déchet à identifier
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Camera Controls */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                  <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Caméra active</span>
                  </span>

                  <button
                    onClick={toggleFacingMode}
                    className="p-2.5 rounded-full bg-gray-900/80 hover:bg-gray-900 text-white backdrop-blur-md border border-white/20 transition shadow"
                    title="Changer de caméra"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Shutter Action Bar */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-6 pointer-events-auto">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-full bg-gray-900/80 hover:bg-gray-900 text-white backdrop-blur-md border border-white/20 transition shadow"
                    title="Importer une photo depuis la galerie"
                  >
                    <Upload className="w-5 h-5" />
                  </button>

                  {/* Main Shutter Button */}
                  <button
                    onClick={captureSnapshot}
                    className="w-16 h-16 rounded-full bg-white p-1 shadow-2xl hover:scale-105 active:scale-95 transition flex items-center justify-center group"
                    title="Prendre la photo pour analyse IA"
                  >
                    <div className="w-full h-full rounded-full border-4 border-emerald-600 bg-white flex items-center justify-center group-hover:bg-emerald-50 transition">
                      <Camera className="w-6 h-6 text-emerald-700" />
                    </div>
                  </button>

                  <button
                    onClick={stopCamera}
                    className="p-3 rounded-full bg-gray-900/80 hover:bg-gray-900 text-white backdrop-blur-md border border-white/20 transition shadow"
                    title="Désactiver la caméra"
                  >
                    <CameraOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              /* 3. Camera Disabled / Error State */
              <div className="p-8 text-center text-gray-300 max-w-sm space-y-4">
                <div className="w-14 h-14 bg-gray-900 rounded-3xl border border-gray-800 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Caméra en veille ou indisponible</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {cameraError || "Activez votre caméra pour scanner vos déchets en temps réel."}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
                  <button
                    onClick={() => startCamera('environment')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow flex items-center justify-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Démarrer la caméra</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition border border-gray-700 flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Téléverser une photo</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick presets for immediate testing */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Tester instantanément avec des exemples de Kinshasa :</span>
              </span>
              <span className="text-[10px] text-gray-400">1 clic</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className="flex items-center space-x-2 p-2 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-left group"
                >
                  <img
                    src={preset.image}
                    alt={preset.name}
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 group-hover:text-emerald-900 truncate">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">{preset.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right / Bottom: Analysis Results */}
        <div className="lg:col-span-5 space-y-4">
          {isAnalyzing ? (
            <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-md flex flex-col items-center justify-center text-center min-h-[380px] space-y-4 animate-pulse">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">Analyse Gemini 3.8 Flash...</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Reconnaissance visuelle de la matière et des filières kinois en cours.
                </p>
              </div>
            </div>
          ) : analysisResult ? (
            /* Detailed Result Card */
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xl space-y-5 animate-in fade-in duration-300">
              
              {/* Top Result Header */}
              <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Identifié par IA
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500">
                      Confiance: {analysisResult.confidence}%
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-gray-900 leading-tight">
                    {analysisResult.wasteName}
                  </h2>
                </div>

                {/* Recyclability Badge */}
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 shrink-0">
                  {analysisResult.recyclability}
                </span>
              </div>

              {/* Recommended Ets ENVIRONNEMENT-PLUS Bin Banner */}
              {(() => {
                const binStyle = getBinStyle(analysisResult.binColor);
                return (
                  <div className={`p-4 rounded-2xl border ${binStyle.banner} flex items-center space-x-3.5 shadow-sm`}>
                    <div className={`w-12 h-12 rounded-2xl ${binStyle.bg} text-white flex items-center justify-center shrink-0 shadow-md font-black text-xs`}>
                      {analysisResult.binColor}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
                        Destination recommandée
                      </span>
                      <h4 className="text-sm font-black text-gray-900">
                        {analysisResult.binName}
                      </h4>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Catégorie : <strong className="text-gray-900">{analysisResult.category}</strong>
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Sorting Instructions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Consignes de préparation & tri</span>
                </h4>
                <ul className="space-y-1.5">
                  {analysisResult.sortingInstructions.map((inst, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kinshasa Circular Economy & Local Outlet */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Filière locale de valorisation (Kinshasa)</span>
                </span>
                <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                  {analysisResult.localKinshasaOutlets}
                </p>
              </div>

              {/* Impact & Decomposition Facts Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold block flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>Décomposition</span>
                  </span>
                  <p className="font-semibold text-gray-900">{analysisResult.decompositionTime}</p>
                </div>

                <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100 space-y-1">
                  <span className="text-[10px] text-red-700 font-bold block flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span>Impact d'obstruction</span>
                  </span>
                  <p className="font-semibold text-red-950 line-clamp-2">{analysisResult.environmentalImpact}</p>
                </div>
              </div>

              {/* Eco-Citizen Tip */}
              {analysisResult.quickTips && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start space-x-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    {analysisResult.quickTips}
                  </p>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-gray-100">
                <button
                  onClick={handleResetScanner}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow flex items-center justify-center space-x-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scanner un autre objet</span>
                </button>

                {onNavigateToSignal && (
                  <button
                    onClick={onNavigateToSignal}
                    className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center space-x-1"
                    title="Si ce déchet fait partie d'un dépotoir sauvage volumineux"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Signaler un dépotoir</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* Standby Card */
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">En attente d'une prise de vue</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Pointez votre caméra vers un déchet ménager ou utilisez l'un des exemples prédéfinis pour lancer la classification instantanée par Gemini.
                </p>
              </div>

              {/* Guidance reminders */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 border border-gray-100">
                <span className="text-xs font-bold text-gray-800 block">Astuces pour un bon scan :</span>
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Assurez un éclairage suffisant sur l'objet.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Isolez le déchet des arrière-plans trop encombrés.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Fonctionne pour bouteilles, canettes, plastiques, cartons, etc.</span>
                  </div>
                </div>
              </div>

              {/* Scan History preview if any */}
              {history.length > 0 && (
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">Derniers déchets analysés :</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {history.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setAnalysisResult(item)}
                        className="p-2 rounded-xl bg-gray-50 hover:bg-emerald-50/60 border border-gray-100 transition cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="font-semibold text-gray-900 block truncate">{item.wasteName}</span>
                          <span className="text-[10px] text-gray-400">{item.category} • {item.binName}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
