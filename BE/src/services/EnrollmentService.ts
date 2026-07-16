import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  GrantEnrollmentInput,
  UpdateEnrollmentInput,
} from '@src/models/Enrollment.model';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as EnrollmentRepo from '@src/repos/EnrollmentRepo';
import CourseAccessService from '@src/services/CourseAccessService';

const Errors = {
  COURSE_NOT_FOUND: 'Course not found',
  NOT_PUBLISHED: 'Course is not published',
  NOT_FREE: 'Course is not free',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Enrollment not found',
  ALREADY_ENROLLED: 'Already enrolled in this course',
} as const;

async function grant(
  courseId: string,
  actorUserId: number,
  input: GrantEnrollmentInput,
) {
  const canManage = await CourseAccessService.canManageCourse(
    actorUserId,
    courseId,
  );
  if (!canManage) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }

  const course = await CourseRepo.findById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }

  const enrollment = await EnrollmentRepo.grant(
    input.user_id,
    courseId,
    input.source,
    input.expired_at ?? null,
  );

  return { data: enrollment };
}

async function selfEnrollFree(courseId: string, userId: number) {
  const course = await CourseRepo.findById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }
  if (course.status !== 'published') {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NOT_PUBLISHED);
  }
  if (course.price > 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NOT_FREE);
  }

  const existing = await EnrollmentRepo.findActive(userId, courseId);
  if (existing) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.ALREADY_ENROLLED);
  }

  const enrollment = await EnrollmentRepo.grant(userId, courseId, 'free');
  return { data: enrollment };
}

async function enroll(
  courseId: string,
  actorUserId: number,
  body: GrantEnrollmentInput | undefined,
) {
  if (body?.user_id !== undefined) {
    return grant(courseId, actorUserId, body);
  }
  return selfEnrollFree(courseId, actorUserId);
}

async function listByCourse(courseId: string, actorUserId: number) {
  const canRead = await CourseAccessService.canReadCourseEnrollments(
    actorUserId,
    courseId,
  );
  if (!canRead) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }

  const course = await CourseRepo.findById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }

  const data = await EnrollmentRepo.listByCourse(courseId);
  return { data };
}

async function listMine(userId: number) {
  const data = await EnrollmentRepo.listByUser(userId);
  return { data };
}

async function revoke(courseId: string, targetUserId: number, actorUserId: number) {
  const canManage = await CourseAccessService.canManageCourse(
    actorUserId,
    courseId,
  );
  if (!canManage) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }

  const updated = await EnrollmentRepo.updateByUserAndCourse(
    targetUserId,
    courseId,
    { status: 'cancelled' },
  );
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return { data: updated };
}

async function updateEnrollment(
  courseId: string,
  targetUserId: number,
  actorUserId: number,
  input: UpdateEnrollmentInput,
) {
  const canManage = await CourseAccessService.canManageCourse(
    actorUserId,
    courseId,
  );
  if (!canManage) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }

  const updated = await EnrollmentRepo.updateByUserAndCourse(
    targetUserId,
    courseId,
    {
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.expired_at !== undefined ? { expiredAt: input.expired_at } : {}),
    },
  );
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return { data: updated };
}

/** Called after successful payment — grants paid enrollment. */
async function createPaidEnrollment(userId: number, courseId: string) {
  const course = await CourseRepo.findById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }

  const existing = await EnrollmentRepo.findActive(userId, courseId);
  if (existing) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.ALREADY_ENROLLED);
  }

  return EnrollmentRepo.grant(userId, courseId, 'paid');
}

export default {
  Errors,
  enroll,
  grant,
  selfEnrollFree,
  listByCourse,
  listMine,
  revoke,
  updateEnrollment,
  createPaidEnrollment,
};
