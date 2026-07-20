import { Header } from "@/components/Layouts/header";
import { Sidebar } from "@/components/Layouts/sidebar";
import { getAdminSession } from "@/lib/api/server";
import { redirect } from "next/navigation";
import { type PropsWithChildren } from "react";

export default async function WithLayout({ children }: PropsWithChildren) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/auth/sign-in?error=unauthorized");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col bg-gray-2 dark:bg-[#020d1a]">
        <Header />

        <main className="isolate mx-auto w-full max-w-(--breakpoint-2xl) flex-1 overflow-x-hidden p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
