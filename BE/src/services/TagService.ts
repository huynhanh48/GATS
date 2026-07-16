import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { appendSlugSuffix, slugify } from '@src/common/utils/slug';
import { RouteError } from '@src/common/utils/route-errors';
import type { TagType } from '@src/db/schema/tag';
import type {
  CreateTagInput,
  ListTagsQuery,
  Tag,
  TagPublic,
  TagWithCounts,
  UpdateTagInput,
} from '@src/models/Tag.model';
import * as CourseTagRepo from '@src/repos/CourseTagRepo';
import * as PostTagRepo from '@src/repos/PostTagRepo';
import * as TagRepo from '@src/repos/TagRepo';

const Errors = {
  NOT_FOUND: 'Tag not found',
  SLUG_EXISTS: 'Tag slug already exists',
  INVALID_SLUG: 'Invalid tag slug',
  TYPE_MISMATCH: 'Tag type mismatch',
  INVALID_FOR_ENTITY: 'Tag cannot be used for this entity',
} as const;

async function resolveUniqueSlug(
  type: TagType,
  name: string,
  preferredSlug?: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(preferredSlug ?? name);
  if (!base) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_SLUG);
  }

  let candidate = base;
  let suffix = 1;
  while (await TagRepo.slugExists(type, candidate, excludeId)) {
    candidate = appendSlugSuffix(base, suffix);
    suffix += 1;
  }
  return candidate;
}

function assertTagForEntity(tag: Tag, entity: 'course' | 'post'): void {
  if (entity === 'course' && tag.type !== 'course' && tag.type !== 'global') {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_FOR_ENTITY);
  }
  if (entity === 'post' && tag.type !== 'post' && tag.type !== 'global') {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_FOR_ENTITY);
  }
}

async function list(query: ListTagsQuery): Promise<{ data: TagWithCounts[] }> {
  const data = await TagRepo.findAllWithCounts({
    type: query.type,
    status: query.status,
    includeGlobalFor:
      query.type === 'course' || query.type === 'post' ? query.type : undefined,
  });
  return { data };
}

async function create(input: CreateTagInput): Promise<Tag> {
  const slug = await resolveUniqueSlug(input.type, input.name, input.slug);
  return TagRepo.create({
    name: input.name,
    slug,
    type: input.type,
    description: input.description ?? null,
  });
}

async function update(id: string, input: UpdateTagInput): Promise<Tag> {
  const existing = await TagRepo.findById(id);
  if (!existing) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const payload: Partial<{ name: string; slug: string; status: Tag['status']; description: string | null }> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.status !== undefined) payload.status = input.status;
  if (input.description !== undefined) payload.description = input.description;

  if (input.slug !== undefined) {
    const slug = slugify(input.slug);
    if (!slug) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_SLUG);
    }
    if (await TagRepo.slugExists(existing.type, slug, id)) {
      throw new RouteError(HttpStatusCodes.CONFLICT, Errors.SLUG_EXISTS);
    }
    payload.slug = slug;
  } else if (input.name !== undefined && input.name !== existing.name) {
    payload.slug = await resolveUniqueSlug(existing.type, input.name, existing.slug, id);
  }

  const updated = await TagRepo.update(id, payload);
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return updated;
}

async function remove(id: string) {
  const deleted = await TagRepo.remove(id);
  if (!deleted) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return { message: 'Tag deleted' };
}

async function resolveTagIdsBySlugs(
  slugs: string[],
  entity: 'course' | 'post',
): Promise<string[]> {
  if (slugs.length === 0) {
    return [];
  }

  const uniqueSlugs = [...new Set(slugs.map((s) => slugify(s)).filter(Boolean))];
  const tags = await TagRepo.findBySlugsForEntity(uniqueSlugs, entity);

  if (tags.length !== uniqueSlugs.length) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'One or more tag slugs are invalid',
    );
  }

  for (const tag of tags) {
    assertTagForEntity(tag, entity);
  }

  return tags.map((tag) => tag.id);
}

async function syncPostTags(postId: string, tagSlugs?: string[]): Promise<TagPublic[]> {
  if (tagSlugs === undefined) {
    const map = await PostTagRepo.findByPostIds([postId]);
    return map.get(postId) ?? [];
  }

  const tagIds = await resolveTagIdsBySlugs(tagSlugs, 'post');
  await PostTagRepo.syncForPost(postId, tagIds);
  const map = await PostTagRepo.findByPostIds([postId]);
  return map.get(postId) ?? [];
}

async function syncCourseTags(
  courseId: string,
  tagSlugs?: string[],
): Promise<TagPublic[]> {
  if (tagSlugs === undefined) {
    const map = await CourseTagRepo.findByCourseIds([courseId]);
    return map.get(courseId) ?? [];
  }

  const tagIds = await resolveTagIdsBySlugs(tagSlugs, 'course');
  await CourseTagRepo.syncForCourse(courseId, tagIds);
  const map = await CourseTagRepo.findByCourseIds([courseId]);
  return map.get(courseId) ?? [];
}

async function attachTagsToPosts<T extends { id: string }>(
  posts: T[],
): Promise<Array<T & { tags: TagPublic[] }>> {
  if (posts.length === 0) {
    return [];
  }

  const tagMap = await PostTagRepo.findByPostIds(posts.map((post) => post.id));
  return posts.map((post) => ({
    ...post,
    tags: tagMap.get(post.id) ?? [],
  }));
}

async function attachTagsToCourses<T extends { id: string }>(
  courses: T[],
): Promise<Array<T & { tags: TagPublic[] }>> {
  if (courses.length === 0) {
    return [];
  }

  const tagMap = await CourseTagRepo.findByCourseIds(
    courses.map((course) => course.id),
  );
  return courses.map((course) => ({
    ...course,
    tags: tagMap.get(course.id) ?? [],
  }));
}

export default {
  Errors,
  list,
  create,
  update,
  remove,
  resolveTagIdsBySlugs,
  syncPostTags,
  syncCourseTags,
  attachTagsToPosts,
  attachTagsToCourses,
  assertTagForEntity,
};
