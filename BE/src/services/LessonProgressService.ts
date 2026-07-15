import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import {
  calculateProgressPercent,
  isLessonCompleted,
  type UpsertLessonProgressInput,
} from '@src/models/LessonProgress.model';
import * as LessonProgressRepo from '@src/repos/LessonProgressRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
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
  const completed = isLessonCompleted(percent);

  const progress = await LessonProgressRepo.upsert({
    userId,
    courseId,
    lessonId,
    videoId: input.video_id ?? null,
    watchedSeconds: input.watched_seconds,
    durationSeconds,
    percent,
    isCompleted: completed,
    completedAt: completed ? new Date() : null,
  });

  return { data: progress };
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
  const aggregate = await LessonProgressRepo.getCourseAggregate(
    userId,
    courseId,
    totalLessons,
  );

  return { data: aggregate };
}

export default {
  Errors,
  upsert,
  getLessonProgress,
  getCourseProgress,
};
