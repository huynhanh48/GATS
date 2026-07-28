import { and, asc, eq, isNull, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import db from '@src/db';
import {
  flashcardReviewEventsTable,
  flashcardUserStateTable,
  flashcardsTable,
} from '@src/db/schema/mobile-experience';

async function due(userId: number, limit = 20) {
  const now = new Date();
  const rows = await db
    .select({
      card: flashcardsTable,
      state: flashcardUserStateTable,
    })
    .from(flashcardsTable)
    .leftJoin(
      flashcardUserStateTable,
      and(
        eq(flashcardUserStateTable.cardId, flashcardsTable.id),
        eq(flashcardUserStateTable.userId, userId),
      ),
    )
    .where(
      or(
        isNull(flashcardUserStateTable.dueAt),
        sql`${flashcardUserStateTable.dueAt} <= ${now}`,
      ),
    )
    .orderBy(asc(flashcardUserStateTable.dueAt))
    .limit(Math.min(limit, 50));

  return {
    data: rows.map((r) => ({
      id: r.card.id,
      deckId: r.card.deckId,
      front: r.card.front,
      back: r.card.back,
      version: r.card.version,
      dueAt: r.state?.dueAt ?? null,
      ease: r.state?.ease ?? 2.5,
      intervalDays: r.state?.intervalDays ?? 0,
    })),
  };
}

const reviewSchema = z.object({
  eventId: z.string().uuid(),
  cardId: z.string().uuid(),
  rating: z.enum(['again', 'hard', 'good', 'easy']),
  occurredAt: z.string().datetime(),
});

const syncSchema = z.object({
  reviews: z.array(reviewSchema).min(1).max(100),
});

function nextInterval(rating: string, prevInterval: number, ease: number) {
  if (rating === 'again') return { interval: 0, ease: Math.max(1.3, ease - 0.2) };
  if (rating === 'hard')
    return {
      interval: Math.max(1, Math.round(prevInterval * 1.2)),
      ease: Math.max(1.3, ease - 0.15),
    };
  if (rating === 'easy')
    return {
      interval: Math.max(1, Math.round(prevInterval * ease * 1.3) || 4),
      ease: ease + 0.15,
    };
  return {
    interval: Math.max(1, Math.round(prevInterval * ease) || 1),
    ease,
  };
}

async function syncReviews(userId: number, body: unknown) {
  const input = syncSchema.parse(body);
  const results = [];

  for (const review of input.reviews) {
    const dup = await db
      .select()
      .from(flashcardReviewEventsTable)
      .where(eq(flashcardReviewEventsTable.eventId, review.eventId))
      .limit(1);
    if (dup[0]) {
      results.push({ eventId: review.eventId, status: 'duplicate' });
      continue;
    }

    await db.insert(flashcardReviewEventsTable).values({
      eventId: review.eventId,
      userId,
      cardId: review.cardId,
      rating: review.rating,
      occurredAt: new Date(review.occurredAt),
    });

    const stateRows = await db
      .select()
      .from(flashcardUserStateTable)
      .where(
        and(
          eq(flashcardUserStateTable.userId, userId),
          eq(flashcardUserStateTable.cardId, review.cardId),
        ),
      )
      .limit(1);

    const prev = stateRows[0];
    const computed = nextInterval(
      review.rating,
      prev?.intervalDays ?? 0,
      prev?.ease ?? 2.5,
    );
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + computed.interval);

    if (prev) {
      await db
        .update(flashcardUserStateTable)
        .set({
          ease: computed.ease,
          intervalDays: computed.interval,
          lapseCount:
            review.rating === 'again'
              ? prev.lapseCount + 1
              : prev.lapseCount,
          dueAt,
          lastReviewedAt: new Date(review.occurredAt),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(flashcardUserStateTable.userId, userId),
            eq(flashcardUserStateTable.cardId, review.cardId),
          ),
        );
    } else {
      await db.insert(flashcardUserStateTable).values({
        userId,
        cardId: review.cardId,
        ease: computed.ease,
        intervalDays: computed.interval,
        lapseCount: review.rating === 'again' ? 1 : 0,
        dueAt,
        lastReviewedAt: new Date(review.occurredAt),
      });
    }

    results.push({ eventId: review.eventId, status: 'applied' });
  }

  return { data: { results } };
}

async function stats(userId: number) {
  const [dueCount] = await db
    .select({ total: sql<number>`count(*)` })
    .from(flashcardUserStateTable)
    .where(
      and(
        eq(flashcardUserStateTable.userId, userId),
        sql`${flashcardUserStateTable.dueAt} <= now()`,
      ),
    );

  return {
    data: {
      dueCount: Number(dueCount?.total ?? 0),
    },
  };
}

export default { due, syncReviews, stats };
