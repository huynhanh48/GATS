import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  CreateLessonNoteInput,
  UpdateLessonNoteInput,
} from '@src/models/LessonQna.model';
import * as LessonNoteRepo from '@src/repos/LessonNoteRepo';
import CourseAccessService from '@src/services/CourseAccessService';

const Errors = {
  NOT_FOUND: 'Note not found',
} as const;

async function addNote(
  userId: number,
  lessonId: string,
  input: CreateLessonNoteInput,
) {
  const lesson = await CourseAccessService.assertLessonAccess(userId, lessonId);

  const note = await LessonNoteRepo.create({
    userId,
    lessonId,
    courseId: lesson.courseId,
    content: input.content,
    timestampSeconds: input.timestampSeconds ?? null,
  });

  return { data: note };
}

async function listByLesson(userId: number, lessonId: string) {
  await CourseAccessService.assertLessonAccess(userId, lessonId);
  const notes = await LessonNoteRepo.listByUserAndLesson(userId, lessonId);
  return { data: notes };
}

async function listByCourse(userId: number, courseId: string) {
  await CourseAccessService.assertCourseCurriculumAccess(userId, courseId);
  const notes = await LessonNoteRepo.listByUserAndCourse(userId, courseId);
  return { data: notes };
}

async function update(
  userId: number,
  noteId: string,
  input: UpdateLessonNoteInput,
) {
  const updated = await LessonNoteRepo.updateIfOwner(noteId, userId, {
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.timestampSeconds !== undefined
      ? { timestampSeconds: input.timestampSeconds }
      : {}),
  });
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return { data: updated };
}

async function remove(userId: number, noteId: string) {
  const removed = await LessonNoteRepo.removeIfOwner(noteId, userId);
  if (!removed) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return { message: 'Đã xóa ghi chú' };
}

export default {
  Errors,
  addNote,
  listByLesson,
  listByCourse,
  update,
  remove,
};
