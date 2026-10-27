import { X, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export type GuidanceType = 'masker' | 'jendela' | 'gejala' | null;

interface QuickGuidanceModalProps {
  type: GuidanceType;
  onClose: () => void;
  aqi: number;
}

export function QuickGuidanceModal({ type, onClose, aqi }: QuickGuidanceModalProps) {
  if (!type) return null;

  const contentMap = {
    masker: {
      title: 'Panduan Penggunaan Masker & Respirator',
      color: 'bg-emerald-500',
      badge: 'Proteksi Saluran Napas',
      summary: `Pada tingkat AQI ${aqi}, partikel halus PM2.5 dapat menembus saluran bronkus paru-paru.`,
      rules: [
        'Gunakan Respirator N95 / KN95 / KF94 dengan kerapatan tepi masker menutup hidung dan dagu tanpa celah.',
        'Masker kain biasa dan masker bedah 3-ply kurang efektif menyaring partikulat mikro jelaga asap gambut.',
        'Ganti masker segera bila terasa lembap, kotor, atau hambatan napas meningkat.',
        'Untuk balita dan lansia, prioritaskan tetap di dalam ruangan daripada memaksakan masker N95 berlebihan.',
      ],
      action: 'Beli Masker Standar N95 / Kemenkes',
    },
    jendela: {
      title: 'Protokol Segel Jendela & Ruang Bersih (Clean Air Room)',
      color: 'bg-sky-500',
      badge: 'Proteksi Dalam Rumah',
      summary: 'Mencegah infiltrasi asap masuk ke dalam rumah menekan paparan PM2.5 hingga 75%.',
      rules: [
        'Tutup rapat seluruh jendela, pintu keluar, dan ventilasi atas menggunakan kain basah atau lakban busa.',
        'Pilih satu kamar tidur paling tertutup sebagai "Ruang Bersih Bebas Asap" untuk seluruh anggota keluarga.',
        'Nyalakan Air Purifier berfilter HEPA H13 secara kontinu, atau gunakan AC pada mode sirkulasi dalam (recirculate).',
        'Hindari menyalakan lilin, obat nyamuk bakar, menggoreng dengan asap banyak, atau merokok di dalam rumah.',
      ],
      action: 'Panduan Pasang Filter Mandiri (DIY)',
    },
    gejala: {
      title: 'Waspada Gejala Akut & Kedaruratan ISPA',
      color: 'bg-amber-500',
      badge: 'Pertolongan Pertama',
      summary: 'Kenali tanda bahaya iritasi asap sebelum berkembang menjadi infeksi paru serius.',
      rules: [
        'Gejala Ringan: Mata perih berair, hidung tersumbat, tenggorokan gatal. Bilas dengan air bersih/NaCl steril.',
        'Gejala Sedang: Batuk kering terus-menerus, pusing, nyeri dada saat menarik napas dalam.',
        'TANDA BAHAYA DARURAT: Sesak napas hebat, mengi/bunyi ngik-ngik, bibir kebiruan, atau napas >30x per menit.',
        'Bila penderita asma tidak merespons inhaler pereda (reliever) dalam 15 menit, segera evakuasi ke Posko 110/112/119.',
      ],
      action: 'Hubungi Posko Oksigen Terdekat (119)',
    },
  };

  const current = contentMap[type];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full ${current.color}`} />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {current.badge}
              </span>
              <h3 className="font-display font-extrabold text-slate-900 text-lg leading-snug">
                {current.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
            {current.summary}
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Langkah Perlindungan yang Harus Dilakukan:
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              {current.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500">
            Sumber: Kemenkes RI & PDPI
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
