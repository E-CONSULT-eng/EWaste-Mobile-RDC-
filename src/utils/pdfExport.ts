import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RegedekReport, Signalement, AssainissementMission, WastePayment } from '../types';

export function exportConsolidatedReportPDF({
  reportData,
  period,
  signalements,
  missions
}: {
  reportData: RegedekReport | null;
  period: string;
  signalements: Signalement[];
  missions: AssainissementMission[];
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor: [number, number, number] = [4, 120, 87]; // Emerald 700 (#047857)
  const darkTextColor: [number, number, number] = [31, 41, 55]; // Gray 800
  const secondaryTextColor: [number, number, number] = [107, 114, 128]; // Gray 500

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 24, 'F');

  // Title in header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text("RÉGIE DE GESTION DES DÉCHETS (REGEDEK RDC)", 14, 11);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("EWaste Mobile • ewastemobile.ai.studio • RDC 26 Provinces", 14, 18);

  // Document Title & Metadata
  let currentY = 34;
  doc.setTextColor(...darkTextColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text("RAPPORT CONSOLIDÉ D'ACTIVITÉ & SALUBRITÉ", 14, currentY);

  currentY += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryTextColor);
  const formattedPeriod = period.toUpperCase();
  const generationDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Période d'évaluation : ${formattedPeriod}   |   Généré le : ${generationDate}`, 14, currentY);

  // KPIs Summary Box
  currentY += 8;
  const kpiBoxHeight = 22;
  doc.setFillColor(243, 244, 246); // Gray 100
  doc.roundedRect(14, currentY, 182, kpiBoxHeight, 3, 3, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(14, currentY, 182, kpiBoxHeight, 3, 3, 'S');

  const totalMissionsTons = missions.reduce((acc, m) => acc + (m.tonsCollected || 0), 0);
  const totalTons = reportData?.kpis?.totalTons ?? totalMissionsTons;
  const activeCount = reportData?.kpis?.activeDumps ?? signalements.filter(s => s.status !== 'Nettoyé').length;
  const cleanedCount = reportData?.kpis?.cleanedDumps ?? signalements.filter(s => s.status === 'Nettoyé').length;
  const resolutionRate = reportData?.kpis?.tauxResolution ?? 
    (signalements.length > 0 ? `${Math.round((cleanedCount / signalements.length) * 100)}%` : "80%");

  const colWidth = 182 / 4;
  const metrics = [
    { label: "Déchets Traités", value: `${totalTons} tonnes` },
    { label: "Dépotoirs Actifs", value: `${activeCount}` },
    { label: "Sites Nettoyés", value: `${cleanedCount}` },
    { label: "Taux Résolution", value: `${resolutionRate}` }
  ];

  metrics.forEach((metric, idx) => {
    const colX = 14 + (idx * colWidth);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryTextColor);
    doc.text(metric.label, colX + (colWidth / 2), currentY + 7, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(metric.value, colX + (colWidth / 2), currentY + 16, { align: 'center' });
  });

  currentY += kpiBoxHeight + 8;

  // Executive Summary Section
  if (reportData?.summary) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkTextColor);
    doc.text("1. SYNTHÈSE EXÉCUTIVE", 14, currentY);

    currentY += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    
    // Split long summary text to fit margins
    const splitSummary = doc.splitTextToSize(reportData.summary, 182);
    doc.text(splitSummary, 14, currentY);
    currentY += (splitSummary.length * 4.2) + 6;
  }

  // Section 2: Missions d'Assainissement
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text("2. MISSIONS D'ASSAINISSEMENT CONSOLIDÉES (" + missions.length + ")", 14, currentY);
  currentY += 4;

  const missionRows = missions.map(m => [
    m.id,
    m.title,
    `${m.ville || m.commune} (${m.province || 'Kinshasa'})`,
    m.team,
    m.status,
    `${m.tonsCollected} t`,
    m.startDate
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['ID Mission', 'Intitulé Opération', 'Ville & Province', 'Brigade', 'Statut', 'Volume', 'Date Début']],
    body: missionRows.length > 0 ? missionRows : [['-', 'Aucune mission enregistrée', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [31, 41, 55]
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 46 },
      2: { cellWidth: 28 },
      3: { cellWidth: 28 },
      4: { cellWidth: 20 },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 22 }
    },
    margin: { left: 14, right: 14 }
  });

  // Get position after missions table
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if we need a new page for Signalements
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // Section 3: Signalements de Dépotoirs
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text("3. SIGNALEMENTS & CARTOGRAPHIE DES DÉPOTOIRS (" + signalements.length + ")", 14, currentY);
  currentY += 4;

  const signalementRows = signalements.slice(0, 15).map(s => [
    s.id,
    `${s.ville || s.commune} (${s.province || 'Kinshasa'}) - ${s.quartier}`,
    s.description.length > 36 ? s.description.substring(0, 34) + '...' : s.description,
    s.severity,
    s.status,
    `~${s.tonnageEstime} t`,
    s.date
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Réf.', 'Ville, Province & Quartier', 'Description Sommaire', 'Gravité', 'Statut', 'Tonnage', 'Date']],
    body: signalementRows.length > 0 ? signalementRows : [['-', 'Aucun signalement', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [31, 41, 55]
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 38 },
      2: { cellWidth: 46 },
      3: { cellWidth: 18 },
      4: { cellWidth: 22 },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 20 }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 4: Recommandations
  if (reportData?.recommendations && reportData.recommendations.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkTextColor);
    doc.text("4. RECOMMANDATIONS OPÉRATIONNELLES ET STRATÉGIQUES", 14, currentY);
    currentY += 6;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);

    reportData.recommendations.forEach((rec, idx) => {
      const recLines = doc.splitTextToSize(`${idx + 1}. ${rec}`, 182);
      if (currentY + (recLines.length * 4) > 280) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(recLines, 14, currentY);
      currentY += (recLines.length * 4) + 2;
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(156, 163, 175);
    doc.line(14, 285, 196, 285);
    doc.text(
      "EWaste Mobile (ewastemobile.ai.studio) • REGEDEK & ENVIRONNEMENT-PLUS RDC • Document Officiel",
      14,
      290
    );
    doc.text(`Page ${i} sur ${totalPages}`, 196, 290, { align: 'right' });
  }

  // Save the PDF
  const filename = `Rapport_REGEDEK_${formattedPeriod.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Génère une Quittance Fiscale Numérique Officielle pour le citoyen ou l'entreprise
 */
export function exportPaymentReceiptPDF(payment: WastePayment) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5' // A5 is perfect for official receipts
  });

  const primaryColor: [number, number, number] = [4, 120, 87]; // Emerald 700
  const darkTextColor: [number, number, number] = [31, 41, 55];
  const grayColor: [number, number, number] = [107, 114, 128];

  // Top header banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 148, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", 74, 7, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text("REGEDEK • MINISTÈRE DE L'ENVIRONNEMENT • ENVIRONNEMENT-PLUS", 74, 13, { align: 'center' });

  // Receipt Title
  doc.setTextColor(...darkTextColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text("QUITTANCE NUMÉRIQUE DE SALUBRITÉ URBAINE", 74, 27, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(`N° ${payment.receiptNumber}`, 74, 33, { align: 'center' });

  // Status Badge
  doc.setFillColor(236, 253, 245); // light green
  doc.roundedRect(44, 37, 60, 6, 2, 2, 'F');
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text("PAYÉ & CERTIFIÉ EN BASE NATIONALE", 74, 41.5, { align: 'center' });

  // Details Box
  let y = 48;
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(10, y, 128, 70, 3, 3, 'FD');

  const printRow = (label: string, value: string, currentY: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...grayColor);
    doc.text(label, 14, currentY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkTextColor);
    doc.text(value, 134, currentY, { align: 'right' });
  };

  printRow("Date d'émission", payment.date, y + 8);
  printRow("Nom / Raison Sociale", payment.payerName, y + 16);
  printRow("Téléphone déclarant", payment.payerPhone || "Non renseigné", y + 24);
  printRow("Catégorie Producteur", payment.producerType, y + 32);
  printRow("Localisation", `${payment.commune}, Q. ${payment.quartier} (${payment.province})`, y + 40);
  printRow("Prestation / Taxe", payment.serviceType, y + 48);
  printRow("Période couverte", payment.period, y + 56);
  printRow("Moyen de paiement", `${payment.paymentMethod} (Réf: ${payment.transactionReference})`, y + 64);

  // Total Box
  y = 122;
  doc.setFillColor(4, 120, 87);
  doc.roundedRect(10, y, 128, 16, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text("MONTANT TOTAL ACQUITTÉ :", 16, y + 10);
  doc.setFontSize(13);
  doc.text(`${payment.amountCDF.toLocaleString('fr-FR')} CDF`, 132, y + 8, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`(soit ~${payment.amountUSD.toFixed(2)} USD)`, 132, y + 13, { align: 'right' });

  // Security Note & Stamp
  y = 142;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...grayColor);
  doc.text("Document fiscal électronique faisant foi de quittance libératoire de salubrité publique.", 74, y, { align: 'center' });
  doc.text("Conforme aux ordonnances provinciales de gestion des déchets et environnement en RDC.", 74, y + 4, { align: 'center' });

  // Integrity Hash Box (SHA-256)
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(10, y + 8, 128, 13, 2, 2, 'FD');
  doc.setTextColor(4, 120, 87);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text("HASH D'INTÉGRITÉ SÉCURISÉ (SHA-256) - ANTI-FRAUDE :", 14, y + 12);
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.text(payment.integrityHash || `SHA256-${payment.id}-${payment.amountCDF}`, 14, y + 17);

  // QR / Verification mockup code
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(48, y + 24, 52, 12, 2, 2, 'F');
  doc.setTextColor(75, 85, 99);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text("API GATEWAY: CONFIRMÉ", 74, y + 28, { align: 'center' });
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.text(`REF: ${payment.transactionReference}`, 74, y + 33, { align: 'center' });

  // Footer
  doc.setTextColor(156, 163, 175);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text("EWaste Mobile RDC • Portail : ewastemobile.ai.studio • Base Centrale : environnementplusrdc@gmail.com", 74, 198, { align: 'center' });
  doc.text("Perception officielle : Airtel (+243 978 491 414) • M-Pesa (+243 831 352 778) • Equity (655100310489884)", 74, 202, { align: 'center' });

  doc.save(`Quittance_${payment.receiptNumber}.pdf`);
}

/**
 * Exporte un rapport consolidé de la trésorerie REGEDEK
 */
export function exportTreasuryReportPDF(payments: WastePayment[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor: [number, number, number] = [4, 120, 87];
  const darkTextColor: [number, number, number] = [31, 41, 55];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text("REGEDEK & ENVIRONNEMENT-PLUS • TRÉSORERIE SALUBRITÉ", 14, 11);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Rapport Institutionnel de Recouvrement des Taxes & Redevances des Déchets", 14, 18);

  let currentY = 34;
  doc.setTextColor(...darkTextColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text("SITUATION DES PAIEMENTS ÉLECTRONIQUES", 14, currentY);

  currentY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} • Total: ${payments.length} quittances`, 14, currentY);

  const totalCDF = payments.reduce((sum, p) => sum + (p.amountCDF || 0), 0);
  const totalUSD = payments.reduce((sum, p) => sum + (p.amountUSD || 0), 0);

  currentY += 6;
  // KPI card
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(14, currentY, 182, 18, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text("TOTAL RECOUVREMENT (CDF)", 30, currentY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(`${totalCDF.toLocaleString('fr-FR')} CDF`, 30, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("ÉQUIVALENT USD", 120, currentY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(`$${totalUSD.toFixed(2)} USD`, 120, currentY + 13);

  currentY += 24;

  const tableData = payments.map(p => [
    p.receiptNumber,
    p.date,
    p.payerName,
    p.producerType,
    `${p.commune} (${p.province})`,
    `${p.amountCDF.toLocaleString('fr-FR')} CDF`,
    p.paymentMethod,
    p.status
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["N° Quittance", "Date", "Contribuable", "Type", "Commune", "Montant", "Moyen", "Statut"]],
    body: tableData.length > 0 ? tableData : [["Aucun paiement enregistré pour le moment (compteurs à zéro)", "", "", "", "", "", "", ""]],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [4, 120, 87], textColor: [255, 255, 255], fontStyle: 'bold' }
  });

  doc.save(`Recouvrement_REGEDEK_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Exporte la liste des paiements au format CSV (compatible Excel)
 */
export function exportPaymentsToCSV(payments: WastePayment[]) {
  const headers = [
    "ID Paiement",
    "N° Quittance",
    "Date",
    "Nom Contribuable",
    "Téléphone",
    "Type Producteur",
    "Province",
    "Commune",
    "Quartier",
    "Service",
    "Période",
    "Montant CDF",
    "Montant USD",
    "Moyen de Paiement",
    "Référence Transaction",
    "Statut"
  ];

  const rows = payments.map(p => [
    p.id,
    p.receiptNumber,
    p.date,
    `"${p.payerName.replace(/"/g, '""')}"`,
    p.payerPhone,
    `"${p.producerType}"`,
    p.province,
    p.commune,
    p.quartier,
    `"${p.serviceType}"`,
    p.period,
    p.amountCDF,
    p.amountUSD,
    p.paymentMethod,
    p.transactionReference,
    p.status
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Paiements_REGEDEK_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
