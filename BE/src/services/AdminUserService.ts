import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars, { NodeEnvs } from '@src/common/constants/env';
import { mailService } from '@src/common/utils/mail';
import { RouteError } from '@src/common/utils/route-errors';
import * as AuditLogRepo from '@src/repos/AuditLogRepo';
import * as AuthSessionRepo from '@src/repos/AuthSessionRepo';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as EnrollmentRepo from '@src/repos/EnrollmentRepo';
import * as LessonProgressRepo from '@src/repos/LessonProgressRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import * as OrderRepo from '@src/repos/OrderRepo';
import * as RoleRepo from '@src/repos/RoleRepo';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import {
  clearSession,
  createVerifyToken,
  findById,
  getRoleNames,
  listAdmin,
  toPublicUser,
  update,
} from '@src/repos/UserRepo';

const Errors = {
  USER_NOT_FOUND: 'User not found',
  ALREADY_VERIFIED: 'Email is already verified',
  NO_PASSWORD: 'Account does not use password login',
  SELF_ROLE_CHANGE: 'Bạn không thể tự hạ quyền admin của chính mình',
  LAST_ADMIN: 'Không thể hạ quyền admin cuối cùng của hệ thống',
  COURSE_NOT_FOUND: 'Không tìm thấy khóa học để phân công mentor',
  INSTRUCTOR_ROLE_NOT_FOUND: 'Role instructor chưa được khởi tạo',
} as const;

function frontendOrigin(): string {
  return EnvVars.FrontendUrl.split(',')[0]?.trim().replace(/\/$/, '') || '';
}

async function listUsers(query: {
  page?: number;
  limit?: number;
  q?: string;
  verified?: boolean;
  locked?: boolean;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const { data, total } = await listAdmin({
    skip,
    take: limit,
    q: query.q,
    verified: query.verified,
    locked: query.locked,
  });

  const users = await Promise.all(
    data.map(async (user) => {
      const roles = await getRoleNames(user.id);
      const globalRoles = await RoleRepo.getGlobalRoleNames(user.id);
      return {
        id: user.id,
        userName: user.userName,
        email: user.email,
        verified: user.verified,
        type: user.type,
        isLocked: user.isLocked,
        roles,
        globalRoles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }),
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

async function getUser(userId: number) {
  const user = await findById(userId);
  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }

  const [roles, globalRoles, managedCourses, orders, enrollments, auditLogs] = await Promise.all([
    getRoleNames(userId),
    RoleRepo.getGlobalRoleNames(userId),
    CourseRepo.listByInstructorId(userId),
    OrderRepo.listByUserId(userId),
    EnrollmentRepo.listByUser(userId),
    AuditLogRepo.listByResource({
      resourceType: 'user',
      resourceId: String(userId),
      limit: 30,
    }),
  ]);

  const recentOrders = orders.slice(0, 10).map((order) => ({
    id: order.id,
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
  }));

  const courses = await Promise.all(
    enrollments.map((e) => CourseRepo.findById(e.courseId)),
  );
  const courseById = new Map(
    courses.filter((c) => c !== undefined).map((c) => [c!.id, c!]),
  );

  const enrichedEnrollments = await Promise.all(
    enrollments.map(async (e) => {
      const totalLessons = await LessonRepo.countByCourse(e.courseId);
      const progress = await LessonProgressRepo.getCourseAggregate(
        userId,
        e.courseId,
        totalLessons,
      );
      return {
        id: e.id,
        courseId: e.courseId,
        courseTitle: courseById.get(e.courseId)?.title ?? null,
        courseSlug: courseById.get(e.courseId)?.slug ?? null,
        status: e.status,
        source: e.source,
        expiredAt: e.expiredAt,
        createdAt: e.createdAt,
        completedLessons: progress.completedLessons,
        totalLessons: progress.totalLessons,
        percent: progress.percent,
        lastActivityAt: progress.lastActivityAt,
      };
    }),
  );

  return {
    user: {
      ...toPublicUser(user, roles),
      globalRoles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      hasPassword: Boolean(user.passwordHash),
    },
    recentOrders,
    managedCourses: managedCourses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      status: course.status,
    })),
    enrollments: enrichedEnrollments,
    enrollmentsSummary: {
      total: enrollments.length,
      active: enrollments.filter((e) => e.status === 'active').length,
      cancelled: enrollments.filter((e) => e.status === 'cancelled').length,
      expired: enrollments.filter((e) => e.status === 'expired').length,
    },
    auditLogs: auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      actorUserId: log.actorUserId,
      meta: log.meta,
      createdAt: log.createdAt,
    })),
  };
}

async function assignMentorCourse(
  userId: number,
  courseId: string,
  actorUserId: number,
) {
  const [user, course, instructorRole] = await Promise.all([
    findById(userId),
    CourseRepo.findById(courseId),
    RoleRepo.findByName('instructor'),
  ]);
  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }
  if (!instructorRole) {
    throw new RouteError(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      Errors.INSTRUCTOR_ROLE_NOT_FOUND,
    );
  }

  const previousInstructorId = course.instructorId;
  if (previousInstructorId && previousInstructorId !== userId) {
    await RoleRepo.removeScopedRoleFromUser(
      previousInstructorId,
      instructorRole.id,
      RESOURCE_TYPES.COURSE,
      courseId,
    );
  }

  await CourseRepo.update(courseId, { instructorId: userId });
  await RoleRepo.assignRoleToUser(userId, instructorRole.id, {
    resourceType: RESOURCE_TYPES.COURSE,
    resourceId: courseId,
  });
  await clearSession(userId);
  if (previousInstructorId && previousInstructorId !== userId) {
    await clearSession(previousInstructorId);
  }
  await AuditLogRepo.record({
    actorUserId,
    action: 'course.mentor_assigned',
    resourceType: 'course',
    resourceId: courseId,
    meta: { userId, previousInstructorId },
  });

  return {
    message: `Đã phân công ${user.userName} làm mentor khóa ${course.title}`,
  };
}

async function updateGlobalRole(
  userId: number,
  role: 'user' | 'admin',
  actorUserId: number,
) {
  const user = await findById(userId);
  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }

  const previousRoles = await RoleRepo.getGlobalRoleNames(userId);
  if (previousRoles.length === 1 && previousRoles[0] === role) {
    return {
      user: toPublicUser(user, await getRoleNames(userId)),
      globalRoles: previousRoles,
      message: 'Role không thay đổi',
    };
  }
  if (userId === actorUserId && previousRoles.includes('admin') && role !== 'admin') {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.SELF_ROLE_CHANGE);
  }
  if (previousRoles.includes('admin') && role !== 'admin') {
    const adminCount = await RoleRepo.countUsersWithGlobalRole('admin');
    if (adminCount <= 1) {
      throw new RouteError(HttpStatusCodes.CONFLICT, Errors.LAST_ADMIN);
    }
  }

  await RoleRepo.replaceGlobalRole(userId, role);
  await clearSession(userId);
  await AuditLogRepo.record({
    actorUserId,
    action: 'user.role_updated',
    resourceType: 'user',
    resourceId: String(userId),
    meta: { previousRoles, role },
  });

  return {
    user: toPublicUser(user, await getRoleNames(userId)),
    globalRoles: [role],
    message: 'Đã cập nhật role và thu hồi phiên đăng nhập của người dùng',
  };
}

async function resendVerification(userId: number, actorUserId?: number) {
  const user = await findById(userId);
  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }
  if (user.verified) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ALREADY_VERIFIED);
  }

  const token = createVerifyToken();
  await update(userId, { verifyToken: token });

  const verifyUrl = `${EnvVars.AppUrl}/api/user/verify-email?token=${token}`;
  try {
    await mailService.sendVerificationEmail({
      to: user.email,
      userName: user.userName,
      verifyUrl,
    });
  } catch (err) {
    console.error('Admin resend verification failed', err);
  }

  await AuditLogRepo.record({
    actorUserId,
    action: 'user.resend_verification',
    resourceType: 'user',
    resourceId: String(userId),
  });

  const result: { message: string; verifyToken?: string } = {
    message: 'Đã gửi lại email xác minh',
  };
  if (EnvVars.NodeEnv === NodeEnvs.DEV) {
    result.verifyToken = token;
  }
  return result;
}

async function sendPasswordReset(userId: number, actorUserId?: number) {
  const user = await findById(userId);
  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }
  if (!user.passwordHash) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NO_PASSWORD);
  }

  const token = createVerifyToken();
  await update(userId, { verifyToken: token });

  const resetUrl = `${frontendOrigin()}/reset-password?token=${token}`;
  try {
    await mailService.sendPasswordResetEmail({
      to: user.email,
      userName: user.userName,
      resetUrl,
    });
  } catch (err) {
    console.error('Admin send password reset failed', err);
  }

  await AuditLogRepo.record({
    actorUserId,
    action: 'user.send_password_reset',
    resourceType: 'user',
    resourceId: String(userId),
  });

  const result: { message: string; resetToken?: string } = {
    message: 'Đã gửi email đặt lại mật khẩu',
  };
  if (EnvVars.NodeEnv === NodeEnvs.DEV) {
    result.resetToken = token;
  }
  return result;
}

async function revokeSessions(
  userId: number,
  actorUserId?: number,
  reason?: string,
) {
  const user = await findById(userId);
  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }
  await clearSession(userId);
  await AuthSessionRepo.revokeAllForUser(userId);
  await AuditLogRepo.record({
    actorUserId,
    action: 'user.revoke_sessions',
    resourceType: 'user',
    resourceId: String(userId),
    meta: reason?.trim() ? { reason: reason.trim() } : null,
  });
  return { message: 'Đã thu hồi phiên đăng nhập' };
}

async function setLocked(
  userId: number,
  locked: boolean,
  actorUserId?: number,
  reason?: string,
) {
  const user = await findById(userId);
  if (!user) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }

  const updated = await update(userId, { isLocked: locked });
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }

  if (locked) {
    await clearSession(userId);
  }

  await AuditLogRepo.record({
    actorUserId,
    action: locked ? 'user.locked' : 'user.unlocked',
    resourceType: 'user',
    resourceId: String(userId),
    meta: reason?.trim() ? { reason: reason.trim() } : null,
  });

  return {
    user: toPublicUser(updated, await getRoleNames(userId)),
    message: locked ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
  };
}

export default {
  Errors,
  listUsers,
  getUser,
  resendVerification,
  sendPasswordReset,
  revokeSessions,
  setLocked,
  updateGlobalRole,
  assignMentorCourse,
};
