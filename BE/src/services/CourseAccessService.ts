import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import type { LessonRecord } from '@src/models/Lesson.model';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as EnrollmentRepo from '@src/repos/EnrollmentRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import authorizationService from '@src/services/AuthorizationService';

const Errors = {
  COURSE_NOT_FOUND: 'Course not found',
  LESSON_NOT_FOUND: 'Lesson not found',
  FORBIDDEN: 'You do not have access to this content',
} as const;

type CourseAccessDeps = {
  canPerform: typeof authorizationService.canPerform;
  isActiveEnrolled: typeof EnrollmentRepo.isActiveEnrolled;
  findCourseById: typeof CourseRepo.findById;
  findLessonById: typeof LessonRepo.findById;
  findLessonByIdAndCourseId: typeof LessonRepo.findByIdAndCourseId;
};

let deps: CourseAccessDeps = {
  canPerform: (...args) => authorizationService.canPerform(...args),
  isActiveEnrolled: (...args) => EnrollmentRepo.isActiveEnrolled(...args),
  findCourseById: (...args) => CourseRepo.findById(...args),
  findLessonById: (...args) => LessonRepo.findById(...args),
  findLessonByIdAndCourseId: (...args) =>
    LessonRepo.findByIdAndCourseId(...args),
};

export function setCourseAccessDeps(overrides: Partial<CourseAccessDeps>): void {
  deps = { ...deps, ...overrides };
}

export function resetCourseAccessDeps(): void {
  deps = {
    canPerform: (...args) => authorizationService.canPerform(...args),
    isActiveEnrolled: (...args) => EnrollmentRepo.isActiveEnrolled(...args),
    findCourseById: (...args) => CourseRepo.findById(...args),
    findLessonById: (...args) => LessonRepo.findById(...args),
    findLessonByIdAndCourseId: (...args) =>
      LessonRepo.findByIdAndCourseId(...args),
  };
}

async function hasGlobalCoursePermission(
  userId: number,
  action: 'read' | 'update' | 'create' | 'delete',
  courseId?: string,
): Promise<boolean> {
  return deps.canPerform({
    userId,
    action,
    resourceType: RESOURCE_TYPES.COURSE,
    resourceId: courseId,
  });
}

export async function canManageCourse(
  userId: number,
  courseId: string,
): Promise<boolean> {
  const course = await deps.findCourseById(courseId);
  if (!course) {
    return false;
  }

  if (course.instructorId === userId) {
    return true;
  }

  if (await hasGlobalCoursePermission(userId, 'update', courseId)) {
    return true;
  }

  return hasGlobalCoursePermission(userId, 'update');
}

export async function isEnrolled(
  userId: number,
  courseId: string,
): Promise<boolean> {
  return deps.isActiveEnrolled(userId, courseId);
}

export async function canViewCourseContent(
  userId: number | null,
  courseId: string,
  lesson?: LessonRecord,
): Promise<boolean> {
  const course = await deps.findCourseById(courseId);
  if (!course) {
    return false;
  }

  if (userId !== null && (await canManageCourse(userId, courseId))) {
    return true;
  }

  if (course.status !== 'published') {
    return false;
  }

  if (!lesson) {
    return true;
  }

  if (lesson.isPreview) {
    return true;
  }

  if (userId === null) {
    return false;
  }

  return deps.isActiveEnrolled(userId, courseId);
}

export async function assertLessonAccess(
  userId: number | null,
  lessonId: string,
): Promise<LessonRecord> {
  const lesson = await deps.findLessonById(lessonId);
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.LESSON_NOT_FOUND);
  }

  const allowed = await canViewCourseContent(userId, lesson.courseId, lesson);
  if (!allowed) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }

  return lesson;
}

export async function assertCourseCurriculumAccess(
  userId: number | null,
  courseId: string,
): Promise<void> {
  const course = await deps.findCourseById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }

  if (course.status !== 'published') {
    if (userId === null || !(await canManageCourse(userId, courseId))) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
    }
    return;
  }

  if (userId !== null) {
    const hasFullAccess =
      (await canManageCourse(userId, courseId)) ||
      (await deps.isActiveEnrolled(userId, courseId));
    if (hasFullAccess) {
      return;
    }
  }
}

export async function canReadCourseEnrollments(
  userId: number,
  courseId: string,
): Promise<boolean> {
  if (await canManageCourse(userId, courseId)) {
    return true;
  }
  return hasGlobalCoursePermission(userId, 'read', courseId);
}

export default {
  Errors,
  canManageCourse,
  isEnrolled,
  canViewCourseContent,
  assertLessonAccess,
  assertCourseCurriculumAccess,
  canReadCourseEnrollments,
};
