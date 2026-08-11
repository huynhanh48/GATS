import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  GrantEnrollmentInput,
  UpdateEnrollmentInput,
} from '@src/models/Enrollment.model';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as EnrollmentRepo from '@src/repos/EnrollmentRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import * as LessonProgressRepo from '@src/repos/LessonProgressRepo';
import * as UserRepo from '@src/repos/UserRepo';
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
  // Payable amount: sale only when it is a real discount below list price.
  const effectivePrice =
    course.salePrice != null &&
    course.salePrice > 0 &&
    course.salePrice < course.price
      ? course.salePrice
      : course.price;
  if (effectivePrice > 0) {
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

async function listLearners(courseId: string, actorUserId: number) {
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

  const enrollments = await EnrollmentRepo.listByCourse(courseId);
  const userIds = [...new Set(enrollments.map((e) => e.userId))];
  const totalLessons = await LessonRepo.countByCourse(courseId);

  const [users, progressByUser] = await Promise.all([
    UserRepo.findByIds(userIds),
    LessonProgressRepo.getCourseAggregateByUsers(
      courseId,
      userIds,
      totalLessons,
    ),
  ]);
  const userById = new Map(users.map((u) => [u.id, u]));

  const data = enrollments.map((enrollment) => {
    const user = userById.get(enrollment.userId);
    const progress = progressByUser.get(enrollment.userId);
    return {
      enrollmentId: enrollment.id,
      userId: enrollment.userId,
      userName: user?.userName ?? null,
      email: user?.email ?? null,
      status: enrollment.status,
      source: enrollment.source,
      enrolledAt: enrollment.enrolledAt,
      expiredAt: enrollment.expiredAt,
      completedLessons: progress?.completedLessons ?? 0,
      totalLessons,
      percent: progress?.percent ?? 0,
      lastActivityAt: progress?.lastActivityAt ?? null,
    };
  });

  return { data, totalLessons };
}

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function exportLearnersCsv(courseId: string, actorUserId: number) {
  const { data, totalLessons } = await listLearners(courseId, actorUserId);
  const header = [
    'User ID',
    'Tên',
    'Email',
    'Trạng thái',
    'Nguồn',
    'Bài hoàn thành',
    'Tổng bài',
    'Tiến độ %',
    'Hoạt động gần nhất',
    'Đăng ký lúc',
  ];
  const lines = [header.map(csvEscape).join(',')];
  for (const row of data) {
    lines.push(
      [
        row.userId,
        row.userName,
        row.email,
        row.status,
        row.source,
        row.completedLessons,
        totalLessons,
        row.percent,
        row.lastActivityAt?.toISOString?.() ?? row.lastActivityAt,
        row.enrolledAt?.toISOString?.() ?? row.enrolledAt,
      ]
        .map(csvEscape)
        .join(','),
    );
  }
  const stamp = new Date().toISOString().slice(0, 10);
  return {
    csv: `\uFEFF${lines.join('\n')}`,
    filename: `learners-${courseId.slice(0, 8)}-${stamp}.csv`,
  };
}

async function listMine(userId: number) {
  const data = await EnrollmentRepo.listByUser(userId);
  if (data.length === 0) {
    return { data: [] };
  }

  const courses = await CourseRepo.findByIds(data.map((enr) => enr.courseId));
  const courseById = new Map(courses.map((course) => [course.id, course]));

  const result = [];
  for (const enr of data) {
    const course = courseById.get(enr.courseId);
    if (course) {
      result.push({ ...enr, course });
    }
  }
  return { data: result };
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
  listLearners,
  exportLearnersCsv,
  listMine,
  revoke,
  updateEnrollment,
  createPaidEnrollment,
};
