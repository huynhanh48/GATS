import { z } from 'zod';

import { categoryStatusEnum, categoryTypeEnum } from '@src/db/schema/category';

export const categoryTypeSchema = z.enum(categoryTypeEnum.enumValues);
export const categoryStatusSchema = z.enum(categoryStatusEnum.enumValues);

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  sortOrder: z.number().int().default(0),
  type: categoryTypeSchema,
  status: categoryStatusSchema,
  description: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

export const categoryPublicSchema = categorySchema.pick({
  id: true,
  name: true,
  slug: true,
  sortOrder: true,
  type: true,
  description: true,
});

export const categoryTagSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  level: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  levels: z
    .array(
      z.object({
        code: z.enum(['beginner', 'intermediate', 'advanced']),
        name: z.string(),
        description: z.string().nullable(),
        courseCount: z.number().int().min(0),
      }),
    )
    .optional(),
});

export const categoryWithCountsSchema = categorySchema.extend({
  courseCount: z.number().int().min(0),
  postCount: z.number().int().min(0),
  tagIds: z.array(z.string().uuid()),
  tags: z.array(categoryTagSummarySchema).optional().default([]),
  levels: z
    .array(
      z.object({
        code: z.enum(['beginner', 'intermediate', 'advanced']),
        name: z.string(),
        description: z.string().nullable(),
        courseCount: z.number().int().min(0),
      }),
    )
    .optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().optional(),
  type: categoryTypeSchema,
  description: z.string().optional(),
  thumbnail: z.string().max(512).optional(),
  icon: z.string().max(100).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    sortOrder: z.number().int().optional(),
    status: categoryStatusSchema.optional(),
    description: z.string().nullable().optional(),
    thumbnail: z.string().max(512).nullable().optional(),
    icon: z.string().max(100).nullable().optional(),
    tagIds: z.array(z.string().uuid()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const reorderCategoriesSchema = z.object({
  type: categoryTypeSchema,
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
    }),
  ),
});

export const listCategoriesQuerySchema = z.object({
  type: categoryTypeSchema.default('course'),
  status: categoryStatusSchema.optional(),
  q: z.string().trim().min(1).max(100).optional(),
});

export type CategoryType = z.infer<typeof categoryTypeSchema>;
export type CategoryStatus = z.infer<typeof categoryStatusSchema>;
export type Category = z.infer<typeof categorySchema>;
export type CategoryPublic = z.infer<typeof categoryPublicSchema>;
export type CategoryWithCounts = z.infer<typeof categoryWithCountsSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;

export function parseCreateCategoryInput(data: unknown): CreateCategoryInput {
  return createCategorySchema.parse(data);
}

export function parseUpdateCategoryInput(data: unknown): UpdateCategoryInput {
  return updateCategorySchema.parse(data);
}

export function parseReorderCategoriesInput(
  data: unknown,
): ReorderCategoriesInput {
  return reorderCategoriesSchema.parse(data);
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
