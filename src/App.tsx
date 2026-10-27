/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Settings,
  ChevronDown,
  Thermometer,
  Droplets,
  AlertTriangle,
  ChevronRight,
  Home,
  Map as MapIcon,
  BookOpen,
  FileText,
  Phone,
  RefreshCw,
  Sun,
  CloudSun,
  ShieldAlert,
  Wind,
  Check,
  Building2,
  ShieldCheck,
  DoorClosed,
  HeartPulse,
  Siren,
  PhoneCall,
  Activity,
  Layers,
  Compass,
  Navigation,
  Flame,
  Radio,
  ExternalLink,
} from 'lucide-react';
import {
  SUPPORTED_CITIES,
  CityLocation,
  AirPollutionData,
  fetchLiveAirAndWeather,
} from './services/weatherApi';
import { MapLibreView } from './components/MapLibreView';
import { QuickGuidanceModal, GuidanceType } from './components/QuickGuidanceModal';
import { SosModal } from './components/SosModal';
import { ReportModal } from './components/ReportModal';
import { HealthRiskCalculator } from './components/HealthRiskCalculator';
import { ProtectionGuideSection } from './components/ProtectionGuideSection';
import { AttributionAndEmergencyModal } from './components/AttributionAndEmergencyModal';
import { ProvinceCitySelector } from './components/ProvinceCitySelector';
import { VERIFIED_EMERGENCY_FACILITIES, NATIONWIDE_HOTSPOTS, EmergencyFacility, HotspotData } from './data/realEmergencyFacilities';
import { REGIONS_DATA } from './data/karhutlaData';
import { calculateHourlyReading } from './utils/airQualityEngine';

type ActiveTab = 'beranda' | 'peta' | 'panduan';

export default function App() {
  const [selectedCity, setSelectedCity] = useState<CityLocation>(SUPPORTED_CITIES[0]); // Default Palangka Raya
  const [airData, setAirData] = useState<AirPollutionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');

  // Selected item on map
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Modals state
  const [guidanceModal, setGuidanceModal] = useState<GuidanceType>(null);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAttributionOpen, setIsAttributionOpen] = useState(false);

  // Directory filter tab on desktop Peta page
  const [directoryTab, setDirectoryTab] = useState<'hotspots' | 'facilities'>('hotspots');
  const [directoryProvinceFilter, setDirectoryProvinceFilter] = useState<string>('Semua');

  // SOS button press-and-hold progress state (Mobile mode)
  const [sosProgress, setSosProgress] = useState(0);
  const sosHoldTimer = useRef<number | null>(null);

  // Fetch live OpenWeather data whenever city changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchLiveAirAndWeather(selectedCity).then((data) => {
      if (isMounted) {
        setAirData(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Handle SOS Long Press
  const startSosHold = () => {
    setSosProgress(0);
    const startTime = Date.now();
    const duration = 1200;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setSosProgress(pct);

      if (pct >= 100) {
        window.clearInterval(interval);
        setSosProgress(0);
        setIsSosOpen(true);
      }
    }, 40);

    sosHoldTimer.current = interval;
  };

  const cancelSosHold = () => {
    if (sosHoldTimer.current) {
      window.clearInterval(sosHoldTimer.current);
      sosHoldTimer.current = null;
    }
    setSosProgress(0);
  };

  // Find matching Karhutla data for regional district metrics
  const matchingRegion =
    REGIONS_DATA.find((r) => r.id === selectedCity.id) ?? REGIONS_DATA[0];
  const hourlySnapshot = calculateHourlyReading(matchingRegion, 14);

  const currentAqi = airData ? airData.aqi : 68;
  const currentCategory = airData ? airData.categoryName : 'Moderate';
  const categoryHex = airData ? airData.themeColor.hex : '#F59E0B';
  const bgGradient = airData ? airData.themeColor.bgGradient : 'from-emerald-700 via-emerald-600 to-green-600';

  // Filter facilities near selected city
  const nearbyFacilities = VERIFIED_EMERGENCY_FACILITIES.filter(
    (f) => f.province === selectedCity.province || f.city.includes(selectedCity.name)
  );
  const displayFacilities = nearbyFacilities.length > 0 ? nearbyFacilities : VERIFIED_EMERGENCY_FACILITIES.slice(0, 4);

  const handleFocusFacility = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
  };

  // Directory filtering for Tab Peta
  const filteredHotspots = NATIONWIDE_HOTSPOTS.filter((h) =>
    directoryProvinceFilter === 'Semua' ? true : h.province === directoryProvinceFilter
  );

  const filteredFacilities = VERIFIED_EMERGENCY_FACILITIES.filter((f) =>
    directoryProvinceFilter === 'Semua' ? true : f.province === directoryProvinceFilter
  );

  const uniqueProvinces = [
    'Semua',
    'Kalimantan Tengah',
    'Riau',
    'Jambi',
    'Sumatera Selatan',
    'Kalimantan Barat',
    'Kalimantan Selatan',
    'Sulawesi Utara',
    'Papua Selatan',
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* ========================================================
          GLOBAL DESKTOP / TABLET TOP NAVIGATION BAR (md:flex only)
         ======================================================== */}
      <header className="hidden md:flex sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-14 w-full flex items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.png"
              alt="Logo SIAGA ASAP"
              className="w-9 h-9 rounded-full shadow-md object-cover border border-slate-700 shrink-0"
            />
            <div>
              <span className="font-extrabold tracking-tight font-display text-base text-white">
                SIAGA ASAP
              </span>
              <span className="ml-2 text-[11px] text-slate-400">
                · Pemantau Kualitas Udara & Karhutla Nasional
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav aria-label="Navigasi Utama" className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('beranda')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'beranda'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('peta')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'peta'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Peta Satelit & Faskes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('panduan')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'panduan'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Panduan Perlindungan</span>
            </button>
          </nav>

          {/* Action: Lapor & Hotline SOS */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lapor Kabut Asap</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSosOpen(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Siren className="w-3.5 h-3.5 animate-pulse" />
              <span>SOS 110/112</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          1. TAMPILAN KHUSUS HP (md:hidden)
          Sesuai screenshot desain referensi mobile user
         ======================================================== */}
      <div className="block md:hidden pb-32">
        {/* Mobile Tab 1: Beranda */}
        {activeTab === 'beranda' && (
          <>
            {/* Curved Header Section with Real Gradient */}
            <section
              style={{
                borderBottomLeftRadius: '2.5rem',
                borderBottomRightRadius: '2.5rem',
              }}
              className={`bg-gradient-to-b ${bgGradient} text-white px-5 pt-7 pb-8 shadow-md relative overflow-hidden transition-all duration-300`}
            >
              {/* Subtle Ambient Ring */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              {/* Top Bar: Active Location Badge & Action Icons */}
              <div className="flex items-center justify-between relative z-10 mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo.png"
                    alt="Logo SIAGA ASAP"
                    className="w-8 h-8 rounded-full border border-white/30 shadow-md object-cover shrink-0"
                  />
                  <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border border-white/15">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="truncate max-w-[130px]">{selectedCity.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                    title="Lapor Kabut Asap / Titik Api"
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-md transition-all cursor-pointer active:scale-95 border border-rose-400/30"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lapor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAttributionOpen(true)}
                    title="Informasi & Pengaturan"
                    className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Swipeable Major Hotspot Cities Ribbon (Substitutes old dropdown) */}
              <div className="relative z-10 mb-2">
                <ProvinceCitySelector
                  selectedCity={selectedCity}
                  onSelectCity={setSelectedCity}
                  isCompactMobile={true}
                />
              </div>

              {/* Circular AQI Badge Display */}
              <div className="flex flex-col items-center justify-center mt-5 mb-3 text-center relative z-10">
                <div
                  style={{
                    boxShadow: `0 0 35px -5px ${categoryHex}80`,
                    borderColor: categoryHex,
                  }}
                  className="w-32 h-32 rounded-full border-4 bg-white/10 backdrop-blur-md flex flex-col items-center justify-center p-2 mb-2 transition-all duration-300"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                    AQI US
                  </span>
                  <span className="text-4xl font-extrabold tracking-tight font-display my-0.5">
                    {isLoading ? '...' : currentAqi}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-100">
                    {currentAqi > 100 ? 'Polusi Aktif' : 'Aman'}
                  </span>
                </div>

                <h2 className="text-lg font-black tracking-tight font-display drop-shadow-xs">
                  {currentCategory}
                </h2>
                <p className="text-xs text-emerald-50/90 font-medium max-w-xs mt-0.5">
                  {airData?.description ?? 'Kualitas udara dapat diterima untuk sebagian besar orang.'}
                </p>
              </div>

              {/* Micro Weather Bar */}
              <div className="flex items-center justify-center gap-4 text-xs font-semibold text-emerald-50 pt-2 border-t border-white/15 relative z-10">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-300" />
                  {airData?.weather.temp ?? 28}°C
                </span>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-300" />
                  {airData?.weather.humidity ?? 65}%
                </span>
                <span className="opacity-40">·</span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-slate-200" />
                  {airData?.weather.windSpeedKmh ?? 12} km/j
                </span>
              </div>
            </section>

            {/* Current Conditions Card */}
            <section className="px-5 -mt-4 relative z-20">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Current Conditions
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {airData?.categoryIndonesian ?? 'Sedang'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 block">PM2.5</span>
                    <span className="text-sm font-extrabold text-slate-900 block my-0.5">
                      {airData?.components.pm2_5 ?? 20.3}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-medium">µg/m³</span>
                  </div>
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 block">PM10</span>
                    <span className="text-sm font-extrabold text-slate-900 block my-0.5">
                      {airData?.components.pm10 ?? 32.1}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-medium">µg/m³</span>
                  </div>
                  <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 block">O3</span>
                    <span className="text-sm font-extrabold text-slate-900 block my-0.5">
                      {airData?.components.o3 ?? 38.0}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-medium">µg/m³</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Air Quality Alerts Section */}
            <section className="px-5 mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Air Quality Alerts
                </h3>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  2 Aktif
                </span>
              </div>

              <div className="space-y-2">
                <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xs text-rose-950">
                      Peringatan: Polusi Tinggi di Sektor Timur
                    </h4>
                    <p className="text-[11px] text-rose-800 leading-snug mt-0.5">
                      Konsentrasi PM2.5 meningkat signifikan akibat arah angin perbatasan gambut.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xs text-amber-950">
                      Kualitas Udara Memburuk: Area Pemukiman
                    </h4>
                    <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                      Warga rentan disarankan membatasi aktivitas luar ruangan maksimal 30 menit.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Citizen Report Banner (Prominent Action for Affected Citizens) */}
            <section className="px-5 mt-4">
              <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-800 rounded-2xl p-4 text-white shadow-sm border border-rose-800/60 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 text-[10px] font-bold border border-rose-400/30">
                    <Flame className="w-3 h-3 text-amber-300" />
                    <span>Posko Pengaduan Warga</span>
                  </span>
                  <h4 className="text-xs font-extrabold text-white leading-tight">
                    Lihat Titik Api / Asap Pekat?
                  </h4>
                  <p className="text-[11px] text-rose-100/80 leading-snug">
                    Kirim laporan koordinat ke Satgas BPBD & Damkar setempat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="px-3.5 py-2.5 bg-white text-rose-900 hover:bg-rose-50 rounded-xl text-xs font-black shadow-md shrink-0 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-700" />
                  <span>Buat Laporan</span>
                </button>
              </div>
            </section>

            {/* Quick Protective Guidance Section */}
            <section className="px-5 mt-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">
                Protective Guidance Quick Links
              </h3>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setGuidanceModal('masker')}
                  className="w-full p-3 bg-[#E8F5E9] hover:bg-[#C8E6C9] rounded-2xl flex items-center gap-3.5 text-left transition-colors cursor-pointer border border-emerald-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-emerald-950">Gunakan Masker N95</h4>
                    <p className="text-[11px] text-emerald-700 leading-tight">
                      Filtrasi &gt;95% partikel mikro PM2.5 asap karhutla
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-600" />
                </button>

                <button
                  type="button"
                  onClick={() => setGuidanceModal('jendela')}
                  className="w-full p-3 bg-[#E0F2FE] hover:bg-[#BAE6FD] rounded-2xl flex items-center gap-3.5 text-left transition-colors cursor-pointer border border-sky-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-200 text-sky-900 flex items-center justify-center shrink-0">
                    <DoorClosed className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-sky-950">Tutup Jendela</h4>
                    <p className="text-[11px] text-sky-700 leading-tight">
                      Cegah infiltrasi asap karhutla ke dalam ruang hunian
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-sky-600" />
                </button>

                <button
                  type="button"
                  onClick={() => setGuidanceModal('gejala')}
                  className="w-full p-3 bg-[#FEF3C7] hover:bg-[#FDE68A] rounded-2xl flex items-center gap-3.5 text-left transition-colors cursor-pointer border border-amber-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-amber-950">Waspada Gejala Sesak Napas</h4>
                    <p className="text-[11px] text-amber-700 leading-tight">
                      Penanganan darurat & rujukan posko oksigen terdekat
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600" />
                </button>
              </div>
            </section>

            {/* Embedded Live Map & Nearest Facility on Mobile Home */}
            <section className="px-5 mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Peta Pantauan Karhutla & Faskes</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Satelit NASA VIIRS & Posko Paru di {selectedCity.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('peta')}
                  className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Layar Penuh</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Direct interactive live map filling mobile space */}
              <div className="h-72 rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative">
                <MapLibreView
                  city={selectedCity}
                  aqi={currentAqi}
                  categoryHex={categoryHex}
                  isCompact={false}
                  selectedFacilityId={selectedFacilityId}
                />
              </div>

              {/* Nearest Medical Facility Card immediately below Map */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Rujukan Paru Terdekat
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-tight">
                    {displayFacilities[0]?.name ?? 'RSUD Terdekat'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {displayFacilities[0]?.city ?? selectedCity.name} · Siaga IGD 24 Jam
                  </p>
                </div>
                <a
                  href={`tel:${displayFacilities[0]?.phone.replace(/[^0-9]/g, '')}`}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Telepon</span>
                </a>
              </div>
            </section>
          </>
        )}

        {/* Mobile Tab 2: Full Map View */}
        {activeTab === 'peta' && (
          <div className="space-y-3 pt-3">
            {/* Top Bar for Map */}
            <div className="mx-4 p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('beranda')}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="Kembali ke Beranda"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Peta Karhutla & Faskes Paru</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    NASA VIIRS Realtime · Faskes Siaga 24 Jam
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-700 px-2 py-0.5 rounded-full font-mono font-bold">
                {NATIONWIDE_HOTSPOTS.length} Api
              </span>
            </div>

            {/* City Hotspot Ribbon for Map */}
            <div className="px-4">
              <ProvinceCitySelector
                selectedCity={selectedCity}
                onSelectCity={setSelectedCity}
                isCompactMobile={true}
              />
            </div>

            {/* Map Frame */}
            <div className="px-4">
              <div className="h-[calc(100vh-220px)] min-h-[460px] rounded-2xl overflow-hidden shadow-md border border-slate-200">
                <MapLibreView
                  city={selectedCity}
                  aqi={currentAqi}
                  categoryHex={categoryHex}
                  isCompact={false}
                  selectedFacilityId={selectedFacilityId}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tab 3: Panduan View */}
        {activeTab === 'panduan' && (
          <div className="space-y-4 pt-3">
            {/* Top Bar for Panduan */}
            <div className="mx-4 p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('beranda')}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="Kembali ke Beranda"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Panduan & Risiko Respirasi</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Prosedur Medis Kemenkes RI & WHO
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 space-y-6">
              <ProtectionGuideSection />
              <div className="pt-2">
                <HealthRiskCalculator
                  region={matchingRegion}
                  snapshot={hourlySnapshot}
                />
              </div>
            </div>
          </div>
        )}

        {/* Fixed Mobile Bottom Bar with glowing center SOS button */}
        <nav
          aria-label="Navigasi Bawah Mobile"
          className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] grid grid-cols-5 items-center justify-items-center shadow-xl"
        >
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => setActiveTab('beranda')}
            className={`w-full flex flex-col items-center justify-center gap-0.5 py-1 transition-colors cursor-pointer ${
              activeTab === 'beranda' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          {/* 2. Peta */}
          <button
            type="button"
            onClick={() => setActiveTab('peta')}
            className={`w-full flex flex-col items-center justify-center gap-0.5 py-1 transition-colors cursor-pointer ${
              activeTab === 'peta' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MapIcon className="w-5 h-5" />
            <span className="text-[10px]">Peta</span>
          </button>

          {/* 3. Glowing Center SOS Button */}
          <div className="relative -mt-7 flex flex-col items-center justify-center">
            {sosProgress > 0 && (
              <div
                style={{
                  background: `conic-gradient(#ef4444 ${sosProgress * 3.6}deg, transparent 0deg)`,
                }}
                className="absolute -inset-1 rounded-full animate-spin transition-all"
              />
            )}
            <button
              type="button"
              onMouseDown={startSosHold}
              onMouseUp={cancelSosHold}
              onTouchStart={startSosHold}
              onTouchEnd={cancelSosHold}
              onClick={() => setIsSosOpen(true)}
              className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 text-white flex flex-col items-center justify-center shadow-xl border-4 border-white cursor-pointer active:scale-95 transition-transform"
            >
              <Siren className="w-5 h-5" />
              <span className="text-[8px] font-black uppercase leading-none mt-0.5">SOS 110</span>
            </button>
            <span className="text-[8px] font-bold text-slate-500 mt-0.5 whitespace-nowrap">Tekan Lama</span>
          </div>

          {/* 4. Panduan */}
          <button
            type="button"
            onClick={() => setActiveTab('panduan')}
            className={`w-full flex flex-col items-center justify-center gap-0.5 py-1 transition-colors cursor-pointer ${
              activeTab === 'panduan' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">Panduan</span>
          </button>

          {/* 5. Laporan */}
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="w-full flex flex-col items-center justify-center gap-0.5 py-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px]">Laporan</span>
          </button>
        </nav>
      </div>

      {/* ========================================================
          2. TAMPILAN DESKTOP & TABLET (hidden md:block)
          Command Center 12-Kolom Padat Informasi, NO WHITESPACE MELAR!
         ======================================================== */}
      <main className="hidden md:block flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-4">
        {/* Unified Top Command Bar (Space-Efficient & Zero Clipping) */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Left: Active Location & Weather Parameters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-emerald-950 shadow-xs">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Wilayah Aktif: <strong className="text-emerald-900">{selectedCity.name}</strong> ({selectedCity.province})</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-rose-500" /> {airData?.weather.temp ?? 28}°C</span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-sky-500" /> {airData?.weather.humidity ?? 65}%</span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-slate-500" /> {airData?.weather.windSpeedKmh ?? 12} km/j</span>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  fetchLiveAirAndWeather(selectedCity).then((data) => {
                    setAirData(data);
                    setIsLoading(false);
                  });
                }}
                title="Perbarui Data Langsung"
                className="p-1 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer ml-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="hidden xl:block text-[11px] text-slate-400 font-medium">
              Update: <strong className="text-slate-700">{airData?.lastUpdated ?? '14:00 WIB'}</strong> · {airData?.source ?? 'Copernicus CAMS & OpenWeather'}
            </div>
          </div>

          {/* Right: Instant KPI Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span className="font-black text-rose-950">{NATIONWIDE_HOTSPOTS.length} Titik Api</span>
              <span className="text-[9px] font-mono font-bold text-rose-700 bg-rose-100 px-1 py-0.2 rounded">VIIRS</span>
            </div>
            <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-xl">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-black text-sky-950">{VERIFIED_EMERGENCY_FACILITIES.length} Faskes Paru</span>
              <span className="text-[9px] font-mono font-bold text-sky-700 bg-sky-100 px-1 py-0.2 rounded">Siaga 24J</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-emerald-950">100% Oksigen Siaga</span>
            </div>
            <div className="hidden xl:flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
              <Radio className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-bold text-amber-950">Level 4 Waspada Gambut</span>
            </div>
          </div>
        </div>

        {/* Interactive Provincial Hotspot Cities Ribbon (Substitutes old dropdown) */}
        <ProvinceCitySelector
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          isCompactMobile={false}
        />

        {/* TAB 1: BERANDA COMMAND CENTER */}
        {activeTab === 'beranda' && (
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* KOLOM KIRI (4 Kolom): Status AQI + Polutan + Panduan Cepat + Faskes */}
            <div className="col-span-12 lg:col-span-4 space-y-5">
              {/* 1. AQI Radial Summary Card */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${categoryHex} 0%, #0F172A 140%)`,
                }}
                className="rounded-3xl p-6 text-white shadow-md relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                    Indeks Kualitas Udara Real-Time
                  </span>
                  <span className="text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded-full border border-white/20">
                    AQI US
                  </span>
                </div>

                <div className="flex items-center gap-5 my-4">
                  <div
                    style={{
                      borderColor: categoryHex,
                      boxShadow: `0 0 25px ${categoryHex}80`,
                    }}
                    className="w-24 h-24 rounded-full border-4 bg-white/10 backdrop-blur-md flex flex-col items-center justify-center shrink-0"
                  >
                    <span className="text-3xl font-black font-display">{currentAqi}</span>
                    <span className="text-[9px] font-bold uppercase opacity-80">US AQI</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-amber-300 font-display leading-tight">
                      {currentCategory} ({airData?.categoryIndonesian ?? 'Sedang'})
                    </h3>
                    <p className="text-xs text-emerald-50 leading-snug mt-1">
                      {airData?.description ?? 'Udara Sedang. Kelompok sensitif harap kurangi aktivitas luar ruangan.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Current Conditions Polutan Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-900 mb-3 flex items-center justify-between">
                  <span>Konsentrasi Partikulat Udara</span>
                  <span className="text-[10px] text-slate-400 font-mono">Standar Permen LHK 14/2020</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-500">PM2.5</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">{airData?.components.pm2_5 ?? 20.3}</div>
                    <div className="text-[9px] text-emerald-700">µg/m³</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-500">PM10</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">{airData?.components.pm10 ?? 32.1}</div>
                    <div className="text-[9px] text-emerald-700">µg/m³</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-500">O3</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">{airData?.components.o3 ?? 38.0}</div>
                    <div className="text-[9px] text-emerald-700">µg/m³</div>
                  </div>
                </div>
              </div>

              {/* 3. Protective Guidance Quick Links */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                <div className="text-xs font-bold text-slate-900">Protective Guidance Quick Links</div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setGuidanceModal('masker')}
                    className="w-full p-2.5 bg-[#E8F5E9] hover:bg-[#C8E6C9] rounded-xl flex items-center gap-3 text-left transition-colors cursor-pointer border border-emerald-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-900 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-emerald-950">Gunakan Masker N95 / KN95</div>
                      <div className="text-[10px] text-emerald-700">Cek uji kerapatan fit-check & filtrasi &gt;95%</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuidanceModal('jendela')}
                    className="w-full p-2.5 bg-[#E0F2FE] hover:bg-[#BAE6FD] rounded-xl flex items-center gap-3 text-left transition-colors cursor-pointer border border-sky-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-200 text-sky-900 flex items-center justify-center shrink-0">
                      <DoorClosed className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-sky-950">Tutup Jendela & Segel Ruang</div>
                      <div className="text-[10px] text-sky-700">Protokol Clean Air Room bebas infiltrasi asap</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-sky-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setGuidanceModal('gejala')}
                    className="w-full p-2.5 bg-[#FEF3C7] hover:bg-[#FDE68A] rounded-xl flex items-center gap-3 text-left transition-colors cursor-pointer border border-amber-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-amber-950">Waspada Gejala Sesak Napas</div>
                      <div className="text-[10px] text-amber-700">Pertolongan pertama & rujukan posko oksigen</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-600" />
                  </button>
                </div>
              </div>

              {/* 4. Verified Hospitals & Direct Map Focus Box */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Fasilitas Kesehatan Terdekat</span>
                  <span className="text-[10px] font-bold text-rose-600">Terdaftar</span>
                </div>
                <div className="space-y-2 text-xs">
                  {displayFacilities.slice(0, 3).map((fac) => (
                    <div key={fac.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{fac.name}</div>
                          <div className="text-[10px] text-slate-500">{fac.address}</div>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                          Siaga 24 Jam
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => handleFocusFacility(fac.id)}
                          className="flex-1 py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Navigation className="w-3 h-3 text-sky-600" />
                          <span>Tunjukkan di Peta</span>
                        </button>
                        <a
                          href={`tel:${fac.phone.replace(/[^0-9]/g, '')}`}
                          className="py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 hover:bg-slate-100 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>Panggil</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KOLOM KANAN (8 Kolom): Peta MapLibre GL Se-Indonesia + Alerts + Rincian */}
            <div className="col-span-12 lg:col-span-8 space-y-5">
              {/* Map Studio Container */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display font-black text-base text-slate-900 flex items-center gap-2">
                      <MapIcon className="w-4 h-4 text-emerald-600" />
                      Peta Interaktif Sebaran Karhutla Se-Indonesia (Google & NASA VIIRS)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ganti provider citra satelit (Google Hybrid, Google Jalan, Topografi, Carto Dark) dan klik marker untuk rute navigasi.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReportOpen(true)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      Lapor Titik Asap
                    </button>
                  </div>
                </div>

                {/* The MapLibre GL Canvas */}
                <MapLibreView
                  city={selectedCity}
                  aqi={currentAqi}
                  categoryHex={categoryHex}
                  isCompact={false}
                  selectedFacilityId={selectedFacilityId}
                />
              </div>

              {/* Bottom Strip: Alerts List & Affected Districts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Air Quality Alerts Terkini</span>
                    <span className="text-[10px] text-rose-600 font-bold">2 Peringatan Aktif</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
                      <div className="font-bold text-rose-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        Peringatan: Polusi Tinggi di Sektor Timur
                      </div>
                      <div className="text-[11px] text-rose-800 mt-1">
                        Partikulat PM2.5 meningkat akibat arah angin dari perbatasan lahan gambut.
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Kualitas Udara Memburuk: Area Pemukiman
                      </div>
                      <div className="text-[11px] text-amber-800 mt-1">
                        Warga rentan (anak & lansia) disarankan membatasi durasi keluar rumah maksimal 20 menit.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Daftar Fasilitas Siaga Bencana Terdaftar</span>
                    <span className="text-[10px] text-emerald-700 font-bold">Terverifikasi Kemenkes/Polri</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {displayFacilities.slice(0, 3).map((f) => (
                      <div key={f.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{f.name}</div>
                          <div className="text-[10px] text-slate-500">{f.city}, {f.province}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleFocusFacility(f.id)}
                            className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Peta
                          </button>
                          <a
                            href={`tel:${f.phone.replace(/[^0-9]/g, '')}`}
                            className="text-xs font-bold text-emerald-700 hover:underline"
                          >
                            {f.phone.split('/')[0]}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PETA SEBARAN & DIREKTORI SPASIAL LENGKAP (Desain Khusus Desktop & Tablet) */}
        {activeTab === 'peta' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display font-black text-xl text-slate-900 flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-emerald-600" />
                    Peta Spasial Sebaran Karhutla Indonesia (Google Maps & NASA VIIRS)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Eksplorasi satelit interaktif dengan provider Google Satelit Hybrid, Google Roads, Topografi, dan Carto Dark. Klik marker manapun untuk inspeksi instan.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Lapor Titik Api Baru
                  </button>
                </div>
              </div>

              {/* Large Desktop Map View */}
              <MapLibreView
                city={selectedCity}
                aqi={currentAqi}
                categoryHex={categoryHex}
                isCompact={false}
                selectedFacilityId={selectedFacilityId}
              />
            </div>

            {/* DIREKTORI SPASIAL TERSTRUKTUR (HOTSPOTS & HOSPITALS) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                {/* Switcher Tab */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectoryTab('hotspots')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      directoryTab === 'hotspots'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                    <span>Daftar Titik Api Satelit ({filteredHotspots.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDirectoryTab('facilities')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      directoryTab === 'facilities'
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Daftar RSUD & Posko Siaga ({filteredFacilities.length})</span>
                  </button>
                </div>

                {/* Filter Provinsi Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-semibold">Filter Provinsi:</span>
                  <select
                    value={directoryProvinceFilter}
                    onChange={(e) => setDirectoryProvinceFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {uniqueProvinces.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data Table / Cards Grid */}
              {directoryTab === 'hotspots' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredHotspots.map((hs) => (
                    <div
                      key={hs.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-rose-300 bg-slate-50/70 hover:bg-rose-50/30 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                          <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                            {hs.satellite}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-600">
                          {hs.confidence}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">{hs.locationName}</h4>
                        <div className="text-xs text-slate-500">{hs.province} · {hs.peatlandType}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded-xl border border-slate-200/80">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Radiasi (FRP)</span>
                          <strong className="text-rose-600 font-mono">{hs.frpMw} MW</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Suhu Kecerahan</span>
                          <strong className="text-slate-800 font-mono">{hs.brightnessKelvin} K</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                            // Trigger zoom
                            const mapEl = document.querySelector('canvas');
                            if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Fokus di Peta</span>
                        </button>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${hs.coordinates[1]},${hs.coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-700 cursor-pointer"
                          title="Buka Koordinat di Google Maps"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredFacilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 bg-slate-50/70 hover:bg-sky-50/30 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            fac.type === 'hospital'
                              ? 'bg-sky-100 text-sky-800'
                              : fac.type === 'fire_station'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {fac.type === 'hospital' ? 'RSUD Rujukan Paru' : fac.type === 'fire_station' ? 'Satgas BPBD/Agni' : 'Polsek 110'}
                        </span>
                        {fac.bedCapacity && (
                          <span className="text-[10px] font-mono text-slate-600 font-bold">
                            {fac.bedCapacity} TT Bed
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">{fac.name}</h4>
                        <div className="text-xs text-slate-500 truncate">{fac.address}</div>
                      </div>

                      {fac.oxygenSupplyStatus && (
                        <div className="text-[10px] bg-white p-1.5 rounded-lg border border-slate-200 text-emerald-700 font-semibold flex items-center justify-between">
                          <span>Ketersediaan Oksigen:</span>
                          <strong className="text-emerald-800">{fac.oxygenSupplyStatus}</strong>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleFocusFacility(fac.id);
                            const mapEl = document.querySelector('canvas');
                            if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className="flex-1 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Tunjukkan di Peta</span>
                        </button>
                        <a
                          href={`tel:${fac.phone.replace(/[^0-9]/g, '')}`}
                          className="py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-900 font-bold text-xs flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Panggil</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PANDUAN & CHECKLIST */}
        {activeTab === 'panduan' && (
          <div className="space-y-6">
            <ProtectionGuideSection />
            <div className="mt-8 border-t border-slate-200 pt-6">
              <HealthRiskCalculator
                region={matchingRegion}
                snapshot={hourlySnapshot}
              />
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          GLOBAL FOOTER (ATRIBUSI RESMI LOMBA) — KHUSUS DESKTOP (hidden md:block)
         ======================================================== */}
      <footer className="hidden md:block bg-white border-t border-slate-200 py-6 px-6 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-900">SIAGA ASAP</span> · Platform Pemantau Kualitas Udara & Perlindungan Karhutla Nasional
            <p className="text-slate-500 text-[11px] mt-0.5">
              Standar Permen LHK No. 14 Tahun 2020 · Data Cuaca & Polutan Live Copernicus CAMS & OpenWeather API · Peta Citra Satelit Google Hybrid & NASA VIIRS
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAttributionOpen(true)}
            className="text-emerald-700 hover:text-emerald-900 font-bold underline underline-offset-4 cursor-pointer"
          >
            Lihat Sumber Data & Atribusi Aset Resmi
          </button>
        </div>
      </footer>

      {/* ========================================================
          INTERACTIVE MODALS
         ======================================================== */}
      <QuickGuidanceModal
        type={guidanceModal}
        onClose={() => setGuidanceModal(null)}
        aqi={currentAqi}
      />

      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        cityName={selectedCity.name}
        coords={{ lat: selectedCity.lat, lon: selectedCity.lon }}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        cityName={selectedCity.name}
      />

      <AttributionAndEmergencyModal
        isOpen={isAttributionOpen}
        onClose={() => setIsAttributionOpen(false)}
        onOpenModal={() => setIsAttributionOpen(true)}
      />
    </div>
  );
}
