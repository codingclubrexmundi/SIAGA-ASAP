import { PhoneCall, X, BookOpen, ExternalLink } from 'lucide-react';
import { OFFICIAL_ATTRIBUTIONS } from '../data/karhutlaData';

interface AttributionAndEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: () => void;
}

const EMERGENCY_CONTACTS = [
  {
    name: 'Panggilan Darurat Terpadu Nasional',
    number: '112',
    agency: 'Kementerian Kominfo & BPBD Daerah',
    desc: 'Bebas pulsa 24 jam untuk keadaan darurat bencana dan evakuasi warga.',
  },
  {
    name: 'Ambulans & Krisis Medis Gawat Darurat (PSC)',
    number: '119',
    agency: 'Kementerian Kesehatan RI',
    desc: 'Layanan rujukan oksigen darurat, sesak napas berat (ISPA), dan rumah singgah.',
  },
  {
    name: 'Posko Pengendalian Karhutla & Manggala Agni',
    number: '0800-140-1234',
    agency: 'KLHK & BNPB (Call Center 117)',
    desc: 'Pelaporan titik api lahan gambut baru dan permintaan pemadaman darat.',
  },
];

export function AttributionAndEmergencyModal({
  isOpen,
  onClose,
  onOpenModal,
}: AttributionAndEmergencyModalProps) {
  return (
    <>
      {/* Seksi Footer & Transparansi Sumber Data/Aset Resmi */}
      <footer className="bg-white border-t border-slate-200 mt-10">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Baris Kontak Darurat Cepat */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-slate-200">
            {EMERGENCY_CONTACTS.map((contact) => (
              <div
                key={contact.number}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {contact.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {contact.agency}
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5">
                    {contact.desc}
                  </p>
                </div>
                <div className="font-mono-tabular text-lg font-extrabold text-rose-700 shrink-0 flex items-center gap-1">
                  <PhoneCall className="w-4 h-4" aria-hidden="true" />
                  {contact.number}
                </div>
              </div>
            ))}
          </div>

          {/* Ringkasan Sumber Data & Atribusi Aset (Wajib Sesuai Ketentuan Lomba) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs text-slate-600">
            <div className="space-y-1">
              <div className="font-bold text-slate-900">
                SIAGA ASAP — Sistem Pemantau Kualitas Udara & Perlindungan Diri Bencana Karhutla
              </div>
              <p className="text-slate-500">
                Seluruh referensi standar indeks (Permen LHK No. 14 Tahun 2020), parameter meteorologi (BMKG), protokol medis (Kemenkes RI & PDPI), serta aset ikonografi/tipografi terbuka dicantumkan secara transparan.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onOpenModal}
                className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                Lihat Daftar Lengkap Sumber Aset & Referensi
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Dialog Posko Darurat & Atribusi Sumber Aset */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-emergency-title"
        >
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-xl p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2
                  id="modal-emergency-title"
                  className="font-display text-lg font-bold text-slate-900"
                >
                  Kontak Darurat Karhutla & Dokumentasi Sumber Aset/Data
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nomor layanan gawat darurat 24 jam serta daftar referensi ilmiah dan lisensi aset yang digunakan pada aplikasi.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Dialog"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Bagian 1: Kontak Darurat */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900">
                01. Saluran Darurat Evakuasi, Kesehatan ISPA, & Pemadaman
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {EMERGENCY_CONTACTS.map((c) => (
                  <div
                    key={c.number}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <div className="font-mono-tabular text-base font-extrabold text-rose-700">
                      {c.number}
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {c.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bagian 2: Tabel Atribusi Sumber Data & Aset */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900">
                02. Pencantuman Sumber Data, Standar Regulasi, & Aset Visual
              </h3>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                {OFFICIAL_ATTRIBUTIONS.map((attr) => (
                  <div key={attr.id} className="p-3.5 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        {attr.category} — {attr.sourceName}
                      </span>
                      <a
                        href={attr.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-700 hover:underline font-medium flex items-center gap-1 shrink-0"
                      >
                        Referensi <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </div>
                    <p className="text-slate-600">{attr.usageDescription}</p>
                    <div className="text-[11px] text-slate-500">
                      Lisensi / Standar: {attr.licenseOrStandard}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Tutup Jendela Informasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
