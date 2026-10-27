import { useState } from 'react';
import { ShieldAlert, CheckCircle2, Clock, UserCheck, AlertCircle } from 'lucide-react';
import {
  VulnerabilityGroup,
  ActivityIntensity,
  ComputedHourlySnapshot,
  RegionMonitoringData,
} from '../types/karhutla';
import { assessPersonalHealthRisk } from '../utils/airQualityEngine';

interface HealthRiskCalculatorProps {
  region: RegionMonitoringData;
  snapshot: ComputedHourlySnapshot;
}

const VULNERABILITY_OPTIONS: {
  id: VulnerabilityGroup;
  label: string;
  sublabel: string;
}[] = [
  {
    id: 'dewasa_sehat',
    label: 'Dewasa Sehat',
    sublabel: 'Tanpa riwayat gangguan pernapasan kronis',
  },
  {
    id: 'anak_lansia',
    label: 'Anak-Anak / Lansia (>60 Thn)',
    sublabel: 'Kapasitas paru & imunitas saluran napas rentan',
  },
  {
    id: 'ibu_hamil',
    label: 'Ibu Hamil',
    sublabel: 'Sensitif terhadap hipoksia & partikulat halus PM2.5',
  },
  {
    id: 'asma_ispa',
    label: 'Penderita Asma / ISPA / Jantung',
    sublabel: 'Risiko tinggi bronkospasme saat terpapar asap',
  },
  {
    id: 'pekerja_lapangan',
    label: 'Pekerja Luar Ruang / Relawan',
    sublabel: 'Paparan langsung di jalan raya atau lokasi terdampak',
  },
];

const SYMPTOM_OPTIONS: { id: string; label: string }[] = [
  { id: 'mata_perih', label: 'Mata Perih / Berair' },
  { id: 'batuk_kering', label: 'Batuk Kering / Tenggorokan Gatal' },
  { id: 'pilek_tersumbat', label: 'Hidung Tersumbat / Bersin' },
  { id: 'sesak_napas', label: 'Napas Terasa Berat / Mengi (Wheezing)' },
];

export function HealthRiskCalculator({
  region,
  snapshot,
}: HealthRiskCalculatorProps) {
  const [group, setGroup] = useState<VulnerabilityGroup>('dewasa_sehat');
  const [outdoorDurationHours, setOutdoorDurationHours] = useState<number>(2);
  const [activityIntensity, setActivityIntensity] = useState<ActivityIntensity>('sedang');
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const toggleSymptom = (symptomId: string) => {
    setSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((item) => item !== symptomId)
        : [...prev, symptomId]
    );
  };

  const assessment = assessPersonalHealthRisk(
    {
      group,
      outdoorDurationHours,
      activityIntensity,
      symptoms,
    },
    snapshot.ispuScore,
    snapshot.pm25
  );

  return (
    <section
      id="cek-risiko"
      aria-labelledby="heading-cek-risiko"
      className="max-w-7xl mx-auto px-6 py-8 border-t border-slate-200"
    >
      <div className="mb-6">
        <h2
          id="heading-cek-risiko"
          className="font-display text-xl font-bold text-slate-900"
        >
          03. Asesmen Mandiri Risiko Kesehatan & Rekomendasi Masker Personal
        </h2>
        <p className="text-sm text-slate-600 mt-0.5">
          Hitung tingkat risiko paparan kabut asap secara spesifik berdasarkan profil kerentanan, rencana durasi di luar ruangan, dan tingkat ISPU terkini di{' '}
          <span className="font-semibold text-slate-900">{region.cityName}</span> (ISPU{' '}
          <span className="font-mono-tabular font-semibold text-slate-900">
            {snapshot.ispuScore}
          </span>
          ).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Form Input Kiri (7 col) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          {/* 1. Kelompok Kerentanan */}
          <div>
            <label className="text-xs font-bold text-slate-900 block mb-2.5">
              1. Pilih Profil Kelompok Kesehatan Anda / Anggota Keluarga
            </label>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
              role="radiogroup"
              aria-label="Kelompok Kerentanan Kesehatan"
            >
              {VULNERABILITY_OPTIONS.map((opt) => {
                const isSelected = group === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setGroup(opt.id)}
                    className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div
                      className={`text-[11px] mt-0.5 ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {opt.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Durasi Rencana Aktivitas Luar Ruang & Intensitas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="duration-slider"
                  className="text-xs font-bold text-slate-900"
                >
                  2. Rencana Durasi di Luar Ruangan
                </label>
                <span className="font-mono-tabular text-xs font-bold text-sky-700">
                  {outdoorDurationHours} Jam / Hari
                </span>
              </div>
              <input
                id="duration-slider"
                type="range"
                min={0}
                max={8}
                step={0.5}
                value={outdoorDurationHours}
                onChange={(e) => setOutdoorDurationHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-[11px] font-mono-tabular text-slate-500 mt-1">
                <span>0 Jam (Di Rumah)</span>
                <span>4 Jam</span>
                <span>8 Jam+</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-2">
                3. Intensitas Aktivitas Fisik Luar Ruang
              </label>
              <div
                className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200"
                role="group"
                aria-label="Intensitas Aktivitas Fisik"
              >
                {(
                  [
                    { id: 'ringan', label: 'Ringan' },
                    { id: 'sedang', label: 'Sedang' },
                    { id: 'berat', label: 'Berat' },
                  ] as const
                ).map((item) => {
                  const active = activityIntensity === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivityIntensity(item.id)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Gejala yang Dirasakan Saat Ini */}
          <div className="pt-4 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-900 block mb-2.5">
              4. Gejala Kesehatan yang Sedang Dirasakan (Pilih bila ada)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SYMPTOM_OPTIONS.map((sym) => {
                const checked = symptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggleSymptom(sym.id)}
                    className={`p-2.5 rounded-lg border text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      checked
                        ? 'bg-rose-50 border-rose-300 text-rose-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{sym.label}</span>
                    <span className="font-mono-tabular text-[11px]">
                      {checked ? 'Terpilih' : 'Tidak'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel Hasil Rekomendasi Kanan (5 col) */}
        <div
          className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
          data-testid="health-assessment-result"
        >
          <div className="space-y-5">
            {/* Header Skor Risiko */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs font-medium text-slate-500">
                  Hasil Kalkulasi Risiko Personal
                </div>
                <div
                  className="text-2xl font-display font-extrabold mt-0.5"
                  style={{ color: assessment.riskColorHex }}
                >
                  Risiko {assessment.riskLevel}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Skor Paparan</div>
                <div
                  className="font-mono-tabular text-2xl font-extrabold"
                  style={{ color: assessment.riskColorHex }}
                >
                  {assessment.riskScore}/100
                </div>
              </div>
            </div>

            {/* Rekomendasi Masker & Batas Durasi Aman */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200 pb-4">
              <div className="pb-3 sm:pb-0 sm:pr-4">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                  Masker Pelindung Wajib
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  {assessment.recommendedMask}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {assessment.maskFiltrationSpec}
                </div>
              </div>

              <div className="pt-3 sm:pt-0 sm:pl-4">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                  Batas Paparan Luar Ruang
                </div>
                <div className="font-mono-tabular text-sm font-bold text-slate-900 mt-1">
                  {assessment.maxSafeOutdoorMinutes === 0
                    ? '0 Menit (Tetap di Dalam)'
                    : `Maksimal ${assessment.maxSafeOutdoorMinutes} Menit`}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Pada kondisi ISPU {snapshot.ispuScore} ({snapshot.pm25} µg/m³)
                </div>
              </div>
            </div>

            {/* Peringatan Medis Darurat bila Sesak Napas */}
            {assessment.requiresImmediateMedicalConsult && (
              <div className="p-3.5 bg-rose-950 text-white rounded-lg text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-bold">Rekomendasi Medis Segera: </span>
                  Anda melaporkan gejala pernapasan pada situasi udara buruk. Segera kunjungi Posko Oksigen terdekat ({region.districts[0]?.nearestHealthPost.name}) atau hubungi 119.
                </div>
              </div>
            )}

            {/* Langkah Tindakan Perlindungan Spesifik */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-slate-700" aria-hidden="true" />
                Protokol Perlindungan yang Direkomendasikan:
              </div>
              <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                {assessment.actionSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 text-[11px] text-slate-500">
            Kalkulasi mengacu pada pedoman perlindungan klinis Perhimpunan Dokter Paru Indonesia (PDPI) & Kemenkes RI terkait paparan partikulat halus PM2.5 karhutla.
          </div>
        </div>
      </div>
    </section>
  );
}
