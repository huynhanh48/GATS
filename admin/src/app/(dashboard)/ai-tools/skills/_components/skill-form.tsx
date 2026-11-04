"use client";

import { AdminPanel } from "@/components/Layouts/admin-surface";
import { ThumbnailFieldUpload } from "@/components/media/thumbnail-field-upload";
import { mediaClient } from "@/services/media.client";
import { ArrowLeft, FileArchive, Save, Trash2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { aiToolFieldClass } from "../../_components/ai-tool-manager";
import {
  createSkill,
  type AiToolConfig,
  updateAiToolConfig,
} from "../../actions";

type SkillFile = {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
};

const empty = {
  description: "",
  version: "1.0.0",
  category: "General",
  instructions: "",
  price: 12000,
  imageUrl: "",
  files: [] as SkillFile[],
};

const formatFileSize = (bytes: number) =>
  bytes < 1024
    ? `${Math.max(0, Math.round(bytes))} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export function SkillForm({ initialItem }: { initialItem?: AiToolConfig }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [item, setItem] = useState<AiToolConfig>(
    initialItem ?? {
      id: "new",
      type: "skill",
      itemKey: "",
      title: "",
      isPublic: true,
      isPaid: false,
      websiteUrl: null,
      payload: empty,
    },
  );
  const payload = { ...empty, ...(item.payload ?? {}) };
  const files = Array.isArray(payload.files)
    ? (payload.files as SkillFile[])
    : [];

  const setPayload = (key: string, value: unknown) =>
    setItem((current) => ({
      ...current,
      payload: { ...(current.payload ?? {}), [key]: value },
    }));

  const upload = async (file: File) => {
    if (!/\.(md|zip)$/i.test(file.name)) {
      toast.error("Chỉ chấp nhận file .md hoặc .zip");
      return;
    }
    setUploading(true);
    const result = await mediaClient.uploadFile(file);
    setUploading(false);
    if (!result.data?.media) {
      toast.error(result.error?.message ?? "Upload thất bại");
      return;
    }
    const media = result.data.media;
    setPayload("files", [
      ...files,
      {
        id: media.id,
        name: media.originalName,
        url: media.url,
        mimeType: media.mimeType,
        size: media.size,
      },
    ]);
    toast.success("Đã tải file lên server");
  };

  const save = () => {
    const requiredFields = [
      ...(!item.itemKey.trim()
        ? [{ label: "ID/slug", id: "skill-item-key" }]
        : []),
      ...(!item.title.trim()
        ? [{ label: "Tên Skill", id: "skill-title" }]
        : []),
      ...(!String(payload.category).trim()
        ? [{ label: "Danh mục", id: "skill-category" }]
        : []),
      ...(!String(payload.imageUrl).trim()
        ? [{ label: "Ảnh bìa / Thumbnail", id: "skill-image" }]
        : []),
      ...(!String(payload.description).trim()
        ? [{ label: "Mô tả", id: "skill-description" }]
        : []),
      ...(files.length === 0
        ? [{ label: "File MD hoặc ZIP", id: "skill-files" }]
        : []),
    ];

    if (requiredFields.length > 0) {
      toast.error(
        `Vui lòng bổ sung: ${requiredFields.map((field) => field.label).join(", ")}`,
      );
      const target = document.getElementById(requiredFields[0].id);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => target?.focus(), 350);
      return;
    }

    startTransition(async () => {
      const input = {
        title: item.title,
        isPublic: item.isPublic,
        isPaid: item.isPaid,
        payload: item.payload,
      };
      const result = initialItem
        ? await updateAiToolConfig("skill", item.itemKey, input)
        : await createSkill({ itemKey: item.itemKey, ...input });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/ai-tools/skills");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <Link
        href="/ai-tools/skills"
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold"
      >
        <ArrowLeft size={16} /> Danh sách Skills
      </Link>
      <AdminPanel
        title={initialItem ? "Chỉnh sửa Skill" : "Thông tin Skill mới"}
        description="File được lưu trên storage của server. ZIP chỉ được tải xuống, server không tự giải nén hoặc thực thi."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {!initialItem ? (
            <Field
              id="skill-item-key"
              label="ID/slug"
              required
              value={item.itemKey}
              onChange={(value) =>
                setItem((current) => ({
                  ...current,
                  itemKey: value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                }))
              }
            />
          ) : null}
          <Field id="skill-title" label="Tên Skill" required value={item.title} onChange={(value) => setItem((current) => ({ ...current, title: value }))} />
          <Field label="Phiên bản" value={String(payload.version)} onChange={(value) => setPayload("version", value)} />
          <Field id="skill-category" label="Danh mục" required value={String(payload.category)} onChange={(value) => setPayload("category", value)} />
          <label className="space-y-1">
            <span className="text-sm font-medium">Hình thức</span>
            <select className={aiToolFieldClass} value={item.isPaid ? "paid" : "free"} onChange={(event) => setItem((current) => ({ ...current, isPaid: event.target.value === "paid" }))}>
              <option value="free">Miễn phí</option>
              <option value="paid">Trả phí</option>
            </select>
          </label>
          <Field label="Giá (VNĐ)" type="number" disabled={!item.isPaid} value={item.isPaid ? String(payload.price) : ""} onChange={(value) => setPayload("price", Number(value) || 0)} />
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="skill-image" className="text-sm font-medium">Ảnh bìa / Thumbnail Skill (URL) <span className="text-red-500">*</span></label>
            <input id="skill-image" className={aiToolFieldClass} value={String(payload.imageUrl ?? "")} onChange={(event) => setPayload("imageUrl", event.target.value)} placeholder="https://..." />
            <ThumbnailFieldUpload inputId="skill-image" initialUrl={payload.imageUrl ? String(payload.imageUrl) : ""} presetType="skill" badgeLabel={`Skill v${payload.version || "1.0"}`} onUrlChange={(url) => setPayload("imageUrl", url)} />
          </div>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium">Mô tả <span className="text-red-500">*</span></span>
            <textarea id="skill-description" className={`${aiToolFieldClass} h-auto min-h-24 py-3`} value={String(payload.description)} onChange={(event) => setPayload("description", event.target.value)} />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium">Hướng dẫn cài đặt / sử dụng</span>
            <textarea className={`${aiToolFieldClass} h-auto min-h-40 py-3`} value={String(payload.instructions)} onChange={(event) => setPayload("instructions", event.target.value)} />
          </label>
          <div className="md:col-span-2">
            <input ref={inputRef} type="file" accept=".md,.zip,text/markdown,application/zip,application/x-zip-compressed" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }} />
            <button id="skill-files" type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40">
              <UploadCloud className="size-6 text-blue-600" />
              <span className="font-semibold">{uploading ? "Đang tải lên..." : "Tải file MD hoặc ZIP"}</span>
              <span className="text-xs text-slate-500">Bắt buộc · Tối đa 500MB</span>
            </button>
            {files.length ? (
              <div className="mt-3 divide-y rounded-xl border">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3">
                    <FileArchive className="size-5 text-blue-600" />
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{file.name}</p><p className="text-xs text-slate-500">{formatFileSize(file.size)}</p></div>
                    <button type="button" onClick={() => setPayload("files", files.filter((entry) => entry.id !== file.id))} className="p-2 text-red-500"><Trash2 className="size-4" /></button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t pt-5">
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={item.isPublic} onChange={(event) => setItem((current) => ({ ...current, isPublic: event.target.checked }))} /> Public API</label>
          <button type="button" disabled={pending || uploading} onClick={save} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 font-semibold text-white disabled:opacity-50"><Save size={17} />{pending ? "Đang lưu..." : "Lưu Skill"}</button>
        </div>
      </AdminPanel>
    </div>
  );
}

function Field({ id, label, value, onChange, type = "text", disabled = false, required = false }: { id?: string; label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean; required?: boolean }) {
  return (
    <label className="space-y-1">
      <span className="text-sm font-medium">{label} {required ? <span className="text-red-500">*</span> : null}</span>
      <input id={id} type={type} disabled={disabled} className={aiToolFieldClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
