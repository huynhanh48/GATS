import { isNotNull, isNull, type SQL } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

/**
 * Soft-delete visibility (Drizzle has no built-in soft delete).
 * Pattern: nullable `deletedAt` + filter with `isNull` / `isNotNull`.
 * @see https://orm.drizzle.team/docs/delete
 */
export type SoftDeleteVisibility = 'without' | 'with' | 'only';

export function softDeleteVisibilityCondition(
  column: AnyPgColumn,
  visibility: SoftDeleteVisibility = 'without',
): SQL | undefined {
  if (visibility === 'with') {
    return undefined;
  }
  if (visibility === 'only') {
    return isNotNull(column);
  }
  return isNull(column);
}

/** Alias for the default read filter: exclude soft-deleted rows. */
export function notDeleted(column: AnyPgColumn): SQL {
  return isNull(column);
}
