import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Signalement, AssainissementMission, EvaluationEnv } from '../types';
import { DatabaseScanItem, DatabaseFormationItem } from './databaseStore';

export interface DatabaseExportOptions {
  period: 'journalier' | 'hebdomadaire' | 'tout';
  scans: DatabaseScanItem[];
  signalements: Signalement[];
  missions: AssainissementMission[];
  evaluations: EvaluationEnv[];
  formations: DatabaseFormationItem[];
  generatedBy?: string;
}

/**
 * Génère et télécharge le rapport officiel au format Microsoft Word (.doc)
 */
export function exportDatabaseToWord({
  period,
  scans,
  signalements,
  missions,
  evaluations,
  formations,
  generatedBy = "Direction de l'Assainissement REGEDEK"
}: DatabaseExportOptions): void {
  const periodLabel = period === 'journalier' 
    ? "JOURNALIER (Dernières 24 Heures)" 
    : period === 'hebdomadaire' 
      ? "HEBDOMADAIRE (7 Derniers Jours)" 
      : "CONSOLIDÉ GLOBAL";

  const dateFormatted = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculs statistiques clés
  const totalTonsCollected = missions.reduce((sum, m) => sum + (m.tonsCollected || 0), 0);
  const totalTonsEstimated = signalements.reduce((sum, s) => sum + (s.tonnageEstime || 0), 0);
  const cleanedCount = signalements.filter(s => s.status === 'Nettoyé').length;
  const inProgressCount = signalements.filter(s => s.status === 'En cours').length;
  const pendingCount = signalements.filter(s => s.status === 'Signalé').length;
  const avgConfidence = scans.length > 0
    ? Math.round(scans.reduce((sum, s) => sum + (s.confidence || 90), 0) / scans.length)
    : 95;
  const totalEcoPoints = formations.reduce((sum, f) => sum + (f.ecoPoints || 0), 0);

  const wordHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Rapport Base de Données EWaste Mobile RDC - ${periodLabel}</title>
      <style>
        body {
          font-family: 'Calibri', 'Arial', sans-serif;
          color: #1a202c;
          line-height: 1.5;
          margin: 20px;
        }
        .header-box {
          border-bottom: 3px solid #047857;
          padding-bottom: 12px;
          margin-bottom: 20px;
          text-align: center;
        }
        .country-title {
          font-size: 14pt;
          font-weight: bold;
          color: #1e3a8a;
          margin: 0;
          text-transform: uppercase;
        }
        .ministry-title {
          font-size: 11pt;
          font-weight: bold;
          color: #047857;
          margin: 4px 0;
        }
        .agency-title {
          font-size: 10pt;
          color: #4b5563;
          margin: 2px 0;
        }
        .report-main-title {
          font-size: 16pt;
          font-weight: bold;
          color: #065f46;
          text-align: center;
          background-color: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 10px;
          margin: 15px 0;
          text-transform: uppercase;
        }
        .meta-info {
          font-size: 9pt;
          color: #4b5563;
          margin-bottom: 15px;
          border-left: 4px solid #059669;
          padding-left: 10px;
          background-color: #f9fafb;
          padding-top: 6px;
          padding-bottom: 6px;
        }
        .kpi-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        .kpi-table td {
          border: 1px solid #d1d5db;
          padding: 10px;
          text-align: center;
          background-color: #f3f4f6;
        }
        .kpi-value {
          font-size: 16pt;
          font-weight: bold;
          color: #047857;
        }
        .kpi-label {
          font-size: 8.5pt;
          color: #4b5563;
          text-transform: uppercase;
        }
        h2 {
          font-size: 12pt;
          color: #047857;
          border-bottom: 1.5px solid #059669;
          padding-bottom: 4px;
          margin-top: 25px;
          text-transform: uppercase;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          margin-bottom: 15px;
          font-size: 9pt;
        }
        table.data-table th {
          background-color: #047857;
          color: #ffffff;
          padding: 6px 8px;
          text-align: left;
          border: 1px solid #047857;
          font-weight: bold;
        }
        table.data-table td {
          border: 1px solid #e5e7eb;
          padding: 5px 8px;
        }
        table.data-table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 8pt;
          font-weight: bold;
        }
        .badge-green { background-color: #d1fae5; color: #065f46; }
        .badge-yellow { background-color: #fef3c7; color: #92400e; }
        .badge-red { background-color: #fee2e2; color: #991b1b; }
        .badge-blue { background-color: #dbeafe; color: #1e40af; }
        .badge-purple { background-color: #f3e8ff; color: #6b21a8; }
        .signature-box {
          margin-top: 40px;
          page-break-inside: avoid;
        }
        .signature-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .signature-table td {
          width: 50%;
          vertical-align: top;
          border: none;
          padding: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header-box">
        <div class="country-title">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</div>
        <div class="ministry-title">MINISTÈRE DE L'ENVIRONNEMENT ET DÉVELOPPEMENT DURABLE</div>
        <div class="agency-title">DIRECTION DE L'ASSAINISSEMENT • RÉGIE DE GESTION DES DÉCHETS (REGEDEK)</div>
        <div class="agency-title">SYSTÈME NATIONAL EWaste Mobile RDC (ewastemobile.ai.studio) • 26 PROVINCES</div>
        <div class="agency-title">LIAISON CENTRALE : environnementplusrdc@gmail.com</div>
      </div>

      <div class="report-main-title">
        RAPPORT OFFICIEL DE LA BASE DE DONNÉES EN TEMPS RÉEL — ${periodLabel}
      </div>

      <div class="meta-info">
        <strong>Période d'Extraction :</strong> ${periodLabel}<br>
        <strong>Horodatage d'Édition :</strong> ${dateFormatted}<br>
        <strong>Émis par :</strong> ${generatedBy}<br>
        <strong>Source des Données :</strong> Base de Données Nationale EWaste Mobile RDC (ewastemobile.ai.studio / Google Sheets & Cloud)
      </div>

      <!-- TABLEAU SYNTHÈSE DES KPIS -->
      <table class="kpi-table">
        <tr>
          <td>
            <div class="kpi-value">${scans.length}</div>
            <div class="kpi-label">Analyses Déchets IA</div>
          </td>
          <td>
            <div class="kpi-value">${signalements.length}</div>
            <div class="kpi-label">Signalements Dépotoirs</div>
          </td>
          <td>
            <div class="kpi-value">${missions.length}</div>
            <div class="kpi-label">Missions Assainissement</div>
          </td>
          <td>
            <div class="kpi-value">${totalTonsCollected} t</div>
            <div class="kpi-label">Déchets Évacués</div>
          </td>
          <td>
            <div class="kpi-value">${evaluations.length}</div>
            <div class="kpi-label">Études ÉIES & Audits</div>
          </td>
          <td>
            <div class="kpi-value">${formations.length}</div>
            <div class="kpi-label">Sessions Formation</div>
          </td>
        </tr>
      </table>

      <!-- 1. FLUX DES ANALYSES DE DÉCHETS (SCANNER IA) -->
      <h2>1. Résultats des Analyses & Caractérisation des Déchets (Scanner IA)</h2>
      <p style="font-size: 9pt; color: #6b7280; margin: 0 0 6px 0;">
        Recensement en temps réel des flux de matières identifiées par vision par ordinateur avec recommandations de tri et filières de valorisation en RDC.
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID Scan</th>
            <th>Date & Heure</th>
            <th>Déchet Identifié</th>
            <th>Catégorie</th>
            <th>Bac Conseillé</th>
            <th>Recyclabilité</th>
            <th>Confiance</th>
            <th>Localisation</th>
          </tr>
        </thead>
        <tbody>
          ${scans.length === 0 ? '<tr><td colspan="8" style="text-align:center;">Aucune analyse enregistrée pour cette période.</td></tr>' : ''}
          ${scans.map(s => `
            <tr>
              <td><strong>${s.id}</strong></td>
              <td>${s.timestamp ? new Date(s.timestamp).toLocaleString('fr-FR') : s.date}</td>
              <td>${s.wasteName}</td>
              <td>${s.category}</td>
              <td>${s.binColor} - ${s.binName}</td>
              <td>${s.recyclability}</td>
              <td>${s.confidence}%</td>
              <td>${s.location}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 2. FLUX DES SIGNALEMENTS CITOYENS -->
      <h2>2. Signalements Citoyens de Dépotoirs Sauvages en Temps Réel</h2>
      <p style="font-size: 9pt; color: #6b7280; margin: 0 0 6px 0;">
        Alertes géolocalisées transmises par les citoyens, éco-gardes et brigades avec gravité, estimation du tonnage et statut.
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Commune / Ville</th>
            <th>Quartier</th>
            <th>Gravité</th>
            <th>Statut</th>
            <th>Tonnage Est.</th>
            <th>Auteur</th>
          </tr>
        </thead>
        <tbody>
          ${signalements.length === 0 ? '<tr><td colspan="8" style="text-align:center;">Aucun signalement enregistré pour cette période.</td></tr>' : ''}
          ${signalements.map(sig => `
            <tr>
              <td><strong>${sig.id}</strong></td>
              <td>${sig.date}</td>
              <td>${sig.province || 'Kinshasa'} - ${sig.ville || sig.commune}</td>
              <td>${sig.quartier || 'Centre'}</td>
              <td>${sig.severity}</td>
              <td>${sig.status}</td>
              <td>${sig.tonnageEstime} t</td>
              <td>${sig.author || 'Citoyen'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 3. FLUX DU SUIVI D'ASSAINISSEMENT -->
      <h2>3. Suivi des Opérations d'Assainissement & Brigades de Terrain</h2>
      <p style="font-size: 9pt; color: #6b7280; margin: 0 0 6px 0;">
        Déploiements opérationnels de la REGEDEK, curages de caniveaux, évacuations mécanisées et tonnages collectés.
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID Mission</th>
            <th>Date Début</th>
            <th>Intitulé de la Mission</th>
            <th>Commune / Site</th>
            <th>Brigade / Équipe</th>
            <th>Statut</th>
            <th>Tonnes Ramassées</th>
          </tr>
        </thead>
        <tbody>
          ${missions.length === 0 ? '<tr><td colspan="7" style="text-align:center;">Aucune mission enregistrée pour cette période.</td></tr>' : ''}
          ${missions.map(m => `
            <tr>
              <td><strong>${m.id}</strong></td>
              <td>${m.startDate}</td>
              <td>${m.title}</td>
              <td>${m.commune}</td>
              <td>${m.team}</td>
              <td>${m.status}</td>
              <td><strong>${m.tonsCollected} t</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 4. FLUX DES ÉVALUATIONS ENVIRONNEMENTALES ET ÉIES -->
      <h2>4. Suivi des ÉIES & Évaluations d'Impact Environnemental et Social</h2>
      <p style="font-size: 9pt; color: #6b7280; margin: 0 0 6px 0;">
        Scores de conformité environnementale (ACE), matrice de salubrité et suivi des plans de gestion environnementale et sociale (PGES).
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID Audit</th>
            <th>Date</th>
            <th>Commune / Projet</th>
            <th>Auditeur</th>
            <th>Score Salubrité</th>
            <th>Score Drainage</th>
            <th>Sensibilisation</th>
            <th>Recommandations PGES</th>
          </tr>
        </thead>
        <tbody>
          ${evaluations.length === 0 ? '<tr><td colspan="8" style="text-align:center;">Aucune évaluation enregistrée pour cette période.</td></tr>' : ''}
          ${evaluations.map(e => `
            <tr>
              <td><strong>${e.id}</strong></td>
              <td>${e.date}</td>
              <td>${e.commune}</td>
              <td>${e.auditor}</td>
              <td>${e.salubriteScore}/100</td>
              <td>${e.drainageScore}/100</td>
              <td>${e.sensibilisationScore}/100</td>
              <td>${e.aiRecommendation || e.commentaires || 'Conforme aux normes'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 5. FLUX DES FORMATIONS ET SENSIBILISATIONS -->
      <h2>5. Suivi des Formations Écologiques, Quiz & Sensibilisations</h2>
      <p style="font-size: 9pt; color: #6b7280; margin: 0 0 6px 0;">
        Suivi des citoyens et agents ayant suivi les modules certifiants et quiz de gestion des déchets avec points écocitoyens.
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID Session</th>
            <th>Date</th>
            <th>Nom de l'Apprenant</th>
            <th>Type d'Activité</th>
            <th>Module / Thématique</th>
            <th>Score</th>
            <th>Résultat</th>
            <th>Points Verts</th>
          </tr>
        </thead>
        <tbody>
          ${formations.length === 0 ? '<tr><td colspan="8" style="text-align:center;">Aucune session de formation enregistrée pour cette période.</td></tr>' : ''}
          ${formations.map(f => `
            <tr>
              <td><strong>${f.id}</strong></td>
              <td>${f.timestamp ? new Date(f.timestamp).toLocaleDateString('fr-FR') : f.date}</td>
              <td><strong>${f.learnerName}</strong></td>
              <td>${f.type}</td>
              <td>${f.moduleOrQuiz}</td>
              <td>${f.score}</td>
              <td>${f.result}</td>
              <td>+${f.ecoPoints} pts</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- SIGNATURES & VALIDATION -->
      <div class="signature-box">
        <table class="signature-table">
          <tr>
            <td>
              <p><strong>L'Officier de Supervision & Données :</strong></p>
              <p style="color: #6b7280; font-size: 8.5pt;">Certification des données de terrain et d'analyse IA</p>
              <br><br>
              <p>____________________________________<br>
              <strong>Direction de l'Assainissement RDC</strong></p>
            </td>
            <td style="text-align: right;">
              <p><strong>Le Coordonnateur Général REGEDEK :</strong></p>
              <p style="color: #6b7280; font-size: 8.5pt;">Vu et approuvé pour archivage et diffusion officielle</p>
              <br><br>
              <p>____________________________________<br>
              <strong>Ministère de l'Environnement (MEDD)</strong></p>
            </td>
          </tr>
        </table>
      </div>

    </body>
    </html>
  `;

  // Création du Blob et déclenchement du téléchargement Word (.doc)
  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  const filename = `Rapport_EWaste_BaseDonnees_${period.toUpperCase()}_${new Date().toISOString().split('T')[0]}.doc`;

  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Génère et télécharge le rapport officiel au format PDF haute résolution
 */
export function exportDatabaseToPDF({
  period,
  scans,
  signalements,
  missions,
  evaluations,
  formations,
  generatedBy = "Direction de l'Assainissement REGEDEK"
}: DatabaseExportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor: [number, number, number] = [4, 120, 87]; // Emerald 700 (#047857)
  const darkTextColor: [number, number, number] = [31, 41, 55]; // Gray 800
  const secondaryTextColor: [number, number, number] = [107, 114, 128]; // Gray 500

  const periodLabel = period === 'journalier' 
    ? "RAPPORT JOURNALIER (24H)" 
    : period === 'hebdomadaire' 
      ? "RAPPORT HEBDOMADAIRE (7J)" 
      : "RAPPORT CONSOLIDÉ GLOBAL";

  // 1. En-tête national avec bannière officielle
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("RÉPUBLIQUE DÉMOCRATIQUE DU CONGO • MINISTÈRE DE L'ENVIRONNEMENT", 14, 10);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text("DIRECTION DE L'ASSAINISSEMENT • RÉGIE DE GESTION DES DÉCHETS (REGEDEK RDC)", 14, 16);
  doc.text("Base de Données Nationale EWaste Mobile (ewastemobile.ai.studio) • 26 Provinces", 14, 21);

  let currentY = 34;

  // Titre du Document
  doc.setTextColor(...darkTextColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(periodLabel, 14, currentY);

  currentY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryTextColor);
  const nowStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Édité le : ${nowStr}   |   Opérateur : ${generatedBy}`, 14, currentY);

  currentY += 6;

  // Boîte des KPIs résumés
  const totalMissionsTons = missions.reduce((acc, m) => acc + (m.tonsCollected || 0), 0);
  const kpiBoxHeight = 18;
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(14, currentY, 182, kpiBoxHeight, 2, 2, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.roundedRect(14, currentY, 182, kpiBoxHeight, 2, 2, 'S');

  const colW = 182 / 5;
  const metrics = [
    { label: "Scans Déchets", value: `${scans.length}` },
    { label: "Signalements", value: `${signalements.length}` },
    { label: "Missions", value: `${missions.length}` },
    { label: "Tonnes Ramassées", value: `${totalMissionsTons} t` },
    { label: "Formations", value: `${formations.length}` }
  ];

  metrics.forEach((m, idx) => {
    const colX = 14 + (idx * colW);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryTextColor);
    doc.text(m.label, colX + (colW / 2), currentY + 6, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(m.value, colX + (colW / 2), currentY + 14, { align: 'center' });
  });

  currentY += kpiBoxHeight + 8;

  // 1. Table des Analyses Déchets (Scanner IA)
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text("1. Analyses des Déchets & Caractérisation IA en Temps Réel", 14, currentY);
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [['ID Scan', 'Déchet Identifié', 'Catégorie', 'Bac', 'Recyclabilité', 'Conf.', 'Localisation']],
    body: scans.slice(0, 8).map(s => [
      s.id,
      s.wasteName,
      s.category,
      `${s.binColor} (${s.binName})`,
      s.recyclability,
      `${s.confidence}%`,
      s.location
    ]),
    theme: 'striped',
    headStyles: { fillColor: [4, 120, 87], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 2. Table des Signalements Citoyens
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text("2. Signalements Citoyens de Dépotoirs Sauvages", 14, currentY);
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [['ID', 'Date', 'Commune / Ville', 'Quartier', 'Gravité', 'Statut', 'Tonnage', 'Auteur']],
    body: signalements.slice(0, 8).map(sig => [
      sig.id,
      sig.date,
      sig.ville || sig.commune,
      sig.quartier || 'Centre',
      sig.severity,
      sig.status,
      `${sig.tonnageEstime} t`,
      sig.author || 'Citoyen'
    ]),
    theme: 'striped',
    headStyles: { fillColor: [4, 120, 87], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
    margin: { left: 14, right: 14 }
  });

  // Check page overflow for next sections
  currentY = (doc as any).lastAutoTable.finalY + 8;
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  // 3. Table des Opérations d'Assainissement
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text("3. Suivi des Opérations d'Assainissement REGEDEK", 14, currentY);
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [['ID', 'Date', 'Site d\'Intervention', 'Commune', 'Brigade', 'Statut', 'Tonnage']],
    body: missions.slice(0, 8).map(m => [
      m.id,
      m.startDate,
      m.title,
      m.commune,
      m.team,
      m.status,
      `${m.tonsCollected} t`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [4, 120, 87], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  // 4. Table des ÉIES & Évaluations Environnementales
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text("4. Suivi des ÉIES & Conformité Environnementale", 14, currentY);
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [['ID Audit', 'Date', 'Commune', 'Auditeur', 'Salubrité', 'Drainage', 'Recommandation PGES']],
    body: evaluations.slice(0, 6).map(e => [
      e.id,
      e.date,
      e.commune,
      e.auditor,
      `${e.salubriteScore}/100`,
      `${e.drainageScore}/100`,
      (e.aiRecommendation || e.commentaires || 'PGES actif').slice(0, 45) + '...'
    ]),
    theme: 'striped',
    headStyles: { fillColor: [4, 120, 87], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  // 5. Table des Formations & Sensibilisation
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text("5. Suivi des Formations Écologiques & Sensibilisations", 14, currentY);
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [['ID Session', 'Date', 'Apprenant', 'Type', 'Thématique / Module', 'Score', 'Résultat']],
    body: formations.slice(0, 6).map(f => [
      f.id,
      f.timestamp ? new Date(f.timestamp).toLocaleDateString('fr-FR') : f.date,
      f.learnerName,
      f.type,
      f.moduleOrQuiz,
      f.score,
      f.result
    ]),
    theme: 'striped',
    headStyles: { fillColor: [4, 120, 87], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;
  if (currentY > 240) {
    doc.addPage();
    currentY = 25;
  }

  // Cartouche de signatures
  doc.setFontSize(8.5);
  doc.setTextColor(...darkTextColor);
  doc.setFont('helvetica', 'bold');
  doc.text("Pour la Direction de l'Assainissement REGEDEK", 14, currentY);
  doc.text("Pour le Ministère de l'Environnement (MEDD)", 130, currentY);

  currentY += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text("Visa & Sceau de la Brigade", 14, currentY);
  doc.text("Visa & Sceau du Coordonnateur", 130, currentY);

  // Téléchargement du PDF
  const filename = `Rapport_EWaste_BaseDonnees_${period.toUpperCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
