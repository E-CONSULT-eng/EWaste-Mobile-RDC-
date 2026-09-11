import React, { useState, useMemo } from 'react';
import { Search, Trash2, Recycle, Leaf, AlertOctagon, CheckCircle2, Info, ArrowRight, Sparkles, Filter, Package } from 'lucide-react';

export interface WasteItemGuide {
  id: string;
  name: string;
  category: 'Plastique' | 'Organique / Biodéchet' | 'Métal' | 'Verre' | 'Papier & Carton' | 'Dangereux & Électronique';
  destination: string;
  containerColor: 'vert' | 'jaune' | 'bleu' | 'rouge' | 'marron';
  icon: string;
  advice: string;
  recyclable: boolean;
  kinshasaFiliere?: string;
  keywords: string[];
}

export const WASTE_DIRECTORY: WasteItemGuide[] = [
  // Plastiques
  {
    id: 'bouteille-pet',
    name: 'Bouteille en plastique d’eau / soda (PET)',
    category: 'Plastique',
    destination: 'Poubelle Jaune / Point de collecte PET REGEDEK',
    containerColor: 'jaune',
    icon: '🥤',
    advice: 'Vider le liquide, écraser la bouteille pour gagner de l’espace et revisser le bouchon dessus.',
    recyclable: true,
    kinshasaFiliere: 'Rachetée par les coopératives locales pour fabrication de pavés ou granules d’exportation.',
    keywords: ['eau', 'soda', 'coca', 'fanta', 'vitalo', 'bouteille', 'plastique', 'pet', 'boisson']
  },
  {
    id: 'sachet-plastique',
    name: 'Sachet plastique d’emballage / Sachet noir',
    category: 'Plastique',
    destination: 'Poubelle Jaune / Déchetterie',
    containerColor: 'jaune',
    icon: '🛍️',
    advice: 'Ne jamais jeter dans les caniveaux ni brûler à l’air libre (dégagement de dioxines toxiques). Préférer les sacs en tissu réutilisables.',
    recyclable: true,
    kinshasaFiliere: 'Revalorisé dans les micro-filières de transformation artisanale en pavés composites.',
    keywords: ['sachet', 'sachets', 'sacs', 'sac plastique', 'sachet noir', 'emballage']
  },
  {
    id: 'bidon-plastique',
    name: 'Bidon d’huile ou de carburant (PEHD)',
    category: 'Plastique',
    destination: 'Point de collecte Plastiques durs / REGEDEK',
    containerColor: 'jaune',
    icon: '🛢️',
    advice: 'Bien égoutter et rincer les résidus huileux. Très résistant, peut souvent être réutilisé pour d’autres usages ménagers non alimentaires.',
    recyclable: true,
    kinshasaFiliere: 'Broyage et refonte en bassines, seaux ou tuyaux d’irrigation.',
    keywords: ['bidon', 'huile', 'essence', 'bidon jaune', 'pehd', 'carburant']
  },

  // Organiques / Biodéchets
  {
    id: 'epluchures-fruits-legumes',
    name: 'Épluchures de manioc, bananes, légumes et fruits',
    category: 'Organique / Biodéchet',
    destination: 'Poubelle Verte / Composteur de quartier ou jardin',
    containerColor: 'vert',
    icon: '🍌',
    advice: 'Idéal pour le compostage familial ou agricole. Nourrit les sols sablonneux de Kinshasa et produit un engrais riche.',
    recyclable: true,
    kinshasaFiliere: 'Compostage direct pour les maraîchers de Cecomaf, N’djili et Pool Malebo.',
    keywords: ['banane', 'manioc', 'legume', 'fruit', 'epluchure', 'mangue', 'avocat', 'feuille', 'fufu', 'chikwangue']
  },
  {
    id: 'restes-repas',
    name: 'Restes de nourriture (riz, poisson, viande, saka-saka)',
    category: 'Organique / Biodéchet',
    destination: 'Poubelle Verte (Déchets organiques ménagers)',
    containerColor: 'vert',
    icon: '🍲',
    advice: 'Alimentation pour animaux domestiques (volailles, porcs) ou compostage rapide dans un bac aéré pour éviter les odeurs.',
    recyclable: true,
    kinshasaFiliere: 'Valorisation animale locale ou biométhanisation.',
    keywords: ['nourriture', 'riz', 'repas', 'poisson', 'viande', 'saka-saka', 'pondu', 'alimentaire']
  },
  {
    id: 'sciure-dechets-verts',
    name: 'Feuilles mortes, branchages et tontes de jardin',
    category: 'Organique / Biodéchet',
    destination: 'Compostage / Paillage au sol',
    containerColor: 'vert',
    icon: '🍂',
    advice: 'À utiliser comme matière brune structurante dans votre tas de compost pour un équilibre carbone/azote optimal.',
    recyclable: true,
    kinshasaFiliere: 'Paillage agricole pour protéger l’humidité des sols maraîchers.',
    keywords: ['feuille', 'arbre', 'jardin', 'branche', 'herbe', 'pelouse', 'sciure']
  },

  // Métaux
  {
    id: 'canette-boisson',
    name: 'Canette métallique d’aluminium (soda / bière)',
    category: 'Métal',
    destination: 'Poubelle Jaune / Collecteur de ferraille',
    containerColor: 'jaune',
    icon: '🥫',
    advice: 'Écraser la canette. L’aluminium est recyclable à 100% à l’infini avec une économie d’énergie de 95% par rapport à l’extraction.',
    recyclable: true,
    kinshasaFiliere: 'Racheté activement par les fonderies artisanales kinoises (fabrication de marmites en fonte).',
    keywords: ['canette', 'aluminium', 'boisson', 'biere', 'soda', 'metal', 'marmite']
  },
  {
    id: 'boite-conserve',
    name: 'Boîte de conserve en acier (tomates, sardines, lait)',
    category: 'Métal',
    destination: 'Poubelle Jaune / Dépôt ferrailleur',
    containerColor: 'jaune',
    icon: '🥫',
    advice: 'Bien vider pour éviter la stagnation d’eau (gîtes de larves de moustiques du paludisme). Ne jamais laisser traîner à l’air libre.',
    recyclable: true,
    kinshasaFiliere: 'Récupération par le secteur informel de la ferraille pour refonte sidérurgique.',
    keywords: ['conserve', 'boite', 'sardine', 'tomate', 'lait', 'acier', 'fer']
  },

  // Verre
  {
    id: 'bouteille-verre',
    name: 'Bouteille en verre consignée ou non-consignée',
    category: 'Verre',
    destination: 'Consigne commerçant ou Poubelle Bleue',
    containerColor: 'bleu',
    icon: '🍾',
    advice: 'Privilégier le retour de consigne chez votre revendeur (Bralima, Bracongo). Sinon, déposer au point de tri verre sans briser.',
    recyclable: true,
    kinshasaFiliere: 'Filière de consigne et réutilisation directe en brasserie, ou broyage pour abrasifs.',
    keywords: ['bouteille verre', 'biere', 'verre', 'consigne', 'bralima', 'bracongo', 'vin']
  },
  {
    id: 'verre-brise',
    name: 'Vaisselle cassée, vitres et miroirs',
    category: 'Verre',
    destination: 'Poubelle des Déchets Non-Recyclables (Bien emballé)',
    containerColor: 'marron',
    icon: '🪟',
    advice: 'Emballer soigneusement dans un carton ou vieux tissu pour ne pas blesser les éboueurs de la REGEDEK lors du ramassage.',
    recyclable: false,
    kinshasaFiliere: 'Incompatible avec le verre d’emballage classique en raison de températures de fusion différentes.',
    keywords: ['vitre', 'miroir', 'assiette', 'porcelaine', 'verre casse', 'tesson']
  },

  // Papier & Carton
  {
    id: 'carton-emballage',
    name: 'Carton ondulé et cartons d’emballage de colis',
    category: 'Papier & Carton',
    destination: 'Poubelle Bleue / Collecte de cartons',
    containerColor: 'bleu',
    icon: '📦',
    advice: 'Aplatir les cartons, retirer les gros adhésifs en plastique et garder au sec avant collecte.',
    recyclable: true,
    kinshasaFiliere: 'Papeteries et cartonneries industrielles de Kinshasa et Kongo Central.',
    keywords: ['carton', 'colis', 'emballage carton', 'boite carton']
  },
  {
    id: 'journaux-cahiers',
    name: 'Cahiers usagés, journaux, feuilles de bureau',
    category: 'Papier & Carton',
    destination: 'Poubelle Bleue (Papiers secs)',
    containerColor: 'bleu',
    icon: '📰',
    advice: 'Ne pas jeter de papier souillé par de l’huile ou de la sauce. Les feuilles propres se recyclent jusqu’à 7 fois.',
    recyclable: true,
    kinshasaFiliere: 'Filière de fabrication de papier hygiénique et alvéoles d’œufs.',
    keywords: ['papier', 'cahier', 'journal', 'livre', 'feuille', 'ecole', 'bureau']
  },

  // Dangereux & Électroniques
  {
    id: 'piles-accumulateurs',
    name: 'Piles alcalines et accumulateurs rechargeables',
    category: 'Dangereux & Électronique',
    destination: 'Borne Déchets Dangereux / Point Relais Spécialisé',
    containerColor: 'rouge',
    icon: '🔋',
    advice: 'DANGER TOXIQUE : Contient du plomb, cadmium et mercure. Ne jamais brûler ni enterrer dans la parcelle car cela pollue la nappe phréatique.',
    recyclable: true,
    kinshasaFiliere: 'Collecte sécurisée spécialisée de la REGEDEK pour neutralisation chimique.',
    keywords: ['pile', 'batterie', 'accumulateur', 'lithium', 'cadmium', 'torche', 'radio']
  },
  {
    id: 'telephone-e-waste',
    name: 'Vieux téléphone portable, câbles et chargeurs (DEEE)',
    category: 'Dangereux & Électronique',
    destination: 'Point de collecte D3E / Réparateurs rue du Commerce',
    containerColor: 'rouge',
    icon: '📱',
    advice: 'Tenter d’abord la réparation ou la donation pour pièces détachées. Contient des métaux précieux et terres rares à valoriser.',
    recyclable: true,
    kinshasaFiliere: 'Désossage électronique, récupération des métaux et circuits par techniciens qualifiés.',
    keywords: ['telephone', 'smartphone', 'chargeur', 'cable', 'ordinateur', 'radio', 'electronique']
  },
  {
    id: 'medicaments-perimes',
    name: 'Médicaments périmés et seringues médicales',
    category: 'Dangereux & Électronique',
    destination: 'Pharmacie / Centre de santé ou Incinérateur hospitalier',
    containerColor: 'rouge',
    icon: '💊',
    advice: 'Ne jamais jeter dans les WC ni dans la poubelle normale. Les antibiotiques polluent gravement l’eau potable de la ville.',
    recyclable: false,
    kinshasaFiliere: 'Incinération à haute température selon le protocole de santé publique de Kinshasa.',
    keywords: ['medicament', 'comprime', 'sirop', 'seringue', 'perime', 'hopital', 'pharmacie']
  }
];

export function WasteSortingGuide() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [selectedItem, setSelectedItem] = useState<WasteItemGuide | null>(null);

  const categories = [
    'Tous',
    'Plastique',
    'Organique / Biodéchet',
    'Métal',
    'Verre',
    'Papier & Carton',
    'Dangereux & Électronique'
  ];

  const filteredItems = useMemo(() => {
    return WASTE_DIRECTORY.filter((item) => {
      const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase().trim();
      const inName = item.name.toLowerCase().includes(q);
      const inCategory = item.category.toLowerCase().includes(q);
      const inDestination = item.destination.toLowerCase().includes(q);
      const inAdvice = item.advice.toLowerCase().includes(q);
      const inKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));

      return inName || inCategory || inDestination || inAdvice || inKeywords;
    });
  }, [searchTerm, selectedCategory]);

  const getColorStyles = (color: WasteItemGuide['containerColor']) => {
    switch (color) {
      case 'vert':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          border: 'border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'jaune':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          border: 'border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'bleu':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          border: 'border-blue-200',
          dot: 'bg-blue-500'
        };
      case 'rouge':
        return {
          badge: 'bg-red-100 text-red-800 border-red-300',
          border: 'border-red-200',
          dot: 'bg-red-500'
        };
      case 'marron':
      default:
        return {
          badge: 'bg-stone-100 text-stone-800 border-stone-300',
          border: 'border-stone-200',
          dot: 'bg-stone-500'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-semibold text-emerald-100 border border-white/20">
            <Recycle className="w-3.5 h-3.5" />
            <span>Guide Interactif Officiel du Tri • REGEDEK Kinshasa</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Comment trier et valoriser vos déchets ?
          </h2>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Recherchez n’importe quel déchet ménager du quotidien pour connaître sa poubelle de destination, les bons réflexes et sa filière de recyclage à Kinshasa.
          </p>

          {/* Search Bar */}
          <div className="relative pt-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tapez un déchet : bouteille, sachet, pile, épluchures, conserve..."
                className="w-full bg-white text-gray-900 placeholder-gray-400 text-xs sm:text-sm rounded-2xl pl-11 pr-10 py-3.5 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              selectedCategory === cat
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Header & Counter */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          <span className="font-bold text-gray-900">{filteredItems.length}</span> déchet(s) répertorié(s)
          {searchTerm && ` pour "${searchTerm}"`}
        </span>
        <span className="text-[11px] text-emerald-700 font-medium hidden sm:inline">
          Cliquez sur une fiche pour voir les détails de valorisation
        </span>
      </div>

      {/* Directory Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h3 className="font-bold text-sm text-gray-800">Aucun résultat trouvé pour "{searchTerm}"</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Essayez des termes plus généraux comme « plastique », « verre », « sachet », « médicament » ou réinitialisez le filtre de catégorie.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('Tous'); }}
            className="mt-2 text-xs text-emerald-700 font-semibold hover:underline"
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const styles = getColorStyles(item.containerColor);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl shrink-0 p-2 bg-gray-50 rounded-xl border border-gray-100">
                        {item.icon}
                      </span>
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles.badge} mb-1`}>
                          {item.category}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition leading-snug">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-800">
                      <span className={`w-2 h-2 rounded-full ${styles.dot}`}></span>
                      <span>Où le jeter :</span>
                      <span className="text-emerald-700">{item.destination}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                      {item.advice}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-[11px] text-gray-400">
                  <span className="flex items-center space-x-1">
                    {item.recyclable ? (
                      <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                        <Recycle className="w-3 h-3" />
                        <span>Filière active à Kinshasa</span>
                      </span>
                    ) : (
                      <span className="text-stone-500 flex items-center space-x-1">
                        <AlertOctagon className="w-3 h-3 text-amber-500" />
                        <span>Déchet non-recyclable</span>
                      </span>
                    )}
                  </span>
                  <span className="text-emerald-700 font-medium group-hover:translate-x-0.5 transition flex items-center space-x-0.5">
                    <span>Détails</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <span className="text-3xl p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                  {selectedItem.icon}
                </span>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    {selectedItem.category}
                  </span>
                  <h2 className="text-base font-bold text-gray-900 mt-1">{selectedItem.name}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              {/* Destination */}
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block mb-0.5">
                  Bac / Destination Recommandée
                </span>
                <p className="text-sm font-bold text-emerald-950">{selectedItem.destination}</p>
              </div>

              {/* Advice */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
                  Consigne de Tri & Réflexe Éco-Citoyen
                </span>
                <p className="text-gray-800 leading-relaxed">{selectedItem.advice}</p>
              </div>

              {/* Kinshasa recycling circuit */}
              {selectedItem.kinshasaFiliere && (
                <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 block flex items-center space-x-1">
                    <Recycle className="w-3.5 h-3.5 text-teal-700" />
                    <span>Filière et Revalorisation Locale (Kinshasa)</span>
                  </span>
                  <p className="text-teal-950 leading-relaxed">{selectedItem.kinshasaFiliere}</p>
                </div>
              )}

              {/* Color rule reminder */}
              <div className="border-t border-gray-100 pt-3 text-[11px] text-gray-500 space-y-1">
                <span className="font-semibold text-gray-700 block">Code Couleur Officiel REGEDEK :</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-center font-medium">Vert : Organique</span>
                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800 text-center font-medium">Jaune : Plastique/Métal</span>
                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-800 text-center font-medium">Bleu : Papier/Carton</span>
                  <span className="p-1.5 rounded-lg bg-red-50 text-red-800 text-center font-medium">Rouge : Dangereux</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition"
                >
                  Compris
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
