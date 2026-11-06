import {
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { coursesTable } from './course';
import { usersTable } from './user';

export const certificateStatusEnum = pgEnum('certificate_status', [
  'issued',
  'revoked',
]);

export const certificatesTable = pgTable(
  'certificates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    certificateNumber: varchar('certificate_number', { length: 40 }).notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id')
      .notNull()
      .references(() => coursesTable.id, { onDelete: 'cascade' }),
    status: certificateStatusEnum('status').notNull().default('issued'),
    issuedById: integer('issued_by_id').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    issuedAt: timestamp('issued_at').notNull().defaultNow(),
    revokedAt: timestamp('revoked_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_certificates_number').on(table.certificateNumber),
    uniqueIndex('idx_certificates_user_course').on(
      table.userId,
      table.courseId,
    ),
    index('idx_certificates_course').on(table.courseId),
  ],
);

export type Certificate = typeof certificatesTable.$inferSelect;
export type NewCertificate = typeof certificatesTable.$inferInsert;
export type CertificateStatus =
  (typeof certificateStatusEnum.enumValues)[number];
