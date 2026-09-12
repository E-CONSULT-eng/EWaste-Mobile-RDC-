import React, { useState } from 'react';
import { 
  Home, 
  AlertTriangle, 
  Trash2, 
  ShieldCheck, 
  BarChart3, 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  GraduationCap, 
  FileSpreadsheet, 
  Download, 
  Database,
  CreditCard,
  Lock,
  Unlock,
  Shield,
  Activity,
  ShieldAlert,
  Sparkles,
  Users,
  KeyRound,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  LogOut,
  Cloud
} from 'lucide-react';
import { InAppNotification, UserRole, UserAuthSession } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { OnlineUpdateModal } from './OnlineUpdateModal';
import { User } from 'firebase/auth';
import { 
  verifyAdminCredential, 
  getAdminSessionInfo, 
  setAdminSessionInfo, 
  setAdminSessionAuthenticated,
  recordSecurityAccessLog 
} from '../utils/adminStore';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  isOnline?: boolean;
  pendingSyncCount?: number;
  onSyncOffline?: () => void;
  notifications?: InAppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onClearNotifications?: () => void;
  onNavigateToSignalement?: (id: string) => void;
  onOpenGoogleWorkspace?: () => void;
  onOpenApkModal?: () => void;
  onOpenOfflineManager?: () => void;
  googleUser?: User | null;
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  authSession?: UserAuthSession | null;
  onLogout?: () => void;
}

export function Navbar({
  currentTab,
  onNavigate,
  isMobileFrame,
  setIsMobileFrame,
  isOnline = true,
  pendingSyncCount = 0,
  onSyncOffline,
  notifications = [],
  onMarkNotificationAsRead = () => {},
  onMarkAllNotificationsAsRead = () => {},
  onClearNotifications = () => {},
  onNavigateToSignalement = () => {},
  onOpenGoogleWorkspace = () => {},
  onOpenApkModal = () => {},
  onOpenOfflineManager = () => {},
  googleUser = null,
  userRole = 'citoyen',
  onChangeUserRole,
  authSession = null,
  onLogout = () => {}
}: NavbarProps) {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showSpaceSelector, setShowSpaceSelector] = useState(false);
  const [modalMode, setModalMode] = useState<'brigade' | 'admin' | 'inspection'>('brigade');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [selectorClicks, setSelectorClicks] = useState(0);

  const handleThreeClickTrigger = () => {
    const next = selectorClicks + 1;
    setSelectorClicks(next);
    if (next >= 3) {
      setSelectorClicks(0);
      setShowSpaceSelector(true);
    }
  };

  // 1. Éco-Citoyen Navigation Items (Strict Scope: Scanner + Signalement unifié, Paiement taxe salubrité, Sensibilisation & Formation - AUCUNE BDD NI REPORTING)
  const citizenNavItems = [
    { id: 'scanner-signalement', label: 'Scanner & Signalement', icon: Sparkles },
    { id: 'paiement', label: 'Paiement Taxe Salubrité', icon: CreditCard },
    { id: 'education', label: 'Sensibilisation & Formation', icon: GraduationCap },
  ];

  // 2. Superviseurs & Brigade Navigation Items (Suivi assainissement, ÉIES & évaluation environnementale, Modules formation, Reporting journalier/hebdo/mensuel)
  const brigadeNavItems = [
    { id: 'assainissement', label: 'Suivi & Trajectoires', icon: Trash2 },
    { id: 'evaluation', label: 'ÉIES & Évaluation Env.', icon: ShieldCheck },
    { id: 'education', label: 'Modules Pédagogiques', icon: GraduationCap },
    { id: 'reporting', label: 'Reporting (Jour/Hebdo/Mois)', icon: BarChart3 },
  ];

  // 3. Administrateur Principal Navigation Items (Réservé AI Studio)
  const adminNavItems = [
    { id: 'regedek-dashboard', label: 'Tableau de Bord Ets ENVIRONNEMENT-PLUS', icon: Activity },
    { id: 'admin-database', label: 'Base de Données & Activités', icon: Database },
    { id: 'admin-security', label: 'Sécurité & Déploiement MàJ', icon: ShieldAlert },
  ];

  // Select active nav items based on current active interface
  const navItems = userRole === 'admin' 
    ? adminNavItems 
    : userRole === 'institutionnel' 
      ? brigadeNavItems 
      : citizenNavItems;

  // Handle switching to citizen interface
  const handleSelectCitizen = () => {
    onChangeUserRole('citoyen');
    onNavigate('scanner-signalement');
  };

  // Handle opening brigade modal or switching directly
  const handleSelectBrigade = () => {
    if (userRole === 'institutionnel') {
      onNavigate('assainissement');
      return;
    }
    setModalMode('brigade');
    setPasscodeInput('');
    setAuthError('');
    setShowRoleModal(true);
  };

  // Handle opening admin modal or switching directly
  const handleSelectAdmin = () => {
    if (userRole === 'admin') {
      onNavigate('regedek-dashboard');
      return;
    }
    setModalMode('admin');
    setPasscodeInput('');
    setAuthError('');
    setShowRoleModal(true);
  };

  // Authenticate role switch
  const handleUnlockRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsVerifying(true);

    const cleanInput = passcodeInput.trim();

    if (modalMode === 'brigade' || modalMode === 'inspection') {
      const lower = cleanInput.toLowerCase();
      if (lower === 'regedek' || lower === 'brigade' || lower === 'superviseur' || lower === 'inspection' || lower === 'controle' || lower === '2026' || lower === 'environnementplus') {
        onChangeUserRole('institutionnel');
        setShowRoleModal(false);
        setPasscodeInput('');
        onNavigate(modalMode === 'inspection' ? 'evaluation' : 'assainissement');
      } else {
        await recordSecurityAccessLog({
          identity: authSession?.displayName || authSession?.identifier || 'Anonyme',
          targetSpace: modalMode === 'inspection' ? 'INSPECTEUR' : 'BRIGADIER',
          action: 'TENTATIVE_DEVERROUILLAGE_ECHOUEE',
          status: 'BLOQUÉ',
          reason: "Code d'accès incorrect. Accès bloqué et journalisé."
        });
        setAuthError("Code d'accès incorrect. Accès bloqué et journalisé.");
      }
      setIsVerifying(false);
      return;
    }

    // Modal mode === 'admin'
    try {
      const result = await verifyAdminCredential(cleanInput, googleUser?.email);
      if (result.valid) {
        setAdminSessionAuthenticated(true);
        setAdminSessionInfo({
          isPrincipal: result.isPrincipal,
          adminName: result.adminName,
          role: result.role
        });
        onChangeUserRole(result.role);
        setShowRoleModal(false);
        setPasscodeInput('');
        onNavigate('regedek-dashboard');
      } else {
        await recordSecurityAccessLog({
          identity: googleUser?.email || authSession?.displayName || 'Utilisateur Non Autorisé',
          targetSpace: 'ADMINISTRATEUR',
          action: 'TENTATIVE_INTRUSION_ADMIN_NAVBAR',
          status: 'BLOQUÉ',
          reason: "Tentative d'ouverture de l'espace Administrateurs par un utilisateur non autorisé."
        });
        setAuthError(result.error || "Accès strictement réservé à l'administrateur principal. Tentative bloquée et journalisée.");
      }
    } catch {
      setAuthError("Erreur d'authentification administrative.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Quick Demo Login helper
  const handleQuickDemo = (code: string) => {
    setPasscodeInput(code);
  };

  return (
    <>
      {/* Top Header - Institutional clean styling */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Agency title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer shrink-0 group relative" 
            onClick={() => {
              if (userRole !== 'citoyen') {
                if (userRole === 'admin') onNavigate('regedek-dashboard');
                else if (userRole === 'institutionnel') onNavigate('assainissement');
                return;
              }
              const next = logoClicks + 1;
              setLogoClicks(next);
              if (next >= 3) {
                setLogoClicks(0);
                setShowSpaceSelector(true);
              } else {
                onNavigate('scanner-signalement');
              }
            }}
            title="Portail Éco-Citoyen Kinshasa"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-emerald-900 transition">
              EW
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold text-gray-900 tracking-tight">EWaste Mobile</h1>
                <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 hidden xs:inline-block">
                  ewastemobile.ai.studio
                </span>
              </div>
              <p 
                className="text-[10px] text-gray-500 font-medium hidden sm:block select-none"
              >
                Ets ENVIRONNEMENT-PLUS RDC
              </p>
            </div>
          </div>

          {/* Center Interface Badge - Strictly compliant with role scope */}
          <div className="shrink-0">
            {userRole === 'citoyen' && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-xs font-bold">Portail Éco-Citoyen Kinshasa</span>
              </div>
            )}

            {userRole === 'institutionnel' && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-sky-50 text-sky-800 rounded-2xl border border-sky-200">
                <Trash2 className="w-3.5 h-3.5 text-sky-700" />
                <span className="text-xs font-bold">Superviseur / Brigade d'Assainissement</span>
              </div>
            )}

            {userRole === 'admin' && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-amber-300 rounded-2xl border border-slate-700">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold">Administration Centrale (Ets ENVIRONNEMENT-PLUS)</span>
              </div>
            )}
          </div>

          {/* Header Controls (Right) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">

            {/* Online / Offline Status Badge */}
            <button 
              type="button"
              onClick={onOpenOfflineManager}
              className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer hover:shadow-2xs ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/60' 
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
              title="Gérer l'utilisation et la validation hors-ligne"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden xl:inline">En ligne</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hors-ligne</span>
                </>
              )}
            </button>

            {/* Offline sync button if pending */}
            {pendingSyncCount > 0 && (
              <button
                onClick={onOpenOfflineManager}
                className="flex items-center space-x-1 bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-xs transition"
                title={`${pendingSyncCount} élément(s) en attente de synchronisation`}
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Sync ({pendingSyncCount})</span>
              </button>
            )}

            {/* Notification Center */}
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={onMarkNotificationAsRead}
              onMarkAllAsRead={onMarkAllNotificationsAsRead}
              onClearAll={onClearNotifications}
              onNavigateToSignalement={onNavigateToSignalement}
            />

            {/* Google Workspace Button (Visible for institutionnels or when logged in) */}
            {(userRole === 'institutionnel' || userRole === 'admin') && (
              <button
                onClick={onOpenGoogleWorkspace}
                className="hidden lg:flex items-center space-x-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-medium transition"
                title="Liaison Google Sheets et Drive"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden xl:inline">Sheets & Drive</span>
                {googleUser && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                )}
              </button>
            )}

            {/* Mobile / APK Download Button */}
            <button
              onClick={onOpenApkModal}
              className="hidden sm:flex items-center space-x-1 bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition"
              title="Télécharger l'application mobile pour Android"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">APK</span>
            </button>

            {/* Frame toggle */}
            <button
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              title={isMobileFrame ? "Passer en vue Bureau" : "Passer en vue Smartphone"}
            >
              {isMobileFrame ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            </button>

            {/* User Session Badge & Logout Button */}
            {authSession && (
              <div className="flex items-center space-x-1.5 pl-1.5 border-l border-gray-200">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-[11px] font-bold text-gray-800 leading-tight truncate max-w-[130px]">
                    {authSession.displayName || authSession.identifier}
                  </span>
                  <span className="text-[9px] text-gray-500 font-medium">
                    {authSession.role === 'citoyen' 
                      ? (authSession.userType === 'commerce' ? 'Commerce' : authSession.userType === 'entreprise' ? 'Entreprise' : 'Citoyen/Ménage') 
                      : authSession.role === 'institutionnel' 
                        ? 'Superviseur & Brigade' 
                        : 'Administration Centrale'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center space-x-1"
                  title="Se déconnecter et changer de profil"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Quitter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Active Interface Header Bar & Desktop Main Navigation */}
      <div className={`hidden sm:block border-b transition ${
        userRole === 'admin' 
          ? 'bg-slate-900 border-slate-800 text-white' 
          : userRole === 'institutionnel'
            ? 'bg-amber-950/10 border-amber-200/60'
            : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex space-x-1 py-1.5 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              let activeBtnStyle = 'bg-emerald-800 text-white shadow-xs';
              if (userRole === 'admin') {
                activeBtnStyle = 'bg-red-700 text-white shadow-xs';
              } else if (userRole === 'institutionnel') {
                activeBtnStyle = 'bg-amber-700 text-white shadow-xs';
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? activeBtnStyle
                      : userRole === 'admin'
                        ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-medium px-2 hidden lg:flex items-center space-x-2">
            {userRole === 'citoyen' && (
              <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Portail Citoyen (Kinshasa & RDC)
              </span>
            )}
            {userRole === 'institutionnel' && (
              <span className="text-amber-900 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Superviseurs & Brigade (Ets ENVIRONNEMENT-PLUS RDC)
              </span>
            )}
            {userRole === 'admin' && (
              <span className="text-red-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Administration Centrale (Ets ENVIRONNEMENT-PLUS & Gouvernance)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 sm:hidden">
        <div className="flex overflow-x-auto h-15 px-2 items-center justify-around space-x-1 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const activeColor = userRole === 'admin' 
              ? 'text-red-700 font-bold' 
              : userRole === 'institutionnel' 
                ? 'text-amber-700 font-bold' 
                : 'text-emerald-800 font-bold';

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 min-w-[54px] transition shrink-0 ${
                  isActive ? activeColor : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                <span className="text-[9px] tracking-tight truncate max-w-[56px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modal: Connexion Superviseur/Brigade ou Administration */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
              <div className={`p-2.5 rounded-2xl ${
                modalMode === 'admin' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'
              }`}>
                {modalMode === 'admin' ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {modalMode === 'admin' 
                    ? "Connexion Administration Centrale" 
                    : "Connexion Superviseurs & Brigade"}
                </h3>
                <p className="text-xs text-gray-500">
                  {modalMode === 'admin' 
                    ? "Environnement-Plus Principal & Tutelle/REGEDEK Secondaires" 
                    : "Environnement-Plus & REGEDEK Opérations"}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {modalMode === 'admin' 
                ? "L'Administrateur Principal (Environnement-Plus) utilise son mot de passe maître pour générer et partager les clés. Les Administrateurs Secondaires (REGEDEK, ministères) se connectent avec leur clé partagée."
                : "Cet espace permet aux superviseurs et brigadiers de suivre le curage, les missions d'assainissement, les études ÉIES et de produire le reporting journalier, hebdomadaire et mensuel."}
            </p>

            <form onSubmit={handleUnlockRole} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span>
                    {modalMode === 'admin' 
                      ? "Mot de passe maître ou Clé partagée :" 
                      : "Code d'accès brigade :"}
                  </span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    autoFocus
                    placeholder={modalMode === 'admin' ? "Mot de passe ou REG-SEC-..." : "Entrez votre code (ex: regedek)"}
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>
                {authError && <p className="text-[11px] text-red-600 mt-1.5 font-medium">{authError}</p>}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowRoleModal(false); setAuthError(''); }}
                  className="flex-1 px-3 py-2.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className={`flex-1 px-3 py-2.5 text-xs font-semibold text-white rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5 ${
                    modalMode === 'admin' 
                      ? 'bg-red-700 hover:bg-red-800' 
                      : 'bg-amber-700 hover:bg-amber-800'
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{isVerifying ? 'Vérification...' : 'Déverrouiller'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sélecteur d'espace sécurisé (3-click trigger) */}
      {showSpaceSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
              <div className="p-2.5 rounded-2xl bg-slate-900 text-amber-300">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Passerelle d'Accès Sécurisé</h3>
                <p className="text-xs text-gray-500">Ets ENVIRONNEMENT-PLUS RDC • Espaces Restreints</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Sélectionnez l'espace opérationnel autorisé. Chaque accès nécessite une accréditation ou un code d'autorisation préalable de l'administrateur principal.
            </p>

            <div className="space-y-2.5 pt-1">
              {/* 1. Accréditation, Contrôle & Inspections */}
              <button
                type="button"
                onClick={() => {
                  setShowSpaceSelector(false);
                  setModalMode('inspection');
                  setPasscodeInput('');
                  setAuthError('');
                  setShowRoleModal(true);
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/80 transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-700 text-white rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">Accréditation, Contrôle & Inspections</p>
                    <p className="text-[11px] text-amber-800">Évaluations environnementales & ÉIES</p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-amber-700 group-hover:scale-110 transition" />
              </button>

              {/* 2. Brigade d'Assainissement */}
              <button
                type="button"
                onClick={() => {
                  setShowSpaceSelector(false);
                  setModalMode('brigade');
                  setPasscodeInput('');
                  setAuthError('');
                  setShowRoleModal(true);
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/80 transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-sky-700 text-white rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-sky-950">Brigade d'Assainissement</p>
                    <p className="text-[11px] text-sky-800">Suivi des curages, missions & interventions</p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-sky-700 group-hover:scale-110 transition" />
              </button>

              {/* 3. Direction Générale (Admin) */}
              <button
                type="button"
                onClick={() => {
                  setShowSpaceSelector(false);
                  setModalMode('admin');
                  setPasscodeInput('');
                  setAuthError('');
                  setShowRoleModal(true);
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-100/80 transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-700 text-white rounded-xl">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-950">Direction Générale (Administration)</p>
                    <p className="text-[11px] text-red-800">Console centrale, sécurité & déploiement OTA</p>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-red-700 group-hover:scale-110 transition" />
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSpaceSelector(false)}
                className="w-full py-2.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
              >
                Fermer la passerelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Update Modal (ewastemobile.ai.studio) */}
      <OnlineUpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        userRole={userRole}
      />
    </>
  );
}
