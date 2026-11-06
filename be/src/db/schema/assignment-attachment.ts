import {
  bigint,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { assignmentSubmissionsTable } from './assignment-submission';

export const assignmentAttachmentsTable = pgTable(
  'assignment_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => assignmentSubmissionsTable.id, { onDelete: 'cascade' }),
    fileName: varchar('file_name', { length: 512 }).notNull(),
    storageKey: varchar('storage_key', { length: 512 }).notNull(),
    mimeType: varchar('mime_type', { length: 255 }),
    size: bigint('size', { mode: 'number' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_assignment_attachments_submission').on(table.submissionId),
  ],
);

export type AssignmentAttachment =
  typeof assignmentAttachmentsTable.$inferSelect;
export type NewAssignmentAttachment =
  typeof assignmentAttachmentsTable.$inferInsert;
