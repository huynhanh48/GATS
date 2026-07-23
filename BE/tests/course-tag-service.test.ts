import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findByIds, syncForCourse, findCourseTags } = vi.hoisted(() => ({
  findByIds: vi.fn(),
  syncForCourse: vi.fn(),
  findCourseTags: vi.fn(),
}));

vi.mock('@src/repos/TagRepo', () => ({
  findByIds,
}));

vi.mock('@src/repos/CourseTagRepo', () => ({
  syncForCourse,
  findByCourseIds: findCourseTags,
}));

vi.mock('@src/repos/PostTagRepo', () => ({}));

import TagService from '@src/services/TagService';

const courseTag = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'AI',
  slug: 'ai',
  type: 'course' as const,
  status: 'active' as const,
  description: null,
};

describe('course tag ID resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deduplicates valid course tag IDs while preserving order', async () => {
    const globalTag = {
      ...courseTag,
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Featured',
      slug: 'featured',
      type: 'global' as const,
    };
    findByIds.mockResolvedValue([globalTag, courseTag]);

    await expect(
      TagService.resolveTagIdsByIds(
        [courseTag.id, globalTag.id, courseTag.id],
        'course',
      ),
    ).resolves.toEqual([courseTag.id, globalTag.id]);
  });

  it('rejects IDs that do not exist', async () => {
    findByIds.mockResolvedValue([]);
    await expect(
      TagService.resolveTagIdsByIds([courseTag.id], 'course'),
    ).rejects.toThrow('One or more tag IDs are invalid');
  });

  it('rejects inactive tags', async () => {
    findByIds.mockResolvedValue([{ ...courseTag, status: 'inactive' }]);
    await expect(
      TagService.resolveTagIdsByIds([courseTag.id], 'course'),
    ).rejects.toThrow('Inactive tags cannot be assigned');
  });

  it('rejects post-only tags for courses', async () => {
    findByIds.mockResolvedValue([{ ...courseTag, type: 'post' }]);
    await expect(
      TagService.resolveTagIdsByIds([courseTag.id], 'course'),
    ).rejects.toThrow('Tag cannot be used for this entity');
  });

  it('syncs an empty list so all course tags can be cleared', async () => {
    syncForCourse.mockResolvedValue(undefined);
    findCourseTags.mockResolvedValue(new Map([[courseTag.id, []]]));

    await TagService.syncCourseTagIds(courseTag.id, []);

    expect(syncForCourse).toHaveBeenCalledWith(courseTag.id, []);
  });
});
