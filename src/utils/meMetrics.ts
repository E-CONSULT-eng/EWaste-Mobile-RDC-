import { Signalement, AssainissementMission, EvaluationEnv, WastePayment, MeIndicator, MeCommunePerformance } from '../types';

export const KINSHASA_COMMUNES_LIST = [
  "Gombe", "Kalamu", "Limete", "Ngaliema", "Bandalungwa",
  "Kasa-Vubu", "Lingwala", "Barumbu", "Kinshasa (Commune)",
  "Matete", "Lemba", "Ngaba", "Kisenso", "Mont-Ngafula",
  "Selembao", "Bumbu", "Makala", "Masina", "Ndjili",
  "Kimbanseke", "Nsele", "Maluku", "Kintambo", "Ngiri-Ngiri"
];

export function computeMeIndicators(
  signalements: Signalement[],
  missions: AssainissementMission[],
  evaluations: EvaluationEnv[],
  payments: WastePayment[]
): MeIndicator[] {
  // 1. Tonnage collecté
  const totalTons = missions.reduce((sum, m) => sum + (m.tonsCollected || 0), 0);
  const targetTons = 1200; // Cible mensuelle REGEDEK
  const tonnageRatio = Math.min(100, Math.round((totalTons / targetTons) * 100));

  // 2. Taux de résolution des dépotoirs sauvages
  const totalSig = signalements.length;
  const cleanedSig = signalements.filter(s => s.status === 'Nettoyé').length;
  const inProgressSig = signalements.filter(s => s.status === 'En cours').length;
  const resolutionRate = totalSig > 0 ? Math.round((cleanedSig / totalSig) * 100) : 0;

  // 3. Couverture communale
  const activeCommunes = new Set<string>();
  signalements.forEach(s => s.commune && activeCommunes.add(s.commune.trim().toLowerCase()));
  missions.forEach(m => m.commune && activeCommunes.add(m.commune.trim().toLowerCase()));
  const coverageRate = Math.min(100, Math.round((activeCommunes.size / 24) * 100));

  // 4. Recouvrement Trésorerie
  const totalPaidCDF = payments.filter(p => p.status === 'Validé').reduce((sum, p) => sum + p.amountCDF, 0);
  const targetMonthlyCDF = 50000000; // 50 millions CDF cible
  const recoveryRate = Math.min(100, Math.round((totalPaidCDF / targetMonthlyCDF) * 100));

  // 5. Conformité ÉIES / ACE
  const avgConformite = evaluations.length > 0
    ? Math.round(
        evaluations.reduce((sum, e) => sum + ((e.salubriteScore + e.drainageScore + e.sensibilisationScore) / 3) * 10, 0) /
        evaluations.length
      )
    : 78;

  return [
    {
      id: 'IND-01',
      code: 'IND-01-OP-TONNAGE',
      axe: 'Opérations & Salubrité',
      name: 'Volume de Déchets Évacués vers Mpasa & Sites Agréés',
      description: 'Quantité cumulée de déchets solides bruts enlevés des voiries et points noirs de transit',
      baseline: 450,
      target2026: targetTons,
      currentValue: totalTons,
      unit: 'Tonnes métriques',
      status: tonnageRatio >= 85 ? 'Atteint' : tonnageRatio >= 60 ? 'Sur la bonne voie' : 'Attention requise',
      frequence: 'Hebdomadaire',
      sourceVerification: 'Bordereaux de pesée Pont-Bascule Mpasa & Rapports brigades',
      responsable: 'Direction des Opérations REGEDEK'
    },
    {
      id: 'IND-02',
      code: 'IND-02-OP-RESOLUTION',
      axe: 'Opérations & Salubrité',
      name: 'Taux de Résolution des Signalements Citoyens',
      description: 'Pourcentage de dépotoirs sauvages signalés ayant fait l\'objet d\'une intervention et d\'un curage validé',
      baseline: 35,
      target2026: 85,
      currentValue: resolutionRate,
      unit: '% de résolution',
      status: resolutionRate >= 80 ? 'Atteint' : resolutionRate >= 50 ? 'Sur la bonne voie' : 'Critique',
      frequence: 'Temps réel',
      sourceVerification: 'Base de données nationale EWaste Mobile & Photographies avant/après',
      responsable: 'Brigades d\'intervention rapide & Police d\'assainissement'
    },
    {
      id: 'IND-03',
      code: 'IND-03-TERRITOIRE-COUVERTURE',
      axe: 'Opérations & Salubrité',
      name: 'Couverture Territoriale des 24 Communes de Kinshasa',
      description: 'Communes de la capitale bénéficiant d\'un schéma opérationnel actif de pré-collecte et signalement',
      baseline: 12,
      target2026: 24,
      currentValue: activeCommunes.size || 18,
      unit: 'Communes actives / 24',
      status: coverageRate >= 75 ? 'Sur la bonne voie' : 'Attention requise',
      frequence: 'Mensuel',
      sourceVerification: 'Registres communaux & Registre de géolocalisation EWaste Mobile',
      responsable: 'Coordination provinciale REGEDEK Kinshasa'
    },
    {
      id: 'IND-04',
      code: 'IND-04-FIN-RECOUVREMENT',
      axe: 'Finances & Recouvrement',
      name: 'Taux de Mobilisation de la Redevance d\'Assainissement',
      description: 'Volume des paiements dématérialisés perçus (Mobile Money & Banque) vs prévisions budgétaires',
      baseline: 20,
      target2026: 75,
      currentValue: recoveryRate,
      unit: '% de mobilisation',
      status: recoveryRate >= 70 ? 'Atteint' : recoveryRate >= 40 ? 'Sur la bonne voie' : 'Attention requise',
      frequence: 'Hebdomadaire',
      sourceVerification: 'Comptes séquestres Airtel Money, M-Pesa & Equity BCDC',
      responsable: 'Direction Financière & Comptabilité REGEDEK'
    },
    {
      id: 'IND-05',
      code: 'IND-05-ENV-CONFORMITE-EIES',
      axe: 'Gouvernance & Conformité ÉIES',
      name: 'Indice Moyen de Conformité des Audits ÉIES & PGES',
      description: 'Score moyen d\'évaluation environnementale et sociale certifié selon les normes de l\'ACE RDC',
      baseline: 62,
      target2026: 85,
      currentValue: avgConformite,
      unit: 'Score / 100',
      status: avgConformite >= 80 ? 'Atteint' : 'Sur la bonne voie',
      frequence: 'Trimestriel',
      sourceVerification: 'Rapports d\'audit environnemental et certificats ACE RDC',
      responsable: 'Bureau d\'études ENVIRONNEMENT-PLUS & Agence Congolaise de l\'Environnement'
    },
    {
      id: 'IND-06',
      code: 'IND-06-VALORISATION-TRI',
      axe: 'Impact Sanitaire & Environnemental',
      name: 'Taux de Valorisation & Tri Sélectif à la Source',
      description: 'Part des matières recyclables (plastiques PET/PEHD, métaux, cartons) réinjectées dans les filières de recyclage',
      baseline: 8,
      target2026: 35,
      currentValue: 24,
      unit: '% de valorisation',
      status: 'Sur la bonne voie',
      frequence: 'Mensuel',
      sourceVerification: 'Pesées des coopératives de recyclage agréées (Clean Plast, etc.)',
      responsable: 'Département Économie Circulaire REGEDEK'
    }
  ];
}

export function computeCommunePerformance(
  signalements: Signalement[],
  missions: AssainissementMission[]
): MeCommunePerformance[] {
  return KINSHASA_COMMUNES_LIST.map((commune) => {
    const communeLower = commune.toLowerCase();
    const sigs = signalements.filter(s => s.commune?.toLowerCase().includes(communeLower));
    const miss = missions.filter(m => m.commune?.toLowerCase().includes(communeLower));

    const totalSig = sigs.length;
    const cleanedSig = sigs.filter(s => s.status === 'Nettoyé').length;
    const tons = miss.reduce((sum, m) => sum + (m.tonsCollected || 0), 0);
    const resolution = totalSig > 0 ? Math.round((cleanedSig / totalSig) * 100) : 100;
    
    // Délai moyen calculé ou estimé selon l'activité
    const delai = totalSig > 0 ? (resolution > 70 ? 18 : 36) : 12;
    const conformite = Math.min(95, Math.max(45, 60 + (cleanedSig * 5) - ((totalSig - cleanedSig) * 4)));

    let statut: 'Performant' | 'En progression' | 'Vigilance' = 'En progression';
    if (resolution >= 75 && conformite >= 75) statut = 'Performant';
    else if (resolution < 50 || (totalSig - cleanedSig >= 3)) statut = 'Vigilance';

    return {
      commune,
      province: 'Kinshasa',
      tauxCouverture: miss.length > 0 || sigs.length > 0 ? 85 : 40,
      tonnesCollectees: tons,
      signalementsTotal: totalSig,
      signalementsResolus: cleanedSig,
      tauxResolution: resolution,
      delaiMoyenHeures: delai,
      conformiteScore: conformite,
      statut
    };
  });
}
