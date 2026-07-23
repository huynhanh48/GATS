"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import type { CourseDetail } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { CategorySelect } from "@/app/(dashboard)/category/_components/category-select";
import { createCourse, updateCourse, type CreateCourseState } from "../actions";
import { CourseTagSelect } from "./course-tag-select";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  Clock,
  Code2,
  Download,
  FileQuestion,
  FileText,
  FolderDown,
  GraduationCap,
  Headphones,
  Infinity,
  Laptop,
  Library,
  Lightbulb,
  MessageCircle,
  Monitor,
  PenTool,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Timer,
  Users,
  Video,
  Wifi,
  type LucideIcon,
} from "lucide-react";

const initialState: CreateCourseState = {
  ok: false,
  message: "",
};

const TABS = [
  { id: "general", label: "Thông tin chung" },
  { id: "outcomes", label: "Bạn sẽ học được gì" },
  { id: "includes", label: "Khóa học bao gồm" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type IncludeIconOption = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const INCLUDE_ICON_OPTIONS: IncludeIconOption[] = [
  { value: "Video", label: "Video bài học", icon: Video },
  { value: "PlayCircle", label: "Nội dung phát lại", icon: PlayCircle },
  { value: "Clock", label: "Thời lượng", icon: Clock },
  { value: "Timer", label: "Thời gian học", icon: Timer },
  { value: "FileText", label: "Tài liệu", icon: FileText },
  { value: "Download", label: "Tải xuống", icon: Download },
  { value: "FolderDown", label: "Bộ tài nguyên", icon: FolderDown },
  { value: "BookOpen", label: "Giáo trình", icon: BookOpen },
  { value: "Library", label: "Thư viện", icon: Library },
  { value: "Monitor", label: "Học trên máy tính", icon: Monitor },
  { value: "Laptop", label: "Thực hành trực tuyến", icon: Laptop },
  { value: "Smartphone", label: "Học trên di động", icon: Smartphone },
  { value: "Wifi", label: "Truy cập trực tuyến", icon: Wifi },
  { value: "Award", label: "Chứng chỉ", icon: Award },
  { value: "BadgeCheck", label: "Đã xác nhận", icon: BadgeCheck },
  { value: "GraduationCap", label: "Hoàn thành khóa học", icon: GraduationCap },
  { value: "Infinity", label: "Truy cập trọn đời", icon: Infinity },
  { value: "Users", label: "Nhóm học tập", icon: Users },
  { value: "MessageCircle", label: "Trao đổi với mentor", icon: MessageCircle },
  { value: "Headphones", label: "Hỗ trợ học viên", icon: Headphones },
  { value: "CalendarDays", label: "Lịch học", icon: CalendarDays },
  { value: "ClipboardCheck", label: "Bài tập", icon: ClipboardCheck },
  { value: "FileQuestion", label: "Bài kiểm tra", icon: FileQuestion },
  { value: "PenTool", label: "Thực hành", icon: PenTool },
  { value: "Code2", label: "Bài tập lập trình", icon: Code2 },
  { value: "Brain", label: "Kiến thức chuyên sâu", icon: Brain },
  { value: "Lightbulb", label: "Kỹ năng mới", icon: Lightbulb },
  { value: "Target", label: "Mục tiêu học tập", icon: Target },
  { value: "ShieldCheck", label: "Cam kết chất lượng", icon: ShieldCheck },
  { value: "Sparkles", label: "Nội dung nổi bật", icon: Sparkles },
];

type IncludeRow = {
  key: string;
  label: string;
  value: string | null;
  unit: string | null;
};

const inputClass =
  "w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary dark:disabled:bg-dark";

type CourseFormProps = {
  mode: "create" | "edit";
  course?: CourseDetail;
  onSuccess?: () => void;
};

export function CourseForm({ mode, course, onSuccess }: CourseFormProps) {
  const action =
    mode === "create" ? createCourse : updateCourse.bind(null, course!.id);

  const [state, formAction, isPending] = useActionState(action, initialState);

  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [openIncludeIconIndex, setOpenIncludeIconIndex] = useState<
    number | null
  >(null);
  const [outcomes, setOutcomes] = useState<string[]>(
    course?.learningOutcomes?.map((item) => item.content) ?? [],
  );
  const [includes, setIncludes] = useState<IncludeRow[]>(
    course?.includes?.map((item) => ({
      key: item.key,
      label: item.label,
      value: item.value,
      unit: item.unit,
    })) ?? [],
  );

  useEffect(() => {
    if (!state.message) return;

    if (state.ok) {
      toast.success(state.message);
      onSuccess?.();
      return;
    }

    toast.error(state.message);
  }, [state, onSuccess]);

  function addOutcome() {
    setOutcomes((prev) => [...prev, ""]);
  }

  function updateOutcome(index: number, value: string) {
    setOutcomes((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function removeOutcome(index: number) {
    setOutcomes((prev) => prev.filter((_, i) => i !== index));
  }

  function addInclude() {
    setIncludes((prev) => [
      ...prev,
      {
        key: INCLUDE_ICON_OPTIONS[0].value,
        label: "",
        value: null,
        unit: null,
      },
    ]);
  }

  function updateInclude(index: number, patch: Partial<IncludeRow>) {
    setIncludes((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeInclude(index: number) {
    setIncludes((prev) => prev.filter((_, i) => i !== index));
  }

  const outcomesPayload = outcomes
    .map((content) => ({ content: content.trim() }))
    .filter((item) => item.content.length > 0);

  const includesPayload = includes
    .map((item) => ({
      key: item.key.trim(),
      label: item.label.trim(),
      value: item.value,
      unit: item.unit,
    }))
    .filter((item) => item.key.length > 0 && item.label.length > 0);

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 sm:p-7.5 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="mb-6 border-b border-stroke dark:border-dark-3">
        <nav className="-mb-px flex flex-wrap gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "border-b-2 px-1 pb-3 text-sm font-medium transition",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-dark-4 hover:text-dark dark:text-dark-6 dark:hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form action={formAction} className="space-y-5">
        <div className={cn("space-y-5", activeTab !== "general" && "hidden")}>
          <InputGroup
            type="text"
            name="title"
            label="Tiêu đề"
            placeholder="Nhập tiêu đề khóa học"
            defaultValue={course?.title}
            handleChange={() => {}}
            disabled={isPending}
          />

          <TextAreaGroup
            name="description"
            label="Mô tả"
            placeholder="Nhập mô tả khóa học"
            defaultValue={course?.description ?? ""}
            disabled={isPending}
          />

          <div className="space-y-3 rounded-xl border border-stroke p-4 dark:border-dark-3">
            <div>
              <p className="mb-1 text-sm font-semibold text-dark dark:text-white">
                Thumbnail tạm (local)
              </p>
              <p className="mb-3 text-xs text-dark-4 dark:text-dark-6">
                Chọn nhanh 1 trong 3 ảnh mẫu — hoặc dán URL bên dưới.
              </p>
              <div className="mb-3 grid grid-cols-3 gap-2">
                {[
                  "/images/courses/thumb-a.jpg",
                  "/images/courses/thumb-b.jpg",
                  "/images/courses/thumb-c.jpg",
                ].map((src) => (
                  <button
                    key={src}
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      const input = document.querySelector<HTMLInputElement>(
                        'input[name="thumbnail"]',
                      );
                      if (input) {
                        input.value = src;
                        input.dispatchEvent(
                          new Event("input", { bubbles: true }),
                        );
                      }
                    }}
                    className="relative aspect-video cursor-pointer overflow-hidden rounded-lg border border-stroke transition hover:border-primary dark:border-dark-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full bg-slate-100 object-contain p-1 dark:bg-slate-900"
                    />
                  </button>
                ))}
              </div>
              <InputGroup
                type="text"
                name="thumbnail"
                label="Thumbnail URL / path"
                placeholder="/images/courses/thumb-a.jpg"
                defaultValue={course?.thumbnail ?? ""}
                handleChange={() => {}}
                disabled={isPending}
              />
            </div>

            <InputGroup
              type="url"
              name="intro_video"
              label="Intro Video URL"
              placeholder="https://..."
              defaultValue={course?.introVideo ?? ""}
              handleChange={() => {}}
              disabled={isPending}
            />
          </div>

          <div className="space-y-3 rounded-xl border border-stroke p-4 dark:border-dark-3">
            <div>
              <p className="text-sm font-semibold text-dark dark:text-white">
                Giá & khuyến mãi
              </p>
              <p className="mt-1 text-xs text-dark-4 dark:text-dark-6">
                Để giá = 0 là miễn phí. Điền giá sale thấp hơn giá gốc để hiện
                badge Sale trên /course.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InputGroup
                type="number"
                name="price"
                label="Giá gốc (VNĐ)"
                placeholder="299000"
                defaultValue={course?.price?.toString() ?? ""}
                handleChange={() => {}}
                disabled={isPending}
              />

              <InputGroup
                type="number"
                name="sale_price"
                label="Giá sale (VNĐ)"
                placeholder="Để trống nếu không sale"
                defaultValue={course?.salePrice?.toString() ?? ""}
                handleChange={() => {}}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2.5 block font-medium text-dark dark:text-white">
                Cấp độ
              </label>
              <select
                name="level"
                defaultValue={course?.level ?? "beginner"}
                disabled={isPending}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark transition outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              >
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>

            <div>
              <label className="mb-2.5 block font-medium text-dark dark:text-white">
                Trạng thái
              </label>
              <select
                name="status"
                defaultValue={course?.status ?? "draft"}
                disabled={isPending}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark transition outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              >
                <option value="draft">Nháp</option>
                <option value="published">Đã xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>
          </div>

          <CategorySelect
            type="course"
            defaultValue={course?.category?.id ?? ""}
            disabled={isPending}
          />

          <CourseTagSelect
            defaultValue={course?.tags}
            disabled={isPending}
          />
        </div>

        <div className={cn("space-y-4", activeTab !== "outcomes" && "hidden")}>
          {outcomes.length === 0 && (
            <p className="rounded-lg border border-dashed border-stroke px-4 py-6 text-center text-sm text-dark-4 dark:border-dark-3 dark:text-dark-6">
              Chưa có mục nào. Bấm &quot;Thêm mục&quot; để bắt đầu.
            </p>
          )}

          {outcomes.map((content, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-sm text-dark-4 dark:text-dark-6">
                {index + 1}.
              </span>
              <input
                type="text"
                value={content}
                onChange={(e) => updateOutcome(index, e.target.value)}
                placeholder="Ví dụ: Xây dựng ứng dụng web hoàn chỉnh với Next.js"
                disabled={isPending}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeOutcome(index)}
                disabled={isPending}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-red transition hover:bg-red-light-6 dark:hover:bg-dark-3"
              >
                Xóa
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addOutcome}
            disabled={isPending}
            className="rounded-lg border border-dashed border-primary px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/5"
          >
            + Thêm mục
          </button>
        </div>

        <div className={cn("space-y-4", activeTab !== "includes" && "hidden")}>
          {includes.length === 0 && (
            <p className="rounded-lg border border-dashed border-stroke px-4 py-6 text-center text-sm text-dark-4 dark:border-dark-3 dark:text-dark-6">
              Chưa có mục nào. Bấm &quot;Thêm mục&quot; để bắt đầu.
            </p>
          )}

          {includes.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 rounded-lg border border-stroke p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_100px_100px_auto] sm:items-end dark:border-dark-3"
            >
              <div className="relative">
                <label className="mb-1.5 block text-xs text-dark-4 dark:text-dark-6">
                  Biểu tượng
                </label>
                <button
                  type="button"
                  aria-expanded={openIncludeIconIndex === index}
                  aria-haspopup="listbox"
                  onClick={() =>
                    setOpenIncludeIconIndex((current) =>
                      current === index ? null : index,
                    )
                  }
                  disabled={isPending}
                  className={cn(
                    inputClass,
                    "flex min-h-11 items-center justify-between gap-3 text-left",
                  )}
                >
                  {(() => {
                    const selected =
                      INCLUDE_ICON_OPTIONS.find(
                        (option) => option.value === item.key,
                      ) ?? null;
                    const SelectedIcon = selected?.icon ?? CircleHelp;

                    return (
                      <>
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <SelectedIcon aria-hidden="true" className="h-4.5 w-4.5" />
                          </span>
                          <span className="truncate text-sm">
                            {selected?.label ?? item.key}
                          </span>
                        </span>
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform",
                            openIncludeIconIndex === index && "rotate-180",
                          )}
                        />
                      </>
                    );
                  })()}
                </button>

                {openIncludeIconIndex === index && (
                  <div
                    role="listbox"
                    aria-label="Chọn biểu tượng khóa học"
                    className="absolute left-0 top-full z-30 mt-2 grid max-h-80 w-[min(560px,calc(100vw-3rem))] grid-cols-1 gap-1 overflow-y-auto rounded-xl border border-stroke bg-white p-2 shadow-lg sm:grid-cols-2 dark:border-dark-3 dark:bg-dark-2"
                  >
                    {INCLUDE_ICON_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const selected = option.value === item.key;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => {
                            updateInclude(index, { key: option.value });
                            setOpenIncludeIconIndex(null);
                          }}
                          className={cn(
                            "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:hover:bg-dark-3",
                            selected &&
                              "bg-primary/10 font-medium text-primary dark:bg-primary/15",
                          )}
                        >
                          <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">
                            {option.label}
                          </span>
                          {selected && (
                            <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-dark-4 dark:text-dark-6">
                  Nhãn
                </label>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) =>
                    updateInclude(index, { label: e.target.value })
                  }
                  placeholder="Ví dụ: Giờ video theo yêu cầu"
                  disabled={isPending}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-dark-4 dark:text-dark-6">
                  Giá trị
                </label>
                <input
                  type="text"
                  value={item.value ?? ""}
                  onChange={(e) =>
                    updateInclude(index, {
                      value: e.target.value === "" ? null : e.target.value,
                    })
                  }
                  placeholder="Ví dụ: 12, Trọn đời"
                  maxLength={100}
                  disabled={isPending}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-dark-4 dark:text-dark-6">
                  Đơn vị
                </label>
                <input
                  type="text"
                  value={item.unit ?? ""}
                  onChange={(e) =>
                    updateInclude(index, {
                      unit: e.target.value === "" ? null : e.target.value,
                    })
                  }
                  placeholder="giờ"
                  maxLength={50}
                  disabled={isPending}
                  className={inputClass}
                />
              </div>

              <button
                type="button"
                onClick={() => removeInclude(index)}
                disabled={isPending}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-red transition hover:bg-red-light-6 dark:hover:bg-dark-3"
              >
                Xóa
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addInclude}
            disabled={isPending}
            className="rounded-lg border border-dashed border-primary px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/5"
          >
            + Thêm mục
          </button>
        </div>

        <input
          type="hidden"
          name="learning_outcomes"
          value={JSON.stringify(outcomesPayload)}
        />
        <input
          type="hidden"
          name="includes"
          value={JSON.stringify(includesPayload)}
        />

        <div className="flex justify-end gap-3 border-t border-stroke pt-5 dark:border-dark-3">
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "hover:bg-opacity-90 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition",
              isPending && "cursor-not-allowed opacity-70",
            )}
          >
            {isPending
              ? "Đang lưu..."
              : mode === "create"
                ? "Tạo khóa học"
                : "Cập nhật khóa học"}
            {isPending && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
