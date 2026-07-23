import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

type ContentStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  tone?: "empty" | "error";
};

function ContentState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  tone = "empty",
}: ContentStateProps) {
  const Icon = icon ?? (tone === "error" ? AlertCircle : Inbox);

  return (
    <Surface
      className="flex min-h-56 flex-col items-center justify-center border-dashed p-8 text-center shadow-none"
      role={tone === "error" ? "alert" : "status"}
    >
      <span className="mb-4 rounded-full bg-accent p-3 text-brand-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Surface>
  );
}

export { ContentState };
