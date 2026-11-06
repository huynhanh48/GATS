import { and, asc, desc, eq } from 'drizzle-orm';

import db from '@src/db';
import {
  bankAccountsTable,
  type NewBankAccount,
} from '@src/db/schema/bank-account';
import {
  type BankAccount,
  parseBankAccount,
} from '@src/models/BankAccount.model';

function parseRow(row: unknown): BankAccount {
  return parseBankAccount(row);
}

export async function findAll(options?: {
  activeOnly?: boolean;
}): Promise<BankAccount[]> {
  const rows = options?.activeOnly
    ? await db
        .select()
        .from(bankAccountsTable)
        .where(eq(bankAccountsTable.isActive, true))
        .orderBy(desc(bankAccountsTable.isDefault), asc(bankAccountsTable.label))
    : await db
        .select()
        .from(bankAccountsTable)
        .orderBy(desc(bankAccountsTable.isDefault), asc(bankAccountsTable.label));

  return rows.map(parseRow);
}

export async function findById(id: string): Promise<BankAccount | undefined> {
  const rows = await db
    .select()
    .from(bankAccountsTable)
    .where(eq(bankAccountsTable.id, id))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findActiveDefault(): Promise<BankAccount | undefined> {
  const rows = await db
    .select()
    .from(bankAccountsTable)
    .where(
      and(
        eq(bankAccountsTable.isDefault, true),
        eq(bankAccountsTable.isActive, true),
      ),
    )
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function countActive(): Promise<number> {
  const rows = await db
    .select({ id: bankAccountsTable.id })
    .from(bankAccountsTable)
    .where(eq(bankAccountsTable.isActive, true));
  return rows.length;
}

export async function clearDefault(): Promise<void> {
  await db
    .update(bankAccountsTable)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(eq(bankAccountsTable.isDefault, true));
}

export async function create(data: NewBankAccount): Promise<BankAccount> {
  const rows = await db.insert(bankAccountsTable).values(data).returning();
  return parseRow(rows[0]);
}

export async function update(
  id: string,
  data: Partial<NewBankAccount>,
): Promise<BankAccount | undefined> {
  const rows = await db
    .update(bankAccountsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(bankAccountsTable.id, id))
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function remove(id: string): Promise<boolean> {
  const rows = await db
    .delete(bankAccountsTable)
    .where(eq(bankAccountsTable.id, id))
    .returning({ id: bankAccountsTable.id });
  return rows.length > 0;
}

export async function setDefault(id: string): Promise<BankAccount | undefined> {
  return db.transaction(async (tx) => {
    await tx
      .update(bankAccountsTable)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(bankAccountsTable.isDefault, true));

    const rows = await tx
      .update(bankAccountsTable)
      .set({
        isDefault: true,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(bankAccountsTable.id, id))
      .returning();

    return rows[0] ? parseRow(rows[0]) : undefined;
  });
}
