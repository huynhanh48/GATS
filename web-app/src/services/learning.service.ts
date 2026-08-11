import apiClient from "@/lib/apiClient";
import { PathApi } from "@/constants/PathApi";

const LEARN_CACHE_TTL_MS = 45_000;

type CacheEntry<T> = { at: number; value: T };

function readCache<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
  const hit = map.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > LEARN_CACHE_TTL_MS) {
    map.delete(key);
    return null;
  }
  return hit.value;
}

function writeCache<T>(
  map: Map<string, CacheEntry<T>>,
  key: string,
  value: T,
): void {
  map.set(key, { at: Date.now(), value });
}

async function withInflight<T>(
  inflight: Map<string, Promise<T>>,
  key: string,
  factory: () => Promise<T>,
): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing;
  const promise = factory().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}

const enrollmentsCache = new Map<string, CacheEntry<EnrollmentWithCourse[]>>();
const enrollmentsInflight = new Map<string, Promise<EnrollmentWithCourse[]>>();
const courseSlugCache = new Map<string, CacheEntry<unknown>>();
const courseSlugInflight = new Map<string, Promise<unknown>>();
const lessonPlaybackCache = new Map<
  string,
  CacheEntry<{
    videoId: string | null;
    playbackUrl: string;
    audioFlacUrl: string | null;
  }>
>();
const lessonPlaybackInflight = new Map<
  string,
  Promise<{
    videoId: string | null;
    playbackUrl: string;
    audioFlacUrl: string | null;
  }>
>();

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
  nextLessonId?: string | null;
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
  const cacheKey = "mine";
  const cached = readCache(enrollmentsCache, cacheKey);
  if (cached) return cached;

  return withInflight(enrollmentsInflight, cacheKey, async () => {
    const res: any = await apiClient.get(PathApi.enrollment.listMine);
    const data = Array.isArray(res?.data) ? res.data : [];
    writeCache(enrollmentsCache, cacheKey, data);
    return data;
  });
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
  const cacheKey = slug.trim().toLowerCase();
  const cached = readCache(courseSlugCache, cacheKey);
  if (cached !== null) return cached;

  return withInflight(courseSlugInflight, cacheKey, async () => {
    const res: any = await apiClient.get(PathApi.courses.detailBySlug(slug));
    const course = res?.course ?? res?.data?.course ?? res?.data ?? null;
    writeCache(courseSlugCache, cacheKey, course);
    return course;
  });
}

export async function fetchLessonPlayback(courseId: string, lessonId: string) {
  const cacheKey = `${courseId}:${lessonId}`;
  const cached = readCache(lessonPlaybackCache, cacheKey);
  if (cached) return cached;

  return withInflight(lessonPlaybackInflight, cacheKey, async () => {
    try {
      const playbackRes: any = await apiClient.get(
        PathApi.video.lessonPlayback(courseId, lessonId),
      );
      const data = playbackRes?.data;
      if (!data?.videoId) {
        const empty = {
          videoId: null as string | null,
          playbackUrl: "",
          audioFlacUrl: null as string | null,
        };
        writeCache(lessonPlaybackCache, cacheKey, empty);
        return empty;
      }
      const result = {
        videoId: data.videoId as string,
        playbackUrl: (data.playbackUrl as string) || "",
        audioFlacUrl: (data.audioFlacUrl as string) || null,
      };
      writeCache(lessonPlaybackCache, cacheKey, result);
      return result;
    } catch {
      // Fallback to legacy two-hop if combined route unavailable.
      const lessonVideoRes: any = await apiClient.get(
        PathApi.video.lessonVideo(courseId, lessonId),
      );
      const videoId = lessonVideoRes?.data?.videoId as string | undefined;
      if (!videoId) {
        const empty = {
          videoId: null as string | null,
          playbackUrl: "",
          audioFlacUrl: null as string | null,
        };
        writeCache(lessonPlaybackCache, cacheKey, empty);
        return empty;
      }
      const playbackRes: any = await apiClient.get(
        PathApi.video.playback(courseId, videoId),
      );
      const result = {
        videoId,
        playbackUrl: (playbackRes?.data?.playbackUrl as string) || "",
        audioFlacUrl: (playbackRes?.data?.audioFlacUrl as string) || null,
      };
      writeCache(lessonPlaybackCache, cacheKey, result);
      return result;
    }
  });
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
    question: string;
    isCorrect: boolean;
    score: number;
    maxScore: number;
    selectedAnswer: string | null;
    correctAnswers: string[];
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
