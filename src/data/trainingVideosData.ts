export interface PedagogicalVideo {
  id: string;
  title: string;
  category: 'Salubrité Urbaine' | 'Compostage & Maraîchage' | 'Recyclage Plastique' | 'Législation & Taxes' | 'Santé Publique';
  duration: string;
  speaker: string;
  institution: string;
  thumbnailUrl: string;
  description: string;
  videoUrl?: string; // YouTube embed or MP4 fallback
  chapters: {
    time: string;
    seconds: number;
    title: string;
    description: string;
  }[];
  pedagogicalObjectives: string[];
  keyTakeaways: string[];
  practicalAdvice: string[];
  targetAudience: string;
  interactiveQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const PEDAGOGICAL_VIDEOS: PedagogicalVideo[] = [
  {
    id: 'VID-01',
    title: 'Plan Directeur d\'Assainissement Urbain et Déploiement des Brigades REGEDEK',
    category: 'Salubrité Urbaine',
    duration: '14:30',
    speaker: 'Ing. Jean-Luc Mwamba, Directeur des Opérations',
    institution: 'REGEDEK - Régie de Gestion des Déchets de Kinshasa',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800',
    description: 'Ce module vidéo officiel expose le schéma logistique global de collecte dans les 24 communes de Kinshasa, le transit par les points d\'apport volontaire et l\'acheminement vers le Centre d\'Enfouissement Technique (CET) de Mpasa.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', // Clean player fallback
    chapters: [
      { time: '00:00', seconds: 0, title: 'Introduction & Défis de salubrité à Kinshasa', description: 'Diagnostic des 10 000 tonnes journalières générées dans la capitale.' },
      { time: '03:15', seconds: 195, title: 'Circuit de pré-collecte par les charretiers et pousse-pousse', description: 'Organisation des micro-opérateurs dans les quartiers non carrossables.' },
      { time: '07:40', seconds: 460, title: 'Centres de transit et rotation des bennes tasseuses', description: 'Évacuation des dépotoirs de transit vers les grandes artères.' },
      { time: '11:20', seconds: 680, title: 'Traitement au Centre d\'Enfouissement Technique (CET) de Mpasa', description: 'Procédés de compactage, casiers étanches et gestion des lixiviats.' }
    ],
    pedagogicalObjectives: [
      'Comprendre la chaîne logistique complète d\'un déchet, de la cuisine à la décharge contrôlée.',
      'Identifier les points de rupture causant les dépotoirs sauvages en saison des pluies.',
      'Connaître les protocoles d\'intervention d\'urgence des brigades de salubrité.'
    ],
    keyTakeaways: [
      'La pré-collecte de proximité est indispensable pour désenclaver les quartiers à voirie étroite.',
      'Les lixiviats (jus de décharge) doivent être impérativement traités pour éviter la pollution de la nappe phréatique.',
      'Tout citoyen doit respecter les jours et horaires de passage des camions REGEDEK.'
    ],
    practicalAdvice: [
      'Ne pas déverser de déchets dans les caniveaux avant ou pendant une forte pluie.',
      'Conditionner les sacs de déchets fermés au point de ramassage désigné.',
      'Signaler immédiatement les engorgements via l\'application EWaste Mobile (ewastemobile.ai.studio).'
    ],
    targetAudience: 'Tout public, Chefs de quartier, Agents municipaux',
    interactiveQuiz: {
      question: "Quelle est la destination finale certifiée pour le confinement et traitement des déchets non recyclables de Kinshasa ?",
      options: [
        "Les berges de la rivière Ndjili",
        "Le Centre d'Enfouissement Technique (CET) de Mpasa",
        "Les ravins de Mont-Ngafula",
        "Les caniveaux du Boulevard Triomphal"
      ],
      correctIndex: 1,
      explanation: "Le CET de Mpasa est l'installation technique officielle dotée de casiers étanches et de bassins de lixiviats pour neutraliser les déchets de la capitale."
    }
  },
  {
    id: 'VID-02',
    title: 'Compostage Tropical Accéléré & Valorisation Maraîchère à N\'djili et Cecomaf',
    category: 'Compostage & Maraîchage',
    duration: '11:15',
    speaker: 'Mme Marie-Claire Kabeya, Agronome & Formatrice',
    institution: 'ENVIRONNEMENT-PLUS RDC',
    thumbnailUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&q=80&w=800',
    description: 'Démonstration pratique de fabrication d\'un compost de haute qualité biologique en 6 semaines sous le climat chaud et humide de Kinshasa, à partir d\'épluchures de manioc, légumes avariés et résidus de tonte.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Les atouts du climat tropical pour la décomposition', description: 'Température et hygrométrie favorables aux bactéries thermophiles.' },
      { time: '02:45', seconds: 165, title: 'Équilibre fondamental : Matières Vertes (Azote) et Brunes (Carbone)', description: 'Dosage entre épluchures de manioc et feuilles sèches de manguiers.' },
      { time: '05:30', seconds: 330, title: 'Montage du tas en couches aérées et contrôle de l\'humidité', description: 'Test de la poignée et aération par retournement hebdomadaire.' },
      { time: '08:50', seconds: 530, title: 'Tamisage et application sur les planches maraîchères de Cecomaf', description: 'Dosage d\'amendement et amélioration de la rétention en eau des sols sablonneux.' }
    ],
    pedagogicalObjectives: [
      'Maîtriser la règle des proportions C/N (Carbone/Azote) en zone tropicale.',
      'Éviter les odeurs et la pourriture anaérobie grâce à une aération rigoureuse.',
      'Savoir reconnaître un compost mûr prêt pour la fertilisation maraîchère.'
    ],
    keyTakeaways: [
      '55% des déchets ménagers kinois peuvent être recyclés en or brun fertilisant.',
      'Le compost mûr dégage une bonne odeur de sous-bois forestier et présente une couleur sombre.',
      'L\'application de compost réduit la dépendance aux engrais chimiques importés coûteux.'
    ],
    practicalAdvice: [
      'Hacher les déchets grossiers (troncs de bananier, cosses) pour accélérer le travail bactérien.',
      'Couvrir le tas d\'une bâche ou de feuilles de palmier pendant les fortes pluies d\'octobre à avril.',
      'Arroser légèrement si le tas devient trop sec en saison sèche (juin à août).'
    ],
    targetAudience: 'Maraîchers, Ménages avec parcelle, Écoles, Agriculteurs périurbains',
    interactiveQuiz: {
      question: "Quel ratio fondamental garantit une montée en température sans odeur dans un tas de compost tropical ?",
      options: [
        "100% de sachets plastiques et 0% de terre",
        "Équilibre entre Matières Vertes humides (Azote) et Matières Brunes sèches (Carbone)",
        "Uniquement des bouteilles en verre",
        "Ajout de produits chimiques désherbants"
      ],
      correctIndex: 1,
      explanation: "L'équilibre carbone/azote combiné à une bonne aération permet aux micro-organismes thermophiles de décomposer les résidus en 6 à 8 semaines sans odeur."
    }
  },
  {
    id: 'VID-03',
    title: 'Recyclage Industriel du Plastique (PET & PEHD) et Pavés Écologiques en RDC',
    category: 'Recyclage Plastique',
    duration: '12:50',
    speaker: 'Patrick Ilunga, Ingénieur des Procédés',
    institution: 'Plateforme Nationale de Valorisation des Polymères RDC',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
    description: 'Immersion au cœur des ateliers de broyage de Kingabwa et des unités de fusion artisanale pour la production de pavés de chaussée résistants à l\'érosion et sans ciment.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    chapters: [
      { time: '00:00', seconds: 0, title: 'La crise de la bouteille d\'eau plastique à Kinshasa', description: 'Accumulation dans le fleuve Congo et bouchage systématique des dalots.' },
      { time: '03:10', seconds: 190, title: 'Tri par résine : PET (bouteilles transparentes) vs PEHD (flacons opaques)', description: 'Séparation optique et manuelle indispensable pour éviter la contamination.' },
      { time: '06:20', seconds: 380, title: 'Lavage, déchiquetage en paillettes (flakes) et conditionnement', description: 'Transformation mécanique pour réincorporation ou exportation.' },
      { time: '09:40', seconds: 580, title: 'Fabrication de pavés autobloquants en plastique et sable de rivière', description: 'Mélange à chaud 1/3 plastique fondu pour 2/3 sable : étanchéité et solidité mécanique.' }
    ],
    pedagogicalObjectives: [
      'Différencier les familles de polymères et leurs températures de fusion respectives.',
      'Comprendre la viabilité économique de la collecte et revente au kilogramme.',
      'Apprendre les consignes de sécurité thermique lors de la fabrication de pavés.'
    ],
    keyTakeaways: [
      'Un pavé écologique plastique-sable consomme environ 300 à 400 sachets ou 80 bouteilles.',
      'Ce matériau ne s\'effrite pas sous la pluie et résiste aux ravages des érosions kinoises.',
      'La filière génère des emplois locaux rémunérateurs pour les jeunes et collecteurs.'
    ],
    practicalAdvice: [
      'Ne jamais brûler les plastiques à l\'air libre : émission mortelle de dioxines cancérigènes.',
      'Compacter manuellement les bouteilles d\'eau avant de les confier aux collecteurs.',
      'Utiliser des équipements de protection respiratoire appropriés lors de toute chauffe de résines.'
    ],
    targetAudience: 'Artisans, Entreprises de BTP, PME de valorisation, Collecteurs urbains',
    interactiveQuiz: {
      question: "Pourquoi est-il formellement interdit de brûler les déchets plastiques à l'air libre dans les parcelles de Kinshasa ?",
      options: [
        "Parce que cela rafraîchit l'atmosphère",
        "Parce que la combustion libère des dioxines et furanes cancérigènes très toxiques pour les poumons",
        "Parce que le plastique se transforme en or pur",
        "C'est autorisé uniquement le dimanche"
      ],
      correctIndex: 1,
      explanation: "L'incinération sauvage de polymères émet des composés organochlorés persistants et cancérigènes qui intoxiquent directement les familles et voisins."
    }
  },
  {
    id: 'VID-04',
    title: 'Cadre Réglementaire, Taxes de Salubrité et Sanctions Légales en RDC',
    category: 'Législation & Taxes',
    duration: '10:40',
    speaker: 'Me Chantal Kalala, Juriste en Droit de l\'Environnement',
    institution: 'Ministère de l\'Environnement & Gouvernorat de Kinshasa',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
    description: 'Analyse juridique détaillée de la Loi-cadre n° 11/009 sur la protection de l\'environnement, du principe Pollueur-Payeur, des arrêtés provinciaux et du paiement sécurisé de la redevance d\'assainissement.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Fondements de la Loi-cadre n° 11/009 du 9 juillet 2011', description: 'Droit constitutionnel des citoyens à un environnement sain et non pollué.' },
      { time: '02:30', seconds: 150, title: 'Arrêtés provinciaux sur la salubrité publique (Édits de Kinshasa)', description: 'Interdiction formelle des dépôts sauvages sur la voie publique et berges.' },
      { time: '05:15', seconds: 315, title: 'Barème officiel de la redevance et quittance fiscale sécurisée', description: 'Modalités de calcul selon la catégorie du producteur (ménages, commerces, industries).' },
      { time: '08:00', seconds: 480, title: 'Pouvoirs de police administrative des inspecteurs REGEDEK', description: 'Constat d\'infraction, procès-verbal de flagrance et recouvrement forcé.' }
    ],
    pedagogicalObjectives: [
      'Connaître les droits et devoirs légaux des citoyens et des entreprises en matière de déchets.',
      'Identifier les mécanismes de calcul et d\'affectation des redevances de salubrité.',
      'Comprendre la validité juridique d\'une quittance électronique avec QR code officiel.'
    ],
    keyTakeaways: [
      'L\'abandon de déchets sur la voie publique expose à des amendes administratives et astreintes journalières.',
      'Le paiement de la taxe finance directement l\'achat de carburant et l\'entretien du matériel roulant.',
      'La quittance électronique délivrée sur EWaste Mobile (ewastemobile.ai.studio) possède valeur légale de preuve fiscale.'
    ],
    practicalAdvice: [
      'Toujours exiger et conserver le numéro de quittance officiel après tout règlement.',
      'Déclarer fidèlement le volume de production de déchets de son établissement commercial.',
      'Contester tout paiement exigé sans émission de quittance numérique certifiée.'
    ],
    targetAudience: 'Chefs d\'entreprises, Commerçants, Propriétaires immobiliers, Agents percepteurs',
    interactiveQuiz: {
      question: "Quel principe de la Loi-cadre environnementale n° 11/009 impose à l'émetteur de déchets de supporter le coût de son élimination ?",
      options: [
        "Le principe du premier arrivé premier servi",
        "Le principe Pollueur-Payeur",
        "Le principe de gratuité universelle",
        "Le principe du déni de responsabilité"
      ],
      correctIndex: 1,
      explanation: "Le principe Pollueur-Payeur oblige légalement chaque citoyen, commerce et industrie à assumer le coût financier de la gestion et du traitement des rejets qu'il génère."
    }
  },
  {
    id: 'VID-05',
    title: 'Gestion des Risques Sanitaires et Épidémiologiques des Dépotoirs Sauvages',
    category: 'Santé Publique',
    duration: '09:20',
    speaker: 'Dr. Dieudonné Bakambamba, Médecin Épidémiologiste',
    institution: 'Institut National de Santé Publique & REGEDEK',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=800',
    description: 'Présentation des corrélations épidémiologiques entre l\'insalubrité urbaine, les flambées de choléra, de typhoïde et la prolifération des moustiques anophèles et rongeurs réservoirs de leptospirose.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Le dépotoir urbain : écosystème pathogène actif', description: 'Chaleur, humidité et nutriments organiques favorables aux bactéries entériques.' },
      { time: '02:20', seconds: 140, title: 'Vecteurs aériens : Mouches, moustiques et réservoirs d\'eau stagnante', description: 'Pneus usagés et récipients plastiques comme gîtes larvaires de paludisme.' },
      { time: '05:00', seconds: 300, title: 'Contamination hydrique des puits de quartier et forages artisanaux', description: 'Infiltration des polluants dans les sols sablonneux après les fortes averses.' },
      { time: '07:15', seconds: 435, title: 'Protocole d\'évacuation d\'urgence et désinfection au chlore', description: 'Équipements de protection individuelle (EPI) obligatoires pour les éboueurs.' }
    ],
    pedagogicalObjectives: [
      'Identifier les mécanismes de transmission des maladies fécales-orales liées aux dépotoirs.',
      'Reconnaître les gîtes larvaires dans son environnement immédiat et savoir les neutraliser.',
      'Appliquer les règles d\'hygiène strictes en cas de cohabitation involontaire avec un foyer d\'ordures.'
    ],
    keyTakeaways: [
      'Un dépotoir non évacué multiplie par 5 le risque de diarrhées aiguës chez les enfants de moins de 5 ans.',
      'Vider les eaux stagnantes dans les boîtes de conserve et pneus réduit de 60% la densité de moustiques.',
      'Le signalement précoce sauve des vies en empêchant la formation de foyers infectieux majeurs.'
    ],
    practicalAdvice: [
      'Traiter l\'eau de consommation domestique (ébullition ou chlore) si un dépotoir se trouve à moins de 50 m du puits.',
      'Porter des bottes montantes et des gants épais lors des opérations de salubrité communautaire (Salongo).',
      'Signaler sans délai les accumulations de cadavres d\'animaux ou de déchets biomédicaux.'
    ],
    targetAudience: 'Comités de santé de quartier, Mères de famille, Relais communautaires, Jeunesse',
    interactiveQuiz: {
      question: "Quelle mesure domestique immédiate permet d'éliminer 60% des gîtes larvaires de moustiques dans une parcelle ?",
      options: [
        "Vider ou éliminer tous les récipients contenant de l'eau de pluie stagnante (pneus, boîtes, bouteilles)",
        "Planter des fleurs en plastique",
        "Fermer toutes les fenêtres 24h/24",
        "Laisser les eaux sales stagner dans la cour"
      ],
      correctIndex: 0,
      explanation: "Les moustiques vecteurs du paludisme et de la dengue pondent dans les moindres récipients d'eau stagnante ; les supprimer brise leur cycle de reproduction."
    }
  },
  {
    id: 'VID-06',
    title: 'Éducation Environnementale, Tri Sélectif et Économie Circulaire en RDC',
    category: 'Salubrité Urbaine',
    duration: '13:10',
    speaker: 'Fanny Salmon, Coordonnatrice Pédagogique',
    institution: 'ENVIRONNEMENT-PLUS RDC',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    description: 'Guide méthodologique pour sensibiliser les écoles, églises et associations communautaires kinois aux gestes de tri à la source et à la valorisation économique des rebuts ménagers.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    chapters: [
      { time: '00:00', seconds: 0, title: 'L\'éducation à l\'écocitoyenneté dès le plus jeune âge', description: 'Introduire le respect de l\'espace public dans les cursus scolaires et familles.' },
      { time: '03:40', seconds: 220, title: 'La règle des 3R : Réduire, Réutiliser, Recycler', description: 'Application concrète au mode de vie urbain kinois.' },
      { time: '07:15', seconds: 435, title: 'Mise en place de poubelles de tri à 3 bacs (Vert, Bleu, Jaune)', description: 'Séparation physique : organique, plastique, métaux/verre.' },
      { time: '10:30', seconds: 630, title: 'Économie circulaire et création d\'emplois verts', description: 'Modèles économiques inclusifs pour les collecteurs de quartier.' }
    ],
    pedagogicalObjectives: [
      'Savoir animer un atelier de sensibilisation environnementale de quartier.',
      'Maîtriser la couleur normalisée des bacs de tri sélectif en RDC.',
      'Comprendre comment transformer un déchet en opportunité économique locale.'
    ],
    keyTakeaways: [
      'Le meilleur déchet est celui que l\'on ne produit pas (réduction à la source).',
      'Le tri à la maison simplifie tout le travail des éboueurs et collecteurs municipaux.',
      'Chaque citoyen est un ambassadeur de la propreté de sa rue et de sa commune.'
    ],
    interactiveQuiz: {
      question: "Dans le système de tri sélectif normalisé, quelle catégorie de déchets est destinée au bac vert ?",
      options: [
        "Les piles et batteries usagées",
        "Les déchets organiques et épluchures compostables",
        "Les débris de verre tranchant",
        "Les métaux lourds"
      ],
      correctIndex: 1,
      explanation: "Le bac vert est réservé aux matières organiques biodégradables (épluchures, restes de repas, feuilles mortes) directement valorisables en compost."
    },
    practicalAdvice: [
      'Prévoir au minimum 2 récipients distincts dans la cuisine (organique vs sec).',
      'Sensibiliser ses voisins lors des travaux communautaires du samedi (Salongo).',
      'Utiliser des sacs réutilisables en tissu pour les courses au grand marché.'
    ],
    targetAudience: 'Enseignants, Élèves, Associations citoyennes, Églises, Familles'
  }
];

