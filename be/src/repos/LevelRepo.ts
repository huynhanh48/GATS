import { asc, eq } from 'drizzle-orm';

import db from '@src/db';
import { levelsTable } from '@src/db/schema/level';
import { levelSchema, type Level, type UpdateLevelInput } from '@src/models/Level.model';

export async function findAll(): Promise<Level[]> {
  const rows = await db.select().from(levelsTable).orderBy(asc(levelsTable.sortOrder));
  return rows.map((row) => levelSchema.parse(row));
}

export async function update(
  code: Level['code'],
  input: UpdateLevelInput,
): Promise<Level | undefined> {
  const rows = await db
    .update(levelsTable)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(levelsTable.code, code))
    .returning();
  return rows[0] ? levelSchema.parse(rows[0]) : undefined;
}
