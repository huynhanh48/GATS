"use client";

import { apiClient, apiRequest, normalizeApiError, type ApiResult } from "@/lib/api/client";
import type {
  CreateQuizInput,
  UpdateQuizInput,
  CreateQuizQuestionInput,
  UpdateQuizQuestionInput,
  Quiz,
  QuizQuestion,
} from "@/lib/api/types";

export const quizClient = {
  /** GET /courses/:courseId/lessons/:lessonId/quiz – check quiz existence & get quizId */
  getQuiz(
    courseId: string,
    lessonId: string,
  ): Promise<ApiResult<{ data: { id: string } & Partial<Quiz> }>> {
    return apiRequest<{ data: { id: string } & Partial<Quiz> }>({
      url: `/courses/${courseId}/lessons/${lessonId}/quiz`,
      method: "GET",
    });
  },

  /**
   * Two-step admin fetch:
   * 1. GET /courses/:courseId/lessons/:lessonId/quiz → get quizId
   * 2. GET /quizzes/:quizId → full admin data with correct answers
   */
  async getQuizByLessonAdmin(
    courseId: string,
    lessonId: string,
  ): Promise<ApiResult<{ data: Quiz }>> {
    const basicRes = await apiRequest<{ data: { id: string } }>({
      url: `/courses/${courseId}/lessons/${lessonId}/quiz?_t=${Date.now()}`,
      method: "GET",
    });
    if (basicRes.error || !basicRes.data?.data?.id) {
      return { data: null, error: basicRes.error ?? { message: "Không tìm thấy quiz" } };
    }
    return apiRequest<{ data: Quiz }>({
      url: `/quizzes/${basicRes.data.data.id}?_t=${Date.now()}`,
      method: "GET",
    });
  },

  /** POST /courses/:courseId/lessons/:lessonId/quiz – create quiz (step 2) */
  createQuiz(
    courseId: string,
    lessonId: string,
    input: CreateQuizInput,
  ): Promise<ApiResult<{ data: { id: string } & Partial<Quiz> }>> {
    return apiRequest<{ data: { id: string } & Partial<Quiz> }>({
      url: `/courses/${courseId}/lessons/${lessonId}/quiz`,
      method: "POST",
      data: input,
    });
  },

  /** PATCH /quizzes/:quizId – update quiz settings */
  updateQuiz(
    quizId: string,
    input: UpdateQuizInput,
  ): Promise<ApiResult<{ data: Partial<Quiz> }>> {
    return apiRequest<{ data: Partial<Quiz> }>({
      url: `/quizzes/${quizId}`,
      method: "PATCH",
      data: input,
    });
  },

  /** POST /quizzes/:quizId/questions – add a question */
  createQuestion(
    quizId: string,
    input: CreateQuizQuestionInput,
  ): Promise<ApiResult<{ data: QuizQuestion }>> {
    return apiRequest<{ data: QuizQuestion }>({
      url: `/quizzes/${quizId}/questions`,
      method: "POST",
      data: input,
    });
  },

  /** PATCH /quiz-questions/:questionId – update a question */
  updateQuestion(
    questionId: string,
    input: UpdateQuizQuestionInput,
  ): Promise<ApiResult<{ data: QuizQuestion }>> {
    return apiRequest<{ data: QuizQuestion }>({
      url: `/quiz-questions/${questionId}`,
      method: "PATCH",
      data: input,
    });
  },

  /** DELETE /quiz-questions/:questionId – delete a question */
  deleteQuestion(
    questionId: string,
  ): Promise<ApiResult<{ message?: string }>> {
    return apiRequest<{ message?: string }>({
      url: `/quiz-questions/${questionId}`,
      method: "DELETE",
    });
  },

  /** PATCH /quizzes/:quizId/questions/reorder */
  reorderQuestions(
    quizId: string,
    questionIds: string[],
  ): Promise<ApiResult<{ data?: unknown }>> {
    return apiRequest<{ data?: unknown }>({
      url: `/quizzes/${quizId}/questions/reorder`,
      method: "PATCH",
      data: { question_ids: questionIds },
    });
  },

  /**
   * POST /quizzes/:quizId/ai-generate — multipart (text | file_url | file)
   * Calls Viava course gen, maps exercises → GATS quiz questions, optionally persists.
   */
  async aiGenerate(
    quizId: string,
    form: FormData,
  ): Promise<
    ApiResult<{
      message?: string;
      data?: {
        questions?: QuizQuestion[];
        skipped_count?: number;
        question_count?: number;
        applied?: boolean;
      };
    }>
  > {
    try {
      const response = await apiClient.post(
        `/quizzes/${quizId}/ai-generate`,
        form,
        { timeout: 180_000 },
      );
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: normalizeApiError(error) };
    }
  },
};
