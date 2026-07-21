import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  CreateQuizInput,
  CreateQuizQuestionInput,
  SubmitQuizInput,
  UpdateQuizInput,
  UpdateQuizQuestionInput,
} from '@src/models/Quiz.model';
import { shuffleArray } from '@src/models/Quiz.model';
import * as AssignmentRepo from '@src/repos/AssignmentRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import * as QuizQuestionRepo from '@src/repos/QuizQuestionRepo';
import * as QuizRepo from '@src/repos/QuizRepo';
import * as VideoRepo from '@src/repos/VideoRepo';
import CourseAccessService from '@src/services/CourseAccessService';
import * as LessonProgressSyncService from '@src/services/LessonProgressSyncService';
import {
  computeAttemptTotals,
  gradeFillBlankQuestion,
  gradeSingleChoiceQuestion,
} from '@src/services/QuizGradingService';

const Errors = {
  LESSON_NOT_FOUND: 'Lesson not found',
  LESSON_NOT_QUIZ: 'Lesson is not a quiz',
  QUIZ_EXISTS: 'Quiz already exists for this lesson',
  QUIZ_NOT_FOUND: 'Quiz not found',
  QUESTION_NOT_FOUND: 'Question not found',
  INVALID_LESSON_TYPE_CHANGE: 'Cannot change lesson type when quiz data exists',
  INVALID_REORDER: 'Invalid question reorder payload',
  INVALID_SUBMISSION: 'Invalid quiz submission',
} as const;

async function assertQuizLesson(courseId: string, lessonId: string) {
  const lesson = await LessonRepo.findByIdAndCourseId(lessonId, courseId);
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.LESSON_NOT_FOUND);
  }
  if (lesson.type !== 'quiz') {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.LESSON_NOT_QUIZ,
    );
  }
  return lesson;
}

function mapQuestionForAdmin(
  question: Awaited<ReturnType<typeof QuizQuestionRepo.findByIdWithAnswers>>,
) {
  if (!question) return undefined;
  return {
    ...question,
    answers: question.answers,
  };
}

async function create(
  courseId: string,
  lessonId: string,
  input: CreateQuizInput,
) {
  await assertQuizLesson(courseId, lessonId);
  const existing = await QuizRepo.findByLessonId(lessonId);
  if (existing) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.QUIZ_EXISTS);
  }

  const quiz = await QuizRepo.create({
    lessonId,
    title: input.title ?? null,
    description: input.description ?? null,
    passingScore: input.passing_score,
    timeLimit: input.time_limit ?? null,
    maxAttempts: input.max_attempts,
    shuffleQuestions: input.shuffle_questions,
    shuffleOptions: input.shuffle_options,
    showResult: input.show_result,
    showCorrectAnswer: input.show_correct_answer,
    showExplanation: input.show_explanation,
    availableFrom: input.available_from ?? null,
    availableUntil: input.available_until ?? null,
  });

  return { success: true, data: quiz };
}

async function update(quizId: string, input: UpdateQuizInput) {
  const quiz = await QuizRepo.findById(quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }

  const updated = await QuizRepo.update(quizId, {
    ...(input.title !== undefined ? { title: input.title ?? null } : {}),
    ...(input.description !== undefined
      ? { description: input.description ?? null }
      : {}),
    ...(input.passing_score !== undefined
      ? { passingScore: input.passing_score }
      : {}),
    ...(input.time_limit !== undefined
      ? { timeLimit: input.time_limit ?? null }
      : {}),
    ...(input.max_attempts !== undefined
      ? { maxAttempts: input.max_attempts }
      : {}),
    ...(input.shuffle_questions !== undefined
      ? { shuffleQuestions: input.shuffle_questions }
      : {}),
    ...(input.shuffle_options !== undefined
      ? { shuffleOptions: input.shuffle_options }
      : {}),
    ...(input.show_result !== undefined
      ? { showResult: input.show_result }
      : {}),
    ...(input.show_correct_answer !== undefined
      ? { showCorrectAnswer: input.show_correct_answer }
      : {}),
    ...(input.show_explanation !== undefined
      ? { showExplanation: input.show_explanation }
      : {}),
    ...(input.available_from !== undefined
      ? { availableFrom: input.available_from ?? null }
      : {}),
    ...(input.available_until !== undefined
      ? { availableUntil: input.available_until ?? null }
      : {}),
  });

  return { success: true, data: updated };
}

async function getAdminById(quizId: string) {
  const quiz = await QuizRepo.findById(quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }

  const questions = await QuizQuestionRepo.listWithAnswersByQuizId(quizId);
  return {
    success: true,
    data: {
      ...quiz,
      questions,
    },
  };
}

async function listQuestions(quizId: string) {
  const quiz = await QuizRepo.findById(quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }
  return {
    success: true,
    data: await QuizQuestionRepo.listWithAnswersByQuizId(quizId),
  };
}

async function getQuestion(questionId: string) {
  const question = await QuizQuestionRepo.findByIdWithAnswers(questionId);
  if (!question) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUESTION_NOT_FOUND);
  }
  return { success: true, data: mapQuestionForAdmin(question) };
}

async function getMemberByLesson(
  courseId: string,
  lessonId: string,
  userId: number,
) {
  await assertQuizLesson(courseId, lessonId);
  const quiz = await QuizRepo.findByLessonId(lessonId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }
  await CourseAccessService.assertLessonAccess(userId, lessonId);
  return takeQuiz(quiz.id, userId);
}

async function takeQuiz(quizId: string, userId: number) {
  const quiz = await QuizRepo.findById(quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }
  await CourseAccessService.assertLessonAccess(userId, quiz.lessonId);

  const questions = await QuizQuestionRepo.listWithAnswersByQuizId(quizId);
  const orderedQuestions = quiz.shuffleQuestions
    ? shuffleArray(questions)
    : questions;

  return {
    success: true,
    data: {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questions: orderedQuestions.map((question) => ({
        id: question.id,
        type: question.type,
        question: question.question,
        description: question.description,
        points: question.points,
        order: question.order,
        isRequired: question.isRequired,
        caseSensitive: question.caseSensitive,
        ...(question.type === 'single_choice' ||
        question.type === 'multiple_choice'
          ? {
              answers: (quiz.shuffleOptions
                ? shuffleArray(question.answers)
                : question.answers
              ).map((answer) => ({
                id: answer.id,
                answer: answer.answer,
                order: answer.order,
              })),
            }
          : {}),
      })),
    },
  };
}

async function addQuestion(quizId: string, input: CreateQuizQuestionInput) {
  const quiz = await QuizRepo.findById(quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }

  const question = await QuizQuestionRepo.createQuestionWithAnswers({
    quizId,
    type: input.type,
    question: input.question,
    description: input.description ?? null,
    explanation: input.explanation ?? null,
    points: input.points,
    isRequired: input.isRequired,
    caseSensitive: input.caseSensitive,
    answers: input.answers,
  });

  return {
    success: true,
    message: 'Tạo câu hỏi thành công',
    data: question,
  };
}

async function updateQuestion(
  questionId: string,
  input: UpdateQuizQuestionInput,
) {
  const updated = await QuizQuestionRepo.updateQuestionWithAnswers(questionId, {
    type: input.type,
    question: input.question,
    description: input.description ?? null,
    explanation: input.explanation ?? null,
    points: input.points,
    isRequired: input.isRequired,
    caseSensitive: input.caseSensitive,
    answers: input.answers,
  });
  if (!updated) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUESTION_NOT_FOUND);
  }
  return {
    success: true,
    message: 'Cập nhật câu hỏi thành công',
    data: updated,
  };
}

async function removeQuestion(questionId: string) {
  const removed = await QuizQuestionRepo.removeQuestion(questionId);
  if (!removed) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUESTION_NOT_FOUND);
  }
  return { success: true, message: 'Question deleted' };
}

async function reorderQuestions(quizId: string, questionIds: string[]) {
  const quiz = await QuizRepo.findById(quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }

  try {
    await QuizQuestionRepo.reorderQuestions(quizId, questionIds);
  } catch (error) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.INVALID_REORDER);
  }

  return { success: true, message: 'Questions reordered' };
}

async function submitQuiz(
  quizId: string,
  userId: number,
  input: SubmitQuizInput,
) {
  const quiz = await QuizRepo.findById(quizId);
  if (!quiz) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.QUIZ_NOT_FOUND);
  }
  const lesson = await CourseAccessService.assertLessonAccess(
    userId,
    quiz.lessonId,
  );

  const questions = await QuizQuestionRepo.listWithAnswersByQuizId(quizId);
  const questionMap = new Map(
    questions.map((question) => [question.id, question]),
  );
  const submittedQuestionIds = input.answers.map((answer) => answer.questionId);
  if (new Set(submittedQuestionIds).size !== submittedQuestionIds.length) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      'Duplicate questionId in submission',
    );
  }

  for (const answer of input.answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'questionId does not belong to quiz',
      );
    }

    if (question.type === 'single_choice') {
      if (!answer.selectedAnswerId || answer.textAnswer !== undefined) {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          'single_choice requires selectedAnswerId only',
        );
      }
      if (
        !question.answers.some(
          (choice) => choice.id === answer.selectedAnswerId,
        )
      ) {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          'selectedAnswerId does not belong to question',
        );
      }
    }

    if (question.type === 'fill_blank') {
      if (
        answer.selectedAnswerId !== undefined ||
        answer.textAnswer === undefined
      ) {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          'fill_blank requires textAnswer only',
        );
      }
    }
  }

  for (const question of questions) {
    const answer = input.answers.find(
      (item) => item.questionId === question.id,
    );
    if (question.isRequired && !answer) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Required question must be answered',
      );
    }
  }

  const results = questions.map((question) => {
    const answer = input.answers.find(
      (item) => item.questionId === question.id,
    );
    let grade = { score: 0, isCorrect: false };

    if (answer && question.type === 'single_choice') {
      grade = gradeSingleChoiceQuestion(
        question,
        question.answers,
        answer.selectedAnswerId!,
      );
    }

    if (answer && question.type === 'fill_blank') {
      grade = gradeFillBlankQuestion(
        question,
        answer.textAnswer,
        question.answers,
      );
    }

    return {
      questionId: question.id,
      isCorrect: grade.isCorrect,
      score: grade.score,
      explanation: question.explanation,
    };
  });

  const totals = computeAttemptTotals(
    results.map((result, index) => ({
      score: result.score,
      maxPoints: questions[index].points,
    })),
    quiz.passingScore,
  );

  const attemptCount = await QuizRepo.countAttemptsByUser(quiz.id, userId);
  await LessonProgressSyncService.syncQuizResult({
    userId,
    courseId: lesson.courseId,
    lessonId: lesson.id,
    score: totals.score,
    maxScore: totals.maxScore,
    percentage: totals.percentage,
    passed: totals.passed,
    attemptCount: Math.max(1, attemptCount),
  });

  return {
    success: true,
    data: {
      score: totals.score,
      maxScore: totals.maxScore,
      percentage: totals.percentage,
      passed: totals.passed,
      correctCount: results.filter((result) => result.isCorrect).length,
      totalQuestions: questions.length,
      results,
    },
  };
}

export async function assertLessonTypeChangeAllowed(
  lessonId: string,
  newType: string,
): Promise<void> {
  const quiz = await QuizRepo.findByLessonId(lessonId);
  const video = await VideoRepo.findByLessonId(lessonId);
  const assignment = await AssignmentRepo.findByLessonId(lessonId);

  if (newType !== 'quiz' && quiz) {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.INVALID_LESSON_TYPE_CHANGE,
    );
  }
  if (newType !== 'video' && video) {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.INVALID_LESSON_TYPE_CHANGE,
    );
  }
  if (newType !== 'assignment' && assignment) {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.INVALID_LESSON_TYPE_CHANGE,
    );
  }
}

export default {
  Errors,
  create,
  update,
  getAdminById,
  listQuestions,
  getQuestion,
  getMemberByLesson,
  takeQuiz,
  submitQuiz,
  addQuestion,
  updateQuestion,
  removeQuestion,
  reorderQuestions,
  assertLessonTypeChangeAllowed,
};
