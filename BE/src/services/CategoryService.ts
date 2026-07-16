import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { appendSlugSuffix, slugify } from '@src/common/utils/slug';
import { RouteError } from '@src/common/utils/route-errors';
import type { CategoryType } from '@src/db/schema/category';
import type {
  Category,
  CategoryWithCounts,
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from '@src/models/Category.model';
import * as CategoryRepo from '@src/repos/CategoryRepo';

const Errors = {
  NOT_FOUND: 'Category not found',
  SLUG_EXISTS: 'Category slug already exists',
  INVALID_SLUG: 'Invalid category slug',
  TYPE_MISMATCH: 'Category type mismatch',
} as const;

async function resolveUniqueSlug(
  type: CategoryType,
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
  while (await CategoryRepo.slugExists(type, candidate, excludeId)) {
    candidate = appendSlugSuffix(base, suffix);
    suffix += 1;
  }
  return candidate;
}

function assertCategoryType(category: Category, expected: CategoryType): void {
  if (category.type !== expected) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.TYPE_MISMATCH);
  }
}

async function list(query: ListCategoriesQuery): Promise<{ data: CategoryWithCounts[] }> {
  const data = await CategoryRepo.findAllWithCounts({
    type: query.type,
    status: query.status,
  });
  return { data };
}

async function create(input: CreateCategoryInput): Promise<Category> {
  const slug = await resolveUniqueSlug(input.type, input.name, input.slug);
  return CategoryRepo.create({
    name: input.name,
    slug,
    type: input.type,
    description: input.description ?? null,
    thumbnail: input.thumbnail ?? null,
    icon: input.icon ?? null,
    parentId: input.parent_id ?? null,
    sortOrder: input.sort_order ?? 0,
    seoTitle: input.seo_title ?? null,
    seoDescription: input.seo_description ?? null,
  });
}

async function update(id: string, input: UpdateCategoryInput): Promise<Category> {
  const existing = await CategoryRepo.findById(id);
  if (!existing) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  const payload: Partial<{
    name: string;
    slug: string;
    status: Category['status'];
    description: string | null;
    thumbnail: string | null;
    icon: string | null;
    parentId: string | null;
    sortOrder: number;
    seoTitle: string | null;
    seoDescription: string | null;
  }> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.status !== undefined) payload.status = input.status;
  if (input.description !== undefined) payload.description = input.description;
  if (input.thumbnail !== undefined) payload.thumbnail = input.thumbnail;
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.parent_id !== undefined) payload.parentId = input.parent_id;
  if (input.sort_order !== undefined) payload.sortOrder = input.sort_order;
  if (input.seo_title !== undefined) payload.seoTitle = input.seo_title;
  if (input.seo_description !== undefined) {
    payload.seoDescription = input.seo_description;
  }

  if (input.slug !== undefined) {
    const slug = slugify(input.slug);
    if (!slug) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_SLUG);
    }
    if (await CategoryRepo.slugExists(existing.type, slug, id)) {
      throw new RouteError(HttpStatusCodes.CONFLICT, Errors.SLUG_EXISTS);
    }
    payload.slug = slug;
  } else if (input.name !== undefined && input.name !== existing.name) {
    payload.slug = await resolveUniqueSlug(
      existing.type,
      input.name,
      existing.slug,
      id,
    );
  }

  const updated = await CategoryRepo.update(id, payload);
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return updated;
}

async function remove(id: string) {
  const deleted = await CategoryRepo.remove(id);
  if (!deleted) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  return { message: 'Category deleted' };
}

async function resolveCategoryId(
  expectedType: CategoryType,
  categoryId?: string | null,
  categorySlug?: string | null,
): Promise<string | null | undefined> {
  if (categorySlug !== undefined) {
    if (categorySlug === null || categorySlug === '') {
      return null;
    }
    const slug = slugify(categorySlug);
    if (!slug) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_SLUG);
    }
    const category = await CategoryRepo.findByTypeAndSlug(expectedType, slug);
    if (!category) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NOT_FOUND);
    }
    assertCategoryType(category, expectedType);
    return category.id;
  }

  if (categoryId !== undefined && categoryId !== null) {
    const category = await CategoryRepo.findById(categoryId);
    if (!category) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NOT_FOUND);
    }
    assertCategoryType(category, expectedType);
  }

  return categoryId;
}

async function resolveOrCreateCategoryId(
  expectedType: CategoryType,
  categoryId?: string | null,
  categoryName?: string | null,
): Promise<string | null | undefined> {
  if (categoryName !== undefined) {
    if (categoryName === null || categoryName.trim() === '') {
      return null;
    }
    const name = categoryName.trim();
    const slug = slugify(name);
    if (!slug) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_SLUG);
    }
    const existing = await CategoryRepo.findByTypeAndSlug(expectedType, slug);
    if (existing) {
      assertCategoryType(existing, expectedType);
      return existing.id;
    }
    const created = await create({ type: expectedType, name });
    return created.id;
  }

  return resolveCategoryId(expectedType, categoryId, undefined);
}

export default {
  Errors,
  list,
  create,
  update,
  remove,
  resolveCategoryId,
  resolveOrCreateCategoryId,
  assertCategoryType,
  findByTypeAndSlug: CategoryRepo.findByTypeAndSlug,
  findById: CategoryRepo.findById,
};
