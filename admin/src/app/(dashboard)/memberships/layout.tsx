import type { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/api/server";
import { hasAdminRole } from "@/lib/auth/access";

export default async function MembershipsLayout({ children }: PropsWithChildren) {
  const session = await getAdminSession();
  if (!session || !hasAdminRole(session.user.roles)) {
    redirect("/?error=forbidden");
  }
  return children;
}
