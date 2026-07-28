"use server";

import { beFetch } from "@/lib/api/server";
import type {
  AssignmentSubmissionsResponse,
  CourseDetail,
  CourseExerciseHistory,
  CourseIncludeInput,
  CourseLearnersResponse,
  CourseListResponse,
  CoursePublic,
  CreateLessonInput,
  CreateSectionInput,
  GradeAssignmentSubmissionInput,
  LearningOutcomeInput,
  LessonCreateResponseData,
  PublishReadiness,
  QuizAttemptsResponse,
  UpdateLessonInput,
  UpdateSectionInput,
} from "@/lib/api/types";
import { revalidatePath } from "next/cache";

export type CreateCourseState = {
  ok: boolean;
  message: string;
  course?: CoursePublic;
};

function parseTagIds(raw: string | null): string[] | undefined {
  if (raw === null) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    return [...new Set(parsed.map(String).map((id) => id.trim()).filter(Boolean))];
  } catch {
    return undefined;
  }
}

function parseLearningOutcomes(
  raw: string | undefined,
): LearningOutcomeInput[] | undefined {
  if (raw === undefined) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    return parsed
      .map((item) => ({ content: String(item?.content ?? "").trim() }))
      .filter((item) => item.content.length > 0);
  } catch {
    return undefined;
  }
}

function parseIncludes(
  raw: string | undefined,
): CourseIncludeInput[] | undefined {
  if (raw === undefined) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    return parsed
      .map((item) => {
        const value = item?.value ? String(item.value).trim() : null;
        const unit = item?.unit ? String(item.unit).trim() : null;
        return {
          key: String(item?.key ?? "").trim(),
          label: String(item?.label ?? "").trim(),
          value: value && value.length > 0 ? value : null,
          unit: unit && unit.length > 0 ? unit : null,
        };
      })
      .filter((item) => item.key.length > 0 && item.label.length > 0);
  } catch {
    return undefined;
  }
}

function buildCourseBody(formData: FormData): Record<string, unknown> {
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const thumbnail = formData.get("thumbnail")?.toString().trim();
  const introVideo = formData.get("intro_video")?.toString().trim();
  const priceRaw = formData.get("price")?.toString().trim();
  const salePriceRaw = formData.get("sale_price")?.toString().trim();
  const level = formData.get("level")?.toString().trim();
  const status = formData.get("status")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const categoryIdField = formData.get("category_id");
  const tagIds = parseTagIds(formData.get("tag_ids")?.toString() ?? null);
  const learningOutcomes = parseLearningOutcomes(
    formData.get("learning_outcomes")?.toString(),
  );
  const includes = parseIncludes(formData.get("includes")?.toString());

  const body: Record<string, unknown> = {};
  if (title) body.title = title;
  if (description) body.description = description;
  if (thumbnail) body.thumbnail = thumbnail;
  if (introVideo) body.intro_video = introVideo;
  if (priceRaw) body.price = Number(priceRaw);
  if (salePriceRaw) body.sale_price = Number(salePriceRaw);
  if (level) body.level = level;
  if (status) body.status = status;
  if (categoryIdField !== null) {
    const categoryId = categoryIdField.toString().trim();
    body.category_id = categoryId || null;
  } else if (category) {
    body.category = category;
  }
  if (tagIds !== undefined) body.tag_ids = tagIds;
  if (learningOutcomes !== undefined) body.learning_outcomes = learningOutcomes;
  if (includes !== undefined) body.includes = includes;

  return body;
}

function mapActionError(
  result: { status: number; ok: boolean; error?: string },
  fallback: string,
): string {
  if (result.status === 401) return "Phiên đăng nhập đã hết hạn";
  if (result.status === 403) return "Bạn không có quyền thực hiện thao tác này";
  if (result.error === "One or more tag IDs are invalid") {
    return "Một hoặc nhiều tag không còn tồn tại. Vui lòng chọn lại.";
  }
  if (result.error === "Inactive tags cannot be assigned") {
    return "Một hoặc nhiều tag đã bị vô hiệu hóa. Vui lòng chọn lại.";
  }
  if (result.error === "Tag cannot be used for this entity") {
    return "Tag đã chọn không dành cho khóa học.";
  }
  return result.error ?? fallback;
}

export async function fetchCourses(
  page = 1,
  limit = 10,
  options: { deleted?: "without" | "with" | "only" } = {},
): Promise<CourseListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (options.deleted) {
    params.set("deleted", options.deleted);
  }

  const result = await beFetch<CourseListResponse>(
    `/course-management/courses?${params.toString()}`,
  );

  if (!result.ok || !result.data) {
    return {
      data: [],
      pagination: {
        skip: 0,
        take: limit,
        total: 0,
        hasMore: false,
        page: 1,
        totalPages: 0,
      },
    };
  }

  return result.data;
}

export async function fetchTrashCourses(
  page = 1,
  limit = 10,
): Promise<CourseListResponse> {
  return fetchCourses(page, limit, { deleted: "only" });
}

export async function getCourseDetail(
  id: string,
): Promise<CourseDetail | null> {
  const basic = await beFetch<{ course: CoursePublic }>(
    `/course-management/courses/${id}`,
  );
  if (!basic.ok || !basic.data?.course) return null;

  const detail = await beFetch<{ course: CourseDetail }>(
    `/courses/slug/${basic.data.course.slug}`,
  );

  if (detail.ok && detail.data?.course) {
    return detail.data.course;
  }

  return {
    ...basic.data.course,
    author: null,
    stats: {
      enrollmentCount: 0,
      ratingCount: 0,
      averageRating: null,
      sectionCount: 0,
      lessonCount: 0,
      totalDurationSeconds: 0,
    },
    learningOutcomes: [],
    includes: [],
    sections: [],
  };
}

export async function createCourse(
  _prevState: CreateCourseState,
  formData: FormData,
): Promise<CreateCourseState> {
  const title = formData.get("title")?.toString().trim();
  if (!title) {
    return { ok: false, message: "Tiêu đề khóa học là bắt buộc" };
  }

  const body = buildCourseBody(formData);
  body.title = title;

  // Create schema rejects null category_id — omit when unset
  if (body.category_id === null) {
    delete body.category_id;
  }

  const result = await beFetch<{ course: CoursePublic }>("/courses", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!result.ok || !result.data?.course) {
    return {
      ok: false,
      message: mapActionError(result, "Tạo khóa học thất bại"),
    };
  }

  revalidatePath("/course");

  return {
    ok: true,
    message: "Tạo khóa học thành công",
    course: result.data.course,
  };
}

export async function updateCourse(
  id: string,
  _prevState: CreateCourseState,
  formData: FormData,
): Promise<CreateCourseState> {
  const body = buildCourseBody(formData);

  if (Object.keys(body).length === 0) {
    return { ok: false, message: "Không có thay đổi nào" };
  }

  const result = await beFetch<{ course: CoursePublic }>(`/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  if (!result.ok || !result.data?.course) {
    return {
      ok: false,
      message: mapActionError(result, "Cập nhật khóa học thất bại"),
    };
  }

  revalidatePath("/course");
  revalidatePath(`/course/${id}`);
  revalidatePath(`/course/${id}/edit`);

  return {
    ok: true,
    message: "Cập nhật khóa học thành công",
    course: result.data.course,
  };
}

export async function deleteCourse(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/courses/${id}`, { method: "DELETE" });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Xóa khóa học thất bại"),
    };
  }

  revalidatePath("/course");
  revalidatePath("/course/trash");
  return { ok: true, message: "Đã chuyển khóa học vào thùng rác" };
}

export async function deleteCourses(
  ids: string[],
): Promise<{ ok: boolean; message: string }> {
  if (ids.length === 0) {
    return { ok: false, message: "Chưa chọn khóa học nào" };
  }

  const results = await Promise.all(
    ids.map((id) => beFetch(`/courses/${id}`, { method: "DELETE" })),
  );
  const failed = results.filter((r) => !r.ok).length;

  revalidatePath("/course");
  revalidatePath("/course/trash");

  if (failed > 0) {
    return {
      ok: false,
      message: `Xóa thất bại ${failed}/${ids.length} khóa học`,
    };
  }

  return {
    ok: true,
    message: `Đã chuyển ${ids.length} khóa học vào thùng rác`,
  };
}

export async function restoreCourse(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ course: CoursePublic }>(
    `/courses/${id}/restore`,
    { method: "POST" },
  );

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Khôi phục khóa học thất bại"),
    };
  }

  revalidatePath("/course");
  revalidatePath("/course/trash");
  return { ok: true, message: "Khôi phục khóa học thành công" };
}

export async function restoreCourses(
  ids: string[],
): Promise<{ ok: boolean; message: string }> {
  if (ids.length === 0) {
    return { ok: false, message: "Chưa chọn khóa học nào" };
  }

  const results = await Promise.all(
    ids.map((id) =>
      beFetch<{ course: CoursePublic }>(`/courses/${id}/restore`, {
        method: "POST",
      }),
    ),
  );
  const failed = results.filter((r) => !r.ok).length;

  revalidatePath("/course");
  revalidatePath("/course/trash");

  if (failed > 0) {
    return {
      ok: false,
      message: `Khôi phục thất bại ${failed}/${ids.length} khóa học`,
    };
  }

  return {
    ok: true,
    message: `Đã khôi phục ${ids.length} khóa học`,
  };
}

export async function permanentlyDeleteCourse(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/courses/${id}?mode=hard`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Xóa vĩnh viễn thất bại"),
    };
  }

  revalidatePath("/course");
  revalidatePath("/course/trash");
  return { ok: true, message: "Đã xóa vĩnh viễn khóa học" };
}

export async function permanentlyDeleteCourses(
  ids: string[],
): Promise<{ ok: boolean; message: string }> {
  if (ids.length === 0) {
    return { ok: false, message: "Chưa chọn khóa học nào" };
  }

  const results = await Promise.all(
    ids.map((id) => beFetch(`/courses/${id}?mode=hard`, { method: "DELETE" })),
  );
  const failed = results.filter((r) => !r.ok).length;

  revalidatePath("/course");
  revalidatePath("/course/trash");

  if (failed > 0) {
    return {
      ok: false,
      message: `Xóa vĩnh viễn thất bại ${failed}/${ids.length} khóa học`,
    };
  }

  return {
    ok: true,
    message: `Đã xóa vĩnh viễn ${ids.length} khóa học`,
  };
}

export async function publishCourse(
  id: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ course: CoursePublic }>(
    `/courses/${id}/publish`,
    {
      method: "POST",
    },
  );

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Xuất bản khóa học thất bại"),
    };
  }

  revalidatePath("/course");
  revalidatePath(`/course/${id}`);
  return { ok: true, message: "Xuất bản khóa học thành công" };
}

export async function fetchCourseLearners(
  courseId: string,
): Promise<CourseLearnersResponse> {
  const result = await beFetch<CourseLearnersResponse>(
    `/courses/${courseId}/enrollments/learners`,
  );

  if (!result.ok || !result.data) {
    return { data: [], totalLessons: 0 };
  }

  return result.data;
}

export async function fetchLearnerExerciseHistory(
  courseId: string,
  userId: number,
): Promise<CourseExerciseHistory | null> {
  const result = await beFetch<{ data: CourseExerciseHistory }>(
    `/courses/${courseId}/enrollments/learners/${userId}/exercise-history`,
  );

  if (!result.ok || !result.data) return null;
  return result.data.data;
}

export async function fetchPublishReadiness(
  courseId: string,
): Promise<PublishReadiness | null> {
  const result = await beFetch<{ data: PublishReadiness }>(
    `/courses/${courseId}/publish-readiness`,
  );

  if (!result.ok || !result.data) return null;
  return result.data.data;
}

export async function fetchQuizAttempts(
  quizId: string,
): Promise<QuizAttemptsResponse> {
  const result = await beFetch<QuizAttemptsResponse>(
    `/quizzes/${quizId}/attempts`,
  );

  if (!result.ok || !result.data) return { data: [] };
  return result.data;
}

export async function resetQuizAttempts(
  quizId: string,
  userId: number,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch<{ message: string; deletedCount: number }>(
    `/quizzes/${quizId}/attempts/${userId}/reset`,
    { method: "POST" },
  );

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Reset lượt làm bài thất bại"),
    };
  }

  revalidatePath(`/course/quiz/attempts/${quizId}`);
  return {
    ok: true,
    message: result.data?.message ?? "Đã reset lượt làm bài của học viên",
  };
}

export async function fetchAssignmentSubmissions(
  assignmentId: string,
): Promise<AssignmentSubmissionsResponse> {
  const result = await beFetch<AssignmentSubmissionsResponse>(
    `/assignments/${assignmentId}/submissions`,
  );

  if (!result.ok || !result.data) return { data: [], maxScore: 100 };
  return result.data;
}

export async function gradeAssignmentSubmission(
  assignmentId: string,
  submissionId: string,
  input: GradeAssignmentSubmissionInput,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(
    `/assignment-submissions/${submissionId}/grade`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Chấm điểm bài tập thất bại"),
    };
  }

  revalidatePath(`/course/assignment/${assignmentId}/submissions`);
  return { ok: true, message: "Đã chấm điểm bài tập" };
}

export async function createSection(
  courseId: string,
  input: CreateSectionInput,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/courses/${courseId}/sections`, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Tạo chương thất bại"),
    };
  }

  revalidatePath(`/course/${courseId}`);
  return { ok: true, message: "Tạo chương thành công" };
}

export async function updateSection(
  courseId: string,
  sectionId: string,
  input: UpdateSectionInput,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/courses/${courseId}/sections/${sectionId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Cập nhật chương thất bại"),
    };
  }

  revalidatePath(`/course/${courseId}`);
  return { ok: true, message: "Cập nhật chương thành công" };
}

export async function deleteSection(
  courseId: string,
  sectionId: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/courses/${courseId}/sections/${sectionId}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Xóa chương thất bại"),
    };
  }

  revalidatePath(`/course/${courseId}`);
  return { ok: true, message: "Xóa chương thành công" };
}

export async function createLesson(
  courseId: string,
  sectionId: string,
  input: CreateLessonInput,
): Promise<{ ok: boolean; message: string; lessonId?: string }> {
  const result = await beFetch<{ data?: LessonCreateResponseData }>(
    `/courses/${courseId}/sections/${sectionId}/lessons`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Tạo bài học thất bại"),
    };
  }

  const lessonId = result.data?.data?.id;

  revalidatePath(`/course/${courseId}`);
  if (lessonId) {
    revalidatePath(`/course/${courseId}/lessons/${lessonId}/edit`);
  }

  return {
    ok: true,
    message: "Tạo bài học thành công",
    ...(lessonId ? { lessonId } : {}),
  };
}

export async function updateLesson(
  courseId: string,
  lessonId: string,
  input: UpdateLessonInput,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/courses/${courseId}/lessons/${lessonId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Cập nhật bài học thất bại"),
    };
  }

  revalidatePath(`/course/${courseId}`);
  revalidatePath(`/course/${courseId}/lessons/${lessonId}/edit`);
  return { ok: true, message: "Cập nhật bài học thành công" };
}

export async function deleteLesson(
  courseId: string,
  lessonId: string,
): Promise<{ ok: boolean; message: string }> {
  const result = await beFetch(`/courses/${courseId}/lessons/${lessonId}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return {
      ok: false,
      message: mapActionError(result, "Xóa bài học thất bại"),
    };
  }

  revalidatePath(`/course/${courseId}`);
  return { ok: true, message: "Xóa bài học thành công" };
}
