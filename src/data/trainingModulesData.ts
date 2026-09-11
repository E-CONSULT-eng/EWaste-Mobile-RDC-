import { TrainingModule } from '../types';

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'MOD-01',
    code: 'REG-TR-101',
    title: 'Tri Sélectif, Valorisation & Compostage Tropical à Kinshasa',
    shortDescription: 'Méthodologie complète pour séparer à la source les flux de déchets (biodéchets, plastiques, métaux) et produire un compost naturel adapté aux sols maraîchers kinois.',
    category: 'Tri & Valorisation',
    targetAudience: 'Tout Public / Citoyens',
    level: 'Fondamental',
    durationTotal: '45 min',
    bannerGradient: 'from-emerald-800 to-teal-900',
    passingScorePercent: 75,
    lessons: [
      {
        id: 'L-01-1',
        title: 'Le Tri à la Source dans les Ménages Kinois (Les 3 Bacs)',
        duration: '12 min',
        summary: 'Comprendre la structure des déchets ménagers à Kinshasa (plus de 55% d\'organiques) et déployer le code couleur officiel pour un tri efficace dès la cuisine.',
        contentParagraphs: [
          "À Kinshasa, la production journalière de déchets dépasse les 10 000 tonnes, dont une grande proportion est constituée de matières biodégradables (épluchures de manioc, légumes de marché, bananes plantains, restes alimentaires).",
          "Le système standard préconisé par la REGEDEK repose sur trois contenants étanches : le Bac Vert réservé exclusivement aux matières organiques humides ; le Bac Jaune pour les plastiques recyclables (bouteilles d'eau PET, flacons de détergent PEHD) et canettes métalliques ; et le Bac Gris pour les résidus ultimes non recyclables.",
          "Une règle d'or consiste à ne jamais enfermer les biodéchets dans des sachets plastiques noués étanches, car cela stoppe la circulation de l'oxygène, provoque des fermentations anaérobies nauséabondes et rend le compostage impossible."
        ],
        kinshasaFieldStudy: {
          location: 'Commune de Bandalungwa (Quartier Makelele)',
          context: 'Accumulation chronique de sacs poubelles mélangés sur les trottoirs de l\'avenue Kasa-Vubu, attirant les mouches et bouchant le dalot.',
          solution: 'Distribution de seaux verts troués pour l\'aération et collecte séparée deux fois par semaine le matin avec la coopérative de quartier.'
        },
        keyTakeaways: [
          '55% des déchets kinois sont organiques et peuvent enrichir nos sols au lieu d\'encombrer les décharges.',
          'Bac Vert = Organique, Bac Jaune = Recyclable (bouteilles/canettes), Bac Gris = Déchets résiduels.',
          'Toujours rincer sommairement les bouteilles et canettes pour éviter les odeurs et l\'invasion d\'insectes.'
        ],
        practicalChecklist: [
          'Placer une poubelle dédiée aux épluchures dans la cuisine',
          'Aplatir les bouteilles d\'eau minérale avant de les stocker dans le sac jaune',
          'Vérifier l\'absence de piles ou de débris de verre dans les biodéchets',
          'Fermer les bacs pour empêcher l\'entrée des rongeurs et insectes'
        ]
      },
      {
        id: 'L-01-2',
        title: 'Fabrication Domestique et Communale de Compost Tropical',
        duration: '18 min',
        summary: 'Technique d\'aération, dosage équilibré azote/carbone (matières vertes et brunes) et contrôle de la température sous le climat chaud et humide de Kinshasa.',
        contentParagraphs: [
          "Le climat tropical humide de Kinshasa offre des conditions thermiques idéales pour accélérer la décomposition biologique des matières organiques, permettant d'obtenir un compost mûr en 6 à 8 semaines seulement.",
          "La réussite d'un tas de compost dépend de l'équilibre entre deux catégories de matières : les matières azotées ou 'vertes' (épluchures de légumes, tontes d'herbe, fanes de manioc) qui apportent l'humidité et les nutriments, et les matières carbonées ou 'brunes' (feuilles mortes de manguiers, sciure de bois, cartons bruns non imprimés) qui structurent le tas et favorisent la circulation d'air.",
          "Un retournement hebdomadaire à la fourche est indispensable. Si le tas dégage une odeur d'ammoniac, il est trop humide : ajoutez des feuilles sèches. S'il ne chauffe pas du tout, il manque d'eau ou d'azote."
        ],
        kinshasaFieldStudy: {
          location: 'Coopérative Maraîchère Cecomaf (N\'djili / Masina)',
          context: 'Les maraîchers de la vallée de la N\'djili achetaient des engrais chimiques coûteux qui appauvrissaient progressivement la nappe phréatique.',
          solution: 'Mise en place d\'andains de compostage à partir des déchets végétaux du Marché de la Liberté, fournissant 15 tonnes de compost bio mensuel.'
        },
        keyTakeaways: [
          'Alterner 2 volumes de matières vertes (riches en azote) pour 1 volume de matières brunes (carbone).',
          'La température interne du tas doit atteindre 55°C à 65°C pour détruire les graines d\'adventices et germes pathogènes.',
          'Le compost mûr a une douce odeur de terre de sous-bois et une couleur brun-noir foncé.'
        ],
        practicalChecklist: [
          'Choisir un emplacement ombragé sous un arbre pour éviter le dessèchement excessif',
          'Poser une première couche de branchages pour drainer le fond',
          'Arroser légèrement si le mélange est trop sec (test du poing pressé sans ruissellement)',
          'Tamiser avec un grillage de 1 cm avant épandage sur les parcelles agricoles'
        ]
      },
      {
        id: 'L-01-3',
        title: 'La Filière Plastique : Du Ramassage aux Usines de Kinshasa',
        duration: '15 min',
        summary: 'Identifier les différents types de résines plastiques (PET, PEHD, PP) et maîtriser les circuits de rachat auprès des centres de valorisation de Kingabwa et Limete.',
        contentParagraphs: [
          "Toutes les matières plastiques ne se valent pas sur le marché kinois. Le PET (code 1, bouteilles d'eau minérale transparentes ou bleutées) et le PEHD (code 2, bidons d'huile, bouteilles opaques de shampoing) disposent de filières industrielles structurées à Kinshasa.",
          "Les bouteilles en PET collectées sont compactées en balles de 150 kg dans les stations de transfert, puis broyées en paillettes lavées. Celles-ci sont réinjectées dans la production de nouvelles préformes ou utilisées comme géotextiles.",
          "Le grand défi reste les sachets plastiques à usage unique ('chachets'), interdits par décret mais encore omniprésents. Ils doivent être redirigés vers les unités de confection de pavés autobloquants écologiques mélangés à du sable de rivière."
        ],
        kinshasaFieldStudy: {
          location: 'Zone Industrielle de Limete (Poids Lourds)',
          context: 'Centaines de tonnes de bouteilles plastiques flottant sur la baie de Ngaliema et bloquant le pont de Limete.',
          solution: 'Contrats de rachat direct au kilo signés avec les associations de jeunes collecteurs, garantissant un revenu stable et un approvisionnement régulier aux broyeurs.'
        },
        keyTakeaways: [
          'Le PET transparent a la valeur de rachat la plus élevée par tonne.',
          'Ne pas laisser les bouchons fermés sous pression : percer ou desserrer avant compactage.',
          'Le recyclage du plastique évite l\'engorgement des caniveaux et préserve le fleuve Congo.'
        ],
        practicalChecklist: [
          'Séparer les bouteilles translucides des flacons colorés',
          'Stocker dans des sacs tissés aérés pour faciliter la pesée',
          'Enregistrer les pesées dans le carnet de la coopérative',
          'Orienter les plastiques souples vers les ateliers de pavés écologiques'
        ]
      }
    ],
    quiz: [
      {
        id: 1,
        question: 'Quelle est la proportion moyenne de déchets organiques dans la poubelle d\'un ménage kinois ?',
        options: [
          'Moins de 10%',
          'Environ 25%',
          'Plus de 50% à 60%',
          'Quasiment 100%'
        ],
        correctIndex: 2,
        explanation: 'À Kinshasa, la fraction fermentescible (organique) représente entre 50% et 60% du gisement total de déchets urbains.'
      },
      {
        id: 2,
        question: 'Que faut-il faire si un tas de compost dégage une forte odeur désagréable d\'ammoniac ?',
        options: [
          'Verser de l\'eau de javel sur le tas',
          'Ajouter des matières brunes sèches (feuilles mortes, sciure) et retourner pour aérer',
          'Le recouvrir d\'une bâche étanche et ne plus y toucher',
          'Le brûler immédiatement'
        ],
        correctIndex: 1,
        explanation: 'L\'odeur d\'ammoniac indique un excès d\'azote et d\'humidité en manque d\'air. L\'ajout de carbone sec et le brassage rétablissent l\'équilibre aérobie.'
      },
      {
        id: 3,
        question: 'Quel bac est officiellement attribué aux bouteilles plastiques et canettes dans le protocole REGEDEK ?',
        options: [
          'Le Bac Vert',
          'Le Bac Jaune',
          'Le Bac Gris',
          'Le Bac Rouge'
        ],
        correctIndex: 1,
        explanation: 'Le Bac Jaune est la couleur standardisée pour les emballages recyclables (bouteilles plastiques et canettes métalliques).'
      }
    ]
  },
  {
    id: 'MOD-02',
    code: 'REG-HYD-201',
    title: 'Salubrité Urbaine, Curage des Caniveaux & Prévention des Crues',
    shortDescription: 'Techniques d\'assainissement des ouvrages d\'évacuation des eaux pluviales, désensablement des dalots et prévention des inondations catastrophiques à Kinshasa.',
    category: 'Hydraulique & Salubrité',
    targetAudience: 'Agents & Éboueurs de Terrain',
    level: 'Intermédiaire',
    durationTotal: '55 min',
    bannerGradient: 'from-blue-900 to-indigo-950',
    passingScorePercent: 80,
    lessons: [
      {
        id: 'L-02-1',
        title: 'Diagnostic Hydrologique et Causes des Inondations Kinoises',
        duration: '15 min',
        summary: 'Comprendre l\'impact des rejets d\'immondices dans les rivières (Kalamu, Gombe, N\'djili, Funa) et la topographie vulnérable de la plaine de Kinshasa.',
        contentParagraphs: [
          "Kinshasa est construite sur une plaine alluviale bordée de collines érosives. En période de fortes pluies (octobre à mai), les bassins versants drainent d'immenses volumes d'eaux de ruissellement vers les exutoires naturels du fleuve Congo.",
          "Lorsque les caniveaux et ponts sont obstrués par des amas de bouteilles plastiques, de matelas usagés et de sédiments sableux, le niveau d'eau monte en quelques minutes, submergeant les quartiers résidentiels (Kalamu, Kasa-Vubu, Limete, Camp Luka).",
          "La salubrité n'est donc pas une simple question esthétique : c'est un impératif de sécurité civile pour protéger les vies humaines, les habitations et prévenir les épidémies d'origine hydrique (choléra, typhoïde)."
        ],
        kinshasaFieldStudy: {
          location: 'Pont de Matonge (Rivière Kalamu)',
          context: 'Chaque orage provoquait le débordement de la rivière sur les avenues Victoire et Stade, inondant plus de 400 parcelles.',
          solution: 'Installation de pièges à macrodéchets flottants métalliques en amont et curage mécanique bimensuel avec évacuation immédiate des boues.'
        },
        keyTakeaways: [
          'Un caniveau bouché par des plastiques perd jusqu\'à 90% de sa capacité d\'évacuation hydraulique.',
          'L\'inondation favorise la stagnation d\'eaux usées, multipliant les gîtes larvaires d\'anophèles (paludisme).',
          'Le curage préventif avant la saison des pluies coûte 10 fois moins cher que les réparations post-catastrophe.'
        ],
        practicalChecklist: [
          'Repérer les points bas et goulets d\'étranglement lors des tournées d\'inspection',
          'Vérifier que les grilles avaloirs ne sont pas recouvertes de terre battue',
          'Signaler tout déversement illégal d\'ordures ménagères dans le lit d\'un cours d\'eau',
          'Sensibiliser les tenanciers de terrasses et commerçants riverains des caniveaux'
        ]
      },
      {
        id: 'L-02-2',
        title: 'Méthodologie Opérationnelle de Curage Manuel et Mécanisé',
        duration: '20 min',
        summary: 'Protocole étape par étape : ouverture sécurisée des dalles, raclage des boues, ressuyage sur berge et évacuation immédiate vers les décharges autorisées.',
        contentParagraphs: [
          "Le curage ne consiste pas simplement à sortir les boues du caniveau pour les abandonner sur la chaussée. Trop souvent à Kinshasa, des tas de boues non évacués sont réintroduits dans le collecteur dès la pluie suivante.",
          "Le protocole officiel REGEDEK impose le 'Ressuyage encadré' : les boues et sables extraits sont déposés sur des bâches étanches le long de la bordure pendant 24 à 48 heures maximum pour laisser l'eau s'égoutter, réduisant leur poids de 40%.",
          "Dès le séchage préliminaire, la benne tasseuse ou le camion benne doit impérativement intervenir pour charger et transporter les sédiments au centre d'enfouissement ou sur les sites de comblement d'érosions validés par l'ingénieur municipal."
        ],
        kinshasaFieldStudy: {
          location: 'Avenue de la Libération (ex-24 Novembre) / Lingwala',
          context: 'Les cantonniers vidaient les dalots mais laissaient les résidus sur le bitume, bloquant la circulation et recréant l\'engorgement.',
          solution: 'Protocole de balisage avec rubalise de sécurité et enlèvement camion planifié dans la nuit même.'
        },
        keyTakeaways: [
          'Ne jamais laisser de boues curées à même le trottoir sans bâche de protection.',
          'Délais d\'évacuation maximal : 48 heures sous peine d\'amende administrative.',
          'Les dalles de couverture doivent être repositionnées immédiatement pour éviter les chutes de piétons.'
        ],
        practicalChecklist: [
          'Poser des panneaux de signalisation de chantier temporaire en amont de l\'équipe',
          'Utiliser des pelles rondes et des dragues à curer adaptées à la section du dalot',
          'Vérifier la libre circulation de l\'eau avec un jet témoin après nettoyage',
          'Remettre les dalles de béton de niveau avec du mortier frais si nécessaire'
        ]
      },
      {
        id: 'L-02-3',
        title: 'Entretien des Bassins d\'Orage et Ouvrages Anti-Érosifs',
        duration: '20 min',
        summary: 'Maintenance des têtes de ravins, digues en gabions et désensablement des collecteurs primaires dans les zones collinaires de Mont-Ngafula et Selembao.',
        contentParagraphs: [
          "Les collines de Kinshasa (Mont-Ngafula, Selembao, Ngaliema) sont composées de sables fins friables hautement sensibles au ravinement. Une mauvaise canalisation des eaux de toiture et des caniveaux défectueux créent des ravins géants capables d'engloutir des maisons.",
          "L'entretien des bassins d'orage consiste à décanter les sables en amont avant qu'ils ne colmatent le réseau inférieur. Les agents doivent entretenir les fascines et reboiser les talus avec du vétiver.",
          "Les déchets plastiques jetés dans les ravins fragilisent les ouvrages en gabions en empêchant la végétation fixatrice de prendre racine et en créant des poches de rétention d'eau destructrices."
        ],
        kinshasaFieldStudy: {
          location: 'Ravin Kimbondo (Mont-Ngafula)',
          context: 'Effondrement de parcelles provoqué par un dépotoir sauvage ayant détourné le cours normal du collecteur d\'eau.',
          solution: 'Évacuation des 80 tonnes d\'immondices, reprofilage mécanique, pose de matelas de gabions et plantation de bambous.'
        },
        keyTakeaways: [
          'Le sable de Kinshasa doit être piégé dans des bassins de décantation avant d\'atteindre les grands collecteurs.',
          'Le vétiver et le bambou sont des plantes alliées fondamentales pour stabiliser les berges des caniveaux.',
          'Interdiction absolue de transformer les têtes de ravins en dépotoirs d\'ordures.'
        ],
        practicalChecklist: [
          'Inspecter les soudures et cages de gabions après chaque pluie majeure',
          'Évacuer les troncs d\'arbres et débris flottants coincés dans les déversoirs',
          'Nettoyer les fentes d\'aération des ouvrages maçonnés',
          'Signaler immédiatement tout début d\'affouillement sous une buse'
        ]
      }
    ],
    quiz: [
      {
        id: 1,
        question: 'Quelle est la conséquence immédiate du déversement de bouteilles plastiques dans la rivière Kalamu ?',
        options: [
          'La rivière s\'écoule plus rapidement',
          'L\'eau est filtrée naturellement',
          'La formation de digues d\'immondices sous les ponts provoquant des crues soudaines',
          'Une amélioration de la faune aquatique'
        ],
        correctIndex: 2,
        explanation: 'Les plastiques flottants s\'agglomèrent sous les arches des ponts, réduisant la section d\'écoulement et inondant les quartiers voisins.'
      },
      {
        id: 2,
        question: 'Pourquoi impose-t-on le ressuyage des boues de caniveau avant leur chargement dans les camions ?',
        options: [
          'Pour qu\'elles changent de couleur',
          'Pour réduire la teneur en eau, baisser le poids de 40% et éviter le ruissellement polluant durant le transport',
          'Pour les laisser aux riverains',
          'C\'est une perte de temps inutile'
        ],
        correctIndex: 1,
        explanation: 'Le ressuyage permet l\'égouttage de l\'eau excédentaire, facilitant le chargement et protégeant la chaussée durant le trajet vers la décharge.'
      },
      {
        id: 3,
        question: 'Dans les zones collinaires de Kinshasa (Mont-Ngafula), que risque-t-on en jetant des ordures dans les ravins ?',
        options: [
          'La disparition naturelle du ravin',
          'Le blocage des écoulements et l\'accélération d\'érosions destructrices qui engloutissent les parcelles',
          'La fertilisation du sous-sol',
          'Aucun impact particulier'
        ],
        correctIndex: 1,
        explanation: 'Les immondices déstabilisent les ouvrages hydrauliques et accélèrent les phénomènes de ravinement catastrophiques.'
      }
    ]
  },
  {
    id: 'MOD-03',
    code: 'REG-SST-301',
    title: 'Santé, Sécurité au Travail & Équipements de Protection Individuelle (EPI)',
    shortDescription: 'Normes de protection indispensables pour les agents d\'assainissement, éboueurs et balayeurs : prévention des piqûres, manipulations de charges et hygiène post-intervention.',
    category: 'Santé & Sécurité EPI',
    targetAudience: 'Agents & Éboueurs de Terrain',
    level: 'Fondamental',
    durationTotal: '40 min',
    bannerGradient: 'from-amber-700 to-orange-900',
    passingScorePercent: 80,
    lessons: [
      {
        id: 'L-03-1',
        title: 'Le Port Rigoureux des Équipements de Protection Individuelle (EPI)',
        duration: '12 min',
        summary: 'Détail des 5 équipements vitaux pour tout agent de voirie : bottes de sécurité coquées, gants anti-coupure, gilet haute visibilité, masque antipoussière et combinaison.',
        contentParagraphs: [
          "Le métier d'agent de salubrité urbaine à Kinshasa comporte des risques physiques et biologiques permanents : coupures causées par des débris de verre ou des tôles rouillées, piqûres d'aiguilles de seringues souillées, inhalation de poussières toxiques et risques de collision routière.",
          "Tout agent déployé par la REGEDEK ou une entreprise sous-traitante doit porter sa panoplie d'EPI complète avant le début de la mission. Les gants ordinaires en tissu fin sont strictement proscrits : seuls les gants en nitrile renforcé avec protection anti-perforation sont autorisés pour la fouille des bacs.",
          "Les bottes en PVC à semelle anti-perforation en acier et embout renforcé protègent les pieds des clous et des eaux souillées des caniveaux riches en leptospires et bactéries fécales."
        ],
        kinshasaFieldStudy: {
          location: 'Boulevard du 30 Juin (Gombe)',
          context: 'Équipes de balayage nocturne exposées à des véhicules roulant à grande vitesse et à un éclairage public parfois intermittent.',
          solution: 'Obligation du gilet haute visibilité classe 3 avec bandes rétro-réfléchissantes et cônes luminescents sur 50 mètres.'
        },
        keyTakeaways: [
          'Le gilet fluorescent sauve des vies la nuit et au petit matin face au trafic kinois.',
          'Les gants anti-coupure et les bottes coquées sont obligatoires dès le premier déchet touché.',
          'Remplacer immédiatement tout EPI endommagé ou percé.'
        ],
        practicalChecklist: [
          'Vérifier l\'état des semelles de bottes avant chaque prise de poste',
          'Enfiler le gilet réfléchissant par-dessus la combinaison de travail',
          'Ajuster le masque filtrant FFP2 sur le nez pour bloquer poussières et particules',
          'Garder une paire de gants de rechange dans le chariot de balayage'
        ]
      },
      {
        id: 'L-03-2',
        title: 'Prévention des Risques de Piqûre et Accidents d\'Exposition au Sang (AES)',
        duration: '15 min',
        summary: 'Protocole d\'urgence en cas de blessure par objet piquant, tranchant ou seringue usagée trouvée dans un dépotoir public.',
        contentParagraphs: [
          "Lors du ramassage d'un dépotoir sauvage à Kinshasa, il n'est pas rare de trouver des aiguilles de seringues, des lames de rasoir ou des flacons médicaux jetés clandestinement par des cliniques privées ou officines non agréées.",
          "Il est FORMELLEMENT INTERDIT de tasser un sac poubelle avec les mains ou avec les pieds pour faire de la place. Si un objet pointu dépasse, utilisez une pince de préhension métallique à manche long pour le saisir et le déposer dans un collecteur rigide pour objets piquants/tranchants.",
          "En cas de piqûre accidentelle : 1) Ne pas presser la plaie de manière agressive, 2) Laver immédiatement sous l'eau courante et au savon antiseptique pendant au moins 5 minutes, 3) Désinfecter avec une solution d'eau de javel diluée à 10% ou du Dakin, 4) Déclarer l'accident sous 2 heures pour accéder au protocole de prophylaxie post-exposition (VIH / Hépatite B)."
        ],
        kinshasaFieldStudy: {
          location: 'Rond-point Victoire (Kalamu)',
          context: 'Un agent de propreté s\'était piqué à la main à travers un gant en toile en ramassant un sac noir contenant des aiguilles médicales illégales.',
          solution: 'Fourniture de pinces de ramassage télescopiques à toutes les brigades et rappel systématique des vaccins antitétaniques.'
        },
        keyTakeaways: [
          'Ne jamais comprimer ni tasser un sac à ordures avec les mains ou les pieds.',
          'Toujours utiliser une pince de préhension pour les objets suspects.',
          'Une piqûre souillée nécessite un nettoyage immédiat de 5 minutes et une prise en charge médicale urgente sous 2 à 4 heures.'
        ],
        practicalChecklist: [
          'Se faire vacciner contre le tétanos et l\'hépatite B (carnet à jour)',
          'Emporter une boîte de secours et un flacon de solution hydroalcoolique / Dakin',
          'Déposer les seringues dans une boîte jaune imperforable dédiée',
          'Informer immédiatement le chef de brigade de tout incident de piqûre'
        ]
      },
      {
        id: 'L-03-3',
        title: 'Ergonomie, Gestes & Postures pour la Manutention de Charges Lourdes',
        duration: '13 min',
        summary: 'Comment soulever des bacs de déchets lourds (25-40 kg) et pousser les pousse-pousse ou tricycles sans blesser sa colonne vertébrale.',
        contentParagraphs: [
          "Le tassement vertébral et les hernies discales sont les premières causes d'inaptitude physique chez les éboueurs et collecteurs de Kinshasa, qui manipulent quotidiennement plusieurs tonnes de déchets compacts gorgés d'eau.",
          "Pour soulever une poubelle ou un panier lourd : garder le dos droit, fléchir les genoux, rapprocher la charge au plus près de son torse et pousser sur la force des jambes. Ne JAMAIS faire pivoter son torse pendant l'effort de levage ; pivoter en déplaçant ses pieds.",
          "Pour les charges supérieures à 30 kg, le levage à deux agents est strictement obligatoire. L'usage de tricycles motorisés ou de diables à roues pneumatiques doit être privilégié pour les longues distances."
        ],
        kinshasaFieldStudy: {
          location: 'Marché Gambela (Kasa-Vubu)',
          context: 'Taux élevé d\'arrêts de travail chez les porteurs de fûts de déchets métalliques lourds se déplaçant sur des sols accidentés.',
          solution: 'Formation pratique aux gestes de levage et remplacement progressif des fûts lourds par des bacs roulants normalisés de 240 litres.'
        },
        keyTakeaways: [
          'Plier les genoux et garder le dos rectiligne : ce sont les cuisses qui doivent supporter la charge.',
          'Ne jamais effectuer de torsion du buste lorsqu\'on soulève un poids.',
          'Au-delà de 30 kg, toujours lever à deux personnes coordonnées.'
        ],
        practicalChecklist: [
          'Tester le poids de la poubelle en la basculant légèrement du pied avant de la lever',
          'Vérifier que les poignées du bac sont solides et non glissantes',
          'Répartir uniformément le chargement dans la remorque du tricycle',
          'Prendre des pauses d\'hydratation régulières sous le soleil tropical'
        ]
      }
    ],
    quiz: [
      {
        id: 1,
        question: 'En cas de piqûre accidentelle par une seringue usagée sur un dépotoir, quelle est la première action immédiate à réaliser ?',
        options: [
          'Ignorer et continuer le travail pour terminer la tournée',
          'Laver immédiatement à grande eau et au savon doux pendant au moins 5 minutes, puis désinfecter',
          'Comprimer très fort la blessure jusqu\'à ce que le sang gicle',
          'Mettre du sable chaud sur la plaie'
        ],
        correctIndex: 1,
        explanation: 'Le lavage immédiat abondant à l\'eau et au savon (5 minutes) suivi d\'un antiseptique est le premier geste d\'urgence pour réduire la charge virale.'
      },
      {
        id: 2,
        question: 'Pourquoi est-il interdit de tasser les sacs poubelles avec les pieds ou les mains ?',
        options: [
          'Cela abîme les semelles des chaussures',
          'Cela risque de transpercer le sac et de causer des piqûres ou coupures graves par des seringues, verres ou débris métalliques cachés',
          'Cela fait trop de bruit',
          'Le sac devient trop lourd'
        ],
        correctIndex: 1,
        explanation: 'Le compactage aveugle avec les mains ou les pieds est la cause principale de piqûres accidentelles par des seringues et objets tranchants dissimulés.'
      },
      {
        id: 3,
        question: 'Quelle est la position correcte du corps pour soulever un bac d\'ordures lourd du sol ?',
        options: [
          'Garder les jambes raides et courber le dos en avant',
          'Fléchir les genoux, garder le dos droit, approcher la charge du corps et lever avec la force des cuisses',
          'Faire une torsion rapide du bassin en levant d\'un seul bras',
          'Se pencher sur un seul côté'
        ],
        correctIndex: 1,
        explanation: 'Fléchir les genoux et garder le dos droit permet d\'utiliser les muscles puissants des cuisses et préserve les disques lombaires de la colonne.'
      }
    ]
  },
  {
    id: 'MOD-04',
    code: 'REG-DAS-401',
    title: 'Gestion Spécialisée des Déchets Biomédicaux & Dangereux (DASRI)',
    shortDescription: 'Traçabilité, tri sécurisé, codification couleur hospitalière et filière d\'incinération thermique à haute température pour les établissements de santé kinois.',
    category: 'Déchets Dangereux & DASRI',
    targetAudience: 'Personnel Médical & Spécialisé',
    level: 'Avancé',
    durationTotal: '50 min',
    bannerGradient: 'from-rose-900 to-red-950',
    passingScorePercent: 85,
    lessons: [
      {
        id: 'L-04-1',
        title: 'Classification et Risques des Déchets Hospitaliers à Kinshasa',
        duration: '15 min',
        summary: 'Différencier les DASRI (Déchets d\'Activités de Soins à Risques Infectieux) des déchets anatomiques, chimiques, pharmaceutiques et assimilés ménagers.',
        contentParagraphs: [
          "Les hôpitaux de référence (Hôpital Général de Kinshasa, Cliniques Universitaires, Hôpital de l'Amitié Sino-Congolaise) et les centaines de centres de santé privés génèrent quotidiennement des tonnes de déchets à très haut risque de contamination biologique.",
          "Les Déchets d'Activités de Soins à Risques Infectieux (DASRI) regroupent les compresses imbibées de sang ou liquides biologiques, tubulures, seringues, poches de transfusion, pansements et gants usagés. Le danger majeur est la transmission d'agents pathogènes graves (VIH, virus Ebola, virus des hépatites B et C, staphylocoques dorés multirésistants).",
          "Le mélange de DASRI avec les ordures ménagères ordinaires dans les décharges publiques est un crime environnemental lourdement réprimé par la législation congolaise."
        ],
        kinshasaFieldStudy: {
          location: 'Cliniques Universitaires de Kinshasa (Mont-Amba)',
          context: 'Mélange accidentel de flacons de réactifs périmés et seringues dans des sacs poubelles noirs ordinaires évacués vers la décharge municipale.',
          solution: 'Installation d\'un local de transit hospitalier fermé à clé avec pesée systématique et registre de traçabilité signé par le médecin hygiéniste.'
        },
        keyTakeaways: [
          'Seulement 15% à 20% des déchets d\'un hôpital sont réellement infectieux, mais s\'ils sont mélangés, 100% de la benne devient dangereuse.',
          'La séparation stricte dès la salle de soins réduit drastiquement les coûts de traitement thermique.',
          'Tout déchet en contact avec du sang humain est réputé potentiellement infectieux.'
        ],
        practicalChecklist: [
          'Disposer les poubelles spécialisées au plus près du lit du patient',
          'Vérifier la présence d\'un pictogramme Danger Biologique (Biohazard) sur les conteneurs',
          'Ne jamais remplir un collecteur de seringues au-delà de la ligne limite (3/4 plein)',
          'Consigner chaque lot dans le Registre de Suivi des Déchets Médicaux'
        ]
      },
      {
        id: 'L-04-2',
        title: 'La Codification Couleur et le Conditionnement Hospitalier',
        duration: '18 min',
        summary: 'Règles universelles appliquées en RDC : Sacs Jaunes pour infectieux, Boîtes de sécurité imperforables pour aiguilles, Sacs Noirs pour déchets ordinaires.',
        contentParagraphs: [
          "Le code couleur hospitalier officiel en RDC est univoque : le JAUNE est dédié aux DASRI mous (compresses, gants, cotons, blouses jetables) conditionnés dans des sacs étanches en polyéthylène d'au moins 50 microns d'épaisseur.",
          "Les objets piquants, coupants ou tranchants (aiguilles de prélèvement, trocarts, bistouris, ampoules de verre cassées) DOIVENT obligatoirement être insérés immédiatement après usage dans des boîtes de sécurité jaunes en carton épais plastifié ou plastique rigide imperforable, sans jamais recapuchonner l'aiguille manuellement.",
          "Le NOIR est strictement réservé aux déchets banals assimilables aux ordures ménagères (emballages papier propres, restes de nourriture des malades non contagieux, cartons de médicaments)."
        ],
        kinshasaFieldStudy: {
          location: 'Hôpital de Référence de Ndjili (District de la Tshangu)',
          context: 'Rupture d\'approvisionnement en boîtes de sécurité ayant entraîné l\'utilisation de bidons d\'huile découpés, provoquant deux accidents d\'exposition au sang.',
          solution: 'Dotation d\'un stock stratégique de 1 000 boîtes de sécurité homologuées OMS et formation de tout le personnel infirmier.'
        },
        keyTakeaways: [
          'Ne JAMAIS recapuchonner une aiguille usagée : c\'est la cause n°1 d\'accidents d\'exposition au sang.',
          'Sac Jaune = Risque Infectieux, Boîte Rigide = Piquants/Tranchants, Sac Noir = Déchets Banals.',
          'Fermer définitivement la boîte de sécurité dès qu\'elle atteint le repère de remplissage aux 3/4.'
        ],
        practicalChecklist: [
          'Vérifier la fermeture hermétique du sac jaune avant manutention avec un lien autobloquant',
          'Étiqueter le sac avec le nom du service (ex: Maternité, Bloc Opératoire, Réanimation)',
          'Utiliser un chariot fermé dédié exclusivement aux déchets hospitaliers',
          'Porter gants étanches résistants, tablier plastique et lunettes de protection'
        ]
      },
      {
        id: 'L-04-3',
        title: 'Transport Sécurisé et Incinération Haute Température (1200°C)',
        duration: '17 min',
        summary: 'Exigences techniques du transport sous bordereau et fonctionnement des incinérateurs hospitaliers à double chambre pour détruire dioxines et pathogènes.',
        contentParagraphs: [
          "Le brûlage à l'air libre des déchets biomédicaux est un délit écologique grave : il libère des fumées chargées de dioxines hautement cancérigènes, de furanes et de métaux lourds qui empoisonnent l'air des quartiers riverains.",
          "L'élimination réglementaire exige une incinération contrôlée à double chambre. La première chambre de combustion monte à 850°C pour gazéifier les déchets, tandis que la chambre de post-combustion maintient les gaz à au moins 1 100°C - 1 200°C pendant au moins deux secondes pour décomposer intégralement les molécules toxiques.",
          "Les cendres résiduelles inertes issues de l'incinération doivent être confinées dans une fosse à mâchefers étanche et recouverte de chaux pour neutraliser tout résidu minéral."
        ],
        kinshasaFieldStudy: {
          location: 'Centre d\'Incinération Médicale de Ngaliema',
          context: 'Ancien incinérateur artisanal émettant des fumées noires odorantes au-dessus des résidences universitaires.',
          solution: 'Modernisation avec un brûleur automatique à fioul, cheminée haute avec filtre céramique et contrôle continu de la température à 1150°C.'
        },
        keyTakeaways: [
          'L\'incinération doit impérativement dépasser 1100°C pour éliminer les dioxines et pathogènes résistants.',
          'Le brûlage des seringues et plastiques médicaux au sol est formellement interdit par la loi congolaise.',
          'Chaque transfert de déchets doit être accompagné d\'un Bordereau de Suivi des Déchets Dangereux.'
        ],
        practicalChecklist: [
          'Vérifier que la température de consigne (850°C) est atteinte avant d\'introduire le premier sac',
          'Ne pas surcharger le foyer de l\'incinérateur pour garantir une combustion complète',
          'Décharger les cendres à froid avec un masque respiratoire à cartouche contre les métaux lourds',
          'Arroser la fosse à cendres et recouvrir de terre battue'
        ]
      }
    ],
    quiz: [
      {
        id: 1,
        question: 'Quelle est la couleur officielle du sac réservé aux Déchets d\'Activités de Soins à Risques Infectieux (DASRI) en RDC ?',
        options: [
          'Le Sac Bleu',
          'Le Sac Jaune',
          'Le Sac Vert',
          'Le Sac Blanc'
        ],
        correctIndex: 1,
        explanation: 'Le JAUNE est la codification internationale et nationale obligatoire pour les déchets biomédicaux à risque infectieux.'
      },
      {
        id: 2,
        question: 'Pourquoi est-il rigoureusement interdit de recapuchonner une aiguille après une injection ?',
        options: [
          'Parce que le capuchon peut se casser',
          'Parce que c\'est le moment où se produit la majorité des piqûres accidentelles avec transmission du VIH ou hépatites',
          'Parce que cela prend trop de temps',
          'Pour économiser le plastique'
        ],
        correctIndex: 1,
        explanation: 'Le geste de recapuchonner est responsable de plus de 60% des piqûres accidentelles du personnel soignant. L\'aiguille doit tomber directement dans la boîte de sécurité sans manipulation.'
      },
      {
        id: 3,
        question: 'À quelle température minimale la chambre de post-combustion d\'un incinérateur de DASRI doit-elle fonctionner ?',
        options: [
          '100°C (température de l\'eau bouillante)',
          'Au moins 1100°C à 1200°C',
          '300°C',
          '500°C'
        ],
        correctIndex: 1,
        explanation: 'Une température d\'au moins 1 100°C à 1 200°C est scientifiquement requise pour casser les cycles aromatiques et détruire les dioxines toxiques.'
      }
    ]
  },
  {
    id: 'MOD-05',
    code: 'REG-LEG-501',
    title: 'Cadre Légal RDC, Police d\'Assainissement & Éco-Citoyenneté',
    shortDescription: 'Connaître les textes fondamentaux (Loi n° 11/009, Arrêtés de l\'Hôtel de Ville de Kinshasa), les compétences de l\'ACE et les sanctions légales contre les infractions environnementales.',
    category: 'Législation & Police',
    targetAudience: 'Inspecteurs & Brigades',
    level: 'Intermédiaire',
    durationTotal: '45 min',
    bannerGradient: 'from-slate-800 to-emerald-950',
    passingScorePercent: 75,
    lessons: [
      {
        id: 'L-05-1',
        title: 'La Loi-Cadre sur l\'Environnement en RDC (Loi n° 11/009)',
        duration: '15 min',
        summary: 'Les principes juridiques cardinaux : Principe Pollueur-Payeur, Obligation d\'ÉIES préalable, Droit à un environnement sain garanti par l\'article 53 de la Constitution.',
        contentParagraphs: [
          "La Constitution de la République Démocratique du Congo garantit en son article 53 le droit fondamental de toute personne à un environnement sain et propice à son épanouissement, tout en imposant le devoir de le défendre.",
          "La Loi n° 11/009 du 09 juillet 2011 fixe les règles relatives à la protection de l'environnement en RDC. Elle consacre le principe du 'Pollueur-Payeur' : toute personne physique ou morale qui détériore le milieu naturel ou produit des déchets nuisibles doit supporter l'intégralité des coûts de remise en état.",
          "Elle fonde également la compétence obligatoire de l'Agence Congolaise de l'Environnement (ACE) pour approuver les Études d'Impact Environnemental et Social (ÉIES) avant le début de tout projet susceptible de porter atteinte au milieu de vie."
        ],
        kinshasaFieldStudy: {
          location: 'Rivière N\'djili (Commune de Limete)',
          context: 'Une usine de boissons déversait des effluents acides non traités directement dans la rivière sans station d\'épuration.',
          solution: 'Mise en demeure par la brigade environnementale, application d\'amendes forfaitaires selon l\'article 71 de la Loi 11/009 et obligation d\'installer des décanteurs.'
        },
        keyTakeaways: [
          "L'article 53 de la Constitution congolaise consacre le droit constitutionnel à la salubrité.",
          "Le pollueur-payeur rend l'auteur d'un dépôt sauvage financièrement responsable du coût de son nettoyage.",
          "L'Agence Congolaise de l'Environnement (ACE) a autorité légale de police sur les chantiers et installations classées."
        ],
        practicalChecklist: [
          'Consulter les textes légaux officiels du Journal Officiel de la RDC',
          'Vérifier que tout projet d\'envergure dispose de son Certificat de Conformité ACE',
          'Identifier les infractions environnementales caractérisées (dépôt sur voirie, brûlage toxique)',
          'Rédiger des procès-verbaux de constat d\'infraction conformes au droit congolais'
        ]
      },
      {
        id: 'L-05-2',
        title: 'Les Arrêtés Urbains de Kinshasa et Rôle de la Police d\'Assainissement',
        duration: '15 min',
        summary: 'Obligations des propriétaires de parcelles (balayage du devant de parcelle, interdiction de déverser dans le caniveau) et pouvoir verbalisateur des officiers de police judiciaire.',
        contentParagraphs: [
          "L'Hôtel de Ville de Kinshasa a promulgué des arrêtés stricts encadrant la propreté urbaine ('Kinshasa Bopeto' et dispositions de la REGEDEK). Chaque propriétaire ou occupant de parcelle a l'obligation légale de maintenir propre la portion de trottoir et le caniveau bordant sa concession jusqu'au milieu de la chaussée.",
          "Il est formellement interdit : 1) De brancher des canalisations d'eaux vannes (toilettes) ou eaux usées directement dans les caniveaux pluviaux de la voirie publique, 2) De jeter des immondices depuis un taxi-bus (Esprit de Vie / 207) ou véhicule privé, 3) D'allumer des feux de poubelles sur le domaine public.",
          "Les inspecteurs assermentés de la REGEDEK et les OPJ environnementaux sont habilités à dresser des procès-verbaux de transaction avec perception d'amendes administratives immédiates."
        ],
        kinshasaFieldStudy: {
          location: 'Avenue Kasa-Vubu (Commune de Kalamu)',
          context: 'Magasins et tenanciers de boutiques déversant leurs cartons et détritus sur le terre-plein central après fermeture.',
          solution: 'Opération conjointe de police municipale : amendes administratives et obligation d\'abonnement à un opérateur de collecte agréé.'
        },
        keyTakeaways: [
          'Chaque parcelle est légalement responsable de la propreté de son pas-de-porte et de son caniveau frontalier.',
          'Raccorder une fosse septique à un caniveau de voirie est une faute pénale passible de poursuites.',
          'Le jet de déchets sur la voie publique est passible d\'amende forfaitaire immédiate.'
        ],
        practicalChecklist: [
          'Exiger la présentation de la quittance de collecte de déchets lors des contrôles de commerce',
          'Inspecter visuellement les regards d\'eaux pluviales pour détecter les tuyaux clandestins',
          'Notifier les chefs de rue (Nkumu / Chefs de quartier) des manquements constatés',
          'Privilégier la mise en conformité amiable avant la saisie judiciaire'
        ]
      },
      {
        id: 'L-05-3',
        title: 'Mobilisation Communautaire, Salongo et Éco-Citoyenneté',
        duration: '15 min',
        summary: 'Relancer l\'esprit du Salongo hebdomadaire (travaux d\'intérêt communautaire du samedi matin) et structurer les comités d\'hygiène de quartier.',
        contentParagraphs: [
          "L'action publique des brigades ne peut suffire sans la participation active des 15 millions de Kinois. La tradition du 'Salongo' (travaux communautaires bénévoles du samedi matin pour curer les caniveaux et débroussailler les avenues) est un levier puissant d'appropriation citoyenne.",
          "Pour être efficace et durable, le Salongo doit être structuré : les comités de quartier doivent définir les tronçons prioritaires, la commune fournit le matériel lourd (pelles, brouettes, râteaux, gants) et la REGEDEK coordonne le passage immédiat des camions pour évacuer les tas curés.",
          "L'éducation dès l'école primaire et les églises locales joue un rôle déterminant pour briser le fatalisme et valoriser le respect des espaces publics partagés."
        ],
        kinshasaFieldStudy: {
          location: 'Commune de Kintambo (Quartier Kilimani)',
          context: 'Caniveaux ensablés et insalubrité chronique faute d\'intervention des services centraux.',
          solution: 'Organisation d\'un Salongo hebdomadaire récompensé par le Trophée de la Rue la plus propre, réduisant de 80% les inondations locales.'
        },
        keyTakeaways: [
          'Le Salongo renforce la cohésion sociale et la propreté des quartiers populaires.',
          'La mairie et la REGEDEK doivent assurer l\'évacuation rapide des boues collectées lors du Salongo.',
          'Valoriser et récompenser les comités de quartier modèles suscite l\'émulation citoyenne.'
        ],
        practicalChecklist: [
          'Programmer le Salongo le samedi de 07h00 à 10h00 avec les chefs d\'avenue',
          'Mobiliser les jeunes et les associations de motocyclistes (wewas) du quartier',
          'Vérifier que les participants disposent de bottes et gants de protection',
          'Coordonner l\'arrivée de la benne de ramassage dès la fin de l\'opération'
        ]
      }
    ],
    quiz: [
      {
        id: 1,
        question: 'Quel article de la Constitution de la RDC garantit à tout citoyen le droit à un environnement sain ?',
        options: [
          'L\'article 12',
          'L\'article 53',
          'L\'article 101',
          'L\'article 220'
        ],
        correctIndex: 1,
        explanation: 'L\'article 53 de la Constitution congolaise de 2006 proclame solennellement que toute personne a droit à un environnement sain et propice à son épanouissement.'
      },
      {
        id: 2,
        question: 'Quelle est la responsabilité légale du propriétaire d\'une concession ou parcelle à Kinshasa selon les arrêtés urbains ?',
        options: [
          'Il ne s\'occupe que de l\'intérieur de sa maison',
          'Il est légalement tenu de maintenir propre la portion de trottoir et le caniveau bordant sa clôture jusqu\'à l\'axe de la voie',
          'Il peut rejeter ses eaux de toilette dans le caniveau public',
          'Il doit repeindre la rue chaque mois'
        ],
        correctIndex: 1,
        explanation: 'Les règlements urbains de salubrité de Kinshasa obligent chaque occupant à balayer et entretenir le caniveau et la voie publique devant sa parcelle.'
      },
      {
        id: 3,
        question: 'Qu\'est-ce que le principe du "Pollueur-Payeur" inscrit dans la Loi n° 11/009 ?',
        options: [
          'L\'État paye les entreprises polluantes pour qu\'elles s\'installent',
          'Celui qui produit une pollution ou dégrade l\'environnement doit assumer intégralement le coût financier des mesures de dépollution et de réparation',
          'Une taxe sur l\'eau de pluie',
          'Une prime accordée aux usines'
        ],
        correctIndex: 1,
        explanation: 'Le principe Pollueur-Payeur impute les frais de prévention, de réduction et de remise en état à l\'auteur direct de la pollution.'
      }
    ]
  },
  {
    id: 'MOD-06',
    code: 'REG-CIR-601',
    title: 'Économie Circulaire, Valorisation Plastique & Entrepreneuriat Vert',
    shortDescription: 'Transformer les déchets en opportunités économiques viables : fabrication de pavés écologiques, recyclage de métaux, modèle d\'affaires pour PME et coopératives de jeunes kinois.',
    category: 'Entrepreneuriat Vert',
    targetAudience: 'Coopératives & PME',
    level: 'Avancé',
    durationTotal: '50 min',
    bannerGradient: 'from-emerald-900 to-amber-950',
    passingScorePercent: 75,
    lessons: [
      {
        id: 'L-06-1',
        title: 'La Fabrication Artisanale et Semi-Industrielle de Pavés Écologiques',
        duration: '18 min',
        summary: 'Procédé thermochimique de fonte des plastiques souples (sachets LDPE) mélangés à chaud avec du sable de rivière pour créer des pavés ultra-résistants et imperméables.',
        contentParagraphs: [
          "Le recyclage traditionnel du sachet plastique souple (sachets d'eau 'pure water', films d'emballage LDPE) est difficile par injection en raison de sa faible densité. En revanche, sa fusion contrôlée avec du sable siliceux produit un matériau composite remarquablement solide.",
          "Le ratio idéal est de 1 volume de matière plastique fondue pour 2 à 3 volumes de sable propre et sec chauffé au préalable. Le mélange liquide homogénéisé est coulé dans des moules métalliques hexagonaux ou rectangulaires, puis compacté à la presse manuelle ou vibrante.",
          "Ces pavés écologiques présentent une résistance à la compression supérieure aux pavés de ciment classiques (plus de 35 MPa), n'absorbent pas l'eau (idéal contre la boue de Kinshasa) et consomment jusqu'à 3 000 sachets plastiques par mètre carré posé !"
        ],
        kinshasaFieldStudy: {
          location: 'Commune de Barumbu (Atelier Éco-Jeunes)',
          context: 'Prolifération massive de sachets plastiques jetés au vent et chômage élevé des jeunes diplômés du quartier.',
          solution: 'Création d\'une coopérative de 12 jeunes fabriquant 40 m² de pavés par jour, utilisés pour paver les cours d\'écoles et les allées d\'hôpitaux.'
        },
        keyTakeaways: [
          '1 m² de pavés écologiques absorbe et neutralise environ 3 000 sachets plastiques usagés.',
          'Les pavés en plastique fondu sont 2 fois plus résistants à la fissuration que le béton standard.',
          'La fonte doit se faire sous hotte aspirante ou à l\'air libre avec masque à filtre pour ne pas inhaler les fumées.'
        ],
        practicalChecklist: [
          'Sécher le sable avant mélange pour éviter les projections de vapeur brûlante',
          'Porter gants en cuir épais résistant à la chaleur et lunettes de protection',
          'Huiler légèrement les moules métalliques pour faciliter le démoulage',
          'Laisser refroidir dans un bac d\'eau froide pendant 15 minutes'
        ]
      },
      {
        id: 'L-06-2',
        title: 'La Chaîne de Valeur des Déchets Métalliques et Aluminium',
        duration: '15 min',
        summary: 'Collecte, tri magnétique, compactage et refonte de l\'aluminium de récupération pour la fonderie artisanale de marmites kinois.',
        contentParagraphs: [
          "À Kinshasa, la ferraille et l'aluminium ont une valeur marchande immédiate. Les ramasseurs ambulants ('bana mbila') parcourent les avenues pour racheter vieux fers, tôles, moteurs et canettes de boissons.",
          "Les canettes en aluminium (boîtes de bière et sodas) sont rachetées au kilogramme puis fondues à 660°C dans des creusets artisanaux à Kingabwa et Camp Luka pour couler les fameuses marmites traditionnelles en aluminium indispensables dans les cuisines congolaises.",
          "Pour professionnaliser ce secteur informel, la REGEDEK encourage la mise en place de coopératives dotées de balances électroniques certifiées, de presses hydrauliques et d'équipements de sécurité thermique."
        ],
        kinshasaFieldStudy: {
          location: 'Quartier Kingabwa (Grandes Fonderies Artisanales)',
          context: 'Artisans travaillant pieds nus autour de foyers de charbon de bois sans protection oculaire.',
          solution: 'Programme d\'appui en EPI thermiques, amélioration du rendement énergétique des foyers avec des briques réfractaires et valorisation des lingots d\'aluminium purifié.'
        },
        keyTakeaways: [
          'Le recyclage de l\'aluminium consomme 95% d\'énergie en moins que l\'extraction du minerai brut de bauxite.',
          'Trier soigneusement l\'aluminium des métaux ferreux à l\'aide d\'un simple aimant.',
          'La sécurisation des fonderies protège les artisans des brûlures et fumées métalliques.'
        ],
        practicalChecklist: [
          'Utiliser un aimant puissant : l\'aluminium n\'est pas attiré, l\'acier l\'est',
          'Dégraisser les pièces de récupération avant fusion pour éviter les scories',
          'Peser les lots sur une balance étalonnée en présence du collecteur',
          'Conserver les lingots dans un endroit sécurisé à l\'abri du vol'
        ]
      },
      {
        id: 'L-06-3',
        title: 'Modèle Économique et Financement d\'une Micro-Entreprise Verte',
        duration: '17 min',
        summary: 'Élaborer un business plan vert : calcul du point mort, tarification de la collecte privée au porte-à-porte, crédit carbone et partenariats avec les supermarchés.',
        contentParagraphs: [
          "L'assainissement peut être une source d'emplois durables et rentables pour la jeunesse kinoise. Une micro-entreprise de pré-collecte de 3 tricycles motorisés couvrant 600 ménages abonnés à 5 USD / mois génère un chiffre d'affaires récurrent de 3 000 USD mensuels.",
          "En vendant en parallèle le plastique trié (PET/PEHD) aux usines de recyclage (entre 120 et 200 USD la tonne) et le compost aux pépiniéristes et maraîchers (15 USD le sac de 50 kg), l'activité dégage une marge nette de plus de 35%.",
          "L'accès au micro-crédit vert et aux subventions de bailleurs de fonds (Banque Mondiale, AFD, BAD, PNUD) est facilité lorsque l'entreprise tient un registre comptable transparent et utilise l'application EWaste Mobile (ewastemobile.ai.studio) pour géolocaliser ses tournées."
        ],
        kinshasaFieldStudy: {
          location: 'Commune de Lemba (Quartier Livulu)',
          context: 'Absence totale de passage des camions publics dans les ruelles trop étroites pour les gros engins.',
          solution: 'Lancement d\'une PME de collecte par tricycles avec paiement mensuel par Mobile Money (M-Pesa / Orange Money), autofinancée dès le 4e mois.'
        },
        keyTakeaways: [
          'La pré-collecte par abonnement mensuel assure un revenu régulier et prévisible.',
          'La double valorisation (frais de service + vente des matières triées) optimise la rentabilité.',
          'La numérisation des tournées et le paiement mobile réduisent les impayés et sécurisent les caisses.'
        ],
        practicalChecklist: [
          'Cartographier sa zone d\'intervention et signer des conventions avec les chefs de rue',
          'Fixer une grille tarifaire claire (ex: ménages ordinaires vs restaurants/hôtels)',
          'Ouvrir un compte Mobile Money professionnel pour le recouvrement sécurisé',
          'Calculer son seuil de rentabilité (nombre minimum d\'abonnés nécessaires pour couvrir le carburant et salaires)'
        ]
      }
    ],
    quiz: [
      {
        id: 1,
        question: 'Quelle matière première utilise-t-on avec les sachets plastiques fondus pour fabriquer des pavés écologiques ?',
        options: [
          'De l\'eau sucrée',
          'Du sable propre et sec chauffé au préalable',
          'De l\'huile de vidange',
          'De la sciure humide'
        ],
        correctIndex: 1,
        explanation: 'Le mélange intime de sable siliceux sec et de plastique fondu produit un composite thermorésistant d\'une solidité exceptionnelle pour le pavage.'
      },
      {
        id: 2,
        question: 'Combien d\'énergie économise-t-on en recyclant de l\'aluminium récupéré par rapport à la production à partir du minerai vierge ?',
        options: [
          'Environ 10%',
          'Environ 30%',
          'Jusqu\'à 95% d\'énergie économisée',
          'Aucune économie'
        ],
        correctIndex: 2,
        explanation: 'La refonte de l\'aluminium consomme 95% moins d\'énergie que l\'électrolyse primaire de la bauxite, ce qui en fait l\'un des matériaux les plus rentables à recycler.'
      },
      {
        id: 3,
        question: 'Quel est l\'avantage majeur d\'une micro-entreprise de pré-collecte par tricycle dans les quartiers denses de Kinshasa (Lemba, Matete) ?',
        options: [
          'Les tricycles peuvent rouler sous l\'eau',
          'Ils peuvent pénétrer dans les ruelles étroites inaccessibles aux gros camions bennes de 20 tonnes',
          'Ils ne consomment jamais de carburant',
          'Ils ne nécessitent aucun chauffeur'
        ],
        correctIndex: 1,
        explanation: 'L\'agilité des tricycles et brouettes permet de desservir le dernier kilomètre dans le tissu urbain spontané et d\'amener les déchets vers les points de regroupement.'
      }
    ]
  }
];
