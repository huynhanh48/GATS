import { unlink } from 'fs/promises';

import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import {
  getRouteParam,
  getUuidRouteParam,
} from '@src/common/utils/route-params';
import { RouteError } from '@src/common/utils/route-errors';
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
import {
  enqueueQuizAiGenerateJob,
  getQuizAiGenerateJob,
} from '@src/queues/quiz-ai.queue';
import * as QuizRepo from '@src/repos/QuizRepo';
import CourseAccessService from '@src/services/CourseAccessService';
import QuizAiService from '@src/services/QuizAiService';
import QuizAttemptService from '@src/services/QuizAttemptService';
import QuizService from '@src/services/QuizService';
import { getViavaBaseUrl } from '@src/services/viava/ViavaClient';

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
  const quizId = getUuidRouteParam(req.params.quizId, 'quizId');
  const fields = parseGenerateQuizAiFields(req.body ?? {});
  const uploaded = req.file
    ? {
        path: req.file.path,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
      }
    : undefined;

  if (!getViavaBaseUrl()) {
    if (uploaded?.path) await unlink(uploaded.path).catch(() => undefined);
    throw new RouteError(
      HttpStatusCodes.SERVICE_UNAVAILABLE,
      QuizAiService.Errors.NOT_CONFIGURED,
    );
  }

  const quiz = await QuizRepo.findById(quizId);
  if (!quiz) {
    if (uploaded?.path) await unlink(uploaded.path).catch(() => undefined);
    throw new RouteError(HttpStatusCodes.NOT_FOUND, QuizAiService.Errors.QUIZ_NOT_FOUND);
  }

  const hasFile = Boolean(uploaded);
  const hasUrl = Boolean(fields.file_url?.trim());
  const hasText = Boolean(fields.text?.trim());
  const inputCount = [hasFile, hasUrl, hasText].filter(Boolean).length;
  if (inputCount === 0) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, QuizAiService.Errors.NO_INPUT);
  }
  if (inputCount > 1) {
    if (uploaded?.path) await unlink(uploaded.path).catch(() => undefined);
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      QuizAiService.Errors.MULTIPLE_INPUTS,
    );
  }

  let jobId: string;
  try {
    jobId = await enqueueQuizAiGenerateJob({
      quizId,
      fields,
      upload: uploaded,
    });
  } catch (error) {
    if (uploaded?.path) await unlink(uploaded.path).catch(() => undefined);
    throw error;
  }

  return res.status(HttpStatusCodes.ACCEPTED).json({
    data: {
      jobId,
      quizId,
      status: 'queued',
    },
    message: 'AI quiz generation queued',
  });
}

async function getAiGenerateJob(req: Request, res: Response) {
  const quizId = getUuidRouteParam(req.params.quizId, 'quizId');
  const jobId = getRouteParam(req.params.jobId);
  const job = await getQuizAiGenerateJob(jobId);

  if (!job || job.data.quizId !== quizId) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'AI generate job not found');
  }

  const state = await job.getState();
  const status =
    state === 'waiting' || state === 'delayed' || state === 'prioritized'
      ? 'queued'
      : state;
  const base = {
    jobId: job.id,
    quizId,
    status,
  };

  if (state === 'completed') {
    const result = job.returnvalue;
    return res.status(HttpStatusCodes.OK).json({
      data: {
        ...base,
        result: result ?? null,
      },
    });
  }

  if (state === 'failed') {
    return res.status(HttpStatusCodes.OK).json({
      data: {
        ...base,
        error: job.failedReason ?? 'AI generation failed',
      },
    });
  }

  return res.status(HttpStatusCodes.OK).json({
    data: base,
  });
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
  getAiGenerateJob,
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
