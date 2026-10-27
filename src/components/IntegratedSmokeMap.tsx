import { useState, useEffect } from 'react';
import {
  Layers,
  Flame,
  Wind,
  Play,
  Pause,
  RotateCcw,
  Users,
  Building2,
  Phone,
  Eye,
  Compass,
} from 'lucide-react';
import {
  RegionMonitoringData,
  ComputedHourlySnapshot,
  ComputedHourlyDistrict,
  HotspotPoint,
} from '../types/karhutla';

interface IntegratedSmokeMapProps {
  region: RegionMonitoringData;
  snapshot: ComputedHourlySnapshot;
  selectedHour: number;
  onChangeHour: (hour: number) => void;
}

export function IntegratedSmokeMap({
  region,
  snapshot,
  selectedHour,
  onChangeHour,
}: IntegratedSmokeMapProps) {
  const [showSmokeLayer, setShowSmokeLayer] = useState(true);
  const [showDistrictLayer, setShowDistrictLayer] = useState(true);
  const [showHotspotLayer, setShowHotspotLayer] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(
    region.districts[0]?.id ?? ''
  );
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotPoint | null>(null);

  // Sync selected district when region changes
  useEffect(() => {
    if (region.districts.length > 0) {
      setSelectedDistrictId(region.districts[0].id);
      setSelectedHotspot(null);
    }
  }, [region.id]);

  // Handle hourly simulation playback
  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      onChangeHour((selectedHour + 1) % 24);
    }, 1100);
    return () => window.clearInterval(interval);
  }, [isPlaying, selectedHour, onChangeHour]);

  const activeDistrict: ComputedHourlyDistrict =
    snapshot.districts.find((d) => d.id === selectedDistrictId) ?? snapshot.districts[0];

  const totalAffectedPopulation = snapshot.districts.reduce(
    (acc, d) => acc + d.affectedPopulation,
    0
  );
  const totalVulnerablePopulation = snapshot.districts.reduce(
    (acc, d) => acc + d.vulnerableCount,
    0
  );

  return (
    <section
      id="peta-sebaran"
      aria-labelledby="heading-peta-terpadu"
      className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-200"
    >
      {/* Header Seksi & Toggle Layer Terpadu */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <h2
            id="heading-peta-terpadu"
            className="font-display text-xl font-bold text-slate-900"
          >
            02. Peta Terpadu Sebaran Asap & Penyebaran Daerah Terdampak
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Visualisasi geospasial radius kepulan kabut asap gambut, titik panas satelit, dan tingkat keparahan ISPU per kecamatan di{' '}
            <span className="font-semibold text-slate-900">{region.cityName}</span>.
          </p>
        </div>

        {/* Kontrol Toggle Layer Peta */}
        <div
          className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200 shrink-0"
          role="group"
          aria-label="Kontrol Layer Peta Terpadu"
        >
          <span className="text-xs font-semibold text-slate-600 px-2 flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            Layer Peta:
          </span>
          <button
            type="button"
            onClick={() => setShowSmokeLayer((prev) => !prev)}
            aria-pressed={showSmokeLayer}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showSmokeLayer
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            Sebaran Asap ({showSmokeLayer ? 'Aktif' : 'Off'})
          </button>
          <button
            type="button"
            onClick={() => setShowDistrictLayer((prev) => !prev)}
            aria-pressed={showDistrictLayer}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showDistrictLayer
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            Daerah Terdampak ({showDistrictLayer ? 'Aktif' : 'Off'})
          </button>
          <button
            type="button"
            onClick={() => setShowHotspotLayer((prev) => !prev)}
            aria-pressed={showHotspotLayer}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showHotspotLayer
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            Titik Panas ({region.hotspots.length})
          </button>
        </div>
      </div>

      {/* Layout Utama Peta: Kanvas Peta Spasial + Panel Inspeksi Daerah Terdampak */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kolom Kiri (8 col): Kanvas Peta Interaktif + Slider Simulasi Per Jam */}
        <div className="lg:col-span-8 bg-[#0F172A] text-white border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
          {/* Bar Info Spasial Atas */}
          <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">
                Sektor Spasial: {region.cityName} ({region.island})
              </span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className="text-slate-300 font-mono-tabular">
                Skala Radius Asap: {(snapshot.smokeRadiusScale * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-300 font-mono-tabular">
              <span className="flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                Angin: { region.windDirection } ({snapshot.windSpeedKmh} km/j)
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                Visibilitas: {snapshot.visibilityMeters} m
              </span>
            </div>
          </div>

          {/* Kanvas Peta SVG Geospasial */}
          <div className="relative w-full aspect-[16/10] bg-[#0B1120] overflow-hidden select-none">
            <svg
              viewBox="0 0 800 480"
              className="w-full h-full object-cover"
              role="img"
              aria-label={`Peta interaktif sebaran kabut asap dan daerah terdampak di ${region.cityName}`}
              data-testid="integrated-smoke-map-svg"
            >
              <defs>
                {/* Grid Geospasial */}
                <pattern
                  id="geo-grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.08)"
                    strokeWidth="1"
                  />
                </pattern>

                {/* Radial Gradient Kabut Asap Utama */}
                <radialGradient id="smoke-plume-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.78" />
                  <stop offset="45%" stopColor="#CBD5E1" stopOpacity="0.48" />
                  <stop offset="80%" stopColor="#F59E0B" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                </radialGradient>

                {/* Radial Gradient Inti Asap Pekat */}
                <radialGradient id="smoke-core-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.55" />
                  <stop offset="55%" stopColor="#F97316" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Latar Grid & Kontur Sungai/Topografi */}
              <rect width="800" height="480" fill="url(#geo-grid)" />

              {/* Kontur Aliran Sungai & Garis Wilayah Dasar */}
              <path
                d="M 80,20 C 160,120 210,180 280,260 C 350,340 410,390 490,470"
                fill="none"
                stroke="rgba(56, 189, 248, 0.18)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 520,10 C 490,110 530,210 610,300 C 660,360 720,410 780,460"
                fill="none"
                stroke="rgba(56, 189, 248, 0.14)"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Vektor Arah Angin Latar */}
              <g opacity="0.28">
                {[120, 260, 400, 540, 680].map((vx) =>
                  [90, 240, 390].map((vy) => (
                    <g
                      key={`wind-${vx}-${vy}`}
                      transform={`translate(${vx}, ${vy}) rotate(${region.windAngleDeg})`}
                    >
                      <line
                        x1="-18"
                        y1="0"
                        x2="18"
                        y2="0"
                        stroke="#38BDF8"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                      <polygon points="18,-3 25,0 18,3" fill="#38BDF8" />
                    </g>
                  ))
                )}
              </g>

              {/* LAYER 1: PETA PENYEBARAN DAERAH TERDAMPAK (Poligon Kecamatan) */}
              {showDistrictLayer &&
                snapshot.districts.map((dist) => {
                  const isSelected = dist.id === activeDistrict?.id;
                  const fillColor = dist.currentCategory.hexColor;
                  return (
                    <g
                      key={dist.id}
                      onClick={() => {
                        setSelectedDistrictId(dist.id);
                        setSelectedHotspot(null);
                      }}
                      className="cursor-pointer"
                    >
                      <polygon
                        points={dist.polygonPoints}
                        fill={fillColor}
                        fillOpacity={isSelected ? 0.48 : 0.28}
                        stroke={isSelected ? '#FFFFFF' : fillColor}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        strokeDasharray={isSelected ? 'none' : '4 2'}
                      />
                      <text
                        x={(dist.x / 100) * 800}
                        y={(dist.y / 100) * 480 - 6}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="12"
                        fontWeight="700"
                        className="pointer-events-none"
                      >
                        {dist.name}
                      </text>
                      <text
                        x={(dist.x / 100) * 800}
                        y={(dist.y / 100) * 480 + 11}
                        textAnchor="middle"
                        fill="#E2E8F0"
                        fontSize="11"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="600"
                        className="pointer-events-none"
                      >
                        ISPU {dist.currentIspu} · {(dist.affectedPopulation / 1000).toFixed(1)}rb jiwa
                      </text>
                    </g>
                  );
                })}

              {/* LAYER 2: PETA SEBARAN KABUT ASAP (Elips Kepulan Dinamis Sesuai Jam) */}
              {showSmokeLayer &&
                region.smokePlumes.map((plume) => {
                  const scaledRx = Math.round(plume.rx * snapshot.smokeRadiusScale);
                  const scaledRy = Math.round(plume.ry * snapshot.smokeRadiusScale);
                  const opacity = Math.min(
                    0.95,
                    Number((plume.coreDensity * snapshot.multiplier).toFixed(2))
                  );
                  return (
                    <g
                      key={plume.id}
                      transform={`translate(${plume.cx}, ${plume.cy}) rotate(${plume.rotationDeg})`}
                      opacity={opacity}
                      className="pointer-events-none"
                    >
                      {/* Outer Dispersion Halo */}
                      <ellipse
                        cx="0"
                        cy="0"
                        rx={scaledRx * 1.22}
                        ry={scaledRy * 1.22}
                        fill="url(#smoke-plume-grad)"
                      />
                      {/* Primary Smoke Plume */}
                      <ellipse
                        cx="-22"
                        cy="-10"
                        rx={scaledRx}
                        ry={scaledRy}
                        fill="url(#smoke-plume-grad)"
                      />
                      {/* Dense Core Plume */}
                      <ellipse
                        cx="18"
                        cy="8"
                        rx={scaledRx * 0.6}
                        ry={scaledRy * 0.6}
                        fill="url(#smoke-core-grad)"
                      />
                      <ellipse
                        cx="0"
                        cy="0"
                        rx={scaledRx}
                        ry={scaledRy}
                        fill="none"
                        stroke="rgba(226, 232, 240, 0.35)"
                        strokeWidth="1"
                        strokeDasharray="6 4"
                      />
                    </g>
                  );
                })}

              {/* LAYER 3: TITIK PANAS / HOTSPOT SATELIT */}
              {showHotspotLayer &&
                region.hotspots.map((hs) => {
                  const hx = (hs.x / 100) * 800;
                  const hy = (hs.y / 100) * 480;
                  const isHsSelected = selectedHotspot?.id === hs.id;
                  const fireRadiusPx = hs.fireRadiusKm * 4.5 * snapshot.smokeRadiusScale;

                  return (
                    <g
                      key={hs.id}
                      transform={`translate(${hx}, ${hy})`}
                      onClick={() => setSelectedHotspot(hs)}
                      className="cursor-pointer"
                    >
                      <circle
                        r={fireRadiusPx}
                        fill="rgba(239, 68, 68, 0.22)"
                        stroke="#EF4444"
                        strokeWidth="1.2"
                      />
                      <circle
                        r={isHsSelected ? 9 : 7}
                        fill="#DC2626"
                        stroke="#FEF08A"
                        strokeWidth={isHsSelected ? 3 : 2}
                      />
                      <text
                        x="0"
                        y="-13"
                        textAnchor="middle"
                        fill="#FEF08A"
                        fontSize="10"
                        fontWeight="700"
                      >
                        Hotspot ({hs.fireRadiusKm} km)
                      </text>
                    </g>
                  );
                })}
            </svg>

            {/* Kompas Arah Angin & Legenda Ringkas di Atas Peta */}
            <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-[11px] text-slate-200 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                Vektor Sebaran Asap: {region.windDirection}
              </div>
              <div className="text-slate-400">
                Klik area kecamatan atau titik panas di peta untuk melihat detail dampak & posko.
              </div>
            </div>

            {/* Banner Info Titik Panas jika Hotspot Diklik */}
            {selectedHotspot && (
              <div className="absolute bottom-3 left-3 right-3 bg-rose-950/95 border border-rose-700 rounded-lg px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-amber-300">
                    Titik Panas: {selectedHotspot.label}
                  </span>{' '}
                  · Kepercayaan {selectedHotspot.confidence} · {selectedHotspot.peatlandDepth} ·{' '}
                  <span className="font-mono-tabular">{selectedHotspot.detectedTime}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHotspot(null)}
                  className="text-xs font-semibold underline text-rose-200 hover:text-white cursor-pointer"
                >
                  Tutup Info Hotspot
                </button>
              </div>
            )}
          </div>

          {/* Kontrol Interaktif: Slider Simulasi Perubahan Kepekatan Asap per Jam */}
          <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label
                  htmlFor="smoke-hour-slider"
                  className="text-xs font-bold text-white block"
                >
                  Simulator Pergerakan & Kepekatan Kabut Asap per Jam (Time-Lapse 24 Jam)
                </label>
                <p className="text-xs text-slate-400">
                  Geser waktu untuk melihat perubahan radius kabut asap, jarak pandang, dan status ISPU kecamatan.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPlaying((prev) => !prev)}
                  className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      Jeda Simulasi
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      Putar Time-Lapse
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    onChangeHour(14);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="Reset ke Jam Puncak Siang (14:00 WIB)"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  14:00 WIB
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono-tabular text-slate-400">00:00</span>
              <input
                id="smoke-hour-slider"
                type="range"
                min={0}
                max={23}
                step={1}
                value={selectedHour}
                onChange={(e) => {
                  setIsPlaying(false);
                  onChangeHour(Number(e.target.value));
                }}
                aria-label="Slider Simulasi Perubahan Kepekatan Asap per Jam"
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-xs font-mono-tabular text-slate-400">23:00</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 pt-1">
              <div>
                Waktu Terpilih:{' '}
                <span className="font-mono-tabular font-bold text-sky-400">
                  {snapshot.hourFormatted}
                </span>{' '}
                · ISPU Wilayah:{' '}
                <span className="font-mono-tabular font-bold text-white">
                  {snapshot.ispuScore} ({snapshot.categoryMeta.category})
                </span>
              </div>
              <div className="font-mono-tabular text-slate-400">
                Total Warga Terdampak: {totalAffectedPopulation.toLocaleString('id-ID')} Jiwa (Rentan: {totalVulnerablePopulation.toLocaleString('id-ID')} Jiwa)
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan (4 col): Daftar & Detail Daerah Terdampak + Posko Terdekat */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Penyebaran Daerah Terdampak
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih kecamatan untuk melihat populasi terdampak & lokasi posko kesehatan terdekat.
              </p>
            </div>

            {/* Pemilih Cepat Kecamatan Terdampak */}
            <div className="space-y-2" role="listbox" aria-label="Kecamatan Terdampak">
              {snapshot.districts.map((dist) => {
                const isSelected = dist.id === activeDistrict?.id;
                return (
                  <button
                    key={dist.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => setSelectedDistrictId(dist.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{dist.name}</div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        Terdampak: <span className="font-mono-tabular">{dist.affectedPopulation.toLocaleString('id-ID')}</span> jiwa · Visibilitas <span className="font-mono-tabular">{dist.currentVisibilityMeters}</span>m
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className="font-mono-tabular text-sm font-extrabold"
                        style={{
                          color: isSelected ? '#F8FAFC' : dist.currentCategory.hexColor,
                        }}
                      >
                        ISPU {dist.currentIspu}
                      </div>
                      <div
                        className={`text-[11px] font-medium ${
                          isSelected ? 'text-amber-300' : 'text-slate-600'
                        }`}
                      >
                        {dist.currentCategory.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Rincian Kecamatan Aktif */}
            {activeDistrict && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Detail Wilayah Terpilih
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: activeDistrict.currentCategory.hexColor }}
                  >
                    Status: {activeDistrict.currentCategory.category}
                  </span>
                </div>

                <div className="text-base font-bold text-slate-900">
                  {activeDistrict.name}
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-200 text-xs">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="text-slate-500">Populasi Terdampak</div>
                      <div className="font-mono-tabular font-bold text-slate-900">
                        {activeDistrict.affectedPopulation.toLocaleString('id-ID')} Jiwa
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono-tabular">
                        Kelompok Rentan: {activeDistrict.vulnerableCount.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Flame className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <div className="text-slate-500">ISPU & Jarak Pandang</div>
                      <div className="font-mono-tabular font-bold text-slate-900">
                        {activeDistrict.currentIspu} · {activeDistrict.currentVisibilityMeters} m
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Pembaruan {snapshot.hourFormatted}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posko Kesehatan & Rumah Singgah Terdekat */}
                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-sky-700 shrink-0" aria-hidden="true" />
                    Posko Oksigen & Evakuasi Terdekat
                  </div>
                  <div className="font-semibold text-slate-800">
                    {activeDistrict.nearestHealthPost.name}
                  </div>
                  <div className="text-slate-600">
                    {activeDistrict.nearestHealthPost.address} (Jarak{' '}
                    <span className="font-mono-tabular font-semibold">
                      {activeDistrict.nearestHealthPost.distanceKm} km
                    </span>
                    )
                  </div>
                  <div className="flex items-center justify-between pt-1 text-slate-700">
                    <span>
                      Stok Oksigen:{' '}
                      <strong className="text-slate-900">
                        {activeDistrict.nearestHealthPost.oxygenStockStatus}
                      </strong>
                    </span>
                    <span className="font-mono-tabular font-semibold flex items-center gap-1">
                      <Phone className="w-3 h-3" aria-hidden="true" />
                      {activeDistrict.nearestHealthPost.phone}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500">
            Data geospasial mengintegrasikan radius sebaran asap arah angin dengan batas pemukiman warga untuk memprioritaskan penyaluran masker N95 dan posko oksigen.
          </div>
        </div>
      </div>
    </section>
  );
}
