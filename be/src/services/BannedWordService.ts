import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  CreateBannedWordInput,
  UpdateBannedWordInput,
} from '@src/models/BannedWord.model';
import * as BannedWordRepo from '@src/repos/BannedWordRepo';

const Errors = {
  NOT_FOUND: 'Banned word not found',
  EXISTS: 'Từ cấm này đã tồn tại',
} as const;

const CACHE_TTL_MS = 30_000;

let cachedWords: string[] | null = null;
let cachedAt = 0;

function invalidateCache() {
  cachedWords = null;
  cachedAt = 0;
}

async function getActiveWords(): Promise<string[]> {
  const now = Date.now();
  if (cachedWords && now - cachedAt < CACHE_TTL_MS) {
    return cachedWords;
  }
  cachedWords = await BannedWordRepo.findActiveWords();
  cachedAt = now;
  return cachedWords;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replace each banned word occurrence with the same number of `*` characters.
 * Longer words are applied first to prefer phrase matches.
 */
export async function maskBannedWords(content: string): Promise<string> {
  const words = await getActiveWords();
  if (words.length === 0) return content;

  const sorted = [...words]
    .map((w) => w.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  let result = content;
  for (const word of sorted) {
    const re = new RegExp(escapeRegExp(word), 'giu');
    result = result.replace(re, (match) => '*'.repeat(match.length));
  }
  return result;
}

async function list() {
  const data = await BannedWordRepo.findAll();
  return { data };
}

async function create(input: CreateBannedWordInput) {
  const word = input.word.trim();
  const existing = await BannedWordRepo.findByWordIgnoreCase(word);
  if (existing) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.EXISTS);
  }

  const bannedWord = await BannedWordRepo.create({
    word,
    note: input.note?.trim() || null,
    isActive: input.isActive ?? true,
  });
  invalidateCache();
  return { bannedWord };
}

async function update(id: string, input: UpdateBannedWordInput) {
  const existing = await BannedWordRepo.findById(id);
  if (!existing) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }

  if (input.word !== undefined) {
    const word = input.word.trim();
    const clash = await BannedWordRepo.findByWordIgnoreCase(word);
    if (clash && clash.id !== id) {
      throw new RouteError(HttpStatusCodes.CONFLICT, Errors.EXISTS);
    }
  }

  const bannedWord = await BannedWordRepo.update(id, {
    ...(input.word !== undefined ? { word: input.word.trim() } : {}),
    ...(input.note !== undefined
      ? { note: input.note === null ? null : input.note.trim() || null }
      : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  });
  if (!bannedWord) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  invalidateCache();
  return { bannedWord };
}

async function remove(id: string) {
  const ok = await BannedWordRepo.remove(id);
  if (!ok) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.NOT_FOUND);
  }
  invalidateCache();
  return { message: 'Đã xóa từ cấm' };
}

export default {
  Errors,
  list,
  create,
  update,
  remove,
  maskBannedWords,
  invalidateCache,
};
