import { and, eq, gte, isNotNull } from 'drizzle-orm';

import db from '@src/db';
import { quizAttemptsTable } from '@src/db/schema/quiz-attempt';
import { progressEventsTable } from '@src/db/schema/progress-event';
import {
  flashcardReviewEventsTable,
  xpEventsTable,
} from '@src/db/schema/mobile-experience';
import DailyCheckinService from '@src/services/DailyCheckinService';

function resolveTimezone(timezone?: string): string {
  const candidate = timezone?.trim() || 'Asia/Ho_Chi_Minh';
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: candidate });
    return candidate;
  } catch {
    return 'Asia/Ho_Chi_Minh';
  }
}

function dateKeyInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function weekdayLabelInTimezone(date: Date, timezone: string): string {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  }).format(date);
  // Map en short → VN labels used by mobile charts
  switch (weekday) {
    case 'Mon':
      return 'T2';
    case 'Tue':
      return 'T3';
    case 'Wed':
      return 'T4';
    case 'Thu':
      return 'T5';
    case 'Fri':
      return 'T6';
    case 'Sat':
      return 'T7';
    default:
      return 'CN';
  }
}

function startOfDayUtcApprox(dateKey: string, timezone: string): Date {
  // Noon UTC on the calendar day is a stable pivot; then shift by finding
  // the earliest instant that formats as dateKey in the user timezone.
  const probe = new Date(`${dateKey}T12:00:00.000Z`);
  for (let hour = -14; hour <= 14; hour++) {
    const candidate = new Date(probe.getTime() + hour * 60 * 60 * 1000);
    if (dateKeyInTimezone(candidate, timezone) === dateKey) {
      // Walk back to first hour of that local day
      let cursor = candidate;
      for (let i = 0; i < 48; i++) {
        const prev = new Date(cursor.getTime() - 30 * 60 * 1000);
        if (dateKeyInTimezone(prev, timezone) !== dateKey) break;
        cursor = prev;
      }
      return cursor;
    }
  }
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function lastNDayKeys(n: number, timezone: string, now = new Date()): string[] {
  const todayKey = dateKeyInTimezone(now, timezone);
  const keys: string[] = [];
  // Walk back using UTC noon pivots so DST/timezone edges stay stable.
  let cursor = new Date(`${todayKey}T12:00:00.000Z`);
  for (let i = 0; i < n; i++) {
    const key = dateKeyInTimezone(cursor, timezone);
    keys.unshift(key);
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }
  // Ensure uniqueness / length when timezone walk collides
  const unique = [...new Set(keys)];
  while (unique.length < n) {
    const first = unique[0];
    const prev = new Date(`${first}T12:00:00.000Z`);
    prev.setUTCDate(prev.getUTCDate() - 1);
    unique.unshift(dateKeyInTimezone(prev, timezone));
  }
  return unique.slice(-n);
}

function estimateMinutesFromEvents(
  events: Array<{
    lessonId: string;
    type: string;
    positionSeconds: number | null;
    occurredAt: Date;
  }>,
  timezone: string,
): Map<string, number> {
  const secondsByDay = new Map<string, number>();
  const lastPosByLesson = new Map<string, number>();

  const sorted = [...events].sort(
    (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
  );

  for (const event of sorted) {
    const day = dateKeyInTimezone(event.occurredAt, timezone);
    const pos = event.positionSeconds ?? 0;
    const prev = lastPosByLesson.get(event.lessonId);

    let delta = 0;
    if (prev == null) {
      // First sighting: count a small slice of position for completed/heartbeat
      if (event.type === 'completed' || event.type === 'heartbeat') {
        delta = Math.min(pos, 120);
      } else if (event.type === 'position' && pos > 0) {
        delta = Math.min(pos, 60);
      }
    } else if (pos > prev) {
      delta = Math.min(pos - prev, 30 * 60); // cap jump at 30 min
    }

    if (delta > 0) {
      secondsByDay.set(day, (secondsByDay.get(day) ?? 0) + delta);
    }
    if (pos > 0 || event.type === 'completed') {
      lastPosByLesson.set(event.lessonId, Math.max(prev ?? 0, pos));
    }
  }

  const minutesByDay = new Map<string, number>();
  for (const [day, seconds] of secondsByDay) {
    minutesByDay.set(day, Math.min(480, Math.round(seconds / 60)));
  }
  return minutesByDay;
}

async function getCharts(
  userId: number,
  timezoneHeader?: string,
  days = 7,
) {
  const dayCount = Math.min(30, Math.max(1, days));
  const stats = await DailyCheckinService.ensureStats(userId, timezoneHeader);
  const timezone = resolveTimezone(timezoneHeader || stats.timezone);
  const dayKeys = lastNDayKeys(dayCount, timezone);
  const since = startOfDayUtcApprox(dayKeys[0], timezone);

  const [progressRows, xpRows, flashcardRows, quizRows] = await Promise.all([
    db
      .select({
        lessonId: progressEventsTable.lessonId,
        type: progressEventsTable.type,
        positionSeconds: progressEventsTable.positionSeconds,
        occurredAt: progressEventsTable.occurredAt,
      })
      .from(progressEventsTable)
      .where(
        and(
          eq(progressEventsTable.userId, userId),
          gte(progressEventsTable.occurredAt, since),
        ),
      ),
    db
      .select({
        points: xpEventsTable.points,
        occurredAt: xpEventsTable.occurredAt,
        sourceType: xpEventsTable.sourceType,
      })
      .from(xpEventsTable)
      .where(
        and(
          eq(xpEventsTable.userId, userId),
          gte(xpEventsTable.occurredAt, since),
        ),
      ),
    db
      .select({
        occurredAt: flashcardReviewEventsTable.occurredAt,
      })
      .from(flashcardReviewEventsTable)
      .where(
        and(
          eq(flashcardReviewEventsTable.userId, userId),
          gte(flashcardReviewEventsTable.occurredAt, since),
        ),
      ),
    db
      .select({
        submittedAt: quizAttemptsTable.submittedAt,
        createdAt: quizAttemptsTable.createdAt,
      })
      .from(quizAttemptsTable)
      .where(
        and(
          eq(quizAttemptsTable.userId, userId),
          isNotNull(quizAttemptsTable.submittedAt),
          gte(quizAttemptsTable.submittedAt, since),
        ),
      ),
  ]);

  const minutesByDay = estimateMinutesFromEvents(progressRows, timezone);

  // Flashcard reviews ≈ 20s each → ~1 minute per 3 cards
  const fcCountByDay = new Map<string, number>();
  for (const row of flashcardRows) {
    const day = dateKeyInTimezone(row.occurredAt, timezone);
    fcCountByDay.set(day, (fcCountByDay.get(day) ?? 0) + 1);
  }
  for (const [day, count] of fcCountByDay) {
    const added = Math.ceil(count / 3);
    minutesByDay.set(
      day,
      Math.min(480, (minutesByDay.get(day) ?? 0) + added),
    );
  }

  const xpByDay = new Map<string, number>();
  for (const row of xpRows) {
    const day = dateKeyInTimezone(row.occurredAt, timezone);
    xpByDay.set(day, (xpByDay.get(day) ?? 0) + row.points);
  }

  const lessonsCompleted = progressRows.filter((e) => e.type === 'completed')
    .length;
  const flashcards = flashcardRows.length;
  const quizzes = quizRows.length;

  const chartDays = dayKeys.map((date) => {
    const noon = new Date(`${date}T12:00:00.000Z`);
    return {
      date,
      label: weekdayLabelInTimezone(noon, timezone),
      minutes: minutesByDay.get(date) ?? 0,
      xp: xpByDay.get(date) ?? 0,
    };
  });

  return {
    data: {
      totalXp: stats.totalXp,
      streakDays: stats.streakDays,
      dailyGoalMinutes: stats.dailyGoalMinutes,
      timezone,
      days: chartDays,
      activityMix: {
        lessons: lessonsCompleted,
        flashcards,
        quiz: quizzes,
        coach: 0,
      },
    },
  };
}

export default {
  getCharts,
  resolveTimezone,
  dateKeyInTimezone,
};
