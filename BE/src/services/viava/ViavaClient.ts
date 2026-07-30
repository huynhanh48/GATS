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

function sanitizeAsciiSecret(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  // Strip BOM, zero-width chars, wrapping quotes, whitespace from .env paste noise.
  const cleaned = raw
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim();
  if (!cleaned) return undefined;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned.charCodeAt(i) > 127) return undefined;
  }
  return cleaned;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  // Optional — Viava REST currently has no Bearer gate. Skip if unset/invalid
  // so a polluted VIAVA_API_KEY (VN text, smart quotes) does not block AI gen.
  const token = sanitizeAsciiSecret(EnvVars.ViavaApiKey);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/** Filename for multipart Content-Disposition — must be ASCII for Node fetch. */
function asciiFilename(name: string | undefined): string {
  const base = (name ?? 'upload.bin').split(/[/\\]/).pop() ?? 'upload.bin';
  const ascii = base.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
  return ascii.trim() || 'upload.bin';
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
  // Viava CourseGenerateRequest via Depends() reads scalar fields as query
  // params (see viava tests). Putting Vietnamese `text` in FormData/headers
  // can trip Node fetch ByteString limits; URLSearchParams encodes UTF-8 safely.
  const params = new URLSearchParams({
    language: input.language,
    target_level: input.target_level,
    detail_level: input.detail_level,
    domain: input.domain,
    max_lessons: String(input.max_lessons ?? 1),
    exercises_per_lesson: String(input.exercises_per_lesson ?? 5),
  });

  let body: FormData | undefined;

  if (input.file) {
    body = new FormData();
    body.append('file', input.file.blob, asciiFilename(input.file.filename));
  } else if (input.file_url?.trim()) {
    params.set('file_url', input.file_url.trim());
  } else if (input.text?.trim()) {
    const text = input.text.trim();
    // Keep short text in query (matches Viava smoke tests). Long text → file
    // part so we stay under typical URL length limits.
    if (Buffer.byteLength(text, 'utf8') <= 6_000) {
      params.set('text', text);
    } else {
      body = new FormData();
      body.append(
        'file',
        new Blob([text], { type: 'text/plain;charset=UTF-8' }),
        'content.txt',
      );
    }
  }

  const path = `/course/learning-path/generate?${params.toString()}`;
  const payload = await viavaRequest(path, {
    method: 'POST',
    ...(body ? { body } : {}),
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
