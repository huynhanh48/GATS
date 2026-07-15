import { describe, expect, it } from 'vitest';

import type { QuizQuestionAnswer } from '@src/db/schema/quiz-question-answer';
import type { QuizQuestion } from '@src/db/schema/quiz-question';
import {
  normalizeFillBlankAnswer,
  parseCreateQuizQuestionInput,
} from '@src/models/Quiz.model';
import {
  computeAttemptTotals,
  gradeFillBlankQuestion,
  gradeSingleChoiceQuestion,
} from '@src/services/QuizGradingService';

const baseQuestion = {
  id: 'q1',
  quizId: 'quiz1',
  question: 'Test',
  description: null,
  explanation: null,
  points: 2,
  order: 0,
  isRequired: true,
  caseSensitive: false,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies Omit<QuizQuestion, 'type'>;

function answer(
  id: string,
  value: string,
  isCorrect: boolean,
  order: number,
  type: QuizQuestion['type'] = 'single_choice',
): QuizQuestionAnswer {
  return {
    id,
    questionId: 'q1',
    answer: value,
    isCorrect,
    type,
    order,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('normalizeFillBlankAnswer', () => {
  it('trims, lowercases with vi-VN locale and collapses whitespace', () => {
    expect(normalizeFillBlankAnswer('  Sống   Ở  ', false)).toBe('sống ở');
  });

  it('keeps case when caseSensitive is true', () => {
    expect(normalizeFillBlankAnswer('  Sống   Ở  ', true)).toBe('Sống Ở');
  });
});

describe('quiz question validation', () => {
  const validSingleChoice = {
    type: 'single_choice',
    question: 'RAG là gì?',
    answers: [
      { answer: 'Retrieval-Augmented Generation', isCorrect: true },
      { answer: 'Random AI Generator', isCorrect: false },
      { answer: 'Realtime API Gateway', isCorrect: false },
      { answer: 'Remote Agent Graph', isCorrect: false },
    ],
  } as const;

  it('accepts single_choice with 4 answers and 1 correct answer', () => {
    expect(parseCreateQuizQuestionInput(validSingleChoice).answers).toHaveLength(4);
  });

  it('accepts single_choice with 2 answers and 1 correct answer', () => {
    expect(
      parseCreateQuizQuestionInput({
        ...validSingleChoice,
        answers: validSingleChoice.answers.slice(0, 2),
      }).answers,
    ).toHaveLength(2);
  });

  it('rejects single_choice with fewer than 2 answers', () => {
    expect(() =>
      parseCreateQuizQuestionInput({
        ...validSingleChoice,
        answers: validSingleChoice.answers.slice(0, 1),
      }),
    ).toThrow();
  });

  it('accepts the admin dashboard payload shape (title/options)', () => {
    const parsed = parseCreateQuizQuestionInput({
      type: 'single_choice',
      title: 'RAG là gì?',
      explanation: 'Rag khá là oke',
      points: 1,
      order: 0,
      options: [
        { content: 'Retrieval-Augmented Generation', is_correct: true, order: 0 },
        { content: 'Random AI Generator', is_correct: false, order: 1 },
        { content: 'Realtime API Gateway', is_correct: false, order: 2 },
        { content: 'Remote Agent Graph', is_correct: false, order: 3 },
      ],
    });
    expect(parsed.question).toBe('RAG là gì?');
    expect(parsed.answers).toHaveLength(4);
    expect(parsed.answers[0]).toEqual({
      answer: 'Retrieval-Augmented Generation',
      isCorrect: true,
    });
  });

  it('rejects single_choice with 2 correct answers', () => {
    expect(() =>
      parseCreateQuizQuestionInput({
        ...validSingleChoice,
        answers: [
          { answer: 'A', isCorrect: true },
          { answer: 'B', isCorrect: true },
          { answer: 'C', isCorrect: false },
          { answer: 'D', isCorrect: false },
        ],
      }),
    ).toThrow();
  });

  it('rejects fill_blank without accepted answer', () => {
    expect(() =>
      parseCreateQuizQuestionInput({
        type: 'fill_blank',
        question: 'Nguyễn Văn ___ Hà Nội?',
        answers: [],
      }),
    ).toThrow();
  });

  it('rejects fill_blank answers marked false', () => {
    expect(() =>
      parseCreateQuizQuestionInput({
        type: 'fill_blank',
        question: 'Nguyễn Văn ___ Hà Nội?',
        answers: [{ answer: 'ở', isCorrect: false }],
      }),
    ).toThrow();
  });

  it('rejects duplicate answer content after trim/lowercase', () => {
    expect(() =>
      parseCreateQuizQuestionInput({
        ...validSingleChoice,
        answers: [
          { answer: 'Vector DB', isCorrect: true },
          { answer: ' vector db ', isCorrect: false },
          { answer: 'Email', isCorrect: false },
          { answer: 'Password', isCorrect: false },
        ],
      }),
    ).toThrow();
  });
});

describe('grading', () => {
  const choiceAnswers = [
    answer('a1', 'Retrieval-Augmented Generation', true, 0),
    answer('a2', 'Random AI Generator', false, 1),
    answer('a3', 'Realtime API Gateway', false, 2),
    answer('a4', 'Remote Agent Graph', false, 3),
  ];

  it('awards full points for correct single_choice selectedAnswerId', () => {
    const result = gradeSingleChoiceQuestion(
      { ...baseQuestion, type: 'single_choice' },
      choiceAnswers,
      'a1',
    );
    expect(result).toEqual({ score: 2, isCorrect: true });
  });

  it('awards zero for wrong single_choice selectedAnswerId', () => {
    const result = gradeSingleChoiceQuestion(
      { ...baseQuestion, type: 'single_choice' },
      choiceAnswers,
      'a2',
    );
    expect(result).toEqual({ score: 0, isCorrect: false });
  });

  it('matches fill_blank after whitespace normalization', () => {
    const result = gradeFillBlankQuestion(
      { ...baseQuestion, type: 'fill_blank', caseSensitive: false },
      '  sống   ở  ',
      [answer('f1', 'sống ở', true, 0, 'fill_blank')],
    );
    expect(result).toEqual({ score: 2, isCorrect: true });
  });

  it('treats uppercase and lowercase as equal when caseSensitive is false', () => {
    const result = gradeFillBlankQuestion(
      { ...baseQuestion, type: 'fill_blank', caseSensitive: false },
      'Ở',
      [answer('f1', 'ở', true, 0, 'fill_blank')],
    );
    expect(result.isCorrect).toBe(true);
  });

  it('treats uppercase and lowercase as different when caseSensitive is true', () => {
    const result = gradeFillBlankQuestion(
      { ...baseQuestion, type: 'fill_blank', caseSensitive: true },
      'Ở',
      [answer('f1', 'ở', true, 0, 'fill_blank')],
    );
    expect(result.isCorrect).toBe(false);
  });
});

describe('computeAttemptTotals', () => {
  it('computes percentage and pass status', () => {
    const totals = computeAttemptTotals(
      [
        { score: 8, maxPoints: 10 },
        { score: 2, maxPoints: 10 },
      ],
      70,
    );
    expect(totals.score).toBe(10);
    expect(totals.maxScore).toBe(20);
    expect(totals.percentage).toBe(50);
    expect(totals.passed).toBe(false);
  });
});
