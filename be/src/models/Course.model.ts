import {
  courseLevelEnum,
  courseStatusEnum,
} from '@src/db/schema/course';
import { lessonTypeSchema } from '@src/models/Lesson.model';
import { lessonAttachmentSchema } from '@src/models/LessonAttachment.model';
import { categoryPublicSchema } from '@src/models/Category.model';
import { tagPublicSchema } from '@src/models/Tag.model';
import { z } from 'zod';

export const courseStatusSchema = z.enum(courseStatusEnum.enumValues);
export const courseLevelSchema = z.enum(courseLevelEnum.enumValues);

const courseLevelQuerySchema = z
  .preprocess(
    (value) => (typeof value === 'string' ? value.toLowerCase() : value),
    z.enum([...courseLevelEnum.enumValues, 'basic'] as const),
  )
  .transform((value) => (value === 'basic' ? 'beginner' : value));

export const courseAuthorSchema = z.object({
  id: z.number().int().positive(),
  userName: z.string(),
});

export const courseRecordSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().nullable(),
  thumbnail: z.string().nullable(),
  introVideo: z.string().nullable(),
  price: z.number().int().min(-2),
  salePrice: z.number().int().min(-2).nullable(),
  level: courseLevelSchema,
  status: courseStatusSchema,
  instructorId: z.number().int().positive().nullable(),
  categoryId: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  publishedAt: z.coerce.date().nullable(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.number().int().positive().nullable(),
});

export const coursePublicSchema = courseRecordSchema
  .omit({
    categoryId: true,
    instructorId: true,
    deletedById: true,
  })
  .extend({
    category: categoryPublicSchema.nullable(),
    tags: z.array(tagPublicSchema).default([]),
  });

export const courseLearningOutcomeInputSchema = z.object({
  content: z.string().min(1).max(500),
});

export const courseIncludeInputSchema = z.object({
  /** lucide-react icon export name, e.g. Monitor, Download, FileText */
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(255),
  value: z.string().max(100).nullable().optional(),
  unit: z.string().max(50).nullable().optional(),
});

export const createCourseSchema = z
  .object({
    title: z.string().min(1).max(255),
    slug: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    thumbnail: z.string().max(512).optional(),
    intro_video: z.string().max(512).optional(),
    price: z.number().int().min(-2).default(0),
    sale_price: z.number().int().min(-2).optional(),
    level: courseLevelSchema.default('beginner'),
    instructor_id: z.number().int().positive().optional(),
    category_id: z.string().uuid().optional(),
    category: z.string().min(1).max(100).optional(),
    tags: z.array(z.string().min(1).max(100)).optional(),
    tag_ids: z.array(z.string().uuid()).optional(),
    learning_outcomes: z.array(courseLearningOutcomeInputSchema).optional(),
    includes: z.array(courseIncludeInputSchema).optional(),
  })
  .refine((data) => data.tags === undefined || data.tag_ids === undefined, {
    message: 'Use either tags or tag_ids, not both',
  });

export const updateCourseSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    slug: z.string().min(1).max(255).optional(),
    description: z.string().nullable().optional(),
    thumbnail: z.string().max(512).nullable().optional(),
    intro_video: z.string().max(512).nullable().optional(),
    price: z.number().int().min(-2).optional(),
    sale_price: z.number().int().min(-2).nullable().optional(),
    level: courseLevelSchema.optional(),
    status: courseStatusSchema.optional(),
    instructor_id: z.number().int().positive().nullable().optional(),
    category_id: z.string().uuid().nullable().optional(),
    category: z.string().min(1).max(100).nullable().optional(),
    tags: z.array(z.string().min(1).max(100)).optional(),
    tag_ids: z.array(z.string().uuid()).optional(),
    learning_outcomes: z.array(courseLearningOutcomeInputSchema).optional(),
    includes: z.array(courseIncludeInputSchema).optional(),
  })
  .refine((data) => data.tags === undefined || data.tag_ids === undefined, {
    message: 'Use either tags or tag_ids, not both',
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const softDeleteVisibilitySchema = z.enum(['without', 'with', 'only']);

export const courseListSortSchema = z
  .enum(['newest', 'price_asc', 'price_desc'])
  .default('newest');

const listCoursesQueryBaseSchema = z.object({
  status: courseStatusSchema.optional(),
  level: courseLevelQuerySchema.optional(),
  category: z.string().min(1).optional(),
  instructorId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  tag: z.string().min(1).optional(),
  /** Case-insensitive search across title / slug / description. Combines with status, page, etc. */
  keyword: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  /** Soft-delete visibility. `only`/`with` require auth (admin trash). Default: without */
  deleted: softDeleteVisibilitySchema.optional(),
  sort: courseListSortSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  take: z.coerce.number().int().min(1).max(100).optional(),
  skip: z.coerce.number().int().min(0).optional(),
});

export const listCoursesQuerySchema = listCoursesQueryBaseSchema.transform(
  (data) => {
    const sort = data.sort ?? 'newest';
    if (data.take !== undefined) {
      const res: any = {
        status: data.status,
        level: data.level,
        category: data.category,
        instructorId: data.instructorId,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        tag: data.tag,
        deleted: data.deleted,
        sort,
        skip: data.skip ?? 0,
        take: data.take,
        mode: 'offset' as const,
      };
      if (data.keyword) res.keyword = data.keyword;
      return res;
    }

    const limit = data.limit ?? 20;
    const page = data.page ?? 1;

    const res: any = {
      status: data.status,
      level: data.level,
      category: data.category,
      instructorId: data.instructorId,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
      tag: data.tag,
      deleted: data.deleted,
      sort,
      page,
      limit,
      skip: (page - 1) * limit,
      take: limit,
      mode: 'page' as const,
    };
    if (data.keyword) res.keyword = data.keyword;
    return res;
  },
);

export const coursePaginationSchema = z.object({
  skip: z.number().int().min(0),
  take: z.number().int().min(1),
  total: z.number().int().min(0),
  hasMore: z.boolean(),
  page: z.number().int().min(1).optional(),
  totalPages: z.number().int().min(0).optional(),
});

export const courseListResponseSchema = z.object({
  data: z.array(coursePublicSchema),
  pagination: coursePaginationSchema,
});

export const courseStatsSchema = z.object({
  enrollmentCount: z.number().int().min(0),
  ratingCount: z.number().int().min(0),
  averageRating: z.number().min(1).max(5).nullable(),
  sectionCount: z.number().int().min(0),
  lessonCount: z.number().int().min(0),
  totalDurationSeconds: z.number().int().min(0),
});

export const courseLearningOutcomeSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  order: z.number().int(),
});

export const courseIncludeSchema = z.object({
  id: z.string().uuid(),
  /** lucide-react icon export name, e.g. Monitor, Download, FileText */
  key: z.string(),
  label: z.string(),
  value: z.string().nullable(),
  unit: z.string().nullable(),
  order: z.number().int(),
});

export const courseDetailLessonSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  type: lessonTypeSchema,
  order: z.number().int(),
  isPreview: z.boolean(),
  isArticlePreview: z.boolean().default(false).optional(),
  videoPreviewDurationSeconds: z.number().int().min(30).max(600).default(180).optional(),
  duration: z.number().int().nullable(),
  content: z.string().nullable().optional(),
  attachments: z.array(lessonAttachmentSchema).optional(),
  locked: z.boolean(),
  linkedPostId: z.string().uuid().nullable().optional(),
  linkedPost: z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      slug: z.string(),
      excerpt: z.string().nullable(),
      thumbnail: z.string().nullable(),
    })
    .nullable()
    .optional(),
});

export const courseDetailSectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  order: z.number().int(),
  lessonCount: z.number().int().min(0),
  totalDurationSeconds: z.number().int().min(0),
  lessons: z.array(courseDetailLessonSchema),
});

export const courseDetailSchema = coursePublicSchema.extend({
  author: courseAuthorSchema.nullable(),
  stats: courseStatsSchema,
  learningOutcomes: z.array(courseLearningOutcomeSchema),
  includes: z.array(courseIncludeSchema),
  sections: z.array(courseDetailSectionSchema),
});

export type CourseStatus = z.infer<typeof courseStatusSchema>;
export type CourseLevel = z.infer<typeof courseLevelSchema>;
export type CourseRecord = z.infer<typeof courseRecordSchema>;
export type CoursePublic = z.infer<typeof coursePublicSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseLearningOutcomeInput = z.infer<
  typeof courseLearningOutcomeInputSchema
>;
export type CourseIncludeInput = z.infer<typeof courseIncludeInputSchema>;
export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;
export type CoursePagination = z.infer<typeof coursePaginationSchema>;
export type CourseStats = z.infer<typeof courseStatsSchema>;
export type CourseLearningOutcomePublic = z.infer<
  typeof courseLearningOutcomeSchema
>;
export type CourseIncludePublic = z.infer<typeof courseIncludeSchema>;
export type CourseDetailLesson = z.infer<typeof courseDetailLessonSchema>;
export type CourseDetailSection = z.infer<typeof courseDetailSectionSchema>;
export type CourseDetail = z.infer<typeof courseDetailSchema>;

export function parseCreateCourseInput(data: unknown): CreateCourseInput {
  return createCourseSchema.parse(data);
}

export function parseUpdateCourseInput(data: unknown): UpdateCourseInput {
  return updateCourseSchema.parse(data);
}

export function parseListCoursesQuery(data: unknown): ListCoursesQuery {
  return listCoursesQuerySchema.parse(data);
}

export function parseCourseRecord(data: unknown): CourseRecord {
  return courseRecordSchema.parse(data);
}

export function parseCoursePublic(data: unknown): CoursePublic {
  return coursePublicSchema.parse(data);
}

export function parseCourseDetail(data: unknown): CourseDetail {
  return courseDetailSchema.parse(data);
}
