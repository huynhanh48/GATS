import { eq } from 'drizzle-orm';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import EnvVars from '@src/common/constants/env';
import { RouteError } from '@src/common/utils/route-errors';
import db from '@src/db';
import { categoriesTable } from '@src/db/schema/category';
import { coursesTable } from '@src/db/schema/course';
import { lessonsTable } from '@src/db/schema/lesson';

export type ViavaCompatExerciseType =
  | 'mcq'
  | 'true_false'
  | 'fill_in_blank'
  | 'short_answer';

const EXERCISE_GENERATE_PATH: Record<ViavaCompatExerciseType, string> = {
  mcq: '/course/exercises/mcq/generate',
  true_false: '/course/exercises/true-false/generate',
  fill_in_blank: '/course/exercises/fill-in-blank/generate',
  short_answer: '/course/exercises/short-answer/generate',
};

const DEFAULT_TIMEOUT_MS = 180_000;

export function getViavaBaseUrl(): string | undefined {
  const base = EnvVars.ViavaCourseGenUrl?.replace(/\/$/, '');
  return base || undefined;
}

export function normalizeViavaDomain(raw: string | null | undefined): string {
  const slug = (raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'general';
}

/** Resolve RAG domain from course category.slug (fallback: general). */
export async function resolveViavaDomainFromCourseId(
  courseId: string,
): Promise<string> {
  const rows = await db
    .select({ slug: categoriesTable.slug })
    .from(coursesTable)
    .leftJoin(
      categoriesTable,
      eq(coursesTable.categoryId, categoriesTable.id),
    )
    .where(eq(coursesTable.id, courseId))
    .limit(1);
  return normalizeViavaDomain(rows[0]?.slug);
}

export async function resolveViavaDomainFromLessonId(
  lessonId: string,
): Promise<string> {
  const rows = await db
    .select({ slug: categoriesTable.slug })
    .from(lessonsTable)
    .innerJoin(coursesTable, eq(lessonsTable.courseId, coursesTable.id))
    .leftJoin(
      categoriesTable,
      eq(coursesTable.categoryId, categoriesTable.id),
    )
    .where(eq(lessonsTable.id, lessonId))
    .limit(1);
  return normalizeViavaDomain(rows[0]?.slug);
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (EnvVars.ViavaApiKey) {
    headers.Authorization = `Bearer ${EnvVars.ViavaApiKey}`;
  }
  return headers;
}

function asErrorDetail(payload: unknown, status: number): string {
  if (!payload || typeof payload !== 'object') return `HTTP ${status}`;
  const rec = payload as Record<string, unknown>;
  if (typeof rec.message === 'string' && rec.message.trim()) return rec.message;
  if (typeof rec.code === 'string' && rec.code.trim()) return rec.code;
  if (typeof rec.detail === 'string' && rec.detail.trim()) return rec.detail;
  try {
    return JSON.stringify(payload).slice(0, 300);
  } catch {
    return `HTTP ${status}`;
  }
}

function statusFromViava(httpStatus: number): HttpStatusCodes {
  if (httpStatus === 400) return HttpStatusCodes.BAD_REQUEST;
  if (httpStatus === 413) return HttpStatusCodes.PAYLOAD_TOO_LARGE;
  if (httpStatus === 422) return HttpStatusCodes.UNPROCESSABLE_ENTITY;
  return HttpStatusCodes.BAD_GATEWAY;
}

async function viavaRequest(
  path: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<unknown> {
  const base = getViavaBaseUrl();
  if (!base) {
    throw new RouteError(
      HttpStatusCodes.SERVICE_UNAVAILABLE,
      'AI quiz generation is not configured (set VIAVA_COURSE_GEN_URL)',
    );
  }

  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        ...authHeaders(),
        ...(init.headers as Record<string, string> | undefined),
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new RouteError(
      HttpStatusCodes.BAD_GATEWAY,
      `AI generation failed: ${error instanceof Error ? error.message : 'network error'}`,
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new RouteError(
      statusFromViava(response.status),
      `AI generation failed: ${asErrorDetail(payload, response.status)}`,
    );
  }
  return payload;
}

export type LearningPathGenerateInput = {
  language: string;
  target_level: string;
  detail_level: string;
  domain: string;
  max_lessons?: number;
  exercises_per_lesson?: number;
  text?: string;
  file_url?: string;
  file?: { blob: Blob; filename: string };
};

export async function generateLearningPath(
  input: LearningPathGenerateInput,
): Promise<Record<string, unknown>> {
  const form = new FormData();
  form.append('language', input.language);
  form.append('target_level', input.target_level);
  form.append('detail_level', input.detail_level);
  form.append('domain', input.domain);
  form.append('max_lessons', String(input.max_lessons ?? 1));
  form.append(
    'exercises_per_lesson',
    String(input.exercises_per_lesson ?? 5),
  );

  if (input.file) {
    form.append('file', input.file.blob, input.file.filename);
  } else if (input.file_url) {
    form.append('file_url', input.file_url);
  } else if (input.text) {
    form.append('text', input.text);
  }

  const payload = await viavaRequest('/course/learning-path/generate', {
    method: 'POST',
    body: form,
  });
  return (payload ?? {}) as Record<string, unknown>;
}

export type ExerciseGenerateInput = {
  learning_path: Record<string, unknown>;
  language: string;
  target_level: string;
  detail_level: string;
  exercises_per_lesson: number;
};

export type ExerciseGenerateResult = {
  course_title?: string;
  exercise_type?: string;
  total_exercises?: number;
  exercises: Record<string, unknown>[];
};

function toExerciseLanguage(language: string): string {
  const normalized = language.trim().toLowerCase();
  if (normalized === 'vi' || normalized === 'vn') return 'vietnamese';
  if (normalized === 'en') return 'english';
  return language;
}

export async function generateExercisesByType(
  type: ViavaCompatExerciseType,
  input: ExerciseGenerateInput,
): Promise<ExerciseGenerateResult> {
  const path = EXERCISE_GENERATE_PATH[type];
  const payload = (await viavaRequest(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      learning_path: input.learning_path,
      language: toExerciseLanguage(input.language),
      target_level: input.target_level,
      detail_level: input.detail_level,
      exercises_per_lesson: input.exercises_per_lesson,
    }),
  })) as ExerciseGenerateResult | null;

  const exercises = Array.isArray(payload?.exercises) ? payload.exercises : [];
  return {
    course_title: payload?.course_title,
    exercise_type: payload?.exercise_type ?? type,
    total_exercises: payload?.total_exercises,
    exercises: exercises as Record<string, unknown>[],
  };
}

export async function chatWithViava(options: {
  query: string;
  domains?: string[];
}): Promise<{ answer: string; references: string[] } | null> {
  const base = getViavaBaseUrl();
  if (!base) return null;

  try {
    const payload = (await viavaRequest('/course/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: options.query,
        domains: options.domains?.length ? options.domains : null,
      }),
    })) as { answer?: string; references?: string[] };

    const answer =
      typeof payload?.answer === 'string' ? payload.answer.trim() : '';
    if (!answer) return null;
    return {
      answer,
      references: Array.isArray(payload.references)
        ? payload.references.filter((r): r is string => typeof r === 'string')
        : [],
    };
  } catch {
    return null;
  }
}
