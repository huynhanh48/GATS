import { beforeEach, describe, expect, it, vi } from 'vitest';

const courseRepo = vi.hoisted(() => ({ findById: vi.fn() }));
const chatRepo = vi.hoisted(() => ({
  listByCourse: vi.fn(),
  create: vi.fn(),
  setPinned: vi.fn(),
  findById: vi.fn(),
  remove: vi.fn(),
}));
const courseAccess = vi.hoisted(() => ({
  canManageCourse: vi.fn(),
  isEnrolled: vi.fn(),
}));

vi.mock('@src/repos/CourseRepo', () => courseRepo);
vi.mock('@src/repos/CourseChatRepo', () => chatRepo);
vi.mock('@src/services/CourseAccessService', () => ({
  default: courseAccess,
}));

import CourseChatService from '@src/services/CourseChatService';

const courseId = '6e7d7eb3-f0e1-43b6-93e9-68a2c80206bd';

describe('CourseChatService lifecycle access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    courseAccess.canManageCourse.mockResolvedValue(false);
    courseAccess.isEnrolled.mockResolvedValue(false);
    chatRepo.listByCourse.mockResolvedValue([]);
  });

  it('returns 404 when the course does not exist', async () => {
    courseRepo.findById.mockResolvedValue(undefined);

    await expect(CourseChatService.list(10, courseId)).rejects.toMatchObject({
      status: 404,
    });
    expect(courseAccess.isEnrolled).not.toHaveBeenCalled();
  });

  it('returns 410 and never checks enrollment for a soft-deleted course', async () => {
    courseRepo.findById.mockResolvedValue({
      id: courseId,
      deletedAt: new Date(),
    });

    await expect(CourseChatService.list(10, courseId)).rejects.toMatchObject({
      status: 410,
      message: 'Khóa học đã bị xóa',
    });
    expect(courseAccess.canManageCourse).not.toHaveBeenCalled();
    expect(courseAccess.isEnrolled).not.toHaveBeenCalled();
    expect(chatRepo.listByCourse).not.toHaveBeenCalled();
  });

  it('allows an active learner and returns the course chat', async () => {
    courseRepo.findById.mockResolvedValue({ id: courseId, deletedAt: null });
    courseAccess.isEnrolled.mockResolvedValue(true);

    await expect(CourseChatService.list(10, courseId)).resolves.toEqual({
      data: [],
      meta: { canManage: false },
    });
    expect(chatRepo.listByCourse).toHaveBeenCalledWith(courseId);
  });

  it('keeps archived courses accessible to their active learners', async () => {
    courseRepo.findById.mockResolvedValue({
      id: courseId,
      status: 'archived',
      deletedAt: null,
    });
    courseAccess.isEnrolled.mockResolvedValue(true);

    await expect(CourseChatService.list(10, courseId)).resolves.toMatchObject({
      meta: { canManage: false },
    });
  });
});
