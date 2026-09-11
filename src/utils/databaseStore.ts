import { Signalement, AssainissementMission, EvaluationEnv, WasteAiAnalysisResult } from '../types';

export interface DatabaseScanItem {
  id: string;
  timestamp: string;
  date: string;
  wasteName: string;
  category: string;
  binColor: string;
  binName: string;
  confidence: number;
  recyclability: string;
  decompositionTime?: string;
  localKinshasaOutlets?: string;
  location: string;
  user: string;
}

export interface DatabaseFormationItem {
  id: string;
  timestamp: string;
  date: string;
  learnerName: string;
  type: 'Quiz Citoyen' | 'Module Certifiant';
  moduleOrQuiz: string;
  score: string;
  result: 'Certifié' | 'Validé' | 'À Renforcer';
  province: string;
  ecoPoints: number;
}

const SCANS_STORAGE_KEY = 'ewaste_scans_database';
const FORMATIONS_STORAGE_KEY = 'ewaste_formations_database';

// Initial realistic demonstration datasets for RDC
const INITIAL_SCANS: DatabaseScanItem[] = [
  {
    id: "SCAN-889101",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    date: new Date().toISOString().split('T')[0],
    wasteName: "Bouteilles d'eau en plastique PET (Swissta)",
    category: "Plastique",
    binColor: "Jaune",
    binName: "Bac Plastiques & Recyclables",
    confidence: 98,
    recyclability: "100% Recyclable",
    decompositionTime: "450 ans",
    localKinshasaOutlets: "Centre Clean Plast Limete Kingabwa & Point d'apport REGEDEK",
    location: "Kinshasa - Limete",
    user: "Citoyen Éco-Volontaire"
  },
  {
    id: "SCAN-889045",
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    date: new Date().toISOString().split('T')[0],
    wasteName: "Canettes en aluminium boisson maltée",
    category: "Métal",
    binColor: "Bleu",
    binName: "Bac Métaux & Canettes",
    confidence: 96,
    recyclability: "Recyclable à l'infini",
    decompositionTime: "200 ans",
    localKinshasaOutlets: "Fonderie artisanale Kingabwa & Réseau récupérateurs",
    location: "Kinshasa - Gombe",
    user: "Brigade Salubrité REGEDEK"
  },
  {
    id: "SCAN-888920",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    date: new Date().toISOString().split('T')[0],
    wasteName: "Épluchures de manioc et restes de safous",
    category: "Organique / Biodéchet",
    binColor: "Vert",
    binName: "Bac Matières Organiques / Compost",
    confidence: 94,
    recyclability: "Compostable",
    decompositionTime: "2 à 4 semaines",
    localKinshasaOutlets: "Projet maraîcher de Kingabwa & Ceinture Verte Nsele",
    location: "Kinshasa - Kalamu",
    user: "Ménage Citoyen Matonge"
  },
  {
    id: "SCAN-887410",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString().split('T')[0],
    wasteName: "Batterie d'onduleur au plomb & cartes électroniques",
    category: "Dangereux & Électronique",
    binColor: "Rouge",
    binName: "Bac Déchets Spéciaux & DEEE",
    confidence: 99,
    recyclability: "Filière Sécurisée Obligatoire",
    decompositionTime: "Non biodégradable (Hautement toxique)",
    localKinshasaOutlets: "Plateforme DEEE REGEDEK / ACE Kinshasa",
    location: "Lubumbashi - Haut-Katanga",
    user: "Technicien Informatique"
  },
  {
    id: "SCAN-886190",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString().split('T')[0],
    wasteName: "Cartons d'emballage et caisses ondulées",
    category: "Papier & Carton",
    binColor: "Bleu",
    binName: "Bac Papiers & Cartons Secs",
    confidence: 95,
    recyclability: "Recyclable",
    decompositionTime: "2 à 5 mois",
    localKinshasaOutlets: "Papeterie Cartonnage Utexafrica & Marché Gambela",
    location: "Goma - Nord-Kivu",
    user: "Commerçant Local"
  }
];

const INITIAL_FORMATIONS: DatabaseFormationItem[] = [
  {
    id: "FORM-771090",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    date: new Date().toISOString().split('T')[0],
    learnerName: "Dieudonné Mwamba",
    type: "Quiz Citoyen",
    moduleOrQuiz: "Quiz Salubrité, Tri Sélectif & REGEDEK",
    score: "4/4 (100%)",
    result: "Validé",
    province: "Kinshasa",
    ecoPoints: 40
  },
  {
    id: "FORM-771022",
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    date: new Date().toISOString().split('T')[0],
    learnerName: "Solange Bompere",
    type: "Module Certifiant",
    moduleOrQuiz: "Tri Sélectif, Valorisation & Compostage Tropical",
    score: "100%",
    result: "Certifié",
    province: "Kinshasa",
    ecoPoints: 50
  },
  {
    id: "FORM-770984",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    date: new Date().toISOString().split('T')[0],
    learnerName: "Patrick Kalombo",
    type: "Module Certifiant",
    moduleOrQuiz: "Hydraulique Urbaine, Curage des Caniveaux & Lutte Inondations",
    score: "92%",
    result: "Certifié",
    province: "Kongo-Central",
    ecoPoints: 50
  },
  {
    id: "FORM-770412",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().split('T')[0],
    learnerName: "Jeanne Kanyeba",
    type: "Quiz Citoyen",
    moduleOrQuiz: "Quiz Éco-Citoyen RDC",
    score: "3/4 (75%)",
    result: "Validé",
    province: "Haut-Katanga",
    ecoPoints: 30
  },
  {
    id: "FORM-769201",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString().split('T')[0],
    learnerName: "Alain Makiese",
    type: "Module Certifiant",
    moduleOrQuiz: "Sécurité & Hygiène des Brigades d'Assainissement (EPI)",
    score: "96%",
    result: "Certifié",
    province: "Kinshasa",
    ecoPoints: 50
  }
];

export function getStoredScans(): DatabaseScanItem[] {
  try {
    const raw = localStorage.getItem(SCANS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Erreur lecture scans database:", e);
  }
  return INITIAL_SCANS;
}

export function saveScanItem(item: DatabaseScanItem): void {
  try {
    const current = getStoredScans();
    const updated = [item, ...current.filter(i => i.id !== item.id)];
    localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
    window.dispatchEvent(new CustomEvent('ewaste_database_updated', {
      detail: { type: 'scan', item }
    }));
  } catch (e) {
    console.warn("Erreur sauvegarde scan:", e);
  }
}

export function getStoredFormations(): DatabaseFormationItem[] {
  try {
    const raw = localStorage.getItem(FORMATIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Erreur lecture formations database:", e);
  }
  return INITIAL_FORMATIONS;
}

export function saveFormationItem(item: DatabaseFormationItem): void {
  try {
    const current = getStoredFormations();
    const updated = [item, ...current.filter(i => i.id !== item.id)];
    localStorage.setItem(FORMATIONS_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
    window.dispatchEvent(new CustomEvent('ewaste_database_updated', {
      detail: { type: 'formation', item }
    }));
  } catch (e) {
    console.warn("Erreur sauvegarde formation:", e);
  }
}

/**
 * Filtre les données selon la période sélectionnée
 */
export function filterItemsByPeriod<T extends { date?: string; startDate?: string; timestamp?: string }>(
  items: T[],
  period: 'journalier' | 'hebdomadaire' | 'tout'
): T[] {
  if (period === 'tout') return items;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (period === 'journalier') {
    return items.filter(item => {
      const itemDate = item.date || item.startDate || (item.timestamp ? item.timestamp.split('T')[0] : '');
      return itemDate === todayStr;
    });
  }

  if (period === 'hebdomadaire') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const minTime = sevenDaysAgo.getTime();

    return items.filter(item => {
      if (item.timestamp) {
        return new Date(item.timestamp).getTime() >= minTime;
      }
      const itemDate = item.date || item.startDate;
      if (itemDate) {
        return new Date(itemDate).getTime() >= minTime;
      }
      return true;
    });
  }

  return items;
}
