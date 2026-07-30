"use client";

import { apiClient, normalizeApiError, type ApiResult } from "@/lib/api/client";

export type AiQuizGenerateResponse = {
  message?: string;
  data?: {
    questions?: any[];
    skipped_count?: number;
    question_count?: number;
    applied?: boolean;
    skipped?: any[];
  };
};

export const aiGenClient = {
  /**
   * POST /quizzes/:quizId/ai-generate — generate quiz questions via GATS BE
   */
  async generateQuiz(
    quizId: string,
    form: FormData,
  ): Promise<ApiResult<AiQuizGenerateResponse>> {
    try {
      const response = await apiClient.post<AiQuizGenerateResponse>(
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
