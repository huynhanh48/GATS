"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Pin, RefreshCw, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteCourseChatMessage,
  fetchCourseChat,
  sendCourseChatMessage,
  setCourseChatMessagePinned,
  type CourseChatMessage,
} from "@/services/course-chat.service";

type Props = {
  courseId: string;
  currentUserId: number;
};

function messageTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function apiErrorMessage(error: any, fallback: string) {
  return error?.error || error?.message || fallback;
}

function isAccessClosed(message: string) {
  return (
    message === "Khóa học đã bị xóa" ||
    message.includes("cần đăng ký khóa học")
  );
}

export function CourseChatPanel({ courseId, currentUserId }: Props) {
  const [messages, setMessages] = useState<CourseChatMessage[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [accessClosed, setAccessClosed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const accessClosedRef = useRef(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await fetchCourseChat(courseId);
      setMessages(result.messages);
      setCanManage(result.canManage);
      setError("");
    } catch (err: any) {
      const message = apiErrorMessage(err, "Không tải được nhóm thảo luận");
      if (isAccessClosed(message)) {
        accessClosedRef.current = true;
        setAccessClosed(true);
        setError(message);
      } else if (!silent) {
        setError(message);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      if (!accessClosedRef.current) void load(true);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = content.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      await sendCourseChatMessage(courseId, value);
      setContent("");
      await load(true);
    } catch (err: any) {
      const message = apiErrorMessage(err, "Chưa gửi được tin nhắn");
      if (isAccessClosed(message)) {
        accessClosedRef.current = true;
        setAccessClosed(true);
        setError(message);
      }
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const togglePin = async (message: CourseChatMessage) => {
    try {
      await setCourseChatMessagePinned(courseId, message.id, !message.pinnedAt);
      await load(true);
    } catch (err: any) {
      const message = apiErrorMessage(err, "Chưa cập nhật được tin ghim");
      if (isAccessClosed(message)) {
        accessClosedRef.current = true;
        setAccessClosed(true);
        setError(message);
      }
      toast.error(message);
    }
  };

  const remove = async (message: CourseChatMessage) => {
    try {
      await deleteCourseChatMessage(courseId, message.id);
      setMessages((current) => current.filter((item) => item.id !== message.id));
    } catch (err: any) {
      const message = apiErrorMessage(err, "Chưa xóa được tin nhắn");
      if (isAccessClosed(message)) {
        accessClosedRef.current = true;
        setAccessClosed(true);
        setError(message);
      }
      toast.error(message);
    }
  };

  return (
    <section className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/30 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground">Nhóm học tập của khóa</h3>
            <p className="truncate text-xs text-muted-foreground">Trao đổi cùng mentor và các học viên đã đăng ký</p>
          </div>
        </div>
        <button type="button" disabled={accessClosed} onClick={() => void load()} className="grid min-h-11 min-w-11 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40" aria-label="Tải lại tin nhắn">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="h-[360px] overflow-y-auto bg-background/50 px-4 py-5 sm:px-6" aria-live="polite">
        {loading ? (
          <div className="grid h-full place-items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : error ? (
          <div className="grid h-full place-items-center text-center"><div><p className="text-sm font-semibold text-destructive">{error}</p>{accessClosed ? <p className="mt-2 text-sm text-muted-foreground">Lịch sử trò chuyện được bảo lưu và sẽ mở lại nếu khóa học được khôi phục.</p> : <button type="button" onClick={() => void load()} className="mt-3 text-sm font-bold text-primary">Thử lại</button>}</div></div>
        ) : messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center"><div><MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/60" /><p className="mt-3 font-semibold text-foreground">Bắt đầu cuộc trò chuyện</p><p className="mt-1 text-sm text-muted-foreground">Hãy gửi lời chào tới mentor và lớp học.</p></div></div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const mine = Number(message.senderId) === Number(currentUserId);
              return (
                <article key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[86%] sm:max-w-[72%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                    <div className="mb-1 flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
                      <span className="font-semibold">{mine ? "Bạn" : message.senderName || "Học viên"}</span>
                      {message.isMentor ? <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-bold text-primary">Mentor</span> : null}
                      <span>{messageTime(message.createdAt)}</span>
                      {message.pinnedAt ? <span className="inline-flex items-center gap-1 font-semibold text-primary"><Pin className="h-3 w-3" /> Đã ghim</span> : null}
                    </div>
                    <div className={`group relative rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card text-foreground shadow-sm"}`}>
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    {(canManage || mine) ? (
                      <div className="mt-1 flex gap-1">
                        {canManage ? <button type="button" onClick={() => void togglePin(message)} className="rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-primary">{message.pinnedAt ? "Bỏ ghim" : "Ghim"}</button> : null}
                        <button type="button" onClick={() => void remove(message)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3 w-3" /> Xóa</button>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {!accessClosed ? <form onSubmit={submit} className="flex items-end gap-3 border-t border-border bg-card p-4 sm:p-5">
        <label className="sr-only" htmlFor="course-chat-message">Tin nhắn</label>
        <textarea id="course-chat-message" value={content} onChange={(event) => setContent(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={1} maxLength={2000} placeholder="Nhắn cho mentor và lớp học..." className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" />
        <button type="submit" disabled={!content.trim() || sending} className="grid min-h-11 min-w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Gửi tin nhắn">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form> : null}
    </section>
  );
}
