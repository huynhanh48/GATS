"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { composeNotification } from "./actions";

export function ComposeNotificationForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    const href = String(formData.get("href") ?? "").trim();
    const audienceLabel = String(formData.get("audienceLabel") ?? "").trim();

    if (title.length < 3) {
      setError("Tiêu đề cần tối thiểu 3 ký tự.");
      setSuccess(null);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await composeNotification({ title, body, href, audienceLabel });
      if (!result.ok) {
        setError(result.message ?? "Gửi thông báo thất bại");
        setSuccess(null);
        return;
      }
      setSuccess(result.message ?? "Đã gửi thông báo");
      formRef.current?.reset();
      router.refresh();
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-3 p-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <label
          htmlFor="notif-title"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Tiêu đề <span className="text-rose-600">*</span>
        </label>
        <input
          id="notif-title"
          name="title"
          required
          minLength={3}
          maxLength={255}
          disabled={pending}
          placeholder="VD: Bảo trì hệ thống lúc 22h hôm nay"
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0070EB] dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div className="sm:col-span-2">
        <label
          htmlFor="notif-body"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Nội dung
        </label>
        <textarea
          id="notif-body"
          name="body"
          rows={3}
          maxLength={2000}
          disabled={pending}
          placeholder="Chi tiết thông báo (không bắt buộc)"
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0070EB] dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div>
        <label
          htmlFor="notif-href"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Liên kết
        </label>
        <input
          id="notif-href"
          name="href"
          maxLength={500}
          disabled={pending}
          placeholder="/orders hoặc https://..."
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0070EB] dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div>
        <label
          htmlFor="notif-audience"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Đối tượng nhận
        </label>
        <input
          id="notif-audience"
          name="audienceLabel"
          maxLength={100}
          disabled={pending}
          placeholder="VD: Tất cả admin (mặc định)"
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0070EB] dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#0070EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#0060c8] disabled:opacity-60"
        >
          {pending ? "Đang gửi…" : "Gửi thông báo"}
        </button>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      </div>
    </form>
  );
}
