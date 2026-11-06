import { and, desc, eq, gte, sql } from 'drizzle-orm';

import db from '@src/db';
import { courseEnrollmentsTable } from '@src/db/schema/enrollment';
import { lessonProgressTable } from '@src/db/schema/lesson-progress';
import * as NotificationRepo from '@src/repos/NotificationRepo';
import AuthService from '@src/services/AuthService';
import CartService from '@src/services/CartService';
import DailyCheckinService from '@src/services/DailyCheckinService';
import EnvVars from '@src/common/constants/env';

async function getContinueLearning(userId: number) {
  const rows = await db
    .select({
      courseId: lessonProgressTable.courseId,
      lessonId: lessonProgressTable.lessonId,
      percent: lessonProgressTable.percent,
      watchedSeconds: lessonProgressTable.watchedSeconds,
      isCompleted: lessonProgressTable.isCompleted,
      lastWatchedAt: lessonProgressTable.lastWatchedAt,
    })
    .from(lessonProgressTable)
    .innerJoin(
      courseEnrollmentsTable,
      and(
        eq(courseEnrollmentsTable.courseId, lessonProgressTable.courseId),
        eq(courseEnrollmentsTable.userId, userId),
        eq(courseEnrollmentsTable.status, 'active'),
      ),
    )
    .where(
      and(
        eq(lessonProgressTable.userId, userId),
        eq(lessonProgressTable.isCompleted, false),
      ),
    )
    .orderBy(desc(lessonProgressTable.lastWatchedAt))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return {
    courseId: row.courseId,
    lessonId: row.lessonId,
    progress: row.percent / 100,
    resumePositionSeconds: row.watchedSeconds,
  };
}

async function unreadCount(userId: number) {
  return NotificationRepo.countUnreadForUser(userId, true);
}

async function cartSummary(userId: number) {
  const cart = await CartService.getCart(userId);
  return {
    itemCount: cart.itemCount,
    total: cart.totalAmount,
  };
}

/** Sum watched seconds today (user timezone) → minutes. */
async function completedMinutesToday(userId: number, timezone?: string) {
  const tz = timezone && timezone.length > 0 ? timezone : 'Asia/Ho_Chi_Minh';
  const [row] = await db
    .select({
      seconds: sql<number>`coalesce(sum(${lessonProgressTable.watchedSeconds}), 0)`,
    })
    .from(lessonProgressTable)
    .where(
      and(
        eq(lessonProgressTable.userId, userId),
        gte(
          lessonProgressTable.lastWatchedAt,
          sql`(date_trunc('day', now() AT TIME ZONE ${tz}) AT TIME ZONE ${tz})`,
        ),
      ),
    );
  return Math.floor(Number(row?.seconds ?? 0) / 60);
}

function parseFlags(): Record<string, boolean> {
  const raw = EnvVars.MobileFeatureFlags;
  const defaults: Record<string, boolean> = {
    progressSync: true,
    pushNotifications: true,
    flashcards: true,
    appleLogin: Boolean(EnvVars.AppleClientId),
  };
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'boolean') defaults[k] = v;
    }
  } catch {
    // keep defaults
  }
  return defaults;
}

async function bootstrap(userId: number, timezone?: string) {
  const [user, continueLearning, daily, notifications, cart, completedMinutes] =
    await Promise.all([
      AuthService.me(userId).catch(() => null),
      getContinueLearning(userId).catch(() => null),
      DailyCheckinService.getStatus(userId, timezone)
        .then((r) => r.data)
        .catch(() => null),
      unreadCount(userId).catch(() => 0),
      cartSummary(userId).catch(() => ({ itemCount: 0, total: 0 })),
      completedMinutesToday(userId, timezone).catch(() => 0),
    ]);

  return {
    data: {
      serverTime: new Date().toISOString(),
      user,
      continueLearning,
      daily: daily
        ? {
            goalMinutes: daily.dailyGoalMinutes,
            completedMinutes,
            streak: daily.streakDays,
            checkedInToday: daily.checkedInToday,
            totalXp: daily.totalXp,
          }
        : null,
      notifications: { unreadCount: notifications },
      cart,
      featureFlags: parseFlags(),
      minSupportedVersion: {
        android: EnvVars.MobileMinAndroidVersion,
        ios: EnvVars.MobileMinIosVersion,
      },
    },
    meta: {
      requestId: undefined as string | undefined,
      serverTime: new Date().toISOString(),
    },
  };
}

export default { bootstrap };
