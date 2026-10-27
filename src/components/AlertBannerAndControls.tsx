import { AlertTriangle, MapPin, Clock, ShieldAlert } from 'lucide-react';
import { RegionMonitoringData, ComputedHourlySnapshot } from '../types/karhutla';

interface AlertBannerAndControlsProps {
  regions: RegionMonitoringData[];
  selectedRegion: RegionMonitoringData;
  onSelectRegion: (regionId: string) => void;
  hourlySnapshot: ComputedHourlySnapshot;
  onJumpToProtection: () => void;
  onJumpToMap: () => void;
}

export function AlertBannerAndControls({
  regions,
  selectedRegion,
  onSelectRegion,
  hourlySnapshot,
  onJumpToProtection,
  onJumpToMap,
}: AlertBannerAndControlsProps) {
  const { categoryMeta, ispuScore, pm25, visibilityMeters, hourFormatted } = hourlySnapshot;

  const isCritical = ispuScore >= 201;

  return (
    <section id="top" className="border-b border-slate-200 bg-white">
      {/* Peringatan Kualitas Udara Dini */}
      <div
        role="region"
        aria-label="Peringatan Dini Kualitas Udara"
        className={`px-6 py-3.5 border-b transition-colors ${
          isCritical
            ? 'bg-rose-950 text-white border-rose-900'
            : ispuScore >= 101
            ? 'bg-amber-950 text-white border-amber-900'
            : 'bg-slate-900 text-white border-slate-800'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <span className="font-semibold">
                Peringatan Kualitas Udara · {selectedRegion.cityName} ({categoryMeta.category} — ISPU{' '}
                <span className="font-mono-tabular font-bold">{ispuScore}</span>):
              </span>{' '}
              <span className="text-slate-200">{selectedRegion.alertHeadline}.</span>{' '}
              <span className="text-slate-300 font-mono-tabular">
                PM2.5: {pm25} µg/m³ · Jarak Pandang: {visibilityMeters} m
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onJumpToMap}
              className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Pantau Peta Asap
            </button>
            <button
              type="button"
              onClick={onJumpToProtection}
              className="px-3 py-1.5 text-xs font-semibold text-white border border-white/30 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Protokol Perlindungan
            </button>
          </div>
        </div>
      </div>

      {/* Bar Kontrol Wilayah Pantau & Ringkasan Konteks */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-slate-500">
              Sistem Informasi Kesiapsiagaan Karhutla & Kesehatan Masyarakat · Permen LHK No. 14/2020
            </p>
            <h1
              className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Pantau Kualitas Udara, Sebaran Kabut Asap, dan Perlindungan Diri Warga
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {selectedRegion.alertDetail}
            </p>
          </div>

          {/* Kontrol Pemilihan Wilayah */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 shrink-0">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="region-select"
                className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                Wilayah Pantau Karhutla
              </label>
              <select
                id="region-select"
                value={selectedRegion.id}
                onChange={(e) => onSelectRegion(e.target.value)}
                className="px-3.5 py-2 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg hover:border-slate-400 focus:outline-2 focus:outline-sky-600 cursor-pointer min-w-[250px]"
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.cityName} — {region.province} (ISPU Dasar {region.baseIspu})
                  </option>
                ))}
              </select>
            </div>

            <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
              <div className="text-xs">
                <div className="text-slate-500">Jam Simulasi Aktif</div>
                <div className="font-mono-tabular font-bold text-slate-900">{hourFormatted}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Cepat Wilayah Rawan */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Pilih Cepat Kota Rawan Karhutla">
            <span className="text-xs font-medium text-slate-500 mr-2">Pilih Cepat Wilayah:</span>
            {regions.map((reg) => {
              const isSelected = reg.id === selectedRegion.id;
              return (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => onSelectRegion(reg.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {reg.cityName} · <span className="font-mono-tabular">{reg.baseIspu}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
            <span>{selectedRegion.stationName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{selectedRegion.coordinatesLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
