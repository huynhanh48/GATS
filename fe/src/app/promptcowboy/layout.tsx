import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/promptcowboy/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function PromptCowboyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-white min-h-screen w-full">
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="bg-white flex-1 overflow-hidden">
            {children}
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  )
}
