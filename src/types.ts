export interface Signalement {
  id: string;
  province?: string;
  ville?: string;
  commune: string;
  quartier: string;
  description: string;
  severity: 'Critique' | 'Élevé' | 'Modéré';
  status: 'Signalé' | 'En cours' | 'Nettoyé';
  imageUrl?: string;
  date: string;
  author: string;
  coordinates?: string;
  tonnageEstime: number;
}

export interface AssainissementMission {
  id: string;
  title: string;
  province?: string;
  ville?: string;
  commune: string;
  startDate: string;
  status: 'Planifié' | 'En cours' | 'Terminé';
  team: string;
  tonsCollected: number;
  description: string;
}

export interface EvaluationEnv {
  id: string;
  province?: string;
  ville?: string;
  commune: string;
  auditor: string;
  date: string;
  salubriteScore: number;
  drainageScore: number;
  sensibilisationScore: number;
  commentaires: string;
  aiRecommendation?: string;
}

export interface RegedekReport {
  title: string;
  date: string;
  summary: string;
  kpis: {
    totalTons: number;
    activeDumps: number;
    cleanedDumps: number;
    tauxResolution?: string;
    satisfactionSalubrite?: string;
  };
  recommendations: string[];
}

export interface InAppNotification {
  id: string;
  signalementId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  status: 'Signalé' | 'En cours' | 'Nettoyé';
  commune: string;
  quartier: string;
}

export interface WasteAiAnalysisResult {
  wasteName: string;
  category: 'Plastique' | 'Organique / Biodéchet' | 'Métal' | 'Verre' | 'Papier & Carton' | 'Dangereux & Électronique' | 'Tout-venant / Non recyclable';
  binColor: 'Jaune' | 'Vert' | 'Bleu' | 'Rouge' | 'Gris' | string;
  binName: string;
  confidence: number; // 0 - 100
  recyclability: 'Recyclable' | 'Compostable' | 'Spécialisé' | 'Non recyclable' | string;
  sortingInstructions: string[];
  localKinshasaOutlets: string;
  decompositionTime: string;
  environmentalImpact: string;
  quickTips: string;
}

export interface ImpactItem {
  id: string;
  domaine: 'Air & Climat' | 'Ressources en Eau & Nappes' | 'Sols & Géologie' | 'Santé Publique & Hygiène' | 'Socio-Économique & Emplois' | 'Biodiversité & Cadre de Vie';
  nature: 'Négatif' | 'Positif';
  phase: 'Préparation & Travaux' | 'Exploitation & Activités' | 'Fermeture / Post-exploitation';
  severite: 'Faible' | 'Modéré' | 'Majeur' | 'Critique';
  description: string;
  mesureAttenuations: string;
}

export interface PgesAction {
  id: string;
  mesure: string;
  responsable: string;
  coutEstimeUSD: number;
  indicateurSuivi: string;
  echeance: string;
  statut: 'Non démarré' | 'En cours' | 'Réalisé';
}

export interface EtudeImpact {
  id: string; // ex: EIES-2026-001
  titreProjet: string;
  promoteur: string;
  commune: string;
  quartier: string;
  typeOuvrage: string; // ex: Centre d'enfouissement, Station de transfert, Curage de rivière, Usine de recyclage
  categorie: 'Catégorie A (Impact Majeur)' | 'Catégorie B (Notice NIES / Modéré)' | 'Audit Environnemental';
  statutAce: 'Certificat ACE Délivré' | 'En instruction ACE' | 'En consultation publique' | 'En révision PGES';
  dateDepot: string;
  dateValidation?: string;
  numeroCertificat?: string;
  resumeNonTechnique: string;
  coutGlobalProjetUSD: number;
  budgetPgesUSD: number;
  populationConcernee: number;
  scoreConformiteAce: number; // 0-100%
  impacts: ImpactItem[];
  pgesActions: PgesAction[];
  consultationPublique: {
    nombreParticipants: number;
    tauxAdhesion: number; // 0-100%
    principalesPreoccupations: string[];
  };
  cadreLegal: string[];
}

export interface TrainingLesson {
  id: string;
  title: string;
  duration: string;
  summary: string;
  contentParagraphs: string[];
  kinshasaFieldStudy: {
    location: string;
    context: string;
    solution: string;
  };
  keyTakeaways: string[];
  practicalChecklist: string[];
}

export interface TrainingQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TrainingModule {
  id: string;
  code: string;
  title: string;
  shortDescription: string;
  category: 'Tri & Valorisation' | 'Hydraulique & Salubrité' | 'Santé & Sécurité EPI' | 'Déchets Dangereux & DASRI' | 'Législation & Police' | 'Entrepreneuriat Vert';
  targetAudience: 'Tout Public / Citoyens' | 'Agents & Éboueurs de Terrain' | 'Personnel Médical & Spécialisé' | 'Inspecteurs & Brigades' | 'Coopératives & PME';
  level: 'Fondamental' | 'Intermédiaire' | 'Avancé';
  durationTotal: string;
  bannerGradient: string;
  lessons: TrainingLesson[];
  quiz: TrainingQuizQuestion[];
  passingScorePercent: number;
}

export interface TrainingCertificate {
  id: string;
  moduleId: string;
  moduleTitle: string;
  code: string;
  learnerName: string;
  issueDate: string;
  scorePercent: number;
  certificateNumber: string;
}

export type UserRole = 'citoyen' | 'institutionnel' | 'admin';

export type CitizenUserType = 'menage' | 'commerce' | 'entreprise';

export interface UserAuthSession {
  isAuthenticated: boolean;
  role: UserRole;
  userType: 'citoyen' | 'commerce' | 'entreprise' | 'brigade' | 'superviseur' | 'admin_principal' | 'admin_secondaire';
  identifier: string; // phone number (+243...), email, or master admin
  displayName: string;
  commune?: string;
  loginTimestamp: number;
  secondaryKeyId?: string;
  isPrincipalAdmin?: boolean;
}

export interface MeIndicator {
  id: string;
  code: string;
  axe: 'Opérations & Salubrité' | 'Finances & Recouvrement' | 'Gouvernance & Conformité ÉIES' | 'Impact Sanitaire & Environnemental';
  name: string;
  description: string;
  baseline: number;
  target2026: number;
  currentValue: number;
  unit: string;
  status: 'Atteint' | 'Sur la bonne voie' | 'Attention requise' | 'Critique';
  frequence: 'Temps réel' | 'Hebdomadaire' | 'Mensuel' | 'Trimestriel';
  sourceVerification: string;
  responsable: string;
}

export interface MeCommunePerformance {
  commune: string;
  province: string;
  tauxCouverture: number;
  tonnesCollectees: number;
  signalementsTotal: number;
  signalementsResolus: number;
  tauxResolution: number;
  delaiMoyenHeures: number;
  conformiteScore: number;
  statut: 'Performant' | 'En progression' | 'Vigilance';
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminUser: string;
  action: 'CONNEXION' | 'CREATION' | 'MODIFICATION' | 'SUPPRESSION' | 'EXPORT_BDD' | 'SYNCHRO_FORCEE' | 'ACCES_REFUSE';
  collection: string;
  recordId: string;
  details: string;
  ipAddress: string;
  statut: 'SUCCES' | 'AVERTISSEMENT' | 'BLOQUE';
}

export interface AdminAgentUser {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  role: 'Super-Admin' | 'Administrateur REGEDEK' | 'Inspecteur Salubrité' | 'Chef de Brigade' | 'Opérateur Trésorerie';
  communeAffectation: string;
  statut: 'Actif' | 'En attente' | 'Suspendu';
  dateCreation: string;
  derniereConnexion: string;
  actionsTotal: number;
}

export type WasteProducerType = 
  | 'Ménage Résidentiel standard'
  | 'Ménage Résidentiel haut standing'
  | 'Échoppe / Table de marché'
  | 'Boutique & Commerce'
  | 'Restaurant, Hôtel & Bar'
  | 'Entreprise & Industrie'
  | 'Évacuation Ponctuelle & Gravats';

export type PaymentMethod = 'Airtel Money' | 'M-Pesa' | 'Orange Money' | 'Compte bancaire Equity BCDC';

export interface WastePayment {
  id: string;
  receiptNumber: string; // e.g. QUITTANCE-REGEDEK-2026-0012
  date: string;
  timestamp: number;
  payerName: string;
  payerPhone: string;
  payerEmail?: string;
  producerType: WasteProducerType;
  province: string;
  ville: string;
  commune: string;
  quartier: string;
  address?: string;
  serviceType: string;
  period: string; // e.g. 'Septembre 2026'
  amountCDF: number;
  amountUSD: number;
  currencyPaid: 'CDF' | 'USD';
  paymentMethod: PaymentMethod;
  transactionReference: string; // Numéro de référence de transaction opérateur
  status: 'Validé' | 'En attente de vérification' | 'Rejeté (Fraude suspectée)';
  agentCollector?: string;
  // 6-Level Anti-Fraud Security Controls:
  proofImage?: string; // 2. Double preuve de paiement (Capture d'écran)
  apiGatewayStatus?: 'CONFIRMED' | 'PENDING' | 'FAILED'; // 1. Validation par API de paiement
  timestampConfirmed?: boolean; // 3. Horodatage confirmé et cohérent
  integrityHash?: string; // 4. Hash d'intégrité SHA-256
  auditNotes?: string; // 6. Audit et supervision agent de contrôle
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'urgent';
  date: string;
  author: string;
}

export interface SecondaryAdminKey {
  id: string;
  key: string;
  name: string;
  email?: string;
  role: string; // e.g. "Administrateur Adjoint - Voirie", "Inspecteur ACE", etc.
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
  status: 'active' | 'revoked';
  lastUsedAt?: string;
  notes?: string;
}

export interface AdminSecurityConfig {
  hasCustomMasterPassword: boolean;
  masterAdminEmail: string;
  secondaryKeysCount: number;
  secondaryKeys: SecondaryAdminKey[];
}

export interface OfflinePendingItem {
  id: string;
  type: 'signalement' | 'mission' | 'paiement' | 'evaluation';
  title: string;
  details: string;
  createdAt: string;
  synced: boolean;
  data: any;
}

export interface OfflineQueueStats {
  signalements: number;
  missions: number;
  payments: number;
  evaluations: number;
  total: number;
}

export interface GlobalSyncState {
  syncId: string;
  timestamp: number;
  triggeredBy: string;
  version: string;
  forceInstantReload?: boolean;
  purgeObsoleteCaches?: boolean;
  announcement?: AdminAnnouncement | null;
  autoSyncIntervalSec: number;
  stats: {
    signalementsCount: number;
    missionsCount: number;
    evaluationsCount: number;
    paymentsCount: number;
  };
  realActionsCount?: number;
}

export interface AdminBroadcastPayload {
  adminEmail?: string;
  adminCode?: string;
  announcement?: {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'urgent';
  };
  forceInstantReload?: boolean;
  purgeObsoleteCaches?: boolean;
  autoSyncIntervalSec?: number;
}

export interface SystemAutomationState {
  isAutomated: boolean;
  autoSyncActive: boolean;
  autoUpdateActive: boolean;
  offlineAutoRecovery: boolean;
  lastSyncTimestamp: number | null;
  lastUpdateCheckTimestamp: number | null;
  lastResetTimestamp: number | null;
  pendingOfflineQueueCount: number;
  systemHealth: 'optimal' | 'syncing' | 'updating' | 'recovering';
}

export interface SystemResetOptions {
  resetLocalCache?: boolean;
  resetOfflineQueues?: boolean;
  resetSessions?: boolean;
  triggerServerReset?: boolean;
  adminEmail?: string;
  adminCode?: string;
  forceReload?: boolean;
  resetType?: 'cache_only' | 'sync_state' | 'full_factory_reset';
}
