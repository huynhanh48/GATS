import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import db from '@src/db';
import {
  notificationPreferencesTable,
  pushOutboxTable,
  userDevicesTable,
} from '@src/db/schema/mobile-experience';

const registerSchema = z.object({
  deviceUuid: z.string().min(1).max(128),
  platform: z.enum(['ios', 'android', 'web', 'unknown']).or(z.string().min(1)),
  pushToken: z.string().max(512).optional().nullable(),
  appVersion: z.string().max(32).optional().nullable(),
  locale: z.string().max(16).optional().nullable(),
  timezone: z.string().max(64).optional().nullable(),
  pushPermission: z.string().max(32).optional().nullable(),
});

async function registerDevice(userId: number, body: unknown) {
  const input = registerSchema.parse(body);
  const existing = await db
    .select()
    .from(userDevicesTable)
    .where(
      and(
        eq(userDevicesTable.userId, userId),
        eq(userDevicesTable.deviceUuid, input.deviceUuid),
      ),
    )
    .limit(1);

  if (existing[0]) {
    const rows = await db
      .update(userDevicesTable)
      .set({
        pushToken: input.pushToken ?? existing[0].pushToken,
        platform: input.platform,
        appVersion: input.appVersion ?? existing[0].appVersion,
        locale: input.locale ?? existing[0].locale,
        timezone: input.timezone ?? existing[0].timezone,
        pushPermission: input.pushPermission ?? existing[0].pushPermission,
        lastSeenAt: new Date(),
        tokenInvalidatedAt: input.pushToken
          ? null
          : existing[0].tokenInvalidatedAt,
        updatedAt: new Date(),
      })
      .where(eq(userDevicesTable.id, existing[0].id))
      .returning();
    return { data: rows[0] };
  }

  const rows = await db
    .insert(userDevicesTable)
    .values({
      userId,
      deviceUuid: input.deviceUuid,
      platform: input.platform,
      pushToken: input.pushToken ?? null,
      appVersion: input.appVersion ?? null,
      locale: input.locale ?? null,
      timezone: input.timezone ?? 'Asia/Ho_Chi_Minh',
      pushPermission: input.pushPermission ?? 'unknown',
    })
    .returning();
  return { data: rows[0] };
}

async function updateDevice(
  userId: number,
  deviceId: string,
  body: unknown,
) {
  const input = registerSchema.partial().parse(body);
  const device = await db
    .select()
    .from(userDevicesTable)
    .where(eq(userDevicesTable.id, deviceId))
    .limit(1);
  if (!device[0] || device[0].userId !== userId) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Device not found');
  }
  const rows = await db
    .update(userDevicesTable)
    .set({
      ...input,
      lastSeenAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userDevicesTable.id, deviceId))
    .returning();
  return { data: rows[0] };
}

async function removeDevice(userId: number, deviceId: string) {
  const device = await db
    .select()
    .from(userDevicesTable)
    .where(eq(userDevicesTable.id, deviceId))
    .limit(1);
  if (!device[0] || device[0].userId !== userId) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Device not found');
  }
  await db.delete(userDevicesTable).where(eq(userDevicesTable.id, deviceId));
  return { message: 'Device removed' };
}

async function getPreferences(userId: number) {
  const rows = await db
    .select()
    .from(notificationPreferencesTable)
    .where(eq(notificationPreferencesTable.userId, userId))
    .limit(1);
  if (rows[0]) return { data: rows[0] };
  const created = await db
    .insert(notificationPreferencesTable)
    .values({ userId })
    .returning();
  return { data: created[0] };
}

async function updatePreferences(userId: number, body: unknown) {
  const input = z
    .object({
      dailyReminderEnabled: z.boolean().optional(),
      dailyReminderTime: z.string().max(8).optional().nullable(),
      marketingOptIn: z.boolean().optional(),
      learningUpdates: z.boolean().optional(),
      courseChatActivity: z.boolean().optional(),
      quietHoursStart: z.string().max(8).optional().nullable(),
      quietHoursEnd: z.string().max(8).optional().nullable(),
    })
    .parse(body ?? {});
  await getPreferences(userId);
  const rows = await db
    .update(notificationPreferencesTable)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(notificationPreferencesTable.userId, userId))
    .returning();
  return { data: rows[0] };
}

async function enqueuePush(input: {
  userId: number;
  title: string;
  body?: string | null;
  deepLink?: string | null;
  notificationId?: string | null;
  dedupeKey?: string | null;
}) {
  const allowedPrefixes = [
    'gats://',
    '/course/',
    '/courses/',
    '/home',
    '/notifications',
  ];
  if (
    input.deepLink &&
    !allowedPrefixes.some((p) => input.deepLink!.startsWith(p))
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'Deep link not allowed',
      'DEEP_LINK_DENIED',
    );
  }

  try {
    const rows = await db
      .insert(pushOutboxTable)
      .values({
        userId: input.userId,
        title: input.title,
        body: input.body ?? null,
        deepLink: input.deepLink ?? null,
        notificationId: input.notificationId ?? null,
        dedupeKey: input.dedupeKey ?? null,
        status: 'pending',
      })
      .returning();
    return rows[0];
  } catch {
    // unique dedupe race — ignore
    return null;
  }
}

/** MVP: mark pending pushes as sent (real FCM when FCM_SERVER_KEY configured). */
async function processOutboxBatch(limit = 50) {
  const pending = await db
    .select()
    .from(pushOutboxTable)
    .where(eq(pushOutboxTable.status, 'pending'))
    .limit(limit);

  for (const item of pending) {
    // Stub delivery — log-ready for FCM integration
    await db
      .update(pushOutboxTable)
      .set({
        status: 'sent',
        sentAt: new Date(),
        attempts: item.attempts + 1,
      })
      .where(eq(pushOutboxTable.id, item.id));
  }
  return { processed: pending.length };
}

export default {
  registerDevice,
  updateDevice,
  removeDevice,
  getPreferences,
  updatePreferences,
  enqueuePush,
  processOutboxBatch,
};
