import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  CreateLessonInput,
  UpdateLessonInput,
} from '@src/models/Lesson.model';
import * as CourseSectionRepo from '@src/repos/CourseSectionRepo';
import * as LessonRepo from '@src/repos/LessonRepo';

const Errors = {
  SECTION_NOT_FOUND: 'Section not found',
  LESSON_NOT_FOUND: 'Lesson not found',
  COURSE_MISMATCH: 'Lesson does not belong to this course',
} as const;

async function create(
  courseId: string,
  sectionId: string,
  input: CreateLessonInput,
) {
  const section = await CourseSectionRepo.findByIdAndCourseId(
    sectionId,
    courseId,
  );
  if (!section) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.SECTION_NOT_FOUND);
  }

  const order =
    input.order ?? (await LessonRepo.getNextOrderInSection(sectionId));

  const lesson = await LessonRepo.create({
    courseId,
    sectionId,
    title: input.title,
    description: input.description ?? null,
    type: input.type,
    order,
    content: input.content ?? null,
    isPreview: input.is_preview,
    duration: input.duration ?? null,
  });
  return { data: lesson };
}

async function update(
  courseId: string,
  lessonId: string,
  input: UpdateLessonInput,
) {
  const lesson = await LessonRepo.findByIdAndCourseId(lessonId, courseId);
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.LESSON_NOT_FOUND);
  }

  if (input.type !== undefined && input.type !== lesson.type) {
    const QuizService = (await import('@src/services/QuizService')).default;
    await QuizService.assertLessonTypeChangeAllowed(lessonId, input.type);
  }

  const updated = await LessonRepo.update(lessonId, {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.order !== undefined ? { order: input.order } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.is_preview !== undefined ? { isPreview: input.is_preview } : {}),
    ...(input.duration !== undefined ? { duration: input.duration } : {}),
  });
  return { data: updated };
}

async function remove(courseId: string, lessonId: string) {
  const lesson = await LessonRepo.findByIdAndCourseId(lessonId, courseId);
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.LESSON_NOT_FOUND);
  }

  await LessonRepo.remove(lessonId);
  return { message: 'Lesson deleted' };
}

export default {
  Errors,
  create,
  update,
  remove,
};
