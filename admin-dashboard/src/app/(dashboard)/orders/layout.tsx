import { getAdminSession } from "@/lib/api/server";
import { hasAdminRole } from "@/lib/auth/access";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

/** Orders / payments — admin only (instructors blocked). */
export default async function OrdersLayout({ children }: PropsWithChildren) {
  const session = await getAdminSession();
  if (!session || !hasAdminRole(session.user.roles)) {
    redirect("/?error=forbidden");
  }
  return children;
}
