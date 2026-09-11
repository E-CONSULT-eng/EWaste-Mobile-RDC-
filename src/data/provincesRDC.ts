export interface ProvinceRDC {
  id: string;
  nom: string;
  chefLieu: string;
  region: 'Ouest' | 'Est' | 'Centre' | 'Nord' | 'Sud';
  coordinates: { lat: number; lng: number };
  villes: string[];
}

export const PROVINCES_RDC: ProvinceRDC[] = [
  {
    id: 'kinshasa',
    nom: 'Kinshasa',
    chefLieu: 'Kinshasa',
    region: 'Ouest',
    coordinates: { lat: -4.325, lng: 15.322 },
    villes: [
      'Kinshasa', 'Gombe', 'Limete', 'Kalamu', 'Masina', 'Ngaliema', 
      'Mont-Ngafula', 'Matete', 'Kasa-Vubu', 'Bandalungwa', 'Lingwala', 
      'Barumbu', 'Lemba', 'Bumbu', 'Makala', "N'djili", 'Kintambo', 
      'Kimbanseke', 'Kisenso', 'Maluku', 'Ngaba', 'Ngiri-Ngiri', 'Nsele', 'Selembao'
    ]
  },
  {
    id: 'bas-uele',
    nom: 'Bas-Uele',
    chefLieu: 'Buta',
    region: 'Nord',
    coordinates: { lat: 2.7858, lng: 24.7300 },
    villes: ['Buta', 'Aketi', 'Bambesa', 'Bondo', 'Ango', 'Poko']
  },
  {
    id: 'equateur',
    nom: 'Équateur',
    chefLieu: 'Mbandaka',
    region: 'Ouest',
    coordinates: { lat: 0.0487, lng: 18.2603 },
    villes: ['Mbandaka', 'Bikoro', 'Lukolela', 'Basankusu', 'Bolomba', 'Bomongo', 'Makanza']
  },
  {
    id: 'haut-katanga',
    nom: 'Haut-Katanga',
    chefLieu: 'Lubumbashi',
    region: 'Sud',
    coordinates: { lat: -11.6609, lng: 27.4794 },
    villes: ['Lubumbashi', 'Likasi', 'Kasumbalesa', 'Kipushi', 'Kambove', 'Pweto', 'Sakania', 'Mitwaba']
  },
  {
    id: 'haut-lomami',
    nom: 'Haut-Lomami',
    chefLieu: 'Kamina',
    region: 'Sud',
    coordinates: { lat: -8.7350, lng: 24.9980 },
    villes: ['Kamina', 'Bukama', 'Kabongo', 'Malemba-Nkulu', 'Kaniama']
  },
  {
    id: 'haut-uele',
    nom: 'Haut-Uele',
    chefLieu: 'Isiro',
    region: 'Nord',
    coordinates: { lat: 2.7739, lng: 27.6160 },
    villes: ['Isiro', 'Watsa', 'Dungu', 'Faradje', 'Rungu', 'Wamba', 'Niangara']
  },
  {
    id: 'ituri',
    nom: 'Ituri',
    chefLieu: 'Bunia',
    region: 'Est',
    coordinates: { lat: 1.5622, lng: 30.2525 },
    villes: ['Bunia', 'Aru', 'Mahagi', 'Djugu', 'Irumu', 'Mambasa']
  },
  {
    id: 'kasai',
    nom: 'Kasaï',
    chefLieu: 'Tshikapa',
    region: 'Centre',
    coordinates: { lat: -6.4167, lng: 20.8000 },
    villes: ['Tshikapa', 'Ilebo', 'Luebo', 'Dekese', 'Mweka']
  },
  {
    id: 'kasai-central',
    nom: 'Kasaï-Central',
    chefLieu: 'Kananga',
    region: 'Centre',
    coordinates: { lat: -5.8962, lng: 22.4166 },
    villes: ['Kananga', 'Kazumba', 'Luiza', 'Demba', 'Dibaya', 'Dimbelenge']
  },
  {
    id: 'kasai-oriental',
    nom: 'Kasaï-Oriental',
    chefLieu: 'Mbuji-Mayi',
    region: 'Centre',
    coordinates: { lat: -6.1500, lng: 23.6000 },
    villes: ['Mbuji-Mayi', 'Miabi', 'Tshilenge', 'Kabeya-Kamwanga', 'Lupatapata', 'Katanda']
  },
  {
    id: 'kongo-central',
    nom: 'Kongo-Central',
    chefLieu: 'Matadi',
    region: 'Ouest',
    coordinates: { lat: -5.8167, lng: 13.4500 },
    villes: ['Matadi', 'Boma', 'Muanda', 'Mbanza-Ngungu', 'Kisantu', 'Kasangulu', 'Kimpese', 'Tshela', 'Lukula', 'Songololo']
  },
  {
    id: 'kwango',
    nom: 'Kwango',
    chefLieu: 'Kenge',
    region: 'Ouest',
    coordinates: { lat: -4.8167, lng: 17.0333 },
    villes: ['Kenge', 'Kasongo-Lunda', 'Popokabaka', 'Kahemba', 'Feshi']
  },
  {
    id: 'kwilu',
    nom: 'Kwilu',
    chefLieu: 'Bandundu',
    region: 'Ouest',
    coordinates: { lat: -3.3167, lng: 17.3667 },
    villes: ['Bandundu', 'Kikwit', 'Idiofa', 'Gungu', 'Bulungu', 'Bagata', 'Masi-Manimba']
  },
  {
    id: 'lomami',
    nom: 'Lomami',
    chefLieu: 'Kabinda',
    region: 'Centre',
    coordinates: { lat: -6.1333, lng: 24.4833 },
    villes: ['Kabinda', 'Mwene-Ditu', 'Ngandajika', 'Luputa', 'Lubao', 'Kamiji']
  },
  {
    id: 'lualaba',
    nom: 'Lualaba',
    chefLieu: 'Kolwezi',
    region: 'Sud',
    coordinates: { lat: -10.7167, lng: 25.4667 },
    villes: ['Kolwezi', 'Kasaji', 'Mutshatsha', 'Dilolo', 'Kapanga', 'Sandoa', 'Lubudi']
  },
  {
    id: 'mai-ndombe',
    nom: 'Mai-Ndombe',
    chefLieu: 'Inongo',
    region: 'Ouest',
    coordinates: { lat: -1.9500, lng: 18.2667 },
    villes: ['Inongo', 'Nioki', 'Kutu', 'Oshwe', 'Kiri', 'Mushie', 'Bolobo', 'Yumbi', 'Kwamouth']
  },
  {
    id: 'maniema',
    nom: 'Maniema',
    chefLieu: 'Kindu',
    region: 'Est',
    coordinates: { lat: -2.9500, lng: 25.9500 },
    villes: ['Kindu', 'Kasongo', 'Kalima', 'Punia', 'Kibombo', 'Lubutu', 'Kabambare', 'Pangi']
  },
  {
    id: 'mongala',
    nom: 'Mongala',
    chefLieu: 'Lisala',
    region: 'Nord',
    coordinates: { lat: 2.1500, lng: 21.5167 },
    villes: ['Lisala', 'Bumba', 'Bongandanga']
  },
  {
    id: 'nord-kivu',
    nom: 'Nord-Kivu',
    chefLieu: 'Goma',
    region: 'Est',
    coordinates: { lat: -1.6741, lng: 29.2285 },
    villes: ['Goma', 'Butembo', 'Beni', 'Oicha', 'Lubero', 'Rutshuru', 'Masisi', 'Walikale', 'Nyiragongo']
  },
  {
    id: 'nord-ubangi',
    nom: 'Nord-Ubangi',
    chefLieu: 'Gbadolite',
    region: 'Nord',
    coordinates: { lat: 4.2833, lng: 21.0167 },
    villes: ['Gbadolite', 'Mobayi-Mbongo', 'Bosobolo', 'Businga', 'Yakoma']
  },
  {
    id: 'sankuru',
    nom: 'Sankuru',
    chefLieu: 'Lusambo',
    region: 'Centre',
    coordinates: { lat: -4.9750, lng: 23.4500 },
    villes: ['Lusambo', 'Lodja', 'Tshumbe', 'Lubefu', 'Katako-Kombe', 'Kole']
  },
  {
    id: 'sud-kivu',
    nom: 'Sud-Kivu',
    chefLieu: 'Bukavu',
    region: 'Est',
    coordinates: { lat: -2.5083, lng: 28.8608 },
    villes: ['Bukavu', 'Uvira', 'Baraka', 'Kamituga', 'Walungu', 'Kabare', 'Kalehe', 'Shabunda', 'Fizi', 'Mwenga', 'Idjwi']
  },
  {
    id: 'sud-ubangi',
    nom: 'Sud-Ubangi',
    chefLieu: 'Gemena',
    region: 'Nord',
    coordinates: { lat: 3.2500, lng: 19.7667 },
    villes: ['Gemena', 'Zongo', 'Kungu', 'Libenge', 'Budjala']
  },
  {
    id: 'tanganyika',
    nom: 'Tanganyika',
    chefLieu: 'Kalemie',
    region: 'Est',
    coordinates: { lat: -5.9475, lng: 29.1947 },
    villes: ['Kalemie', 'Manono', 'Kongolo', 'Moba', 'Nyunzu', 'Kabalo']
  },
  {
    id: 'tshopo',
    nom: 'Tshopo',
    chefLieu: 'Kisangani',
    region: 'Nord',
    coordinates: { lat: 0.5153, lng: 25.1910 },
    villes: ['Kisangani', 'Banalia', 'Basoko', 'Opala', 'Isangi', 'Ubundu', 'Yahuma', 'Bafwasende']
  },
  {
    id: 'tshuapa',
    nom: 'Tshuapa',
    chefLieu: 'Boende',
    region: 'Nord',
    coordinates: { lat: -0.2167, lng: 20.8667 },
    villes: ['Boende', 'Befale', 'Bokungu', 'Djolu', 'Ikela', 'Monkoto']
  }
];

export const PROVINCES_NAMES = PROVINCES_RDC.map(p => p.nom);

export function getVillesByProvince(provinceNom: string): string[] {
  const prov = PROVINCES_RDC.find(p => p.nom.toLowerCase() === provinceNom.toLowerCase());
  return prov ? prov.villes : [];
}

export function getProvinceByName(provinceNom: string): ProvinceRDC | undefined {
  return PROVINCES_RDC.find(p => p.nom.toLowerCase() === provinceNom.toLowerCase());
}

export function getCoordinatesForLocation(provinceNom?: string, villeNom?: string): { lat: number; lng: number } {
  const prov = PROVINCES_RDC.find(p => p.nom.toLowerCase() === (provinceNom || '').toLowerCase());
  if (prov) {
    return prov.coordinates;
  }
  // Default to Kinshasa
  return { lat: -4.325, lng: 15.322 };
}
