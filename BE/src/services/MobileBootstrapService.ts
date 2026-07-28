import { and, count, desc, eq, isNull, or } from 'drizzle-orm';

import db from '@src/db';
import { cartItemsTable, cartsTable } from '@src/db/schema/cart';
import { courseEnrollmentsTable } from '@src/db/schema/enrollment';
import { lessonProgressTable } from '@src/db/schema/lesson-progress';
import { notificationsTable } from '@src/db/schema/notification';
import AuthService from '@src/services/AuthService';
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
  const [result] = await db
    .select({ total: count() })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.isRead, false),
        or(
          eq(notificationsTable.userId, userId),
          isNull(notificationsTable.userId),
        ),
      ),
    );
  return Number(result?.total ?? 0);
}

async function cartSummary(userId: number) {
  const cart = await db
    .select()
    .from(cartsTable)
    .where(eq(cartsTable.userId, userId))
    .limit(1);
  if (!cart[0]) return { itemCount: 0, total: 0 };
  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.cartId, cart[0].id));
  return {
    itemCount: items.length,
    total: 0,
  };
}

async function bootstrap(userId: number, timezone?: string) {
  const [user, continueLearning, daily, notifications, cart] =
    await Promise.all([
      AuthService.me(userId).catch(() => null),
      getContinueLearning(userId).catch(() => null),
      DailyCheckinService.getStatus(userId, timezone)
        .then((r) => r.data)
        .catch(() => null),
      unreadCount(userId).catch(() => 0),
      cartSummary(userId).catch(() => ({ itemCount: 0, total: 0 })),
    ]);

  return {
    data: {
      serverTime: new Date().toISOString(),
      user,
      continueLearning,
      daily: daily
        ? {
            goalMinutes: daily.dailyGoalMinutes,
            completedMinutes: 0,
            streak: daily.streakDays,
            checkedInToday: daily.checkedInToday,
            totalXp: daily.totalXp,
          }
        : null,
      notifications: { unreadCount: notifications },
      cart,
      featureFlags: {
        progressSync: true,
        pushNotifications: true,
        flashcards: true,
        appleLogin: Boolean(EnvVars.AppleClientId),
      },
      minSupportedVersion: {
        android: '1.0.0',
        ios: '1.0.0',
      },
    },
    meta: {
      requestId: undefined as string | undefined,
      serverTime: new Date().toISOString(),
    },
  };
}

export default { bootstrap };
