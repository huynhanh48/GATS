"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createBannedWord,
  deleteBannedWord,
  updateBannedWord,
  type BannedWord,
} from "../actions";

type Props = {
  words: BannedWord[];
};

export function BannedWordManager({ words }: Props) {
  const [pending, startTransition] = useTransition();
  const [word, setWord] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message);
        setWord("");
        setNote("");
        setEditingId(null);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6 p-4">
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          const payload = {
            word: word.trim(),
            note: note.trim() || undefined,
          };
          if (!payload.word) return;
          if (editingId) {
            run(() => updateBannedWord(editingId, payload));
          } else {
            run(() => createBannedWord(payload));
          }
        }}
      >
        <label className="block flex-1 text-xs text-slate-500">
          Từ / cụm từ cấm
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="VD: từ tục"
            required
            maxLength={100}
          />
        </label>
        <label className="block flex-1 text-xs text-slate-500">
          Ghi chú (tuỳ chọn)
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={255}
          />
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[#0070EB] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {editingId ? "Lưu" : "Thêm"}
          </button>
          {editingId ? (
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
              onClick={() => {
                setEditingId(null);
                setWord("");
                setNote("");
              }}
            >
              Hủy
            </button>
          ) : null}
        </div>
      </form>

      {words.length === 0 ? (
        <p className="text-sm text-slate-500">
          Chưa có từ cấm. Thêm từ để hệ thống tự thay bằng dấu * trong bình luận.
        </p>
      ) : (
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="px-2 py-2">Từ</th>
              <th className="px-2 py-2">Trạng thái</th>
              <th className="px-2 py-2">Ghi chú</th>
              <th className="px-2 py-2 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {words.map((row) => (
              <tr key={row.id}>
                <td className="px-2 py-3 font-medium text-slate-900 dark:text-white">
                  {row.word}
                  <div className="text-xs font-normal text-slate-400">
                    → {"*".repeat(Math.min(row.word.length, 12))}
                    {row.word.length > 12 ? "…" : ""}
                  </div>
                </td>
                <td className="px-2 py-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      run(() =>
                        updateBannedWord(row.id, { isActive: !row.isActive }),
                      )
                    }
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      row.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {row.isActive ? "Đang lọc" : "Tắt"}
                  </button>
                </td>
                <td className="px-2 py-3 text-slate-500">{row.note ?? "—"}</td>
                <td className="px-2 py-3 text-right">
                  <button
                    type="button"
                    className="mr-2 text-sm text-[#0070EB] hover:underline"
                    onClick={() => {
                      setEditingId(row.id);
                      setWord(row.word);
                      setNote(row.note ?? "");
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    className="text-sm text-rose-600 hover:underline"
                    onClick={() => {
                      if (!confirm(`Xóa từ cấm “${row.word}”?`)) return;
                      run(() => deleteBannedWord(row.id));
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
