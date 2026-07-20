"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import type { CourseDetail } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { CategorySelect } from "@/app/(dashboard)/category/_components/category-select";
import { createCourse, updateCourse, type CreateCourseState } from "../actions";

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

const INCLUDE_ICON_OPTIONS = [
  { value: "Video", label: "Video theo yêu cầu" },
  { value: "Clock", label: "Thời lượng" },
  { value: "FileText", label: "Tài liệu" },
  { value: "Download", label: "Tài nguyên tải về" },
  { value: "Monitor", label: "Truy cập trên TV/PC" },
  { value: "Smartphone", label: "Truy cập trên di động" },
  { value: "Award", label: "Chứng chỉ hoàn thành" },
  { value: "Infinity", label: "Truy cập trọn đời" },
];

type IncludeRow = {
  key: string;
  label: string;
  value: number | null;
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
      { key: INCLUDE_ICON_OPTIONS[0].value, label: "", value: null, unit: null },
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
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                      }
                    }}
                    className="relative aspect-video cursor-pointer overflow-hidden rounded-lg border border-stroke transition hover:border-primary dark:border-dark-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
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

          <InputGroup
            type="text"
            name="tags"
            label="Tags"
            placeholder="ai, python, machine-learning (phân cách bằng dấu phẩy)"
            defaultValue={course?.tags?.map((t) => t.name).join(", ") ?? ""}
            handleChange={() => {}}
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
              <div>
                <label className="mb-1.5 block text-xs text-dark-4 dark:text-dark-6">
                  Biểu tượng
                </label>
                <select
                  value={item.key}
                  onChange={(e) => updateInclude(index, { key: e.target.value })}
                  disabled={isPending}
                  className={inputClass}
                >
                  {INCLUDE_ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                  type="number"
                  value={item.value ?? ""}
                  onChange={(e) =>
                    updateInclude(index, {
                      value:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  placeholder="12"
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
