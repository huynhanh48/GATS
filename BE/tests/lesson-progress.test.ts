import { beforeEach, describe, expect, it, vi } from 'vitest';
import supertest from 'supertest';

const {
  mockAssertLessonAccess,
  mockLessonProgressUpsert,
  mockLessonProgressFind,
  mockLessonProgressAggregate,
  mockLessonProgressList,
  mockLessonCountByCourse,
  mockCanManageCourse,
  mockIsEnrolled,
  mockAssertCourseCurriculumAccess,
} = vi.hoisted(() => ({
  mockAssertLessonAccess: vi.fn(),
  mockLessonProgressUpsert: vi.fn(),
  mockLessonProgressFind: vi.fn(),
  mockLessonProgressAggregate: vi.fn(),
  mockLessonProgressList: vi.fn(),
  mockLessonCountByCourse: vi.fn(),
  mockCanManageCourse: vi.fn(),
  mockIsEnrolled: vi.fn(),
  mockAssertCourseCurriculumAccess: vi.fn(),
}));

vi.mock('@src/middleware/authMiddleware', () => ({
  default: (req: { authUser?: unknown }, _res: unknown, next: () => void) => {
    req.authUser = { id: 1, email: 'user@test.com', roles: ['user'] };
    next();
  },
}));

vi.mock('@src/services/CourseAccessService', () => ({
  default: {
    assertLessonAccess: (...args: unknown[]) => mockAssertLessonAccess(...args),
    assertCourseCurriculumAccess: (...args: unknown[]) =>
      mockAssertCourseCurriculumAccess(...args),
    canManageCourse: (...args: unknown[]) => mockCanManageCourse(...args),
    isEnrolled: (...args: unknown[]) => mockIsEnrolled(...args),
    Errors: { FORBIDDEN: 'You do not have access to this content' },
  },
}));

vi.mock('@src/repos/LessonProgressRepo', () => ({
  upsert: (...args: unknown[]) => mockLessonProgressUpsert(...args),
  findByUserAndLesson: (...args: unknown[]) => mockLessonProgressFind(...args),
  getCourseAggregate: (...args: unknown[]) =>
    mockLessonProgressAggregate(...args),
  listByUserAndCourse: (...args: unknown[]) =>
    mockLessonProgressList(...args),
}));

vi.mock('@src/repos/LessonRepo', () => ({
  countByCourse: (...args: unknown[]) => mockLessonCountByCourse(...args),
}));

import app from '@src/server';
import {
  calculateProgressPercent,
  isLessonCompleted,
} from '@src/models/LessonProgress.model';

const agent = supertest.agent(app);

const courseId = '11111111-1111-4111-8111-111111111111';
const lessonId = '22222222-2222-4222-8222-222222222222';

const sampleLesson = {
  id: lessonId,
  courseId,
  sectionId: '44444444-4444-4444-8444-444444444444',
  title: 'Lesson 1',
  description: null,
  type: 'video' as const,
  order: 1,
  content: null,
  isPreview: false,
  duration: 600,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const sampleProgress = {
  id: '66666666-6666-4666-8666-666666666666',
  userId: 1,
  courseId,
  lessonId,
  videoId: null,
  watchedSeconds: 540,
  durationSeconds: 600,
  percent: 90,
  isCompleted: true,
  completedAt: new Date('2026-01-01T00:00:00.000Z'),
  lastWatchedAt: new Date('2026-01-01T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('LessonProgress model helpers', () => {
  it('calculates percent from watched and duration', () => {
    expect(calculateProgressPercent(120, 600)).toBe(20);
    expect(calculateProgressPercent(600, 600)).toBe(100);
  });

  it('marks completed at 90%', () => {
    expect(isLessonCompleted(89)).toBe(false);
    expect(isLessonCompleted(90)).toBe(true);
  });
});

describe('LessonProgress API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssertLessonAccess.mockResolvedValue(sampleLesson);
    mockCanManageCourse.mockResolvedValue(false);
    mockIsEnrolled.mockResolvedValue(true);
    mockAssertCourseCurriculumAccess.mockResolvedValue(undefined);
    mockLessonCountByCourse.mockResolvedValue(10);
    mockLessonProgressAggregate.mockResolvedValue({
      completedLessons: 3,
      totalLessons: 10,
      percent: 30,
    });
    mockLessonProgressList.mockResolvedValue([sampleProgress]);
  });

  it('upserts lesson progress', async () => {
    mockLessonProgressUpsert.mockResolvedValue(sampleProgress);

    const res = await agent
      .put(`/api/courses/${courseId}/lessons/${lessonId}/progress`)
      .send({ watched_seconds: 540, duration_seconds: 600 })
      .expect(200);

    expect(res.body.data.percent).toBe(90);
    expect(res.body.data.isCompleted).toBe(true);
    expect(mockLessonProgressUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        lessonId,
        percent: 90,
        isCompleted: true,
      }),
    );
  });

  it('returns lesson progress', async () => {
    mockLessonProgressFind.mockResolvedValue(sampleProgress);

    const res = await agent
      .get(`/api/courses/${courseId}/lessons/${lessonId}/progress`)
      .expect(200);

    expect(res.body.data.percent).toBe(90);
  });

  it('returns course aggregate progress', async () => {
    const res = await agent
      .get(`/api/courses/${courseId}/progress`)
      .expect(200);

    expect(res.body.data.percent).toBe(30);
  });

  it('returns 403 for course progress when not enrolled', async () => {
    mockIsEnrolled.mockResolvedValue(false);
    mockCanManageCourse.mockResolvedValue(false);

    const res = await agent
      .get(`/api/courses/${courseId}/progress`)
      .expect(403);

    expect(res.body.error).toBe('You do not have access to this content');
  });
});
