import { beforeEach, describe, expect, it, vi } from 'vitest';

const courseRepo = vi.hoisted(() => ({
  findMany: vi.fn(),
  findById: vi.fn(),
}));

vi.mock('@src/repos/CourseRepo', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@src/repos/CourseRepo')>()),
  ...courseRepo,
}));
vi.mock('@src/repos/CategoryRepo', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@src/repos/CategoryRepo')>()),
  findByCourseIds: vi.fn().mockResolvedValue(new Map()),
  findByTypeAndSlug: vi.fn(),
}));
vi.mock('@src/repos/CourseTagRepo', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@src/repos/CourseTagRepo')>()),
  findByCourseIds: vi.fn().mockResolvedValue(new Map()),
  findCourseIdsByTagSlug: vi.fn(),
}));

import CourseService from '@src/services/CourseService';

const query = {
  status: undefined,
  level: undefined,
  category: undefined,
  tag: undefined,
  deleted: undefined,
  page: 1,
  limit: 20,
  skip: 0,
  take: 20,
  mode: 'page' as const,
};

describe('Course catalog and management scopes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    courseRepo.findMany.mockResolvedValue({ data: [], total: 0 });
  });

  it('keeps the public catalog published-only regardless of requested status', async () => {
    await CourseService.listPublic({
      ...query,
      status: 'draft',
      deleted: 'only',
    });

    expect(courseRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'published',
        deleted: 'without',
        instructorId: undefined,
      }),
    );
  });

  it('limits an instructor management list to assigned courses', async () => {
    await CourseService.listManaged(query, {
      id: 17,
      email: 'mentor@gats.vn',
      roles: ['user', 'instructor'],
    });

    expect(courseRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ instructorId: 17 }),
    );
  });

  it('does not ownership-filter the admin management list', async () => {
    await CourseService.listManaged(query, {
      id: 1,
      email: 'admin@gats.vn',
      roles: ['admin', 'instructor'],
    });

    expect(courseRepo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ instructorId: undefined }),
    );
  });

  it('hides another instructor course from management detail', async () => {
    courseRepo.findById.mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      status: 'published',
      instructorId: 99,
    });

    await expect(
      CourseService.getById('11111111-1111-4111-8111-111111111111', {
        id: 17,
        email: 'mentor@gats.vn',
        roles: ['user', 'instructor'],
      }),
    ).rejects.toMatchObject({ status: 404 });
  });
});
