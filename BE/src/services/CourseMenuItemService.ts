import { and, asc, eq, isNull, ne, or, sql } from 'drizzle-orm';
import db from '@src/db';
import { courseMenuItemsTable } from '@src/db/schema/course-menu-item';
import { coursesTable } from '@src/db/schema/course';
import { courseTagsTable } from '@src/db/schema/course-tag';
import { tagsTable } from '@src/db/schema/tag';
import { categoriesTable } from '@src/db/schema/category';
import { RouteError } from '@src/common/utils/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

type Input = typeof courseMenuItemsTable.$inferInsert;

const LEVEL_TO_CATEGORY_MAP: Record<string, { slug: string; title: string }> = {
  beginner: { slug: 'ai-office', title: 'AI cho công sở' },
  intermediate: { slug: 'automation', title: 'Tự động hóa' },
  advanced: { slug: 'programming', title: 'Lập trình' },
};

async function assertValid(input: Partial<Input>, currentId?: string) {
  if (!input.parentId) return;
  if (input.parentId === currentId) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Menu item cannot be its own parent');
  }
  const [parent] = await db.select().from(courseMenuItemsTable)
    .where(eq(courseMenuItemsTable.id, input.parentId)).limit(1);
  if (!parent || parent.parentId) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Parent must be a top-level group');
  }
}

async function listAdmin() {
  return db.select().from(courseMenuItemsTable)
    .orderBy(asc(courseMenuItemsTable.sortOrder), asc(courseMenuItemsTable.title));
}

async function getTagCountsByCategory() {
  const activeTags = await db.select({
    id: tagsTable.id,
    name: tagsTable.name,
    slug: tagsTable.slug,
    type: tagsTable.type,
  }).from(tagsTable)
    .where(and(
      eq(tagsTable.status, 'active'),
      or(eq(tagsTable.type, 'course'), eq(tagsTable.type, 'global')),
    ))
    .orderBy(asc(tagsTable.name));

  const rows = await db.select({
    courseId: courseTagsTable.courseId,
    tagId: courseTagsTable.tagId,
    categorySlug: categoriesTable.slug,
  }).from(courseTagsTable)
    .innerJoin(coursesTable, eq(courseTagsTable.courseId, coursesTable.id))
    .innerJoin(categoriesTable, eq(coursesTable.categoryId, categoriesTable.id))
    .where(and(
      eq(coursesTable.status, 'published'),
      isNull(coursesTable.deletedAt),
    ));

  const tagCatMap = new Map<string, Map<string, Set<string>>>();
  for (const row of rows) {
    if (!row.categorySlug) continue;
    let catMap = tagCatMap.get(row.tagId);
    if (!catMap) {
      catMap = new Map();
      tagCatMap.set(row.tagId, catMap);
    }
    let courseSet = catMap.get(row.categorySlug);
    if (!courseSet) {
      courseSet = new Set();
      catMap.set(row.categorySlug, courseSet);
    }
    courseSet.add(row.courseId);
  }

  return activeTags.map(tag => {
    const catMap = tagCatMap.get(tag.id);
    const categoryCounts: Record<string, number> = {};
    let total = 0;
    if (catMap) {
      for (const [catSlug, courseSet] of catMap.entries()) {
        categoryCounts[catSlug] = courseSet.size;
        total += courseSet.size;
      }
    }
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      type: tag.type,
      categoryCounts,
      total,
    };
  });
}

async function ensureCategoryGroupsPersisted() {
  // Convert any old level-based groups to category groups
  for (const [level, cat] of Object.entries(LEVEL_TO_CATEGORY_MAP)) {
    await db.update(courseMenuItemsTable)
      .set({ title: cat.title, icon: cat.slug, updatedAt: new Date() })
      .where(and(
        isNull(courseMenuItemsTable.parentId),
        eq(courseMenuItemsTable.icon, level),
      ));
  }

  // Convert old child item URLs from /courses?level=... to /courses?category=...
  const oldChildren = await db.select()
    .from(courseMenuItemsTable)
    .where(and(
      sql`${courseMenuItemsTable.parentId} is not null`,
      sql`${courseMenuItemsTable.url} LIKE '/courses?level=%'`,
    ));

  for (const child of oldChildren) {
    if (!child.parentId) continue;
    const parent = await db.select()
      .from(courseMenuItemsTable)
      .where(eq(courseMenuItemsTable.id, child.parentId))
      .limit(1);
    const catSlug = parent[0]?.icon || 'ai-office';
    const tagMatch = child.url?.match(/[?&]tag=([^&]+)/);
    const tagSlug = tagMatch ? tagMatch[1] : '';
    const newUrl = `/courses?category=${catSlug}&tag=${tagSlug}`;
    await db.update(courseMenuItemsTable)
      .set({ url: newUrl, updatedAt: new Date() })
      .where(eq(courseMenuItemsTable.id, child.id));
  }
}

async function getPublicTree() {
  void ensureCategoryGroupsPersisted().catch(() => undefined);

  // Compute published courses per category slug and tag slug in JS
  const courseRows = await db.select({
    courseId: courseTagsTable.courseId,
    categorySlug: categoriesTable.slug,
    tagSlug: tagsTable.slug,
  }).from(courseTagsTable)
    .innerJoin(coursesTable, eq(courseTagsTable.courseId, coursesTable.id))
    .innerJoin(tagsTable, eq(courseTagsTable.tagId, tagsTable.id))
    .innerJoin(categoriesTable, eq(coursesTable.categoryId, categoriesTable.id))
    .where(and(
      eq(coursesTable.status, 'published'),
      isNull(coursesTable.deletedAt),
      eq(tagsTable.status, 'active'),
    ));

  const catTagCourseSet = new Map<string, Set<string>>();
  for (const row of courseRows) {
    const key = `${row.categorySlug}:${row.tagSlug}`;
    let set = catTagCourseSet.get(key);
    if (!set) {
      set = new Set();
      catTagCourseSet.set(key, set);
    }
    set.add(row.courseId);
  }

  const rows = await db.select()
    .from(courseMenuItemsTable)
    .where(eq(courseMenuItemsTable.isActive, true))
    .orderBy(asc(courseMenuItemsTable.sortOrder), asc(courseMenuItemsTable.title));

  const groups = rows.filter(item => !item.parentId).map(item => {
    const categorySlug = item.icon || 'ai-office';
    return {
      id: item.id,
      title: item.title,
      icon: item.icon,
      categorySlug,
      sortOrder: item.sortOrder,
      children: [] as Array<{
        id: string;
        title: string;
        tag: string;
        href: string;
        courseCount: number;
        thumbnail: string | null;
        description: string | null;
        badge: string | null;
        sortOrder: number;
      }>,
    };
  });

  for (const item of rows) {
    if (!item.parentId) continue;
    if (item.courseId) continue;

    const group = groups.find(value => value.id === item.parentId);
    if (!group) continue;

    let tagSlug = '';
    let categorySlug = group.categorySlug;

    if (item.url) {
      const tagMatch = item.url.match(/[?&]tag=([^&]+)/);
      if (tagMatch && tagMatch[1]) {
        tagSlug = decodeURIComponent(tagMatch[1]);
      }
      const catMatch = item.url.match(/[?&]category=([^&]+)/);
      if (catMatch && catMatch[1]) {
        categorySlug = decodeURIComponent(catMatch[1]);
      }
    }

    const count = tagSlug ? (catTagCourseSet.get(`${categorySlug}:${tagSlug}`)?.size ?? 0) : 0;

    group.children.push({
      id: item.id,
      title: item.title,
      tag: tagSlug,
      href: item.url || `/courses?category=${categorySlug}&tag=${tagSlug}`,
      courseCount: count,
      thumbnail: null,
      description: item.description ?? null,
      badge: item.badge ?? null,
      sortOrder: item.sortOrder,
    });
  }

  return groups;
}

async function create(input: Input) {
  await assertValid(input);
  const [row] = await db.insert(courseMenuItemsTable).values(input).returning();
  return row;
}

async function update(id: string, input: Partial<Input>) {
  await assertValid(input, id);
  const [row] = await db.update(courseMenuItemsTable)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(courseMenuItemsTable.id, id)).returning();
  if (!row) throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Menu item not found');
  return row;
}

async function remove(id: string) {
  const [child] = await db.select({ id: courseMenuItemsTable.id }).from(courseMenuItemsTable)
    .where(eq(courseMenuItemsTable.parentId, id)).limit(1);
  if (child) throw new RouteError(HttpStatusCodes.CONFLICT, 'Group still contains menu items');
  const [row] = await db.delete(courseMenuItemsTable).where(eq(courseMenuItemsTable.id, id))
    .returning({ id: courseMenuItemsTable.id });
  if (!row) throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Menu item not found');
}

async function reorder(items: { id: string; sortOrder: number }[]) {
  await db.transaction(async tx => {
    for (const item of items) {
      await tx.update(courseMenuItemsTable)
        .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
        .where(eq(courseMenuItemsTable.id, item.id));
    }
  });
}

async function seedDefaults() {
  const existing = await db.select({ id: courseMenuItemsTable.id }).from(courseMenuItemsTable).limit(1);
  if (existing.length) throw new RouteError(HttpStatusCodes.CONFLICT, 'Menu is not empty');

  const topics = await db.select({
    categorySlug: categoriesTable.slug,
    categoryName: categoriesTable.name,
    tagName: tagsTable.name,
    tagSlug: tagsTable.slug,
  }).from(courseTagsTable)
    .innerJoin(coursesTable, eq(courseTagsTable.courseId, coursesTable.id))
    .innerJoin(tagsTable, eq(courseTagsTable.tagId, tagsTable.id))
    .innerJoin(categoriesTable, eq(coursesTable.categoryId, categoriesTable.id))
    .where(and(
      eq(coursesTable.status, 'published'),
      isNull(coursesTable.deletedAt),
      eq(tagsTable.status, 'active'),
      eq(categoriesTable.status, 'active'),
      eq(categoriesTable.type, 'course'),
      ne(tagsTable.slug, 'ai'),
    ))
    .orderBy(asc(categoriesTable.name), asc(tagsTable.name));

  const uniqueCategories = [...new Map(
    topics.map(t => [t.categorySlug, { slug: t.categorySlug, name: t.categoryName }]),
  ).values()];

  return db.transaction(async tx => {
    let count = 0;
    for (const [order, cat] of uniqueCategories.entries()) {
      const [group] = await tx.insert(courseMenuItemsTable)
        .values({ title: cat.name, icon: cat.slug, sortOrder: order }).returning();

      const uniqueTags = [...new Map(
        topics
          .filter(t => t.categorySlug === cat.slug)
          .map(t => [t.tagSlug, t]),
      ).values()];

      for (const [childOrder, topic] of uniqueTags.entries()) {
        await tx.insert(courseMenuItemsTable).values({
          title: topic.tagName,
          parentId: group.id,
          url: `/courses?category=${cat.slug}&tag=${topic.tagSlug}`,
          sortOrder: childOrder,
        });
        count++;
      }
    }
    return { groups: uniqueCategories.length, items: count };
  });
}

export default {
  listAdmin,
  getPublicTree,
  getTagCountsByCategory,
  ensureCategoryGroupsPersisted,
  ensureGroupNamesPersisted: ensureCategoryGroupsPersisted,
  create,
  update,
  remove,
  reorder,
  seedDefaults,
};
