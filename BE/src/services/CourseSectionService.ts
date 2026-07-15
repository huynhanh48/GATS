import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  CreateCourseSectionInput,
  UpdateCourseSectionInput,
} from '@src/models/CourseSection.model';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as CourseSectionRepo from '@src/repos/CourseSectionRepo';

const Errors = {
  COURSE_NOT_FOUND: 'Course not found',
  SECTION_NOT_FOUND: 'Section not found',
} as const;

async function list(courseId: string) {
  const course = await CourseRepo.findById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }
  const data = await CourseSectionRepo.listByCourse(courseId);
  return { data };
}

async function create(courseId: string, input: CreateCourseSectionInput) {
  const course = await CourseRepo.findById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }

  const order =
    input.order ?? (await CourseSectionRepo.getNextOrder(courseId));

  const section = await CourseSectionRepo.create({
    courseId,
    title: input.title,
    order,
  });
  return { data: section };
}

async function update(
  courseId: string,
  sectionId: string,
  input: UpdateCourseSectionInput,
) {
  const section = await CourseSectionRepo.findByIdAndCourseId(
    sectionId,
    courseId,
  );
  if (!section) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.SECTION_NOT_FOUND);
  }

  const updated = await CourseSectionRepo.update(sectionId, {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.order !== undefined ? { order: input.order } : {}),
  });
  return { data: updated };
}

async function remove(courseId: string, sectionId: string) {
  const section = await CourseSectionRepo.findByIdAndCourseId(
    sectionId,
    courseId,
  );
  if (!section) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.SECTION_NOT_FOUND);
  }

  await CourseSectionRepo.remove(sectionId);
  return { message: 'Section deleted' };
}

export default {
  Errors,
  list,
  create,
  update,
  remove,
};
