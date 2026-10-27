interface TopNavProps {
  onOpenEmergencyModal: () => void;
}

export function TopNav({ onOpenEmergencyModal }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white/95 backdrop-blur border-b border-slate-200">
      <a
        href="#top"
        className="font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-600 flex items-center gap-2.5"
      >
        <img
          src="/logo.png"
          alt="Logo SIAGA ASAP"
          className="w-7 h-7 rounded-full object-cover shadow-xs border border-slate-300"
        />
        <span>SIAGA ASAP</span>
      </a>

      <nav
        aria-label="Navigasi Utama"
        className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
      >
        <a
          href="#status-udara"
          className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
        >
          Status Udara
        </a>
        <a
          href="#peta-sebaran"
          className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
        >
          Peta Sebaran
        </a>
        <a
          href="#cek-risiko"
          className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
        >
          Cek Risiko
        </a>
        <a
          href="#panduan-perlindungan"
          className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
        >
          Panduan Perlindungan
        </a>
      </nav>

      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onOpenEmergencyModal}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Posko Darurat & Sumber Data
        </button>
      </div>
    </header>
  );
}
