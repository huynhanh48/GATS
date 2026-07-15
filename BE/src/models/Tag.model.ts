import { tagStatusEnum, tagTypeEnum } from '@src/db/schema/tag';
import { z } from 'zod';

export const tagTypeSchema = z.enum(tagTypeEnum.enumValues);
export const tagStatusSchema = z.enum(tagStatusEnum.enumValues);

export const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  type: tagTypeSchema,
  status: tagStatusSchema,
  description: z.string().nullable().optional(),
});

export const tagPublicSchema = tagSchema.pick({
  id: true,
  name: true,
  slug: true,
  type: true,
});

export const tagWithCountsSchema = tagSchema.extend({
  courseCount: z.number().int().min(0),
  postCount: z.number().int().min(0),
});

export const createTagSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  type: tagTypeSchema,
  description: z.string().optional(),
});

export const updateTagSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    status: tagStatusSchema.optional(),
    description: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listTagsQuerySchema = z.object({
  type: tagTypeSchema.optional(),
  status: tagStatusSchema.optional(),
});

export type TagType = z.infer<typeof tagTypeSchema>;
export type TagStatus = z.infer<typeof tagStatusSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type TagPublic = z.infer<typeof tagPublicSchema>;
export type TagWithCounts = z.infer<typeof tagWithCountsSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>;

export function parseCreateTagInput(data: unknown): CreateTagInput {
  return createTagSchema.parse(data);
}

export function parseUpdateTagInput(data: unknown): UpdateTagInput {
  return updateTagSchema.parse(data);
}

export function parseListTagsQuery(data: unknown): ListTagsQuery {
  return listTagsQuerySchema.parse(data);
}

export function parseTag(data: unknown): Tag {
  return tagSchema.parse(data);
}

export function parseTagPublic(data: unknown): TagPublic {
  return tagPublicSchema.parse(data);
}

export function parseTagWithCounts(data: unknown): TagWithCounts {
  return tagWithCountsSchema.parse(data);
}

// Legacy aliases for post tag responses
export const postTagSchema = tagPublicSchema;
export type PostTag = TagPublic;
