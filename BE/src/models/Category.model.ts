import {
  categoryStatusEnum,
  categoryTypeEnum,
} from '@src/db/schema/category';
import { z } from 'zod';

export const categoryTypeSchema = z.enum(categoryTypeEnum.enumValues);
export const categoryStatusSchema = z.enum(categoryStatusEnum.enumValues);

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  type: categoryTypeSchema,
  status: categoryStatusSchema,
  description: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
});

export const categoryPublicSchema = categorySchema.pick({
  id: true,
  name: true,
  slug: true,
  type: true,
});

export const categoryWithCountsSchema = categorySchema.extend({
  courseCount: z.number().int().min(0),
  postCount: z.number().int().min(0),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  type: categoryTypeSchema,
  description: z.string().optional(),
  thumbnail: z.string().max(512).optional(),
  icon: z.string().max(100).optional(),
  parent_id: z.string().uuid().optional(),
  sort_order: z.number().int().min(0).optional(),
  seo_title: z.string().max(255).optional(),
  seo_description: z.string().max(512).optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    status: categoryStatusSchema.optional(),
    description: z.string().nullable().optional(),
    thumbnail: z.string().max(512).nullable().optional(),
    icon: z.string().max(100).nullable().optional(),
    parent_id: z.string().uuid().nullable().optional(),
    sort_order: z.number().int().min(0).optional(),
    seo_title: z.string().max(255).nullable().optional(),
    seo_description: z.string().max(512).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listCategoriesQuerySchema = z.object({
  type: categoryTypeSchema,
  status: categoryStatusSchema.optional(),
});

export type CategoryType = z.infer<typeof categoryTypeSchema>;
export type CategoryStatus = z.infer<typeof categoryStatusSchema>;
export type Category = z.infer<typeof categorySchema>;
export type CategoryPublic = z.infer<typeof categoryPublicSchema>;
export type CategoryWithCounts = z.infer<typeof categoryWithCountsSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;

export function parseCreateCategoryInput(data: unknown): CreateCategoryInput {
  return createCategorySchema.parse(data);
}

export function parseUpdateCategoryInput(data: unknown): UpdateCategoryInput {
  return updateCategorySchema.parse(data);
}

export function parseListCategoriesQuery(data: unknown): ListCategoriesQuery {
  return listCategoriesQuerySchema.parse(data);
}

export function parseCategory(data: unknown): Category {
  return categorySchema.parse(data);
}

export function parseCategoryPublic(data: unknown): CategoryPublic {
  return categoryPublicSchema.parse(data);
}

export function parseCategoryWithCounts(data: unknown): CategoryWithCounts {
  return categoryWithCountsSchema.parse(data);
}
