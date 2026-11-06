import { and, eq, sql } from 'drizzle-orm';

import db from '@src/db';
import {
  dailyCheckinsTable,
  userLearningStatsTable,
  xpEventsTable,
} from '@src/db/schema/mobile-experience';

function todayInTimezone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

async function ensureStats(userId: number, timezone?: string) {
  const rows = await db
    .select()
    .from(userLearningStatsTable)
    .where(eq(userLearningStatsTable.userId, userId))
    .limit(1);
  if (rows[0]) return rows[0];
  const created = await db
    .insert(userLearningStatsTable)
    .values({
      userId,
      timezone: timezone ?? 'Asia/Ho_Chi_Minh',
    })
    .returning();
  return created[0];
}

async function awardXp(input: {
  userId: number;
  sourceType: string;
  sourceId: string;
  points: number;
}) {
  try {
    await db.insert(xpEventsTable).values({
      userId: input.userId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      points: input.points,
    });
    await db
      .update(userLearningStatsTable)
      .set({
        totalXp: sql`${userLearningStatsTable.totalXp} + ${input.points}`,
        updatedAt: new Date(),
      })
      .where(eq(userLearningStatsTable.userId, input.userId));
    return true;
  } catch {
    return false;
  }
}

async function getStatus(userId: number, timezoneHeader?: string) {
  const stats = await ensureStats(userId, timezoneHeader);
  const tz = timezoneHeader || stats.timezone;
  const today = todayInTimezone(tz);
  const checkin = await db
    .select()
    .from(dailyCheckinsTable)
    .where(
      and(
        eq(dailyCheckinsTable.userId, userId),
        eq(dailyCheckinsTable.checkinDate, today),
      ),
    )
    .limit(1);

  return {
    data: {
      checkedInToday: Boolean(checkin[0]),
      checkinDate: today,
      streakDays: stats.streakDays,
      longestStreak: stats.longestStreak,
      totalXp: stats.totalXp,
      dailyGoalMinutes: stats.dailyGoalMinutes,
      timezone: tz,
    },
  };
}

async function claim(userId: number, timezoneHeader?: string) {
  const stats = await ensureStats(userId, timezoneHeader);
  const tz = timezoneHeader || stats.timezone;
  const today = todayInTimezone(tz);

  const existing = await db
    .select()
    .from(dailyCheckinsTable)
    .where(
      and(
        eq(dailyCheckinsTable.userId, userId),
        eq(dailyCheckinsTable.checkinDate, today),
      ),
    )
    .limit(1);
  if (existing[0]) {
    return getStatus(userId, tz);
  }

  const xp = 10;
  await db.insert(dailyCheckinsTable).values({
    userId,
    checkinDate: today,
    xpAwarded: xp,
  });
  await awardXp({
    userId,
    sourceType: 'daily_checkin',
    sourceId: today,
    points: xp,
  });

  const yesterday = new Date(`${today}T12:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);
  const continued = stats.lastActiveDate === yKey || stats.lastActiveDate === today;
  const streakDays = continued ? stats.streakDays + 1 : 1;

  await db
    .update(userLearningStatsTable)
    .set({
      streakDays,
      longestStreak: Math.max(stats.longestStreak, streakDays),
      lastActiveDate: today,
      timezone: tz,
      updatedAt: new Date(),
    })
    .where(eq(userLearningStatsTable.userId, userId));

  return getStatus(userId, tz);
}

export default {
  getStatus,
  claim,
  ensureStats,
  awardXp,
  todayInTimezone,
};
