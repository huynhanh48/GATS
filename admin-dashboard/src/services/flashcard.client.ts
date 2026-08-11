"use client";

import { apiRequest, type ApiResult } from "@/lib/api/client";

export type FlashcardDeckStatus = "draft" | "published" | "archived";
export type FlashcardCardStatus = "draft" | "published" | "archived";

export type FlashcardDeck = {
  id: string;
  courseId: string | null;
  lessonId: string | null;
  title: string;
  description: string | null;
  status: FlashcardDeckStatus;
  sortOrder: number;
  version: number;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
};

export type FlashcardCard = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint: string | null;
  sortOrder: number;
  status: FlashcardCardStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateDeckInput = {
  title: string;
  description?: string | null;
  status?: FlashcardDeckStatus;
  sortOrder?: number;
  lessonId?: string | null;
};

export type UpdateDeckInput = Partial<CreateDeckInput>;

export type CreateCardInput = {
  front: string;
  back: string;
  hint?: string | null;
  sortOrder?: number;
  status?: FlashcardCardStatus;
};

export type UpdateCardInput = Partial<CreateCardInput>;

export type FlashcardAiSource = {
  postId: string;
  postTitle: string;
  postExcerpt: string | null;
  lessonId: string;
  lessonTitle: string;
};

export type GenerateFlashcardsInput = {
  postId: string;
  count: number;
  language: string;
  targetLevel: "beginner" | "intermediate" | "advanced";
  detailLevel: "brief" | "standard" | "detailed";
};

export const flashcardClient = {
  listDecks(
    courseId: string,
    includeArchived = false,
  ): Promise<ApiResult<{ data: FlashcardDeck[] }>> {
    return apiRequest({
      url: `/course-management/courses/${courseId}/flashcard-decks`,
      method: "GET",
      params: includeArchived ? { includeArchived: "true" } : undefined,
    });
  },

  createDeck(
    courseId: string,
    body: CreateDeckInput,
  ): Promise<ApiResult<{ data: FlashcardDeck }>> {
    return apiRequest({
      url: `/course-management/courses/${courseId}/flashcard-decks`,
      method: "POST",
      data: body,
    });
  },

  updateDeck(
    deckId: string,
    body: UpdateDeckInput,
  ): Promise<ApiResult<{ data: FlashcardDeck }>> {
    return apiRequest({
      url: `/flashcard-decks/${deckId}`,
      method: "PATCH",
      data: body,
    });
  },

  archiveDeck(deckId: string): Promise<ApiResult<{ data: FlashcardDeck }>> {
    return apiRequest({
      url: `/flashcard-decks/${deckId}`,
      method: "DELETE",
    });
  },

  listCards(
    deckId: string,
    includeArchived = false,
  ): Promise<ApiResult<{ data: FlashcardCard[] }>> {
    return apiRequest({
      url: `/flashcard-decks/${deckId}/cards`,
      method: "GET",
      params: includeArchived ? { includeArchived: "true" } : undefined,
    });
  },

  createCard(
    deckId: string,
    body: CreateCardInput,
  ): Promise<ApiResult<{ data: FlashcardCard }>> {
    return apiRequest({
      url: `/flashcard-decks/${deckId}/cards`,
      method: "POST",
      data: body,
    });
  },

  updateCard(
    cardId: string,
    body: UpdateCardInput,
  ): Promise<ApiResult<{ data: FlashcardCard }>> {
    return apiRequest({
      url: `/flashcards/${cardId}`,
      method: "PATCH",
      data: body,
    });
  },

  archiveCard(cardId: string): Promise<ApiResult<{ data: FlashcardCard }>> {
    return apiRequest({
      url: `/flashcards/${cardId}`,
      method: "DELETE",
    });
  },

  importCards(
    deckId: string,
    csv: string,
  ): Promise<ApiResult<{ data: { imported: number; cards: FlashcardCard[] } }>> {
    return apiRequest({
      url: `/flashcard-decks/${deckId}/cards/import`,
      method: "POST",
      data: { csv },
    });
  },

  listAiSources(
    deckId: string,
  ): Promise<ApiResult<{ data: FlashcardAiSource[] }>> {
    return apiRequest({
      url: `/flashcard-decks/${deckId}/ai-sources`,
      method: "GET",
    });
  },

  generateFromArticle(
    deckId: string,
    body: GenerateFlashcardsInput,
  ): Promise<
    ApiResult<{
      data: {
        generated: number;
        source: { postId: string; title: string };
        cards: FlashcardCard[];
      };
    }>
  > {
    return apiRequest({
      url: `/flashcard-decks/${deckId}/cards/ai-generate`,
      method: "POST",
      data: body,
      timeout: 0,
    });
  },
};
