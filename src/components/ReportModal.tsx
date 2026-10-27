import { useState } from 'react';
import { X, Send, Camera, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
}

export function ReportModal({ isOpen, onClose, cityName }: ReportModalProps) {
  const [district, setDistrict] = useState('');
  const [visibilityRange, setVisibilityRange] = useState('500m - 1000m');
  const [smellIntensity, setSmellIntensity] = useState('Pekat / Menyengat');
  const [hasFireSpotted, setHasFireSpotted] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Layanan Warga
            </span>
            <h3 className="font-display font-black text-lg text-slate-900">
              Lapor Kondisi Kabut Asap / Titik Api
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Laporan Anda Telah Terkirim!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Terima kasih telah berkontribusi memantau kondisi lapangan di wilayah {cityName}. Data diverifikasi oleh tim relawan posko.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Lokasi / Kecamatan di {cityName}
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Jl. Diponegoro, Kec. Barat"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-sky-600 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Jarak Pandang Lapangan
                </label>
                <select
                  value={visibilityRange}
                  onChange={(e) => setVisibilityRange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-sky-600 bg-slate-50"
                >
                  <option value="< 200m">&lt; 200 Meter (Sangat Pekat)</option>
                  <option value="200m - 500m">200 - 500 Meter</option>
                  <option value="500m - 1000m">500 - 1000 Meter</option>
                  <option value="> 1000m">&gt; 1000 Meter (Sedang)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Bau Asap Tercium
                </label>
                <select
                  value={smellIntensity}
                  onChange={(e) => setSmellIntensity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-sky-600 bg-slate-50"
                >
                  <option value="Sangat Pekat / Mata Pedih">Sangat Pekat / Pedih</option>
                  <option value="Pekat / Menyengat">Pekat / Menyengat</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Ringan">Ringan / Samar</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Terlihat kobaran / bara api aktif di dekat Anda?</span>
              </div>
              <input
                type="checkbox"
                checked={hasFireSpotted}
                onChange={(e) => setHasFireSpotted(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Keterangan Tambahan / Kondisi Warga
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Banyak anak-anak mulai batuk, asap tebal bertiup dari arah selatan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-sky-600 bg-slate-50"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Kirim Laporan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
