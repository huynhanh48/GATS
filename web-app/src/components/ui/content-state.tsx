import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContentStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Pass a Lucide icon, or `null` / omit to hide the icon entirely. */
  icon?: LucideIcon | null;
  tone?: "empty" | "error";
  className?: string;
};

function ContentState({
  title,
  description,
  actionLabel,
  onAction,
  icon = null,
  tone = "empty",
  className,
}: ContentStateProps) {
  const Icon = icon;

  return (
    <div
      className={cn(
        "flex w-full min-h-32 flex-col items-start justify-center py-6 text-left",
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {Icon ? (
        <span className="mb-3 rounded-full bg-accent p-3 text-brand-primary">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 w-full text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export { ContentState };
