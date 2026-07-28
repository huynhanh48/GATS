import { unlink } from 'fs/promises';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars from '@src/common/constants/env';
import { RouteError } from '@src/common/utils/route-errors';
import {
  type GenerateQuizAiFields,
  type MappedQuizQuestionDraft,
  type SkippedAiExercise,
  QUIZ_COMPAT_EXERCISE_TYPES,
} from '@src/models/QuizAi.model';
import * as QuizQuestionRepo from '@src/repos/QuizQuestionRepo';
import * as QuizRepo from '@src/repos/QuizRepo';

const Errors = {
  NOT_CONFIGURED:
    'AI quiz generation is not configured (set VIAVA_COURSE_GEN_URL)',
  QUIZ_NOT_FOUND: 'Quiz not found',
  NO_INPUT: 'Provide exactly one of: file, file_url, or text',
  MULTIPLE_INPUTS: 'Provide only one of: file, file_url, or text',
  GENERATION_FAILED: 'AI generation failed',
  EMPTY_RESULT: 'AI returned no mappable quiz questions',
} as const;

type UploadedAiFile = {
  path: string;
  originalname: string;
  mimetype: string;
};

type ViavaExercise = Record<string, unknown>;

type ViavaGenerateResponse = {
  learning_path?: { course_title?: string };
  exercise_suite?: {
    course_title?: string;
    total_exercises?: number;
    exercises?: ViavaExercise[];
  };
};

function letterToIndex(letter: string): number | null {
  const ch = letter.trim().toUpperCase();
  if (ch.length === 1 && ch >= 'A' && ch <= 'Z') {
    return ch.charCodeAt(0) - 65;
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        const rec = item as Record<string, unknown>;
        return (
          asString(rec.text) ??
          asString(rec.label) ??
          asString(rec.content) ??
          asString(rec.answer) ??
          asString(rec.value)
        );
      }
      return asString(item);
    })
    .filter((v): v is string => Boolean(v));
}

function mapMcq(ex: ViavaExercise): MappedQuizQuestionDraft | null {
  const question =
    asString(ex.question) ?? asString(ex.prompt) ?? asString(ex.statement);
  if (!question) return null;

  const options = asStringArray(ex.options);
  if (options.length < 2) return null;

  const correctRaw =
    asString(ex.correct_answer) ??
    asString(ex.correctAnswer) ??
    asString(ex.answer);

  let correctIndexes: number[] = [];
  if (correctRaw) {
    const byLetter = letterToIndex(correctRaw);
    if (byLetter != null && byLetter < options.length) {
      correctIndexes = [byLetter];
    } else {
      const idx = options.findIndex(
        (opt) => opt.toLowerCase() === correctRaw.toLowerCase(),
      );
      if (idx >= 0) correctIndexes = [idx];
    }
  }

  if (Array.isArray(ex.correct_answers)) {
    correctIndexes = asStringArray(ex.correct_answers)
      .map((raw) => {
        const byLetter = letterToIndex(raw);
        if (byLetter != null) return byLetter;
        return options.findIndex(
          (opt) => opt.toLowerCase() === raw.toLowerCase(),
        );
      })
      .filter((i) => i >= 0);
  }

  if (correctIndexes.length === 0) {
    // Fallback: first option marked correct so Zod validation can pass after review
    correctIndexes = [0];
  }

  const uniqueCorrect = [...new Set(correctIndexes)];
  const type =
    uniqueCorrect.length >= 2 ? 'multiple_choice' : 'single_choice';

  // multiple_choice requires ≥2 correct — if only one, keep single_choice
  const finalType =
    type === 'multiple_choice' && uniqueCorrect.length < 2
      ? 'single_choice'
      : type === 'multiple_choice'
        ? 'multiple_choice'
        : 'single_choice';

  const answers = options.map((opt, i) => ({
    answer: opt,
    isCorrect: uniqueCorrect.includes(i),
  }));

  if (finalType === 'single_choice') {
    const firstCorrect = answers.findIndex((a) => a.isCorrect);
    answers.forEach((a, i) => {
      a.isCorrect = i === (firstCorrect >= 0 ? firstCorrect : 0);
    });
  }

  return {
    type: finalType,
    question,
    explanation: asString(ex.explanation) ?? asString(ex.rationale),
    points: 1,
    isRequired: true,
    caseSensitive: false,
    answers,
  };
}

function mapTrueFalse(ex: ViavaExercise): MappedQuizQuestionDraft | null {
  const statement =
    asString(ex.statement) ?? asString(ex.question) ?? asString(ex.prompt);
  if (!statement) return null;

  const isTrue =
    typeof ex.is_true === 'boolean'
      ? ex.is_true
      : typeof ex.isTrue === 'boolean'
        ? ex.isTrue
        : asString(ex.correct_answer)?.toLowerCase() === 'true';

  return {
    type: 'single_choice',
    question: statement,
    explanation: asString(ex.explanation),
    points: 1,
    isRequired: true,
    caseSensitive: false,
    answers: [
      { answer: 'Đúng', isCorrect: isTrue === true },
      { answer: 'Sai', isCorrect: isTrue !== true },
    ],
  };
}

function mapFillBlank(ex: ViavaExercise): MappedQuizQuestionDraft | null {
  const text =
    asString(ex.text) ?? asString(ex.question) ?? asString(ex.prompt);
  if (!text) return null;

  const blanks = Array.isArray(ex.blanks) ? ex.blanks : [];
  const answersFromBlanks = blanks
    .map((blank) => {
      if (typeof blank === 'string') return blank.trim();
      if (blank && typeof blank === 'object') {
        const rec = blank as Record<string, unknown>;
        return (
          asString(rec.answer) ??
          asString(rec.content) ??
          asString(rec.value) ??
          asString(rec.text)
        );
      }
      return null;
    })
    .filter((v): v is string => Boolean(v));

  const answers = (
    answersFromBlanks.length > 0
      ? answersFromBlanks
      : asStringArray(ex.answers).length > 0
        ? asStringArray(ex.answers)
        : asStringArray(ex.keywords)
  ).map((answer) => ({ answer, isCorrect: true }));

  if (answers.length === 0) return null;

  return {
    type: 'fill_blank',
    question: text,
    explanation: asString(ex.explanation),
    points: 1,
    isRequired: true,
    caseSensitive: false,
    answers,
  };
}

function mapShortAnswer(ex: ViavaExercise): MappedQuizQuestionDraft | null {
  const question =
    asString(ex.question) ?? asString(ex.prompt) ?? asString(ex.statement);
  if (!question) return null;

  const keywords = asStringArray(ex.keywords);
  const single =
    asString(ex.correct_answer) ??
    asString(ex.answer) ??
    asString(ex.expected_answer);

  const answers = (
    keywords.length > 0 ? keywords : single ? [single] : []
  ).map((answer) => ({ answer, isCorrect: true }));

  if (answers.length === 0) return null;

  return {
    type: 'fill_blank',
    question,
    explanation: asString(ex.explanation),
    points: 1,
    isRequired: true,
    caseSensitive: false,
    answers,
  };
}

export function mapViavaExercisesToQuizQuestions(exercises: ViavaExercise[]): {
  questions: MappedQuizQuestionDraft[];
  skipped: SkippedAiExercise[];
} {
  const questions: MappedQuizQuestionDraft[] = [];
  const skipped: SkippedAiExercise[] = [];

  for (const ex of exercises) {
    const type = asString(ex.type)?.toLowerCase() ?? 'unknown';

    let mapped: MappedQuizQuestionDraft | null = null;
    if (type === 'mcq') mapped = mapMcq(ex);
    else if (type === 'true_false') mapped = mapTrueFalse(ex);
    else if (type === 'fill_in_blank') mapped = mapFillBlank(ex);
    else if (type === 'short_answer') mapped = mapShortAnswer(ex);
    else {
      skipped.push({
        type,
        reason: 'Loại bài tập chưa hỗ trợ trong quiz GATS',
      });
      continue;
    }

    if (!mapped) {
      skipped.push({
        type,
        reason: 'Không map được sang schema quiz (thiếu câu hỏi/đáp án)',
      });
      continue;
    }

    questions.push(mapped);
  }

  return { questions, skipped };
}

async function callViavaGenerate(options: {
  fields: GenerateQuizAiFields;
  file?: UploadedAiFile;
}): Promise<ViavaGenerateResponse> {
  const base = EnvVars.ViavaCourseGenUrl?.replace(/\/$/, '');
  if (!base) {
    throw new RouteError(HttpStatusCodes.SERVICE_UNAVAILABLE, Errors.NOT_CONFIGURED);
  }

  const path = EnvVars.ViavaCourseGenPath.startsWith('/')
    ? EnvVars.ViavaCourseGenPath
    : `/${EnvVars.ViavaCourseGenPath}`;
  const url = `${base}${path}`;

  const form = new FormData();
  form.append('language', options.fields.language);
  form.append('target_level', options.fields.target_level);
  form.append('max_lessons', '1');
  form.append('exercises_per_lesson', String(options.fields.question_count));
  form.append(
    'exercise_types',
    options.fields.exercise_types.join(','),
  );
  form.append('detail_level', options.fields.detail_level);
  form.append('include_coding', 'false');
  form.append('shuffle_options', String(options.fields.shuffle_options));
  form.append('max_options_per_mcq', String(options.fields.max_options_per_mcq));

  const hasFile = Boolean(options.file);
  const hasUrl = Boolean(options.fields.file_url?.trim());
  const hasText = Boolean(options.fields.text?.trim());
  const inputCount = [hasFile, hasUrl, hasText].filter(Boolean).length;

  if (inputCount === 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.NO_INPUT);
  }
  if (inputCount > 1) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.MULTIPLE_INPUTS);
  }

  if (options.file) {
    const blob = await fileToBlob(options.file);
    form.append('file', blob, options.file.originalname);
  } else if (options.fields.file_url) {
    form.append('file_url', options.fields.file_url);
  } else if (options.fields.text) {
    form.append('text', options.fields.text);
  }

  const headers: Record<string, string> = {};
  if (EnvVars.ViavaApiKey) {
    headers.Authorization = `Bearer ${EnvVars.ViavaApiKey}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: form,
      signal: AbortSignal.timeout(180_000),
    });
  } catch (error) {
    throw new RouteError(
      HttpStatusCodes.BAD_GATEWAY,
      `${Errors.GENERATION_FAILED}: ${error instanceof Error ? error.message : 'network error'}`,
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | ViavaGenerateResponse
    | { detail?: unknown; message?: string; code?: string }
    | null;

  if (!response.ok) {
    const detail =
      payload && typeof payload === 'object'
        ? asString((payload as { message?: unknown }).message) ??
          asString((payload as { code?: unknown }).code) ??
          JSON.stringify(payload).slice(0, 300)
        : `HTTP ${response.status}`;
    const status =
      response.status === 400
        ? HttpStatusCodes.BAD_REQUEST
        : response.status === 413
          ? HttpStatusCodes.PAYLOAD_TOO_LARGE
          : response.status === 422
            ? HttpStatusCodes.UNPROCESSABLE_ENTITY
            : HttpStatusCodes.BAD_GATEWAY;
    throw new RouteError(status, `${Errors.GENERATION_FAILED}: ${detail}`);
  }

  return (payload ?? {}) as ViavaGenerateResponse;
}

async function fileToBlob(file: UploadedAiFile): Promise<Blob> {
  const { readFile } = await import('fs/promises');
  const buf = await readFile(file.path);
  return new Blob([new Uint8Array(buf)], {
    type: file.mimetype || 'application/octet-stream',
  });
}

async function generateForQuiz(
  quizId: string,
  fields: GenerateQuizAiFields,
  file?: UploadedAiFile,
) {
  const quiz = await QuizRepo.findById(quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }

  let remote: ViavaGenerateResponse;
  try {
    remote = await callViavaGenerate({ fields, file });
  } finally {
    if (file?.path) {
      await unlink(file.path).catch(() => undefined);
    }
  }

  const exercises = remote.exercise_suite?.exercises ?? [];
  const { questions, skipped } = mapViavaExercisesToQuizQuestions(exercises);

  if (questions.length === 0) {
    throw new RouteError(HttpStatusCodes.UNPROCESSABLE_ENTITY, Errors.EMPTY_RESULT);
  }

  const created: Awaited<
    ReturnType<typeof QuizQuestionRepo.createQuestionWithAnswers>
  >[] = [];

  if (fields.apply) {
    for (const draft of questions) {
      const saved = await QuizQuestionRepo.createQuestionWithAnswers({
        quizId,
        type: draft.type,
        question: draft.question,
        description: draft.description ?? null,
        explanation: draft.explanation ?? null,
        points: draft.points,
        isRequired: draft.isRequired,
        caseSensitive: draft.caseSensitive,
        answers: draft.answers,
      });
      created.push(saved);
    }
  }

  return {
    data: {
      course_title:
        remote.exercise_suite?.course_title ??
        remote.learning_path?.course_title ??
        null,
      question_count: questions.length,
      skipped_count: skipped.length,
      skipped,
      questions: fields.apply ? created : questions,
      applied: fields.apply,
      supported_exercise_types: QUIZ_COMPAT_EXERCISE_TYPES,
    },
    message: fields.apply
      ? `Đã thêm ${created.length} câu hỏi AI vào quiz`
      : `Đã sinh ${questions.length} câu hỏi (chưa lưu)`,
  };
}

export default {
  Errors,
  generateForQuiz,
  mapViavaExercisesToQuizQuestions,
};
