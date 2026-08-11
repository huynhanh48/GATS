import { type Job, Worker, type WorkerOptions } from 'bullmq';
import logger from 'jet-logger';

import { getQueueConnectionOptions } from '@src/libs/redis.client';
import {
  QUIZ_AI_GENERATE_JOB,
  QUIZ_AI_GENERATE_QUEUE,
  type QuizAiGenerateJobData,
  type QuizAiGenerateJobResult,
} from '@src/queues/quiz-ai.queue';
import QuizAiService from '@src/services/QuizAiService';

/** FLAC transcribe + multi exercise gen can take a long time. */
const QUIZ_AI_LOCK_DURATION_MS = 60 * 60 * 1000;
const QUIZ_AI_STALLED_INTERVAL_MS = 60 * 1000;

function getQuizAiWorkerOptions(): WorkerOptions {
  return {
    connection: getQueueConnectionOptions(),
    concurrency: 1,
    lockDuration: QUIZ_AI_LOCK_DURATION_MS,
    maxStalledCount: 2,
    stalledInterval: QUIZ_AI_STALLED_INTERVAL_MS,
  };
}

export async function processQuizAiGenerateJob(
  job: Job<QuizAiGenerateJobData, QuizAiGenerateJobResult>,
): Promise<QuizAiGenerateJobResult> {
  const { quizId, fields, upload } = job.data;
  logger.info(
    `Quiz AI job started (${job.id}): quiz=${quizId}, hasFile=${Boolean(upload)}`,
  );

  const result = await QuizAiService.generateForQuiz(
    quizId,
    fields,
    upload
      ? {
          path: upload.path,
          originalname: upload.originalname,
          mimetype: upload.mimetype,
        }
      : undefined,
  );

  logger.info(
    `Quiz AI job completed (${job.id}): questions=${result.data.question_count}`,
  );

  return {
    message: result.message,
    data: {
      course_title: result.data.course_title,
      domain: result.data.domain,
      question_count: result.data.question_count,
      skipped_count: result.data.skipped_count,
      skipped: result.data.skipped,
      questions: result.data.questions,
      applied: result.data.applied,
      supported_exercise_types: result.data.supported_exercise_types,
    },
  };
}

export function createQuizAiGenerateWorker(): Worker<
  QuizAiGenerateJobData,
  QuizAiGenerateJobResult
> {
  const worker = new Worker<QuizAiGenerateJobData, QuizAiGenerateJobResult>(
    QUIZ_AI_GENERATE_QUEUE,
    async (job) => {
      if (job.name !== QUIZ_AI_GENERATE_JOB) {
        throw new Error(`Unknown quiz AI job name: ${job.name}`);
      }
      return processQuizAiGenerateJob(job);
    },
    getQuizAiWorkerOptions(),
  );

  worker.on('failed', (job, error) => {
    logger.err(
      `Quiz AI job failed (${job?.id}): ${error instanceof Error ? error.message : String(error)}`,
    );
  });

  return worker;
}
