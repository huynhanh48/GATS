import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import type {
  CreateLessonAnswerInput,
  CreateLessonQuestionInput,
} from '@src/models/LessonQna.model';
import * as LessonAnswerRepo from '@src/repos/LessonAnswerRepo';
import * as LessonQuestionRepo from '@src/repos/LessonQuestionRepo';
import CourseAccessService from '@src/services/CourseAccessService';

const Errors = {
  QUESTION_NOT_FOUND: 'Question not found',
  FORBIDDEN: 'You cannot modify this question',
} as const;

async function askQuestion(
  userId: number,
  lessonId: string,
  input: CreateLessonQuestionInput,
) {
  const lesson = await CourseAccessService.assertLessonAccess(userId, lessonId);

  const question = await LessonQuestionRepo.create({
    lessonId,
    courseId: lesson.courseId,
    userId,
    content: input.content,
  });

  return { data: { ...question, userName: null, answers: [] } };
}

async function listQuestions(userId: number, lessonId: string) {
  await CourseAccessService.assertLessonAccess(userId, lessonId);

  const questions = await LessonQuestionRepo.listByLesson(lessonId);
  const answersByQuestion = await LessonAnswerRepo.listByQuestionIds(
    questions.map((q) => q.id),
  );

  return {
    data: questions.map((q) => ({
      ...q,
      answers: answersByQuestion.get(q.id) ?? [],
    })),
  };
}

async function answerQuestion(
  userId: number,
  questionId: string,
  input: CreateLessonAnswerInput,
  isInstructor: boolean,
) {
  const question = await LessonQuestionRepo.findById(questionId);
  if (!question) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.QUESTION_NOT_FOUND,
    );
  }
  await CourseAccessService.assertLessonAccess(userId, question.lessonId);

  const answer = await LessonAnswerRepo.create({
    questionId,
    userId,
    content: input.content,
    isInstructorAnswer: isInstructor,
  });

  if (isInstructor) {
    await LessonQuestionRepo.updateResolved(questionId, true);
  }

  return { data: answer };
}

async function setResolved(
  userId: number,
  questionId: string,
  isResolved: boolean,
) {
  const question = await LessonQuestionRepo.findById(questionId);
  if (!question) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.QUESTION_NOT_FOUND,
    );
  }
  const canManage = await CourseAccessService.canManageCourse(
    userId,
    question.courseId,
  );
  if (question.userId !== userId && !canManage) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }

  const updated = await LessonQuestionRepo.updateResolved(
    questionId,
    isResolved,
  );
  return { data: updated };
}

async function removeQuestion(userId: number, questionId: string) {
  const question = await LessonQuestionRepo.findById(questionId);
  if (!question) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.QUESTION_NOT_FOUND,
    );
  }
  const canManage = await CourseAccessService.canManageCourse(
    userId,
    question.courseId,
  );
  if (question.userId !== userId && !canManage) {
    throw new RouteError(HttpStatusCodes.FORBIDDEN, Errors.FORBIDDEN);
  }
  await LessonQuestionRepo.removeIfOwner(questionId, question.userId);
  return { message: 'Đã xóa câu hỏi' };
}

export default {
  Errors,
  askQuestion,
  listQuestions,
  answerQuestion,
  setResolved,
  removeQuestion,
};
