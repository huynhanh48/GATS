import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockSelectChain,
  mockInsert,
  mockUpdate,
  mockIsEnrolled,
} = vi.hoisted(() => {
  const selectChain: Record<string, unknown> = {};
  return {
    mockSelectChain: selectChain,
    mockInsert: vi.fn(),
    mockUpdate: vi.fn(),
    mockIsEnrolled: vi.fn(),
  };
});

function chainable(result: unknown = []) {
  const api: Record<string, unknown> = {};
  const self = () => api;
  for (const m of [
    'from',
    'innerJoin',
    'leftJoin',
    'where',
    'orderBy',
    'limit',
    'groupBy',
    'returning',
    'values',
    'set',
  ]) {
    api[m] = vi.fn(self);
  }
  api.then = undefined;
  // Make thenable for await
  (api as { then?: unknown }).then = (
    resolve: (v: unknown) => unknown,
  ) => Promise.resolve(resolve(result));
  return api;
}

vi.mock('@src/db', () => ({
  default: {
    select: vi.fn(() => mockSelectChain.current ?? chainable([])),
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

vi.mock('@src/services/CourseAccessService', () => ({
  default: {
    isEnrolled: (...args: unknown[]) => mockIsEnrolled(...args),
  },
}));

import FlashcardService from '@src/services/FlashcardService';
import FlashcardAdminService from '@src/services/FlashcardAdminService';
import db from '@src/db';

describe('FlashcardService.due', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns enrolled published cards with deck/course titles', async () => {
    const rows = [
      {
        card: {
          id: 'card-1',
          deckId: 'deck-1',
          front: 'Q',
          back: 'A',
          hint: 'h',
          version: 1,
        },
        state: null,
        deck: { title: 'Deck A', courseId: 'course-1' },
        courseTitle: 'Course A',
      },
    ];
    mockSelectChain.current = chainable(rows);

    const result = await FlashcardService.due(7, 20);

    expect(db.select).toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'card-1',
      deckId: 'deck-1',
      deckTitle: 'Deck A',
      courseId: 'course-1',
      courseTitle: 'Course A',
      front: 'Q',
      back: 'A',
      hint: 'h',
    });
  });
});

describe('FlashcardService.syncReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsEnrolled.mockResolvedValue(true);
  });

  it('rejects reviews when not enrolled', async () => {
    mockIsEnrolled.mockResolvedValue(false);
    // First select: duplicate check -> []
    // Second select: assertReviewAllowed row
    let call = 0;
    vi.mocked(db.select).mockImplementation(() => {
      call += 1;
      if (call === 1) return chainable([]) as never;
      return chainable([
        {
          cardStatus: 'published',
          deckStatus: 'published',
          courseId: 'course-1',
        },
      ]) as never;
    });

    const result = await FlashcardService.syncReviews(1, {
      reviews: [
        {
          eventId: 'a1111111-1111-4111-8111-111111111111',
          cardId: 'b2222222-2222-4222-8222-222222222222',
          rating: 'good',
          occurredAt: new Date().toISOString(),
        },
      ],
    });

    expect(result.data.results[0].status).toBe('rejected');
  });
});

describe('FlashcardAdminService.archiveCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('soft-archives instead of deleting', async () => {
    const existing = {
      id: 'card-1',
      deckId: 'deck-1',
      front: 'f',
      back: 'b',
      hint: null,
      sortOrder: 0,
      status: 'published',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const archived = { ...existing, status: 'archived', version: 2 };

    let selectCall = 0;
    vi.mocked(db.select).mockImplementation(() => {
      selectCall += 1;
      return chainable([existing]) as never;
    });

    const updateChain = chainable([archived]);
    mockUpdate.mockReturnValue(updateChain);

    const result = await FlashcardAdminService.archiveCard('card-1');

    expect(mockUpdate).toHaveBeenCalled();
    expect(result.data.status).toBe('archived');
    expect(selectCall).toBeGreaterThan(0);
  });
});
