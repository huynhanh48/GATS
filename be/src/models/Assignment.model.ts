import { assignmentSubmissionStatusEnum } from '@src/db/schema/assignment-submission';
import { z } from 'zod';

export const assignmentSubmissionTypeSchema = z.enum(['text', 'url', 'file']);

export const assignmentSubmissionStatusSchema = z.enum(
  assignmentSubmissionStatusEnum.enumValues,
);

export const createAssignmentSchema = z.object({
  title: z.string().optional(),
  due_at: z.coerce.date().optional(),
  max_score: z.number().min(0).default(100),
  max_file_size_mb: z.number().int().min(1).optional(),
  allowed_submission_types: z
    .array(assignmentSubmissionTypeSchema)
    .min(1)
    .default(['text', 'url', 'file']),
  late_submission_allowed: z.boolean().default(false),
  max_submissions: z.number().int().min(1).default(1),
  passing_score: z.number().min(0).max(100).default(70),
});

export const updateAssignmentSchema = createAssignmentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const submitAssignmentSchema = z.object({
  text_content: z.string().optional(),
  url: z.string().url().optional(),
});

export const gradeAssignmentSubmissionSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().optional(),
});

export const initAssignmentUploadSchema = z.object({
  file_name: z.string().min(1).max(512),
  content_type: z.string().min(1).max(255),
  size: z.number().int().min(1),
});

export const completeAssignmentUploadSchema = z.object({
  file_name: z.string().min(1).max(512),
  storage_key: z.string().min(1).max(512),
  mime_type: z.string().max(255).optional(),
  size: z.number().int().min(1).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
export type GradeAssignmentSubmissionInput = z.infer<
  typeof gradeAssignmentSubmissionSchema
>;
export type InitAssignmentUploadInput = z.infer<
  typeof initAssignmentUploadSchema
>;
export type CompleteAssignmentUploadInput = z.infer<
  typeof completeAssignmentUploadSchema
>;

export function parseCreateAssignmentInput(
  body: unknown,
): CreateAssignmentInput {
  return createAssignmentSchema.parse(body);
}

export function parseUpdateAssignmentInput(
  body: unknown,
): UpdateAssignmentInput {
  return updateAssignmentSchema.parse(body);
}

export function parseSubmitAssignmentInput(
  body: unknown,
): SubmitAssignmentInput {
  return submitAssignmentSchema.parse(body);
}

export function parseGradeAssignmentSubmissionInput(
  body: unknown,
): GradeAssignmentSubmissionInput {
  return gradeAssignmentSubmissionSchema.parse(body);
}

export function parseInitAssignmentUploadInput(
  body: unknown,
): InitAssignmentUploadInput {
  return initAssignmentUploadSchema.parse(body);
}

export function parseCompleteAssignmentUploadInput(
  body: unknown,
): CompleteAssignmentUploadInput {
  return completeAssignmentUploadSchema.parse(body);
}

export function serializeAllowedSubmissionTypes(types: string[]): string {
  return JSON.stringify(types);
}

export function parseAllowedSubmissionTypes(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return ['text', 'url', 'file'];
    }
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return ['text', 'url', 'file'];
  }
}
