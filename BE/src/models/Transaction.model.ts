import { transactionStatusEnum } from '@src/db/schema/transaction';
import { z } from 'zod';

export const transactionStatusSchema = z.enum(
  transactionStatusEnum.enumValues,
);

export const transactionRecordSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  txnRef: z.string(),
  amount: z.number().int().min(0),
  paymentMethod: z.string().nullable(),
  status: transactionStatusSchema,
  gatewayResponse: z.unknown().nullable().optional(),
  paidAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TransactionStatus = z.infer<typeof transactionStatusSchema>;
export type TransactionRecord = z.infer<typeof transactionRecordSchema>;

export function parseTransactionRecord(data: unknown): TransactionRecord {
  return transactionRecordSchema.parse(data);
}
