import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findById, findUsageCounts, remove } = vi.hoisted(() => ({
  findById: vi.fn(),
  findUsageCounts: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('@src/repos/CategoryRepo', () => ({
  findById,
  findByTypeAndSlug: vi.fn(),
  findUsageCounts,
  remove,
}));

import CategoryService from '@src/services/CategoryService';

const category = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'AI cho công sở',
  slug: 'ai-cho-cong-so',
  type: 'course' as const,
  status: 'active' as const,
  description: null,
  thumbnail: null,
  icon: 'Bot',
};

describe('category deletion safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects deleting a category that still has courses', async () => {
    findById.mockResolvedValue(category);
    findUsageCounts.mockResolvedValue({ courseCount: 2, postCount: 0 });

    await expect(CategoryService.remove(category.id)).rejects.toThrow(
      'Category is being used and cannot be deleted',
    );
    expect(remove).not.toHaveBeenCalled();
  });

  it('deletes an unused category', async () => {
    findById.mockResolvedValue(category);
    findUsageCounts.mockResolvedValue({ courseCount: 0, postCount: 0 });
    remove.mockResolvedValue(true);

    await expect(CategoryService.remove(category.id)).resolves.toEqual({
      message: 'Category deleted',
    });
    expect(remove).toHaveBeenCalledWith(category.id);
  });
});
