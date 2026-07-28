import { and, asc, count, eq, ne, sql } from 'drizzle-orm';
import { z } from 'zod';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import db from '@src/db';
import { coursesTable } from '@src/db/schema/course';
import {
  FLASHCARD_CARD_STATUSES,
  FLASHCARD_DECK_STATUSES,
  flashcardDecksTable,
  flashcardsTable,
  type FlashcardCardStatus,
  type FlashcardDeckStatus,
} from '@src/db/schema/mobile-experience';

const deckStatusSchema = z.enum(FLASHCARD_DECK_STATUSES);
const cardStatusSchema = z.enum(FLASHCARD_CARD_STATUSES);

const createDeckSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(2000).optional().nullable(),
  status: deckStatusSchema.optional(),
  sortOrder: z.number().int().min(0).optional(),
  lessonId: z.string().uuid().optional().nullable(),
});

const updateDeckSchema = createDeckSchema.partial();

const createCardSchema = z.object({
  front: z.string().trim().min(1).max(4000),
  back: z.string().trim().min(1).max(4000),
  hint: z.string().trim().max(1000).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  status: cardStatusSchema.optional(),
});

const updateCardSchema = createCardSchema.partial();

const importSchema = z.object({
  csv: z.string().min(1).max(500_000),
});

function mapDeck(row: typeof flashcardDecksTable.$inferSelect, cardCount = 0) {
  return {
    id: row.id,
    courseId: row.courseId,
    lessonId: row.lessonId,
    title: row.title,
    description: row.description,
    status: row.status as FlashcardDeckStatus,
    sortOrder: row.sortOrder,
    version: row.version,
    cardCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapCard(row: typeof flashcardsTable.$inferSelect) {
  return {
    id: row.id,
    deckId: row.deckId,
    front: row.front,
    back: row.back,
    hint: row.hint,
    sortOrder: row.sortOrder,
    status: row.status as FlashcardCardStatus,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function assertCourseExists(courseId: string) {
  const [course] = await db
    .select({ id: coursesTable.id })
    .from(coursesTable)
    .where(eq(coursesTable.id, courseId))
    .limit(1);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Course not found');
  }
}

async function getDeckOrThrow(deckId: string) {
  const [deck] = await db
    .select()
    .from(flashcardDecksTable)
    .where(eq(flashcardDecksTable.id, deckId))
    .limit(1);
  if (!deck) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Flashcard deck not found');
  }
  return deck;
}

async function getCardOrThrow(cardId: string) {
  const [card] = await db
    .select()
    .from(flashcardsTable)
    .where(eq(flashcardsTable.id, cardId))
    .limit(1);
  if (!card) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Flashcard not found');
  }
  return card;
}

async function listDecks(
  courseId: string,
  options?: { includeArchived?: boolean },
) {
  await assertCourseExists(courseId);
  const includeArchived = options?.includeArchived === true;
  const decks = await db
    .select({
      deck: flashcardDecksTable,
      cardCount: sql<number>`count(${flashcardsTable.id}) filter (where ${flashcardsTable.status} <> 'archived')`,
    })
    .from(flashcardDecksTable)
    .leftJoin(
      flashcardsTable,
      eq(flashcardsTable.deckId, flashcardDecksTable.id),
    )
    .where(
      includeArchived
        ? eq(flashcardDecksTable.courseId, courseId)
        : and(
            eq(flashcardDecksTable.courseId, courseId),
            ne(flashcardDecksTable.status, 'archived'),
          ),
    )
    .groupBy(flashcardDecksTable.id)
    .orderBy(
      asc(flashcardDecksTable.sortOrder),
      asc(flashcardDecksTable.createdAt),
    );

  return {
    data: decks.map((r) => mapDeck(r.deck, Number(r.cardCount ?? 0))),
  };
}

async function createDeck(courseId: string, body: unknown) {
  await assertCourseExists(courseId);
  const input = createDeckSchema.parse(body);
  const [row] = await db
    .insert(flashcardDecksTable)
    .values({
      courseId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'draft',
      sortOrder: input.sortOrder ?? 0,
      lessonId: input.lessonId ?? null,
    })
    .returning();
  return { data: mapDeck(row, 0) };
}

async function updateDeck(deckId: string, body: unknown) {
  const existing = await getDeckOrThrow(deckId);
  const input = updateDeckSchema.parse(body);
  const [row] = await db
    .update(flashcardDecksTable)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.lessonId !== undefined ? { lessonId: input.lessonId } : {}),
      version: existing.version + 1,
      updatedAt: new Date(),
    })
    .where(eq(flashcardDecksTable.id, deckId))
    .returning();
  const [countRow] = await db
    .select({ total: count() })
    .from(flashcardsTable)
    .where(
      and(
        eq(flashcardsTable.deckId, deckId),
        ne(flashcardsTable.status, 'archived'),
      ),
    );
  return { data: mapDeck(row, Number(countRow?.total ?? 0)) };
}

async function archiveDeck(deckId: string) {
  return updateDeck(deckId, { status: 'archived' });
}

async function listCards(
  deckId: string,
  options?: { includeArchived?: boolean },
) {
  await getDeckOrThrow(deckId);
  const includeArchived = options?.includeArchived === true;
  const rows = await db
    .select()
    .from(flashcardsTable)
    .where(
      includeArchived
        ? eq(flashcardsTable.deckId, deckId)
        : and(
            eq(flashcardsTable.deckId, deckId),
            ne(flashcardsTable.status, 'archived'),
          ),
    )
    .orderBy(asc(flashcardsTable.sortOrder), asc(flashcardsTable.createdAt));
  return { data: rows.map(mapCard) };
}

async function createCard(deckId: string, body: unknown) {
  await getDeckOrThrow(deckId);
  const input = createCardSchema.parse(body);
  const [row] = await db
    .insert(flashcardsTable)
    .values({
      deckId,
      front: input.front,
      back: input.back,
      hint: input.hint ?? null,
      sortOrder: input.sortOrder ?? 0,
      status: input.status ?? 'published',
    })
    .returning();
  return { data: mapCard(row) };
}

async function updateCard(cardId: string, body: unknown) {
  const existing = await getCardOrThrow(cardId);
  const input = updateCardSchema.parse(body);
  const [row] = await db
    .update(flashcardsTable)
    .set({
      ...(input.front !== undefined ? { front: input.front } : {}),
      ...(input.back !== undefined ? { back: input.back } : {}),
      ...(input.hint !== undefined ? { hint: input.hint } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      version: existing.version + 1,
      updatedAt: new Date(),
    })
    .where(eq(flashcardsTable.id, cardId))
    .returning();
  return { data: mapCard(row) };
}

async function archiveCard(cardId: string) {
  return updateCard(cardId, { status: 'archived' });
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

async function importCards(deckId: string, body: unknown) {
  await getDeckOrThrow(deckId);
  const { csv } = importSchema.parse(body);
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'CSV is empty');
  }

  let start = 0;
  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const hasHeader =
    header.includes('front') && header.includes('back');
  if (hasHeader) start = 1;

  const created = [];
  for (let i = start; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    let front: string;
    let back: string;
    let hint: string | null = null;
    let sortOrder = i - start;

    if (hasHeader) {
      const idx = {
        front: header.indexOf('front'),
        back: header.indexOf('back'),
        hint: header.indexOf('hint'),
        order: header.indexOf('order'),
      };
      front = cells[idx.front] ?? '';
      back = cells[idx.back] ?? '';
      if (idx.hint >= 0) hint = cells[idx.hint] || null;
      if (idx.order >= 0 && cells[idx.order]) {
        sortOrder = Number.parseInt(cells[idx.order], 10) || sortOrder;
      }
    } else {
      front = cells[0] ?? '';
      back = cells[1] ?? '';
      hint = cells[2] || null;
      if (cells[3]) sortOrder = Number.parseInt(cells[3], 10) || sortOrder;
    }

    if (!front || !back) continue;
    const [row] = await db
      .insert(flashcardsTable)
      .values({
        deckId,
        front,
        back,
        hint,
        sortOrder,
        status: 'published',
      })
      .returning();
    created.push(mapCard(row));
  }

  return { data: { imported: created.length, cards: created } };
}

async function resolveDeckCourseId(deckId: string): Promise<string | null> {
  const deck = await getDeckOrThrow(deckId);
  return deck.courseId;
}

async function resolveCardCourseId(cardId: string): Promise<string | null> {
  const card = await getCardOrThrow(cardId);
  const deck = await getDeckOrThrow(card.deckId);
  return deck.courseId;
}

export default {
  listDecks,
  createDeck,
  updateDeck,
  archiveDeck,
  listCards,
  createCard,
  updateCard,
  archiveCard,
  importCards,
  getDeckOrThrow,
  getCardOrThrow,
  resolveDeckCourseId,
  resolveCardCourseId,
};
