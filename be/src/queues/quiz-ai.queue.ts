import { Queue } from 'bullmq';
import logger from 'jet-logger';
import { randomUUID } from 'crypto';

import { getQueueConnectionOptions } from '@src/libs/redis.client';
import type { GenerateQuizAiFields } from '@src/models/QuizAi.model';

export const QUIZ_AI_GENERATE_QUEUE = 'quiz-ai-generate';
export const QUIZ_AI_GENERATE_JOB = 'quiz-ai-generate';

export type QuizAiGenerateJobData = {
  quizId: string;
  fields: GenerateQuizAiFields;
  upload?: {
    path: string;
    originalname: string;
    mimetype: string;
  };
};

export type QuizAiGenerateJobResult = {
  message: string;
  data: {
    course_title: string | null;
    domain: string;
    question_count: number;
    skipped_count: number;
    skipped: { type: string; reason: string }[];
    questions: unknown[];
    applied: boolean;
    supported_exercise_types: readonly string[];
  };
};

const defaultJobOptions = {
  attempts: 1,
  removeOnComplete: { age: 24 * 3600, count: 200 },
  removeOnFail: { age: 7 * 24 * 3600, count: 200 },
};

let quizAiQueue: Queue<QuizAiGenerateJobData, QuizAiGenerateJobResult> | undefined;

export function getQuizAiQueue(): Queue<
  QuizAiGenerateJobData,
  QuizAiGenerateJobResult
> {
  if (!quizAiQueue) {
    quizAiQueue = new Queue<QuizAiGenerateJobData, QuizAiGenerateJobResult>(
      QUIZ_AI_GENERATE_QUEUE,
      {
        connection: getQueueConnectionOptions(),
        defaultJobOptions,
      },
    );
  }
  return quizAiQueue;
}

export async function enqueueQuizAiGenerateJob(
  data: QuizAiGenerateJobData,
): Promise<string> {
  const queue = getQuizAiQueue();
  const jobId = `quiz-ai-${data.quizId}-${randomUUID()}`;
  await queue.add(QUIZ_AI_GENERATE_JOB, data, { jobId });
  logger.info(`Quiz AI generate job enqueued (${jobId})`);
  return jobId;
}

export async function getQuizAiGenerateJob(jobId: string) {
  const queue = getQuizAiQueue();
  return queue.getJob(jobId);
}

export function resetQuizAiQueueForTests(): void {
  quizAiQueue = undefined;
}
