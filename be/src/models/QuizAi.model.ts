import { z } from 'zod';

import type { CreateQuizQuestionInput } from '@src/models/Quiz.model';

export const quizAiSourceLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export const quizAiDetailLevelSchema = z.enum([
  'concise',
  'standard',
  'detailed',
]);

/** Exercise types we can map into GATS quiz question schemas. */
export const QUIZ_COMPAT_EXERCISE_TYPES = [
  'mcq',
  'true_false',
  'fill_in_blank',
  'short_answer',
] as const;

export const quizAiExerciseTypeSchema = z.enum(QUIZ_COMPAT_EXERCISE_TYPES);

export const generateQuizAiFieldsSchema = z.object({
  language: z.string().trim().min(1).max(20).default('vi'),
  target_level: quizAiSourceLevelSchema.default('intermediate'),
  /** How many quiz-ready exercises to request (maps to exercises_per_lesson). */
  question_count: z.coerce.number().int().min(1).max(20).default(5),
  exercise_types: z
    .string()
    .optional()
    .transform((raw) => {
      if (!raw?.trim()) return [...QUIZ_COMPAT_EXERCISE_TYPES];
      return raw
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
    })
    .pipe(z.array(quizAiExerciseTypeSchema).min(1)),
  detail_level: quizAiDetailLevelSchema.default('standard'),
  shuffle_options: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => {
      if (v === undefined) return true;
      if (typeof v === 'boolean') return v;
      return v === 'true';
    }),
  max_options_per_mcq: z.coerce.number().int().min(4).max(6).default(4),
  text: z.string().optional(),
  file_url: z.string().url().optional(),
  /** When true (default), persist mapped questions onto the quiz. */
  apply: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => {
      if (v === undefined) return true;
      if (typeof v === 'boolean') return v;
      return v === 'true';
    }),
});

export type GenerateQuizAiFields = z.infer<typeof generateQuizAiFieldsSchema>;

export type MappedQuizQuestionDraft = CreateQuizQuestionInput;

export type SkippedAiExercise = {
  type: string;
  reason: string;
};

export function parseGenerateQuizAiFields(
  data: unknown,
): GenerateQuizAiFields {
  return generateQuizAiFieldsSchema.parse(data);
}
