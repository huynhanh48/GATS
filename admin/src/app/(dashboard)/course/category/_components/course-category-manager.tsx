"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Search,
  BookOpen,
  Bot,
  Brain,
  Code2,
  Database,
  ExternalLink,
  GraduationCap,
  Laptop,
  Layers3,
  Sparkles,
  Tags,
  Terminal,
  Workflow,
  UploadCloud,
  X,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import type {
  CategoryWithCounts,
  TagWithCounts,
  CategoryStatus,
  LevelMetadata,
} from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/app/(dashboard)/category/actions";
import {
  createTag,
  updateTag,
  deleteTag,
  reorderTags,
} from "@/components/tags/tag-actions";
import { StatusPill } from "@/components/Layouts/admin-surface";
import { ThumbnailFieldUpload } from "@/components/media/thumbnail-field-upload";
import { cn } from "@/lib/utils";
import { updateLevel } from "../level-actions";

export type TaxonomyTab = "all" | "tags" | "level";

type UnifiedItem = {
  id: string;
  name: string;
  slug: string;
  courseCount: number;
  status?: CategoryStatus;
  description?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  level?: string | null;
  tagIds?: string[];
  rawType: "category" | "tag" | "level";
};

type CourseCategoryManagerProps = {
  initialCategories: CategoryWithCounts[];
  initialTags: TagWithCounts[];
  initialLevels?: LevelMetadata[];
  levelCounts?: Record<string, number>;
  entityType?: "course" | "post";
  showLevels?: boolean;
};

const ITEMS_PER_PAGE = 8;

const CATEGORY_ICONS: Array<{ name: string; label: string; icon: LucideIcon }> =
  [
    { name: "BookOpen", label: "Giáo dục", icon: BookOpen },
    { name: "Bot", label: "AI / Robot", icon: Bot },
    { name: "Brain", label: "Trí tuệ AI", icon: Brain },
    { name: "Code2", label: "Lập trình", icon: Code2 },
    { name: "Workflow", label: "Tự động hóa", icon: Workflow },
    { name: "Laptop", label: "Công nghệ", icon: Laptop },
    { name: "Terminal", label: "Kỹ thuật", icon: Terminal },
    { name: "Database", label: "Dữ liệu", icon: Database },
    { name: "Layers3", label: "Nền tảng", icon: Layers3 },
    { name: "Sparkles", label: "Sáng tạo", icon: Sparkles },
  ];

const CATEGORY_ICON_MAP = Object.fromEntries(
  CATEGORY_ICONS.map((item) => [item.name, item.icon]),
) as Record<string, LucideIcon>;

function TaxonomyVisual({ item }: { item: UnifiedItem }) {
  if (item.rawType === "category" && item.thumbnail) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.thumbnail}
        alt=""
        className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-dark-3"
      />
    );
  }

  const Icon =
    item.rawType === "category"
      ? (CATEGORY_ICON_MAP[item.icon ?? ""] ?? BookOpen)
      : item.rawType === "tag"
        ? Tags
        : GraduationCap;

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#ff782d] dark:bg-orange-500/10">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

export function CourseCategoryManager({
  initialCategories,
  initialTags,
  initialLevels = [],
  levelCounts = {},
  entityType = "course",
  showLevels = true,
}: CourseCategoryManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TaxonomyTab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithCounts | null>(null);
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catStatus, setCatStatus] = useState<CategoryStatus>("active");
  const [catThumbnail, setCatThumbnail] = useState("");
  const [catIcon, setCatIcon] = useState("BookOpen");
  const [catTagIds, setCatTagIds] = useState<string[]>([]);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithCounts | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagDescription, setTagDescription] = useState("");
  const [tagLevel, setTagLevel] = useState<string>("");
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<LevelMetadata | null>(null);
  const [levelName, setLevelName] = useState("");
  const [levelDescription, setLevelDescription] = useState("");
  const [levelStatus, setLevelStatus] = useState<"active" | "inactive">("active");

  // Delete Alert
  const [deleteTarget, setDeleteTarget] = useState<UnifiedItem | null>(null);

  // Bulk selection & deletion
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const [categoriesList, setCategoriesList] =
    useState<CategoryWithCounts[]>(initialCategories);
  const [tagsList, setTagsList] = useState<TagWithCounts[]>(initialTags);
  const entityLabel = entityType === "course" ? "khóa học" : "bài viết";

  useEffect(() => {
    setCategoriesList(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    setTagsList(initialTags);
  }, [initialTags]);

  const handleMoveCategory = async (
    index: number,
    direction: "up" | "down",
  ) => {
    if (isReordering) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categoriesList.length) return;

    const previous = categoriesList;
    const updated = [...categoriesList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reorderedWithSort = updated.map((cat, i) => ({
      ...cat,
      sortOrder: i,
    }));
    setCategoriesList(reorderedWithSort);
    setIsReordering(true);

    const payload = reorderedWithSort.map((c, i) => ({
      id: c.id,
      sortOrder: i,
    }));
    try {
      const res = await reorderCategories(entityType, payload);
      if (!res.ok) {
        toast.error(res.message);
        setCategoriesList(previous);
      } else {
        toast.success("Đã cập nhật thứ tự hiển thị");
        router.refresh();
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lưu thứ tự");
      setCategoriesList(previous);
    } finally {
      setIsReordering(false);
    }
  };

  const handleMoveTag = async (index: number, direction: "up" | "down") => {
    if (isReordering) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tagsList.length) return;

    const previous = tagsList;
    const updated = [...tagsList];
    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];
    const reordered = updated.map((tag, sortOrder) => ({
      ...tag,
      sortOrder,
    }));
    setTagsList(reordered);
    setIsReordering(true);

    try {
      const result = await reorderTags(
        entityType,
        reordered.map(({ id }, sortOrder) => ({ id, sortOrder })),
      );
      if (!result.ok) {
        setTagsList(previous);
        toast.error(result.message);
        return;
      }
      toast.success("Đã cập nhật thứ tự tag trong submenu");
      router.refresh();
    } catch {
      setTagsList(previous);
      toast.error("Có lỗi xảy ra khi lưu thứ tự tag");
    } finally {
      setIsReordering(false);
    }
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    if (activeTab === "all") return handleMoveCategory(index, direction);
    if (activeTab === "tags") return handleMoveTag(index, direction);
  };

  // Convert to Unified items based on activeTab
  const currentItems = useMemo<UnifiedItem[]>(() => {
    if (activeTab === "all") {
      return categoriesList.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        courseCount:
          entityType === "course" ? (c.courseCount ?? 0) : (c.postCount ?? 0),
        status: c.status,
        description: c.description,
        thumbnail: c.thumbnail,
        icon: c.icon,
        tagIds: c.tagIds ?? [],
        rawType: "category",
      }));
    }

    if (activeTab === "tags") {
      return tagsList.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        level: t.level ?? null,
        description: t.description,
        courseCount:
          entityType === "course" ? (t.courseCount ?? 0) : (t.postCount ?? 0),
        status: (t.status as CategoryStatus) ?? "active",
        rawType: "tag",
      }));
    }

    // level tab
    return initialLevels.map((level) => ({
      id: `level-${level.code}`,
      name: level.name,
      slug: level.code,
      description: level.description,
      status: level.status,
      courseCount: levelCounts[level.code] ?? 0,
      rawType: "level",
    }));
  }, [activeTab, categoriesList, tagsList, initialLevels, levelCounts, entityType]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    if (!query) return currentItems;
    return currentItems.filter(
      (item) =>
        item.name.toLocaleLowerCase("vi").includes(query) ||
        item.slug.toLocaleLowerCase("vi").includes(query),
    );
  }, [currentItems, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / ITEMS_PER_PAGE),
  );
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const selectablePageIds = useMemo(
    () => paginatedItems.filter((i) => i.rawType !== "level").map((i) => i.id),
    [paginatedItems],
  );

  const isAllPageSelected =
    selectablePageIds.length > 0 &&
    selectablePageIds.every((id) => selectedIds.includes(id));
  const isSomePageSelected =
    selectablePageIds.some((id) => selectedIds.includes(id)) &&
    !isAllPageSelected;

  const handleSelectAllPage = (checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedIds((prev) => [...new Set([...prev, ...selectablePageIds])]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !selectablePageIds.includes(id)),
      );
    }
  };

  const handleToggleItem = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked
        ? [...new Set([...prev, id])]
        : prev.filter((item) => item !== id),
    );
  };

  const handleOpenAdd = () => {
    if (activeTab === "tags") {
      setEditingTag(null);
      setTagName("");
      setTagDescription("");
      setTagLevel("");
      setTagModalOpen(true);
      return;
    }

    if (activeTab === "level") {
      toast.info(
        "Các cấp độ khóa học (Cơ bản, Trung cấp, Nâng cao) là định nghĩa hệ thống chuẩn.",
      );
      return;
    }

    // default: Category
    setEditingCategory(null);
    setCatName("");
    setCatDescription("");
    setCatStatus("active");
    setCatThumbnail("");
    setCatIcon("BookOpen");
    setCatTagIds([]);
    setIsUploadingThumb(false);
    setCategoryModalOpen(true);
  };

  const handleEdit = (item: UnifiedItem) => {
    if (item.rawType === "category") {
      const cat = initialCategories.find((c) => c.id === item.id);
      if (cat) {
        setEditingCategory(cat);
        setCatName(cat.name);
        setCatDescription(cat.description ?? "");
        setCatStatus(cat.status);
        setCatThumbnail(cat.thumbnail ?? "");
        setCatIcon(cat.icon ?? "BookOpen");
        setCatTagIds(cat.tagIds ?? []);
        setIsUploadingThumb(false);
        setCategoryModalOpen(true);
      }
    } else if (item.rawType === "tag") {
      const t = initialTags.find((tag) => tag.id === item.id);
      if (t) {
        setEditingTag(t);
        setTagName(t.name);
        setTagDescription(t.description ?? "");
        setTagLevel(t.level ?? "");
        setTagModalOpen(true);
      }
    } else {
      const level = initialLevels.find((entry) => entry.code === item.slug);
      if (level) {
        setEditingLevel(level);
        setLevelName(level.name);
        setLevelDescription(level.description ?? "");
        setLevelStatus(level.status);
        setLevelModalOpen(true);
      }
    }
  };

  const handleDelete = (item: UnifiedItem) => {
    if (item.rawType === "level") {
      toast.info("Không thể xóa cấp độ mặc định của hệ thống.");
      return;
    }
    if (item.rawType === "category" && item.courseCount > 0) {
      toast.error(
        `Danh mục đang có ${item.courseCount} ${entityLabel}. Hãy chuyển ${entityLabel} sang danh mục khác trước.`,
      );
      return;
    }
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);

    if (deleteTarget.rawType === "category") {
      const res = await deleteCategory(deleteTarget.id, entityType);
      setLoading(false);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
    } else if (deleteTarget.rawType === "tag") {
      const res = await deleteTag(deleteTarget.id, entityType);
      setLoading(false);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
    }

    setDeleteTarget(null);
    setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
    router.refresh();
  };

  const handleOpenBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);

    const itemsToDelete = currentItems.filter((it) =>
      selectedIds.includes(it.id),
    );
    const blockedCategories = itemsToDelete.filter(
      (it) => it.rawType === "category" && it.courseCount > 0,
    );
    const validToDelete = itemsToDelete.filter(
      (it) => !(it.rawType === "category" && it.courseCount > 0),
    );

    let successCount = 0;
    let failCount = 0;

    for (const item of validToDelete) {
      if (item.rawType === "category") {
        const res = await deleteCategory(item.id, entityType);
        if (res.ok) successCount++;
        else failCount++;
      } else if (item.rawType === "tag") {
        const res = await deleteTag(item.id, entityType);
        if (res.ok) successCount++;
        else failCount++;
      }
    }

    setLoading(false);
    setBulkDeleteDialogOpen(false);
    setSelectedIds([]);

    if (successCount > 0) {
      toast.success(`Đã xóa thành công ${successCount} mục.`);
    }
    if (blockedCategories.length > 0) {
      toast.warning(
        `Bỏ qua ${blockedCategories.length} danh mục do đang có ${entityLabel} liên kết.`,
      );
    }
    if (failCount > 0) {
      toast.error(`Có ${failCount} mục xóa thất bại.`);
    }

    router.refresh();
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = catName.trim();
    if (!name) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setLoading(true);
    if (editingCategory) {
      const res = await updateCategory(editingCategory.id, entityType, {
        name,
        description: catDescription.trim() || null,
        status: catStatus,
        thumbnail: catThumbnail.trim() || null,
        icon: catIcon || null,
        tagIds: catTagIds,
      });
      setLoading(false);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Cập nhật danh mục thành công");
    } else {
      const res = await createCategory({
        name,
        type: entityType,
        description: catDescription.trim() || undefined,
        thumbnail: catThumbnail.trim() || undefined,
        icon: catIcon || undefined,
        tagIds: catTagIds,
      });
      setLoading(false);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Tạo danh mục thành công");
    }

    setCategoryModalOpen(false);
    router.refresh();
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = tagName.trim();
    if (!name) {
      toast.error("Vui lòng nhập tên tag");
      return;
    }

    setLoading(true);
    if (editingTag) {
      const res = await updateTag(
        editingTag.id,
        name,
        entityType,
        showLevels ? tagLevel || null : null,
        tagDescription,
      );
      setLoading(false);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Cập nhật tag thành công");
    } else {
      const res = await createTag(
        name,
        entityType,
        showLevels ? tagLevel || null : null,
        tagDescription,
      );
      setLoading(false);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Tạo tag thành công");
    }

    setTagModalOpen(false);
    router.refresh();
  };

  const handleSaveLevel = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingLevel || !levelName.trim()) return;
    setLoading(true);
    const result = await updateLevel(editingLevel.code, {
      name: levelName.trim(),
      description: levelDescription.trim() || null,
      status: levelStatus,
    });
    setLoading(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setLevelModalOpen(false);
    router.refresh();
  };

  return (
    <div className="w-full rounded-2xl border border-stroke bg-white p-5 shadow-xs md:p-7 dark:border-dark-3 dark:bg-dark-2">
      {/* Top Bar: Button + thêm on Left, Tabs on Right */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          onClick={handleOpenAdd}
          className="flex h-11 items-center gap-2 rounded-xl border border-stroke bg-white px-5 font-semibold text-dark shadow-xs transition-colors hover:bg-slate-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
        >
          <Plus className="h-4 w-4 text-primary" />
          <span>Thêm</span>
        </Button>

        {/* Filter / Segmented Tabs: Tất Cả | Tags | Level */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-dark-4" />
          <Input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên hoặc slug..."
            aria-label={`Tìm kiếm phân loại ${entityLabel}`}
            className="h-11 rounded-xl pl-9"
          />
        </div>

        <div className="flex items-center rounded-xl border border-stroke bg-slate-50 p-1 dark:border-dark-3 dark:bg-dark-3/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className={cn(
              "cursor-pointer rounded-lg px-5 py-2 text-sm font-semibold transition-all",
              activeTab === "all"
                ? "bg-white font-bold text-dark shadow-xs dark:bg-dark-2 dark:text-white"
                : "text-dark-4 hover:text-dark dark:text-dark-6 dark:hover:text-white",
            )}
          >
            Tất Cả
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("tags");
              setCurrentPage(1);
              setSelectedIds([]);
            }}
            className={cn(
              "cursor-pointer rounded-lg px-5 py-2 text-sm font-semibold transition-all",
              activeTab === "tags"
                ? "bg-white font-bold text-dark shadow-xs dark:bg-dark-2 dark:text-white"
                : "text-dark-4 hover:text-dark dark:text-dark-6 dark:hover:text-white",
            )}
          >
            Tags
          </button>
          {showLevels ? (
            <button
              type="button"
              onClick={() => {
                setActiveTab("level");
                setCurrentPage(1);
                setSelectedIds([]);
              }}
              className={cn(
                "cursor-pointer rounded-lg px-5 py-2 text-sm font-semibold transition-all",
                activeTab === "level"
                  ? "bg-white font-bold text-dark shadow-xs dark:bg-dark-2 dark:text-white"
                  : "text-dark-4 hover:text-dark dark:text-dark-6 dark:hover:text-white",
              )}
            >
              Level
            </button>
          ) : null}
        </div>
      </div>

      {/* Bulk Action Bar when items selected */}
      {selectedIds.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ff782d]/30 bg-orange-50/80 px-4 py-2.5 shadow-xs dark:border-orange-500/30 dark:bg-orange-950/30">
          <div className="flex items-center gap-2.5 text-sm text-dark dark:text-white">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ff782d] text-xs font-bold text-white shadow-xs">
              {selectedIds.length}
            </span>
            <span className="font-semibold text-[#d95613] dark:text-orange-300">
              Đã chọn {selectedIds.length}{" "}
              {activeTab === "tags" ? "tag" : "danh mục"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="h-8 rounded-lg text-xs font-medium"
            >
              Bỏ chọn
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={loading}
              onClick={handleOpenBulkDelete}
              className="h-8 gap-1.5 rounded-lg bg-red px-3 text-xs font-semibold text-white shadow-xs hover:bg-red/90 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xóa {selectedIds.length} mục đã chọn</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Table Container with Columns Header & Rounded Row Cards */}
      <div className="rounded-xl border border-stroke bg-slate-50/40 p-3 md:p-4 dark:border-dark-3 dark:bg-dark/30">
        {/* Table Header Row */}
        <div className="mb-3 grid grid-cols-12 items-center gap-4 border-b border-stroke/70 px-5 py-3 text-xs font-bold tracking-wider text-dark-4 uppercase dark:border-dark-3 dark:text-dark-6">
          <div className="col-span-1 flex items-center justify-center">
            {activeTab !== "level" ? (
              <Checkbox
                checked={isAllPageSelected}
                indeterminate={isSomePageSelected}
                onCheckedChange={handleSelectAllPage}
                aria-label="Chọn tất cả trên trang"
              />
            ) : null}
          </div>
          <div className="col-span-5 sm:col-span-4">
            {activeTab === "tags"
              ? "Tên Tag"
              : activeTab === "level"
                ? "Tên Cấp độ"
                : "Tên Danh mục"}
          </div>
          <div className="col-span-3 sm:col-span-4">Đường dẫn (Slug)</div>
          <div className="col-span-2 text-center">
            {entityType === "course" ? "Số lượng KH" : "Số bài viết"}
          </div>
          <div className="col-span-1 text-right">Thao tác</div>
        </div>

        {/* Data Rows */}
        {paginatedItems.length === 0 ? (
          <div className="py-12 text-center text-sm text-dark-4 dark:text-dark-6">
            Không có dữ liệu{" "}
            {activeTab === "all"
              ? "danh mục"
              : activeTab === "tags"
                ? "tag"
                : "cấp độ"}
            .
          </div>
        ) : (
          <div className="space-y-2.5">
            {paginatedItems.map((item) => {
              const catIndex =
                item.rawType === "category"
                  ? categoriesList.findIndex(
                      (category) => category.id === item.id,
                    )
                  : item.rawType === "tag"
                    ? tagsList.findIndex((tag) => tag.id === item.id)
                    : -1;
              const orderedListLength =
                activeTab === "all"
                  ? categoriesList.length
                  : activeTab === "tags"
                    ? tagsList.length
                    : 0;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "grid grid-cols-12 items-center gap-4 rounded-xl border px-5 py-3.5 transition-all",
                    selectedIds.includes(item.id)
                      ? "border-[#ff782d]/60 bg-orange-50/40 shadow-xs dark:border-orange-500/50 dark:bg-orange-950/20"
                      : "border-stroke bg-white hover:border-[#ff782d]/30 hover:shadow-xs dark:border-dark-3 dark:bg-dark-2",
                  )}
                >
                  {/* Checkbox */}
                  <div className="col-span-1 flex items-center justify-center">
                    {item.rawType !== "level" ? (
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) =>
                          handleToggleItem(item.id, Boolean(checked))
                        }
                        aria-label={`Chọn ${item.name}`}
                      />
                    ) : null}
                  </div>

                  {/* Name */}
                  <div className="col-span-5 flex min-w-0 items-center gap-3 sm:col-span-4">
                    <TaxonomyVisual item={item} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(activeTab === "all" || activeTab === "tags") &&
                        catIndex >= 0 ? (
                          <span className="inline-flex shrink-0 items-center justify-center rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-600 dark:bg-dark-3 dark:text-slate-300">
                            #{catIndex + 1}
                          </span>
                        ) : null}
                        <span className="truncate text-sm font-semibold text-dark dark:text-white">
                          {item.name}
                        </span>
                        {item.status ? (
                          <StatusPill
                            tone={item.status === "active" ? "green" : "red"}
                          >
                            {item.status === "active" ? "Đang dùng" : "Ngưng"}
                          </StatusPill>
                        ) : null}
                        {showLevels && item.rawType === "tag" && item.level ? (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                            {item.level === "beginner"
                              ? "Cơ bản"
                              : item.level === "intermediate"
                                ? "Trung cấp"
                                : item.level === "advanced"
                                  ? "Nâng cao"
                                  : item.level}
                          </span>
                        ) : null}
                      </div>
                      {item.description ? (
                        <p className="mt-0.5 truncate text-xs text-dark-4 dark:text-dark-6">
                          {item.description}
                        </p>
                      ) : null}
                      {item.rawType === "category" &&
                      item.tagIds &&
                      item.tagIds.length > 0 ? (
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          {item.tagIds.slice(0, 3).map((tagId) => {
                            const tag = initialTags.find((t) => t.id === tagId);
                            if (!tag) return null;
                            return (
                              <span
                                key={tagId}
                                className="inline-flex items-center rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-[#d95613] dark:bg-orange-500/10 dark:text-orange-300"
                              >
                                #{tag.name}
                              </span>
                            );
                          })}
                          {item.tagIds.length > 3 ? (
                            <span className="text-[10px] text-dark-4">
                              +{item.tagIds.length - 3}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Slug */}
                  <div className="col-span-3 min-w-0 sm:col-span-4">
                    <code className="inline-block max-w-full truncate rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-dark-3 dark:text-slate-300">
                      /{item.slug}
                    </code>
                  </div>

                  {/* Số lượng KH */}
                  <div className="col-span-2 text-center">
                    <span className="inline-flex h-6 min-w-[32px] items-center justify-center rounded-full bg-slate-100 px-2.5 text-xs font-bold text-dark-4 dark:bg-dark-3 dark:text-dark-6">
                      {item.courseCount}
                    </span>
                  </div>

                  {/* Thao tác */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    {(activeTab === "all" || activeTab === "tags") &&
                    catIndex >= 0 &&
                    !searchQuery ? (
                      <div className="mr-1 hidden items-center gap-0.5 sm:flex">
                        <button
                          type="button"
                          disabled={catIndex === 0 || loading || isReordering}
                          onClick={() => handleMoveItem(catIndex, "up")}
                          title="Di chuyển lên"
                          className="flex h-7 w-7 items-center justify-center rounded border border-stroke bg-white text-dark-4 transition-colors hover:bg-slate-100 hover:text-dark disabled:cursor-not-allowed disabled:opacity-25 dark:border-dark-3 dark:bg-dark-2"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={
                            catIndex === orderedListLength - 1 ||
                            loading ||
                            isReordering
                          }
                          onClick={() => handleMoveItem(catIndex, "down")}
                          title="Di chuyển xuống"
                          className="flex h-7 w-7 items-center justify-center rounded border border-stroke bg-white text-dark-4 transition-colors hover:bg-slate-100 hover:text-dark disabled:cursor-not-allowed disabled:opacity-25 dark:border-dark-3 dark:bg-dark-2"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : null}

                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-stroke bg-white transition-colors outline-none hover:bg-slate-100 dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-dark-3">
                        <MoreHorizontal className="h-4 w-4 text-dark-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40 rounded-xl border border-stroke bg-white p-1 text-sm shadow-lg dark:border-dark-3 dark:bg-dark-2"
                      >
                        {(activeTab === "all" || activeTab === "tags") &&
                        catIndex >= 0 &&
                        !searchQuery ? (
                          <>
                            <DropdownMenuItem
                              disabled={catIndex === 0 || isReordering}
                              onClick={() => handleMoveItem(catIndex, "up")}
                              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-dark outline-none hover:bg-slate-50 disabled:opacity-40 dark:text-white dark:hover:bg-dark-3"
                            >
                              <ArrowUp className="h-3.5 w-3.5 text-slate-500" />
                              <span>Đưa lên trên</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={
                                catIndex === orderedListLength - 1 ||
                                isReordering
                              }
                              onClick={() => handleMoveItem(catIndex, "down")}
                              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-dark outline-none hover:bg-slate-50 disabled:opacity-40 dark:text-white dark:hover:bg-dark-3"
                            >
                              <ArrowDown className="h-3.5 w-3.5 text-slate-500" />
                              <span>Đưa xuống dưới</span>
                            </DropdownMenuItem>
                          </>
                        ) : null}
                        <DropdownMenuItem
                          onClick={() => handleEdit(item)}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-dark outline-none hover:bg-slate-50 dark:text-white dark:hover:bg-dark-3"
                        >
                          <Pencil className="h-3.5 w-3.5 text-primary" />
                          <span>Sửa</span>
                        </DropdownMenuItem>
                        {item.rawType === "category" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/${entityType}?category=${encodeURIComponent(item.slug)}`,
                              )
                            }
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-dark outline-none hover:bg-slate-50 dark:text-white dark:hover:bg-dark-3"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-sky-600" />
                            <span>Xem {entityLabel}</span>
                          </DropdownMenuItem>
                        ) : null}
                        {item.rawType !== "level" ? (
                          <DropdownMenuItem
                            onClick={() => handleDelete(item)}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-red outline-none hover:bg-red/10 dark:hover:bg-red/10"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red" />
                            <span>Xóa</span>
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Pagination Bar: 1/10 [v] on Left, Prev/Next on Right */}
      <div className="mt-2 flex items-center justify-between pt-5">
        {/* Left: Page selector indicator */}
        <div className="flex items-center gap-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-xl border border-stroke bg-white px-3.5 py-1.5 text-sm font-bold text-dark shadow-xs transition-colors outline-none hover:bg-slate-50 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3">
              <span>
                {currentPage}/{totalPages}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-dark-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-56 w-32 overflow-y-auto rounded-xl border border-stroke bg-white p-1 shadow-lg dark:border-dark-3 dark:bg-dark-2"
            >
              {Array.from({ length: totalPages }).map((_, idx) => (
                <DropdownMenuItem
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold outline-none",
                    currentPage === idx + 1
                      ? "bg-primary text-white"
                      : "text-dark hover:bg-slate-100 dark:text-white dark:hover:bg-dark-3",
                  )}
                >
                  Trang {idx + 1}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-xs text-dark-4 dark:text-dark-6">
            ({filteredItems.length} mục)
          </span>
        </div>

        {/* Right: Prev & Next buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-9 rounded-xl border-stroke px-4 font-semibold disabled:opacity-40 dark:border-dark-3"
          >
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-9 rounded-xl border-stroke px-4 font-semibold disabled:opacity-40 dark:border-dark-3"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Category Modal (Add / Edit) */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory
                ? `Sửa danh mục ${entityLabel}`
                : `Thêm danh mục ${entityLabel}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="c-name">Tên danh mục</Label>
              <Input
                id="c-name"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Ví dụ: AI cho công sở"
                required
              />
              <p className="text-xs text-dark-4">
                Slug sẽ được tự động tạo theo tên danh mục.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-description">Mô tả</Label>
              <Textarea
                id="c-description"
                rows={3}
                value={catDescription}
                onChange={(event) => setCatDescription(event.target.value)}
                placeholder={`Mô tả ngắn cho danh mục ${entityLabel}`}
              />
            </div>

            {editingCategory ? (
              <div className="space-y-2">
                <Label htmlFor="c-status">Trạng thái</Label>
                <select
                  id="c-status"
                  className="h-10 w-full rounded-lg border border-stroke bg-transparent px-3 text-sm text-dark outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                  value={catStatus}
                  onChange={(e) =>
                    setCatStatus(e.target.value as CategoryStatus)
                  }
                >
                  <option value="active">Đang dùng</option>
                  <option value="inactive">Ngưng</option>
                </select>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Tags trong danh mục</Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 w-full justify-between rounded-lg border-stroke bg-white px-3 font-normal dark:border-dark-3 dark:bg-dark-2"
                    />
                  }
                >
                  <span className="truncate text-left">
                    {catTagIds.length === 0
                      ? "Chọn tag cho danh mục"
                      : `${catTagIds.length} tag đã chọn`}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-dark-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  positionerClassName="z-[100]"
                  className="max-h-64 rounded-xl"
                >
                  {initialTags.length > 0 ? (
                    initialTags.map((tag) => (
                      <DropdownMenuCheckboxItem
                        key={tag.id}
                        checked={catTagIds.includes(tag.id)}
                        closeOnClick={false}
                        onCheckedChange={(checked) =>
                          setCatTagIds((current) =>
                            checked
                              ? [...new Set([...current, tag.id])]
                              : current.filter((id) => id !== tag.id),
                          )
                        }
                        onSelect={(event) => event.preventDefault()}
                      >
                        {tag.name}
                      </DropdownMenuCheckboxItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      Chưa có tag khả dụng
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {catTagIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {catTagIds.map((id) => {
                    const tag = initialTags.find((t) => t.id === id);
                    if (!tag) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-[#d95613] dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300"
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() =>
                            setCatTagIds((current) =>
                              current.filter((item) => item !== id),
                            )
                          }
                          className="hover:text-orange-800 dark:hover:text-orange-100"
                          title="Bỏ chọn tag"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-dark-4">
                Chọn các tag chủ đề thuộc danh mục này.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-category-thumbnail">Ảnh đại diện</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="course-category-thumbnail"
                  value={catThumbnail}
                  onChange={(event) => setCatThumbnail(event.target.value)}
                  placeholder="Dán URL ảnh"
                  className="min-w-0 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-10 shrink-0 gap-2 rounded-lg px-4"
                  disabled={loading || isUploadingThumb}
                  onClick={() =>
                    document
                      .getElementById("course-category-thumbnail-file")
                      ?.click()
                  }
                >
                  {isUploadingThumb ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  {isUploadingThumb ? "Đang tải..." : "Chọn ảnh"}
                </Button>
              </div>
              <ThumbnailFieldUpload
                inputId="course-category-thumbnail"
                fileInputId="course-category-thumbnail-file"
                initialUrl={catThumbnail}
                presetType="course"
                aspectRatio="16/9"
                badgeLabel="Danh mục"
                disabled={loading}
                onUrlChange={setCatThumbnail}
                onUploadingChange={setIsUploadingThumb}
                hideUploadTrigger
                hideEmptyState
              />
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-dark dark:text-white">
                Icon danh mục
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {CATEGORY_ICONS.map(({ name, label, icon: Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setCatIcon(name)}
                    aria-pressed={catIcon === name}
                    className={cn(
                      "flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-xs font-medium transition-colors",
                      catIcon === name
                        ? "border-[#ff782d] bg-orange-50 text-[#d95613] ring-2 ring-orange-100 dark:bg-orange-500/10 dark:ring-orange-500/10"
                        : "border-stroke bg-white text-dark-4 hover:border-orange-200 hover:bg-orange-50/50 dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="text-center leading-tight">{label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-dark-4 dark:text-dark-6">
                Icon được lưu bằng tên preset an toàn và sẽ dùng khi danh mục
                chưa có ảnh.
              </p>
            </fieldset>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tag Modal (Add / Edit) */}
      <Dialog open={tagModalOpen} onOpenChange={setTagModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTag ? "Sửa Tag" : "Thêm Tag mới"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveTag} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="t-name">Tên Tag</Label>
              <Input
                id="t-name"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Ví dụ: Python, Automation, Prompt"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-description">Mô tả</Label>
              <Textarea
                id="t-description"
                rows={3}
                value={tagDescription}
                onChange={(event) => setTagDescription(event.target.value)}
                placeholder="Mô tả ngắn cho tag"
              />
            </div>

            {showLevels ? (
              <div className="space-y-2">
                <Label htmlFor="t-level">Cấp độ (Level)</Label>
                <select
                  id="t-level"
                  value={tagLevel}
                  onChange={(e) => setTagLevel(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-sm text-dark transition outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                >
                  <option value="">-- Chọn cấp độ (Tùy chọn) --</option>
                  <option value="beginner">Cơ bản (Beginner)</option>
                  <option value="intermediate">Trung cấp (Intermediate)</option>
                  <option value="advanced">Nâng cao (Advanced)</option>
                </select>
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTagModalOpen(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={levelModalOpen} onOpenChange={setLevelModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa cấp độ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveLevel} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="level-name">Tên cấp độ</Label>
              <Input
                id="level-name"
                value={levelName}
                onChange={(event) => setLevelName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level-description">Mô tả</Label>
              <Textarea
                id="level-description"
                rows={4}
                value={levelDescription}
                onChange={(event) => setLevelDescription(event.target.value)}
                placeholder="Mô tả kiến thức và đối tượng phù hợp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level-status">Trạng thái</Label>
              <select
                id="level-status"
                value={levelStatus}
                onChange={(event) =>
                  setLevelStatus(event.target.value as "active" | "inactive")
                }
                className="h-10 w-full rounded-lg border border-stroke bg-transparent px-3 text-sm text-dark outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
              >
                <option value="active">Đang dùng</option>
                <option value="inactive">Ngưng</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLevelModalOpen(false)} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xác nhận xóa{" "}
              {deleteTarget?.rawType === "category" ? "danh mục" : "tag"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{deleteTarget?.name}</strong>?
              {entityType === "post" && deleteTarget?.rawType === "tag"
                ? " Tag sẽ được gỡ khỏi các bài viết liên quan, nội dung bài viết vẫn được giữ nguyên."
                : " Chỉ danh mục không còn được sử dụng mới có thể xóa."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={confirmDelete}
              className="bg-red text-white hover:bg-red/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Bulk Delete Confirmation Alert */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red">
              <Trash2 className="h-5 w-5" />
              Xác nhận xóa hàng loạt ({selectedIds.length}{" "}
              {activeTab === "tags" ? "tag" : "danh mục"})
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2 text-sm text-dark-4 dark:text-dark-6">
                <p>
                  Bạn có chắc chắn muốn xóa{" "}
                  <strong className="text-dark dark:text-white">
                    {selectedIds.length}
                  </strong>{" "}
                  mục đã chọn không? Thao tác này không thể hoàn tác.
                </p>
                {activeTab === "all" &&
                  currentItems.some(
                    (it) => selectedIds.includes(it.id) && it.courseCount > 0,
                  ) && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
                      <strong>Lưu ý:</strong> Các danh mục đang chứa{" "}
                      {entityLabel}
                      sẽ tự động được bỏ qua để bảo vệ dữ liệu.
                    </div>
                  )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={confirmBulkDelete}
              className="bg-red text-white hover:bg-red/90"
            >
              {loading ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
