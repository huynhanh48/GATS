import { z } from 'zod';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { quizAttemptStatusEnum } from '@src/db/schema/quiz';
import { quizQuestionTypeEnum } from '@src/db/schema/quiz-question';

export const quizQuestionTypeSchema = z.enum(quizQuestionTypeEnum.enumValues);
export const quizAttemptStatusSchema = z.enum(quizAttemptStatusEnum.enumValues);

const answerInputSchema = z.object({
  answer: z.string().trim().min(1),
  isCorrect: z.boolean().default(false),
});

const questionBaseSchema = z.object({
  question: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  explanation: z.string().nullable().optional(),
  points: z.number().min(0).default(1),
  isRequired: z.boolean().default(true),
  caseSensitive: z.boolean().default(false),
  answers: z.array(answerInputSchema),
});

export const singleChoiceQuestionInputSchema = questionBaseSchema
  .extend({
    type: z.literal('single_choice'),
  })
  .superRefine((data, ctx) => {
    if (data.answers.length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['answers'],
        message: 'single_choice must have at least 2 answers',
      });
    }

    const correctCount = data.answers.filter(
      (answer) => answer.isCorrect,
    ).length;
    if (correctCount !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['answers'],
        message: 'single_choice must have exactly 1 correct answer',
      });
    }

    addDuplicateAnswerIssues(data.answers, false, ctx);
  });

export const multipleChoiceQuestionInputSchema = questionBaseSchema
  .extend({
    type: z.literal('multiple_choice'),
  })
  .superRefine((data, ctx) => {
    if (data.answers.length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['answers'],
        message: 'multiple_choice must have at least 2 answers',
      });
    }

    const correctCount = data.answers.filter(
      (answer) => answer.isCorrect,
    ).length;
    if (correctCount < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['answers'],
        message: 'multiple_choice must have at least 2 correct answers',
      });
    }

    addDuplicateAnswerIssues(data.answers, false, ctx);
  });

export const fillBlankQuestionInputSchema = questionBaseSchema
  .extend({
    type: z.literal('fill_blank'),
  })
  .superRefine((data, ctx) => {
    if (data.answers.length < 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['answers'],
        message: 'fill_blank must have at least 1 accepted answer',
      });
    }

    if (data.answers.some((answer) => !answer.isCorrect)) {
      ctx.addIssue({
        code: 'custom',
        path: ['answers'],
        message: 'fill_blank answers must all be correct',
      });
    }

    addDuplicateAnswerIssues(data.answers, data.caseSensitive, ctx);
  });

export const quizQuestionInputSchema = z.discriminatedUnion('type', [
  singleChoiceQuestionInputSchema,
  multipleChoiceQuestionInputSchema,
  fillBlankQuestionInputSchema,
]);

export const createQuizQuestionSchema = quizQuestionInputSchema;
export const updateQuizQuestionSchema = quizQuestionInputSchema;

export const createQuizSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  passing_score: z.number().min(0).max(100).default(70),
  time_limit: z.number().int().min(1).optional(),
  max_attempts: z.number().int().min(1).default(1),
  shuffle_questions: z.boolean().default(false),
  shuffle_options: z.boolean().default(false),
  show_result: z.boolean().default(true),
  show_correct_answer: z.boolean().default(false),
  show_explanation: z.boolean().default(true),
  available_from: z.coerce.date().optional(),
  available_until: z.coerce.date().optional(),
});

export const updateQuizSchema = createQuizSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const reorderQuestionsSchema = z.object({
  questionIds: z.array(z.string().uuid()).min(1),
});

const legacyReorderQuestionsSchema = z.object({
  question_ids: z.array(z.string().uuid()).min(1),
});

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedAnswerId: z.string().uuid().optional(),
      textAnswer: z.string().optional(),
    }),
  ),
});

export const saveQuizAnswerSchema = z.object({
  selected_option_ids: z.array(z.string().uuid()).optional(),
  text_answer: z.string().optional(),
});

export const gradeEssayAnswerSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().optional(),
  is_correct: z.boolean().optional(),
});

export type QuizQuestionInput = z.infer<typeof quizQuestionInputSchema>;
export type QuizAnswerInput = z.infer<typeof answerInputSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type CreateQuizQuestionInput = z.infer<typeof createQuizQuestionSchema>;
export type UpdateQuizQuestionInput = z.infer<typeof updateQuizQuestionSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
export type SaveQuizAnswerInput = z.infer<typeof saveQuizAnswerSchema>;
export type GradeEssayAnswerInput = z.infer<typeof gradeEssayAnswerSchema>;

export function parseCreateQuizInput(body: unknown): CreateQuizInput {
  return createQuizSchema.parse(body);
}

export function parseUpdateQuizInput(body: unknown): UpdateQuizInput {
  return updateQuizSchema.parse(body);
}

type UnknownRecord = Record<string, unknown>;

function pickFirst<T>(...values: T[]): T | undefined {
  return values.find((value) => value !== undefined);
}

function toInternalChoiceAnswer(item: unknown): unknown {
  if (!item || typeof item !== 'object') return item;
  const option = item as UnknownRecord;
  return {
    answer: pickFirst(option.answer, option.content),
    isCorrect: pickFirst(option.isCorrect, option.is_correct) ?? false,
  };
}

function toInternalAcceptedAnswer(item: unknown): unknown {
  if (!item || typeof item !== 'object') return item;
  const accepted = item as UnknownRecord;
  return {
    answer: pickFirst(accepted.answer, accepted.content),
    isCorrect: true,
  };
}

/**
 * The admin dashboard sends questions in its own contract
 * (title/options/accepted_answers with snake_case flags). Map that payload to
 * the internal quiz-question shape while keeping backward compatibility with
 * the canonical shape (question/answers).
 */
function normalizeQuizQuestionPayload(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const raw = body as UnknownRecord;

  const isFrontendShape =
    'title' in raw || 'options' in raw || 'accepted_answers' in raw;
  if (!isFrontendShape) return raw;

  const base = {
    question: pickFirst(raw.question, raw.title),
    description: raw.description ?? null,
    explanation: raw.explanation ?? null,
    points: raw.points,
    isRequired: pickFirst(raw.isRequired, raw.is_required),
  };

  switch (raw.type) {
    case 'single_choice':
    case 'multiple_choice': {
      const options = Array.isArray(raw.options) ? raw.options : raw.answers;
      return {
        ...base,
        type: raw.type,
        answers: Array.isArray(options)
          ? options.map(toInternalChoiceAnswer)
          : options,
      };
    }
    case 'fill_blank':
    case 'short_answer': {
      const accepted = Array.isArray(raw.accepted_answers)
        ? raw.accepted_answers
        : raw.answers;
      const caseSensitive =
        pickFirst(raw.caseSensitive, raw.case_sensitive) ??
        (Array.isArray(accepted)
          ? accepted.some(
              (item) =>
                !!item &&
                typeof item === 'object' &&
                (item as UnknownRecord).is_exact === true,
            )
          : false);
      return {
        ...base,
        type: 'fill_blank',
        caseSensitive,
        answers: Array.isArray(accepted)
          ? accepted.map(toInternalAcceptedAnswer)
          : accepted,
      };
    }
    default:
      throw new RouteError(
        HttpStatusCodes.UNPROCESSABLE_ENTITY,
        `Loại câu hỏi "${String(raw.type)}" chưa được hỗ trợ`,
      );
  }
}

export function parseCreateQuizQuestionInput(
  body: unknown,
): CreateQuizQuestionInput {
  return createQuizQuestionSchema.parse(normalizeQuizQuestionPayload(body));
}

export function parseUpdateQuizQuestionInput(
  body: unknown,
): UpdateQuizQuestionInput {
  return updateQuizQuestionSchema.parse(normalizeQuizQuestionPayload(body));
}

export function parseReorderQuestionsInput(body: unknown): {
  questionIds: string[];
} {
  const modern = reorderQuestionsSchema.safeParse(body);
  if (modern.success) return modern.data;

  const legacy = legacyReorderQuestionsSchema.parse(body);
  return { questionIds: legacy.question_ids };
}

export function parseSubmitQuizInput(body: unknown): SubmitQuizInput {
  return submitQuizSchema.parse(body);
}

export function parseSaveQuizAnswerInput(body: unknown): SaveQuizAnswerInput {
  return saveQuizAnswerSchema.parse(body);
}

export function parseGradeEssayAnswerInput(
  body: unknown,
): GradeEssayAnswerInput {
  return gradeEssayAnswerSchema.parse(body);
}

export function normalizeFillBlankAnswer(
  value: string,
  caseSensitive: boolean,
): string {
  // Mobile keyboards may produce Vietnamese text in decomposed Unicode form
  // (for example, a base letter followed by combining marks). Normalize both
  // submitted and accepted answers before comparing them so visually identical
  // text is graded identically across devices.
  const normalized = value.normalize('NFC').trim().replace(/\s+/gu, ' ');
  return caseSensitive ? normalized : normalized.toLocaleLowerCase('vi-VN');
}

export function normalizeAnswer(value: string): string {
  return normalizeFillBlankAnswer(value, false);
}

export function validateQuestion(question: QuizQuestionInput): void {
  const parsed = quizQuestionInputSchema.safeParse(question);
  if (!parsed.success) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      parsed.error.issues[0]?.message ?? 'Invalid quiz question',
    );
  }
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function addDuplicateAnswerIssues(
  answers: QuizAnswerInput[],
  caseSensitive: boolean,
  ctx: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  for (const [index, item] of answers.entries()) {
    const normalized = normalizeFillBlankAnswer(item.answer, caseSensitive);
    if (seen.has(normalized)) {
      ctx.addIssue({
        code: 'custom',
        path: ['answers', index, 'answer'],
        message: 'Nội dung đáp án không được trùng nhau',
      });
    }
    seen.add(normalized);
  }
}
