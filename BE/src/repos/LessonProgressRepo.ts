import { and, count, eq, sql } from 'drizzle-orm';

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
}> {
  if (totalLessons === 0) {
    return { completedLessons: 0, totalLessons: 0, percent: 0 };
  }

  const [result] = await db
    .select({
      completed: count(
        sql`CASE WHEN ${lessonProgressTable.isCompleted} = true THEN 1 END`,
      ),
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

  return { completedLessons, totalLessons, percent };
}
