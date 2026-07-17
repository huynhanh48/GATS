"use client"

import * as React from "react"
import Link from "next/link"
import {
  Library,
  History,
  Search,
  Plus,
  FileText,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon" className="bg-white border-r border-slate-100" {...props}>
      {/* Sidebar Header with clean GATS style */}
      <SidebarHeader className="p-4 bg-white border-b border-slate-100 h-14 flex flex-row items-center justify-between overflow-hidden shrink-0">
        {/* Expanded state */}
        <div className="flex items-center gap-2 font-semibold text-sm group-data-[collapsible=icon]:hidden">
          <div className="w-6 h-6 rounded-full bg-[#0070EB]/10 flex items-center justify-center overflow-hidden p-0.5 shrink-0">
            <img src="/Group.svg" alt="GATS logo" className="w-full h-full object-contain" />
          </div>
          <span className="whitespace-nowrap text-slate-800">Cao bồi nhanh</span>
        </div>
        <SidebarTrigger className="text-slate-400 hover:text-slate-600 ml-auto group-data-[collapsible=icon]:hidden shrink-0" />

        {/* Collapsed state with hover transition to SidebarTrigger */}
        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full h-full relative group/header-btn">
          <div className="w-6 h-6 rounded-full bg-[#0070EB]/10 flex items-center justify-center overflow-hidden p-0.5 shrink-0 group-hover/header-btn:scale-0 group-hover/header-btn:opacity-0 transition-all duration-200">
            <img src="/Group.svg" alt="GATS logo" className="w-full h-full object-contain" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center scale-0 opacity-0 group-hover/header-btn:scale-100 group-hover/header-btn:opacity-100 transition-all duration-200">
            <SidebarTrigger className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-lg hover:bg-slate-100" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        {/* Lời nhắc mới (GATS Primary Blue Highlight) */}
        <SidebarGroup className="p-3 pb-0 group-data-[collapsible=icon]:p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Lời nhắc mới" className="w-full justify-start gap-2 bg-[#0070EB]/10 hover:bg-[#0070EB]/15 text-[#0070EB] shadow-none font-medium">
                <Plus size={16} />
                <span>Lời nhắc mới</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="py-2 group-data-[collapsible=icon]:p-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Thư viện" asChild className="text-slate-600 hover:bg-[#0070EB]/5 hover:text-[#0070EB] rounded-md">
                  <Link href="#">
                    <Library size={16} />
                    <span>Thư viện</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Ký ức" asChild className="text-slate-600 hover:bg-[#0070EB]/5 hover:text-[#0070EB] rounded-md">
                  <Link href="#">
                    <History size={16} />
                    <span>Ký ức</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Tìm kiếm" asChild className="text-slate-600 hover:bg-[#0070EB]/5 hover:text-[#0070EB] rounded-md">
                  <Link href="#">
                    <Search size={16} />
                    <span>Tìm kiếm</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-2 group-data-[collapsible=icon]:p-2">
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            GẦN ĐÂY
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Bổ sung chức năng năng lượng HR" asChild className="text-slate-600 hover:text-[#0070EB] hover:bg-[#0070EB]/5">
                  <Link href="#" className="flex items-center gap-2">
                    <FileText size={16} className="shrink-0 hidden group-data-[collapsible=icon]:block text-[#0070EB]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Bổ sung chức năng năng lượng HR,</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Hiện đại hóa việc chấm công H..." asChild className="text-slate-600 hover:text-[#0070EB] hover:bg-[#0070EB]/5">
                  <Link href="#" className="flex items-center gap-2">
                    <FileText size={16} className="shrink-0 hidden group-data-[collapsible=icon]:block text-[#0070EB]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Hiện đại hóa việc chấm công H...</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center border-t border-slate-100 flex flex-col gap-2 bg-white overflow-hidden shrink-0">
        <Button variant="outline" className="w-full justify-center text-slate-600 border-slate-200 hover:bg-slate-50 group-data-[collapsible=icon]:hidden">
          Đăng nhập
        </Button>
        <Button className="w-full justify-center bg-[#0B0F19] text-white hover:bg-[#0070EB] transition-colors group-data-[collapsible=icon]:hidden">
          Tạo tài khoản
        </Button>
        {/* User avatar for collapsed state */}
        <div className="hidden group-data-[collapsible=icon]:flex w-8 h-8 rounded-full bg-[#0070EB]/10 items-center justify-center text-xs font-semibold text-[#0070EB] shrink-0 border border-[#0070EB]/20">
          G
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
