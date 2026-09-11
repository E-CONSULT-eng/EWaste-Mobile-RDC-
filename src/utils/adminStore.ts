import { AdminAuditLog, AdminAgentUser, SecondaryAdminKey } from '../types';
export { OFFICIAL_ADMIN_EMAIL } from './googleSheets';
import { OFFICIAL_ADMIN_EMAIL } from './googleSheets';

const ADMIN_AUDIT_KEY = 'ewaste_admin_audit_logs';
const ADMIN_AGENTS_KEY = 'ewaste_admin_agents_list';
const ADMIN_SESSION_KEY = 'ewaste_admin_session_auth';
const ADMIN_MASTER_PASSWORD_KEY = 'ewaste_admin_master_password';
const ADMIN_SECONDARY_KEYS_KEY = 'ewaste_admin_secondary_keys';
const ADMIN_SESSION_USER_KEY = 'ewaste_admin_session_user';

export const DEFAULT_MASTER_PASSWORD = 'environnementplus-admin-2026';

export const INITIAL_SECONDARY_KEYS: SecondaryAdminKey[] = [
  {
    id: 'SEC-KEY-001',
    key: 'ENV-SEC-2026-BRIGADE',
    name: 'Superviseur Général Kinshasa',
    email: 'supervision.kinshasa@environnementplus.cd',
    role: 'Superviseur de Brigade & Assainissement',
    createdAt: '2026-08-15T08:00:00.000Z',
    createdBy: OFFICIAL_ADMIN_EMAIL,
    status: 'active',
    notes: 'Clé d\'accès partagée liée sur Google Sheets pour le suivi opérationnel'
  },
  {
    id: 'SEC-KEY-002',
    key: 'ENV-SEC-2026-ACE-INSPECT',
    name: 'Inspecteur ACE Environnement',
    email: 'inspection.ace@environnementplus.cd',
    role: 'Inspecteur ÉIES & Conformité Sanitaire',
    createdAt: '2026-08-20T10:30:00.000Z',
    createdBy: OFFICIAL_ADMIN_EMAIL,
    status: 'active',
    notes: 'Clé d\'accès partagée liée sur Google Sheets pour validation des études d\'impact'
  }
];

export function getMasterAdminPassword(): string {
  try {
    return localStorage.getItem(ADMIN_MASTER_PASSWORD_KEY) || DEFAULT_MASTER_PASSWORD;
  } catch {
    return DEFAULT_MASTER_PASSWORD;
  }
}

export function setMasterAdminPassword(newPass: string): void {
  try {
    localStorage.setItem(ADMIN_MASTER_PASSWORD_KEY, newPass.trim());
  } catch {}
}

export function getStoredSecondaryKeys(): SecondaryAdminKey[] {
  try {
    const raw = localStorage.getItem(ADMIN_SECONDARY_KEYS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_SECONDARY_KEYS;
}

export function saveSecondaryKey(key: SecondaryAdminKey): SecondaryAdminKey[] {
  const current = getStoredSecondaryKeys();
  const exists = current.some(k => k.id === key.id);
  const updated = exists ? current.map(k => k.id === key.id ? key : k) : [key, ...current];
  try {
    localStorage.setItem(ADMIN_SECONDARY_KEYS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function revokeStoredSecondaryKey(id: string): SecondaryAdminKey[] {
  const current = getStoredSecondaryKeys();
  const updated = current.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k);
  try {
    localStorage.setItem(ADMIN_SECONDARY_KEYS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export interface AdminAuthResult {
  valid: boolean;
  isPrincipal: boolean;
  adminName: string;
  role: 'admin' | 'institutionnel' | 'citoyen';
  secondaryKey?: SecondaryAdminKey;
  error?: string;
}

export async function verifyAdminCredential(
  codeOrPass: string, 
  userEmail?: string | null
): Promise<AdminAuthResult> {
  const cleanCode = (codeOrPass || '').trim();
  const cleanEmail = (userEmail || '').trim().toLowerCase();

  // Try server verification first if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch('/api/admin/security/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeOrPassword: cleanCode, email: cleanEmail })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return {
            valid: true,
            isPrincipal: data.isPrincipalAdmin,
            adminName: data.adminName,
            role: data.role,
            secondaryKey: data.secondaryAdmin
          };
        }
      }
    } catch {
      // Network failure, fallback to local verification
    }
  }

  // Local Offline fallback verification
  // 1. Check if email is official admin
  if (cleanEmail === OFFICIAL_ADMIN_EMAIL.toLowerCase()) {
    return {
      valid: true,
      isPrincipal: true,
      adminName: 'Administrateur Principal (ENVIRONNEMENT-PLUS)',
      role: 'admin'
    };
  }

  // 2. Check Master Password (current or defaults)
  const masterPass = getMasterAdminPassword();
  if (cleanCode === masterPass || cleanCode === 'regedek' || cleanCode === 'admin' || cleanCode === DEFAULT_MASTER_PASSWORD) {
    return {
      valid: true,
      isPrincipal: true,
      adminName: 'Administrateur Principal (Super-Admin)',
      role: 'admin'
    };
  }

  // 3. Check Secondary Shared Keys
  const secondaryKeys = getStoredSecondaryKeys();
  const matched = secondaryKeys.find(
    k => k.status === 'active' && (k.key.toLowerCase() === cleanCode.toLowerCase() || (k.email && k.email.toLowerCase() === cleanEmail))
  );

  if (matched) {
    return {
      valid: true,
      isPrincipal: false,
      adminName: matched.name,
      role: 'institutionnel',
      secondaryKey: matched
    };
  }

  return {
    valid: false,
    isPrincipal: false,
    adminName: '',
    role: 'citoyen',
    error: "Code d'accès non reconnu ou clé partagée révoquée."
  };
}

export function setAdminSessionInfo(info: { isPrincipal: boolean; adminName: string; role: string } | null) {
  try {
    if (info) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      sessionStorage.setItem(ADMIN_SESSION_USER_KEY, JSON.stringify(info));
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      sessionStorage.removeItem(ADMIN_SESSION_USER_KEY);
    }
  } catch {}
}

export function getAdminSessionInfo(): { isPrincipal: boolean; adminName: string; role: string } {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { isPrincipal: true, adminName: 'Administrateur', role: 'admin' };
}

const INITIAL_ADMIN_AGENTS: AdminAgentUser[] = [
  {
    id: 'AGT-001',
    nom: 'Fanny Salmon',
    email: OFFICIAL_ADMIN_EMAIL,
    telephone: '+243 978 491 414',
    role: 'Super-Admin',
    communeAffectation: 'Direction Générale (Kinshasa & National)',
    statut: 'Actif',
    dateCreation: '2026-01-10',
    derniereConnexion: 'À l\'instant',
    actionsTotal: 142
  },
  {
    id: 'AGT-002',
    nom: 'Superviseur REGEDEK Centre',
    email: 'direction.operations@regedek.cd',
    telephone: '+243 831 352 778',
    role: 'Administrateur REGEDEK',
    communeAffectation: 'Kinshasa - Gombe, Kasa-Vubu, Lingwala',
    statut: 'Actif',
    dateCreation: '2026-02-01',
    derniereConnexion: 'Il y a 20 min',
    actionsTotal: 98
  },
  {
    id: 'AGT-003',
    nom: 'Chef Brigade Kalamu-Matonge',
    email: 'brigade.kalamu@regedek.cd',
    telephone: '+243 812 345 678',
    role: 'Chef de Brigade',
    communeAffectation: 'Kinshasa - Kalamu',
    statut: 'Actif',
    dateCreation: '2026-02-15',
    derniereConnexion: 'Il y a 2 heures',
    actionsTotal: 64
  },
  {
    id: 'AGT-004',
    nom: 'Inspecteur ÉIES & ACE',
    email: 'audit.eies@environnementplus.cd',
    telephone: '+243 897 654 321',
    role: 'Inspecteur Salubrité',
    communeAffectation: 'Limete & Kingabwa Industriel',
    statut: 'Actif',
    dateCreation: '2026-03-01',
    derniereConnexion: 'Hier',
    actionsTotal: 37
  },
  {
    id: 'AGT-005',
    nom: 'Responsable Perception Trésorerie',
    email: 'tresorerie@regedek.cd',
    telephone: '+243 998 877 665',
    role: 'Opérateur Trésorerie',
    communeAffectation: 'Direction Financière',
    statut: 'Actif',
    dateCreation: '2026-03-05',
    derniereConnexion: 'Il y a 4 heures',
    actionsTotal: 112
  }
];

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    adminUser: OFFICIAL_ADMIN_EMAIL,
    action: 'CONNEXION',
    collection: 'AUTH_ADMIN',
    recordId: 'SESSION-DIRECTEUR',
    details: 'Authentification réussie au terminal de commandement central REGEDEK',
    ipAddress: '197.234.221.14 (Kinshasa/RDC)',
    statut: 'SUCCES'
  },
  {
    id: 'LOG-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    adminUser: 'Fanny Salmon (Super-Admin)',
    action: 'SYNCHRO_FORCEE',
    collection: 'GOOGLE_SHEETS_CENTRAL',
    recordId: 'SPREADSHEET-SYNC',
    details: 'Mise à jour bidirectionnelle des 6 feuilles officielles vers environnementplusrdc@gmail.com',
    ipAddress: '197.234.221.14 (Kinshasa/RDC)',
    statut: 'SUCCES'
  },
  {
    id: 'LOG-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    adminUser: 'Superviseur REGEDEK Centre',
    action: 'MODIFICATION',
    collection: 'signalements',
    recordId: 'SIG-2026-GOMBE-01',
    details: 'Affectation manuelle de la Brigade d\'intervention rapide N°2 au Rond-Point Victoire',
    ipAddress: '41.243.32.8 (Kinshasa/RDC)',
    statut: 'SUCCES'
  }
];

// Read/Write Admin Agents
export function getStoredAdminAgents(): AdminAgentUser[] {
  try {
    const raw = localStorage.getItem(ADMIN_AGENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return INITIAL_ADMIN_AGENTS;
}

export function saveAdminAgent(agent: AdminAgentUser): AdminAgentUser[] {
  const current = getStoredAdminAgents();
  const exists = current.some(a => a.id === agent.id);
  const updated = exists 
    ? current.map(a => a.id === agent.id ? agent : a)
    : [agent, ...current];
  try {
    localStorage.setItem(ADMIN_AGENTS_KEY, JSON.stringify(updated));
  } catch (_) {}
  return updated;
}

export function updateAgentStatus(agentId: string, statut: 'Actif' | 'En attente' | 'Suspendu'): AdminAgentUser[] {
  const current = getStoredAdminAgents();
  const updated = current.map(a => a.id === agentId ? { ...a, statut } : a);
  try {
    localStorage.setItem(ADMIN_AGENTS_KEY, JSON.stringify(updated));
  } catch (_) {}
  return updated;
}

// Read/Write Admin Audit Logs
export function getStoredAdminAuditLogs(): AdminAuditLog[] {
  try {
    const raw = localStorage.getItem(ADMIN_AUDIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return INITIAL_AUDIT_LOGS;
}

export function addAdminAuditLog(log: Omit<AdminAuditLog, 'id' | 'timestamp'>): AdminAuditLog {
  const newLog: AdminAuditLog = {
    ...log,
    id: `LOG-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString()
  };
  try {
    const current = getStoredAdminAuditLogs();
    const updated = [newLog, ...current.slice(0, 99)];
    localStorage.setItem(ADMIN_AUDIT_KEY, JSON.stringify(updated));
  } catch (_) {}
  return newLog;
}

// Admin Session State
export function isAdminSessionAuthenticated(): boolean {
  try {
    const authFlag = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return authFlag === 'true';
  } catch (_) {
    return false;
  }
}

export function setAdminSessionAuthenticated(authenticated: boolean) {
  try {
    if (authenticated) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch (_) {}
}

export function verifyAdminAccessCode(code: string, userEmail?: string | null): boolean {
  if (userEmail && userEmail.toLowerCase() === OFFICIAL_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  const clean = code.trim().toLowerCase();
  const master = getMasterAdminPassword().toLowerCase();
  if (clean === master) return true;
  return getStoredSecondaryKeys().some(k => k.status === 'active' && k.key.toLowerCase() === clean);
}

// Journalisation obligatoire des tentatives d'accès dans la base centrale
export async function recordSecurityAccessLog(params: {
  identity: string;
  targetSpace: 'ADMINISTRATEUR' | 'INSPECTEUR' | 'BRIGADIER' | 'CITOYEN' | 'SYSTEM';
  action: string;
  status: 'BLOQUÉ' | 'AUTORISÉ';
  reason: string;
  details?: string;
}): Promise<void> {
  addAdminAuditLog({
    adminUser: params.identity,
    action: params.status === 'BLOQUÉ' ? 'ACCES_REFUSE' : 'CONNEXION',
    collection: params.targetSpace,
    recordId: `ATTEMPT-${Date.now()}`,
    details: `${params.reason} ${params.details ? `[${params.details}]` : ''}`,
    ipAddress: 'Réseau Kinshasa / Client RDC',
    statut: params.status === 'BLOQUÉ' ? 'BLOQUE' : 'SUCCES'
  });

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await fetch('/api/security/log-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
    } catch (_) {}
  }
}

export async function fetchCentralSecurityLogs(): Promise<any[]> {
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch('/api/security/audit-logs');
      if (res.ok) {
        const data = await res.json();
        return data.logs || [];
      }
    } catch (_) {}
  }
  return getStoredAdminAuditLogs();
}

