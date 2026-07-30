import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import {
  getRouteParam,
  getUuidRouteParam,
} from '@src/common/utils/route-params';
import { parseUserIdParam } from '@src/models/Enrollment.model';
import {
  parseCreateQuizInput,
  parseCreateQuizQuestionInput,
  parseGradeEssayAnswerInput,
  parseReorderQuestionsInput,
  parseSaveQuizAnswerInput,
  parseSubmitQuizInput,
  parseUpdateQuizInput,
  parseUpdateQuizQuestionInput,
} from '@src/models/Quiz.model';
import { parseGenerateQuizAiFields } from '@src/models/QuizAi.model';
import CourseAccessService from '@src/services/CourseAccessService';
import QuizAiService from '@src/services/QuizAiService';
import QuizAttemptService from '@src/services/QuizAttemptService';
import QuizService from '@src/services/QuizService';

function authUserId(req: Request): number {
  return req.authUser!.id;
}

async function createQuiz(req: Request, res: Response) {
  const input = parseCreateQuizInput(req.body);
  const result = await QuizService.create(
    getRouteParam(req.params.courseId),
    getRouteParam(req.params.lessonId),
    input,
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function updateQuiz(req: Request, res: Response) {
  const input = parseUpdateQuizInput(req.body);
  const result = await QuizService.update(
    getRouteParam(req.params.quizId),
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getAdminQuiz(req: Request, res: Response) {
  const result = await QuizService.getAdminById(
    getRouteParam(req.params.quizId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getMemberQuiz(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const lessonId = getRouteParam(req.params.lessonId);
  await CourseAccessService.assertLessonAccess(authUserId(req), lessonId);
  const result = await QuizService.getMemberByLesson(
    courseId,
    lessonId,
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function addQuestion(req: Request, res: Response) {
  const input = parseCreateQuizQuestionInput(req.body);
  const result = await QuizService.addQuestion(
    getRouteParam(req.params.quizId),
    input,
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function aiGenerate(req: Request, res: Response) {
  const fields = parseGenerateQuizAiFields(req.body ?? {});
  const uploaded = req.file
    ? {
        path: req.file.path,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
      }
    : undefined;
  const result = await QuizAiService.generateForQuiz(
    getUuidRouteParam(req.params.quizId, 'quizId'),
    fields,
    uploaded,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listQuestions(req: Request, res: Response) {
  const result = await QuizService.listQuestions(
    getRouteParam(req.params.quizId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getQuestion(req: Request, res: Response) {
  const result = await QuizService.getQuestion(
    getRouteParam(req.params.questionId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function updateQuestion(req: Request, res: Response) {
  const questionId = getRouteParam(req.params.questionId);
  const input = parseUpdateQuizQuestionInput(req.body);
  const result = await QuizService.updateQuestion(questionId, input);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function removeQuestion(req: Request, res: Response) {
  const result = await QuizService.removeQuestion(
    getRouteParam(req.params.questionId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function reorderQuestions(req: Request, res: Response) {
  const input = parseReorderQuestionsInput(req.body);
  const result = await QuizService.reorderQuestions(
    getRouteParam(req.params.quizId),
    input.questionIds,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function takeQuiz(req: Request, res: Response) {
  const result = await QuizService.takeQuiz(
    getRouteParam(req.params.quizId),
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function submitQuiz(req: Request, res: Response) {
  const input = parseSubmitQuizInput(req.body);
  const result = await QuizService.submitQuiz(
    getRouteParam(req.params.quizId),
    authUserId(req),
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function startAttempt(req: Request, res: Response) {
  const result = await QuizAttemptService.startAttempt(
    getRouteParam(req.params.quizId),
    authUserId(req),
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function saveAnswer(req: Request, res: Response) {
  const input = parseSaveQuizAnswerInput(req.body);
  const result = await QuizAttemptService.saveAnswer(
    getRouteParam(req.params.attemptId),
    getRouteParam(req.params.questionId),
    authUserId(req),
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function submitAttempt(req: Request, res: Response) {
  const result = await QuizAttemptService.submitAttempt(
    getRouteParam(req.params.attemptId),
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getAttemptResult(req: Request, res: Response) {
  const result = await QuizAttemptService.getAttemptResult(
    getRouteParam(req.params.attemptId),
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listAttempts(req: Request, res: Response) {
  const result = await QuizAttemptService.listAttemptsForQuiz(
    getRouteParam(req.params.quizId),
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function resetAttempts(req: Request, res: Response) {
  const targetUserId = parseUserIdParam(getRouteParam(req.params.userId));
  const result = await QuizAttemptService.resetAttemptsForUser(
    getRouteParam(req.params.quizId),
    targetUserId,
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function gradeEssayAnswer(req: Request, res: Response) {
  const input = parseGradeEssayAnswerInput(req.body);
  const result = await QuizAttemptService.gradeEssayAnswer(
    getRouteParam(req.params.answerId),
    authUserId(req),
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  createQuiz,
  updateQuiz,
  getAdminQuiz,
  getMemberQuiz,
  addQuestion,
  aiGenerate,
  listQuestions,
  getQuestion,
  updateQuestion,
  removeQuestion,
  reorderQuestions,
  takeQuiz,
  submitQuiz,
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptResult,
  gradeEssayAnswer,
  listAttempts,
  resetAttempts,
};
