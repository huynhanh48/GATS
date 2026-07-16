export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-xl bg-[#0070EB] text-sm font-black text-white shadow-sm">
        G
      </span>
      <div className="leading-tight">
        <p className="text-sm font-black tracking-[0.2em] text-slate-950 dark:text-white">
          GATS
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Academy
        </p>
      </div>
    </div>
  );
}
