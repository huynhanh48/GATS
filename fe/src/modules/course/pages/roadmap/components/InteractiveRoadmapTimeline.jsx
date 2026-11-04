import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Brain,
  Video,
  Workflow,
  Code2,
  Bot,
} from 'lucide-react';

/**
 * 6 Nhóm khóa học chuẩn GATS AI với Lucide Icons hiện đại và illustration gốc
 */
const ROADMAP_STEPS = [
  {
    step: '#01',
    name: 'Coworking',
    slug: 'cowork',
    subtitle: 'AI Cho Công Sở & Hiệu Suất',
    categoryParam: 'Coworking',
    badgeText: '1 Khóa học',
    position: 'bottom',
    Icon: Users,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-100',
    illustration: '/roadmap/illustrations/cowork.png',
  },
  {
    step: '#02',
    name: 'Mastery',
    slug: 'mastery',
    subtitle: 'Làm Chủ Prompt & Mô Hình LLM',
    categoryParam: 'Mastery',
    badgeText: '2 Khóa học',
    position: 'top',
    Icon: Brain,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 border-purple-100',
    illustration: '/roadmap/illustrations/mastery.png',
  },
  {
    step: '#03',
    name: 'AI Studio',
    slug: 'studio',
    subtitle: 'Sáng Tạo Media & Nội Dung Số',
    categoryParam: 'AI Studio',
    badgeText: 'Sắp ra mắt',
    position: 'bottom',
    Icon: Video,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-100',
    illustration: '/roadmap/illustrations/studio.png',
  },
  {
    step: '#04',
    name: 'Automation',
    slug: 'automation',
    subtitle: 'Tự Động Hóa Quy Trình Không Code',
    categoryParam: 'Automation',
    badgeText: '1 Khóa học',
    position: 'top',
    Icon: Workflow,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-100',
    illustration: '/roadmap/illustrations/automation.png',
  },
  {
    step: '#05',
    name: 'Vibe Coding',
    slug: 'code',
    subtitle: 'Lập Trình Tăng Tốc 10X',
    categoryParam: 'Vibe Coding',
    badgeText: '1 Khóa học',
    position: 'bottom',
    Icon: Code2,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50 border-sky-100',
    illustration: '/roadmap/illustrations/coding.png',
  },
  {
    step: '#06',
    name: 'AI Agents',
    slug: 'agents',
    subtitle: 'Multi-Agent Systems Tự Chủ',
    categoryParam: 'AI Agents',
    badgeText: '1 Khóa học',
    position: 'top',
    Icon: Bot,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-100',
    illustration: '/roadmap/illustrations/agents.png',
  },
];

export default function InteractiveRoadmapTimeline({ categories = [] }) {
  const navigate = useNavigate();

  // Click vào card để chuyển hướng đến trang danh mục khóa học
  const handleCardClick = (step) => {
    const found = categories.find(
      (c) =>
        c.slug === step.slug ||
        c.name?.toLowerCase() === step.name?.toLowerCase() ||
        c.slug === step.categoryParam?.toLowerCase()
    );

    const targetCategory = found?.name || step.categoryParam || step.name;
    navigate(`/courses?category=${encodeURIComponent(targetCategory)}`);
  };

  return (
    <div className="w-full relative rounded-[20px] bg-gradient-to-b from-[#eaf4fe] via-[#e2effd] to-[#d7e9fb] border border-[#bfdbfe]/50 shadow-sm select-none mb-6 p-4 sm:p-6 lg:p-7">
      {/* Background Decor Shapes */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300/15 rounded-full blur-2xl pointer-events-none" />

      {/* Desktop / Large Screen Timeline Canvas View */}
      <div className="hidden lg:block relative w-full h-[370px]">
        {/* Horizontal Arrow Axis */}
        <div className="absolute left-6 right-8 top-1/2 -translate-y-1/2 h-2 bg-[#70aff7] rounded-full z-0 flex items-center">
          {/* Arrowhead at the right end */}
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[11px] border-y-transparent border-l-[18px] border-l-[#70aff7]" />
        </div>

        {/* 6 Step Nodes & Interactive Cards */}
        <div className="relative w-full h-full z-10">
          {ROADMAP_STEPS.map((step, idx) => {
            // Căn lề an toàn: cách mép 10% và kết thúc ở 90% để không bao giờ bị cắt viền card
            const leftPercent = 10 + idx * 16;
            const isTop = step.position === 'top';
            const { Icon } = step;

            // Tìm số lượng khóa học từ API nếu có
            const matchedCat = categories.find(
              (c) => c.slug === step.slug || c.name?.toLowerCase() === step.name.toLowerCase()
            );
            const courseCount = matchedCat ? matchedCat.courseCount : null;
            const badgeLabel =
              courseCount !== null && courseCount !== undefined
                ? courseCount > 0
                  ? `${courseCount} Khóa học`
                  : 'Sắp ra mắt'
                : step.badgeText;

            return (
              <div
                key={step.step}
                className="absolute"
                style={{
                  left: `${leftPercent}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Node Milestone Circle on Axis */}
                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-white border-[3.5px] border-[#1a56db] shadow-md flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-125" />
                  {/* Vertical connector line */}
                  <div
                    className={`absolute w-0.5 bg-[#93c5fd] ${
                      isTop ? 'bottom-5 h-6' : 'top-5 h-6'
                    }`}
                  />
                </div>

                {/* The Floating Compact Card */}
                <div
                  onClick={() => handleCardClick(step)}
                  className={`absolute w-[185px] xl:w-[205px] bg-white rounded-[14px] p-2.5 shadow-sm hover:shadow-xl border border-slate-100 hover:border-[#1a56db]/40 cursor-pointer transition-all duration-300 group hover:-translate-y-1 flex items-center justify-between gap-2 ${
                    isTop
                      ? 'bottom-[32px] -translate-x-1/2 left-1/2'
                      : 'top-[32px] -translate-x-1/2 left-1/2'
                  }`}
                >
                  {/* Left Content */}
                  <div className="flex-1 min-w-0 pr-0.5">
                    {/* Badge & Step */}
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[9px] font-extrabold text-slate-400">
                        {step.step}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full whitespace-nowrap group-hover:bg-blue-50 group-hover:text-[#1a56db] transition-colors">
                        {badgeLabel}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#1a56db] transition-colors truncate">
                      {step.name}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Right Icon / Graphic */}
                  <div className="shrink-0 flex items-center justify-center">
                    <div className="relative w-10 h-10 xl:w-11 xl:h-11 rounded-[10px] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-1 group-hover:border-blue-200 transition-colors">
                      <img
                        src={step.illustration}
                        alt={step.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                        loading="eager"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {/* Fallback Icon nếu ảnh bị thiếu */}
                      <Icon
                        size={20}
                        className={`absolute inset-0 m-auto ${step.iconColor} -z-10`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet Grid View */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {ROADMAP_STEPS.map((step) => {
          const { Icon } = step;
          const matchedCat = categories.find(
            (c) => c.slug === step.slug || c.name?.toLowerCase() === step.name.toLowerCase()
          );
          const courseCount = matchedCat ? matchedCat.courseCount : null;
          const badgeLabel =
            courseCount !== null && courseCount !== undefined
              ? courseCount > 0
                ? `${courseCount} Khóa học`
                : 'Sắp ra mắt'
              : step.badgeText;

          return (
            <div
              key={step.step}
              onClick={() => handleCardClick(step)}
              className="bg-white rounded-[14px] p-3 shadow-xs hover:shadow-md border border-slate-100 hover:border-[#1a56db]/30 cursor-pointer transition-all duration-200 group flex items-center justify-between gap-2.5 active:scale-[0.98]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-bold text-slate-400">
                    {step.step}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-blue-50 group-hover:text-[#1a56db]">
                    {badgeLabel}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#1a56db] transition-colors">
                  {step.name}
                </h3>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {step.subtitle}
                </p>
              </div>

              <div className="w-10 h-10 rounded-[10px] bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center p-1 relative overflow-hidden">
                <img
                  src={step.illustration}
                  alt={step.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Icon
                  size={18}
                  className={`absolute inset-0 m-auto ${step.iconColor} -z-10`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
