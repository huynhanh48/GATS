import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  resetCourseAccessDeps,
  setCourseAccessDeps,
} from '@src/services/CourseAccessService';

describe('CourseAccessService', () => {
  const courseId = '11111111-1111-4111-8111-111111111111';
  const lessonId = '22222222-2222-4222-8222-222222222222';

  const publishedCourse = {
    id: courseId,
    status: 'published' as const,
    instructorId: 99,
  };

  const previewLesson = {
    id: lessonId,
    courseId,
    isPreview: true,
  };

  const lockedLesson = {
    id: lessonId,
    courseId,
    isPreview: false,
  };

  const mockCanPerform = vi.fn();
  const mockIsActiveEnrolled = vi.fn();
  const mockFindCourseById = vi.fn();
  const mockFindLessonById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetCourseAccessDeps();
    setCourseAccessDeps({
      canPerform: mockCanPerform,
      isActiveEnrolled: mockIsActiveEnrolled,
      findCourseById: mockFindCourseById,
      findLessonById: mockFindLessonById,
      findLessonByIdAndCourseId: vi.fn(),
    });
  });

  it('allows preview lesson for guests on published course', async () => {
    mockFindCourseById.mockResolvedValue(publishedCourse);

    const CourseAccessService = (await import('@src/services/CourseAccessService')).default;
    const allowed = await CourseAccessService.canViewCourseContent(
      null,
      courseId,
      previewLesson as never,
    );

    expect(allowed).toBe(true);
    expect(mockIsActiveEnrolled).not.toHaveBeenCalled();
  });

  it('denies locked lesson for guests', async () => {
    mockFindCourseById.mockResolvedValue(publishedCourse);

    const CourseAccessService = (await import('@src/services/CourseAccessService')).default;
    const allowed = await CourseAccessService.canViewCourseContent(
      null,
      courseId,
      lockedLesson as never,
    );

    expect(allowed).toBe(false);
  });

  it('does not grant video access from article preview alone', async () => {
    mockFindCourseById.mockResolvedValue(publishedCourse);
    const CourseAccessService = (await import('@src/services/CourseAccessService')).default;
    const allowed = await CourseAccessService.canViewCourseContent(
      null,
      courseId,
      { ...lockedLesson, isArticlePreview: true } as never,
      'video',
    );
    expect(allowed).toBe(false);
  });

  it('allows locked lesson for enrolled users', async () => {
    mockFindCourseById.mockResolvedValue(publishedCourse);
    mockIsActiveEnrolled.mockResolvedValue(true);

    const CourseAccessService = (await import('@src/services/CourseAccessService')).default;
    const allowed = await CourseAccessService.canViewCourseContent(
      1,
      courseId,
      lockedLesson as never,
    );

    expect(allowed).toBe(true);
  });

  it('allows course management for instructor owner', async () => {
    mockFindCourseById.mockResolvedValue(publishedCourse);

    const CourseAccessService = (await import('@src/services/CourseAccessService')).default;
    const allowed = await CourseAccessService.canManageCourse(99, courseId);

    expect(allowed).toBe(true);
    expect(mockCanPerform).not.toHaveBeenCalled();
  });

  it('assertLessonAccess throws 403 when access denied', async () => {
    mockFindLessonById.mockResolvedValue(lockedLesson);
    mockFindCourseById.mockResolvedValue(publishedCourse);
    mockIsActiveEnrolled.mockResolvedValue(false);
    mockCanPerform.mockResolvedValue(false);

    const CourseAccessService = (await import('@src/services/CourseAccessService')).default;

    await expect(
      CourseAccessService.assertLessonAccess(1, lessonId),
    ).rejects.toMatchObject({ status: 403 });
  });
});
