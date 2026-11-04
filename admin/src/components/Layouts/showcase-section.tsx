import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type PropsType = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function ShowcaseSection({ title, children, className }: PropsType) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-950 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white sm:px-5">
        {title}
      </h2>

      <div className={cn("p-4 sm:p-5", className)}>{children}</div>
    </div>
  );
}
