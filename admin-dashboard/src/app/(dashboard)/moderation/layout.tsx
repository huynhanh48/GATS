import { getAdminSession } from "@/lib/api/server";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

/** Moderation queue — admin or instructor (matches BE requireStaff). */
export default async function ModerationLayout({ children }: PropsWithChildren) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/?error=forbidden");
  }
  return children;
}
