"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  flashcardClient,
  type FlashcardCard,
  type FlashcardDeck,
  type FlashcardDeckStatus,
  type FlashcardAiSource,
} from "@/services/flashcard.client";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0070EB] dark:border-slate-700 dark:bg-slate-900 dark:text-white";

const STATUS_LABELS: Record<FlashcardDeckStatus, string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

type Props = {
  courseId: string;
};

export function CourseFlashcardManager({ courseId }: Props) {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [cards, setCards] = useState<FlashcardCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);

  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [cardHint, setCardHint] = useState("");
  const [csvText, setCsvText] = useState("");
  const [editingCard, setEditingCard] = useState<FlashcardCard | null>(null);
  const [aiSources, setAiSources] = useState<FlashcardAiSource[]>([]);
  const [aiSourcesLoading, setAiSourcesLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPostId, setAiPostId] = useState("");
  const [aiCount, setAiCount] = useState(10);
  const [aiLevel, setAiLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [aiDetail, setAiDetail] = useState<
    "brief" | "standard" | "detailed"
  >("standard");

  const selectedDeck = decks.find((d) => d.id === selectedDeckId) ?? null;

  const loadDecks = useCallback(async () => {
    setLoading(true);
    const result = await flashcardClient.listDecks(courseId);
    setLoading(false);
    if (result.error || !result.data) {
      toast.error(result.error?.message ?? "Không tải được bộ thẻ");
      return;
    }
    setDecks(result.data.data);
  }, [courseId]);

  const loadCards = useCallback(async (deckId: string) => {
    setCardsLoading(true);
    const result = await flashcardClient.listCards(deckId);
    setCardsLoading(false);
    if (result.error || !result.data) {
      toast.error(result.error?.message ?? "Không tải được thẻ");
      return;
    }
    setCards(result.data.data);
  }, []);

  useEffect(() => {
    void loadDecks();
  }, [loadDecks]);

  useEffect(() => {
    if (!selectedDeckId) {
      setCards([]);
      setAiSources([]);
      setAiPostId("");
      return;
    }
    void loadCards(selectedDeckId);
    setAiSourcesLoading(true);
    void flashcardClient.listAiSources(selectedDeckId).then((result) => {
      setAiSourcesLoading(false);
      if (result.error || !result.data) {
        toast.error(result.error?.message ?? "Không tải được nguồn bài viết");
        return;
      }
      setAiSources(result.data.data);
      setAiPostId((current) =>
        result.data?.data.some((source) => source.postId === current)
          ? current
          : (result.data?.data[0]?.postId ?? ""),
      );
    });
  }, [selectedDeckId, loadCards]);

  async function handleAiGenerate() {
    if (!selectedDeckId || !aiPostId) {
      toast.error("Hãy chọn một bài viết làm nguồn");
      return;
    }
    setAiGenerating(true);
    const result = await flashcardClient.generateFromArticle(selectedDeckId, {
      postId: aiPostId,
      count: aiCount,
      language: "vi",
      targetLevel: aiLevel,
      detailLevel: aiDetail,
    });
    setAiGenerating(false);
    if (result.error || !result.data) {
      toast.error(result.error?.message ?? "VIAVA không sinh được flashcard");
      return;
    }
    toast.success(`Đã sinh ${result.data.data.generated} flashcard nháp`);
    await Promise.all([loadCards(selectedDeckId), loadDecks()]);
  }

  async function handleCreateDeck() {
    if (!newDeckTitle.trim()) {
      toast.error("Nhập tên bộ thẻ");
      return;
    }
    const result = await flashcardClient.createDeck(courseId, {
      title: newDeckTitle.trim(),
      description: newDeckDescription.trim() || null,
      status: "draft",
    });
    if (result.error || !result.data) {
      toast.error(result.error?.message ?? "Tạo bộ thẻ thất bại");
      return;
    }
    toast.success("Đã tạo bộ thẻ");
    setNewDeckTitle("");
    setNewDeckDescription("");
    await loadDecks();
    setSelectedDeckId(result.data.data.id);
  }

  async function handlePublishDeck() {
    if (!selectedDeck) return;
    const result = await flashcardClient.updateDeck(selectedDeck.id, {
      status: "published",
    });
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Đã xuất bản bộ thẻ");
    await loadDecks();
  }

  async function handleArchiveDeck(deckId: string) {
    const result = await flashcardClient.archiveDeck(deckId);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Đã lưu trữ bộ thẻ");
    if (selectedDeckId === deckId) setSelectedDeckId(null);
    await loadDecks();
  }

  async function handleCreateCard() {
    if (!selectedDeckId) return;
    if (!cardFront.trim() || !cardBack.trim()) {
      toast.error("Cần mặt trước và mặt sau");
      return;
    }
    const result = await flashcardClient.createCard(selectedDeckId, {
      front: cardFront.trim(),
      back: cardBack.trim(),
      hint: cardHint.trim() || null,
      sortOrder: cards.length,
    });
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Đã thêm thẻ");
    setCardFront("");
    setCardBack("");
    setCardHint("");
    await loadCards(selectedDeckId);
    await loadDecks();
  }

  async function handleSaveEditCard() {
    if (!editingCard || !selectedDeckId) return;
    const result = await flashcardClient.updateCard(editingCard.id, {
      front: editingCard.front,
      back: editingCard.back,
      hint: editingCard.hint,
      sortOrder: editingCard.sortOrder,
    });
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Đã cập nhật thẻ");
    setEditingCard(null);
    await loadCards(selectedDeckId);
  }

  async function handleArchiveCard(cardId: string) {
    if (!selectedDeckId) return;
    const result = await flashcardClient.archiveCard(cardId);
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Đã lưu trữ thẻ");
    await loadCards(selectedDeckId);
    await loadDecks();
  }

  async function handleImportCsv() {
    if (!selectedDeckId || !csvText.trim()) return;
    const result = await flashcardClient.importCards(
      selectedDeckId,
      csvText.trim(),
    );
    if (result.error || !result.data) {
      toast.error(result.error?.message ?? "Import thất bại");
      return;
    }
    toast.success(`Đã import ${result.data.data.imported} thẻ`);
    setCsvText("");
    await loadCards(selectedDeckId);
    await loadDecks();
  }

  const previewCard = cards.find((c) => c.id === previewId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0b1220]">
        <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
          Bộ thẻ
        </h3>
        {loading ? (
          <p className="text-sm text-slate-500">Đang tải…</p>
        ) : decks.length === 0 ? (
          <p className="mb-3 text-sm text-slate-500">Chưa có bộ thẻ nào.</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {decks.map((deck) => (
              <li key={deck.id}>
                <button
                  type="button"
                  onClick={() => setSelectedDeckId(deck.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                    selectedDeckId === deck.id
                      ? "border-[#0070EB] bg-[#eaf2ff] dark:bg-[#0f2742]"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {deck.title}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {STATUS_LABELS[deck.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {deck.cardCount} thẻ
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Tạo bộ thẻ
          </p>
          <input
            className={inputClass}
            placeholder="Tên bộ thẻ"
            value={newDeckTitle}
            onChange={(e) => setNewDeckTitle(e.target.value)}
          />
          <textarea
            className={inputClass}
            placeholder="Mô tả (tuỳ chọn)"
            rows={2}
            value={newDeckDescription}
            onChange={(e) => setNewDeckDescription(e.target.value)}
          />
          <button
            type="button"
            onClick={() => void handleCreateDeck()}
            className="w-full rounded-xl bg-[#0070EB] px-3 py-2 text-sm font-bold text-white hover:bg-[#005fc5]"
          >
            Tạo bộ thẻ
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {!selectedDeck ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
            Chọn hoặc tạo một bộ thẻ để quản lý.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0b1220]">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedDeck.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {STATUS_LABELS[selectedDeck.status]} · {selectedDeck.cardCount}{" "}
                  thẻ
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDeck.status !== "published" && (
                  <button
                    type="button"
                    onClick={() => void handlePublishDeck()}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    Xuất bản
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void handleArchiveDeck(selectedDeck.id)}
                  className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                >
                  Lưu trữ bộ thẻ
                </button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4 dark:border-violet-900 dark:from-violet-950/30 dark:to-[#0b1220] xl:col-span-2">
                <div className="mb-4 flex items-start gap-3">
                  <span className="rounded-xl bg-violet-600 p-2 text-white">
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Sinh flashcard bằng VIAVA
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Chọn bài viết đã liên kết với một bài học trong khóa này.
                      Thẻ mới được lưu ở trạng thái nháp để bạn duyệt lại.
                    </p>
                  </div>
                </div>

                {aiSourcesLoading ? (
                  <div className="rounded-xl border border-dashed border-violet-200 p-4 text-sm text-slate-500">
                    Đang tải nguồn bài viết…
                  </div>
                ) : aiSources.length === 0 ? (
                  <div className="flex items-start gap-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                    <FileText
                      className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Khóa học chưa có bài viết làm nguồn
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Vào Giáo trình, liên kết một bài viết với bài học rồi quay
                        lại đây.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <label className="md:col-span-2 xl:col-span-2">
                      <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Bài viết nguồn
                      </span>
                      <select
                        className={inputClass}
                        value={aiPostId}
                        onChange={(event) => setAiPostId(event.target.value)}
                      >
                        {aiSources.map((source) => (
                          <option key={source.postId} value={source.postId}>
                            {source.postTitle} — {source.lessonTitle}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Số thẻ
                      </span>
                      <input
                        className={inputClass}
                        type="number"
                        min={1}
                        max={30}
                        value={aiCount}
                        onChange={(event) =>
                          setAiCount(
                            Math.min(
                              30,
                              Math.max(1, Number(event.target.value) || 1),
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Trình độ
                      </span>
                      <select
                        className={inputClass}
                        value={aiLevel}
                        onChange={(event) =>
                          setAiLevel(
                            event.target.value as
                              | "beginner"
                              | "intermediate"
                              | "advanced",
                          )
                        }
                      >
                        <option value="beginner">Cơ bản</option>
                        <option value="intermediate">Trung cấp</option>
                        <option value="advanced">Nâng cao</option>
                      </select>
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Độ chi tiết
                      </span>
                      <select
                        className={inputClass}
                        value={aiDetail}
                        onChange={(event) =>
                          setAiDetail(
                            event.target.value as
                              | "brief"
                              | "standard"
                              | "detailed",
                          )
                        }
                      >
                        <option value="brief">Ngắn gọn</option>
                        <option value="standard">Tiêu chuẩn</option>
                        <option value="detailed">Chi tiết</option>
                      </select>
                    </label>
                    <div className="md:col-span-2 xl:col-span-5">
                      <button
                        type="button"
                        disabled={aiGenerating || !aiPostId}
                        onClick={() => void handleAiGenerate()}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        {aiGenerating
                          ? "VIAVA đang phân tích bài viết…"
                          : "Sinh và thêm vào bộ thẻ"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0b1220]">
                <h4 className="mb-3 text-sm font-bold">Thêm thẻ</h4>
                <div className="space-y-2">
                  <textarea
                    className={inputClass}
                    rows={2}
                    placeholder="Mặt trước"
                    value={cardFront}
                    onChange={(e) => setCardFront(e.target.value)}
                  />
                  <textarea
                    className={inputClass}
                    rows={2}
                    placeholder="Mặt sau"
                    value={cardBack}
                    onChange={(e) => setCardBack(e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Gợi ý (tuỳ chọn)"
                    value={cardHint}
                    onChange={(e) => setCardHint(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => void handleCreateCard()}
                    className="rounded-xl bg-[#0070EB] px-3 py-2 text-sm font-bold text-white"
                  >
                    Thêm thẻ
                  </button>
                </div>

                <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <h4 className="text-sm font-bold">Import CSV</h4>
                  <p className="text-xs text-slate-500">
                    Header: front,back,hint,order — hoặc không header theo thứ tự
                    đó.
                  </p>
                  <textarea
                    className={inputClass}
                    rows={4}
                    placeholder={"front,back,hint,order\nPrompt?,Câu lệnh AI,,0"}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => void handleImportCsv()}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    Import
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0b1220]">
                <h4 className="mb-3 text-sm font-bold">Xem trước</h4>
                {!previewCard ? (
                  <p className="text-sm text-slate-500">
                    Chọn một thẻ trong danh sách để xem trước.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFlipped((v) => !v)}
                    className="flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-[#0070EB]/30 bg-[#eaf2ff] p-4 text-center dark:bg-[#0f2742]"
                  >
                    <span className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#0070EB]">
                      {flipped ? "Mặt sau" : "Mặt trước"}
                    </span>
                    <span className="text-base font-semibold text-slate-900 dark:text-white">
                      {flipped ? previewCard.back : previewCard.front}
                    </span>
                    {!flipped && previewCard.hint ? (
                      <span className="mt-3 text-xs text-slate-500">
                        Gợi ý: {previewCard.hint}
                      </span>
                    ) : null}
                    <span className="mt-4 text-xs text-slate-400">
                      Chạm để lật
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b1220]">
              {cardsLoading ? (
                <p className="p-4 text-sm text-slate-500">Đang tải thẻ…</p>
              ) : cards.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">Chưa có thẻ nào.</p>
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/40">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Mặt trước</th>
                      <th className="px-3 py-2">Mặt sau</th>
                      <th className="px-3 py-2">Gợi ý</th>
                      <th className="px-3 py-2">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cards.map((card) => (
                      <tr key={card.id}>
                        <td className="px-3 py-2 text-slate-500">
                          {card.sortOrder}
                        </td>
                        <td className="max-w-48 truncate px-3 py-2">
                          {card.front}
                        </td>
                        <td className="max-w-48 truncate px-3 py-2">
                          {card.back}
                        </td>
                        <td className="max-w-32 truncate px-3 py-2 text-slate-500">
                          {card.hint ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="text-xs font-bold text-[#0070EB]"
                              onClick={() => {
                                setPreviewId(card.id);
                                setFlipped(false);
                              }}
                            >
                              Xem
                            </button>
                            <button
                              type="button"
                              className="text-xs font-bold text-slate-700 dark:text-slate-200"
                              onClick={() => setEditingCard(card)}
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="text-xs font-bold text-rose-600"
                              onClick={() => void handleArchiveCard(card.id)}
                            >
                              Lưu trữ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {editingCard ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0b1220]">
                <h4 className="mb-3 text-sm font-bold">Sửa thẻ</h4>
                <div className="space-y-2">
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={editingCard.front}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, front: e.target.value })
                    }
                  />
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={editingCard.back}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, back: e.target.value })
                    }
                  />
                  <input
                    className={inputClass}
                    value={editingCard.hint ?? ""}
                    onChange={(e) =>
                      setEditingCard({
                        ...editingCard,
                        hint: e.target.value || null,
                      })
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSaveEditCard()}
                      className="rounded-xl bg-[#0070EB] px-3 py-2 text-sm font-bold text-white"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCard(null)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-700"
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
