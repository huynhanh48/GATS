import { z } from 'zod';

import db from '@src/db';
import { recommendationEventsTable } from '@src/db/schema/mobile-experience';

const trackSchema = z.object({
  eventType: z.enum(['impression', 'click', 'enroll', 'dismiss']),
  courseId: z.string().uuid().optional().nullable(),
  deviceId: z.string().max(128).optional().nullable(),
  algorithmVersion: z.string().max(32).optional().nullable(),
  meta: z.record(z.string(), z.unknown()).optional().nullable(),
});

async function track(userId: number | null | undefined, body: unknown) {
  const input = trackSchema.parse(body);
  const rows = await db
    .insert(recommendationEventsTable)
    .values({
      userId: userId ?? null,
      deviceId: input.deviceId ?? null,
      courseId: input.courseId ?? null,
      eventType: input.eventType,
      algorithmVersion: input.algorithmVersion ?? 'onboarding-v1',
      meta: input.meta ?? null,
    })
    .returning();
  return { data: rows[0] };
}

async function trackImpressions(
  userId: number | undefined,
  courseIds: string[],
  algorithmVersion = 'onboarding-v1',
) {
  if (courseIds.length === 0) return;
  await db.insert(recommendationEventsTable).values(
    courseIds.map((courseId) => ({
      userId: userId ?? null,
      courseId,
      eventType: 'impression',
      algorithmVersion,
    })),
  );
}

export default { track, trackImpressions };
