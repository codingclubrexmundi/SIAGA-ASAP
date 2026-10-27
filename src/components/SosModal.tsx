import { Phone, ShieldAlert, X, AlertTriangle, MapPin, Copy, Check, Siren, Flame, Activity } from 'lucide-react';
import { useState } from 'react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  coords: { lat: number; lon: number };
}

export function SosModal({ isOpen, onClose, cityName, coords }: SosModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)} (${cityName})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-rose-100 flex flex-col">
        {/* Top Siren Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-white shadow-inner">
            <Siren className="w-8 h-8 animate-pulse" />
          </div>

          <h3 className="font-display font-black text-xl tracking-tight">
            PANGGILAN DARURAT & SALURAN SIAGA
          </h3>
          <p className="text-xs text-rose-100 mt-1">
            Wilayah {cityName} · Layanan Siaga 24 Jam Bebas Pulsa
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-950">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Koordinat Anda: <strong>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={copyCoordinates}
              className="px-2.5 py-1 rounded-lg bg-white border border-rose-300 font-bold text-rose-700 hover:bg-rose-100 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin GPS'}</span>
            </button>
          </div>

          {/* Hotline buttons */}
          <div className="space-y-2.5">
            <a
              href="tel:110"
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md hover:from-red-700 hover:to-rose-700 transition-all font-bold text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div>Panggilan Darurat Kepolisian</div>
                  <div className="text-xs text-rose-100 font-normal">Posko Pengamanan & Evakuasi Cepat</div>
                </div>
              </div>
              <div className="text-xl font-mono font-black bg-white/20 px-3 py-1 rounded-xl">
                110
              </div>
            </a>

            <a
              href="tel:112"
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-md hover:bg-slate-800 transition-all font-bold text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Flame className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div>Layanan Darurat Terpadu (BPBD)</div>
                  <div className="text-xs text-slate-300 font-normal">Pemadaman Titik Api & Satgas Bencana</div>
                </div>
              </div>
              <div className="text-xl font-mono font-black bg-white/20 px-3 py-1 rounded-xl">
                112
              </div>
            </a>

            <a
              href="tel:119"
              className="flex items-center justify-between p-4 rounded-2xl bg-sky-700 text-white shadow-md hover:bg-sky-800 transition-all font-bold text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div>Krisis Medis Kemenkes (PSC)</div>
                  <div className="text-xs text-sky-100 font-normal">Rujukan Oksigen & Pasien ISPA Berat</div>
                </div>
              </div>
              <div className="text-xl font-mono font-black bg-white/20 px-3 py-1 rounded-xl">
                119
              </div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            Layanan darurat resmi terintegrasi Pemerintah Republik Indonesia.
          </p>
        </div>
      </div>
    </div>
  );
}
