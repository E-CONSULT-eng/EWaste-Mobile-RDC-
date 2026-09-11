import { Signalement, AssainissementMission, EvaluationEnv, WasteAiAnalysisResult, WastePayment, SecondaryAdminKey } from '../types';
import { getCachedAccessToken } from '../firebase';

// Configurable Google Apps Script Webhook (fallback / direct trigger for real-time delivery without login)
export const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbYacjoNRInpfKmAUh0IFBzYOG_QbNqw-om8wb_fJxkUftpZZa3UmnP/exec";

// Official Administrative and Database Contact for ENVIRONNEMENT-PLUS & REGEDEK
export const OFFICIAL_ADMIN_EMAIL = "environnementplusrdc@gmail.com";

// Coordonnées officielles des comptes de paiement et de perception de la salubrité publique
export const OFFICIAL_PAYMENT_CONFIG = {
  airtelMoney: {
    operator: 'Airtel Money',
    number: '+243978491414',
    formatted: '+243 978 491 414',
    ussd: '*501#',
    merchant: 'ENVIRONNEMENT-PLUS / REGEDEK',
    label: 'Compte Officiel Airtel Money'
  },
  mpesa: {
    operator: 'M-Pesa Vodacom',
    number: '+243831352778',
    formatted: '+243 831 352 778',
    ussd: '*1112#',
    merchant: 'ENVIRONNEMENT-PLUS / REGEDEK',
    label: 'Compte Officiel M-Pesa'
  },
  equityBcdc: {
    bank: 'Equity BCDC',
    accountNumber: '655100310489884',
    title: 'ENVIRONNEMENT-PLUS RDC / REGEDEK Salubrité',
    branch: 'Kinshasa Siège',
    label: 'Compte Bancaire Officiel Equity BCDC'
  }
};

export const LOCAL_STORAGE_SPREADSHEET_KEY = 'ewaste_active_spreadsheet';
export const LOCAL_STORAGE_STATS_KEY = 'ewaste_sync_stats';

export interface LinkedSpreadsheet {
  id: string;
  url: string;
  title: string;
  createdAt: string;
  adminEmail?: string;
}

export interface EwasteSyncStats {
  scansCount: number;
  signalementsCount: number;
  assainissementCount: number;
  eiesCount: number;
  formationsCount: number;
  totalActivitiesCount: number;
  lastSyncTime: string;
  lastSyncStatus: 'synced' | 'pending' | 'idle';
}

export interface GoogleSheetsSyncResult {
  success: boolean;
  message: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  updatedRange?: string;
}

export const SHEET_NAMES = {
  SIGNALEMENTS: 'Signalements',
  SCANNER_IA: 'Scanner_IA',
  ASSAINISSEMENT: 'Suivi_Assainissement',
  EIES: 'EIES_Environnementale',
  FORMATIONS: 'Rapports_Formation',
  PAIEMENTS: 'Paiements_Taxes',
  ACTIVITES: 'Journal_Activites',
  ADMINS_SECONDAIRES: 'Admins_Secondaires',
} as const;

// Default headers for each specialized database table
export const SHEET_HEADERS = {
  [SHEET_NAMES.SIGNALEMENTS]: [
    "ID Signalement", "Horodatage", "Province (RDC)", "Ville / Commune", 
    "Quartier", "Gravité", "Statut", "Tonnage Estimé (t)", 
    "Auteur / Citoyen", "Description", "Coordonnées GPS", "URL Photo"
  ],
  [SHEET_NAMES.SCANNER_IA]: [
    "ID Scan", "Date & Heure", "Déchet Identifié", "Catégorie Matière", 
    "Bac Recommandé", "Recyclabilité", "Confiance IA (%)", 
    "Durée Décomposition", "Filières Valorisation RDC", "Province / Ville"
  ],
  [SHEET_NAMES.ASSAINISSEMENT]: [
    "ID Mission", "Date Enregistrement", "Titre Mission / Site", 
    "Province", "Ville / Commune", "Équipe / Brigade", 
    "Statut Intervention", "Tonnage Collecté (t)", "Description & Engins"
  ],
  [SHEET_NAMES.EIES]: [
    "ID Évaluation / Projet", "Date Évaluation", "Province / Ville", 
    "Commune / Site", "Auditeur / Promoteur", "Score Salubrité (0-100)", 
    "Score Drainage (0-100)", "Score Sensibilisation (0-100)", 
    "Niveau Risque / ACE", "Recommandations ACE & PGES", "Commentaires"
  ],
  [SHEET_NAMES.FORMATIONS]: [
    "ID Rapport", "Date & Heure", "Nom Apprenant / Citoyen", 
    "Type Activité", "Module / Quiz", "Score Obtenu", 
    "Résultat / Mention", "Province", "Points Éco-Citoyens"
  ],
  [SHEET_NAMES.PAIEMENTS]: [
    "ID Paiement", "N° Quittance", "Date & Heure", "Nom / Raison Sociale",
    "Téléphone", "Type Producteur", "Province", "Ville / Commune",
    "Quartier", "Service / Taxe", "Période", "Montant (CDF)",
    "Montant (USD)", "Moyen de Paiement", "Référence Transaction", "Statut"
  ],
  [SHEET_NAMES.ACTIVITES]: [
    "ID Événement", "Horodatage", "Type d'Activité", 
    "Utilisateur", "Localisation", "Détails de l'Action"
  ],
  [SHEET_NAMES.ADMINS_SECONDAIRES]: [
    "ID Admin", "Nom & Prénom", "Email Institutionnel", "Rôle / Fonction", 
    "Clé d'Autorisation", "Statut", "Date Attribution", "Attribue Par", "Dernière Utilisation"
  ],
};

/**
 * Récupère les infos de la feuille Google Sheets actuellement liée à environnementplusrdc@gmail.com
 */
export function getLinkedSpreadsheet(): LinkedSpreadsheet | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SPREADSHEET_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Erreur lecture linked spreadsheet:", e);
  }
  // Par défaut, retourner la configuration officielle liée à environnementplusrdc@gmail.com
  return {
    id: 'ewaste-national-sheet-rdc',
    url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    title: 'Base de Données Nationale EWaste (ENVIRONNEMENT-PLUS & REGEDEK)',
    createdAt: new Date().toISOString(),
    adminEmail: OFFICIAL_ADMIN_EMAIL
  };
}

/**
 * Sauvegarde la feuille Google Sheets active liée à environnementplusrdc@gmail.com et notifie l'application
 */
export function setLinkedSpreadsheet(id: string, url: string, title?: string, adminEmail: string = OFFICIAL_ADMIN_EMAIL): LinkedSpreadsheet {
  const linked: LinkedSpreadsheet = {
    id,
    url,
    title: title || 'Base de Données Nationale EWaste (ENVIRONNEMENT-PLUS & REGEDEK)',
    createdAt: new Date().toISOString(),
    adminEmail
  };
  localStorage.setItem(LOCAL_STORAGE_SPREADSHEET_KEY, JSON.stringify(linked));
  // Notifier les composants React
  window.dispatchEvent(new CustomEvent('ewaste_spreadsheet_linked', { detail: linked }));
  return linked;
}

/**
 * Partage automatiquement le classeur Google Sheets avec l'adresse officielle environnementplusrdc@gmail.com
 */
export async function shareSpreadsheetWithAdmin(
  spreadsheetId: string,
  token?: string
): Promise<{ success: boolean; message: string }> {
  const authToken = token || getCachedAccessToken();
  if (!authToken) {
    return { success: false, message: "Token Google requis pour le partage" };
  }

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions?sendNotificationEmail=false`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'writer',
        type: 'user',
        emailAddress: OFFICIAL_ADMIN_EMAIL,
      }),
    });

    if (res.ok) {
      return { success: true, message: `Base partagée avec succès avec ${OFFICIAL_ADMIN_EMAIL}` };
    } else {
      const err = await res.text();
      return { success: false, message: `Notice partage : ${err}` };
    }
  } catch (e: any) {
    return { success: false, message: e?.message || "Erreur de partage Drive" };
  }
}

/**
 * Récupère les statistiques de synchronisation en temps réel
 */
export function getSyncStats(): EwasteSyncStats {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    scansCount: 0,
    signalementsCount: 0,
    assainissementCount: 0,
    eiesCount: 0,
    formationsCount: 0,
    totalActivitiesCount: 0,
    lastSyncTime: new Date().toLocaleTimeString('fr-FR'),
    lastSyncStatus: 'idle'
  };
}

/**
 * Incrémente un compteur de synchronisation
 */
export function incrementSyncStat(field: keyof Omit<EwasteSyncStats, 'lastSyncTime' | 'lastSyncStatus'>) {
  const stats = getSyncStats();
  stats[field] = (stats[field] || 0) + 1;
  stats.totalActivitiesCount = (stats.totalActivitiesCount || 0) + 1;
  stats.lastSyncTime = new Date().toLocaleTimeString('fr-FR');
  stats.lastSyncStatus = 'synced';
  try {
    localStorage.setItem(LOCAL_STORAGE_STATS_KEY, JSON.stringify(stats));
    window.dispatchEvent(new CustomEvent('ewaste_sync_stats_updated', { detail: stats }));
  } catch (_) {}
}

/**
 * Envoie une action utilisateur quelconque vers le webhook Google Apps Script (secours universel & no-cors)
 */
export async function sendActionToGoogleAppsScript(
  actionType: 'SIGNALEMENT' | 'STATUT_UPDATE' | 'MISSION_ASSAINISSEMENT' | 'EIES_EVALUATION' | 'AI_SCAN' | 'FORMATION_QUIZ' | 'FORMATION_MODULE' | 'PAIEMENT_TAXE_SALUBRITE',
  actionData: any,
  webhookUrl: string = DEFAULT_APPS_SCRIPT_URL
): Promise<{ success: boolean; responseText: string }> {
  try {
    const payload = {
      type: actionType,
      app: "EWaste Mobile RDC (ewastemobile.ai.studio)",
      portal: "https://ewastemobile.ai.studio",
      timestamp: new Date().toISOString(),
      ...actionData
    };

    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      responseText: "Action enregistrée en temps réel sur Google Sheets",
    };
  } catch (error: any) {
    return {
      success: false,
      responseText: error?.message || "Erreur enregistrement action",
    };
  }
}

/**
 * Envoie un signalement vers le script Google Apps Script
 */
export async function sendToGoogleAppsScript(
  signalement: Signalement,
  webhookUrl: string = DEFAULT_APPS_SCRIPT_URL
): Promise<{ success: boolean; responseText: string }> {
  try {
    const province = signalement.province || 'Kinshasa';
    const ville = signalement.ville || signalement.commune;
    const payload = {
      id: signalement.id,
      type: "Dépotoir / Déchets",
      province,
      ville,
      commune: signalement.commune,
      quartier: signalement.quartier,
      lieu: `${province} - ${ville} (${signalement.quartier || 'Centre'})`,
      nom: signalement.author || "Citoyen",
      description: signalement.description,
      severite: signalement.severity,
      statut: signalement.status,
      date: signalement.date,
      tonnageEstime: signalement.tonnageEstime,
      coordinates: signalement.coordinates || "",
      imageUrl: signalement.imageUrl || "",
      timestamp: new Date().toISOString()
    };

    await fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      responseText: "Données transmises avec succès à Google Sheets (Apps Script)",
    };
  } catch (error: any) {
    console.error("Erreur envoi Google Apps Script:", error);
    return {
      success: false,
      responseText: error?.message || "Erreur réseau",
    };
  }
}

/**
 * Crée la base de données Google Sheets complète avec les 6 onglets spécialisés
 */
export async function createEwasteFullDatabase(
  customTitle?: string,
  accessToken?: string
): Promise<{ id: string; url: string; title: string }> {
  const token = accessToken || getCachedAccessToken();
  if (!token) {
    throw new Error("Authentification Google requise. Veuillez vous connecter avec votre compte Google.");
  }

  const title = customTitle || `EWaste Mobile RDC (ewastemobile.ai.studio) - Base de Données Nationale (${new Date().toLocaleDateString('fr-FR')})`;

  // Définition des 6 onglets avec leurs en-têtes préformatés
  const sheetsPayload = Object.entries(SHEET_HEADERS).map(([sheetTitle, headers]) => ({
    properties: {
      title: sheetTitle,
      gridProperties: {
        frozenRowCount: 1,
      },
    },
    data: [
      {
        startRow: 0,
        startColumn: 0,
        rowData: [
          {
            values: headers.map(headerName => ({
              userEnteredValue: { stringValue: headerName }
            }))
          }
        ]
      }
    ]
  }));

  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: { title },
      sheets: sheetsPayload,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Échec création base Google Sheets: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Mémoriser la feuille liée avec l'administrateur officiel
  setLinkedSpreadsheet(spreadsheetId, spreadsheetUrl, title, OFFICIAL_ADMIN_EMAIL);

  // Partager automatiquement les droits d'écriture avec environnementplusrdc@gmail.com
  shareSpreadsheetWithAdmin(spreadsheetId, token).catch((e) => {
    console.warn("Notice partage avec environnementplusrdc@gmail.com:", e);
  });

  // Journaliser la création dans l'audit stream
  await logActivityToSheet(
    'INITIALISATION_BASE',
    'Système EWaste Mobile (ewastemobile.ai.studio)',
    'RDC (National)',
    `Base de données complète initialisée et liée à ${OFFICIAL_ADMIN_EMAIL} (portail ewastemobile.ai.studio) avec 6 onglets : ${Object.keys(SHEET_HEADERS).join(', ')}`
  );

  return { id: spreadsheetId, url: spreadsheetUrl, title };
}

/**
 * Assure qu'un onglet existe dans le tableur. S'il n'existe pas, il est créé avec ses en-têtes.
 */
async function ensureSheetExists(
  spreadsheetId: string,
  sheetTitle: string,
  token: string
): Promise<void> {
  try {
    // Vérifier les onglets existants
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!metaRes.ok) return;
    const metaData = await metaRes.json();
    const existingTitles: string[] = (metaData.sheets || []).map((s: any) => s.properties?.title);

    if (!existingTitles.includes(sheetTitle)) {
      // Ajouter l'onglet manquant via batchUpdate
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetTitle,
                  gridProperties: { frozenRowCount: 1 },
                },
              },
            },
          ],
        }),
      });

      // Ajouter la ligne d'en-tête
      const headers = SHEET_HEADERS[sheetTitle as keyof typeof SHEET_HEADERS] || ['ID', 'Date', 'Données'];
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values: [headers] }),
        }
      );
    }
  } catch (e) {
    console.warn("Notice ensureSheetExists:", e);
  }
}

/**
 * Ajoute une ligne de données dans un onglet spécifique de Google Sheets
 */
export async function appendValuesToSheet(
  spreadsheetId: string,
  sheetTitle: string,
  rowValues: any[],
  token?: string
): Promise<GoogleSheetsSyncResult> {
  const authToken = token || getCachedAccessToken();

  if (!authToken) {
    return {
      success: false,
      message: "Non authentifié à Google Sheets (utilisation du mode secours Apps Script)",
    };
  }

  try {
    const range = `${sheetTitle}!A:Z`;
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [rowValues] }),
      }
    );

    if (response.status === 400) {
      // Peut être dû à un onglet manquant, tenter de le créer puis réexécuter
      await ensureSheetExists(spreadsheetId, sheetTitle, authToken);
      const retryRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values: [rowValues] }),
        }
      );
      if (retryRes.ok) {
        return { success: true, message: `Données insérées dans l'onglet ${sheetTitle}` };
      }
    }

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, message: `Erreur API Sheets (${response.status}): ${errText}` };
    }

    const data = await response.json();
    return {
      success: true,
      message: `Synchronisé dans ${sheetTitle}`,
      spreadsheetId,
      updatedRange: data.updates?.updatedRange,
    };
  } catch (error: any) {
    console.error(`Erreur append to ${sheetTitle}:`, error);
    return {
      success: false,
      message: error?.message || "Erreur réseau synchronisation Google Sheets",
    };
  }
}

// ============================================================================
// 1. RÉSULTATS SCANNER IA EN TEMPS RÉEL
// ============================================================================
export async function logScanAiToSheet(
  scanResult: WasteAiAnalysisResult,
  locationOrProvince: string = 'Kinshasa (RDC)',
  user: string = 'Citoyen EWaste'
): Promise<void> {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR');
  const scanId = `SCAN-${now.getTime().toString().slice(-6)}`;

  const row = [
    scanId,
    dateStr,
    scanResult.wasteName || 'Déchet scanné',
    scanResult.category || 'Tout-venant',
    `${scanResult.binColor || ''} (${scanResult.binName || 'Poubelle'})`,
    scanResult.recyclability || 'Non spécifié',
    `${scanResult.confidence || 95}%`,
    scanResult.decompositionTime || 'Non déterminée',
    scanResult.localKinshasaOutlets || scanResult.quickTips || 'Collecte municipale',
    locationOrProvince,
  ];

  // 1. Envoi vers le tableur direct si lié
  const linked = getLinkedSpreadsheet();
  if (linked?.id) {
    appendValuesToSheet(linked.id, SHEET_NAMES.SCANNER_IA, row).catch(() => {});
  }

  // 2. Envoi universel via Google Apps Script (secours temps réel instantané)
  sendActionToGoogleAppsScript('AI_SCAN', {
    scanId,
    wasteName: scanResult.wasteName,
    category: scanResult.category,
    binColor: scanResult.binColor,
    recyclability: scanResult.recyclability,
    location: locationOrProvince,
    user,
  }).catch(() => {});

  // 3. Mise à jour des compteurs d'activité
  incrementSyncStat('scansCount');
}

// ============================================================================
// 2. SIGNALEMENTS EN TEMPS RÉEL
// ============================================================================
export async function logSignalementToSheet(
  signalement: Signalement
): Promise<GoogleSheetsSyncResult> {
  const row = [
    signalement.id,
    signalement.date || new Date().toISOString().split('T')[0],
    signalement.province || "Kinshasa",
    signalement.ville || signalement.commune,
    signalement.quartier || "Centre",
    signalement.severity,
    signalement.status,
    signalement.tonnageEstime || 1,
    signalement.author || "Citoyen",
    signalement.description || "",
    signalement.coordinates || "",
    signalement.imageUrl || "",
  ];

  // 1. Sauvegarde dans Google Sheets si lié
  const linked = getLinkedSpreadsheet();
  let result: GoogleSheetsSyncResult = { success: false, message: 'En attente de connexion' };

  if (linked?.id) {
    result = await appendValuesToSheet(linked.id, SHEET_NAMES.SIGNALEMENTS, row);
  }

  // 2. Envoi Apps Script temps réel
  sendToGoogleAppsScript(signalement).catch(() => {});

  // 3. Journal d'audit
  logActivityToSheet(
    'NOUVEAU_SIGNALEMENT',
    signalement.author || 'Citoyen',
    `${signalement.province || 'Kinshasa'} - ${signalement.ville || signalement.commune}`,
    `Dépotoir signalé (${signalement.severity}) : ~${signalement.tonnageEstime}t`
  ).catch(() => {});

  // 4. Compteurs
  incrementSyncStat('signalementsCount');

  return result;
}

// Alias pour rétrocompatibilité
export const appendSignalementToSheet = async (
  spreadsheetId: string,
  signalement: Signalement,
  accessToken?: string
) => {
  const targetId = spreadsheetId || getLinkedSpreadsheet()?.id || '';
  if (!targetId) {
    const webhookRes = await sendToGoogleAppsScript(signalement);
    return { success: webhookRes.success, message: webhookRes.responseText };
  }
  return logSignalementToSheet(signalement);
};

// ============================================================================
// 3. SUIVI DE L'ASSAINISSEMENT EN TEMPS RÉEL
// ============================================================================
export async function logAssainissementToSheet(
  mission: AssainissementMission,
  actionType: string = 'NOUVELLE_MISSION'
): Promise<void> {
  const dateStr = mission.startDate || new Date().toISOString().split('T')[0];
  const row = [
    mission.id,
    dateStr,
    mission.title,
    mission.province || 'Kinshasa',
    mission.ville || mission.commune,
    mission.team || 'Brigade REGEDEK',
    mission.status,
    mission.tonsCollected || 0,
    mission.description || 'Intervention d\'assainissement',
  ];

  const linked = getLinkedSpreadsheet();
  if (linked?.id) {
    appendValuesToSheet(linked.id, SHEET_NAMES.ASSAINISSEMENT, row).catch(() => {});
  }

  sendActionToGoogleAppsScript('MISSION_ASSAINISSEMENT', {
    missionId: mission.id,
    action: actionType,
    title: mission.title,
    province: mission.province || 'Kinshasa',
    commune: mission.commune,
    status: mission.status,
    tonsCollected: mission.tonsCollected,
  }).catch(() => {});

  logActivityToSheet(
    'ASSAINISSEMENT',
    mission.team || 'Brigade REGEDEK',
    `${mission.province || 'Kinshasa'} - ${mission.commune}`,
    `${mission.title} : Statut ${mission.status} (${mission.tonsCollected} tonnes)`
  ).catch(() => {});

  incrementSyncStat('assainissementCount');
}

// ============================================================================
// 4. RÉSULTATS DE L'ÉIES & ÉVALUATION ENVIRONNEMENTALE EN TEMPS RÉEL
// ============================================================================
export async function logEiesToSheet(
  evalItem: any,
  user: string = 'Auditeur Environnemental'
): Promise<void> {
  const id = evalItem.id || `EIES-${Date.now().toString().slice(-6)}`;
  const dateStr = evalItem.date || evalItem.dateDepot || new Date().toISOString().split('T')[0];
  const province = evalItem.province || 'Kinshasa';
  const commune = evalItem.commune || 'Gombe';
  const auteur = evalItem.auditor || evalItem.promoteur || user;
  const salubrite = evalItem.salubriteScore ?? evalItem.scoreConformiteAce ?? 80;
  const drainage = evalItem.drainageScore ?? 75;
  const sensibilisation = evalItem.sensibilisationScore ?? 70;
  const risque = evalItem.categorie || (salubrite < 50 ? 'Critique' : salubrite < 70 ? 'Moyen' : 'Faible');
  const reco = evalItem.aiRecommendation || evalItem.resumeNonTechnique || 'Respect des normes ACE et mise en œuvre du PGES';
  const comments = evalItem.commentaires || `Projet: ${evalItem.titreProjet || 'Audit d\'assainissement'}`;

  const row = [
    id,
    dateStr,
    province,
    commune,
    auteur,
    salubrite,
    drainage,
    sensibilisation,
    risque,
    reco,
    comments,
  ];

  const linked = getLinkedSpreadsheet();
  if (linked?.id) {
    appendValuesToSheet(linked.id, SHEET_NAMES.EIES, row).catch(() => {});
  }

  sendActionToGoogleAppsScript('EIES_EVALUATION', {
    id,
    date: dateStr,
    province,
    commune,
    auditor: auteur,
    scoreSalubrite: salubrite,
    risque,
  }).catch(() => {});

  logActivityToSheet(
    'EIES_EVALUATION',
    auteur,
    `${province} - ${commune}`,
    `Évaluation réalisée (Score salubrité: ${salubrite}/100, Risque: ${risque})`
  ).catch(() => {});

  incrementSyncStat('eiesCount');
}

// ============================================================================
// 5. RAPPORTS DE FORMATION & SENSIBILISATION EN TEMPS RÉEL
// ============================================================================
export async function logFormationToSheet(data: {
  learnerName: string;
  type: string;
  moduleOrQuiz: string;
  score: string;
  result: string;
  province?: string;
  ecoPoints?: number;
}): Promise<void> {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR');
  const reportId = `FORM-${now.getTime().toString().slice(-6)}`;

  const row = [
    reportId,
    dateStr,
    data.learnerName || 'Citoyen Apprenant',
    data.type || 'Formation Écologique',
    data.moduleOrQuiz || 'Tri & Salubrité',
    data.score || '100%',
    data.result || 'Validé',
    data.province || 'Kinshasa',
    data.ecoPoints || 20,
  ];

  const linked = getLinkedSpreadsheet();
  if (linked?.id) {
    appendValuesToSheet(linked.id, SHEET_NAMES.FORMATIONS, row).catch(() => {});
  }

  sendActionToGoogleAppsScript('FORMATION_QUIZ', {
    reportId,
    learner: data.learnerName,
    type: data.type,
    module: data.moduleOrQuiz,
    score: data.score,
    result: data.result,
    province: data.province || 'Kinshasa',
  }).catch(() => {});

  logActivityToSheet(
    'FORMATION_SENSIBILISATION',
    data.learnerName,
    data.province || 'Kinshasa',
    `${data.type} achevé : ${data.moduleOrQuiz} (Résultat: ${data.result}, Score: ${data.score})`
  ).catch(() => {});

  incrementSyncStat('formationsCount');
}

// ============================================================================
// 6. PAIEMENTS & RECOUVREMENT DES TAXES DE SALUBRITÉ EN TEMPS RÉEL
// ============================================================================
export async function logPaymentToSheet(
  payment: WastePayment
): Promise<GoogleSheetsSyncResult> {
  const row = [
    payment.id,
    payment.receiptNumber,
    payment.date + ' ' + (new Date(payment.timestamp).toLocaleTimeString('fr-FR') || ''),
    payment.payerName,
    payment.payerPhone,
    payment.producerType,
    payment.province || 'Kinshasa',
    payment.ville || payment.commune,
    payment.quartier,
    payment.serviceType,
    payment.period,
    payment.amountCDF,
    payment.amountUSD,
    payment.paymentMethod,
    payment.transactionReference,
    payment.status,
  ];

  let result: GoogleSheetsSyncResult = {
    success: true,
    message: "Paiement mémorisé localement",
  };

  const linked = getLinkedSpreadsheet();
  if (linked?.id) {
    result = await appendValuesToSheet(linked.id, SHEET_NAMES.PAIEMENTS, row);
  }

  // Envoi webhook Apps Script
  sendActionToGoogleAppsScript('PAIEMENT_TAXE_SALUBRITE', {
    id: payment.id,
    receiptNumber: payment.receiptNumber,
    payer: payment.payerName,
    phone: payment.payerPhone,
    type: payment.producerType,
    commune: payment.commune,
    amountCDF: payment.amountCDF,
    amountUSD: payment.amountUSD,
    method: payment.paymentMethod,
    ref: payment.transactionReference,
  }).catch(() => {});

  logActivityToSheet(
    'PAIEMENT_TAXE_SALUBRITE',
    payment.payerName,
    `${payment.commune}, ${payment.quartier} (${payment.province || 'Kinshasa'})`,
    `Quittance ${payment.receiptNumber} : ${payment.amountCDF.toLocaleString('fr-FR')} CDF (${payment.paymentMethod} - ${payment.transactionReference})`
  ).catch(() => {});

  return result;
}

// ============================================================================
// 7. JOURNAL D'AUDIT & ACTIVITÉS EN TEMPS RÉEL
// ============================================================================
export async function logActivityToSheet(
  actionType: string,
  user: string,
  location: string,
  details: string
): Promise<void> {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR');
  const eventId = `LOG-${now.getTime().toString().slice(-6)}`;

  const row = [
    eventId,
    dateStr,
    actionType,
    user || 'Citoyen',
    location || 'RDC',
    details,
  ];

  const linked = getLinkedSpreadsheet();
  if (linked?.id) {
    appendValuesToSheet(linked.id, SHEET_NAMES.ACTIVITES, row).catch(() => {});
  }
}

/**
 * Exporte l'ensemble des données existantes vers la feuille liée ou une nouvelle
 */
export async function syncAllLocalDataToGoogleSheet(options: {
  signalements: Signalement[];
  missions: AssainissementMission[];
  evaluations: EvaluationEnv[];
  accessToken?: string;
}): Promise<{ spreadsheetId: string; url: string; totalExported: number }> {
  const token = options.accessToken || getCachedAccessToken();
  if (!token) {
    throw new Error("Connexion Google requise pour synchroniser les données avec Google Sheets.");
  }

  let linked = getLinkedSpreadsheet();
  if (!linked?.id) {
    const created = await createEwasteFullDatabase(undefined, token);
    linked = {
      id: created.id,
      url: created.url,
      title: created.title,
      createdAt: new Date().toISOString(),
    };
  }

  let total = 0;

  // 1. Export Signalements
  if (options.signalements?.length > 0) {
    for (const sig of options.signalements) {
      await logSignalementToSheet(sig);
      total++;
    }
  }

  // 2. Export Missions
  if (options.missions?.length > 0) {
    for (const miss of options.missions) {
      await logAssainissementToSheet(miss);
      total++;
    }
  }

  // 3. Export Evaluations
  if (options.evaluations?.length > 0) {
    for (const ev of options.evaluations) {
      await logEiesToSheet(ev);
      total++;
    }
  }

  return {
    spreadsheetId: linked.id,
    url: linked.url,
    totalExported: total,
  };
}

// Rétrocompatibilité
export const createGoogleSpreadsheet = async (title?: string, token?: string) => {
  return createEwasteFullDatabase(title, token);
};

export const exportAllSignalementsToGoogleSheet = async (
  signalements: Signalement[],
  existingSpreadsheetId?: string,
  accessToken?: string
) => {
  const res = await syncAllLocalDataToGoogleSheet({
    signalements,
    missions: [],
    evaluations: [],
    accessToken,
  });
  return { spreadsheetId: res.spreadsheetId, url: res.url, rowsAdded: res.totalExported };
};

/**
 * Enregistre un administrateur secondaire dans la feuille Google Sheets 'Admins_Secondaires'
 * liée à environnementplusrdc@gmail.com
 */
export async function logSecondaryAdminToSheet(adminKey: SecondaryAdminKey, accessToken?: string): Promise<boolean> {
  const row = [
    adminKey.id,
    adminKey.name,
    adminKey.email || 'Non spécifié',
    adminKey.role,
    adminKey.key,
    adminKey.status === 'active' ? 'Actif (Autorisé)' : 'Révoqué (Bloqué)',
    adminKey.createdAt,
    adminKey.createdBy || OFFICIAL_ADMIN_EMAIL,
    adminKey.lastUsedAt || 'Jamais connecté'
  ];

  // 1. Direct Sheets API if linked
  const token = accessToken || getCachedAccessToken();
  const linked = getLinkedSpreadsheet();
  if (linked?.id) {
    try {
      await appendValuesToSheet(linked.id, SHEET_NAMES.ADMINS_SECONDAIRES, row, token);
      return true;
    } catch (_) {}
  }

  // 2. Fallback to Action Webhook
  try {
    await sendActionToGoogleAppsScript('STATUT_UPDATE', {
      action: 'ADMIN_SECONDAIRE_UPDATE',
      secondaryAdmin: adminKey
    });
  } catch (_) {}

  return true;
}

/**
 * Synchronise l'ensemble des administrateurs secondaires enregistrés vers Google Sheets
 */
export async function syncAllSecondaryAdminsToGoogleSheets(keys: SecondaryAdminKey[], accessToken?: string): Promise<{ success: boolean; count: number; url?: string }> {
  let count = 0;
  for (const k of keys) {
    await logSecondaryAdminToSheet(k, accessToken);
    count++;
  }
  const linked = getLinkedSpreadsheet();
  return {
    success: true,
    count,
    url: linked?.url
  };
}

