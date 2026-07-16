"use client";

import { apiRequest, type ApiResult } from "@/lib/api/client";
import type {
  CategoryPublic,
  CourseDetail,
  CourseDetailLesson,
  CourseLevel,
  CourseListResponse,
  CoursePublic,
  CourseStatus,
  CreateCourseInput,
  CreateLessonInput,
  CreateSectionInput,
  LessonCreateResponseData,
  UpdateCourseInput,
  UpdateLessonInput,
  UpdateSectionInput,
} from "@/lib/api/types";

export type ListCoursesParams = {
  status?: CourseStatus;
  level?: CourseLevel | "basic";
  category?: string;
  tag?: string;
  deleted?: "without" | "with" | "only";
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
};

export type CourseCategory = CategoryPublic & {
  courseCount?: number;
};

export type CourseMutationResponse = {
  course: CoursePublic;
};

export type CourseDetailResponse = {
  course: CourseDetail;
};

export type CourseCurriculumSection = {
  id: string;
  title: string;
  order: number;
  lessons: CourseDetailLesson[];
};

export type CourseCurriculumResponse = {
  data: CourseCurriculumSection[];
};

export const coursesClient = {
  list(params: ListCoursesParams = {}): Promise<ApiResult<CourseListResponse>> {
    return apiRequest<CourseListResponse>({
      url: "/courses",
      method: "GET",
      params,
    });
  },

  listCategories(): Promise<ApiResult<{ data: CourseCategory[] }>> {
    return apiRequest<{ data: CourseCategory[] }>({
      url: "/courses/categories",
      method: "GET",
    });
  },

  getById(id: string): Promise<ApiResult<{ course: CoursePublic }>> {
    return apiRequest<{ course: CoursePublic }>({
      url: `/courses/${id}`,
      method: "GET",
    });
  },

  getBySlug(slug: string): Promise<ApiResult<CourseDetailResponse>> {
    return apiRequest<CourseDetailResponse>({
      url: `/courses/slug/${slug}`,
      method: "GET",
    });
  },

  create(input: CreateCourseInput): Promise<ApiResult<CourseMutationResponse>> {
    return apiRequest<CourseMutationResponse>({
      url: "/courses",
      method: "POST",
      data: input,
    });
  },

  update(
    id: string,
    input: UpdateCourseInput,
  ): Promise<ApiResult<CourseMutationResponse>> {
    return apiRequest<CourseMutationResponse>({
      url: `/courses/${id}`,
      method: "PATCH",
      data: input,
    });
  },

  restore(id: string): Promise<ApiResult<{ course?: CoursePublic; message?: string }>> {
    return apiRequest<{ course?: CoursePublic; message?: string }>({
      url: `/courses/${id}/restore`,
      method: "POST",
    });
  },

  remove(id: string, mode?: "soft" | "hard"): Promise<ApiResult<{ message?: string }>> {
    return apiRequest<{ message?: string }>({
      url: `/courses/${id}${mode === "hard" ? "?mode=hard" : ""}`,
      method: "DELETE",
    });
  },

  publish(id: string): Promise<ApiResult<CourseMutationResponse>> {
    return apiRequest<CourseMutationResponse>({
      url: `/courses/${id}/publish`,
      method: "POST",
    });
  },

  getCurriculum(
    courseId: string,
  ): Promise<ApiResult<CourseCurriculumResponse>> {
    return apiRequest<CourseCurriculumResponse>({
      url: `/courses/${courseId}/curriculum`,
      method: "GET",
    });
  },

  createSection(
    courseId: string,
    input: CreateSectionInput,
  ): Promise<ApiResult<{ data?: unknown }>> {
    return apiRequest<{ data?: unknown }>({
      url: `/courses/${courseId}/sections`,
      method: "POST",
      data: input,
    });
  },

  updateSection(
    courseId: string,
    sectionId: string,
    input: UpdateSectionInput,
  ): Promise<ApiResult<{ data?: unknown }>> {
    return apiRequest<{ data?: unknown }>({
      url: `/courses/${courseId}/sections/${sectionId}`,
      method: "PATCH",
      data: input,
    });
  },

  deleteSection(
    courseId: string,
    sectionId: string,
  ): Promise<ApiResult<{ message?: string }>> {
    return apiRequest<{ message?: string }>({
      url: `/courses/${courseId}/sections/${sectionId}`,
      method: "DELETE",
    });
  },

  createLesson(
    courseId: string,
    sectionId: string,
    input: CreateLessonInput,
  ): Promise<ApiResult<{ data: LessonCreateResponseData }>> {
    return apiRequest<{ data: LessonCreateResponseData }>({
      url: `/courses/${courseId}/sections/${sectionId}/lessons`,
      method: "POST",
      data: input,
    });
  },

  updateLesson(
    courseId: string,
    lessonId: string,
    input: UpdateLessonInput,
  ): Promise<ApiResult<{ data?: unknown }>> {
    return apiRequest<{ data?: unknown }>({
      url: `/courses/${courseId}/lessons/${lessonId}`,
      method: "PATCH",
      data: input,
    });
  },

  deleteLesson(
    courseId: string,
    lessonId: string,
  ): Promise<ApiResult<{ message?: string }>> {
    return apiRequest<{ message?: string }>({
      url: `/courses/${courseId}/lessons/${lessonId}`,
      method: "DELETE",
    });
  },
};
