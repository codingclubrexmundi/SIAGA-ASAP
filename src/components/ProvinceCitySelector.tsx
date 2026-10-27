import { useState } from 'react';
import { Flame, MapPin, Check, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react';
import { CityLocation, SUPPORTED_CITIES } from '../services/weatherApi';

interface ProvinceCitySelectorProps {
  selectedCity: CityLocation;
  onSelectCity: (city: CityLocation) => void;
  isCompactMobile?: boolean;
}

export function ProvinceCitySelector({
  selectedCity,
  onSelectCity,
  isCompactMobile = false,
}: ProvinceCitySelectorProps) {
  const [activeProvinceFilter, setActiveProvinceFilter] = useState<string>('Semua');

  // Distinct list of provinces
  const provinces = [
    'Semua',
    'Kalimantan Tengah',
    'Riau',
    'Sumatera Selatan',
    'Jambi',
    'Kalimantan Barat',
    'Kalimantan Selatan',
    'Sulawesi Utara',
    'DKI Jakarta',
  ];

  const filteredCities = SUPPORTED_CITIES.filter((c) =>
    activeProvinceFilter === 'Semua' ? true : c.province === activeProvinceFilter
  );

  // If in compact mobile view (rendered inside curved mobile header)
  if (isCompactMobile) {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-white/90 text-xs px-1">
          <span className="font-bold flex items-center gap-1.5 shrink-0">
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
            <span className="tracking-tight">Pusat Titik Hotspot:</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-200 bg-black/35 px-2 py-0.5 rounded-full border border-white/10 shrink-0">
            {selectedCity.name}
          </span>
        </div>

        {/* Horizontal scrollable row of major city pills with fire icons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 -mx-5 px-5 scrollbar-none no-scrollbar">
          {SUPPORTED_CITIES.map((city) => {
            const isSelected = city.id === selectedCity.id;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => onSelectCity(city)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-md ring-2 ring-amber-300 font-extrabold'
                    : 'bg-black/30 text-white hover:bg-black/40 border border-white/20'
                }`}
              >
                {city.isKarhutlaProne ? (
                  <Flame
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-rose-600 fill-rose-600' : 'text-amber-300'
                    }`}
                  />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                )}
                <span>{city.name}</span>
                {city.hotspotCount > 0 && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isSelected
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-rose-950/80 text-amber-200 border border-rose-500/50'
                    }`}
                  >
                    <span>{city.hotspotCount}</span>
                    <Flame className="w-2.5 h-2.5 fill-current text-rose-500 shrink-0" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // DESKTOP & TABLET VIEW: Interactive Provincial City Selector Ribbon
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 font-sans">
      {/* Top Header & Province Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Pusat Kota Hotspot Karhutla per Provinsi
            </h3>
            <p className="text-[11px] text-slate-500">
              Klik kota besar untuk memuat data real-time ISPU, polutan partikulat, dan cuaca stasiun.
            </p>
          </div>
        </div>

        {/* Province Quick Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full text-xs">
          {provinces.map((prov) => (
            <button
              key={prov}
              type="button"
              onClick={() => setActiveProvinceFilter(prov)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer text-[11px] ${
                activeProvinceFilter === prov
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {prov === 'Semua' ? 'Semua Provinsi' : prov.replace('Kalimantan', 'Kal.').replace('Sumatera', 'Sum.')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Major Hotspot Cities */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {filteredCities.map((city) => {
          const isSelected = city.id === selectedCity.id;

          return (
            <button
              key={city.id}
              type="button"
              onClick={() => onSelectCity(city)}
              className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between gap-2 group ${
                isSelected
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-400/60 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {/* Header: Fire icon & Alert level badge */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  {city.isKarhutlaProne ? (
                    <div className="w-5 h-5 rounded-md bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Flame className="w-3 h-3 fill-amber-200 text-amber-200" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-md bg-slate-300 text-slate-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-3 h-3" />
                    </div>
                  )}
                  {city.hotspotCount > 0 && (
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                      {city.hotspotCount} Api
                    </span>
                  )}
                </div>

                {isSelected ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 ring-4 ring-emerald-200" />
                ) : (
                  <span className="text-[9px] text-slate-400 font-mono uppercase">
                    {city.island.slice(0, 3)}
                  </span>
                )}
              </div>

              {/* City Name & Province */}
              <div>
                <h4
                  className={`text-xs font-black leading-tight transition-colors ${
                    isSelected ? 'text-emerald-950' : 'text-slate-900 group-hover:text-slate-950'
                  }`}
                >
                  {city.name}
                </h4>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {city.province}
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[9px]">
                <span
                  className={`font-bold ${
                    city.alertLevel === 'Awas (Ekstrem)'
                      ? 'text-rose-600'
                      : city.alertLevel === 'Siaga Tinggi'
                      ? 'text-orange-600'
                      : city.alertLevel === 'Waspada'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {city.alertLevel}
                </span>
                {isSelected && (
                  <span className="text-[9px] font-bold text-emerald-700 font-sans inline-flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" />
                    <span>Aktif</span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
