import { eq } from 'drizzle-orm';

import db from '@src/db';
import {
  transactionsTable,
  type NewTransaction,
  type TransactionStatus,
} from '@src/db/schema/transaction';
import {
  parseTransactionRecord,
  type TransactionRecord,
} from '@src/models/Transaction.model';

function parseRow(row: unknown): TransactionRecord {
  return parseTransactionRecord(row);
}

export async function create(
  data: NewTransaction,
): Promise<TransactionRecord> {
  const rows = await db.insert(transactionsTable).values(data).returning();
  return parseRow(rows[0]);
}

export async function findById(
  id: string,
): Promise<TransactionRecord | undefined> {
  const rows = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.id, id))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findByOrderId(
  orderId: string,
): Promise<TransactionRecord | undefined> {
  const rows = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.orderId, orderId))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function findByTxnRef(
  txnRef: string,
): Promise<TransactionRecord | undefined> {
  const rows = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.txnRef, txnRef))
    .limit(1);
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function updateByTxnRef(
  txnRef: string,
  data: Partial<{
    status: TransactionStatus;
    gatewayResponse: unknown;
    paidAt: Date | null;
    paymentMethod: string | null;
  }>,
): Promise<TransactionRecord | undefined> {
  const rows = await db
    .update(transactionsTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(transactionsTable.txnRef, txnRef))
    .returning();
  return rows[0] ? parseRow(rows[0]) : undefined;
}

export async function markSuccess(
  txnRef: string,
  gatewayResponse?: unknown,
): Promise<TransactionRecord | undefined> {
  return updateByTxnRef(txnRef, {
    status: 'success',
    paidAt: new Date(),
    gatewayResponse: gatewayResponse ?? null,
  });
}
