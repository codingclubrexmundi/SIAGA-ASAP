import { Wind, Eye, Thermometer, Droplets, Flame, ShieldCheck } from 'lucide-react';
import { RegionMonitoringData, ComputedHourlySnapshot } from '../types/karhutla';
import { ISPU_CATEGORIES, calculateHourlyReading } from '../utils/airQualityEngine';

interface IspuDashboardProps {
  region: RegionMonitoringData;
  snapshot: ComputedHourlySnapshot;
  selectedHour: number;
  onSelectHour: (hour: number) => void;
}

export function IspuDashboard({
  region,
  snapshot,
  selectedHour,
  onSelectHour,
}: IspuDashboardProps) {
  const {
    ispuScore,
    categoryMeta,
    pm25,
    pm10,
    co,
    o3,
    so2,
    visibilityMeters,
    windSpeedKmh,
    hourFormatted,
  } = snapshot;

  // Compute 24-hour trend readings for the interactive bar chart
  const hourlySeries = Array.from({ length: 24 }, (_, hr) =>
    calculateHourlyReading(region, hr)
  );

  // Calculate position on 0-400 scale bar
  const scalePercentage = Math.min(100, Math.max(2, Math.round((ispuScore / 400) * 100)));

  return (
    <section
      id="status-udara"
      aria-labelledby="heading-status-udara"
      className="max-w-7xl mx-auto px-6 py-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
        <div>
          <h2
            id="heading-status-udara"
            className="font-display text-xl font-bold text-slate-900"
          >
            01. Indeks Standar Pencemar Udara (ISPU) & Parameter Atmosfer
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Data pemantauan konsentrasi partikulat asap gambut dan kondisi meteorologi wilayah{' '}
            <span className="font-semibold text-slate-900">{region.cityName}</span> pada pukul{' '}
            <span className="font-mono-tabular font-semibold text-slate-900">{hourFormatted}</span>.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono-tabular whitespace-nowrap shrink-0">
          Ambang Aman PM2.5 WHO: 15 µg/m³ · Baku Mutu Nasional: 55 µg/m³
        </div>
      </div>

      {/* Grid Utama: Kartu Skor ISPU + Rincian Polutan & Cuaca */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kolom Kiri (5 col): Skor Utama ISPU & Rekomendasi Langsung */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs font-medium text-slate-500">
                  Indeks Kualitas Udara Terkini (ISPU)
                </div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {region.cityName}, {region.province}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Status Kategori</div>
                <div
                  className="text-sm font-bold"
                  style={{ color: categoryMeta.hexColor }}
                >
                  {categoryMeta.category}
                </div>
              </div>
            </div>

            {/* Angka Besar ISPU */}
            <div className="py-6 flex items-baseline justify-between gap-4">
              <div>
                <div
                  className="font-mono-tabular text-6xl font-extrabold tracking-tight"
                  style={{ color: categoryMeta.hexColor }}
                  data-testid="main-ispu-score"
                >
                  {ispuScore}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Polutan Kritis Dominan: <span className="font-semibold text-slate-800">PM2.5 ({pm25} µg/m³)</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-xs font-semibold text-slate-800">
                  {categoryMeta.shortWarning}
                </div>
                <div className="text-xs text-slate-500 font-mono-tabular">
                  Rentang Kategori: {categoryMeta.rangeLabel}
                </div>
                <div className="text-xs text-slate-500 font-mono-tabular">
                  Hotspot Terpantau: {region.hotspots.length} Titik
                </div>
              </div>
            </div>

            {/* Meter Bar Spektrum ISPU */}
            <div className="space-y-2 pb-5 border-b border-slate-200">
              <div className="flex justify-between text-[11px] font-mono-tabular text-slate-500">
                <span>0 (Baik)</span>
                <span>100 (Sedang)</span>
                <span>200 (Tidak Sehat)</span>
                <span>300+ (Berbahaya)</span>
              </div>
              <div className="relative h-3 w-full rounded-full overflow-hidden bg-slate-100 flex">
                <div className="w-[15%] bg-emerald-600 h-full" title="Baik (0-50)" />
                <div className="w-[15%] bg-sky-600 h-full" title="Sedang (51-100)" />
                <div className="w-[25%] bg-amber-500 h-full" title="Tidak Sehat (101-200)" />
                <div className="w-[25%] bg-red-600 h-full" title="Sangat Tidak Sehat (201-300)" />
                <div className="w-[20%] bg-rose-950 h-full" title="Berbahaya (>300)" />
              </div>
              <div className="relative h-4">
                <div
                  className="absolute -top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-150"
                  style={{ left: `${scalePercentage}%` }}
                >
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-slate-900" />
                  <span className="text-[10px] font-mono-tabular font-bold text-slate-900">
                    {ispuScore}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Instruksi Ringkas Masyarakat Umum & Rentan */}
          <div className="pt-4 space-y-3 text-xs leading-relaxed">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-semibold text-slate-900">Masyarakat Umum: </span>
                <span className="text-slate-600">{categoryMeta.publicGuidance}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-semibold text-slate-900">Kelompok Rentan (Anak, Lansia, Asma): </span>
                <span className="text-slate-600">{categoryMeta.vulnerableGuidance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan (7 col): Tabel Konsentrasi Polutan, Cuaca, & Grafik 24 Jam */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-6">
          {/* Konsentrasi 5 Parameter Polutan Kunci */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Konsentrasi Polutan Udara & Parameter Meteorologi
              </h3>
              <span className="text-xs text-slate-500">
                Pembaruan per Jam · Satuan µg/m³ & mg/m³
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 border border-slate-200 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-3">
                <div className="text-xs text-slate-500">Partikulat Halus (PM2.5)</div>
                <div className="font-mono-tabular text-lg font-bold text-slate-900 mt-1">
                  {pm25}
                </div>
                <div className="text-[11px] text-slate-500">µg/m³ · Asap Gambut</div>
              </div>
              <div className="p-3">
                <div className="text-xs text-slate-500">Partikulat Kasar (PM10)</div>
                <div className="font-mono-tabular text-lg font-bold text-slate-900 mt-1">
                  {pm10}
                </div>
                <div className="text-[11px] text-slate-500">µg/m³ · Debu Abu</div>
              </div>
              <div className="p-3">
                <div className="text-xs text-slate-500">Karbon Monoksida (CO)</div>
                <div className="font-mono-tabular text-lg font-bold text-slate-900 mt-1">
                  {co}
                </div>
                <div className="text-[11px] text-slate-500">mg/m³ · Pembakaran</div>
              </div>
              <div className="p-3">
                <div className="text-xs text-slate-500">Ozon Permukaan (O3)</div>
                <div className="font-mono-tabular text-lg font-bold text-slate-900 mt-1">
                  {o3}
                </div>
                <div className="text-[11px] text-slate-500">µg/m³ · Oksidan</div>
              </div>
              <div className="p-3 col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-500">Sulfur Dioksida (SO2)</div>
                <div className="font-mono-tabular text-lg font-bold text-slate-900 mt-1">
                  {so2}
                </div>
                <div className="text-[11px] text-slate-500">µg/m³ · Gas Asam</div>
              </div>
            </div>

            {/* Baris Parameter Cuaca & Jarak Pandang */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-slate-500">Jarak Pandang</div>
                  <div className="font-mono-tabular font-bold text-slate-900">
                    {visibilityMeters} Meter
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Wind className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-slate-500">Kecepatan & Arah Angin</div>
                  <div className="font-mono-tabular font-bold text-slate-900">
                    {windSpeedKmh} km/j · {region.windDirection.split(' ')[0]}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Thermometer className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-slate-500">Suhu Udara</div>
                  <div className="font-mono-tabular font-bold text-slate-900">
                    {region.temperatureC}°C
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Droplets className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-slate-500">Kelembapan Relatif</div>
                  <div className="font-mono-tabular font-bold text-slate-900">
                    {region.humidityPct}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grafik Tren ISPU 24 Jam (Klik bar untuk berpindah jam) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-900">
                Tren Perubahan ISPU 24 Jam (Klik batang jam untuk simulasi waktu)
              </span>
              <span className="text-xs font-mono-tabular text-slate-500">
                Puncak Sore: 15:00–17:00 WIB
              </span>
            </div>

            <div
              className="grid grid-cols-24 gap-1 items-end h-24 pt-2"
              role="group"
              aria-label="Grafik Tren ISPU 24 Jam"
            >
              {hourlySeries.map((item) => {
                const heightPct = Math.max(18, Math.min(100, Math.round((item.ispuScore / 400) * 100)));
                const isCurrent = item.hour === selectedHour;
                return (
                  <button
                    key={item.hour}
                    type="button"
                    onClick={() => onSelectHour(item.hour)}
                    aria-label={`Pilih Jam ${String(item.hour).padStart(2, '0')}:00 dengan ISPU ${item.ispuScore}`}
                    title={`${item.hourFormatted}: ISPU ${item.ispuScore} (${item.categoryMeta.category})`}
                    className={`group relative flex flex-col items-center justify-end h-full rounded-t transition-opacity cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-600 ${
                      isCurrent ? 'opacity-100 ring-2 ring-slate-900 ring-offset-1' : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div
                      className="w-full rounded-t transition-all duration-150"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: item.categoryMeta.hexColor,
                      }}
                    />
                    <span
                      className={`text-[9px] font-mono-tabular mt-1 ${
                        isCurrent ? 'font-bold text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {item.hour % 3 === 0 ? String(item.hour).padStart(2, '0') : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Referensi Skala Standar ISPU KLHK */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">Pedoman Kategori ISPU (Permen LHK 14/2020):</span>
        <div className="flex flex-wrap items-center gap-4">
          {ISPU_CATEGORIES.map((cat) => (
            <div key={cat.category} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-xs shrink-0"
                style={{ backgroundColor: cat.hexColor }}
                aria-hidden="true"
              />
              <span className="font-medium text-slate-700">{cat.category}</span>
              <span className="font-mono-tabular text-slate-500">({cat.rangeLabel})</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
