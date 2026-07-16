"use client";

import { FormEvent, useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

type CommentItem = {
  id: string;
  name: string;
  time: string;
  content: string;
};

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: "comment-1",
    name: "Minh Anh",
    time: "2 giờ trước",
    content:
      "Bài viết dễ hiểu, nhất là đoạn chia mục tiêu học theo từng tuần. Mình sẽ thử áp dụng với khóa AI văn phòng.",
  },
  {
    id: "comment-2",
    name: "Hoàng Nam",
    time: "Hôm qua",
    content:
      "Phần checklist trước khi chọn khóa khá hữu ích. Mong có thêm bài so sánh lộ trình cho người mới.",
  },
];

export function ArticleComments() {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [comments, setComments] = useState(INITIAL_COMMENTS);

  const canSubmit = name.trim().length > 1 && content.trim().length > 5;
  const commentCount = useMemo(() => comments.length, [comments]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setComments((current) => [
      {
        id: `comment-${Date.now()}`,
        name: name.trim(),
        time: "Vừa xong",
        content: content.trim(),
      },
      ...current,
    ]);
    setContent("");
  }

  return (
    <section
      id="comments"
      className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111] md:p-6"
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold text-orange-600">
            <MessageCircle className="size-4" aria-hidden="true" />
            Bình luận
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            Trao đổi về bài viết
          </h2>
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 dark:bg-[#222] dark:text-slate-300">
          {commentCount} bình luận
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Tên của bạn
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nhập tên hiển thị"
            className="min-h-12 w-full rounded-[8px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-orange-500 dark:border-slate-700 dark:bg-[#222] dark:text-white dark:placeholder:text-slate-500"
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Nội dung bình luận
          </span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Viết câu hỏi hoặc chia sẻ của bạn..."
            rows={4}
            className="w-full resize-none rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-orange-500 dark:border-slate-700 dark:bg-[#222] dark:text-white dark:placeholder:text-slate-500"
          />
        </label>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-orange-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Gửi bình luận
          <Send className="size-4" aria-hidden="true" />
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {comments.map((comment) => (
          <article
            key={comment.id}
            className="rounded-[8px] border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#181818]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">
                  {comment.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {comment.time}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {comment.content}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
