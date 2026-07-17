"use client"

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronRight,
  ChevronDown,
  BrainCircuit,
  Mic,
  Paperclip,
  ArrowUp,
  FileText,
  LayoutTemplate,
  Bot,
  Sparkles,
  Zap,
  ArrowRight,
  Check,
  Lock
} from "lucide-react";

const discoverCards = [
  {
    title: "Phân tích dữ liệu",
    description: "Hãy hiểu rõ các con số và xác định những yếu tố...",
  },
  {
    title: "Soạn thảo một email tiếp cận khách hàng tiềm...",
    description: "Hãy viết một email đầu tiên mà mọi người thực s...",
  },
  {
    title: "Soạn thảo một email chuyên nghiệp",
    description: "Hãy viết một email rõ ràng, tự tin cho mọi tình huống.",
  },
  {
    title: "Tóm tắt nội dung cuộc họp",
    description: "Sắp xếp lại những ghi chú lộn xộn thành bản tóm tắt...",
  },
  {
    title: "Viết đề xuất tư vấn",
    description: "Hãy lập một bản đề xuất thuyết phục để giành...",
  },
  {
    title: "Tóm tắt một tài liệu",
    description: "Nhanh chóng nắm bắt những điểm chính từ bất...",
  },
  {
    title: "Xây dựng PRD",
    description: "Hãy trình bày rõ bạn đang xây dựng cái gì, tại sao, v...",
  },
  {
    title: "Tạo chiến dịch email ra mắt sản phẩm",
    description: "Hãy tạo ra những email thu hút sự chú ý của mọi...",
  },
];

const promptTypes = [
  { id: "auto", label: "Tự động", desc: "Tự động phát hiện loại nhiệm vụ" },
  { id: "standard", label: "Standard", desc: "Catch-all for any task" },
  { id: "research", label: "Research", desc: "Analyze, investigate, summarize" },
  { id: "writing", label: "Writing", desc: "Blogs, emails, articles & more" },
  { id: "planning", label: "Planning", desc: "Explore, strategize, figure it out" },
  { id: "code", label: "Code", desc: "Generate, explain, debug code" },
];

const baseModels = [
  { id: "gemini", label: "Gemini 3.1", desc: "Mô hình khuyên dùng cho học tập & làm việc", isLocked: false },
  { id: "openai", label: "OpenAI 5.4", desc: "Mô hình thông minh cao cấp", isLocked: true, badge: "Premium" },
  { id: "deepseek", label: "DeepSeek v4", desc: "Mô hình thế hệ mới hiệu năng vượt trội", isLocked: true, badge: "Pro" },
];

export default function PromptCowboyPage() {
  const [selectedType, setSelectedType] = useState(promptTypes[0]);
  const [selectedModel, setSelectedModel] = useState(baseModels[0]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-slate-900">
      {/* Main Scrollable Area */}
      <main className="flex-1 overflow-y-auto relative flex flex-col justify-between">
        
        {/* Background Gradients (GATS Identity: Blue & Orange) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#0070EB]/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#FF7622]/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col items-center pt-8 md:pt-16 px-6 max-w-5xl mx-auto w-full flex-1">
          {/* Mobile/Tablet Header Sidebar Trigger */}
          <div className="md:hidden self-start mb-4">
            <SidebarTrigger className="text-slate-500 hover:text-slate-800" />
          </div>

          {/* Top Banner (Creative Orange GATS Color) */}
          <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-[#FF7622]/20 bg-white/80 backdrop-blur-sm text-[#FF7622] text-sm font-medium hover:bg-[#FF7622]/10 transition-colors mb-12 shadow-sm">
            Nhận giá ưu đãi độc quyền và quyền truy cập vào các tính năng mới.
            <ChevronRight size={16} />
          </button>

          {/* Titles (Highlights using GATS Brand Blue) */}
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 leading-tight">
              Biến những lời nhắc đơn giản thành những <span className="text-[#0070EB] bg-gradient-to-r from-[#0070EB] to-[#FF7622] bg-clip-text text-transparent">lời nhắc tuyệt vời</span>.
            </h1>
            <p className="text-lg text-slate-600">
              Mã gian lận của bạn để điều khiển AI một cách hiệu quả
            </p>
          </div>

          {/* Prompt Editor Box */}
          <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-4 flex flex-col gap-4">
            <textarea
              className="w-full h-32 bg-transparent resize-none outline-none text-slate-800 placeholder:text-slate-400 text-base"
              placeholder="Hãy tạo một bản CV giúp tôi có được công việc quản lý sản phẩm."
            />
            
            <div className="flex items-center justify-between pt-2">
              {/* Dropdown Menu using Shadcn */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 text-sm text-slate-600 font-medium hover:text-[#0070EB] px-2 py-1.5 rounded-lg hover:bg-[#0070EB]/5 transition-colors cursor-pointer outline-none shrink-0">
                    Loại lời nhắc: {selectedType.label}
                    <Zap size={14} className="ml-1 text-[#F59E0B]" />
                    <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl rounded-2xl p-1.5">
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 border-b border-slate-50 mb-1 flex items-center justify-between">
                    <span>Prompt type: {selectedType.label}</span>
                    <Zap size={12} className="text-[#F59E0B]" />
                  </div>
                  {promptTypes.map((type) => (
                    <DropdownMenuItem
                      key={type.id}
                      onClick={() => setSelectedType(type)}
                      className="rounded-xl px-2.5 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-slate-50 focus:bg-slate-50 outline-none"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold !text-slate-800">{type.label}</span>
                        <span className="text-xs !text-slate-400">{type.desc}</span>
                      </div>
                      {selectedType.id === type.id && (
                        <Check size={14} className="!text-[#0070EB]" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-1">
                {/* Base Model Dropdown Menu using Shadcn */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#0070EB] px-2 py-1.5 rounded-lg hover:bg-[#0070EB]/5 transition-colors mr-2 hidden sm:flex cursor-pointer outline-none shrink-0">
                      Mô hình: {selectedModel.label}
                      <ChevronDown size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl rounded-2xl p-1.5">
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 border-b border-slate-50 mb-1 flex items-center justify-between">
                      <span>Upgrade for best models</span>
                    </div>
                    {baseModels.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => setSelectedModel(model)}
                        className="rounded-xl px-2.5 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-slate-50 focus:bg-slate-50 outline-none"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold !text-slate-800">{model.label}</span>
                            {model.badge && (
                              <span className="bg-[#0070EB]/10 text-[#0070EB] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {model.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-xs !text-slate-400">{model.desc}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {model.isLocked ? (
                            <Lock size={14} className="!text-slate-400" />
                          ) : (
                            selectedModel.id === model.id && (
                              <Check size={14} className="!text-[#0070EB]" />
                            )
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <button className="p-2 text-slate-400 hover:text-[#0070EB] hover:bg-[#0070EB]/5 rounded-lg transition-colors">
                  <BrainCircuit size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-[#0070EB] hover:bg-[#0070EB]/5 rounded-lg transition-colors">
                  <Mic size={18} />
                </button>
                <button className="p-2 text-slate-400 hover:text-[#0070EB] hover:bg-[#0070EB]/5 rounded-lg transition-colors">
                  <Paperclip size={18} />
                </button>
                <button className="p-2 ml-1 bg-[#0070EB] text-white hover:bg-[#0070EB]/90 rounded-full transition-colors shadow-md shadow-[#0070EB]/20">
                  <ArrowUp size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Sub Navigation (Active is GATS Blue) */}
          <div className="flex items-center gap-2 mt-6 bg-white/50 backdrop-blur-sm p-1 rounded-full border border-slate-100 shadow-sm">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0070EB]/10 text-[#0070EB] border border-[#0070EB]/20 rounded-full text-sm font-medium shadow-sm">
              <FileText size={16} />
              Lời nhắc
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#0070EB] rounded-full hover:bg-slate-50 relative">
              <LayoutTemplate size={16} />
              Bản mẫu
              <span className="absolute -top-2 -right-1 bg-[#10B981] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">Mới</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#0070EB] rounded-full hover:bg-slate-50">
              <Bot size={16} />
              Đại lý
            </button>
          </div>

          {/* Info Tooltip */}
          <div className="mt-4 flex flex-col items-center">
            <div className="bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-md relative mb-1">
              Copy-paste ready for any AI
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/60 backdrop-blur border border-[#0070EB]/15 px-4 py-1.5 rounded-full">
              <Sparkles size={14} className="text-[#0070EB]" />
              Còn 1 lời nhắc nữa <span className="mx-1">•</span> <Link href="#" className="text-[#0070EB] font-medium hover:underline">Đăng nhập để lưu lại lời nhắc của bạn</Link>
            </div>
          </div>

          {/* Discover Section */}
          <div className="w-full mt-24 mb-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Phát hiện</h2>
                <p className="text-sm text-slate-500">Các gợi ý sẵn sàng sử dụng cho mọi vai trò. Chọn một gợi ý và tùy chỉnh theo ý mình.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input 
                  className="pl-9 bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-full h-10 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300" 
                  placeholder="Tìm kiếm..." 
                />
              </div>
            </div>

            {/* Tags Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar mb-6">
              <button className="px-4 py-2 rounded-full border border-[#0070EB]/20 bg-[#0070EB]/5 text-[#0070EB] text-sm font-medium whitespace-nowrap shadow-sm">
                Khuyến khích
              </button>
              {["Tổng quan", "Việc bán hàng", "Tiếp thị", "Quản lý sản phẩm", "Kỹ thuật", "Người sáng lập", "Hoạt động", "Thành công"].map((tag) => (
                <button key={tag} className="px-4 py-2 rounded-full border border-transparent hover:bg-slate-100 text-slate-600 text-sm font-medium whitespace-nowrap transition-colors">
                  {tag}
                </button>
              ))}
            </div>

            {/* Discover Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {discoverCards.map((card, i) => (
                <div key={i} className="group p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between min-h-[140px] cursor-pointer">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-base mb-2 group-hover:text-[#0070EB] transition-colors leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0070EB]/10 group-hover:text-[#0070EB] transition-all duration-300">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 bg-white">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <Link href="#" className="hover:text-slate-800 transition-colors">Chính sách bảo mật</Link>
            <span className="text-slate-200">|</span>
            <Link href="#" className="hover:text-slate-800 transition-colors">Điều khoản</Link>
            <span className="text-slate-200">|</span>
            <Link href="#" className="hover:text-slate-800 transition-colors">Bảo vệ</Link>
            <span className="text-slate-200">|</span>
            <Link href="#" className="hover:text-slate-800 transition-colors">Câu hỏi thường gặp</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-[#FF7622]/20 bg-[#FF7622]/5 text-[#FF7622] text-xs font-bold uppercase tracking-wider">
              BETA
            </div>
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Feedback
            </button>
          </div>
        </footer>

      </main>
    </div>
  );
}
