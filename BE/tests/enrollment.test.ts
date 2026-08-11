import { beforeEach, describe, expect, it, vi } from 'vitest';
import supertest from 'supertest';

const {
  mockCanPerform,
  mockCourseFindById,
  mockEnrollmentGrant,
  mockEnrollmentFindActive,
  mockEnrollmentListByCourse,
  mockEnrollmentListByUser,
  mockEnrollmentUpdateByUserAndCourse,
  mockCanManageCourse,
  mockCanReadCourseEnrollments,
} = vi.hoisted(() => ({
  mockCanPerform: vi.fn(),
  mockCourseFindById: vi.fn(),
  mockEnrollmentGrant: vi.fn(),
  mockEnrollmentFindActive: vi.fn(),
  mockEnrollmentListByCourse: vi.fn(),
  mockEnrollmentListByUser: vi.fn(),
  mockEnrollmentUpdateByUserAndCourse: vi.fn(),
  mockCanManageCourse: vi.fn(),
  mockCanReadCourseEnrollments: vi.fn(),
}));

vi.mock('@src/middleware/authMiddleware', () => ({
  default: (req: { authUser?: unknown }, _res: unknown, next: () => void) => {
    req.authUser = { id: 1, email: 'user@test.com', roles: ['admin'] };
    next();
  },
}));

vi.mock('@src/services/AuthorizationService', () => ({
  default: {
    canPerform: (...args: unknown[]) => mockCanPerform(...args),
    invalidateUser: vi.fn(),
  },
}));

vi.mock('@src/repos/CourseRepo', () => ({
  findById: (...args: unknown[]) => mockCourseFindById(...args),
}));

vi.mock('@src/repos/EnrollmentRepo', () => ({
  grant: (...args: unknown[]) => mockEnrollmentGrant(...args),
  findActive: (...args: unknown[]) => mockEnrollmentFindActive(...args),
  listByCourse: (...args: unknown[]) => mockEnrollmentListByCourse(...args),
  listByUser: (...args: unknown[]) => mockEnrollmentListByUser(...args),
  updateByUserAndCourse: (...args: unknown[]) =>
    mockEnrollmentUpdateByUserAndCourse(...args),
}));

vi.mock('@src/services/CourseAccessService', () => ({
  default: {
    canManageCourse: (...args: unknown[]) => mockCanManageCourse(...args),
    canReadCourseEnrollments: (...args: unknown[]) =>
      mockCanReadCourseEnrollments(...args),
    Errors: { FORBIDDEN: 'Forbidden' },
  },
}));

import app from '@src/server';

const agent = supertest.agent(app);

const courseId = '11111111-1111-4111-8111-111111111111';

const sampleCourse = {
  id: courseId,
  title: 'Free Course',
  slug: 'free-course',
  description: null,
  thumbnail: null,
  introVideo: null,
  price: 0,
  salePrice: null,
  level: 'beginner' as const,
  status: 'published' as const,
  instructorId: null,
  categoryId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  publishedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const sampleEnrollment = {
  id: '55555555-5555-4555-8555-555555555555',
  userId: 1,
  courseId,
  source: 'free' as const,
  status: 'active' as const,
  enrolledAt: new Date('2026-01-01T00:00:00.000Z'),
  expiredAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('Enrollment API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanManageCourse.mockResolvedValue(true);
    mockCanReadCourseEnrollments.mockResolvedValue(true);
    mockCourseFindById.mockResolvedValue(sampleCourse);
  });

  it('self-enrolls in a free published course', async () => {
    mockEnrollmentFindActive.mockResolvedValue(undefined);
    mockEnrollmentGrant.mockResolvedValue(sampleEnrollment);

    const res = await agent
      .post(`/api/courses/${courseId}/enrollments`)
      .send()
      .expect(201);

    expect(res.body.data.source).toBe('free');
    expect(mockEnrollmentGrant).toHaveBeenCalledWith(1, courseId, 'free');
  });

  it('returns 409 when already enrolled', async () => {
    mockEnrollmentFindActive.mockResolvedValue(sampleEnrollment);

    const res = await agent
      .post(`/api/courses/${courseId}/enrollments`)
      .send()
      .expect(409);

    expect(res.body.error.message).toBe('Already enrolled in this course');
  });

  it('grants enrollment for another user as admin', async () => {
    mockEnrollmentGrant.mockResolvedValue({
      ...sampleEnrollment,
      userId: 2,
      source: 'admin_granted',
    });

    const res = await agent
      .post(`/api/courses/${courseId}/enrollments`)
      .send({ user_id: 2, source: 'admin_granted' })
      .expect(201);

    expect(res.body.data.userId).toBe(2);
    expect(res.body.data.source).toBe('admin_granted');
  });

  it('lists enrollments for a course', async () => {
    mockEnrollmentListByCourse.mockResolvedValue([sampleEnrollment]);

    const res = await agent
      .get(`/api/courses/${courseId}/enrollments`)
      .expect(200);

    expect(res.body.data).toHaveLength(1);
  });

  it('lists my enrollments', async () => {
    mockEnrollmentListByUser.mockResolvedValue([sampleEnrollment]);

    const res = await agent.get('/api/me/enrollments').expect(200);

    expect(res.body.data).toHaveLength(1);
  });

  it('revokes enrollment', async () => {
    mockEnrollmentUpdateByUserAndCourse.mockResolvedValue({
      ...sampleEnrollment,
      status: 'cancelled',
    });

    const res = await agent
      .delete(`/api/courses/${courseId}/enrollments/2`)
      .expect(200);

    expect(res.body.data.status).toBe('cancelled');
  });
});
