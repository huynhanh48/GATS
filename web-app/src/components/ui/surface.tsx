import * as React from "react";

import { cn } from "@/lib/utils";

function Surface({
  className,
  elevated = false,
  ...props
}: React.ComponentProps<"div"> & { elevated?: boolean }) {
  return (
    <div
      data-slot="surface"
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground",
        elevated ? "shadow-[var(--shadow-elevated)]" : "shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    />
  );
}

export { Surface };
