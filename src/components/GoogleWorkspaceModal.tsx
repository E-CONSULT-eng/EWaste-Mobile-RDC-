import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  HardDrive, 
  CheckCircle2, 
  ExternalLink, 
  UploadCloud, 
  RefreshCw, 
  LogOut, 
  AlertCircle,
  X,
  FileText,
  Clock,
  Send,
  Sparkles,
  MapPin,
  Truck,
  GraduationCap,
  Activity,
  Layers,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, logout, getCachedAccessToken } from '../firebase';
import { 
  createEwasteFullDatabase,
  getLinkedSpreadsheet,
  getSyncStats,
  syncAllLocalDataToGoogleSheet,
  sendActionToGoogleAppsScript,
  LinkedSpreadsheet,
  EwasteSyncStats,
  DEFAULT_APPS_SCRIPT_URL,
  OFFICIAL_ADMIN_EMAIL,
  shareSpreadsheetWithAdmin
} from '../utils/googleSheets';
import { 
  uploadFileToDrive, 
  listDriveBackupFiles, 
  DriveFileItem 
} from '../utils/googleDrive';
import { Signalement, AssainissementMission, EvaluationEnv } from '../types';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  signalements: Signalement[];
  missions: AssainissementMission[];
  evaluations?: EvaluationEnv[];
  user: User | null;
  onUserChanged: (user: User | null, token: string | null) => void;
}

export function GoogleWorkspaceModal({
  isOpen,
  onClose,
  signalements,
  missions,
  evaluations = [],
  user,
  onUserChanged
}: GoogleWorkspaceModalProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sheets state
  const [isCreatingDb, setIsCreatingDb] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [linkedSheet, setLinkedSheet] = useState<LinkedSpreadsheet | null>(() => getLinkedSpreadsheet());
  const [syncStats, setSyncStats] = useState<EwasteSyncStats>(() => getSyncStats());
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Drive state
  const [isBackingUpDrive, setIsBackingUpDrive] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveStatus, setDriveStatus] = useState<string | null>(null);

  const token = getCachedAccessToken();

  useEffect(() => {
    if (isOpen) {
      setLinkedSheet(getLinkedSpreadsheet());
      setSyncStats(getSyncStats());
      if (token) {
        loadDriveFiles();
      }
    }
  }, [isOpen, token]);

  // Listen for sync updates
  useEffect(() => {
    const handleStatsUpdate = (e: any) => {
      setSyncStats(e.detail);
    };
    const handleSheetLinked = (e: any) => {
      setLinkedSheet(e.detail);
    };

    window.addEventListener('ewaste_sync_stats_updated', handleStatsUpdate);
    window.addEventListener('ewaste_spreadsheet_linked', handleSheetLinked);

    return () => {
      window.removeEventListener('ewaste_sync_stats_updated', handleStatsUpdate);
      window.removeEventListener('ewaste_spreadsheet_linked', handleSheetLinked);
    };
  }, []);

  const loadDriveFiles = async () => {
    try {
      const files = await listDriveBackupFiles();
      setDriveFiles(files);
    } catch (e) {
      console.warn("Impossible de charger les fichiers Drive:", e);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onUserChanged(res.user, res.accessToken);
        await loadDriveFiles();

        // Auto-créer ou lier la base complète si aucune n'est active
        if (!getLinkedSpreadsheet()) {
          setIsCreatingDb(true);
          try {
            const newDb = await createEwasteFullDatabase(undefined, res.accessToken);
            setLinkedSheet(newDb as any);
            setFeedbackMessage("Base de données Google Sheets complète initialisée avec succès !");
          } catch (createErr: any) {
            console.warn("Notice création base automatique:", createErr);
          } finally {
            setIsCreatingDb(false);
          }
        }
      }
    } catch (err: any) {
      console.error("Erreur de connexion Google:", err);
      setAuthError(err?.message || "Échec de l'authentification Google.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onUserChanged(null, null);
      setDriveFiles([]);
    } catch (e) {
      console.error("Erreur déconnexion:", e);
    }
  };

  const handleCreateDatabase = async () => {
    if (!token) {
      await handleGoogleSignIn();
      return;
    }

    const confirmed = window.confirm(
      "Créer une nouvelle base de données Google Sheets complète (avec 6 onglets : Signalements, Scanner IA, Suivi Assainissement, ÉIES, Rapports Formation, Journal d'Activités) ?"
    );
    if (!confirmed) return;

    setIsCreatingDb(true);
    setAuthError(null);
    setFeedbackMessage(null);
    try {
      const created = await createEwasteFullDatabase(undefined, token);
      setLinkedSheet(created as any);
      setFeedbackMessage(`Base Google Sheets créée avec succès !`);
    } catch (err: any) {
      console.error("Erreur création base Google Sheets:", err);
      setAuthError(err?.message || "Erreur lors de la création de la base de données.");
    } finally {
      setIsCreatingDb(false);
    }
  };

  const handleSyncAllData = async () => {
    if (!token) {
      await handleGoogleSignIn();
      return;
    }

    const totalCount = signalements.length + missions.length + evaluations.length;
    const confirmed = window.confirm(
      `Confirmez-vous l'export de l'ensemble des données locales (${totalCount} éléments) vers votre base Google Sheets ?`
    );
    if (!confirmed) return;

    setIsSyncingAll(true);
    setAuthError(null);
    setFeedbackMessage(null);
    try {
      const result = await syncAllLocalDataToGoogleSheet({
        signalements,
        missions,
        evaluations,
        accessToken: token
      });
      setFeedbackMessage(`${result.totalExported} enregistrements synchronisés dans la base Google Sheets !`);
      setSyncStats(getSyncStats());
    } catch (err: any) {
      console.error("Erreur synchronisation globale:", err);
      setAuthError(err?.message || "Erreur lors de la synchronisation des données.");
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleBackupToGoogleDrive = async () => {
    if (!token) {
      await handleGoogleSignIn();
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous exporter l'archive de sauvegarde JSON dans votre Google Drive ?`
    );
    if (!confirmed) return;

    setIsBackingUpDrive(true);
    setDriveStatus(null);
    try {
      const backupPayload = {
        app: "EWaste Mobile RDC (ewastemobile.ai.studio)",
        portal: "https://ewastemobile.ai.studio",
        version: "2.5.0",
        exportDate: new Date().toISOString(),
        provincesCount: 26,
        signalements,
        missions,
        evaluations,
      };

      const res = await uploadFileToDrive(
        `EWaste_Mobile_RDC_Backup_${new Date().toISOString().split('T')[0]}.json`,
        JSON.stringify(backupPayload, null, 2),
        token
      );

      setDriveStatus(`Sauvegarde archivée dans Google Drive : ${res.name}`);
      await loadDriveFiles();
    } catch (err: any) {
      console.error("Erreur sauvegarde Drive:", err);
      setDriveStatus(`Erreur : ${err?.message || 'Échec téléversement Drive'}`);
    } finally {
      setIsBackingUpDrive(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      setFeedbackMessage("Test du webhook de secours en cours...");
      const res = await sendActionToGoogleAppsScript('AI_SCAN', {
        test: true,
        message: "Test de connectivité temps réel EWaste Mobile (ewastemobile.ai.studio)",
        date: new Date().toISOString()
      });
      setFeedbackMessage(res.responseText || "Webhook testé avec succès !");
    } catch (e: any) {
      setFeedbackMessage("Erreur test webhook : " + e.message);
    }
  };

  const [isSharingAdmin, setIsSharingAdmin] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleShareWithAdmin = async () => {
    if (!linkedSheet?.id) {
      setFeedbackMessage("Aucune feuille active à lier. Veuillez initialiser la base.");
      return;
    }
    setIsSharingAdmin(true);
    try {
      const res = await shareSpreadsheetWithAdmin(linkedSheet.id, token);
      setFeedbackMessage(res.message || `Liaison effectuée avec ${OFFICIAL_ADMIN_EMAIL}`);
    } catch (err: any) {
      setFeedbackMessage(`Notice liaison : ${err?.message || 'Erreur lors du partage'}`);
    } finally {
      setIsSharingAdmin(false);
    }
  };

  const handleCopyEmail = () => {
    try {
      navigator.clipboard.writeText(OFFICIAL_ADMIN_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (_) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Base de Données Google Sheets & Drive</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Temps Réel
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Suivi continu et synchronisation instantanée des activités de l'application
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error / Alert Display */}
        {authError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-3.5 text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">{authError}</div>
          </div>
        )}

        {/* Success / Feedback Display */}
        {feedbackMessage && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{feedbackMessage}</span>
            </div>
            <button onClick={() => setFeedbackMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        {/* Google Account Authentication Section */}
        <div className="mt-4 bg-gray-50/80 rounded-2xl p-3.5 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-full border border-gray-300" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'EW'}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-900">
                  {user?.displayName || (user ? 'Compte Google Connecté' : 'Non connecté')}
                </span>
                {user && (
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    OAuth Actif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                {user?.email || 'Connectez votre compte pour piloter la feuille Google Sheets'}
              </p>
            </div>
          </div>

          {user ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto transition"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500" />
              <span>Déconnexion</span>
            </button>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold px-3.5 py-2 rounded-xl text-xs shadow-xs flex items-center space-x-2 transition self-start sm:self-auto"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isAuthenticating ? 'Connexion en cours...' : 'Se connecter avec Google'}</span>
            </button>
          )}
        </div>

        {/* Linked Google Spreadsheet Primary Card */}
        <div className="mt-4 bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-4 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
                  Base de Données Google Sheets Active
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                {linkedSheet?.title || "EWaste Mobile RDC - Base de Données Nationale (Temps Réel)"}
              </h3>
              <p className="text-[11px] text-emerald-100/80 mt-0.5">
                {linkedSheet ? '🟢 Synchronisation continue activée' : '⚠️ Créez ou liez la base pour activer l’écriture directe'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {linkedSheet?.url && (
                <a
                  href={linkedSheet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <span>Ouvrir Google Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                onClick={handleCreateDatabase}
                disabled={isCreatingDb}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCreatingDb ? 'animate-spin' : ''}`} />
                <span>{isCreatingDb ? 'Création...' : linkedSheet ? 'Recréer la base' : 'Initialiser la base'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Liaison Officielle avec environnementplusrdc@gmail.com */}
        <div className="mt-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-900">Compte Central Lié :</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full border border-emerald-300">
                  ENVIRONNEMENT-PLUS & REGEDEK
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-xs font-mono font-bold text-emerald-900">{OFFICIAL_ADMIN_EMAIL}</span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-0.5 text-gray-500 hover:text-emerald-800 transition"
                  title="Copier l'email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                Toutes les entrées (taxes, signalements, audits ÉIES, scans IA) sont synchronisées avec ce compte Google Workspace.
              </p>
            </div>
          </div>

          <button
            onClick={handleShareWithAdmin}
            disabled={isSharingAdmin}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center space-x-1.5 self-start sm:self-auto shrink-0"
          >
            <Send className="w-3 h-3" />
            <span>{isSharingAdmin ? 'Partage en cours...' : 'Partager les accès'}</span>
          </button>
        </div>

        {/* The 5 Real-Time Data Streams Dashboard */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span>Les 5 Flux de Données Synchronisés en Direct</span>
            </h4>
            <span className="text-[11px] text-gray-500">
              Dernière synchro: <strong className="text-gray-800">{syncStats.lastSyncTime}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* Stream 1: Scanner IA */}
            <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Scanner IA</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded-full">
                    Onglet: Scanner_IA
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  Détection des matières, recyclabilité, couleur bac & conseils locaux RDC.
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Scans synchronisés:</span>
                <span className="font-bold text-emerald-800">{syncStats.scansCount}</span>
              </div>
            </div>

            {/* Stream 2: Signalement Dépotoirs */}
            <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>Signalements Citoyens</span>
                  </div>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded-full">
                    Onglet: Signalements
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  Communes, quartiers, GPS, photos, gravité et estimation du tonnage.
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Signalements reçus:</span>
                <span className="font-bold text-amber-800">{syncStats.signalementsCount || signalements.length}</span>
              </div>
            </div>

            {/* Stream 3: Suivi Assainissement */}
            <div className="bg-blue-50/60 border border-blue-200/70 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs">
                    <Truck className="w-3.5 h-3.5 text-blue-700" />
                    <span>Suivi Assainissement</span>
                  </div>
                  <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-1.5 py-0.5 rounded-full">
                    Onglet: Suivi_Assainissement
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  Déploiement des brigades, évacuation des sites, tonnes ramassées.
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Missions traitées:</span>
                <span className="font-bold text-blue-800">{syncStats.assainissementCount || missions.length}</span>
              </div>
            </div>

            {/* Stream 4: ÉIES Environnementale */}
            <div className="bg-purple-50/60 border border-purple-200/70 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-purple-900 font-bold text-xs">
                    <Layers className="w-3.5 h-3.5 text-purple-700" />
                    <span>ÉIES & Salubrité</span>
                  </div>
                  <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-1.5 py-0.5 rounded-full">
                    Onglet: EIES_Environnementale
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  Scores salubrité/drainage, conformité ACE, matrice d'impacts et PGES.
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-purple-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Études & Audits:</span>
                <span className="font-bold text-purple-800">{syncStats.eiesCount || evaluations.length}</span>
              </div>
            </div>

            {/* Stream 5: Formations & Quiz */}
            <div className="bg-teal-50/60 border border-teal-200/70 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-teal-900 font-bold text-xs">
                    <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
                    <span>Rapports Formation</span>
                  </div>
                  <span className="text-[10px] bg-teal-200 text-teal-900 font-bold px-1.5 py-0.5 rounded-full">
                    Onglet: Rapports_Formation
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  Quiz écocitoyen, scores aux modules, certificats et points verts.
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-teal-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Sessions validées:</span>
                <span className="font-bold text-teal-800">{syncStats.formationsCount}</span>
              </div>
            </div>

            {/* Stream 6: Journal d'Audit */}
            <div className="bg-gray-100/80 border border-gray-200 rounded-xl p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-gray-900 font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-gray-700" />
                    <span>Audit & Activités</span>
                  </div>
                  <span className="text-[10px] bg-gray-300 text-gray-800 font-bold px-1.5 py-0.5 rounded-full">
                    Onglet: Journal_Activites
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1">
                  Horodatage de toutes les actions, mises à jour de statut et interactions.
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Actions totales:</span>
                <span className="font-bold text-gray-900">{syncStats.totalActivitiesCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Synchronization Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncAllData}
              disabled={isSyncingAll}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <UploadCloud className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Synchronisation...' : 'Synchroniser tout le contenu vers Sheets'}</span>
            </button>

            <button
              onClick={handleBackupToGoogleDrive}
              disabled={isBackingUpDrive}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <HardDrive className={`w-3.5 h-3.5 ${isBackingUpDrive ? 'animate-spin' : ''}`} />
              <span>{isBackingUpDrive ? 'Archivage...' : 'Archiver JSON sur Drive'}</span>
            </button>

            <button
              onClick={handleTestWebhook}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center space-x-1"
              title="Tester le webhook universel Google Apps Script"
            >
              <Send className="w-3.5 h-3.5 text-gray-500" />
              <span>Test Webhook</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Fermer
          </button>
        </div>

        {/* Drive Backup Status message if any */}
        {driveStatus && (
          <p className="text-[11px] text-blue-800 font-medium mt-3 bg-blue-50 p-2 rounded-xl border border-blue-200 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{driveStatus}</span>
          </p>
        )}

      </div>
    </div>
  );
}
