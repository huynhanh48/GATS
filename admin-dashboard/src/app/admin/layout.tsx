import { Header } from "@/components/Layouts/header";
import { Sidebar } from "@/components/Layouts/sidebar";
import { type PropsWithChildren } from "react";

export default function WithLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="min-w-0 flex-1 flex flex-col overflow-hidden bg-gray-2 dark:bg-[#020d1a]">
        <Header />

        <main className="isolate flex-1 overflow-y-auto overflow-x-hidden mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
