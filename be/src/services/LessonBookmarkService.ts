import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type { CreateLessonBookmarkInput } from '@src/models/LessonQna.model';
import * as LessonBookmarkRepo from '@src/repos/LessonBookmarkRepo';
import CourseAccessService from '@src/services/CourseAccessService';

const Errors = {
  NOT_FOUND: 'Bookmark not found',
} as const;

async function addBookmark(
  userId: number,
  lessonId: string,
  input: CreateLessonBookmarkInput,
) {
  const lesson = await CourseAccessService.assertLessonAccess(userId, lessonId);

  const bookmark = await LessonBookmarkRepo.create({
    userId,
    lessonId,
    courseId: lesson.courseId,
    label: input.label || null,
    timestampSeconds: input.timestampSeconds ?? null,
  });

  return { data: bookmark };
}

async function listByLesson(userId: number, lessonId: string) {
  await CourseAccessService.assertLessonAccess(userId, lessonId);
  const bookmarks = await LessonBookmarkRepo.listByUserAndLesson(
    userId,
    lessonId,
  );
  return { data: bookmarks };
}

async function listByCourse(userId: number, courseId: string) {
  await CourseAccessService.assertCourseCurriculumAccess(userId, courseId);
  const bookmarks = await LessonBookmarkRepo.listByUserAndCourse(
    userId,
    courseId,
  );
  return { data: bookmarks };
}

async function remove(userId: number, bookmarkId: string) {
  const removed = await LessonBookmarkRepo.removeIfOwner(bookmarkId, userId);
  if (!removed) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return { message: 'Đã xóa dấu trang' };
}

export default {
  Errors,
  addBookmark,
  listByLesson,
  listByCourse,
  remove,
};
