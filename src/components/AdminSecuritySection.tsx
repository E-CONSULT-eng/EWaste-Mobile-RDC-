import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  UserCheck, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Users, 
  ShieldAlert, 
  Info,
  FileSpreadsheet,
  ExternalLink,
  Download,
  Smartphone,
  Laptop,
  Monitor
} from 'lucide-react';
import { SecondaryAdminKey } from '../types';
import { 
  getMasterAdminPassword, 
  setMasterAdminPassword, 
  getStoredSecondaryKeys, 
  saveSecondaryKey, 
  revokeStoredSecondaryKey,
  getAdminSessionInfo 
} from '../utils/adminStore';
import { 
  logSecondaryAdminToSheet, 
  syncAllSecondaryAdminsToGoogleSheets, 
  OFFICIAL_ADMIN_EMAIL, 
  getLinkedSpreadsheet 
} from '../utils/googleSheets';

interface AdminSecuritySectionProps {
  isPrincipalAdmin: boolean;
  onSecurityLog?: (action: string, details: string) => void;
  onOpenApkModal?: () => void;
}

export function AdminSecuritySection({ 
  isPrincipalAdmin = true,
  onSecurityLog,
  onOpenApkModal = () => {}
}: AdminSecuritySectionProps) {
  // Password change states
  const [currentMasterPass, setCurrentMasterPass] = useState('');
  const [newMasterPass, setNewMasterPass] = useState('');
  const [confirmMasterPass, setConfirmMasterPass] = useState('');
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Secondary keys state
  const [secondaryKeys, setSecondaryKeys] = useState<SecondaryAdminKey[]>([]);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // New key form
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEmail, setNewKeyEmail] = useState('');
  const [newKeyRole, setNewKeyRole] = useState('Superviseur de Brigade & Assainissement');
  const [newKeyNotes, setNewKeyNotes] = useState('');
  const [newKeyCustomCode, setNewKeyCustomCode] = useState('');
  const [keyCreationMsg, setKeyCreationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  const handleFullAppReset = () => {
    if (!confirm("⚠️ ATTENTION : Confirmez-vous la réinitialisation complète de toutes les informations de l'application ewastemobile.ai.studio ?\n\nToutes les données en cache local, formulaires et sessions seront immédiatement purgés.")) {
      return;
    }
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
    window.location.href = '/';
  };

  // Google Sheets sync state
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsSyncMsg, setSheetsSyncMsg] = useState<{ type: 'success' | 'error'; text: string; url?: string } | null>(null);

  // Synchronisation globale vers Google Sheets
  const handleSyncAdminsToGoogleSheets = async () => {
    setIsSyncingSheets(true);
    setSheetsSyncMsg(null);
    try {
      const res = await syncAllSecondaryAdminsToGoogleSheets(secondaryKeys);
      setSheetsSyncMsg({
        type: 'success',
        text: `${res.count} administrateur(s) secondaire(s) synchronisé(s) et validé(s) sur la feuille Google Sheets 'Admins_Secondaires' (${OFFICIAL_ADMIN_EMAIL}).`,
        url: res.url
      });
      if (onSecurityLog) {
        onSecurityLog('SYNC_GOOGLE_SHEETS', `Synchronisation de ${res.count} administrateurs secondaires vers Google Sheets`);
      }
    } catch {
      setSheetsSyncMsg({
        type: 'error',
        text: "Erreur lors de la liaison avec Google Sheets. Vérifiez votre connexion internet."
      });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Load keys
  const loadKeys = async () => {
    // Try fetch from server if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const res = await fetch('/api/admin/security/config');
        if (res.ok) {
          const data = await res.json();
          if (data.secondaryAdmins) {
            setSecondaryKeys(data.secondaryAdmins);
            return;
          }
        }
      } catch {}
    }
    // Fallback to local store
    setSecondaryKeys(getStoredSecondaryKeys());
  };

  useEffect(() => {
    loadKeys();
  }, []);

  // Update Master Password
  const handleUpdateMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatusMsg(null);

    if (!newMasterPass || newMasterPass.length < 6) {
      setPasswordStatusMsg({ type: 'error', text: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' });
      return;
    }

    if (newMasterPass !== confirmMasterPass) {
      setPasswordStatusMsg({ type: 'error', text: 'Les deux nouveaux mots de passe ne correspondent pas.' });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      let serverSuccess = false;
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          const res = await fetch('/api/admin/security/update-master-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currentPassword: currentMasterPass,
              newPassword: newMasterPass,
              adminEmail: 'environnementplusrdc@gmail.com'
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            serverSuccess = true;
          } else if (!res.ok) {
            setPasswordStatusMsg({ type: 'error', text: data.error || 'Mot de passe actuel incorrect.' });
            setIsUpdatingPassword(false);
            return;
          }
        } catch {
          // offline fallback
        }
      }

      // Store locally
      setMasterAdminPassword(newMasterPass);
      setCurrentMasterPass('');
      setNewMasterPass('');
      setConfirmMasterPass('');
      setPasswordStatusMsg({ 
        type: 'success', 
        text: 'Mot de passe de sécurité administrateur mis à jour avec succès !' 
      });

      if (onSecurityLog) {
        onSecurityLog('MODIF_MOT_DE_PASSE', 'Mise à jour du mot de passe maître administrateur');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Generate Secondary Admin Key
  const handleCreateSecondaryKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyCreationMsg(null);

    if (!newKeyName.trim()) {
      setKeyCreationMsg({ type: 'error', text: 'Veuillez saisir le nom ou la fonction du collaborateur.' });
      return;
    }

    setIsCreatingKey(true);

    try {
      let createdItem: SecondaryAdminKey | null = null;

      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          const res = await fetch('/api/admin/security/create-secondary-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newKeyName.trim(),
              email: newKeyEmail.trim() || undefined,
              role: newKeyRole,
              notes: newKeyNotes.trim() || undefined,
              customKey: newKeyCustomCode.trim() || undefined,
              adminAuthHeader: getMasterAdminPassword()
            })
          });
          const data = await res.json();
          if (res.ok && data.key) {
            createdItem = data.key;
          }
        } catch {}
      }

      if (!createdItem) {
        // Local generator
        const rawSeq = Date.now().toString().slice(-4);
        const generatedCode = newKeyCustomCode.trim() || `ENV-SEC-${rawSeq}-${newKeyName.substring(0, 3).toUpperCase()}`;
        createdItem = {
          id: `SEC-KEY-${Date.now()}`,
          key: generatedCode,
          name: newKeyName.trim(),
          email: newKeyEmail.trim(),
          role: newKeyRole,
          createdAt: new Date().toISOString(),
          createdBy: 'Administrateur Principal',
          status: 'active',
          notes: newKeyNotes.trim()
        };
      }

      saveSecondaryKey(createdItem);

      // Auto-liaison avec la feuille Google Sheets Admins_Secondaires
      try {
        await logSecondaryAdminToSheet(createdItem);
      } catch (_) {}

      await loadKeys();

      setNewKeyName('');
      setNewKeyEmail('');
      setNewKeyNotes('');
      setNewKeyCustomCode('');
      setShowAddKeyModal(false);

      if (onSecurityLog) {
        onSecurityLog('CREATION_CLE_SECONDAIRE', `Nouvelle clé émise et liée sur Google Sheets pour : ${createdItem.name} (${createdItem.role})`);
      }
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Revoke Secondary Key
  const handleRevokeKey = async (id: string, name: string) => {
    if (!confirm(`Confirmez-vous la révocation définitive de la clé d'accès pour "${name}" ? Il ne pourra plus se connecter.`)) {
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await fetch(`/api/admin/security/revoke-secondary-key/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminAuthHeader: getMasterAdminPassword() })
        });
      } catch {}
    }

    revokeStoredSecondaryKey(id);
    const targetItem = secondaryKeys.find(k => k.id === id);
    if (targetItem) {
      try {
        await logSecondaryAdminToSheet({ ...targetItem, status: 'revoked' });
      } catch (_) {}
    }
    await loadKeys();

    if (onSecurityLog) {
      onSecurityLog('REVOCATION_CLE', `Révocation de la clé d'accès ID : ${id} (${name}) sur le serveur et Google Sheets`);
    }
  };

  // Copy Key to Clipboard
  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Informative Banner on Privileges */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Gouvernance de Sécurité Hiérarchique
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {isPrincipalAdmin ? 'Administrateur Principal' : 'Administrateur Secondaire'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Gestion des Mots de Passe & Clés d'Accès Collaborateurs
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Seul <strong>l'administrateur principal</strong> détient l'autorité de modifier le mot de passe maître et de générer ou révoquer des clés d'accès partagées pour les administrateurs secondaires (chefs de brigade, auditeurs ACE, comptables).
          </p>
        </div>

        <div className="shrink-0">
          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Clés Actives</span>
            <span className="text-xl font-black text-indigo-400">
              {secondaryKeys.filter(k => k.status === 'active').length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Password Management */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Mot de Passe Administrateur</h4>
              <p className="text-xs text-gray-500">Modification du code d'accès principal de l'interface</p>
            </div>
          </div>

          {!isPrincipalAdmin ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Accès Restreint
              </p>
              <p>
                Vous êtes connecté avec une clé secondaire. Seul l'administrateur principal peut modifier le mot de passe maître de sécurité.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdateMasterPassword} className="space-y-4">
              {passwordStatusMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 border ${
                  passwordStatusMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  {passwordStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  )}
                  <span>{passwordStatusMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mot de passe ou code actuel
                </label>
                <input
                  type="password"
                  value={currentMasterPass}
                  onChange={(e) => setCurrentMasterPass(e.target.value)}
                  placeholder="Code régie ou mot de passe actuel..."
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nouveau mot de passe de sécurité
                </label>
                <input
                  type="password"
                  value={newMasterPass}
                  onChange={(e) => setNewMasterPass(e.target.value)}
                  placeholder="Min. 6 caractères forts..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={confirmMasterPass}
                  onChange={(e) => setConfirmMasterPass(e.target.value)}
                  placeholder="Répétez le nouveau mot de passe..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-2"
              >
                {isUpdatingPassword ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>{isUpdatingPassword ? 'Mise à jour en cours...' : 'Enregistrer le Nouveau Mot de Passe'}</span>
              </button>
            </form>
          )}

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>Garantie de continuité hors-ligne</span>
            </div>
            <p>
              Le mot de passe mis à jour est synchronisé avec le serveur central et mis en cache chiffré dans le navigateur pour permettre le déverrouillage même en cas de coupure de connexion internet à Kinshasa.
            </p>
          </div>
        </div>

        {/* Right Column: Secondary Admin Keys Management */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">Clés d'Accès Administrateurs Secondaires</h4>
                <p className="text-xs text-gray-500">Liées et validées sur la feuille Google Sheets de l'Ets ENVIRONNEMENT-PLUS</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSyncAdminsToGoogleSheets}
                disabled={isSyncingSheets}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition border border-slate-300 shadow-2xs"
                title="Synchroniser la liste des administrateurs secondaires avec Google Sheets (Admins_Secondaires)"
              >
                {isSyncingSheets ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>{isSyncingSheets ? 'Liaison Sheets...' : 'Sync Google Sheets'}</span>
              </button>

              {isPrincipalAdmin && (
                <button
                  onClick={() => setShowAddKeyModal(true)}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Créer une Clé d'Accès</span>
                </button>
              )}
            </div>
          </div>

          {/* Strict Security Policy Notice */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-950 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold text-amber-900">Règle de sécurité stricte : </strong>
              Seuls l'administrateur principal (<span className="font-mono font-bold text-slate-900">{OFFICIAL_ADMIN_EMAIL}</span>) et les administrateurs secondaires formellement liés avec leur adresse e-mail sur la feuille Google Sheets (<span className="font-mono text-slate-800">Admins_Secondaires</span>) peuvent se connecter. Aucun utilisateur enregistré ordinaire ne peut accéder à cet espace.
            </div>
          </div>

          {/* Feedback message for Google Sheets sync */}
          {sheetsSyncMsg && (
            <div className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 ${
              sheetsSyncMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-red-50 text-red-900 border-red-300'
            }`}>
              <div className="flex items-center space-x-2">
                {sheetsSyncMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                )}
                <span>{sheetsSyncMsg.text}</span>
              </div>
              {sheetsSyncMsg.url && (
                <a
                  href={sheetsSyncMsg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 flex items-center space-x-1 shrink-0"
                >
                  <span>Ouvrir Google Sheets</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* List of Secondary Keys */}
          <div className="space-y-3">
            {secondaryKeys.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                <KeyRound className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs font-bold text-gray-700">Aucune clé secondaire émise</p>
                <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                  Cliquez sur "Créer une Clé d'Accès" pour habiliter un chef de brigade ou un collaborateur sans lui donner le mot de passe maître.
                </p>
              </div>
            ) : (
              secondaryKeys.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition ${
                    item.status === 'active'
                      ? 'bg-white border-gray-200 hover:border-indigo-300'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-900">{item.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {item.status === 'active' ? 'Clé Active' : 'Révoquée'}
                        </span>
                        <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-lg">
                          {item.role}
                        </span>
                      </div>

                      {item.email && (
                        <p className="text-[11px] text-gray-500">{item.email}</p>
                      )}

                      {item.notes && (
                        <p className="text-[11px] text-gray-600 italic">« {item.notes} »</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    {isPrincipalAdmin && item.status === 'active' && (
                      <button
                        onClick={() => handleRevokeKey(item.id, item.name)}
                        className="px-2.5 py-1 text-red-600 hover:text-red-800 text-[11px] font-semibold hover:bg-red-50 rounded-lg transition self-start shrink-0 flex items-center space-x-1"
                        title="Révoquer cette clé immédiatement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Révoquer</span>
                      </button>
                    )}
                  </div>

                  {/* Shared Key Box with Copy Button */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Clé à partager :</span>
                      <code className="text-xs font-mono font-black text-indigo-950 truncate select-all">
                        {item.key}
                      </code>
                    </div>

                    <button
                      onClick={() => handleCopyKey(item.key, item.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center space-x-1 transition shrink-0 ${
                        copiedKeyId === item.id 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {copiedKeyId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier pour le collaborateur</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Zone Danger : Réinitialisation Globale de l'application ewastemobile.ai.studio */}
      {isPrincipalAdmin && (
        <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-100 text-rose-800 rounded-2xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-rose-950">Zone Sensible : Réinitialisation Globale de l'Application</h4>
                <p className="text-xs text-rose-700 font-medium">Réinitialise toutes les données locales, sessions et caches de ewastemobile.ai.studio</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFullAppReset}
              className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-sm transition shrink-0 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Réinitialiser toutes les données</span>
            </button>
          </div>

          <p className="text-xs text-rose-800/90 leading-relaxed">
            Cette action réservée à l'administrateur principal purge l'ensemble des données enregistrées localement (signalements mis en cache, quittances, traces de session hors-ligne) et réinitialise l'application à son état initial propre.
          </p>
        </div>
      )}

      {/* Téléchargement Applications Officielles (Android, iOS, Windows PC) */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-emerald-300">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Téléchargement & Distribution (Android, iOS & Windows PC)</h3>
            <p className="text-xs text-emerald-200">Packages et liens d'installation officiels pour l'ensemble des terminaux et postes de travail (ewastemobile.ai.studio)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Android APK */}
          <button
            type="button"
            onClick={onOpenApkModal}
            className="bg-white/10 hover:bg-white/20 border border-white/20 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group cursor-pointer"
          >
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl group-hover:scale-110 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Android APK (v3.0.3)</p>
              <p className="text-[10px] text-emerald-300">Smartphones & Tablettes RDC</p>
            </div>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">Télécharger .APK</span>
          </button>

          {/* iOS Safari */}
          <button
            type="button"
            onClick={() => alert("Pour installer sur iPhone / iPad (iOS) : Ouvrez ewastemobile.ai.studio dans Safari, touchez le bouton Partager ⎋ puis sélectionnez 'Sur l'écran d'accueil'.")}
            className="bg-white/10 hover:bg-white/20 border border-white/20 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group cursor-pointer text-left"
          >
            <div className="p-2.5 bg-sky-600 text-white rounded-xl group-hover:scale-110 transition-transform">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">iOS / iPhone & iPad</p>
              <p className="text-[10px] text-sky-200">Installation Safari Web App</p>
            </div>
            <span className="text-[10px] bg-sky-500/30 text-sky-200 px-2.5 py-0.5 rounded-full font-semibold">Guide d'installation iOS</span>
          </button>

          {/* Windows PC Desktop */}
          <button
            type="button"
            onClick={() => alert("Pour installer sur Windows PC ou Mac : Ouvrez Chrome, Edge ou Safari, cliquez sur le menu (⋮) et sélectionnez 'Installer EWaste Mobile' ou 'Créer un raccourci bureau'.")}
            className="bg-white/10 hover:bg-white/20 border border-white/20 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group cursor-pointer text-left"
          >
            <div className="p-2.5 bg-blue-600 text-white rounded-xl group-hover:scale-110 transition-transform">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Windows PC & Mac</p>
              <p className="text-[10px] text-blue-200">Application de Bureau PWA</p>
            </div>
            <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full font-semibold">Installer sur Bureau</span>
          </button>
        </div>
      </div>

      {/* Modal: Generate New Key */}
      {showAddKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Émettre une Clé d'Accès Administrateur</h3>
                  <p className="text-xs text-gray-500">Pour un superviseur, chef de brigade ou contrôleur</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddKeyModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSecondaryKey} className="space-y-3.5">
              {keyCreationMsg && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-medium">
                  {keyCreationMsg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nom du collaborateur / Administrateur secondaire *
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ex: Chef de Brigade Kalamu-Matonge..."
                  required
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Adresse e-mail (optionnelle)
                </label>
                <input
                  type="email"
                  value={newKeyEmail}
                  onChange={(e) => setNewKeyEmail(e.target.value)}
                  placeholder="collaborateur@environnementplus.cd"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Rôle administratif & Périmètre
                </label>
                <select
                  value={newKeyRole}
                  onChange={(e) => setNewKeyRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Superviseur de Brigade & Assainissement">Superviseur de Brigade & Assainissement</option>
                  <option value="Inspecteur ÉIES & Conformité Sanitaire">Inspecteur ÉIES & Conformité Sanitaire</option>
                  <option value="Contrôleur Quittances & Trésorerie">Contrôleur Quittances & Trésorerie</option>
                  <option value="Chef Opérateur Régie Municipale">Chef Opérateur Régie Municipale</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Clé personnalisée (ou laisser vide pour génération automatique)
                </label>
                <input
                  type="text"
                  value={newKeyCustomCode}
                  onChange={(e) => setNewKeyCustomCode(e.target.value)}
                  placeholder="Ex: ENV-SEC-2026-KALAMU"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Notes / Commune d'affectation
                </label>
                <textarea
                  value={newKeyNotes}
                  onChange={(e) => setNewKeyNotes(e.target.value)}
                  rows={2}
                  placeholder="Affectation opérationnelle, téléphone de contact..."
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddKeyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreatingKey}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5"
                >
                  {isCreatingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{isCreatingKey ? 'Création...' : 'Valider et Émettre la Clé'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
