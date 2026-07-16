"use client";

import { apiRequest, type ApiResult } from "@/lib/api/client";
import type {
  Assignment,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from "@/lib/api/types";

export const assignmentClient = {
  /** GET /courses/:courseId/lessons/:lessonId/assignment */
  getAssignment(
    courseId: string,
    lessonId: string,
  ): Promise<ApiResult<{ data: Assignment }>> {
    return apiRequest<{ data: Assignment }>({
      url: `/courses/${courseId}/lessons/${lessonId}/assignment`,
      method: "GET",
    });
  },

  /** POST /courses/:courseId/lessons/:lessonId/assignment – create (step 2) */
  createAssignment(
    courseId: string,
    lessonId: string,
    input: CreateAssignmentInput,
  ): Promise<ApiResult<{ data: Assignment }>> {
    return apiRequest<{ data: Assignment }>({
      url: `/courses/${courseId}/lessons/${lessonId}/assignment`,
      method: "POST",
      data: input,
    });
  },

  /** PATCH /assignments/:assignmentId */
  updateAssignment(
    assignmentId: string,
    input: UpdateAssignmentInput,
  ): Promise<ApiResult<{ data: Assignment }>> {
    return apiRequest<{ data: Assignment }>({
      url: `/assignments/${assignmentId}`,
      method: "PATCH",
      data: input,
    });
  },

  /** DELETE /assignments/:assignmentId */
  deleteAssignment(
    assignmentId: string,
  ): Promise<ApiResult<{ message?: string }>> {
    return apiRequest<{ message?: string }>({
      url: `/assignments/${assignmentId}`,
      method: "DELETE",
    });
  },
};
