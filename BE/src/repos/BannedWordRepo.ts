import { asc, eq, sql } from 'drizzle-orm';

import db from '@src/db';
import {
  bannedWordsTable,
  type NewBannedWord,
} from '@src/db/schema/banned-word';
import {
  type BannedWord,
  parseBannedWord,
} from '@src/models/BannedWord.model';

function parseRow(row: unknown): BannedWord {
  return parseBannedWord(row);
}

export async function findAll(): Promise<BannedWord[]> {
  const rows = await db
    .select()
    .from(bannedWordsTable)
    .orderBy(asc(bannedWordsTable.word));
  return rows.map(parseRow);
}

export async function findActiveWords(): Promise<string[]> {
  const rows = await db
    .select({ word: bannedWordsTable.word })
    .from(bannedWordsTable)
    .where(eq(bannedWordsTable.isActive, true));
  return rows.map((row) => row.word);
}

export async function findById(id: string): Promise<BannedWord | undefined> {
  const rows = await db
    .select()
    .from(bannedWordsTable)
    .where(eq(bannedWordsTable.id, id))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findByWordIgnoreCase(
  word: string,
): Promise<BannedWord | undefined> {
  const rows = await db
    .select()
    .from(bannedWordsTable)
    .where(sql`lower(${bannedWordsTable.word}) = lower(${word})`)
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function create(data: NewBannedWord): Promise<BannedWord> {
  const rows = await db.insert(bannedWordsTable).values(data).returning();
  return parseRow(rows[0]);
}

export async function update(
  id: string,
  data: Partial<NewBannedWord>,
): Promise<BannedWord | undefined> {
  const rows = await db
    .update(bannedWordsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(bannedWordsTable.id, id))
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function remove(id: string): Promise<boolean> {
  const rows = await db
    .delete(bannedWordsTable)
    .where(eq(bannedWordsTable.id, id))
    .returning({ id: bannedWordsTable.id });
  return rows.length > 0;
}
