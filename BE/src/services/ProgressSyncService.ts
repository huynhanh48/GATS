import { and, asc, eq, gt, or } from 'drizzle-orm';
import { z } from 'zod';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import db from '@src/db';
import { progressEventsTable } from '@src/db/schema/progress-event';
import * as LessonProgressRepo from '@src/repos/LessonProgressRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import CourseAccessService from '@src/services/CourseAccessService';
import CertificateService from '@src/services/CertificateService';

const eventSchema = z.object({
  eventId: z.string().uuid(),
  lessonId: z.string().uuid(),
  courseId: z.string().uuid().optional(),
  type: z.enum(['started', 'heartbeat', 'position', 'completed']),
  positionSeconds: z.number().int().nonnegative().optional().nullable(),
  occurredAt: z.string().datetime(),
  clientSequence: z.number().int().nonnegative().default(0),
  contentVersion: z.string().max(64).optional().nullable(),
});

const syncSchema = z.object({
  deviceId: z.string().min(1).max(128),
  events: z.array(eventSchema).min(1).max(100),
});

const POSITION_THROTTLE_MS = 12_000;

async function maybeIssueCertificate(userId: number, courseId: string) {
  try {
    const totalLessons = await LessonRepo.countByCourse(courseId);
    if (totalLessons === 0) return;
    const aggregate = await LessonProgressRepo.getCourseAggregate(
      userId,
      courseId,
      totalLessons,
    );
    if (aggregate.percent >= 100) {
      await CertificateService.issueIfEligible(userId, courseId);
    }
  } catch {
    // non-blocking
  }
}

async function applyEvent(
  userId: number,
  deviceId: string,
  event: z.infer<typeof eventSchema>,
) {
  const existingEvent = await db
    .select()
    .from(progressEventsTable)
    .where(eq(progressEventsTable.eventId, event.eventId))
    .limit(1);
  if (existingEvent[0]) {
    return { eventId: event.eventId, status: 'duplicate' as const };
  }

  const lesson = await CourseAccessService.assertLessonAccess(
    userId,
    event.lessonId,
  );
  const courseId = event.courseId ?? lesson.courseId;
  if (lesson.courseId !== courseId) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'Lesson does not belong to course',
      'COURSE_MISMATCH',
    );
  }

  const occurredAt = new Date(event.occurredAt);
  await db.insert(progressEventsTable).values({
    eventId: event.eventId,
    userId,
    deviceId,
    courseId,
    lessonId: event.lessonId,
    type: event.type,
    positionSeconds: event.positionSeconds ?? null,
    occurredAt,
    clientSequence: event.clientSequence,
    contentVersion: event.contentVersion ?? null,
  });

  const existing = await LessonProgressRepo.findByUserAndLesson(
    userId,
    event.lessonId,
  );

  if (event.type === 'completed') {
    await LessonProgressRepo.upsert({
      userId,
      courseId,
      lessonId: event.lessonId,
      videoId: existing?.videoId ?? null,
      watchedSeconds: Math.max(
        event.positionSeconds ?? 0,
        existing?.watchedSeconds ?? 0,
      ),
      durationSeconds: existing?.durationSeconds ?? lesson.duration ?? null,
      percent: 100,
      isCompleted: true,
      completedAt: existing?.completedAt ?? occurredAt,
    });
    void maybeIssueCertificate(userId, courseId);
    return { eventId: event.eventId, status: 'applied' as const };
  }

  if (existing?.isCompleted) {
    // Never regress completed
    if (
      event.positionSeconds != null &&
      event.positionSeconds > (existing.watchedSeconds ?? 0)
    ) {
      await LessonProgressRepo.upsert({
        userId,
        courseId,
        lessonId: event.lessonId,
        videoId: existing.videoId,
        watchedSeconds: event.positionSeconds,
        durationSeconds: existing.durationSeconds,
        percent: existing.percent,
        isCompleted: true,
        completedAt: existing.completedAt,
      });
    }
    return { eventId: event.eventId, status: 'applied' as const };
  }

  if (
    (event.type === 'position' || event.type === 'heartbeat') &&
    existing?.lastWatchedAt &&
    occurredAt.getTime() - existing.lastWatchedAt.getTime() <
      POSITION_THROTTLE_MS
  ) {
    return { eventId: event.eventId, status: 'throttled' as const };
  }

  const watched = Math.max(
    event.positionSeconds ?? 0,
    existing?.watchedSeconds ?? 0,
  );
  const duration = existing?.durationSeconds ?? lesson.duration ?? null;
  const percent =
    duration && duration > 0
      ? Math.min(100, Math.round((watched / duration) * 100))
      : (existing?.percent ?? 0);

  await LessonProgressRepo.upsert({
    userId,
    courseId,
    lessonId: event.lessonId,
    videoId: existing?.videoId ?? null,
    watchedSeconds: watched,
    durationSeconds: duration,
    percent: Math.max(percent, existing?.percent ?? 0),
    isCompleted: false,
    completedAt: null,
  });

  return { eventId: event.eventId, status: 'applied' as const };
}

async function sync(userId: number, body: unknown) {
  const input = syncSchema.parse(body);
  const results = [];
  for (const event of input.events) {
    results.push(await applyEvent(userId, input.deviceId, event));
  }

  const checkpoint = Buffer.from(
    JSON.stringify({
      at: new Date().toISOString(),
      lastEventId: input.events[input.events.length - 1]?.eventId,
    }),
  ).toString('base64url');

  return {
    data: {
      results,
      checkpoint,
      serverTime: new Date().toISOString(),
    },
  };
}

async function changes(userId: number, cursor?: string) {
  let sinceAt = new Date(0);
  let sinceEventId = '00000000-0000-0000-0000-000000000000';
  if (cursor) {
    try {
      const parsed = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as { at?: string; processedAt?: string; eventId?: string };
      const at = parsed.processedAt ?? parsed.at;
      if (at) sinceAt = new Date(at);
      if (parsed.eventId) sinceEventId = parsed.eventId;
    } catch {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Invalid cursor',
        'INVALID_CURSOR',
      );
    }
  }

  const rows = await db
    .select()
    .from(progressEventsTable)
    .where(
      and(
        eq(progressEventsTable.userId, userId),
        or(
          gt(progressEventsTable.processedAt, sinceAt),
          and(
            eq(progressEventsTable.processedAt, sinceAt),
            gt(progressEventsTable.eventId, sinceEventId),
          ),
        ),
      ),
    )
    .orderBy(
      asc(progressEventsTable.processedAt),
      asc(progressEventsTable.eventId),
    )
    .limit(200);

  const last = rows[rows.length - 1];
  const nextCursor = last
    ? Buffer.from(
        JSON.stringify({
          processedAt: last.processedAt.toISOString(),
          eventId: last.eventId,
          // backward-compatible alias
          at: last.processedAt.toISOString(),
        }),
      ).toString('base64url')
    : null;

  return {
    data: rows,
    meta: {
      hasMore: rows.length === 200,
      nextCursor,
      serverTime: new Date().toISOString(),
    },
  };
}

export default {
  sync,
  changes,
};
