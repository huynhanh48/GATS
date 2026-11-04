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
   * POST /quizzes/:quizId/ai-generate — enqueue BullMQ job (202 + jobId).
   * Generation runs on worker; poll with getAiGenerateJob / waitForAiGenerateJob.
   */
  async aiGenerate(
    quizId: string,
    form: FormData,
  ): Promise<
    ApiResult<{
      message?: string;
      data?: {
        jobId?: string;
        quizId?: string;
        status?: string;
      };
    }>
  > {
    try {
      const response = await apiClient.post(
        `/quizzes/${quizId}/ai-generate`,
        form,
        { timeout: 0 },
      );
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: normalizeApiError(error) };
    }
  },

  /** GET /quizzes/:quizId/ai-generate/jobs/:jobId */
  getAiGenerateJob(
    quizId: string,
    jobId: string,
  ): Promise<
    ApiResult<{
      data: {
        jobId?: string;
        quizId?: string;
        status: string;
        error?: string;
        result?: {
          message?: string;
          data?: {
            questions?: QuizQuestion[];
            skipped_count?: number;
            question_count?: number;
            applied?: boolean;
          };
        } | null;
      };
    }>
  > {
    return apiRequest({
      url: `/quizzes/${quizId}/ai-generate/jobs/${jobId}`,
      method: "GET",
    });
  },

  /**
   * Poll job until completed / failed. Interval ~2.5s; no early abort for FLAC.
   */
  async waitForAiGenerateJob(
    quizId: string,
    jobId: string,
    options?: { intervalMs?: number; maxAttempts?: number },
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
    const intervalMs = options?.intervalMs ?? 2_500;
    const maxAttempts = options?.maxAttempts ?? 720; // ~30 min

    for (let i = 0; i < maxAttempts; i++) {
      const res = await this.getAiGenerateJob(quizId, jobId);
      if (res.error) {
        return { data: null, error: res.error };
      }

      const status = res.data?.data?.status;
      if (status === "completed") {
        const result = res.data?.data?.result;
        return {
          data: {
            message: result?.message,
            data: result?.data,
          },
          error: null,
        };
      }
      if (status === "failed") {
        return {
          data: null,
          error: {
            message: res.data?.data?.error ?? "AI generation failed",
            status: 500,
          },
        };
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    return {
      data: null,
      error: {
        message: "AI generation timed out waiting for job",
        status: 408,
      },
    };
  },

  /** GET /quizzes/:quizId — full quiz with questions (admin). */
  getAdmin(quizId: string): Promise<ApiResult<{ data: Quiz }>> {
    return apiRequest<{ data: Quiz }>({
      url: `/quizzes/${quizId}?_t=${Date.now()}`,
      method: "GET",
    });
  },

  /**
   * Fallback if job status is lost / poll fails: BE may still have applied questions.
   * Check once immediately, then poll briefly.
   */
  async recoverQuestionsAfterDrop(
    quizId: string,
    previousCount: number,
    options?: { attempts?: number; delayMs?: number },
  ): Promise<QuizQuestion[]> {
    const immediate = await this.getAdmin(quizId);
    const now = immediate.data?.data?.questions ?? [];
    if (now.length > previousCount) {
      return now.slice(previousCount);
    }
    return this.pollNewQuestions(quizId, previousCount, options);
  },

  async pollNewQuestions(
    quizId: string,
    previousCount: number,
    options?: { attempts?: number; delayMs?: number },
  ): Promise<QuizQuestion[]> {
    const attempts = options?.attempts ?? 24;
    const delayMs = options?.delayMs ?? 5_000;
    for (let i = 0; i < attempts; i++) {
      await new Promise((r) => setTimeout(r, delayMs));
      const res = await this.getAdmin(quizId);
      const questions = res.data?.data?.questions ?? [];
      if (questions.length > previousCount) {
        return questions.slice(previousCount);
      }
    }
    return [];
  },
};
