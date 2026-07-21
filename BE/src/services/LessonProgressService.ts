import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import {
  calculateProgressPercent,
  isLessonCompleted,
  type UpsertLessonProgressInput,
} from '@src/models/LessonProgress.model';
import * as LessonProgressRepo from '@src/repos/LessonProgressRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import CertificateService from '@src/services/CertificateService';
import CourseAccessService from '@src/services/CourseAccessService';

const Errors = {
  LESSON_NOT_FOUND: 'Lesson not found',
  COURSE_MISMATCH: 'Lesson does not belong to this course',
} as const;

async function upsert(
  userId: number,
  courseId: string,
  lessonId: string,
  input: UpsertLessonProgressInput,
) {
  const lesson = await CourseAccessService.assertLessonAccess(userId, lessonId);
  if (lesson.courseId !== courseId) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.COURSE_MISMATCH);
  }

  const durationSeconds =
    input.duration_seconds ?? lesson.duration ?? null;
  const percent = calculateProgressPercent(
    input.watched_seconds,
    durationSeconds,
  );
  const existing = await LessonProgressRepo.findByUserAndLesson(
    userId,
    lessonId,
  );
  // Đã hoàn thành thì không hạ xuống incomplete khi lưu tiến độ xem lại
  const completed =
    isLessonCompleted(percent) || Boolean(existing?.isCompleted);

  const progress = await LessonProgressRepo.upsert({
    userId,
    courseId,
    lessonId,
    videoId: input.video_id ?? null,
    watchedSeconds: input.watched_seconds,
    durationSeconds,
    percent: Math.max(percent, existing?.percent ?? 0),
    isCompleted: completed,
    completedAt: completed
      ? (existing?.completedAt ?? new Date())
      : null,
  });

  if (completed) {
    void maybeIssueCertificate(userId, courseId);
  }

  return { data: progress };
}

/** Fire-and-forget: issues a certificate once course progress reaches 100%. */
async function maybeIssueCertificate(userId: number, courseId: string) {
  try {
    const totalLessons = await LessonRepo.countByCourse(courseId);
    if (totalLessons === 0) return;
    const aggregate = await LessonProgressRepo.getCourseAggregate(
      userId,
      courseId,
      totalLessons,
    );
    if (aggregate.percent >= 100) {
      await CertificateService.issueIfEligible(userId, courseId);
    }
  } catch (err) {
    console.error('Auto certificate issuance failed', err);
  }
}

async function getLessonProgress(
  userId: number,
  courseId: string,
  lessonId: string,
) {
  const lesson = await CourseAccessService.assertLessonAccess(userId, lessonId);
  if (lesson.courseId !== courseId) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.COURSE_MISMATCH);
  }

  const progress = await LessonProgressRepo.findByUserAndLesson(
    userId,
    lessonId,
  );
  return { data: progress ?? null };
}

async function getCourseProgress(userId: number, courseId: string) {
  await CourseAccessService.assertCourseCurriculumAccess(userId, courseId);

  const canManage = await CourseAccessService.canManageCourse(userId, courseId);
  const enrolled = await CourseAccessService.isEnrolled(userId, courseId);
  if (!canManage && !enrolled) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      CourseAccessService.Errors.FORBIDDEN,
    );
  }

  const totalLessons = await LessonRepo.countByCourse(courseId);
  const [aggregate, rows] = await Promise.all([
    LessonProgressRepo.getCourseAggregate(userId, courseId, totalLessons),
    LessonProgressRepo.listByUserAndCourse(userId, courseId),
  ]);

  const completedLessonIds = rows
    .filter((row) => row.isCompleted)
    .map((row) => row.lessonId);

  return {
    data: {
      ...aggregate,
      completedLessonIds,
    },
  };
}

export default {
  Errors,
  upsert,
  getLessonProgress,
  getCourseProgress,
};
