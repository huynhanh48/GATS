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
import * as CourseRepo from '@src/repos/CourseRepo';
import * as CourseSectionRepo from '@src/repos/CourseSectionRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import * as QuizAttemptRepo from '@src/repos/QuizAttemptRepo';
import * as QuizQuestionRepo from '@src/repos/QuizQuestionRepo';
import * as QuizRepo from '@src/repos/QuizRepo';
import * as VideoRepo from '@src/repos/VideoRepo';
import CourseAccessService from '@src/services/CourseAccessService';
import * as LessonProgressSyncService from '@src/services/LessonProgressSyncService';
import {
  computeAttemptTotals,
  gradeQuizQuestion,
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
  COURSE_NOT_FOUND: 'Course not found',
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

  // Lấy attempt gần nhất của user nếu có để trả về kết quả/câu trả lời trước đó
  let lastAttemptData: {
    attemptId: string;
    status: string;
    score: number | null;
    maxScore: number | null;
    percentage: number | null;
    passed: boolean | null;
    answers: Array<{
      questionId: string;
      textAnswer: string | null;
      selectedOptionIds: string[];
      score: number | null;
      isCorrect: boolean | null;
    }>;
  } | null = null;

  try {
    const attempts = await QuizAttemptRepo.listAttemptsByUser(quiz.id, userId);
    const latestAttempt = attempts.find(
      (a) => a.status === 'submitted' || a.status === 'graded',
    ) || attempts[0];

    if (latestAttempt) {
      const attemptAnswers = await QuizAttemptRepo.listAnswersByAttempt(latestAttempt.id);
      const answerIds = attemptAnswers.map((a) => a.id);
      const answerOptions = await QuizAttemptRepo.listAnswerOptionsByAnswerIds(answerIds);

      lastAttemptData = {
        attemptId: latestAttempt.id,
        status: latestAttempt.status,
        score: latestAttempt.score,
        maxScore: latestAttempt.maxScore,
        percentage: latestAttempt.percentage,
        passed: latestAttempt.passed,
        answers: attemptAnswers.map((ans) => ({
          questionId: ans.questionId,
          textAnswer: ans.textAnswer,
          selectedOptionIds: answerOptions
            .filter((opt) => opt.answerId === ans.id)
            .map((opt) => opt.optionId),
          score: ans.score,
          isCorrect: ans.isCorrect,
        })),
      };
    }
  } catch (err) {
    console.warn('Không thể lấy attempt trước đó:', err);
  }

  return {
    success: true,
    data: {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      lastAttempt: lastAttemptData,
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
        question.type === 'multiple_choice' ||
        question.type === 'true_false'
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

    const selectedIds = [
      ...(answer.selectedAnswerId ? [answer.selectedAnswerId] : []),
      ...(answer.selectedAnswerIds ?? []),
    ];

    switch (question.type) {
      case 'single_choice':
      case 'true_false': {
        if (selectedIds.length !== 1 || answer.textAnswer !== undefined) {
          throw new RouteError(
            HttpStatusCodes.BAD_REQUEST,
            `${question.type} requires exactly one selectedAnswerId`,
          );
        }
        break;
      }
      case 'multiple_choice': {
        if (selectedIds.length === 0 || answer.textAnswer !== undefined) {
          throw new RouteError(
            HttpStatusCodes.BAD_REQUEST,
            'multiple_choice requires selectedAnswerIds only',
          );
        }
        break;
      }
      case 'fill_blank':
      case 'short_answer': {
        if (selectedIds.length > 0 || answer.textAnswer === undefined) {
          throw new RouteError(
            HttpStatusCodes.BAD_REQUEST,
            `${question.type} requires textAnswer only`,
          );
        }
        break;
      }
    }

    if (
      selectedIds.some(
        (id) => !question.answers.some((choice) => choice.id === id),
      )
    ) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'selectedAnswerId does not belong to question',
      );
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
    const selectedAnswerIds = answer
      ? [
          ...(answer.selectedAnswerId ? [answer.selectedAnswerId] : []),
          ...(answer.selectedAnswerIds ?? []),
        ]
      : [];

    const grade = gradeQuizQuestion({
      question,
      answers: question.answers,
      selectedAnswerIds,
      textAnswer: answer?.textAnswer ?? null,
    });

    return {
      questionId: question.id,
      question: question.question,
      isCorrect: grade.isCorrect,
      score: grade.score,
      maxScore: question.points,
      selectedAnswer: grade.selectedAnswer,
      correctAnswers: question.answers
        .filter((option) => option.isCorrect)
        .sort((a, b) => a.order - b.order)
        .map((option) => option.answer),
      explanation: question.explanation ?? undefined,
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
  const nextAttemptNumber = (await QuizRepo.getMaxAttemptNumber(quiz.id, userId)) + 1;

  try {
    const attempt = await QuizAttemptRepo.createAttempt({
      quizId: quiz.id,
      userId,
      attemptNumber: nextAttemptNumber,
    });

    if (attempt) {
      await QuizAttemptRepo.updateAttempt(attempt.id, {
        status: 'submitted',
        score: totals.score,
        maxScore: totals.maxScore,
        percentage: totals.percentage,
        passed: totals.passed,
        submittedAt: new Date(),
        gradedAt: new Date(),
      });

      for (const question of questions) {
        const answer = input.answers.find((item) => item.questionId === question.id);
        const selectedIds = answer
          ? [
              ...(answer.selectedAnswerId ? [answer.selectedAnswerId] : []),
              ...(answer.selectedAnswerIds ?? []),
            ]
          : [];
        const gradeResult = results.find((r) => r.questionId === question.id);

        const savedAnswer = await QuizAttemptRepo.upsertAnswer({
          attemptId: attempt.id,
          questionId: question.id,
          textAnswer: answer?.textAnswer ?? null,
          selectedOptionIds: selectedIds,
        });

        if (savedAnswer && gradeResult) {
          await QuizAttemptRepo.updateAnswerAutoGrade(savedAnswer.id, {
            score: gradeResult.score,
            isCorrect: gradeResult.isCorrect,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Không thể lưu quiz attempt:', err);
  }

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

async function listAiQuizTargets(courseId: string) {
  const course = await CourseRepo.findById(courseId);
  if (!course) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.COURSE_NOT_FOUND);
  }

  const [sections, lessons] = await Promise.all([
    CourseSectionRepo.listByCourse(courseId),
    LessonRepo.listByCourse(courseId),
  ]);
  const sectionById = new Map(
    sections.map((section) => [section.id, section]),
  );
  const quizLessons = lessons.filter((lesson) => lesson.type === 'quiz');
  const quizzes = await Promise.all(
    quizLessons.map((lesson) => QuizRepo.findByLessonId(lesson.id)),
  );

  return {
    data: quizLessons.map((lesson, index) => {
      const section = sectionById.get(lesson.sectionId);
      const quizId = quizzes[index]?.id ?? null;
      const sectionTitle = section?.title ?? 'Chương chưa xác định';
      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        sectionId: lesson.sectionId,
        sectionTitle,
        quizId,
        hasQuiz: Boolean(quizId),
        label: `${sectionTitle} · ${lesson.title}`,
      };
    }),
  };
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
  listAiQuizTargets,
};
