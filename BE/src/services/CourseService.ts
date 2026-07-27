import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { appendSlugSuffix, slugify } from '@src/common/utils/slug';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import type { CourseStatus } from '@src/db/schema/course';
import type { CategoryPublic } from '@src/models/Category.model';
import type { AuthUser } from '@src/models/common/types';
import type {
  CourseDetail,
  CoursePublic,
  CourseRecord,
  CreateCourseInput,
  ListCoursesQuery,
  UpdateCourseInput,
} from '@src/models/Course.model';
import { parseCourseDetail, parseCoursePublic } from '@src/models/Course.model';
import type { TagPublic } from '@src/models/Tag.model';
import * as AssignmentRepo from '@src/repos/AssignmentRepo';
import * as CategoryRepo from '@src/repos/CategoryRepo';
import * as CourseIncludeRepo from '@src/repos/CourseIncludeRepo';
import * as CourseLearningOutcomeRepo from '@src/repos/CourseLearningOutcomeRepo';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as CourseReviewRepo from '@src/repos/CourseReviewRepo';
import * as CourseSectionRepo from '@src/repos/CourseSectionRepo';
import * as CourseTagRepo from '@src/repos/CourseTagRepo';
import * as EnrollmentRepo from '@src/repos/EnrollmentRepo';
import * as LessonAttachmentRepo from '@src/repos/LessonAttachmentRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import * as OrderRepo from '@src/repos/OrderRepo';
import * as PostRepo from '@src/repos/PostRepo';
import * as QuizQuestionRepo from '@src/repos/QuizQuestionRepo';
import * as QuizRepo from '@src/repos/QuizRepo';
import * as RoleRepo from '@src/repos/RoleRepo';
import * as UserRepo from '@src/repos/UserRepo';
import * as VideoRepo from '@src/repos/VideoRepo';
import CategoryService from '@src/services/CategoryService';
import {
  buildDetailSections,
  computeTotalDurationSeconds,
} from '@src/services/course-curriculum-builder';
import CourseAccessService from '@src/services/CourseAccessService';
import NotificationService from '@src/services/NotificationService';
import TagService from '@src/services/TagService';

const Errors = {
  NOT_FOUND: 'Course not found',
  SLUG_EXISTS: 'Slug already exists',
  FORBIDDEN: 'Course is not published',
  RESTORE_SLUG_CONFLICT:
    'Không thể khôi phục vì slug đang được một khóa học khác sử dụng',
  HARD_DELETE_HAS_ORDERS:
    'Không thể xóa vĩnh viễn khóa học đã phát sinh đơn hàng; hãy giữ trong thùng rác để bảo toàn lịch sử giao dịch',
} as const;

async function resolveUniqueSlug(
  title: string,
  preferredSlug?: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(preferredSlug ?? title);
  if (!base) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid slug');
  }

  let candidate = base;
  let suffix = 1;
  while (await CourseRepo.slugExists(candidate, excludeId)) {
    candidate = appendSlugSuffix(base, suffix);
    suffix += 1;
  }
  return candidate;
}

function toPublicCourse(
  course: CourseRecord,
  category: CategoryPublic | null,
  tags: TagPublic[],
): CoursePublic {
  const {
    categoryId: _categoryId,
    instructorId: _instructorId,
    deletedById: _deletedById,
    ...rest
  } = course;
  return parseCoursePublic({ ...rest, category, tags });
}

async function attachPublic(course: CourseRecord): Promise<CoursePublic> {
  const [categoryMap, tagMap] = await Promise.all([
    CategoryRepo.findByCourseIds([course.id]),
    CourseTagRepo.findByCourseIds([course.id]),
  ]);
  return toPublicCourse(
    course,
    categoryMap.get(course.id) ?? null,
    tagMap.get(course.id) ?? [],
  );
}

async function attachPublicList(
  courses: CourseRecord[],
): Promise<CoursePublic[]> {
  const [categoryMap, tagMap] = await Promise.all([
    CategoryRepo.findByCourseIds(courses.map((course) => course.id)),
    CourseTagRepo.findByCourseIds(courses.map((course) => course.id)),
  ]);
  return courses.map((course) =>
    toPublicCourse(
      course,
      categoryMap.get(course.id) ?? null,
      tagMap.get(course.id) ?? [],
    ),
  );
}

function buildPagination(query: ListCoursesQuery, total: number) {
  const hasMore = query.skip + query.take < total;
  const pagination: {
    skip: number;
    take: number;
    total: number;
    hasMore: boolean;
    page?: number;
    totalPages?: number;
  } = {
    skip: query.skip,
    take: query.take,
    total,
    hasMore,
  };

  if (query.mode === 'page') {
    pagination.page = query.page;
    pagination.totalPages = Math.ceil(total / query.take) || 0;
  }

  return pagination;
}

function mapCreateInput(
  input: CreateCourseInput,
  slug: string,
  categoryId: string | null,
) {
  return {
    title: input.title,
    slug,
    description: input.description ?? null,
    thumbnail: input.thumbnail ?? null,
    introVideo: input.intro_video ?? null,
    price: input.price,
    salePrice: input.sale_price ?? null,
    level: input.level,
    instructorId: input.instructor_id ?? null,
    categoryId,
  };
}

function mapUpdateInput(input: UpdateCourseInput, categoryId?: string | null) {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(input.thumbnail !== undefined ? { thumbnail: input.thumbnail } : {}),
    ...(input.intro_video !== undefined
      ? { introVideo: input.intro_video }
      : {}),
    ...(input.price !== undefined ? { price: input.price } : {}),
    ...(input.sale_price !== undefined ? { salePrice: input.sale_price } : {}),
    ...(input.level !== undefined ? { level: input.level } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.instructor_id !== undefined
      ? { instructorId: input.instructor_id }
      : {}),
    ...(categoryId !== undefined ? { categoryId } : {}),
  };
}

function assertPublishedAccess(
  status: CourseStatus,
  isAuthenticated: boolean,
): void {
  if (status !== 'published' && !isAuthenticated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
}

async function list(query: ListCoursesQuery, viewer?: AuthUser) {
  const isAdmin = viewer?.roles.includes('admin') ?? false;
  const isInstructor =
    (viewer?.roles.includes('instructor') ?? false) && !isAdmin;
  const canManageCourses = isAdmin || isInstructor;
  const deletedVisibility = query.deleted ?? 'without';
  if (
    (deletedVisibility === 'only' || deletedVisibility === 'with') &&
    !canManageCourses
  ) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  const effectiveStatus = canManageCourses
    ? query.status
    : ('published' as const);

  let categoryId: string | undefined;
  if (query.category) {
    const categorySlug = slugify(query.category);
    if (!categorySlug) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Invalid category slug',
      );
    }
    const category = await CategoryRepo.findByTypeAndSlug(
      'course',
      categorySlug,
    );
    if (!category) {
      return {
        data: [],
        pagination: buildPagination(query, 0),
      };
    }
    categoryId = category.id;
  }

  let courseIds: string[] | undefined;
  if (query.tag) {
    const tagSlug = slugify(query.tag);
    if (!tagSlug) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid tag slug');
    }
    const ids = await CourseTagRepo.findCourseIdsByTagSlug(tagSlug);
    if (ids.length === 0) {
      return {
        data: [],
        pagination: buildPagination(query, 0),
      };
    }
    courseIds = ids;
  }

  const { data, total } = await CourseRepo.findMany({
    status: effectiveStatus,
    level: query.level,
    categoryId,
    instructorId: isInstructor ? viewer?.id : undefined,
    courseIds,
    skip: query.skip,
    take: query.take,
    deleted: deletedVisibility,
  });

  return {
    data: await attachPublicList(data),
    pagination: buildPagination(query, total),
  };
}

async function listPublic(query: ListCoursesQuery) {
  return list({ ...query, status: 'published', deleted: 'without' }, undefined);
}

async function listManaged(query: ListCoursesQuery, viewer: AuthUser) {
  return list(query, viewer);
}

async function getById(id: string, viewer?: AuthUser) {
  const course = await CourseRepo.findById(id);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const isAdmin = viewer?.roles.includes('admin') ?? false;
  const isInstructor =
    (viewer?.roles.includes('instructor') ?? false) && !isAdmin;
  if (isInstructor && course.instructorId !== viewer?.id) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  assertPublishedAccess(course.status, isAdmin || isInstructor);
  return attachPublic(course);
}

async function getBySlug(
  slug: string,
  userId: number | null,
  _isAuthenticated: boolean,
): Promise<CourseDetail> {
  const course = await CourseRepo.findBySlug(slug);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  const canManage =
    userId !== null &&
    (await CourseAccessService.canManageCourse(userId, course.id));
  if (course.status !== 'published' && !canManage) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const hasFullAccess =
    canManage ||
    (userId !== null &&
      (await CourseAccessService.isEnrolled(userId, course.id)));

  const [
    categoryMap,
    tagMap,
    author,
    enrollmentCount,
    reviewStats,
    learningOutcomes,
    includes,
    sections,
    lessons,
  ] = await Promise.all([
    CategoryRepo.findByCourseIds([course.id]),
    CourseTagRepo.findByCourseIds([course.id]),
    course.instructorId
      ? UserRepo.findAuthorById(course.instructorId)
      : Promise.resolve(undefined),
    EnrollmentRepo.countActiveByCourse(course.id),
    CourseReviewRepo.getStatsByCourse(course.id),
    CourseLearningOutcomeRepo.listByCourse(course.id),
    CourseIncludeRepo.listByCourse(course.id),
    CourseSectionRepo.listByCourse(course.id),
    LessonRepo.listByCourse(course.id),
  ]);

  const publicCourse = toPublicCourse(
    course,
    categoryMap.get(course.id) ?? null,
    tagMap.get(course.id) ?? [],
  );

  // Only load attachments for lessons the viewer can access (preview or full).
  const unlockedLessonIds = lessons
    .filter((lesson) => hasFullAccess || lesson.isPreview)
    .map((lesson) => lesson.id);
  const attachmentsByLesson =
    await LessonAttachmentRepo.listByLessonIds(unlockedLessonIds);

  const linkedPostIds = lessons
    .map((lesson) => lesson.linkedPostId)
    .filter((id): id is string => Boolean(id));
  const linkedPostsById =
    await PostRepo.findPublishedSummariesByIds(linkedPostIds);

  const detailSections = buildDetailSections(
    sections,
    lessons,
    hasFullAccess,
    attachmentsByLesson,
    linkedPostsById,
  );

  return parseCourseDetail({
    ...publicCourse,
    author: author ?? null,
    stats: {
      enrollmentCount,
      ratingCount: reviewStats.ratingCount,
      averageRating: reviewStats.averageRating,
      sectionCount: sections.length,
      lessonCount: lessons.length,
      totalDurationSeconds: computeTotalDurationSeconds(lessons),
    },
    learningOutcomes: learningOutcomes.map((outcome) => ({
      id: outcome.id,
      content: outcome.content,
      order: outcome.order,
    })),
    includes: includes.map((item) => ({
      id: item.id,
      key: item.key,
      label: item.label,
      value: item.value,
      unit: item.unit,
      order: item.order,
    })),
    sections: detailSections,
  });
}

async function syncLearningOutcomes(
  courseId: string,
  outcomes: NonNullable<CreateCourseInput['learning_outcomes']>,
) {
  await CourseLearningOutcomeRepo.removeByCourse(courseId);
  for (let index = 0; index < outcomes.length; index += 1) {
    await CourseLearningOutcomeRepo.create({
      courseId,
      content: outcomes[index].content,
      order: index,
    });
  }
}

async function syncIncludes(
  courseId: string,
  includes: NonNullable<CreateCourseInput['includes']>,
) {
  await CourseIncludeRepo.removeByCourse(courseId);
  for (let index = 0; index < includes.length; index += 1) {
    const item = includes[index];
    await CourseIncludeRepo.create({
      courseId,
      key: item.key,
      label: item.label,
      value: item.value ?? null,
      unit: item.unit ?? null,
      order: index,
    });
  }
}

async function create(input: CreateCourseInput, actor?: AuthUser) {
  const isInstructor =
    (actor?.roles.includes('instructor') ?? false) &&
    !(actor?.roles.includes('admin') ?? false);
  const effectiveInput: CreateCourseInput = isInstructor
    ? { ...input, instructor_id: actor!.id }
    : input;
  const slug = await resolveUniqueSlug(input.title, input.slug);
  const categoryId =
    (await CategoryService.resolveOrCreateCategoryId(
      'course',
      input.category_id,
      input.category,
    )) ?? null;
  const resolvedTagIds =
    input.tag_ids !== undefined
      ? await TagService.resolveTagIdsByIds(input.tag_ids, 'course')
      : input.tags !== undefined
        ? await TagService.resolveTagIdsBySlugs(input.tags, 'course')
        : undefined;

  const course = await CourseRepo.create(
    mapCreateInput(effectiveInput, slug, categoryId),
  );

  if (resolvedTagIds !== undefined) {
    await TagService.syncCourseTagIds(course.id, resolvedTagIds);
  }

  if (input.learning_outcomes) {
    await syncLearningOutcomes(course.id, input.learning_outcomes);
  }

  if (input.includes) {
    await syncIncludes(course.id, input.includes);
  }

  if (effectiveInput.instructor_id) {
    const instructorRole = await RoleRepo.findByName('instructor');
    if (instructorRole) {
      await RoleRepo.assignRoleToUser(
        effectiveInput.instructor_id,
        instructorRole.id,
        {
          resourceType: RESOURCE_TYPES.COURSE,
          resourceId: course.id,
        },
      );
    }
  }

  void NotificationService.notify({
    type: 'course_created',
    title: `Khóa học mới: ${course.title}`,
    body: course.slug,
    href: `/course/${course.id}`,
    entityId: course.id,
  });

  return attachPublic(course);
}

async function update(id: string, input: UpdateCourseInput, actor?: AuthUser) {
  const existing = await CourseRepo.findById(id);
  if (!existing) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const isInstructor =
    (actor?.roles.includes('instructor') ?? false) &&
    !(actor?.roles.includes('admin') ?? false);
  if (
    isInstructor &&
    input.instructor_id !== undefined &&
    input.instructor_id !== actor!.id
  ) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      'Instructor cannot transfer course ownership',
    );
  }

  const categoryId = await CategoryService.resolveOrCreateCategoryId(
    'course',
    input.category_id,
    input.category,
  );

  const payload = mapUpdateInput(input, categoryId);
  const resolvedTagIds =
    input.tag_ids !== undefined
      ? await TagService.resolveTagIdsByIds(input.tag_ids, 'course')
      : input.tags !== undefined
        ? await TagService.resolveTagIdsBySlugs(input.tags, 'course')
        : undefined;

  if (input.slug !== undefined) {
    const slug = slugify(input.slug);
    if (!slug) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Invalid slug');
    }
    if (await CourseRepo.slugExists(slug, id)) {
      throw new RouteError(HttpStatusCodes.CONFLICT, Errors.SLUG_EXISTS);
    }
    payload.slug = slug;
  } else if (input.title !== undefined && input.title !== existing.title) {
    payload.slug = await resolveUniqueSlug(input.title, existing.slug, id);
  }

  if (input.status === 'published' && existing.status !== 'published') {
    await assertPublishReady(id);
    Object.assign(payload, { publishedAt: new Date() });
  }

  const updated = await CourseRepo.update(id, payload);
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  if (resolvedTagIds !== undefined) {
    await TagService.syncCourseTagIds(id, resolvedTagIds);
  }

  if (input.learning_outcomes !== undefined) {
    await syncLearningOutcomes(id, input.learning_outcomes);
  }

  if (input.includes !== undefined) {
    await syncIncludes(id, input.includes);
  }

  return attachPublic(updated);
}

type ReadinessCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
};

async function getPublishReadiness(id: string) {
  const course = await CourseRepo.findById(id);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const [sections, lessons, learningOutcomes] = await Promise.all([
    CourseSectionRepo.listByCourse(id),
    LessonRepo.listByCourse(id),
    CourseLearningOutcomeRepo.listByCourse(id),
  ]);

  const checks: ReadinessCheck[] = [
    {
      id: 'thumbnail',
      label: 'Đã có ảnh đại diện khóa học',
      passed: Boolean(course.thumbnail),
    },
    {
      id: 'description',
      label: 'Đã có mô tả khóa học',
      passed: Boolean(course.description?.trim()),
    },
    {
      id: 'learning_outcomes',
      label: 'Đã có mục tiêu học tập',
      passed: learningOutcomes.length > 0,
    },
    {
      id: 'sections',
      label: 'Có ít nhất 1 chương học',
      passed: sections.length > 0,
    },
    {
      id: 'lessons',
      label: 'Có ít nhất 1 bài học',
      passed: lessons.length > 0,
    },
  ];

  const incompleteLessons: string[] = [];
  for (const lesson of lessons) {
    if (lesson.type === 'video') {
      const video = await VideoRepo.findByLessonId(lesson.id);
      if (!video || video.status !== 'ready') {
        incompleteLessons.push(`${lesson.title} (video chưa xử lý xong)`);
      }
    } else if (lesson.type === 'quiz') {
      const quiz = await QuizRepo.findByLessonId(lesson.id);
      const questions = quiz
        ? await QuizQuestionRepo.listByQuizId(quiz.id)
        : [];
      if (!quiz || questions.length === 0) {
        incompleteLessons.push(`${lesson.title} (quiz chưa có câu hỏi)`);
      }
    } else if (lesson.type === 'assignment') {
      const assignment = await AssignmentRepo.findByLessonId(lesson.id);
      if (!assignment) {
        incompleteLessons.push(`${lesson.title} (chưa cấu hình bài tập)`);
      }
    } else if (lesson.type === 'text') {
      if (!lesson.content?.trim()) {
        incompleteLessons.push(`${lesson.title} (chưa có nội dung)`);
      }
    }
  }

  checks.push({
    id: 'lesson_content',
    label: 'Tất cả bài học đã có nội dung đầy đủ',
    passed: lessons.length > 0 && incompleteLessons.length === 0,
    detail:
      incompleteLessons.length > 0
        ? `Chưa hoàn thiện: ${incompleteLessons.slice(0, 5).join(', ')}${
            incompleteLessons.length > 5
              ? ` và ${incompleteLessons.length - 5} bài khác`
              : ''
          }`
        : undefined,
  });

  const ready = checks.every((check) => check.passed);

  return { data: { ready, checks } };
}

async function assertPublishReady(id: string): Promise<void> {
  const { data } = await getPublishReadiness(id);
  if (data.ready) return;

  const failed = data.checks
    .filter((check) => !check.passed)
    .map((check) => check.detail ?? check.label);
  throw new RouteError(
    HttpStatusCodes.BAD_REQUEST,
    `Course is not ready to publish: ${failed.join('; ')}`,
  );
}

async function publish(id: string) {
  await assertPublishReady(id);
  return update(id, { status: 'published' });
}

async function remove(
  id: string,
  deletedById?: number,
  mode: 'soft' | 'hard' = 'soft',
) {
  if (mode === 'hard') {
    const orderItemCount = await OrderRepo.countItemsByCourseId(id);
    if (orderItemCount > 0) {
      throw new RouteError(
        HttpStatusCodes.CONFLICT,
        Errors.HARD_DELETE_HAS_ORDERS,
      );
    }
  }

  const deleted = await CourseRepo.remove(id, { deletedById, mode });
  if (!deleted) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return {
    message: mode === 'hard' ? 'Course permanently deleted' : 'Course deleted',
  };
}

async function restore(id: string) {
  const deletedCourse = await CourseRepo.findById(id, { deleted: 'only' });
  if (!deletedCourse) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  if (await CourseRepo.slugExists(deletedCourse.slug, id)) {
    throw new RouteError(
      HttpStatusCodes.CONFLICT,
      Errors.RESTORE_SLUG_CONFLICT,
    );
  }
  const restored = await CourseRepo.restore(id);
  if (!restored) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return attachPublic(restored);
}

export default {
  Errors,
  list,
  listPublic,
  listManaged,
  getById,
  getBySlug,
  create,
  update,
  publish,
  getPublishReadiness,
  remove,
  restore,
};
