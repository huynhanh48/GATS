"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, FileText, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type {
  CreatePostInput,
  PostDetail,
  PostStatus,
  PostVisibility,
  UpdatePostInput,
} from "@/lib/api/types";
import { CategorySelect } from "@/app/admin/category/_components/category-select";
import { createPost, updatePost } from "../actions";

const SimpleEditor = dynamic(
  () =>
    import("@/components/tiptap-templates/simple/simple-editor").then(
      (m) => m.SimpleEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-stroke text-sm text-dark-4 dark:border-dark-3 dark:text-dark-6">
        Đang tải trình soạn thảo...
      </div>
    ),
  },
);

const VISIBILITY_OPTIONS: { value: PostVisibility; label: string }[] = [
  { value: "public", label: "Công khai" },
  { value: "members_only", label: "Chỉ thành viên" },
  { value: "private", label: "Riêng tư" },
];

const STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: "draft", label: "Bản nháp" },
  { value: "published", label: "Đã xuất bản" },
  { value: "archived", label: "Lưu trữ" },
];

const selectClass =
  "h-10 w-full rounded-lg border border-stroke bg-transparent px-3 text-sm text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary";

export type PostFormPageProps = {
  mode: "create" | "edit";
  post?: PostDetail;
};

export function PostFormPage({ mode, post }: PostFormPageProps) {
  const router = useRouter();
  const backHref = "/post";
  const [content, setContent] = useState(post?.content ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = form.get("title")?.toString().trim() ?? "";
    const slug = form.get("slug")?.toString().trim();
    const excerpt = form.get("excerpt")?.toString().trim();
    const thumbnail = form.get("thumbnail")?.toString().trim();
    const categoryId = form.get("category_id")?.toString().trim();
    const tagsRaw = form.get("tags")?.toString().trim();
    const visibility = form.get("visibility")?.toString() as
      | PostVisibility
      | undefined;
    const status = form.get("status")?.toString() as PostStatus | undefined;
    const trimmedContent = content.trim();

    if (!title) {
      toast.error("Tiêu đề bài viết là bắt buộc");
      return;
    }

    if (!trimmedContent || trimmedContent === "<p></p>") {
      toast.error("Nội dung bài viết là bắt buộc");
      return;
    }

    const tags = tagsRaw
      ? tagsRaw
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined;

    setLoading(true);

    if (mode === "create") {
      const input: CreatePostInput = {
        title,
        content: trimmedContent,
        ...(slug ? { slug } : {}),
        ...(excerpt ? { excerpt } : {}),
        ...(thumbnail ? { thumbnail } : {}),
        ...(categoryId ? { category_id: categoryId } : {}),
        ...(tags?.length ? { tags } : {}),
        ...(visibility ? { visibility } : {}),
      };

      const result = await createPost(input);
      setLoading(false);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      if (result.postId) {
        router.push(`/admin/post/${result.postId}/edit`);
        router.refresh();
        return;
      }
      router.push(backHref);
      router.refresh();
      return;
    }

    if (!post) {
      setLoading(false);
      toast.error("Không tìm thấy bài viết");
      return;
    }

    const input: UpdatePostInput = {
      title,
      content: trimmedContent,
      excerpt: excerpt || null,
      thumbnail: thumbnail || null,
      category_id: categoryId || null,
      ...(slug ? { slug } : {}),
      ...(tags ? { tags } : {}),
      ...(visibility ? { visibility } : {}),
      ...(status ? { status } : {}),
    };

    const result = await updatePost(post.id, input);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 max-w-full space-y-6 overflow-x-hidden"
    >
      <div className="sticky top-0 z-20 rounded-[10px] border border-stroke bg-white/95 px-4 py-4 shadow-1 backdrop-blur sm:px-6 dark:border-dark-3 dark:bg-gray-dark/95 dark:shadow-card">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-1">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm text-dark-4 transition hover:text-primary dark:text-dark-6"
            >
              <ArrowLeft className="size-4 shrink-0" />
              Quay lại danh sách
            </Link>
            <h1 className="truncate text-xl font-bold text-dark dark:text-white">
              {mode === "create" ? "Thêm bài viết" : "Sửa bài viết"}
            </h1>
          </div>

          <Button type="submit" disabled={loading} className="shrink-0">
            <Save className="mr-1.5 size-4" />
            {loading ? "Đang lưu..." : "Lưu bài viết"}
          </Button>
        </div>
      </div>

      <section className="min-w-0 max-w-full rounded-[10px] border border-stroke bg-white p-5 shadow-1 sm:p-7 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <h2 className="mb-5 text-lg font-semibold text-dark dark:text-white">
          Thông tin chung
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Nhập tiêu đề bài viết"
              defaultValue={post?.title ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (tùy chọn)</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="tu-dong-tu-tieu-de"
              defaultValue={post?.slug ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Ảnh thumbnail (URL)</Label>
            <Input
              id="thumbnail"
              name="thumbnail"
              placeholder="https://..."
              defaultValue={post?.thumbnail ?? ""}
            />
          </div>

          <div className="space-y-2">
            <CategorySelect
              type="post"
              defaultValue={post?.category?.id ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (cách nhau bằng dấu phẩy)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="nextjs, react, tips"
              defaultValue={post?.tags?.map((t) => t.name).join(", ") ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Hiển thị</Label>
            <select
              id="visibility"
              name="visibility"
              className={selectClass}
              defaultValue={post?.visibility ?? "public"}
            >
              {VISIBILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {mode === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <select
                id="status"
                name="status"
                className={selectClass}
                defaultValue={post?.status ?? "draft"}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="excerpt">Tóm tắt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              placeholder="Mô tả ngắn cho bài viết"
              defaultValue={post?.excerpt ?? ""}
            />
          </div>
        </div>
      </section>

      <section className="min-w-0 max-w-full overflow-hidden rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center gap-2 border-b border-stroke px-5 py-4 sm:px-7 sm:py-5 dark:border-dark-3">
          <FileText className="size-5 shrink-0 text-primary" />
          <h2 className="text-lg font-semibold text-dark dark:text-white">
            Nội dung bài viết
          </h2>
        </div>

        <div className="min-w-0">
          <div className="min-w-0 max-w-full overflow-x-auto">
            <SimpleEditor
              value={content}
              onChange={setContent}
              className="simple-editor-embedded !rounded-none !border-0 min-h-[800px]"
            />
          </div>
        </div>
      </section>
    </form>
  );
}
