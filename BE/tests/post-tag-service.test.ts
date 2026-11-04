import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findByIds, syncForPost, findPostTags } = vi.hoisted(() => ({
  findByIds: vi.fn(),
  syncForPost: vi.fn(),
  findPostTags: vi.fn(),
}));

vi.mock('@src/repos/TagRepo', () => ({
  findByIds,
}));

vi.mock('@src/repos/PostTagRepo', () => ({
  syncForPost,
  findByPostIds: findPostTags,
}));

vi.mock('@src/repos/CourseTagRepo', () => ({}));

import TagService from '@src/services/TagService';

const postTag = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'NextJS',
  slug: 'nextjs',
  type: 'post' as const,
  status: 'active' as const,
};

describe('post tag ID resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts post and global tag IDs', async () => {
    const globalTag = {
      ...postTag,
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Featured',
      slug: 'featured',
      type: 'global' as const,
    };
    findByIds.mockResolvedValue([globalTag, postTag]);

    await expect(
      TagService.resolveTagIdsByIds(
        [postTag.id, globalTag.id, postTag.id],
        'post',
      ),
    ).resolves.toEqual([postTag.id, globalTag.id]);
  });

  it('rejects course-only tags for posts', async () => {
    findByIds.mockResolvedValue([{ ...postTag, type: 'course' }]);
    await expect(
      TagService.resolveTagIdsByIds([postTag.id], 'post'),
    ).rejects.toThrow('Tag cannot be used for this entity');
  });

  it('syncs an empty list so all post tags can be cleared', async () => {
    syncForPost.mockResolvedValue(undefined);
    findPostTags.mockResolvedValue(new Map([[postTag.id, []]]));

    await TagService.syncPostTagIds(postTag.id, []);

    expect(syncForPost).toHaveBeenCalledWith(postTag.id, []);
  });
});
