import React, { useState, useRef } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Download, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Printer, 
  Search, 
  Filter, 
  HelpCircle, 
  ArrowRight, 
  User, 
  MapPin, 
  Calendar, 
  AlertCircle,
  WifiOff,
  DollarSign,
  Copy,
  Check,
  Mail,
  Camera
} from 'lucide-react';
import { WastePayment, WasteProducerType, PaymentMethod, UserRole } from '../types';
import { PROVINCES_RDC, getVillesByProvince } from '../data/provincesRDC';
import { exportPaymentReceiptPDF, exportTreasuryReportPDF, exportPaymentsToCSV } from '../utils/pdfExport';
import { OFFICIAL_ADMIN_EMAIL, OFFICIAL_PAYMENT_CONFIG } from '../utils/googleSheets';

interface PaymentTabProps {
  payments: WastePayment[];
  onAddPayment: (payment: Partial<WastePayment>) => Promise<WastePayment | null>;
  userRole: UserRole;
  isOnline: boolean;
  onNavigate?: (tab: string) => void;
}

const PRODUCER_RATES: Record<WasteProducerType, { cdf: number; usd: number; description: string }> = {
  'Ménage Résidentiel standard': { cdf: 5000, usd: 1.80, description: 'Collecte hebdomadaire des ordures ménagères' },
  'Ménage Résidentiel haut standing': { cdf: 15000, usd: 5.40, description: 'Collecte prioritaire bi-hebdomadaire & tri' },
  'Échoppe / Table de marché': { cdf: 3000, usd: 1.10, description: 'Redevance forfaitaire de salubrité de marché public' },
  'Boutique & Commerce': { cdf: 25000, usd: 9.00, description: 'Évacuation des cartons et emballages commerciaux' },
  'Restaurant, Hôtel & Bar': { cdf: 75000, usd: 27.00, description: 'Gestion régulière des biodéchets et emballages' },
  'Entreprise & Industrie': { cdf: 200000, usd: 72.00, description: 'Collecte industrielle par bennes spécialisées' },
  'Évacuation Ponctuelle & Gravats': { cdf: 50000, usd: 18.00, description: 'Prestation spécifique sur commande (gravats, chantiers)' },
};

export function PaymentTab({ payments, onAddPayment, userRole, isOnline }: PaymentTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'payer' | 'mes-quittances' | 'tresorerie'>(
    userRole === 'institutionnel' ? 'tresorerie' : 'payer'
  );

  // Form State
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [producerType, setProducerType] = useState<WasteProducerType>('Ménage Résidentiel standard');
  const [province, setProvince] = useState('Kinshasa');
  const [commune, setCommune] = useState('Gombe');
  const [quartier, setQuartier] = useState('');
  const [period, setPeriod] = useState('Septembre 2026');
  const [serviceType, setServiceType] = useState('Redevance Mensuelle Salubrité & Évacuation');
  const [customAmountCDF, setCustomAmountCDF] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Airtel Money');
  const [transactionReference, setTransactionReference] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 150);
    } catch (err) {
      console.error(err);
      alert("Impossible d'accéder à la caméra en direct. Veuillez vérifier les permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProofImage(dataUrl);
        stopCamera();
      }
    }
  };

  const isSubmittingRef = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<WastePayment | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedItem(id);
      setTimeout(() => setCopiedItem(null), 2200);
    } catch (_) {}
  };

  // Filter state for receipts/treasury
  const [searchFilter, setSearchFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('Tous');

  // Dynamic available cities
  const availableVilles = getVillesByProvince(province);

  const selectedRate = PRODUCER_RATES[producerType];
  const finalAmountCDF = producerType === 'Évacuation Ponctuelle & Gravats' ? customAmountCDF : selectedRate.cdf;
  const finalAmountUSD = Number((finalAmountCDF / 2800).toFixed(2));

  const handleProvinceChange = (newProv: string) => {
    setProvince(newProv);
    const villes = getVillesByProvince(newProv);
    if (villes.length > 0) {
      setCommune(villes[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerName.trim() || !payerPhone.trim() || !transactionReference.trim()) {
      alert("Veuillez renseigner votre nom, téléphone et le numéro de référence de transaction.");
      return;
    }
    if (!proofImage) {
      alert("Anti-fraude strict : La double preuve de paiement par caméra directe (photo du reçu ou écran SMS) est obligatoire !");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await onAddPayment({
        payerName: payerName.trim(),
        payerPhone: payerPhone.trim(),
        producerType,
        province,
        ville: commune,
        commune,
        quartier: quartier.trim() || 'Centre',
        serviceType,
        period,
        amountCDF: finalAmountCDF,
        amountUSD: finalAmountUSD,
        currencyPaid: 'CDF',
        paymentMethod,
        transactionReference: transactionReference.trim(),
        proofImage: proofImage || undefined,
        status: 'Validé'
      });

      if (created) {
        setGeneratedReceipt(created);
        // Reset form fields
        setTransactionReference('');
        setQuartier('');
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement du paiement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered payments
  const filteredPayments = payments.filter(p => {
    if (methodFilter !== 'Tous' && p.paymentMethod !== methodFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const match = 
        p.receiptNumber.toLowerCase().includes(q) ||
        p.payerName.toLowerCase().includes(q) ||
        p.commune.toLowerCase().includes(q) ||
        p.transactionReference.toLowerCase().includes(q) ||
        p.payerPhone.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalCollectedCDF = payments.reduce((sum, p) => sum + (p.amountCDF || 0), 0);
  const totalCollectedUSD = payments.reduce((sum, p) => sum + (p.amountUSD || 0), 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold tracking-wide">
              GUICHET OFFICIEL REGEDEK & ENVIRONNEMENT-PLUS
            </span>
            {!isOnline && (
              <span className="flex items-center space-x-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-medium">
                <WifiOff className="w-3 h-3" />
                <span>Mode Hors Ligne Actif</span>
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900">Paiement Électronique Salubrité</h1>
          <p className="text-xs text-gray-500">
            Règlement des taxes et redevances de gestion des déchets pour ménages, commerces, marchés et entreprises en RDC.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubTab('payer')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'payer' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Payer une Taxe
          </button>
          <button
            onClick={() => setActiveSubTab('mes-quittances')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'mes-quittances' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mes Quittances ({payments.length})
          </button>
          {userRole === 'institutionnel' && (
            <button
              onClick={() => setActiveSubTab('tresorerie')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeSubTab === 'tresorerie' ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Trésorerie REGEDEK
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: PAYER UNE TAXE */}
      {activeSubTab === 'payer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Formulaire de Règlement Sécurisé</h2>
                <p className="text-xs text-gray-500">Émission instantanée de la quittance fiscale numérique</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Contribuable Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nom complet ou Raison Sociale *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean Mukendi ou Ets Kasa-Vubu"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Numéro de Téléphone déclarant *
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="Ex: +243 810 000 000"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Type de producteur & Barème */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Catégorie de Producteur de Déchets *
                </label>
                <select
                  value={producerType}
                  onChange={(e) => setProducerType(e.target.value as WasteProducerType)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium text-gray-800"
                >
                  {Object.keys(PRODUCER_RATES).map((type) => (
                    <option key={type} value={type}>
                      {type} — {PRODUCER_RATES[type as WasteProducerType].cdf.toLocaleString('fr-FR')} CDF (~${PRODUCER_RATES[type as WasteProducerType].usd} USD)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1 italic">
                  Prestation : {selectedRate.description}
                </p>
              </div>

              {producerType === 'Évacuation Ponctuelle & Gravats' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Montant convenu pour évacuation ponctuelle (CDF) *
                  </label>
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    value={customAmountCDF}
                    onChange={(e) => setCustomAmountCDF(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Localisation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Province *</label>
                  <select
                    value={province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {PROVINCES_RDC.map((p) => (
                      <option key={p.nom} value={p.nom}>{p.nom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ville / Commune *</label>
                  <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {availableVilles.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Quartier / Avenue</label>
                  <input
                    type="text"
                    placeholder="Ex: Matonge, Av. Stade"
                    value={quartier}
                    onChange={(e) => setQuartier(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Service & Période */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Période concernée *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      placeholder="Ex: Septembre 2026"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Intitulé de la Taxe</label>
                  <input
                    type="text"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-gray-50 text-gray-700"
                  />
                </div>
              </div>

              {/* Choix du Moyen de Paiement */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">
                  Sélectionnez le mode de paiement officiel *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Airtel Money */}
                  <div
                    onClick={() => setPaymentMethod('Airtel Money')}
                    className={`cursor-pointer p-3.5 rounded-xl border transition flex flex-col justify-between relative ${
                      paymentMethod === 'Airtel Money'
                        ? 'border-red-600 bg-red-50/40 ring-2 ring-red-500/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-red-600">Airtel Money</span>
                      <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded">
                        *501#
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">N° Officiel Salubrité :</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-mono font-bold text-gray-900">+243 978 491 414</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy('+243978491414', 'airtel');
                          }}
                          className="p-1 hover:bg-red-100 rounded text-red-700 transition"
                          title="Copier le numéro"
                        >
                          {copiedItem === 'airtel' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">ENVIRONNEMENT-PLUS / REGEDEK</p>
                  </div>

                  {/* M-Pesa */}
                  <div
                    onClick={() => setPaymentMethod('M-Pesa')}
                    className={`cursor-pointer p-3.5 rounded-xl border transition flex flex-col justify-between relative ${
                      paymentMethod === 'M-Pesa'
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-emerald-700">M-Pesa Vodacom</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                        *1112#
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">N° Officiel Salubrité :</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-mono font-bold text-gray-900">+243 831 352 778</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy('+243831352778', 'mpesa');
                          }}
                          className="p-1 hover:bg-emerald-100 rounded text-emerald-800 transition"
                          title="Copier le numéro"
                        >
                          {copiedItem === 'mpesa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">ENVIRONNEMENT-PLUS / REGEDEK</p>
                  </div>

                  {/* Equity BCDC */}
                  <div
                    onClick={() => setPaymentMethod('Compte bancaire Equity BCDC')}
                    className={`cursor-pointer p-3.5 rounded-xl border transition flex flex-col justify-between relative ${
                      paymentMethod === 'Compte bancaire Equity BCDC'
                        ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-amber-700">Equity BCDC</span>
                      <Building2 className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">N° Compte Bancaire :</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-mono font-bold text-gray-900">655100310489884</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy('655100310489884', 'equity');
                          }}
                          className="p-1 hover:bg-amber-100 rounded text-amber-800 transition"
                          title="Copier le compte"
                        >
                          {copiedItem === 'equity' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">ENVIRONNEMENT-PLUS RDC</p>
                  </div>
                </div>
              </div>

              {/* Référence Transaction */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Numéro de Référence de Transaction (reçu par SMS ou bordereau) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: MP260906.1234.H56789 ou REF-AIRTEL-9872"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-mono border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Ce numéro permet la réconciliation automatique avec la trésorerie REGEDEK.
                </p>
              </div>

              {/* Double Preuve de Paiement - Caméra Directe Uniquement */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Double Preuve de Paiement (Caméra Directe Uniquement) *</span>
                  <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">Anti-Fraude Strict</span>
                </label>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Activer la Caméra en Direct</span>
                    </button>
                    
                    <label className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition text-center">
                      <Camera className="w-4 h-4 text-emerald-700" />
                      <span>Prendre Photo (Mobile)</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setProofImage(ev.target?.result as string || '');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {proofImage ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img src={proofImage} alt="Preuve" className="w-10 h-10 object-cover rounded-lg border border-emerald-300" />
                        <div>
                          <p className="text-xs font-bold text-emerald-900">Preuve caméra capturée</p>
                          <p className="text-[10px] text-emerald-700">Validée pour le contrôle anti-fraude</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProofImage('')}
                        className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1"
                      >
                        Refaire
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-xl">
                      Obligatoire : Veuillez capturer en direct l'écran de confirmation SMS ou le reçu de paiement opérateur.
                    </p>
                  )}
                </div>
              </div>

              {/* Bouton Validation */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Certification en cours...'
                    : `Valider et Générer la Quittance (${finalAmountCDF.toLocaleString('fr-FR')} CDF)`}
                </span>
              </button>
            </form>
          </div>

          {/* Side Summary & Instructions */}
          <div className="space-y-4">
            {/* Amount Box */}
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-[10px] tracking-wider uppercase font-bold text-emerald-200">
                Montant à Régler
              </span>
              <div>
                <h3 className="text-3xl font-black">{finalAmountCDF.toLocaleString('fr-FR')} CDF</h3>
                <p className="text-xs text-emerald-200 font-medium">Soit environ ${finalAmountUSD} USD</p>
              </div>
              <div className="pt-3 border-t border-emerald-700/60 text-xs space-y-1.5 text-emerald-100">
                <div className="flex justify-between">
                  <span>Assujetti :</span>
                  <span className="font-semibold text-white truncate max-w-[150px]">{payerName || 'Citoyen'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commune :</span>
                  <span className="font-semibold text-white">{commune} ({province})</span>
                </div>
                <div className="flex justify-between">
                  <span>Moyen :</span>
                  <span className="font-semibold text-white">{paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Practical Guide */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 text-xs text-gray-600">
              <h4 className="font-bold text-gray-900 flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span>Guide de paiement sécurisé</span>
              </h4>
              <ol className="space-y-2 list-decimal list-inside text-gray-600">
                <li>Composez la syntaxe mobile de votre opérateur (ex: *501# ou *1112#).</li>
                <li>Transférez le montant exact vers le numéro officiel REGEDEK indiqué.</li>
                <li>Copiez le numéro de référence reçu par SMS.</li>
                <li>Collez-le dans le formulaire et cliquez sur <b>Valider</b>.</li>
                <li>Téléchargez immédiatement votre <b>Quittance Fiscale PDF</b> certifiée.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QUITTANCE GÉNÉRÉE AVEC SUCCÈS */}
      {generatedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Paiement Validé avec Succès !</h3>
              <p className="text-xs text-gray-500">
                Votre quittance fiscale officielle REGEDEK a été délivrée.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-gray-500">N° Quittance :</span>
                <span className="font-bold text-emerald-800">{generatedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date :</span>
                <span>{generatedReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Assujetti :</span>
                <span className="font-bold">{generatedReceipt.payerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lieu :</span>
                <span>{generatedReceipt.commune}, Q. {generatedReceipt.quartier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Montant :</span>
                <span className="font-bold text-emerald-700">
                  {generatedReceipt.amountCDF.toLocaleString('fr-FR')} CDF (~${generatedReceipt.amountUSD} USD)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Moyen & Réf :</span>
                <span className="truncate max-w-[180px]">{generatedReceipt.paymentMethod} ({generatedReceipt.transactionReference})</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={() => exportPaymentReceiptPDF(generatedReceipt)}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-xl text-xs font-bold shadow transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger la Quittance Officielle (PDF)</span>
              </button>

              <button
                onClick={() => setGeneratedReceipt(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-xs font-semibold transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MES QUITTANCES */}
      {activeSubTab === 'mes-quittances' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Historique des Quittances de Salubrité</h2>
              <p className="text-xs text-gray-500">Reçus fiscaux numériques délivrés par REGEDEK et téléchargeables en PDF</p>
            </div>

            <button
              onClick={() => setActiveSubTab('payer')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <CreditCard className="w-4 h-4" />
              <span>Nouveau Paiement</span>
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Aucune quittance enregistrée</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Tous les compteurs sont initialisés à zéro. Dès votre premier règlement de taxe de salubrité, votre quittance numérique certifiée s'affichera ici.
              </p>
              <button
                onClick={() => setActiveSubTab('payer')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                <span>Effectuer un premier règlement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-emerald-800">{p.receiptNumber}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                        VALIDE
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{p.payerName} • {p.producerType}</p>
                    <p className="text-[11px] text-gray-500">
                      {p.commune}, Q. {p.quartier} ({p.province}) • {p.period} • {p.paymentMethod} (Réf: {p.transactionReference})
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 sm:text-right">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{p.amountCDF.toLocaleString('fr-FR')} CDF</p>
                      <p className="text-[10px] text-gray-500">~${p.amountUSD} USD</p>
                    </div>

                    <button
                      onClick={() => exportPaymentReceiptPDF(p)}
                      className="p-2 bg-white border border-gray-200 hover:bg-emerald-50 text-emerald-700 rounded-xl transition shadow-sm"
                      title="Télécharger la Quittance PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: TRÉSORERIE & TABLEAU DE BORD REGEDEK (Institutionnel) */}
      {activeSubTab === 'tresorerie' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 font-medium">Recouvrement Total (CDF)</span>
              <h3 className="text-2xl font-black text-emerald-800">{totalCollectedCDF.toLocaleString('fr-FR')} CDF</h3>
              <p className="text-[10px] text-gray-400">Compteur officiel en temps réel</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 font-medium">Équivalent USD</span>
              <h3 className="text-2xl font-black text-teal-800">${totalCollectedUSD.toFixed(2)} USD</h3>
              <p className="text-[10px] text-gray-400">Taux indicatif 2 800 CDF/USD</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 font-medium">Quittances Émises</span>
              <h3 className="text-2xl font-black text-gray-900">{payments.length}</h3>
              <p className="text-[10px] text-gray-400">Paiements validés</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-[11px] text-gray-500 font-medium">Taux de Recouvrement</span>
              <h3 className="text-2xl font-black text-purple-800">
                {payments.length > 0 ? "100%" : "0%"}
              </h3>
              <p className="text-[10px] text-gray-400">Validation numérique instantanée</p>
            </div>
          </div>

          {/* Table & Tools */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Registre des Recettes REGEDEK</h2>
                <p className="text-xs text-gray-500">Suivi détaillé des encaissements par mobile money et banque</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportTreasuryReportPDF(payments)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Rapport PDF Trésorerie</span>
                </button>

                <button
                  onClick={() => exportPaymentsToCSV(payments)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
                >
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Export Excel / CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher par contribuable, quittance, commune ou référence..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-gray-700"
              >
                <option value="Tous">Tous les opérateurs</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Compte bancaire Equity BCDC">Equity BCDC</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-600 font-semibold">
                    <th className="py-2.5 px-3">N° Quittance</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Contribuable</th>
                    <th className="py-2.5 px-3">Type Producteur</th>
                    <th className="py-2.5 px-3">Commune (Prov.)</th>
                    <th className="py-2.5 px-3">Moyen & Réf</th>
                    <th className="py-2.5 px-3 text-right">Montant (CDF)</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500 italic">
                        Aucun paiement enregistré pour l'instant. Les compteurs sont initialisés à zéro.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{p.receiptNumber}</td>
                        <td className="py-2.5 px-3 text-gray-500">{p.date}</td>
                        <td className="py-2.5 px-3 font-medium text-gray-900">{p.payerName}</td>
                        <td className="py-2.5 px-3 text-gray-600">{p.producerType}</td>
                        <td className="py-2.5 px-3 text-gray-600">{p.commune} ({p.province})</td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-gray-800">{p.paymentMethod}</span>
                          <span className="block font-mono text-[10px] text-gray-400">{p.transactionReference}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                          {p.amountCDF.toLocaleString('fr-FR')} CDF
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => exportPaymentReceiptPDF(p)}
                            className="text-emerald-700 hover:text-emerald-900 text-[11px] font-semibold underline"
                          >
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <Camera className="w-5 h-5 text-emerald-700" />
                <span>Capture Directe du Reçu de Paiement</span>
              </h3>
              <button
                onClick={stopCamera}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition"
              >
                ✕
              </button>
            </div>

            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-emerald-400/70 m-4 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="bg-black/60 text-white text-[10px] px-3 py-1 rounded-full font-mono">
                  Cadrez le reçu ou l'écran SMS ici
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-xl text-xs font-bold shadow transition flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capturer la photo</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
