import type { PropsWithChildren } from "react";

/** Public marketing shell — no admin sidebar. */
export default function PublicLayout({ children }: PropsWithChildren) {
  return children;
}
