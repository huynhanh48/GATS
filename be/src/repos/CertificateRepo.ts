import { and, count, desc, eq, ilike, or } from 'drizzle-orm';

import db from '@src/db';
import {
  certificatesTable,
  type Certificate,
  type NewCertificate,
} from '@src/db/schema/certificate';
import { coursesTable } from '@src/db/schema/course';
import { usersTable } from '@src/db/schema/user';

export async function create(data: NewCertificate): Promise<Certificate> {
  const rows = await db.insert(certificatesTable).values(data).returning();
  return rows[0];
}

export async function findById(id: string): Promise<Certificate | undefined> {
  const rows = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.id, id))
    .limit(1);
  return rows[0];
}

export async function findByNumber(
  certificateNumber: string,
): Promise<Certificate | undefined> {
  const rows = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.certificateNumber, certificateNumber))
    .limit(1);
  return rows[0];
}

export async function findByUserAndCourse(
  userId: number,
  courseId: string,
): Promise<Certificate | undefined> {
  const rows = await db
    .select()
    .from(certificatesTable)
    .where(
      and(
        eq(certificatesTable.userId, userId),
        eq(certificatesTable.courseId, courseId),
      ),
    )
    .limit(1);
  return rows[0];
}

export async function listByUser(userId: number): Promise<Certificate[]> {
  return db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.userId, userId))
    .orderBy(desc(certificatesTable.issuedAt));
}

export type CertificateListRow = Certificate & {
  userName: string | null;
  userEmail: string | null;
  courseTitle: string | null;
};

export async function listAdmin(options: {
  skip?: number;
  take?: number;
  q?: string;
  courseId?: string;
}): Promise<{ data: CertificateListRow[]; total: number }> {
  const skip = Math.max(0, options.skip ?? 0);
  const take = Math.min(100, Math.max(1, options.take ?? 20));

  const conditions = [];
  if (options.courseId) {
    conditions.push(eq(certificatesTable.courseId, options.courseId));
  }
  if (options.q?.trim()) {
    const term = `%${options.q.trim()}%`;
    conditions.push(
      or(
        ilike(certificatesTable.certificateNumber, term),
        ilike(usersTable.userName, term),
        ilike(usersTable.email, term),
        ilike(coursesTable.title, term),
      ),
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const base = db
    .select({
      cert: certificatesTable,
      userName: usersTable.userName,
      userEmail: usersTable.email,
      courseTitle: coursesTable.title,
    })
    .from(certificatesTable)
    .leftJoin(usersTable, eq(certificatesTable.userId, usersTable.id))
    .leftJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id));

  const countBase = db
    .select({ value: count() })
    .from(certificatesTable)
    .leftJoin(usersTable, eq(certificatesTable.userId, usersTable.id))
    .leftJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id));

  const [rows, totalRow] = await Promise.all([
    (where ? base.where(where) : base)
      .orderBy(desc(certificatesTable.issuedAt))
      .limit(take)
      .offset(skip),
    where ? countBase.where(where) : countBase,
  ]);

  return {
    data: rows.map((row) => ({
      ...row.cert,
      userName: row.userName,
      userEmail: row.userEmail,
      courseTitle: row.courseTitle,
    })),
    total: Number(totalRow[0]?.value ?? 0),
  };
}

export async function revoke(id: string): Promise<Certificate | undefined> {
  const rows = await db
    .update(certificatesTable)
    .set({ status: 'revoked', revokedAt: new Date(), updatedAt: new Date() })
    .where(eq(certificatesTable.id, id))
    .returning();
  return rows[0];
}

/** Re-activate a revoked row with a new certificate number (same user+course). */
export async function reissue(
  id: string,
  data: {
    certificateNumber: string;
    issuedById: number | null;
  },
): Promise<Certificate | undefined> {
  const now = new Date();
  const rows = await db
    .update(certificatesTable)
    .set({
      certificateNumber: data.certificateNumber,
      status: 'issued',
      issuedAt: now,
      revokedAt: null,
      issuedById: data.issuedById,
      updatedAt: now,
    })
    .where(eq(certificatesTable.id, id))
    .returning();
  return rows[0];
}

export type { Certificate };
