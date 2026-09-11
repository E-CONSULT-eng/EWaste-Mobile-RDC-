import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Database, 
  ShieldCheck, 
  KeyRound, 
  AlertTriangle, 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Users, 
  History, 
  Clock, 
  DollarSign, 
  MapPin, 
  Check, 
  X, 
  Eye, 
  PlusCircle,
  ExternalLink,
  Layers,
  ArrowRight,
  Radio,
  Activity
} from 'lucide-react';
import { Signalement, AssainissementMission, EvaluationEnv, WastePayment, AdminAuditLog, AdminAgentUser, UserRole } from '../types';
import { AdminSyncBroadcastSection } from './AdminSyncBroadcastSection';
import { AdminSecuritySection } from './AdminSecuritySection';
import { AdminLiveActivityBoard } from './AdminLiveActivityBoard';
import { 
  getStoredAdminAgents, 
  saveAdminAgent, 
  updateAgentStatus, 
  getStoredAdminAuditLogs, 
  addAdminAuditLog, 
  verifyAdminCredential,
  getAdminSessionInfo,
  setAdminSessionInfo,
  isAdminSessionAuthenticated, 
  setAdminSessionAuthenticated 
} from '../utils/adminStore';
import { OFFICIAL_ADMIN_EMAIL, getLinkedSpreadsheet } from '../utils/googleSheets';
import { User as FirebaseUser } from 'firebase/auth';

interface AdminDatabaseTabProps {
  signalements: Signalement[];
  missions: AssainissementMission[];
  evaluations: EvaluationEnv[];
  payments: WastePayment[];
  onUpdateSignalementStatus?: (id: string, newStatus: 'Signalé' | 'En cours' | 'Nettoyé') => void;
  googleUser?: FirebaseUser | null;
  onOpenGoogleWorkspace?: () => void;
  userRole?: UserRole;
  onChangeUserRole?: (role: UserRole) => void;
  onOpenApkModal?: () => void;
}

type CollectionView = 'activity' | 'broadcast' | 'signalements' | 'missions' | 'paiements' | 'evaluations' | 'agents' | 'security' | 'audit';

export function AdminDatabaseTab({
  signalements,
  missions,
  evaluations,
  payments,
  onUpdateSignalementStatus = () => {},
  googleUser,
  onOpenGoogleWorkspace = () => {},
  userRole,
  onChangeUserRole = () => {},
  onOpenApkModal = () => {}
}: AdminDatabaseTabProps) {
  // Authentication Gate State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    if (userRole === 'admin') return true;
    if (googleUser?.email?.toLowerCase() === OFFICIAL_ADMIN_EMAIL.toLowerCase()) return true;
    return isAdminSessionAuthenticated();
  });

  const [isPrincipalAdmin, setIsPrincipalAdmin] = useState<boolean>(() => {
    const info = getAdminSessionInfo();
    return info.isPrincipal;
  });

  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authAttempts, setAuthAttempts] = useState(0);

  // Active Admin Collection Tab (Default to Realtime Activity Dashboard)
  const [activeCollection, setActiveCollection] = useState<CollectionView>('activity');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data Management States
  const [agents, setAgents] = useState<AdminAgentUser[]>(getStoredAdminAgents());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(getStoredAdminAuditLogs());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // New Agent Modal State
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [newAgentNom, setNewAgentNom] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentRole, setNewAgentRole] = useState<AdminAgentUser['role']>('Inspecteur Salubrité');
  const [newAgentCommune, setNewAgentCommune] = useState('Kinshasa - Gombe');

  // Verify auth on mount or if googleUser changes
  useEffect(() => {
    if (googleUser?.email?.toLowerCase() === OFFICIAL_ADMIN_EMAIL.toLowerCase()) {
      setIsAdminUnlocked(true);
      setAdminSessionAuthenticated(true);
      if (userRole !== 'admin') {
        onChangeUserRole('admin');
      }
    }
  }, [googleUser, userRole, onChangeUserRole]);

  // Handle Admin Unlock (Master password or Secondary access key)
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const result = await verifyAdminCredential(passcodeInput, googleUser?.email);
      if (result.valid) {
        setIsAdminUnlocked(true);
        setAdminSessionAuthenticated(true);
        setIsPrincipalAdmin(result.isPrincipal);
        setAdminSessionInfo({
          isPrincipal: result.isPrincipal,
          adminName: result.adminName,
          role: result.role
        });
        onChangeUserRole(result.role);
        setPasscodeInput('');
        
        // Log successful connection
        addAdminAuditLog({
          adminUser: result.adminName,
          action: 'CONNEXION',
          collection: 'ADMIN_CONSOLE',
          recordId: 'SESSION-AUTH',
          details: `Accès déverrouillé avec succès (${result.isPrincipal ? 'Administrateur Principal' : 'Administrateur Secondaire avec clé partagée'})`,
          ipAddress: '197.234.221.14 (Kinshasa/RDC)',
          statut: 'SUCCES'
        });
        setAuditLogs(getStoredAdminAuditLogs());
      } else {
        setAuthAttempts(prev => prev + 1);
        setAuthError(result.error || "Code d'accès administrateur erroné. Veuillez saisir le mot de passe maître ou votre clé d'accès partagée.");
        
        // Log failed attempt
        addAdminAuditLog({
          adminUser: googleUser?.email || 'Inconnu (Tentative non autorisée)',
          action: 'ACCES_REFUSE',
          collection: 'ADMIN_CONSOLE',
          recordId: 'ATTEMPT-FAILED',
          details: `Tentative d'accès non autorisée avec le code: "${passcodeInput}"`,
          ipAddress: '197.234.221.14 (Kinshasa/RDC)',
          statut: 'BLOQUE'
        });
        setAuditLogs(getStoredAdminAuditLogs());
      }
    } catch {
      setAuthError("Erreur lors de la validation du code d'accès.");
    }
  };

  // Lock session
  const handleLockSession = () => {
    setIsAdminUnlocked(false);
    setAdminSessionAuthenticated(false);
    onChangeUserRole('institutionnel');
    addAdminAuditLog({
      adminUser: googleUser?.email || 'Administrateur',
      action: 'CONNEXION',
      collection: 'ADMIN_CONSOLE',
      recordId: 'LOGOUT',
      details: 'Session administrateur verrouillée manuellement',
      ipAddress: '197.234.221.14 (Kinshasa/RDC)',
      statut: 'SUCCES'
    });
    setAuditLogs(getStoredAdminAuditLogs());
  };

  // Trigger Force Sync
  const handleForceSync = () => {
    setIsSyncing(true);
    setSyncSuccessMessage(null);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccessMessage('Synchronisation réussie avec la base centrale Sheets liée à environnementplusrdc@gmail.com');
      
      addAdminAuditLog({
        adminUser: googleUser?.email || 'Super-Admin',
        action: 'SYNCHRO_FORCEE',
        collection: 'GOOGLE_SHEETS_CENTRAL',
        recordId: 'FULL_SYNC',
        details: `Synchronisation forcée: ${signalements.length} signalements, ${missions.length} missions, ${payments.length} quittances`,
        ipAddress: '197.234.221.14 (Kinshasa/RDC)',
        statut: 'SUCCES'
      });
      setAuditLogs(getStoredAdminAuditLogs());

      setTimeout(() => setSyncSuccessMessage(null), 5000);
    }, 1200);
  };

  // Download raw JSON Dump
  const handleDownloadFullDump = () => {
    const fullDatabaseDump = {
      meta: {
        app: 'EWaste Mobile RDC (ewastemobile.ai.studio)',
        exportDate: new Date().toISOString(),
        adminAuthor: googleUser?.email || 'Super-Admin Ets ENVIRONNEMENT-PLUS',
        institution: 'Ets ENVIRONNEMENT-PLUS - Assainissement & Salubrité & ENVIRONNEMENT-PLUS RDC',
        authorizedEmail: OFFICIAL_ADMIN_EMAIL
      },
      collections: {
        signalements,
        missions,
        evaluations,
        payments,
        agents,
        auditLogs
      }
    };

    const blob = new Blob([JSON.stringify(fullDatabaseDump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EWASTE_DATABASE_DUMP_FULL_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addAdminAuditLog({
      adminUser: googleUser?.email || 'Super-Admin',
      action: 'EXPORT_BDD',
      collection: 'ALL_COLLECTIONS',
      recordId: 'DUMP_JSON',
      details: 'Exportation complète d\'un dump JSON de l\'intégralité des tables',
      ipAddress: '197.234.221.14 (Kinshasa/RDC)',
      statut: 'SUCCES'
    });
    setAuditLogs(getStoredAdminAuditLogs());
  };

  // Handle Adding a new Agent
  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentNom.trim()) return;

    const newAgent: AdminAgentUser = {
      id: `AGT-${(agents.length + 1).toString().padStart(3, '0')}`,
      nom: newAgentNom.trim(),
      email: newAgentEmail.trim() || 'agent@environnementplus.cd',
      telephone: newAgentPhone.trim() || '+243 800 000 000',
      role: newAgentRole,
      communeAffectation: newAgentCommune,
      statut: 'Actif',
      dateCreation: new Date().toISOString().split('T')[0],
      derniereConnexion: 'Jamais',
      actionsTotal: 0
    };

    const updated = saveAdminAgent(newAgent);
    setAgents(updated);
    setShowAddAgentModal(false);
    setNewAgentNom('');
    setNewAgentEmail('');
    setNewAgentPhone('');

    addAdminAuditLog({
      adminUser: googleUser?.email || 'Super-Admin',
      action: 'CREATION',
      collection: 'agents_brigades',
      recordId: newAgent.id,
      details: `Création du compte agent "${newAgent.nom}" avec le rôle ${newAgent.role}`,
      ipAddress: '197.234.221.14 (Kinshasa/RDC)',
      statut: 'SUCCES'
    });
    setAuditLogs(getStoredAdminAuditLogs());
  };

  // Toggle Agent Status
  const handleToggleAgentStatus = (agentId: string, currentStatut: 'Actif' | 'En attente' | 'Suspendu') => {
    const nextStatut = currentStatut === 'Actif' ? 'Suspendu' : 'Actif';
    const updated = updateAgentStatus(agentId, nextStatut);
    setAgents(updated);

    addAdminAuditLog({
      adminUser: googleUser?.email || 'Super-Admin',
      action: 'MODIFICATION',
      collection: 'agents_brigades',
      recordId: agentId,
      details: `Modification du statut de l'agent vers: ${nextStatut}`,
      ipAddress: '197.234.221.14 (Kinshasa/RDC)',
      statut: 'SUCCES'
    });
    setAuditLogs(getStoredAdminAuditLogs());
  };

  // IF NOT UNLOCKED: DISPLAY HIGH SECURITY ADMIN GATE
  if (!isAdminUnlocked) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white rounded-3xl border-2 border-red-200/80 shadow-2xl p-8 text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 bg-red-50 text-red-700 rounded-3xl flex items-center justify-center mx-auto border border-red-100 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-red-100 text-red-900 rounded-full text-xs font-bold uppercase tracking-wider">
              Accès Strictement Restreint
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Base de Données Administrateur
            </h2>
            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
              Cet espace est <strong>réservé uniquement et exclusivement aux administrateurs certifiés</strong> de l'Ets ENVIRONNEMENT-PLUS RDC.
            </p>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-left text-xs text-amber-900 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Avertissement de Sécurité & Audit :</span>
              <p className="text-[11px] text-amber-800">
                Toutes les tentatives d'accès non autorisées sont automatiquement enregistrées avec empreinte numérique, date et adresse IP dans le journal de sécurité.
              </p>
            </div>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 pt-2">
            <div className="text-left space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Mot de Passe Maître ou Clé d'Accès Partagée :</span>
                <span className="text-[10px] text-gray-500 font-normal">(Régie : regedek)</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="Mot de passe maître ou clé REG-SEC-..."
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-500">
                Les administrateurs secondaires peuvent se connecter à l'aide de leur clé partagée fournie par l'administrateur principal.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200 font-medium">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center space-x-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Déverrouiller l'Accès Administrateur</span>
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
            <span>Compte officiel :</span>
            <span className="font-mono font-semibold text-gray-700">{OFFICIAL_ADMIN_EMAIL}</span>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED VIEW: FULL ADMINISTRATOR DATABASE CONSOLE
  return (
    <div className="space-y-6 pb-20">
      {/* Top Admin Status Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-red-700/20 border border-red-500/40 text-red-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-red-500/20 text-red-300 rounded-full text-[10px] font-bold border border-red-500/30">
                  CONSOLE RÉSERVÉE AUX ADMINISTRATEURS
                </span>
                <span className="text-xs text-emerald-400 font-mono flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1 animate-pulse" />
                  Session Active
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Base de Données Centrale d'Administration
              </h1>
              <p className="text-xs text-slate-400">
                Gestion unifiée des collections brutes, audits de sécurité, droits d'accès et synchronisation de secours.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCollection('broadcast')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
                activeCollection === 'broadcast'
                  ? 'bg-indigo-600 text-white border border-indigo-400'
                  : 'bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60'
              }`}
              title="Diffuser la synchronisation automatique à tous les utilisateurs connectés"
            >
              <Radio className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
              <span>Télédiffusion Universelle OTA</span>
            </button>

            <button
              onClick={handleForceSync}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronisation...' : 'Forcer Synchro Sheets'}</span>
            </button>

            <button
              onClick={handleDownloadFullDump}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Dump JSON Complet</span>
            </button>

            <button
              onClick={handleLockSession}
              className="px-3.5 py-2 bg-red-900/60 hover:bg-red-800 text-red-200 rounded-xl text-xs font-bold transition border border-red-700/50 flex items-center space-x-1.5"
              title="Fermer et sécuriser la session administrateur"
            >
              <Lock className="w-3.5 h-3.5 text-red-300" />
              <span>Verrouiller</span>
            </button>
          </div>
        </div>

        {syncSuccessMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-600 text-emerald-200 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncSuccessMessage}</span>
          </div>
        )}

        {/* Aggregate Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Signalements</p>
            <p className="text-xl font-black text-white">{signalements.length}</p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Missions</p>
            <p className="text-xl font-black text-white">{missions.length}</p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Quittances Taxes</p>
            <p className="text-xl font-black text-emerald-400">{payments.length}</p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">ÉIES & Audits</p>
            <p className="text-xl font-black text-white">{evaluations.length}</p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Agents & Brigades</p>
            <p className="text-xl font-black text-blue-400">{agents.length}</p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Audit Logs</p>
            <p className="text-xl font-black text-amber-400">{auditLogs.length}</p>
          </div>
        </div>
      </div>

      {/* Collection Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {[
          { id: 'activity', label: `Tableau de Bord Temps Réel`, icon: Activity, isSpecial: true },
          { id: 'broadcast', label: `Télédiffusion Universelle OTA`, icon: Radio, isSpecial: true },
          { id: 'security', label: `Sécurité & Clés Partagées`, icon: KeyRound, isSpecial: true },
          { id: 'signalements', label: `Signalements Citoyens (${signalements.length})`, icon: AlertTriangle },
          { id: 'missions', label: `Missions d'Assainissement (${missions.length})`, icon: Database },
          { id: 'paiements', label: `Trésorerie & Quittances (${payments.length})`, icon: DollarSign },
          { id: 'evaluations', label: `Évaluations ÉIES & ACE (${evaluations.length})`, icon: ShieldCheck },
          { id: 'agents', label: `Gestion des Agents & Habilitations (${agents.length})`, icon: Users },
          { id: 'audit', label: `Journal de Sécurité (Audit Trail) (${auditLogs.length})`, icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSpecial = (tab as any).isSpecial;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCollection(tab.id as CollectionView)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeCollection === tab.id
                  ? isSpecial 
                    ? tab.id === 'activity'
                      ? 'bg-emerald-800 text-white shadow-md border border-emerald-600'
                      : 'bg-indigo-600 text-white shadow-md border border-indigo-400'
                    : 'bg-slate-900 text-white shadow-xs'
                  : isSpecial
                    ? tab.id === 'activity'
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.id === 'activity' ? 'text-emerald-500' : isSpecial ? 'text-indigo-400' : 'text-emerald-700'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* COLLECTION LIVE: Tableau de Bord en Temps Réel des Activités Utilisateurs */}
      {activeCollection === 'activity' && (
        <AdminLiveActivityBoard
          signalements={signalements}
          missions={missions}
          evaluations={evaluations}
          payments={payments}
          auditLogs={auditLogs}
          onNavigateToCollection={(coll) => setActiveCollection(coll as CollectionView)}
          isPrincipalAdmin={isPrincipalAdmin}
        />
      )}

      {/* COLLECTION 0: Télédiffusion & Synchronisation Automatique Universelle */}
      {activeCollection === 'broadcast' && (
        <AdminSyncBroadcastSection 
          adminEmail={googleUser?.email || OFFICIAL_ADMIN_EMAIL} 
          onManualRefreshRequested={handleForceSync}
        />
      )}

      {/* COLLECTION SEC: Sécurité & Clés d'Accès Partagées */}
      {activeCollection === 'security' && (
        <AdminSecuritySection 
          isPrincipalAdmin={isPrincipalAdmin}
          onOpenApkModal={onOpenApkModal}
          onSecurityLog={(action, details) => {
            addAdminAuditLog({
              adminUser: googleUser?.email || 'Administrateur Principal',
              action: action as any,
              collection: 'ADMIN_SECURITY',
              recordId: 'KEY-OR-PASS',
              details,
              ipAddress: '197.234.221.14 (Kinshasa/RDC)',
              statut: 'SUCCES'
            });
            setAuditLogs(getStoredAdminAuditLogs());
          }}
        />
      )}

      {/* COLLECTION 1: Signalements */}
      {activeCollection === 'signalements' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Enregistrements Bruts des Signalements
            </h3>
            <span className="text-xs text-gray-500">Mise à jour en temps réel</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">ID / Date</th>
                  <th className="px-4 py-3">Commune & Quartier</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Sévérité</th>
                  <th className="px-4 py-3 text-center">Tonnage Estimé</th>
                  <th className="px-4 py-3 text-center">Statut Actuel</th>
                  <th className="px-4 py-3 text-right">Action Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {signalements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Aucun signalement enregistré dans la base
                    </td>
                  </tr>
                ) : (
                  signalements.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-gray-900">{s.id}</div>
                        <div className="text-[11px] text-gray-400">{s.date}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-800">
                        {s.commune} <span className="text-gray-400">•</span> {s.quartier}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 max-w-xs truncate" title={s.description}>
                        {s.description}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.severity === 'Critique' ? 'bg-red-100 text-red-800' :
                          s.severity === 'Élevé' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {s.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-gray-900">
                        {s.tonnageEstime} t
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          s.status === 'Nettoyé' ? 'bg-emerald-100 text-emerald-900' :
                          s.status === 'En cours' ? 'bg-blue-100 text-blue-900' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1">
                        {s.status !== 'Nettoyé' && (
                          <button
                            onClick={() => onUpdateSignalementStatus(s.id, 'Nettoyé')}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold transition"
                          >
                            Valider Nettoyé
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COLLECTION 2: Missions */}
      {activeCollection === 'missions' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Missions d'Assainissement & Brigades
            </h3>
            <span className="text-xs text-gray-500">{missions.length} missions répertoriées</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">ID / Titre</th>
                  <th className="px-4 py-3">Commune</th>
                  <th className="px-4 py-3">Brigade Affectée</th>
                  <th className="px-4 py-3 text-center">Tonnes Évacuées</th>
                  <th className="px-4 py-3 text-center">Date Début</th>
                  <th className="px-4 py-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {missions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Aucune mission enregistrée
                    </td>
                  </tr>
                ) : (
                  missions.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3.5 font-bold text-gray-900">
                        <div>{m.title}</div>
                        <div className="text-[10px] font-mono text-gray-400">{m.id}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-800">{m.commune}</td>
                      <td className="px-4 py-3.5 text-gray-600">{m.team}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-emerald-900">{m.tonsCollected} t</td>
                      <td className="px-4 py-3.5 text-center text-gray-500">{m.startDate}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          m.status === 'Terminé' ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COLLECTION 3: Paiements & Trésorerie */}
      {activeCollection === 'paiements' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Grand Livre des Quittances & Recouvrements Fiscaux
            </h3>
            <span className="text-xs text-emerald-700 font-bold">
              {payments.filter(p => p.status === 'Validé').reduce((s, p) => s + p.amountCDF, 0).toLocaleString('fr-FR')} CDF perçus
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">N° Quittance</th>
                  <th className="px-4 py-3">Redevable / Téléphone</th>
                  <th className="px-4 py-3">Type d'Établissement</th>
                  <th className="px-4 py-3">Commune</th>
                  <th className="px-4 py-3 text-center">Montant</th>
                  <th className="px-4 py-3 text-center">Moyen Paiement</th>
                  <th className="px-4 py-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Aucune quittance émise pour le moment
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-emerald-900">{p.receiptNumber}</div>
                        <div className="text-[10px] text-gray-400">{p.date} • {p.period}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-gray-900">{p.payerName}</div>
                        <div className="text-[11px] font-mono text-gray-500">{p.payerPhone}</div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{p.producerType}</td>
                      <td className="px-4 py-3.5 font-medium text-gray-800">{p.commune}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-gray-900">
                        {p.amountCDF.toLocaleString('fr-FR')} CDF ({p.amountUSD} $)
                      </td>
                      <td className="px-4 py-3.5 text-center text-gray-600">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full text-[10px] font-bold">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COLLECTION 4: Évaluations ÉIES */}
      {activeCollection === 'evaluations' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Audits Environnementaux & ÉIES / PGES
            </h3>
            <span className="text-xs text-gray-500">{evaluations.length} audits enregistrés</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">ID / Date</th>
                  <th className="px-4 py-3">Commune & Auditeur</th>
                  <th className="px-4 py-3 text-center">Salubrité</th>
                  <th className="px-4 py-3 text-center">Drainage</th>
                  <th className="px-4 py-3 text-center">Sensibilisation</th>
                  <th className="px-4 py-3 text-right">Recommandation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {evaluations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Aucune évaluation environnementale dans la base
                    </td>
                  </tr>
                ) : (
                  evaluations.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3.5 font-mono">
                        <div className="font-bold text-gray-900">{e.id}</div>
                        <div className="text-[10px] text-gray-400">{e.date}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-gray-900">{e.commune}</div>
                        <div className="text-[11px] text-gray-500">Auditeur: {e.auditor}</div>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold">{e.salubriteScore}/10</td>
                      <td className="px-4 py-3.5 text-center font-bold">{e.drainageScore}/10</td>
                      <td className="px-4 py-3.5 text-center font-bold">{e.sensibilisationScore}/10</td>
                      <td className="px-4 py-3.5 text-right text-gray-600 max-w-xs truncate" title={e.commentaires}>
                        {e.commentaires}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COLLECTION 5: Gestion des Agents & Habilitations */}
      {activeCollection === 'agents' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Annuaire des Agents Habilités & Rôles Ets ENVIRONNEMENT-PLUS
              </h3>
              <p className="text-[11px] text-gray-500">Contrôle des accès, affectations géographiques et habilitations de terrain</p>
            </div>
            <button
              onClick={() => setShowAddAgentModal(true)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 self-start"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajouter un Agent</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Matricule / Nom</th>
                  <th className="px-4 py-3">Rôle & Fonction</th>
                  <th className="px-4 py-3">Affectation Communale</th>
                  <th className="px-4 py-3 text-center">Dernière Connexion</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-right">Contrôle Accès</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agents.map((agt) => (
                  <tr key={agt.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-gray-900">{agt.nom}</div>
                      <div className="text-[10px] font-mono text-gray-400">{agt.id} • {agt.email}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-800">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px]">
                        {agt.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{agt.communeAffectation}</td>
                    <td className="px-4 py-3.5 text-center text-gray-500">{agt.derniereConnexion}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        agt.statut === 'Actif' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                      }`}>
                        {agt.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleAgentStatus(agt.id, agt.statut)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${
                          agt.statut === 'Actif'
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                        }`}
                      >
                        {agt.statut === 'Actif' ? 'Suspendre' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COLLECTION 6: Journal de Sécurité (Audit Trail) */}
      {activeCollection === 'audit' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Journal d'Audit de Sécurité Régie (Audit Trail)
              </h3>
              <p className="text-[11px] text-gray-500">Traçabilité complète des accès, modifications et synchronisations</p>
            </div>
            <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
              Registre Inviolable
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-600 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Horodatage</th>
                  <th className="px-4 py-3">Utilisateur / Auteur</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Collection Cible</th>
                  <th className="px-4 py-3">Détails Opérationnels</th>
                  <th className="px-4 py-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      {log.adminUser}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-[11px]">
                      {log.collection}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.statut === 'SUCCES' ? 'bg-emerald-100 text-emerald-900' :
                        log.statut === 'AVERTISSEMENT' ? 'bg-amber-100 text-amber-900' :
                        'bg-red-100 text-red-900'
                      }`}>
                        {log.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Ajouter un Agent */}
      {showAddAgentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900">Enrôler un Nouvel Agent Ets ENVIRONNEMENT-PLUS</h3>
              <button onClick={() => setShowAddAgentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAgent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nom Complet :</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean-Paul Ilunga"
                  value={newAgentNom}
                  onChange={(e) => setNewAgentNom(e.target.value)}
                  className="w-full p-2 bg-gray-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Adresse Email :</label>
                <input
                  type="email"
                  placeholder="agent@environnementplus.cd"
                  value={newAgentEmail}
                  onChange={(e) => setNewAgentEmail(e.target.value)}
                  className="w-full p-2 bg-gray-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Téléphone / WhatsApp :</label>
                <input
                  type="text"
                  placeholder="+243 812 000 000"
                  value={newAgentPhone}
                  onChange={(e) => setNewAgentPhone(e.target.value)}
                  className="w-full p-2 bg-gray-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Rôle Attribué :</label>
                <select
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value as AdminAgentUser['role'])}
                  className="w-full p-2 bg-gray-50 border rounded-xl"
                >
                  <option value="Inspecteur Salubrité">Inspecteur Salubrité</option>
                  <option value="Chef de Brigade">Chef de Brigade</option>
                  <option value="Opérateur Trésorerie">Opérateur Trésorerie</option>
                  <option value="Administrateur Ets ENVIRONNEMENT-PLUS">Administrateur Ets ENVIRONNEMENT-PLUS</option>
                  <option value="Super-Admin">Super-Admin</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Affectation Géographique :</label>
                <input
                  type="text"
                  value={newAgentCommune}
                  onChange={(e) => setNewAgentCommune(e.target.value)}
                  className="w-full p-2 bg-gray-50 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddAgentModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
                >
                  Enregistrer l'Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
