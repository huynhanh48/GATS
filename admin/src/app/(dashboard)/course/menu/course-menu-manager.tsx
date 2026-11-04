"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { CategoryWithCounts, CourseMenuItem, TagWithCategoryCounts } from "@/lib/api/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createMenuItem,
  deleteMenuItem,
  reorderMenuItems,
  seedCourseMenu,
  updateMenuItem,
} from "./actions";

const input =
  "min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900";

export function CourseMenuManager({
  initialItems,
  tags,
  categories,
}: {
  initialItems: CourseMenuItem[];
  tags: TagWithCategoryCounts[];
  categories: CategoryWithCounts[];
}) {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState(
    initialItems.find((item) => !item.parentId)?.id ?? null,
  );
  const [selectedTag, setSelectedTag] = useState(tags[0]?.id ?? "");
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState(categories[0]?.name ?? "AI cho công sở");
  const [newGroupCategory, setNewGroupCategory] = useState(categories[0]?.slug ?? "ai-office");
  const [pending, start] = useTransition();

  const groups = items
    .filter((item) => !item.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const availableCategories = categories.filter(
    (cat) => !groups.some((group) => group.icon === cat.slug),
  );
  const allCategoriesCreated = availableCategories.length === 0;

  const children = useMemo(
    () =>
      items
        .filter((item) => item.parentId === selected)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [items, selected],
  );

  const activeGroup = groups.find((group) => group.id === selected);
  const activeCategorySlug =
    activeGroup?.icon || categories[0]?.slug || "ai-office";

  const run = (job: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const result = await job();
      if (result.ok) {
        toast.success(result.message);
        location.reload();
      } else {
        toast.error(result.message);
      }
    });

  const move = (list: CourseMenuItem[], index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    run(() =>
      reorderMenuItems(next.map((item, sortOrder) => ({ id: item.id, sortOrder }))),
    );
  };

  const addGroup = () => {
    const title = newGroupTitle.trim();
    if (!title) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }
    if (groups.some((group) => group.icon === newGroupCategory)) {
      toast.error("Danh mục này đã có trong menu");
      return;
    }
    if (
      groups.some(
        (group) =>
          group.title.trim().toLocaleLowerCase("vi") ===
          title.toLocaleLowerCase("vi"),
      )
    ) {
      toast.error("Tên nhóm này đã tồn tại");
      return;
    }
    setGroupDialogOpen(false);
    run(() =>
      createMenuItem({
        title,
        icon: newGroupCategory,
        sortOrder: groups.length,
        isActive: true,
      }),
    );
  };

  const openGroupDialog = () => {
    const nextCategory = availableCategories[0] || categories[0];
    if (nextCategory) {
      setNewGroupCategory(nextCategory.slug);
      setNewGroupTitle(nextCategory.name);
    }
    setGroupDialogOpen(true);
  };

  const addTopic = () => {
    if (!selected || !selectedTag) return;
    const tag = tags.find((item) => item.id === selectedTag);
    if (!tag) return;
    if (children.some((item) => item.url?.includes(`tag=${tag.slug}`))) {
      toast.error("Chủ đề này đã có trong nhóm");
      return;
    }

    const count = tag.categoryCounts?.[activeCategorySlug] ?? 0;
    if (count === 0) {
      toast.info(
        `Chủ đề "${tag.name}" hiện chưa có khóa học published nào trong danh mục này.`,
      );
    }

    run(() =>
      createMenuItem({
        title: tag.name,
        parentId: selected,
        url: `/courses?category=${activeCategorySlug}&tag=${tag.slug}`,
        sortOrder: children.length,
        isActive: true,
      }),
    );
  };

  const patchLocal = (id: string, value: Partial<CourseMenuItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...value } : item)),
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <button
          disabled={pending}
          onClick={openGroupDialog}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 font-semibold text-white disabled:opacity-50 cursor-pointer"
        >
          <Plus size={17} /> Thêm nhóm danh mục
        </button>
        <button
          disabled={pending || items.length > 0}
          onClick={() => run(seedCourseMenu)}
          className="min-h-11 rounded-lg border px-4 font-semibold disabled:opacity-50 cursor-pointer"
        >
          Tạo menu từ danh mục và tag
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.6fr)]">
        {/* Cột trái: Nhóm danh mục khóa học */}
        <section aria-label="Nhóm danh mục khóa học" className="space-y-2">
          {groups.map((group, index) => (
            <div
              key={group.id}
              className={`rounded-xl border p-3 ${
                selected === group.id
                  ? "border-blue-400 bg-blue-50/60"
                  : "border-slate-200"
              }`}
            >
              <button
                className="mb-2 w-full text-left font-semibold cursor-pointer"
                onClick={() => setSelected(group.id)}
              >
                {group.title}
              </button>
              <div className="grid gap-2 sm:grid-cols-[1fr_150px] lg:grid-cols-1 xl:grid-cols-[1fr_150px]">
                <input
                  aria-label="Tên nhóm hiển thị"
                  className={input}
                  value={group.title}
                  placeholder="Tên nhóm hiển thị"
                  onChange={(event) =>
                    patchLocal(group.id, { title: event.target.value })
                  }
                />
                <select
                  aria-label="Danh mục lọc"
                  className={input}
                  value={group.icon ?? categories[0]?.slug ?? "ai-office"}
                  onChange={(event) =>
                    patchLocal(group.id, { icon: event.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex gap-2">
                <IconButton label="Lên" onClick={() => move(groups, index, -1)}>
                  <ArrowUp />
                </IconButton>
                <IconButton label="Xuống" onClick={() => move(groups, index, 1)}>
                  <ArrowDown />
                </IconButton>
                <IconButton
                  label="Ẩn/hiện"
                  onClick={() =>
                    patchLocal(group.id, { isActive: !group.isActive })
                  }
                >
                  {group.isActive ? <Eye /> : <EyeOff />}
                </IconButton>
                <IconButton
                  label="Lưu"
                  onClick={() =>
                    run(() =>
                      updateMenuItem(group.id, {
                        title: group.title,
                        icon: group.icon,
                        isActive: group.isActive,
                      }),
                    )
                  }
                >
                  <Save />
                </IconButton>
                <IconButton
                  label="Xóa"
                  danger
                  onClick={() =>
                    confirm(`Xóa nhóm “${group.title}”?`) &&
                    run(() => deleteMenuItem(group.id))
                  }
                >
                  <Trash2 />
                </IconButton>
              </div>
            </div>
          ))}
        </section>

        {/* Cột phải: Chủ đề trong nhóm */}
        <section aria-label="Chủ đề trong nhóm" className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold">Chủ đề trong danh mục</h3>
            <div className="flex gap-2">
              <select
                aria-label="Chọn tag khóa học"
                className={input}
                value={selectedTag}
                onChange={(event) => setSelectedTag(event.target.value)}
                disabled={!selected || pending}
              >
                {tags.map((tag) => {
                  const count = tag.categoryCounts?.[activeCategorySlug] ?? 0;
                  return (
                    <option key={tag.id} value={tag.id}>
                      {tag.name} — {count} khóa học{count === 0 ? " (trong danh mục này)" : ""}
                    </option>
                  );
                })}
              </select>
              <button
                disabled={!selected || !selectedTag || pending}
                onClick={addTopic}
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 font-semibold disabled:opacity-50 cursor-pointer"
              >
                <Plus size={16} /> Thêm chủ đề
              </button>
            </div>
          </div>

          {children.map((child, index) => (
            <div
              key={child.id}
              className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_1.5fr_100px_auto]"
            >
              <input
                aria-label="Tên chủ đề"
                className={input}
                value={child.title}
                onChange={(event) =>
                  patchLocal(child.id, { title: event.target.value })
                }
              />
              <input
                aria-label="URL bộ lọc"
                className={input}
                value={child.url ?? ""}
                onChange={(event) =>
                  patchLocal(child.id, { url: event.target.value || null })
                }
              />
              <input
                aria-label="Badge"
                className={input}
                placeholder="HOT"
                value={child.badge ?? ""}
                onChange={(event) =>
                  patchLocal(child.id, { badge: event.target.value || null })
                }
              />
              <div className="flex gap-1">
                <IconButton label="Lên" onClick={() => move(children, index, -1)}>
                  <ArrowUp />
                </IconButton>
                <IconButton label="Xuống" onClick={() => move(children, index, 1)}>
                  <ArrowDown />
                </IconButton>
                <IconButton
                  label="Ẩn/hiện"
                  onClick={() =>
                    patchLocal(child.id, { isActive: !child.isActive })
                  }
                >
                  {child.isActive ? <Eye /> : <EyeOff />}
                </IconButton>
                <IconButton
                  label="Lưu"
                  onClick={() =>
                    run(() =>
                      updateMenuItem(child.id, {
                        title: child.title,
                        url: child.url,
                        badge: child.badge,
                        isActive: child.isActive,
                      }),
                    )
                  }
                >
                  <Save />
                </IconButton>
                <IconButton
                  label="Xóa"
                  danger
                  onClick={() =>
                    confirm(`Xóa “${child.title}”?`) &&
                    run(() => deleteMenuItem(child.id))
                  }
                >
                  <Trash2 />
                </IconButton>
              </div>
            </div>
          ))}

          {selected && children.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
              Danh mục này chưa có chủ đề. Chọn một tag và bấm “Thêm chủ đề”.
            </p>
          ) : null}
        </section>
      </div>

      {/* Xem trước cấu trúc menu */}
      <section aria-label="Xem trước" className="rounded-xl bg-slate-950 p-5 text-white">
        <p className="mb-3 text-sm font-semibold text-slate-300">
          Xem trước menu lọc chủ đề theo danh mục
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            {groups
              .filter((item) => item.isActive)
              .map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelected(group.id)}
                  className={`block min-h-10 w-full rounded-lg px-3 text-left cursor-pointer ${
                    selected === group.id
                      ? "bg-white text-slate-950"
                      : "hover:bg-white/10"
                  }`}
                >
                  {group.title}
                </button>
              ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {children
              .filter((item) => item.isActive)
              .map((child) => (
                <div key={child.id} className="rounded-lg bg-white/10 p-3">
                  <span>{child.title}</span>
                  {child.badge ? (
                    <span className="ml-2 rounded bg-orange-500 px-2 py-0.5 text-xs">
                      {child.badge}
                    </span>
                  ) : null}
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Dialog thêm nhóm */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              addGroup();
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl">Thêm nhóm danh mục khóa học</DialogTitle>
              <DialogDescription>
                Nhóm xuất hiện ở cấp 1 và dùng danh mục đã chọn để lọc danh sách khóa học theo tag.
              </DialogDescription>
            </DialogHeader>

            {allCategoriesCreated && categories.length > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Đã có đủ các nhóm danh mục khóa học hiện có. Anh/chị có thể sửa tên hiển thị hoặc danh mục ngay trên từng nhóm hiện tại.
              </div>
            ) : null}

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-800">
                  Tên nhóm hiển thị
                </span>
                <input
                  autoFocus
                  className={input}
                  value={newGroupTitle}
                  onChange={(event) => setNewGroupTitle(event.target.value)}
                  placeholder="Ví dụ: AI cho công sở"
                  maxLength={255}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-800">
                  Danh mục khóa học
                </span>
                <select
                  className={input}
                  value={newGroupCategory}
                  disabled={allCategoriesCreated && categories.length > 0}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewGroupCategory(value);
                    const cat = categories.find((c) => c.slug === value);
                    if (cat) {
                      setNewGroupTitle(cat.name);
                    }
                  }}
                >
                  {categories.map((cat) => {
                    const exists = groups.some(
                      (group) => group.icon === cat.slug,
                    );
                    return (
                      <option key={cat.id} value={cat.slug} disabled={exists}>
                        {cat.name}
                        {exists ? " — đã có" : ""}
                      </option>
                    );
                  })}
                </select>
              </label>
            </div>
            <DialogFooter>
              <DialogClose className="min-h-11 rounded-lg border border-slate-300 px-4 font-semibold cursor-pointer">
                Hủy
              </DialogClose>
              <button
                type="submit"
                disabled={pending || (allCategoriesCreated && categories.length > 0) || !newGroupTitle.trim()}
                className="min-h-11 rounded-lg bg-blue-600 px-5 font-semibold text-white disabled:opacity-50 cursor-pointer"
              >
                {pending ? "Đang thêm…" : "Thêm nhóm"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid size-10 place-items-center rounded-lg border cursor-pointer ${
        danger ? "border-red-200 text-red-600 hover:bg-red-50" : "border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
