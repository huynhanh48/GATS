import { and, count, desc, eq, type SQL } from 'drizzle-orm';

import db from '@src/db';
import {
  mediaTable,
  type MediaKind,
  type NewMedia,
} from '@src/db/schema/media';
import {
  parseMediaRecord,
  type ListMediaQuery,
  type MediaRecord,
} from '@src/models/Media.model';

function parseRow(row: unknown): MediaRecord {
  return parseMediaRecord(row);
}

export async function create(data: NewMedia): Promise<MediaRecord> {
  const rows = await db.insert(mediaTable).values(data).returning();
  return parseRow(rows[0]);
}

export async function findById(id: string): Promise<MediaRecord | undefined> {
  const rows = await db
    .select()
    .from(mediaTable)
    .where(eq(mediaTable.id, id))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function list(
  query: ListMediaQuery,
): Promise<{ data: MediaRecord[]; total: number }> {
  const conditions: SQL[] = [];
  if (query.kind) {
    conditions.push(eq(mediaTable.kind, query.kind as MediaKind));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const skip = (query.page - 1) * query.limit;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(mediaTable)
      .where(whereClause)
      .orderBy(desc(mediaTable.createdAt))
      .limit(query.limit)
      .offset(skip),
    db.select({ total: count() }).from(mediaTable).where(whereClause),
  ]);

  return {
    data: rows.map(parseRow),
    total: Number(totalRows[0]?.total ?? 0),
  };
}

export async function remove(id: string): Promise<MediaRecord | undefined> {
  const rows = await db
    .delete(mediaTable)
    .where(eq(mediaTable.id, id))
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}
