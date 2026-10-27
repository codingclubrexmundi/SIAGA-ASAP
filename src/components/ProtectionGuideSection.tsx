import { useState, useEffect } from 'react';
import {
  Home,
  Shield,
  Stethoscope,
  CheckSquare,
  Square,
  RotateCcw,
  Printer,
  AlertTriangle,
  HeartPulse,
  DoorClosed,
  ShieldCheck,
  PhoneCall,
  Eye,
  Wind,
  CheckCircle2,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ProtectionPhase } from '../types/karhutla';
import { PROTECTION_GUIDES, READINESS_CHECKLIST } from '../data/karhutlaData';
import { calculateChecklistProgress } from '../utils/airQualityEngine';

const STORAGE_KEY_CHECKLIST = 'siaga_asap_checklist_v1';

export function ProtectionGuideSection() {
  const [activePhase, setActivePhase] = useState<ProtectionPhase>('dalam_ruang');
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_CHECKLIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return ['chk-1', 'chk-3'];
  });

  // Fit check interactive step
  const [fitCheckStep, setFitCheckStep] = useState<number>(1);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_CHECKLIST, JSON.stringify(completedIds));
    } catch {
      // Ignore storage error
    }
  }, [completedIds]);

  const toggleChecklistItem = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredGuides = PROTECTION_GUIDES.filter((g) => g.phase === activePhase);
  const progress = calculateChecklistProgress(READINESS_CHECKLIST, completedIds);

  const handlePrint = () => {
    window.print();
  };

  return (
    <section
      id="panduan-perlindungan"
      aria-labelledby="heading-panduan"
      className="max-w-7xl mx-auto space-y-6 font-sans text-slate-900"
    >
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
              Protokol Terstandar Kemenkes & BNPB
            </span>
            <span className="text-xs text-slate-300">Standar Permen LHK 14/2020</span>
          </div>
          <h2
            id="heading-panduan"
            className="text-2xl md:text-3xl font-black font-display tracking-tight text-white"
          >
            Panduan Perlindungan Diri & Ruang Bebas Asap (Clean Air Room)
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Instruksi praktis penyelamatan keluarga saat terjadi bencana kabut asap karhutla: isolasi sirkulasi rumah, uji kerapatan masker N95, serta pertolongan pertama serangan sesak napas akut.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh Lembar Darurat (PDF)</span>
          </button>
          <a
            href="tel:119"
            className="px-4 py-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Hotline Ambulans & ISPA: 119</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Phase Protocols & Household Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI (7 Kolom): Tiga Fase Perlindungan Terstruktur */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          {/* Phase Selector Tabs */}
          <div
            className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200"
            role="tablist"
            aria-label="Fase Perlindungan"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activePhase === 'dalam_ruang'}
              onClick={() => setActivePhase('dalam_ruang')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activePhase === 'dalam_ruang'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-400" />
              <span>1. Di Dalam Rumah</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activePhase === 'luar_ruang'}
              onClick={() => setActivePhase('luar_ruang')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activePhase === 'luar_ruang'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Shield className="w-4 h-4 text-sky-400" />
              <span>2. Luar Ruangan</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activePhase === 'pertolongan_pertama'}
              onClick={() => setActivePhase('pertolongan_pertama')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activePhase === 'pertolongan_pertama'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-rose-400" />
              <span>3. Tanggap Darurat ISPA</span>
            </button>
          </div>

          {/* Phase Detailed Protocol Steps */}
          <div className="space-y-4">
            {filteredGuides.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono text-xs font-black flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      {item.stepNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                        Target: {item.targetAudience}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                    Wajib
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-11">
                  {item.description}
                </p>

                <div className="ml-11 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-amber-950">Catatan Kritis Medis:</strong>
                    <span>{item.criticalNote}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Feature: Fit-Check Masker N95 Walkthrough (Jika di Tab Luar Ruangan) */}
          {activePhase === 'luar_ruang' && (
            <div className="p-5 bg-sky-50 border border-sky-200 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sky-700" />
                  <h4 className="text-xs font-black text-sky-950 uppercase tracking-wider">
                    Simulasi 4 Langkah Uji Kerapatan (Fit-Check) Masker N95
                  </h4>
                </div>
                <span className="text-[10px] font-bold bg-sky-200 text-sky-900 px-2 py-0.5 rounded-full">
                  Langkah {fitCheckStep} dari 4
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-sky-100 text-xs space-y-1.5">
                {fitCheckStep === 1 && (
                  <div>
                    <strong className="text-slate-900 block font-bold">1. Posisi Pasang Masker:</strong>
                    <span className="text-slate-600 leading-relaxed">
                      Posisikan mangkuk masker menutupi hidung, mulut, dan dagu. Tarik tali elastis bawah ke tengkuk leher, dan tali atas ke puncak kepala di atas telinga.
                    </span>
                  </div>
                )}
                {fitCheckStep === 2 && (
                  <div>
                    <strong className="text-slate-900 block font-bold">2. Penekanan Klip Hidung Logam:</strong>
                    <span className="text-slate-600 leading-relaxed">
                      Gunakan jari telunjuk dan tengah kedua tangan (jangan satu tangan) untuk menekan klip logam mengikuti lekukan tulang hidung Anda agar tidak ada celah udara.
                    </span>
                  </div>
                )}
                {fitCheckStep === 3 && (
                  <div>
                    <strong className="text-slate-900 block font-bold">3. Positive Pressure Check (Tes Tiup):</strong>
                    <span className="text-slate-600 leading-relaxed">
                      Tangkupkan kedua tangan di depan masker tanpa mengubah posisi, lalu hembuskan napas kuat. Pastikan tidak ada desiran udara bocor di area pangkal mata atau pipi.
                    </span>
                  </div>
                )}
                {fitCheckStep === 4 && (
                  <div>
                    <strong className="text-slate-900 block font-bold">4. Negative Pressure Check (Tes Hisap):</strong>
                    <span className="text-slate-600 leading-relaxed">
                      Tangkupkan tangan dan tarik napas dalam-dalam. Masker harus sedikit kempot/tertarik ke arah wajah tanpa ada udara luar yang menyusup dari pinggiran.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setFitCheckStep(step)}
                      className={`w-6 h-6 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        fitCheckStep === step
                          ? 'bg-sky-600 text-white'
                          : 'bg-white text-sky-800 hover:bg-sky-100'
                      }`}
                    >
                      {step}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFitCheckStep((prev) => (prev % 4) + 1)}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Lanjut ➔
                </button>
              </div>
            </div>
          )}

          {/* Interactive Feature: Clean Air Room Blueprint (Jika di Tab Dalam Ruang) */}
          {activePhase === 'dalam_ruang' && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <DoorClosed className="w-5 h-5 text-emerald-700" />
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                  Ciri-Ciri Ruang Bersih Asap (Clean Air Room) yang Efektif
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                  <strong className="text-emerald-950 block font-bold">Isolasi Ventilasi Fisik</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Tutup lubang angin bovenlicht dan bawah pintu dengan lakban busa atau kain handuk lembap.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                  <strong className="text-emerald-950 block font-bold">Filtrasi HEPA Berkelanjutan</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Nyalakan air purifier berfilter HEPA H13 atau DIY Box Fan berfilter MERV 13 sepanjang hari.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                  <strong className="text-emerald-950 block font-bold">AC Mode Internal Recirculate</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Pastikan kisi damper AC tidak mengambil udara luar, melainkan memutar udara dalam ruangan.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                  <strong className="text-emerald-950 block font-bold">Nol Polutan Domestik</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Larangan keras menyalakan rokok, lilin, obat nyamuk bakar, atau memasak deep frying di dekat kamar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Feature: Tanda Bahaya Sesak Napas (Jika di Tab Pertolongan Pertama) */}
          {activePhase === 'pertolongan_pertama' && (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-700" />
                <h4 className="text-xs font-black text-rose-950 uppercase tracking-wider">
                  Tanda Bahaya (Red Flags) Wajib Segera Evakuasi ke IGD / Posko Oksigen
                </h4>
              </div>
              <div className="space-y-2 text-xs text-rose-900">
                <div className="p-2.5 bg-white rounded-xl border border-rose-200 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span><strong>Sianosis:</strong> Bibir, lidah, atau ujung kuku tampak pucat atau kebiruan.</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-rose-200 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span><strong>Stridor / Mengi Berat:</strong> Napas berbunyi keras dan penderita sulit mengucapkan satu kalimat utuh.</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-rose-200 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span><strong>Hipoksia Oksimetri:</strong> Saturasi oksigen (SpO2) di bawah 93% pada pulse oximeter.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN (5 Kolom): Checklist Kesiapsiagaan Rumah Tangga (Local Storage) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Checklist Kesiapsiagaan Rumah Tangga
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tersimpan otomatis di memori lokal · Status:{' '}
                <strong className="text-emerald-700">{progress.statusLabel}</strong>
              </p>
            </div>
            <div className="text-right shrink-0">
              <div
                className="font-mono text-2xl font-black text-slate-900"
                data-testid="checklist-progress-pct"
              >
                {progress.percentage}%
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {progress.completedCount}/{progress.totalCount} Selesai
              </div>
            </div>
          </div>

          {/* Progress Bar Dinamis */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            {READINESS_CHECKLIST.map((item) => {
              const isDone = completedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-300 text-slate-900'
                      : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="flex-1">
                    <div className="text-xs font-bold leading-snug">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span className="font-semibold text-rose-700">Prioritas {item.priority}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Buttons: Tandai Semua & Reset */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCompletedIds(READINESS_CHECKLIST.map((i) => i.id))}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Tandai Semua Siap
            </button>
            <button
              type="button"
              onClick={() => setCompletedIds([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Checklist</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
