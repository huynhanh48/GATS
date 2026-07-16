import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const bankAccountsTable = pgTable('bank_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  label: varchar('label', { length: 100 }).notNull(),
  bankName: varchar('bank_name', { length: 100 }).notNull(),
  /** Value used in Sepay QR `bank=` (bank name or BIN), e.g. VietinBank */
  bankCode: varchar('bank_code', { length: 50 }).notNull(),
  accountNumber: varchar('account_number', { length: 30 }).notNull(),
  accountHolder: varchar('account_holder', { length: 100 }).notNull(),
  bankBranch: varchar('bank_branch', { length: 100 }),
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type BankAccount = typeof bankAccountsTable.$inferSelect;
export type NewBankAccount = typeof bankAccountsTable.$inferInsert;
