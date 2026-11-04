import Image from "next/image";

export function Logo() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#0070EB]/10 p-1.5">
        <Image
          src="/Group.svg"
          alt=""
          width={28}
          height={28}
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
