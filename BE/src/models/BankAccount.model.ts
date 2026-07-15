import { z } from 'zod';

export const bankAccountSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(100),
  bankName: z.string().min(1).max(100),
  bankCode: z.string().min(1).max(50),
  accountNumber: z.string().min(1).max(30),
  accountHolder: z.string().min(1).max(100),
  bankBranch: z.string().max(100).nullable().optional(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const bankAccountPublicSchema = bankAccountSchema.pick({
  id: true,
  label: true,
  bankName: true,
  bankCode: true,
  accountNumber: true,
  accountHolder: true,
  bankBranch: true,
  isDefault: true,
});

export const createBankAccountSchema = z.object({
  label: z.string().min(1).max(100),
  bankName: z.string().min(1).max(100),
  /** Sepay QR `bank=` — usually same as bankName (e.g. VietinBank) or BIN */
  bankCode: z.string().min(1).max(50).optional(),
  accountNumber: z.string().min(1).max(30),
  accountHolder: z.string().min(1).max(100),
  bankBranch: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateBankAccountSchema = z
  .object({
    label: z.string().min(1).max(100).optional(),
    bankName: z.string().min(1).max(100).optional(),
    bankCode: z.string().min(1).max(50).optional(),
    accountNumber: z.string().min(1).max(30).optional(),
    accountHolder: z.string().min(1).max(100).optional(),
    bankBranch: z.string().max(100).nullable().optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const listBankAccountsQuerySchema = z.object({
  activeOnly: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (typeof v === 'boolean') return v;
      return v === 'true';
    }),
});

export type BankAccount = z.infer<typeof bankAccountSchema>;
export type BankAccountPublic = z.infer<typeof bankAccountPublicSchema>;
export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;
export type ListBankAccountsQuery = z.infer<typeof listBankAccountsQuerySchema>;

/** Resolved account used for Sepay QR / transfer instructions */
export type PaymentBankAccount = {
  id: string | null;
  source: 'db' | 'env';
  label: string | null;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string | null;
  bankBranch: string | null;
};

export function parseBankAccount(data: unknown): BankAccount {
  return bankAccountSchema.parse(data);
}

export function parseBankAccountPublic(data: unknown): BankAccountPublic {
  return bankAccountPublicSchema.parse(data);
}

export function parseCreateBankAccountInput(
  data: unknown,
): CreateBankAccountInput {
  return createBankAccountSchema.parse(data);
}

export function parseUpdateBankAccountInput(
  data: unknown,
): UpdateBankAccountInput {
  return updateBankAccountSchema.parse(data);
}

export function parseListBankAccountsQuery(
  data: unknown,
): ListBankAccountsQuery {
  return listBankAccountsQuerySchema.parse(data);
}
