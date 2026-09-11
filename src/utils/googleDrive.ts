import { getCachedAccessToken } from '../firebase';
import { OFFICIAL_ADMIN_EMAIL } from './googleSheets';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
  size?: string;
}

/**
 * Recherche ou crée un dossier dédié dans Google Drive
 */
export async function getOrCreateDriveFolder(
  folderName: string = "EWaste Mobile RDC - Rapports & Données",
  accessToken?: string
): Promise<string> {
  const token = accessToken || getCachedAccessToken();
  if (!token) {
    throw new Error("Authentification Google requise pour accéder à Google Drive.");
  }

  // Chercher si le dossier existe déjà
  const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Créer le dossier s'il n'existe pas
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: "application/vnd.google-apps.folder"
    })
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Impossible de créer le dossier Drive: ${err}`);
  }

  const createdData = await createRes.json();
  return createdData.id;
}

/**
 * Sauvegarde un fichier (JSON, CSV, texte) directement dans Google Drive
 */
export async function uploadFileToDrive(
  fileName: string,
  content: string,
  mimeType: string = "application/json",
  accessToken?: string
): Promise<{ fileId: string; webViewLink: string; name: string }> {
  const token = accessToken || getCachedAccessToken();
  if (!token) {
    throw new Error("Authentification Google requise pour téléverser sur Google Drive.");
  }

  const folderId = await getOrCreateDriveFolder("EWaste Mobile RDC - Rapports & Données", token);

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType
  };

  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelim = "\r\n--" + boundary + "--";

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: ' + mimeType + '\r\n\r\n' +
    content +
    closeDelim;

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Échec de téléversement sur Google Drive: ${err}`);
  }

  const result = await res.json();
  return {
    fileId: result.id,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
    name: result.name
  };
}

/**
 * Liste les fichiers sauvegardés dans le dossier EWaste Mobile sur Google Drive
 */
export async function listDriveBackupFiles(accessToken?: string): Promise<DriveFileItem[]> {
  const token = accessToken || getCachedAccessToken();
  if (!token) {
    return [];
  }

  try {
    const folderId = await getOrCreateDriveFolder("EWaste Mobile RDC - Rapports & Données", token);
    const q = `'${folderId}' in parents and trashed = false`;
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name, mimeType, webViewLink, createdTime, size)&orderBy=createdTime desc`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch (e) {
    console.error("Erreur lecture Google Drive:", e);
    return [];
  }
}

/**
 * Sauvegarde instantanée d'une action utilisateur dans Google Drive
 */
export async function saveActionLogToDrive(
  actionType: string,
  payload: any,
  accessToken?: string
): Promise<{ success: boolean; fileId?: string }> {
  try {
    const token = accessToken || getCachedAccessToken();
    if (!token) return { success: false };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `EWaste_Action_${actionType}_${timestamp}.json`;
    const content = JSON.stringify({
      app: "EWaste Mobile RDC (ewastemobile.ai.studio)",
      portal: "https://ewastemobile.ai.studio",
      action: actionType,
      timestamp: new Date().toISOString(),
      data: payload
    }, null, 2);

    const uploaded = await uploadFileToDrive(fileName, content, "application/json", token);
    // Partage automatique de l'action archivée avec l'email officiel
    shareDriveItemWithAdmin(uploaded.fileId, token).catch(() => {});
    return { success: true, fileId: uploaded.fileId };
  } catch (err) {
    console.warn("Auto-backup to Google Drive skipped or failed:", err);
    return { success: false };
  }
}

/**
 * Partage un fichier ou dossier Google Drive avec environnementplusrdc@gmail.com
 */
export async function shareDriveItemWithAdmin(
  fileId: string,
  accessToken?: string
): Promise<{ success: boolean; message: string }> {
  const token = accessToken || getCachedAccessToken();
  if (!token) return { success: false, message: "Token requis" };

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?sendNotificationEmail=false`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'writer',
        type: 'user',
        emailAddress: OFFICIAL_ADMIN_EMAIL,
      }),
    });

    if (res.ok) {
      return { success: true, message: `Élément partagé avec ${OFFICIAL_ADMIN_EMAIL}` };
    }
    return { success: false, message: "Échec partage Google Drive" };
  } catch (e: any) {
    return { success: false, message: e?.message || "Erreur partage" };
  }
}
