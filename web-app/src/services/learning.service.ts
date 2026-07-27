import apiClient from "@/lib/apiClient";
import { PathApi } from "@/constants/PathApi";

export type EnrollmentWithCourse = {
  id: string;
  courseId: string;
  status: string;
  enrolledAt?: string;
  createdAt?: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    level?: string;
  };
};

export type CourseProgress = {
  completedLessons: number;
  totalLessons: number;
  percent: number;
  completedLessonIds?: string[];
};

export type LessonProgress = {
  id: string;
  lessonId: string;
  watchedSeconds: number;
  durationSeconds: number | null;
  percent: number;
  isCompleted: boolean;
  lastWatchedAt?: string;
};

export async function fetchMyEnrollments(): Promise<EnrollmentWithCourse[]> {
  const res: any = await apiClient.get(PathApi.enrollment.listMine);
  return Array.isArray(res?.data) ? res.data : [];
}

export async function fetchCourseProgress(
  courseId: string,
): Promise<CourseProgress> {
  const res: any = await apiClient.get(PathApi.progress.course(courseId));
  return (
    res?.data ?? {
      completedLessons: 0,
      totalLessons: 0,
      percent: 0,
    }
  );
}

export async function fetchLessonProgress(
  courseId: string,
  lessonId: string,
): Promise<LessonProgress | null> {
  const res: any = await apiClient.get(
    PathApi.progress.lessonGet(courseId, lessonId),
  );
  return res?.data ?? null;
}

export async function upsertLessonProgress(
  courseId: string,
  lessonId: string,
  body: {
    watched_seconds: number;
    duration_seconds?: number;
    video_id?: string;
  },
) {
  return apiClient.put(PathApi.progress.lesson(courseId, lessonId), body);
}

export async function fetchCourseBySlug(slug: string) {
  const res: any = await apiClient.get(PathApi.courses.detailBySlug(slug));
  return res?.course ?? res?.data?.course ?? res?.data ?? null;
}

export async function fetchLessonPlayback(courseId: string, lessonId: string) {
  const lessonVideoRes: any = await apiClient.get(
    PathApi.video.lessonVideo(courseId, lessonId),
  );
  const videoId = lessonVideoRes?.data?.videoId as string | undefined;
  if (!videoId) {
    return {
      videoId: null as string | null,
      playbackUrl: "",
      audioFlacUrl: null as string | null,
    };
  }
  const playbackRes: any = await apiClient.get(
    PathApi.video.playback(courseId, videoId),
  );
  return {
    videoId,
    playbackUrl: (playbackRes?.data?.playbackUrl as string) || "",
    audioFlacUrl: (playbackRes?.data?.audioFlacUrl as string) || null,
  };
}

export type QuizTakeQuestion = {
  id: string;
  type: "single_choice" | "multiple_choice" | "fill_blank" | string;
  question: string;
  description?: string | null;
  points: number;
  isRequired?: boolean;
  answers?: Array<{ id: string; answer: string; order?: number }>;
};

export type QuizTakePayload = {
  id: string;
  title?: string | null;
  description?: string | null;
  questions: QuizTakeQuestion[];
};

export type QuizSubmitResult = {
  score: number;
  maxScore: number;
  percentage: number;
  passed?: boolean;
  correctCount: number;
  totalQuestions: number;
  results: Array<{
    questionId: string;
    isCorrect: boolean;
    score: number;
    explanation?: string | null;
  }>;
};

export async function fetchLessonQuiz(
  courseId: string,
  lessonId: string,
): Promise<QuizTakePayload> {
  const res: any = await apiClient.get(PathApi.quiz.byLesson(courseId, lessonId));
  return res?.data;
}

export async function submitLessonQuiz(
  quizId: string,
  answers: Array<{
    questionId: string;
    selectedAnswerId?: string;
    textAnswer?: string;
  }>,
): Promise<QuizSubmitResult> {
  const res: any = await apiClient.post(PathApi.quiz.submit(quizId), { answers });
  return res?.data;
}

export type AssignmentPayload = {
  id: string;
  title?: string | null;
  dueAt?: string | null;
  maxScore: number;
  maxFileSizeMb?: number | null;
  allowedSubmissionTypes: Array<"text" | "url" | "file">;
  lateSubmissionAllowed: boolean;
  maxSubmissions: number;
  remainingSubmissions: number;
  latestSubmission?: {
    id: string;
    status: string;
    score?: number | null;
    feedback?: string | null;
    textContent?: string | null;
    url?: string | null;
    submittedAt?: string | null;
    gradedAt?: string | null;
  } | null;
};

export async function fetchLessonAssignment(
  courseId: string,
  lessonId: string,
): Promise<AssignmentPayload> {
  const res: any = await apiClient.get(
    PathApi.assignment.byLesson(courseId, lessonId),
  );
  return res?.data;
}

export async function submitLessonAssignment(
  assignmentId: string,
  body: { text_content?: string; url?: string },
) {
  const res: any = await apiClient.post(
    PathApi.assignment.submit(assignmentId),
    body,
  );
  return res?.data;
}

// ─── Q&A / Notes / Bookmarks ────────────────────────────────────────────────

export type LessonAnswer = {
  id: string;
  questionId: string;
  userId: number;
  userName: string | null;
  content: string;
  isInstructorAnswer: boolean;
  createdAt: string;
};

export type LessonQuestion = {
  id: string;
  lessonId: string;
  courseId: string;
  userId: number;
  userName: string | null;
  content: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  answers: LessonAnswer[];
};

export async function fetchLessonQuestions(
  courseId: string,
  lessonId: string,
): Promise<LessonQuestion[]> {
  const res: any = await apiClient.get(
    PathApi.learnExtras.questions(courseId, lessonId),
  );
  return Array.isArray(res?.data) ? res.data : [];
}

export async function askLessonQuestion(
  courseId: string,
  lessonId: string,
  content: string,
): Promise<LessonQuestion> {
  const res: any = await apiClient.post(
    PathApi.learnExtras.questions(courseId, lessonId),
    { content },
  );
  return res?.data;
}

export async function deleteLessonQuestion(questionId: string) {
  return apiClient.delete(PathApi.learnExtras.deleteQuestion(questionId));
}

export type LessonNote = {
  id: string;
  userId: number;
  lessonId: string;
  courseId: string;
  content: string;
  timestampSeconds: number | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchLessonNotes(
  courseId: string,
  lessonId: string,
): Promise<LessonNote[]> {
  const res: any = await apiClient.get(
    PathApi.learnExtras.lessonNotes(courseId, lessonId),
  );
  return Array.isArray(res?.data) ? res.data : [];
}

export async function addLessonNote(
  courseId: string,
  lessonId: string,
  content: string,
  timestampSeconds?: number | null,
): Promise<LessonNote> {
  const res: any = await apiClient.post(
    PathApi.learnExtras.lessonNotes(courseId, lessonId),
    { content, timestampSeconds },
  );
  return res?.data;
}

export async function updateLessonNote(
  noteId: string,
  content: string,
): Promise<LessonNote> {
  const res: any = await apiClient.patch(PathApi.learnExtras.note(noteId), {
    content,
  });
  return res?.data;
}

export async function deleteLessonNote(noteId: string) {
  return apiClient.delete(PathApi.learnExtras.note(noteId));
}

export type LessonBookmark = {
  id: string;
  userId: number;
  lessonId: string;
  courseId: string;
  label: string | null;
  timestampSeconds: number | null;
  createdAt: string;
};

export async function fetchLessonBookmarks(
  courseId: string,
  lessonId: string,
): Promise<LessonBookmark[]> {
  const res: any = await apiClient.get(
    PathApi.learnExtras.lessonBookmarks(courseId, lessonId),
  );
  return Array.isArray(res?.data) ? res.data : [];
}

export async function addLessonBookmark(
  courseId: string,
  lessonId: string,
  label?: string,
  timestampSeconds?: number | null,
): Promise<LessonBookmark> {
  const res: any = await apiClient.post(
    PathApi.learnExtras.lessonBookmarks(courseId, lessonId),
    { label, timestampSeconds },
  );
  return res?.data;
}

export async function deleteLessonBookmark(bookmarkId: string) {
  return apiClient.delete(PathApi.learnExtras.bookmark(bookmarkId));
}
