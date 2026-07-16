import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  metrics?: Array<{
    label: string;
    value: string | number;
    tone?: "blue" | "green" | "orange" | "slate";
  }>;
  className?: string;
};

const metricTone = {
  blue: "border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300",
  green:
    "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
  orange:
    "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
  slate:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  metrics,
  className,
}: AdminPageHeaderProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1 text-xl font-semibold leading-7 text-slate-950 sm:text-2xl dark:text-white">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>

      {metrics?.length ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={cn(
                "rounded-md border px-3 py-2",
                metricTone[metric.tone ?? "slate"],
              )}
            >
              <p className="text-xs font-medium opacity-80">{metric.label}</p>
              <p className="mt-0.5 text-lg font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

type AdminPanelProps = {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminPanel({
  children,
  className,
  bodyClassName,
  title,
  description,
  actions,
}: AdminPanelProps) {
  const hasHeader = title || description || actions;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
    >
      {hasHeader ? (
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-slate-800">
          <div>
            {title ? (
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatusPill({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: "green" | "orange" | "red" | "blue" | "slate";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold",
        {
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300":
            tone === "green",
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300":
            tone === "orange",
          "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300":
            tone === "red",
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300":
            tone === "blue",
          "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300":
            tone === "slate",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
