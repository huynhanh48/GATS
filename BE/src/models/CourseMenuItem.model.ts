import { z } from 'zod';

const nullableText = (max: number) => z.string().trim().max(max).nullable().optional();
const safeUrl = z.string().trim().max(500).refine((value) => value.startsWith('/') || /^https?:\/\//i.test(value), 'URL must be relative or use HTTP(S)');

export const createCourseMenuItemSchema = z.object({
  title: z.string().trim().min(1).max(255),
  parentId: z.string().uuid().nullable().optional(),
  courseId: z.string().uuid().nullable().optional(),
  url: safeUrl.nullable().optional(),
  badge: nullableText(50), icon: nullableText(100), description: nullableText(1000),
  sortOrder: z.number().int().min(0).default(0), isActive: z.boolean().default(true),
});
export const updateCourseMenuItemSchema = createCourseMenuItemSchema.partial();
export const reorderCourseMenuItemsSchema = z.object({ items: z.array(z.object({ id: z.string().uuid(), sortOrder: z.number().int().min(0) })).min(1).max(200) });
