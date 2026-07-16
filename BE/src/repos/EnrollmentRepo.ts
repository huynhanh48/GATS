import { and, count, eq, gt, isNull, or } from 'drizzle-orm';

import db from '@src/db';
import {
  courseEnrollmentsTable,
  type EnrollmentSource,
  type EnrollmentStatus,
  type NewCourseEnrollment,
} from '@src/db/schema/enrollment';
import {
  type EnrollmentRecord,
  enrollmentRecordSchema,
} from '@src/models/Enrollment.model';

function parseRow(row: unknown): EnrollmentRecord {
  return enrollmentRecordSchema.parse(row);
}

function activeEnrollmentCondition(userId: number, courseId: string) {
  const now = new Date();
  return and(
    eq(courseEnrollmentsTable.userId, userId),
    eq(courseEnrollmentsTable.courseId, courseId),
    eq(courseEnrollmentsTable.status, 'active'),
    or(
      isNull(courseEnrollmentsTable.expiredAt),
      gt(courseEnrollmentsTable.expiredAt, now),
    ),
  );
}

function activeEnrollmentByCourseCondition(courseId: string) {
  const now = new Date();
  return and(
    eq(courseEnrollmentsTable.courseId, courseId),
    eq(courseEnrollmentsTable.status, 'active'),
    or(
      isNull(courseEnrollmentsTable.expiredAt),
      gt(courseEnrollmentsTable.expiredAt, now),
    ),
  );
}

export async function findByUserAndCourse(
  userId: number,
  courseId: string,
): Promise<EnrollmentRecord | undefined> {
  const rows = await db
    .select()
    .from(courseEnrollmentsTable)
    .where(
      and(
        eq(courseEnrollmentsTable.userId, userId),
        eq(courseEnrollmentsTable.courseId, courseId),
      ),
    )
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findActive(
  userId: number,
  courseId: string,
): Promise<EnrollmentRecord | undefined> {
  const rows = await db
    .select()
    .from(courseEnrollmentsTable)
    .where(activeEnrollmentCondition(userId, courseId))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function isActiveEnrolled(
  userId: number,
  courseId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: courseEnrollmentsTable.id })
    .from(courseEnrollmentsTable)
    .where(activeEnrollmentCondition(userId, courseId))
    .limit(1);
  return rows.length > 0;
}

export async function countActiveByCourse(courseId: string): Promise<number> {
  const [result] = await db
    .select({ total: count() })
    .from(courseEnrollmentsTable)
    .where(activeEnrollmentByCourseCondition(courseId));
  return Number(result?.total ?? 0);
}

export async function listByCourse(
  courseId: string,
): Promise<EnrollmentRecord[]> {
  const rows = await db
    .select()
    .from(courseEnrollmentsTable)
    .where(eq(courseEnrollmentsTable.courseId, courseId))
    .orderBy(courseEnrollmentsTable.enrolledAt);
  return rows.map(parseRow);
}

export async function listByUser(userId: number): Promise<EnrollmentRecord[]> {
  const rows = await db
    .select()
    .from(courseEnrollmentsTable)
    .where(eq(courseEnrollmentsTable.userId, userId))
    .orderBy(courseEnrollmentsTable.enrolledAt);
  return rows.map(parseRow);
}

export async function upsert(
  data: NewCourseEnrollment,
): Promise<EnrollmentRecord> {
  const rows = await db
    .insert(courseEnrollmentsTable)
    .values(data)
    .onConflictDoUpdate({
      target: [
        courseEnrollmentsTable.userId,
        courseEnrollmentsTable.courseId,
      ],
      set: {
        source: data.source,
        status: data.status ?? 'active',
        expiredAt: data.expiredAt ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();
  return parseRow(rows[0]);
}

export async function updateByUserAndCourse(
  userId: number,
  courseId: string,
  data: { status?: EnrollmentStatus; expiredAt?: Date | null },
): Promise<EnrollmentRecord | undefined> {
  const rows = await db
    .update(courseEnrollmentsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(courseEnrollmentsTable.userId, userId),
        eq(courseEnrollmentsTable.courseId, courseId),
      ),
    )
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function grant(
  userId: number,
  courseId: string,
  source: EnrollmentSource,
  expiredAt?: Date | null,
): Promise<EnrollmentRecord> {
  return upsert({
    userId,
    courseId,
    source,
    status: 'active',
    expiredAt: expiredAt ?? null,
  });
}
