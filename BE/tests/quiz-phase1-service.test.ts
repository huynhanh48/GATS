import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockQuizFindById,
  mockListWithAnswersByQuizId,
  mockAssertLessonAccess,
} = vi.hoisted(() => ({
  mockQuizFindById: vi.fn(),
  mockListWithAnswersByQuizId: vi.fn(),
  mockAssertLessonAccess: vi.fn(),
}));

vi.mock('@src/repos/QuizRepo', () => ({
  findById: (...args: unknown[]) => mockQuizFindById(...args),
  findByLessonId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@src/repos/QuizQuestionRepo', () => ({
  listWithAnswersByQuizId: (...args: unknown[]) =>
    mockListWithAnswersByQuizId(...args),
  createQuestionWithAnswers: vi.fn(),
  updateQuestionWithAnswers: vi.fn(),
  findByIdWithAnswers: vi.fn(),
  removeQuestion: vi.fn(),
  reorderQuestions: vi.fn(),
}));

vi.mock('@src/repos/LessonRepo', () => ({
  findByIdAndCourseId: vi.fn(),
}));

vi.mock('@src/repos/AssignmentRepo', () => ({
  findByLessonId: vi.fn(),
}));

vi.mock('@src/repos/VideoRepo', () => ({
  findByLessonId: vi.fn(),
}));

vi.mock('@src/services/CourseAccessService', () => ({
  default: {
    assertLessonAccess: (...args: unknown[]) => mockAssertLessonAccess(...args),
  },
}));

import QuizService from '@src/services/QuizService';

const quiz = {
  id: '11111111-1111-4111-8111-111111111111',
  lessonId: '22222222-2222-4222-8222-222222222222',
  title: 'Quiz',
  description: null,
  passingScore: 70,
  timeLimit: null,
  maxAttempts: 1,
  shuffleQuestions: false,
  shuffleOptions: false,
  showResult: true,
  showCorrectAnswer: false,
  showExplanation: true,
  availableFrom: null,
  availableUntil: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const questions = [
  {
    id: '33333333-3333-4333-8333-333333333333',
    quizId: quiz.id,
    type: 'single_choice' as const,
    question: 'RAG là gì?',
    description: null,
    explanation: 'RAG là Retrieval-Augmented Generation.',
    points: 1,
    order: 0,
    isRequired: true,
    caseSensitive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    answers: [
      {
        id: '44444444-4444-4444-8444-444444444444',
        questionId: '33333333-3333-4333-8333-333333333333',
        answer: 'Retrieval-Augmented Generation',
        isCorrect: true,
        type: 'single_choice' as const,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '55555555-5555-4555-8555-555555555555',
        questionId: '33333333-3333-4333-8333-333333333333',
        answer: 'Random AI Generator',
        isCorrect: false,
        type: 'single_choice' as const,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    quizId: quiz.id,
    type: 'fill_blank' as const,
    question: 'Nguyễn Văn ___ Hà Nội?',
    description: null,
    explanation: "Đáp án phù hợp là 'ở'.",
    points: 1,
    order: 1,
    isRequired: true,
    caseSensitive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    answers: [
      {
        id: '77777777-7777-4777-8777-777777777777',
        questionId: '66666666-6666-4666-8666-666666666666',
        answer: 'ở',
        isCorrect: true,
        type: 'fill_blank' as const,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
];

describe('QuizService phase 1 learner flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuizFindById.mockResolvedValue(quiz);
    mockAssertLessonAccess.mockResolvedValue({
      id: quiz.lessonId,
      courseId: '88888888-8888-4888-8888-888888888888',
    });
    mockListWithAnswersByQuizId.mockResolvedValue(questions);
  });

  it('does not expose isCorrect or fill_blank accepted answers in take response', async () => {
    const result = await QuizService.takeQuiz(quiz.id, 1);

    expect(result.data.questions[0]?.answers?.[0]).not.toHaveProperty(
      'isCorrect',
    );
    expect(result.data.questions[1]).not.toHaveProperty('answers');
  });

  it('scores correct single_choice and normalized fill_blank answers', async () => {
    const result = await QuizService.submitQuiz(quiz.id, 1, {
      answers: [
        {
          questionId: questions[0].id,
          selectedAnswerId: questions[0].answers[0].id,
        },
        {
          questionId: questions[1].id,
          textAnswer: '  Ở  ',
        },
      ],
    });

    expect(result.data.score).toBe(2);
    expect(result.data.correctCount).toBe(2);
    expect(result.data.percentage).toBe(100);
  });

  it('rejects selectedAnswerId that does not belong to the question', async () => {
    await expect(
      QuizService.submitQuiz(quiz.id, 1, {
        answers: [
          {
            questionId: questions[0].id,
            selectedAnswerId: '99999999-9999-4999-8999-999999999999',
          },
          {
            questionId: questions[1].id,
            textAnswer: 'ở',
          },
        ],
      }),
    ).rejects.toThrow('selectedAnswerId does not belong to question');
  });
});
