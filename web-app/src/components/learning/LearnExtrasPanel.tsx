"use client";

import { useEffect, useState } from "react";
import { MessageCircle, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addLessonNote,
  askLessonQuestion,
  deleteLessonNote,
  deleteLessonQuestion,
  fetchLessonNotes,
  fetchLessonQuestions,
  type LessonNote,
  type LessonQuestion,
} from "@/services/learning.service";

type TabKey = "notes" | "qna";

const TABS: Array<{ key: TabKey; label: string; icon: typeof StickyNote }> = [
  { key: "notes", label: "Ghi chú", icon: StickyNote },
  { key: "qna", label: "Hỏi đáp", icon: MessageCircle },
];

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

type Props = {
  courseId: string;
  lessonId: string;
};

export function LearnExtrasPanel({ courseId, lessonId }: Props) {
  const [tab, setTab] = useState<TabKey>("notes");

  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [notesLoading, setNotesLoading] = useState(true);
  const [noteSaving, setNoteSaving] = useState(false);

  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [questionInput, setQuestionInput] = useState("");
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionSaving, setQuestionSaving] = useState(false);

  useEffect(() => {
    if (!courseId || !lessonId) return;
    let cancelled = false;

    setNotesLoading(true);
    fetchLessonNotes(courseId, lessonId)
      .then((data) => !cancelled && setNotes(data))
      .catch(() => !cancelled && setNotes([]))
      .finally(() => !cancelled && setNotesLoading(false));

    setQuestionsLoading(true);
    fetchLessonQuestions(courseId, lessonId)
      .then((data) => !cancelled && setQuestions(data))
      .catch(() => !cancelled && setQuestions([]))
      .finally(() => !cancelled && setQuestionsLoading(false));

    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  async function handleAddNote() {
    const content = noteInput.trim();
    if (!content) return;
    setNoteSaving(true);
    try {
      const note = await addLessonNote(courseId, lessonId, content);
      setNotes((prev) => [note, ...prev]);
      setNoteInput("");
    } catch (err: any) {
      toast.error(err?.message || "Không lưu được ghi chú");
    } finally {
      setNoteSaving(false);
    }
  }

  async function handleDeleteNote(id: string) {
    try {
      await deleteLessonNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      toast.error(err?.message || "Không xóa được ghi chú");
    }
  }

  async function handleAskQuestion() {
    const content = questionInput.trim();
    if (!content) return;
    setQuestionSaving(true);
    try {
      const question = await askLessonQuestion(courseId, lessonId, content);
      setQuestions((prev) => [{ ...question, answers: [] }, ...prev]);
      setQuestionInput("");
      toast.success("Đã gửi câu hỏi");
    } catch (err: any) {
      toast.error(err?.message || "Không gửi được câu hỏi");
    } finally {
      setQuestionSaving(false);
    }
  }

  async function handleDeleteQuestion(id: string) {
    try {
      await deleteLessonQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      toast.error(err?.message || "Không xóa được câu hỏi");
    }
  }

  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-muted/20 p-5 sm:p-6">
      <div className="flex gap-1 rounded-xl bg-muted/60 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              tab === key
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === "notes" ? (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Viết ghi chú cho bài học..."
              rows={2}
              className="flex-1 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void handleAddNote()}
              disabled={noteSaving || !noteInput.trim()}
              className="eb-note-save rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {noteSaving ? "Đang lưu..." : "Lưu ghi chú"}
            </button>
          </div>

          {notesLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải ghi chú...</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có ghi chú nào cho bài học này.
            </p>
          ) : (
            <ul className="space-y-2">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                      {note.content}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteNote(note.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label="Xóa ghi chú"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {tab === "qna" ? (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <textarea
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Đặt câu hỏi về bài học này..."
              rows={2}
              className="flex-1 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void handleAskQuestion()}
              disabled={questionSaving || !questionInput.trim()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {questionSaving ? "Đang gửi..." : "Gửi câu hỏi"}
            </button>
          </div>

          {questionsLoading ? (
            <p className="text-sm text-muted-foreground">Đang tải câu hỏi...</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có câu hỏi nào cho bài học này. Hãy là người đầu tiên!
            </p>
          ) : (
            <ul className="space-y-3">
              {questions.map((question) => (
                <li
                  key={question.id}
                  className="rounded-xl border border-border bg-background/60 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {question.userName || "Học viên"}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                        {question.content}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(question.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteQuestion(question.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label="Xóa câu hỏi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {question.answers && question.answers.length > 0 ? (
                    <ul className="mt-3 space-y-2 border-t border-border pt-3">
                      {question.answers.map((answer) => (
                        <li
                          key={answer.id}
                          className="rounded-lg bg-muted/40 px-3 py-2 text-sm"
                        >
                          <p className="font-medium text-primary">
                            {answer.userName || "Mentor"}
                          </p>
                          <p className="mt-0.5 whitespace-pre-wrap text-foreground">
                            {answer.content}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
