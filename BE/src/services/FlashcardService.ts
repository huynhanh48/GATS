import { and, asc, count, eq, isNull, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import db from '@src/db';
import { coursesTable } from '@src/db/schema/course';
import { courseEnrollmentsTable } from '@src/db/schema/enrollment';
import {
  flashcardDecksTable,
  flashcardReviewEventsTable,
  flashcardUserStateTable,
  flashcardsTable,
} from '@src/db/schema/mobile-experience';
import CourseAccessService from '@src/services/CourseAccessService';

async function due(
  userId: number,
  limit = 20,
  courseId?: string,
) {
  const now = new Date();
  const conditions = [
    eq(flashcardDecksTable.status, 'published'),
    eq(flashcardsTable.status, 'published'),
    eq(courseEnrollmentsTable.userId, userId),
    eq(courseEnrollmentsTable.status, 'active'),
    or(
      isNull(flashcardUserStateTable.dueAt),
      sql`${flashcardUserStateTable.dueAt} <= ${now}`,
    ),
  ];
  if (courseId) {
    conditions.push(eq(flashcardDecksTable.courseId, courseId));
  }

  const rows = await db
    .select({
      card: flashcardsTable,
      state: flashcardUserStateTable,
      deck: flashcardDecksTable,
      courseTitle: coursesTable.title,
    })
    .from(flashcardsTable)
    .innerJoin(
      flashcardDecksTable,
      eq(flashcardsTable.deckId, flashcardDecksTable.id),
    )
    .innerJoin(
      coursesTable,
      eq(flashcardDecksTable.courseId, coursesTable.id),
    )
    .innerJoin(
      courseEnrollmentsTable,
      and(
        eq(courseEnrollmentsTable.courseId, flashcardDecksTable.courseId),
        eq(courseEnrollmentsTable.userId, userId),
      ),
    )
    .leftJoin(
      flashcardUserStateTable,
      and(
        eq(flashcardUserStateTable.cardId, flashcardsTable.id),
        eq(flashcardUserStateTable.userId, userId),
      ),
    )
    .where(and(...conditions))
    .orderBy(asc(flashcardUserStateTable.dueAt))
    .limit(Math.min(limit, 50));

  return {
    data: rows.map((r) => ({
      id: r.card.id,
      deckId: r.card.deckId,
      deckTitle: r.deck.title,
      courseId: r.deck.courseId,
      courseTitle: r.courseTitle,
      front: r.card.front,
      back: r.card.back,
      hint: r.card.hint,
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

async function assertReviewAllowed(userId: number, cardId: string) {
  const [row] = await db
    .select({
      cardStatus: flashcardsTable.status,
      deckStatus: flashcardDecksTable.status,
      courseId: flashcardDecksTable.courseId,
    })
    .from(flashcardsTable)
    .innerJoin(
      flashcardDecksTable,
      eq(flashcardsTable.deckId, flashcardDecksTable.id),
    )
    .where(eq(flashcardsTable.id, cardId))
    .limit(1);

  if (!row) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Flashcard not found');
  }
  if (row.cardStatus !== 'published' || row.deckStatus !== 'published') {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      'Flashcard is not available for review',
    );
  }
  if (!row.courseId) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      'Flashcard deck is not linked to a course',
    );
  }
  const enrolled = await CourseAccessService.isEnrolled(userId, row.courseId);
  if (!enrolled) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      'Not enrolled in this course',
    );
  }
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

    try {
      await assertReviewAllowed(userId, review.cardId);
    } catch (err) {
      if (err instanceof RouteError) {
        results.push({
          eventId: review.eventId,
          status: 'rejected',
          reason: err.message,
        });
        continue;
      }
      throw err;
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

async function stats(userId: number, courseId?: string) {
  const now = new Date();
  const conditions = [
    eq(flashcardUserStateTable.userId, userId),
    sql`${flashcardUserStateTable.dueAt} <= ${now}`,
    eq(flashcardDecksTable.status, 'published'),
    eq(flashcardsTable.status, 'published'),
    eq(courseEnrollmentsTable.userId, userId),
    eq(courseEnrollmentsTable.status, 'active'),
  ];
  if (courseId) {
    conditions.push(eq(flashcardDecksTable.courseId, courseId));
  }

  const [dueCount] = await db
    .select({ total: count() })
    .from(flashcardUserStateTable)
    .innerJoin(
      flashcardsTable,
      eq(flashcardUserStateTable.cardId, flashcardsTable.id),
    )
    .innerJoin(
      flashcardDecksTable,
      eq(flashcardsTable.deckId, flashcardDecksTable.id),
    )
    .innerJoin(
      courseEnrollmentsTable,
      and(
        eq(courseEnrollmentsTable.courseId, flashcardDecksTable.courseId),
        eq(courseEnrollmentsTable.userId, userId),
      ),
    )
    .where(and(...conditions));

  return {
    data: {
      dueCount: Number(dueCount?.total ?? 0),
    },
  };
}

async function listPublishedDecksForCourse(userId: number, courseId: string) {
  const enrolled = await CourseAccessService.isEnrolled(userId, courseId);
  if (!enrolled) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      'Not enrolled in this course',
    );
  }

  const decks = await db
    .select({
      deck: flashcardDecksTable,
      courseTitle: coursesTable.title,
      cardCount: sql<number>`count(${flashcardsTable.id}) filter (where ${flashcardsTable.status} = 'published')`,
    })
    .from(flashcardDecksTable)
    .innerJoin(
      coursesTable,
      eq(flashcardDecksTable.courseId, coursesTable.id),
    )
    .leftJoin(
      flashcardsTable,
      eq(flashcardsTable.deckId, flashcardDecksTable.id),
    )
    .where(
      and(
        eq(flashcardDecksTable.courseId, courseId),
        eq(flashcardDecksTable.status, 'published'),
      ),
    )
    .groupBy(flashcardDecksTable.id, coursesTable.title)
    .orderBy(
      asc(flashcardDecksTable.sortOrder),
      asc(flashcardDecksTable.createdAt),
    );

  return {
    data: decks.map((r) => ({
      id: r.deck.id,
      courseId: r.deck.courseId,
      courseTitle: r.courseTitle,
      title: r.deck.title,
      description: r.deck.description,
      sortOrder: r.deck.sortOrder,
      cardCount: Number(r.cardCount ?? 0),
    })),
  };
}

export default {
  due,
  syncReviews,
  stats,
  listPublishedDecksForCourse,
};
