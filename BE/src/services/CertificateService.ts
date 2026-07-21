import { randomBytes } from 'crypto';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import * as AuditLogRepo from '@src/repos/AuditLogRepo';
import * as CertificateRepo from '@src/repos/CertificateRepo';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as EnrollmentRepo from '@src/repos/EnrollmentRepo';
import * as UserRepo from '@src/repos/UserRepo';

const Errors = {
  NOT_FOUND: 'Certificate not found',
  COURSE_NOT_FOUND: 'Course not found',
  NOT_ENROLLED: 'User is not enrolled in this course',
  ALREADY_ISSUED: 'Certificate already issued for this course',
} as const;

function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const rand = randomBytes(4).toString('hex').toUpperCase();
  return `GATS-${year}-${rand}`;
}

/**
 * Issues a certificate if one doesn't already exist for this user/course.
 * Safe to call repeatedly (e.g. every time progress is recomputed) — idempotent.
 */
async function issueIfEligible(userId: number, courseId: string) {
  const existing = await CertificateRepo.findByUserAndCourse(userId, courseId);
  if (existing) return existing;

  const certificate = await CertificateRepo.create({
    certificateNumber: generateCertificateNumber(),
    userId,
    courseId,
    status: 'issued',
    issuedById: null,
  });

  await AuditLogRepo.record({
    actorUserId: null,
    action: 'certificate.issued',
    resourceType: 'certificate',
    resourceId: certificate.id,
    meta: { userId, courseId, source: 'auto_progress_complete' },
  });

  return certificate;
}

/** Admin-initiated manual issuance — validates enrollment first. */
async function adminIssue(
  userId: number,
  courseId: string,
  actorUserId?: number,
) {
  const course = await CourseRepo.findById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }

  const enrollment = await EnrollmentRepo.findActive(userId, courseId);
  if (!enrollment) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NOT_ENROLLED);
  }

  const existing = await CertificateRepo.findByUserAndCourse(userId, courseId);
  if (existing) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.ALREADY_ISSUED);
  }

  const certificate = await CertificateRepo.create({
    certificateNumber: generateCertificateNumber(),
    userId,
    courseId,
    status: 'issued',
    issuedById: actorUserId ?? null,
  });

  await AuditLogRepo.record({
    actorUserId,
    action: 'certificate.issued',
    resourceType: 'certificate',
    resourceId: certificate.id,
    meta: { userId, courseId, source: 'admin_manual' },
  });

  return { data: certificate };
}

async function revoke(id: string, actorUserId?: number) {
  const certificate = await CertificateRepo.findById(id);
  if (!certificate) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  const revoked = await CertificateRepo.revoke(id);
  await AuditLogRepo.record({
    actorUserId,
    action: 'certificate.revoked',
    resourceType: 'certificate',
    resourceId: id,
  });
  return { data: revoked };
}

async function listMine(userId: number) {
  const certs = await CertificateRepo.listByUser(userId);
  const courses = await Promise.all(
    certs.map((c) => CourseRepo.findById(c.courseId)),
  );
  const courseById = new Map(
    courses.filter((c) => c !== undefined).map((c) => [c!.id, c!]),
  );

  return {
    data: certs.map((cert) => ({
      id: cert.id,
      certificateNumber: cert.certificateNumber,
      courseId: cert.courseId,
      courseTitle: courseById.get(cert.courseId)?.title ?? null,
      courseSlug: courseById.get(cert.courseId)?.slug ?? null,
      status: cert.status,
      issuedAt: cert.issuedAt,
    })),
  };
}

async function verify(certificateNumber: string) {
  const certificate = await CertificateRepo.findByNumber(
    certificateNumber.trim().toUpperCase(),
  );
  if (!certificate) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const [course, user] = await Promise.all([
    CourseRepo.findById(certificate.courseId),
    UserRepo.findById(certificate.userId),
  ]);

  return {
    data: {
      certificateNumber: certificate.certificateNumber,
      status: certificate.status,
      issuedAt: certificate.issuedAt,
      revokedAt: certificate.revokedAt,
      courseTitle: course?.title ?? null,
      holderName: user?.userName ?? null,
    },
  };
}

async function adminList(query: {
  page?: number;
  limit?: number;
  q?: string;
  courseId?: string;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const { data, total } = await CertificateRepo.listAdmin({
    skip,
    take: limit,
    q: query.q,
    courseId: query.courseId,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    data,
    pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
  };
}

export default {
  Errors,
  issueIfEligible,
  adminIssue,
  revoke,
  listMine,
  verify,
  adminList,
};
