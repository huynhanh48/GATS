import { certificateStatusEnum } from '@src/db/schema/certificate';
import { z } from 'zod';

export const certificateStatusSchema = z.enum(certificateStatusEnum.enumValues);
export type CertificateStatusInput = z.infer<typeof certificateStatusSchema>;

export const issueCertificateSchema = z.object({
  userId: z.number().int().positive(),
  courseId: z.string().uuid(),
  reason: z.string().trim().max(500).optional().nullable(),
});

export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;

export function parseIssueCertificateInput(
  data: unknown,
): IssueCertificateInput {
  return issueCertificateSchema.parse(data);
}

export const reissueCertificateSchema = z.object({
  reason: z.string().trim().max(500).optional().nullable(),
});

export type ReissueCertificateInput = z.infer<typeof reissueCertificateSchema>;

export function parseReissueCertificateInput(
  data: unknown,
): ReissueCertificateInput {
  return reissueCertificateSchema.parse(data ?? {});
}

export const certificateListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().trim().max(200).optional(),
  courseId: z.string().uuid().optional(),
});

export type CertificateListQuery = z.infer<typeof certificateListQuerySchema>;

export function parseCertificateListQuery(
  data: unknown,
): CertificateListQuery {
  return certificateListQuerySchema.parse(data);
}
