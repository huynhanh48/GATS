import Image from "next/image";

export function Logo() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#407bff]/10 p-1">
        <Image
          src="/logo.png"
          alt="GATS Logo"
          width={32}
          height={32}
          className="size-full object-contain"
          priority
        />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-base font-bold tracking-tight text-slate-950 dark:text-white">
          GATS
        </p>
        <p className="truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          Academy
        </p>
      </div>
    </div>
  );
}
