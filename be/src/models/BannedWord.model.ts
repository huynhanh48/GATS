import { z } from 'zod';

export const bannedWordSchema = z.object({
  id: z.string().uuid(),
  word: z.string().min(1).max(100),
  isActive: z.boolean(),
  note: z.string().max(255).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createBannedWordSchema = z.object({
  word: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .refine((v) => !/\s{2,}/.test(v), {
      message: 'Word must not contain consecutive spaces',
    }),
  note: z.string().trim().max(255).optional(),
  isActive: z.boolean().optional(),
});

export const updateBannedWordSchema = z
  .object({
    word: z.string().trim().min(1).max(100).optional(),
    note: z.string().trim().max(255).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type BannedWord = z.infer<typeof bannedWordSchema>;
export type CreateBannedWordInput = z.infer<typeof createBannedWordSchema>;
export type UpdateBannedWordInput = z.infer<typeof updateBannedWordSchema>;

export function parseBannedWord(data: unknown): BannedWord {
  return bannedWordSchema.parse(data);
}

export function parseCreateBannedWordInput(
  data: unknown,
): CreateBannedWordInput {
  return createBannedWordSchema.parse(data);
}

export function parseUpdateBannedWordInput(
  data: unknown,
): UpdateBannedWordInput {
  return updateBannedWordSchema.parse(data);
}
