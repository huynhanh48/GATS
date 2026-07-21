import { and, count, eq, inArray, max, sql } from 'drizzle-orm';

import db from '@src/db';
import { lessonProgressTable } from '@src/db/schema/lesson-progress';
import {
  type LessonProgressRecord,
  lessonProgressRecordSchema,
} from '@src/models/LessonProgress.model';

function parseRow(row: unknown): LessonProgressRecord {
  return lessonProgressRecordSchema.parse(row);
}

export async function findByUserAndLesson(
  userId: number,
  lessonId: string,
): Promise<LessonProgressRecord | undefined> {
  const rows = await db
    .select()
    .from(lessonProgressTable)
    .where(
      and(
        eq(lessonProgressTable.userId, userId),
        eq(lessonProgressTable.lessonId, lessonId),
      ),
    )
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function listByUserAndCourse(
  userId: number,
  courseId: string,
): Promise<LessonProgressRecord[]> {
  const rows = await db
    .select()
    .from(lessonProgressTable)
    .where(
      and(
        eq(lessonProgressTable.userId, userId),
        eq(lessonProgressTable.courseId, courseId),
      ),
    );
  return rows.map(parseRow);
}

export async function upsert(data: {
  userId: number;
  courseId: string;
  lessonId: string;
  videoId?: string | null;
  watchedSeconds: number;
  durationSeconds?: number | null;
  percent: number;
  isCompleted: boolean;
  completedAt?: Date | null;
}): Promise<LessonProgressRecord> {
  const now = new Date();
  const rows = await db
    .insert(lessonProgressTable)
    .values({
      userId: data.userId,
      courseId: data.courseId,
      lessonId: data.lessonId,
      videoId: data.videoId ?? null,
      watchedSeconds: data.watchedSeconds,
      durationSeconds: data.durationSeconds ?? null,
      percent: data.percent,
      isCompleted: data.isCompleted,
      completedAt: data.isCompleted ? (data.completedAt ?? now) : null,
      lastWatchedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [lessonProgressTable.userId, lessonProgressTable.lessonId],
      set: {
        videoId: data.videoId ?? null,
        watchedSeconds: data.watchedSeconds,
        durationSeconds: data.durationSeconds ?? null,
        percent: data.percent,
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? (data.completedAt ?? now) : null,
        lastWatchedAt: now,
        updatedAt: now,
      },
    })
    .returning();
  return parseRow(rows[0]);
}

export async function upsertQuizSummary(data: {
  userId: number;
  courseId: string;
  lessonId: string;
  bestScore: number;
  bestPercentage: number;
  isPassed: boolean;
  attemptCount: number;
  isCompleted: boolean;
  completedAt?: Date | null;
}): Promise<LessonProgressRecord> {
  const now = new Date();
  const rows = await db
    .insert(lessonProgressTable)
    .values({
      userId: data.userId,
      courseId: data.courseId,
      lessonId: data.lessonId,
      watchedSeconds: 0,
      percent: Math.round(data.bestPercentage),
      isCompleted: data.isCompleted,
      completedAt: data.isCompleted ? (data.completedAt ?? now) : null,
      bestScore: data.bestScore,
      bestPercentage: data.bestPercentage,
      isPassed: data.isPassed,
      attemptCount: data.attemptCount,
      lastWatchedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [lessonProgressTable.userId, lessonProgressTable.lessonId],
      set: {
        bestScore: data.bestScore,
        bestPercentage: data.bestPercentage,
        isPassed: data.isPassed,
        attemptCount: data.attemptCount,
        percent: Math.round(data.bestPercentage),
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? (data.completedAt ?? now) : null,
        updatedAt: now,
      },
    })
    .returning();
  return parseRow(rows[0]);
}

export async function getCourseAggregate(
  userId: number,
  courseId: string,
  totalLessons: number,
): Promise<{
  completedLessons: number;
  totalLessons: number;
  percent: number;
  lastActivityAt: Date | null;
}> {
  if (totalLessons === 0) {
    return {
      completedLessons: 0,
      totalLessons: 0,
      percent: 0,
      lastActivityAt: null,
    };
  }

  const [result] = await db
    .select({
      completed: count(
        sql`CASE WHEN ${lessonProgressTable.isCompleted} = true THEN 1 END`,
      ),
      lastActivityAt: max(lessonProgressTable.lastWatchedAt),
    })
    .from(lessonProgressTable)
    .where(
      and(
        eq(lessonProgressTable.userId, userId),
        eq(lessonProgressTable.courseId, courseId),
      ),
    );

  const completedLessons = Number(result?.completed ?? 0);
  const percent = Math.round((completedLessons / totalLessons) * 100);

  return {
    completedLessons,
    totalLessons,
    percent,
    lastActivityAt: result?.lastActivityAt ?? null,
  };
}

export async function getCourseAggregateByUsers(
  courseId: string,
  userIds: number[],
  totalLessons: number,
): Promise<
  Map<
    number,
    {
      completedLessons: number;
      totalLessons: number;
      percent: number;
      lastActivityAt: Date | null;
    }
  >
> {
  const result = new Map<
    number,
    {
      completedLessons: number;
      totalLessons: number;
      percent: number;
      lastActivityAt: Date | null;
    }
  >();

  if (userIds.length === 0) return result;

  for (const userId of userIds) {
    result.set(userId, {
      completedLessons: 0,
      totalLessons,
      percent: 0,
      lastActivityAt: null,
    });
  }

  if (totalLessons === 0) return result;

  const rows = await db
    .select({
      userId: lessonProgressTable.userId,
      completed: count(
        sql`CASE WHEN ${lessonProgressTable.isCompleted} = true THEN 1 END`,
      ),
      lastActivityAt: max(lessonProgressTable.lastWatchedAt),
    })
    .from(lessonProgressTable)
    .where(
      and(
        eq(lessonProgressTable.courseId, courseId),
        inArray(lessonProgressTable.userId, userIds),
      ),
    )
    .groupBy(lessonProgressTable.userId);

  for (const row of rows) {
    const completedLessons = Number(row.completed ?? 0);
    result.set(row.userId, {
      completedLessons,
      totalLessons,
      percent: Math.round((completedLessons / totalLessons) * 100),
      lastActivityAt: row.lastActivityAt ?? null,
    });
  }

  return result;
}

export async function deleteByUserAndLesson(
  userId: number,
  lessonId: string,
): Promise<void> {
  await db
    .delete(lessonProgressTable)
    .where(
      and(
        eq(lessonProgressTable.userId, userId),
        eq(lessonProgressTable.lessonId, lessonId),
      ),
    );
}
