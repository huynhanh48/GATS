import { beforeEach, describe, expect, it, vi } from 'vitest';
import supertest from 'supertest';

const {
  mockFindBySlug,
  mockFindByCourseIdsCategory,
  mockFindByCourseIdsTags,
  mockFindAuthorById,
  mockCountActiveByCourse,
  mockGetStatsByCourse,
  mockListLearningOutcomes,
  mockListIncludes,
  mockListSections,
  mockListLessons,
  mockCanManageCourse,
  mockIsEnrolled,
  mockFindByCourseAndOrderOutcome,
  mockCreateOutcome,
  mockFindByCourseAndOrderInclude,
  mockCreateInclude,
  mockUpdateInclude,
  mockFindByCourseAndOrderSection,
  mockCreateSection,
  mockFindBySectionAndOrderLesson,
  mockCreateLesson,
  mockEnrollmentUpsert,
  mockReviewUpsert,
  mockReviewFindByCourseAndUser,
  mockCourseUpdate,
  mockCourseFindById,
  mockUserFindByEmail,
  mockUserCreate,
  mockUserFindById,
  mockUserUpdate,
  mockCategoryFindByTypeAndSlug,
  mockCourseCreate,
  mockCourseSlugExists,
  mockAssignTags,
} = vi.hoisted(() => ({
  mockFindBySlug: vi.fn(),
  mockFindByCourseIdsCategory: vi.fn(),
  mockFindByCourseIdsTags: vi.fn(),
  mockFindAuthorById: vi.fn(),
  mockCountActiveByCourse: vi.fn(),
  mockGetStatsByCourse: vi.fn(),
  mockListLearningOutcomes: vi.fn(),
  mockListIncludes: vi.fn(),
  mockListSections: vi.fn(),
  mockListLessons: vi.fn(),
  mockCanManageCourse: vi.fn(),
  mockIsEnrolled: vi.fn(),
  mockFindByCourseAndOrderOutcome: vi.fn(),
  mockCreateOutcome: vi.fn(),
  mockFindByCourseAndOrderInclude: vi.fn(),
  mockCreateInclude: vi.fn(),
  mockUpdateInclude: vi.fn(),
  mockFindByCourseAndOrderSection: vi.fn(),
  mockCreateSection: vi.fn(),
  mockFindBySectionAndOrderLesson: vi.fn(),
  mockCreateLesson: vi.fn(),
  mockEnrollmentUpsert: vi.fn(),
  mockReviewUpsert: vi.fn(),
  mockReviewFindByCourseAndUser: vi.fn(),
  mockCourseUpdate: vi.fn(),
  mockCourseFindById: vi.fn(),
  mockUserFindByEmail: vi.fn(),
  mockUserCreate: vi.fn(),
  mockUserFindById: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockCategoryFindByTypeAndSlug: vi.fn(),
  mockCourseCreate: vi.fn(),
  mockCourseSlugExists: vi.fn(),
  mockAssignTags: vi.fn(),
}));

let authUser: { id: number; email: string; roles: string[] } | undefined;

vi.mock('@src/middleware/optionalAuthMiddleware', () => ({
  default: (
    req: { authUser?: { id: number; email: string; roles: string[] } },
    _res: unknown,
    next: () => void,
  ) => {
    if (authUser) {
      req.authUser = authUser;
    }
    next();
  },
}));

vi.mock('@src/repos/CourseRepo', () => ({
  findBySlug: (...args: unknown[]) => mockFindBySlug(...args),
  findById: (...args: unknown[]) => mockCourseFindById(...args),
  update: (...args: unknown[]) => mockCourseUpdate(...args),
  create: (...args: unknown[]) => mockCourseCreate(...args),
  slugExists: (...args: unknown[]) => mockCourseSlugExists(...args),
}));

vi.mock('@src/repos/CategoryRepo', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@src/repos/CategoryRepo')>();
  return {
    ...actual,
    findByCourseIds: (...args: unknown[]) => mockFindByCourseIdsCategory(...args),
    findByTypeAndSlug: (...args: unknown[]) =>
      mockCategoryFindByTypeAndSlug(...args),
  };
});

vi.mock('@src/repos/CourseTagRepo', () => ({
  findByCourseIds: (...args: unknown[]) => mockFindByCourseIdsTags(...args),
  syncForCourse: (...args: unknown[]) => mockAssignTags(...args),
}));

vi.mock('@src/repos/UserRepo', () => ({
  findAuthorById: (...args: unknown[]) => mockFindAuthorById(...args),
  findByEmail: (...args: unknown[]) => mockUserFindByEmail(...args),
  create: (...args: unknown[]) => mockUserCreate(...args),
  findById: (...args: unknown[]) => mockUserFindById(...args),
  update: (...args: unknown[]) => mockUserUpdate(...args),
}));

vi.mock('@src/repos/EnrollmentRepo', () => ({
  countActiveByCourse: (...args: unknown[]) =>
    mockCountActiveByCourse(...args),
  upsert: (...args: unknown[]) => mockEnrollmentUpsert(...args),
}));

vi.mock('@src/repos/CourseReviewRepo', () => ({
  getStatsByCourse: (...args: unknown[]) => mockGetStatsByCourse(...args),
  upsert: (...args: unknown[]) => mockReviewUpsert(...args),
  findByCourseAndUser: (...args: unknown[]) =>
    mockReviewFindByCourseAndUser(...args),
}));

vi.mock('@src/repos/CourseLearningOutcomeRepo', () => ({
  listByCourse: (...args: unknown[]) => mockListLearningOutcomes(...args),
  findByCourseAndOrder: (...args: unknown[]) =>
    mockFindByCourseAndOrderOutcome(...args),
  create: (...args: unknown[]) => mockCreateOutcome(...args),
}));

vi.mock('@src/repos/CourseIncludeRepo', () => ({
  listByCourse: (...args: unknown[]) => mockListIncludes(...args),
  findByCourseAndOrder: (...args: unknown[]) =>
    mockFindByCourseAndOrderInclude(...args),
  create: (...args: unknown[]) => mockCreateInclude(...args),
  update: (...args: unknown[]) => mockUpdateInclude(...args),
}));

vi.mock('@src/repos/CourseSectionRepo', () => ({
  listByCourse: (...args: unknown[]) => mockListSections(...args),
  findByCourseAndOrder: (...args: unknown[]) =>
    mockFindByCourseAndOrderSection(...args),
  create: (...args: unknown[]) => mockCreateSection(...args),
}));

vi.mock('@src/repos/LessonRepo', () => ({
  listByCourse: (...args: unknown[]) => mockListLessons(...args),
  findBySectionAndOrder: (...args: unknown[]) =>
    mockFindBySectionAndOrderLesson(...args),
  create: (...args: unknown[]) => mockCreateLesson(...args),
}));

vi.mock('@src/services/CourseAccessService', () => ({
  default: {
    canManageCourse: (...args: unknown[]) => mockCanManageCourse(...args),
    isEnrolled: (...args: unknown[]) => mockIsEnrolled(...args),
  },
}));

vi.mock('@src/db', () => ({
  default: {
    transaction: async (fn: (tx: unknown) => Promise<void>) => fn({}),
  },
}));

import app from '@src/server';
import {
  buildDetailSections,
  mapCurriculumLesson,
} from '@src/services/course-curriculum-builder';
import { backfillRagCourseDetail } from '@src/services/BootstrapService';

const agent = supertest.agent(app);

const courseId = '11111111-1111-4111-8111-111111111111';
const sectionAId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const sectionBId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const previewLessonId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const lockedLessonId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

const baseCourse = {
  id: courseId,
  title: 'RAG cho doanh nghiệp',
  slug: 'rag-cho-doanh-nghiep-tu-pdf-den-chatbot',
  description: 'Pipeline RAG',
  thumbnail: 'https://example.com/thumb.jpg',
  introVideo: null,
  price: 2990000,
  salePrice: 2490000,
  level: 'intermediate' as const,
  status: 'published' as const,
  instructorId: 1,
  categoryId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  publishedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const sections = [
  {
    id: sectionBId,
    courseId,
    title: 'Section B',
    order: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: sectionAId,
    courseId,
    title: 'Section A',
    order: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
];

const lessons = [
  {
    id: lockedLessonId,
    courseId,
    sectionId: sectionAId,
    title: 'Locked lesson',
    description: 'Paid content',
    type: 'video' as const,
    order: 1,
    content: null,
    isPreview: false,
    duration: 120,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: previewLessonId,
    courseId,
    sectionId: sectionAId,
    title: 'Preview lesson',
    description: 'Free preview',
    type: 'video' as const,
    order: 0,
    content: 'secret-text',
    isPreview: true,
    duration: 60,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
];

function setupDetailMocks(options?: {
  reviewStats?: { ratingCount: number; averageRating: number | null };
  enrollmentCount?: number;
  instructorId?: number | null;
  status?: 'published' | 'draft';
}) {
  mockFindBySlug.mockResolvedValue({
    ...baseCourse,
    instructorId: options?.instructorId ?? baseCourse.instructorId,
    status: options?.status ?? 'published',
  });
  mockFindByCourseIdsCategory.mockResolvedValue(
    new Map([
      [
        courseId,
        {
          id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
          name: 'Khóa học',
          slug: 'course',
          type: 'course',
        },
      ],
    ]),
  );
  mockFindByCourseIdsTags.mockResolvedValue(
    new Map([
      [
        courseId,
        [
          {
            id: '99999999-9999-4999-8999-999999999999',
            name: 'AI',
            slug: 'ai',
            type: 'course',
          },
        ],
      ],
    ]),
  );
  mockFindAuthorById.mockResolvedValue({ id: 1, userName: 'AI Coding' });
  mockCountActiveByCourse.mockResolvedValue(options?.enrollmentCount ?? 3);
  mockGetStatsByCourse.mockResolvedValue(
    options?.reviewStats ?? { ratingCount: 5, averageRating: 4.6 },
  );
  mockListLearningOutcomes.mockResolvedValue([
    {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
      courseId,
      content: 'Hiểu RAG',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  mockListIncludes.mockResolvedValue([
    {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
      courseId,
      key: 'Monitor',
      label: 'Video theo yêu cầu',
      value: 24,
      unit: 'hour',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  mockListSections.mockResolvedValue(sections);
  mockListLessons.mockResolvedValue(lessons);
  mockCanManageCourse.mockResolvedValue(false);
  mockIsEnrolled.mockResolvedValue(false);
}

describe('GET /api/courses/slug/:slug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authUser = undefined;
    setupDetailMocks();
  });

  it('returns author with id and userName', async () => {
    const res = await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(200);

    expect(res.body.course.author).toEqual({ id: 1, userName: 'AI Coding' });
  });

  it('returns enrollmentCount from active non-expired enrollments', async () => {
    mockCountActiveByCourse.mockResolvedValue(12);

    const res = await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(200);

    expect(res.body.course.stats.enrollmentCount).toBe(12);
    expect(mockCountActiveByCourse).toHaveBeenCalledWith(courseId);
  });

  it('relies on repo to exclude cancelled or expired enrollments', async () => {
    await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(200);

    expect(mockCountActiveByCourse).toHaveBeenCalledTimes(1);
  });

  it('returns ratingCount and averageRating from reviews', async () => {
    mockGetStatsByCourse.mockResolvedValue({
      ratingCount: 6,
      averageRating: 4.7,
    });

    const res = await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(200);

    expect(res.body.course.stats.ratingCount).toBe(6);
    expect(res.body.course.stats.averageRating).toBe(4.7);
  });

  it('returns null averageRating and zero ratingCount when no reviews', async () => {
    mockGetStatsByCourse.mockResolvedValue({
      ratingCount: 0,
      averageRating: null,
    });

    const res = await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(200);

    expect(res.body.course.stats.ratingCount).toBe(0);
    expect(res.body.course.stats.averageRating).toBeNull();
  });

  it('sorts sections and lessons by order ascending', async () => {
    const res = await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(200);

    expect(res.body.course.sections.map((s: { order: number }) => s.order)).toEqual([
      0, 1,
    ]);
    expect(
      res.body.course.sections[0].lessons.map((l: { order: number }) => l.order),
    ).toEqual([0, 1]);
  });

  it('shows locked lesson metadata for guests', async () => {
    const res = await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(200);

    const locked = res.body.course.sections[0].lessons.find(
      (lesson: { id: string }) => lesson.id === lockedLessonId,
    );
    expect(locked).toMatchObject({
      title: 'Locked lesson',
      type: 'video',
      duration: 120,
      locked: true,
    });
  });

  it('does not expose content or video URL for locked lessons', async () => {
    const res = await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(200);

    const locked = res.body.course.sections[0].lessons.find(
      (lesson: { id: string }) => lesson.id === lockedLessonId,
    );
    expect(locked.content).toBeUndefined();
    expect(locked.videoUrl).toBeUndefined();
    expect(locked.mp4Url).toBeUndefined();
  });

  it('marks preview lessons as unlocked for guests', async () => {
    const res = await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(200);

    const preview = res.body.course.sections[0].lessons.find(
      (lesson: { id: string }) => lesson.id === previewLessonId,
    );
    expect(preview.locked).toBe(false);
    expect(preview.isPreview).toBe(true);
  });

  it('marks all lessons unlocked for enrolled users', async () => {
    authUser = { id: 2, email: 'student@test.com', roles: [] };
    mockIsEnrolled.mockResolvedValue(true);

    const res = await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(200);

    for (const lesson of res.body.course.sections[0].lessons) {
      expect(lesson.locked).toBe(false);
    }
  });

  it('does not expose sensitive author fields', async () => {
    const res = await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(200);

    expect(res.body.course.author.email).toBeUndefined();
    expect(res.body.course.author.passwordHash).toBeUndefined();
    expect(res.body.course.author.accessToken).toBeUndefined();
    expect(res.body.course.author.verifyToken).toBeUndefined();
  });

  it('returns 404 for draft course when guest', async () => {
    setupDetailMocks({ status: 'draft' });

    await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(404);
  });

  it('allows authenticated user to access draft course', async () => {
    authUser = { id: 1, email: 'admin@test.com', roles: ['admin'] };
    setupDetailMocks({ status: 'draft' });

    await agent
      .get('/api/courses/slug/rag-cho-doanh-nghiep-tu-pdf-den-chatbot')
      .expect(200);
  });
});

describe('GET /api/courses/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authUser = undefined;
  });

  it('rejects non-UUID ids before querying courses', async () => {
    await agent.get('/api/courses/new').expect(400);

    expect(mockCourseFindById).not.toHaveBeenCalled();
  });
});

describe('course-curriculum-builder', () => {
  it('strips content from locked curriculum lessons', () => {
    const mapped = mapCurriculumLesson(lessons[0]!, false);
    expect(mapped.locked).toBe(true);
    expect(mapped.content).toBeUndefined();
  });

  it('includes content for unlocked curriculum lessons', () => {
    const mapped = mapCurriculumLesson(lessons[1]!, false);
    expect(mapped.locked).toBe(false);
    expect(mapped.content).toBe('secret-text');
  });
});

describe('backfillRagCourseDetail idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindBySlug.mockResolvedValue(baseCourse);
    mockUserFindById.mockResolvedValue({
      id: 1,
      userName: 'admin',
      email: 'admin@test.com',
      verified: true,
      type: 'default',
      passwordHash: null,
      providerId: null,
      verifyToken: null,
      accessToken: null,
      tokenExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockFindByCourseAndOrderOutcome.mockResolvedValue(undefined);
    mockFindByCourseAndOrderInclude.mockResolvedValue(undefined);
    mockFindByCourseAndOrderSection.mockResolvedValue(undefined);
    mockFindBySectionAndOrderLesson.mockResolvedValue(undefined);
    mockCreateSection.mockImplementation(
      async (data: { courseId: string; title: string; order: number }) => ({
        id: `section-${data.order}`,
        courseId: data.courseId,
        title: data.title,
        order: data.order,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    mockUserFindByEmail.mockResolvedValue(undefined);
    mockUserCreate.mockImplementation(async (data: { userName: string; email: string }) => ({
      id: Math.floor(Math.random() * 1000) + 10,
      userName: data.userName,
      email: data.email,
      verified: true,
      type: 'default',
      passwordHash: null,
      providerId: null,
      verifyToken: null,
      accessToken: null,
      tokenExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    mockReviewFindByCourseAndUser.mockResolvedValue(undefined);
  });

  it('does not duplicate records when run twice', async () => {
    await backfillRagCourseDetail(1);
    await backfillRagCourseDetail(1);

    expect(mockCreateOutcome).toHaveBeenCalled();
    expect(mockCreateSection).toHaveBeenCalled();
    expect(mockCreateLesson).toHaveBeenCalled();

    const outcomeCalls = mockCreateOutcome.mock.calls.length;
    const sectionCalls = mockCreateSection.mock.calls.length;
    const lessonCalls = mockCreateLesson.mock.calls.length;

    mockCreateOutcome.mockClear();
    mockCreateSection.mockClear();
    mockCreateLesson.mockClear();
    mockFindByCourseAndOrderOutcome.mockResolvedValue({ id: 'exists' });
    mockFindByCourseAndOrderInclude.mockResolvedValue({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02',
      courseId,
      key: 'Monitor',
      label: 'Video theo yêu cầu',
      value: 24,
      unit: 'hour',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockFindByCourseAndOrderSection.mockResolvedValue({
      id: sectionAId,
      courseId,
      title: 'Section',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockFindBySectionAndOrderLesson.mockResolvedValue({ id: 'lesson-exists' });
    mockReviewFindByCourseAndUser.mockResolvedValue({ id: 'review-exists' });
    mockUserFindByEmail.mockResolvedValue({
      id: 99,
      userName: 'rag-learner-1',
      email: 'rag-learner-1@gats.dev',
      verified: true,
      type: 'default',
      passwordHash: null,
      providerId: null,
      verifyToken: null,
      accessToken: null,
      tokenExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await backfillRagCourseDetail(1);
    await backfillRagCourseDetail(1);

    expect(mockCreateOutcome.mock.calls.length).toBe(0);
    expect(mockCreateSection.mock.calls.length).toBe(0);
    expect(mockCreateLesson.mock.calls.length).toBe(0);
    expect(outcomeCalls).toBeGreaterThan(0);
    expect(sectionCalls).toBeGreaterThan(0);
    expect(lessonCalls).toBeGreaterThan(0);
  });

  it('backfills sections and lessons for an existing course', async () => {
    mockFindBySlug.mockResolvedValue({
      ...baseCourse,
      instructorId: null,
    });

    await backfillRagCourseDetail(1);

    expect(mockCourseUpdate).toHaveBeenCalledWith(courseId, { instructorId: 1 });
    expect(mockCreateSection).toHaveBeenCalled();
    expect(mockCreateLesson).toHaveBeenCalled();
  });
});

describe('buildDetailSections', () => {
  it('computes section lessonCount and totalDurationSeconds', () => {
    const result = buildDetailSections(sections, lessons, false);
    const sectionA = result.find((section) => section.id === sectionAId);
    expect(sectionA?.lessonCount).toBe(2);
    expect(sectionA?.totalDurationSeconds).toBe(180);
  });
});
