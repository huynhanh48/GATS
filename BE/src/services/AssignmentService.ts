import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { getS3Bucket, getS3Client } from '@src/libs/s3.client';
import type {
  CompleteAssignmentUploadInput,
  CreateAssignmentInput,
  GradeAssignmentSubmissionInput,
  InitAssignmentUploadInput,
  SubmitAssignmentInput,
  UpdateAssignmentInput,
} from '@src/models/Assignment.model';
import {
  parseAllowedSubmissionTypes,
  serializeAllowedSubmissionTypes,
} from '@src/models/Assignment.model';
import * as AssignmentRepo from '@src/repos/AssignmentRepo';
import * as AssignmentSubmissionRepo from '@src/repos/AssignmentSubmissionRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import CourseAccessService from '@src/services/CourseAccessService';
import * as LessonProgressSyncService from '@src/services/LessonProgressSyncService';

const Errors = {
  LESSON_NOT_FOUND: 'Lesson not found',
  LESSON_NOT_ASSIGNMENT: 'Lesson is not an assignment',
  ASSIGNMENT_EXISTS: 'Assignment already exists for this lesson',
  ASSIGNMENT_NOT_FOUND: 'Assignment not found',
  SUBMISSION_NOT_FOUND: 'Submission not found',
  MAX_SUBMISSIONS_REACHED: 'Maximum submissions reached',
  DEADLINE_PASSED: 'Submission deadline has passed',
  INVALID_SUBMISSION_TYPE: 'Submission type is not allowed',
  SUBMISSION_REQUIRED: 'Submission content is required',
  FILE_TOO_LARGE: 'File exceeds maximum allowed size',
} as const;

async function assertAssignmentLesson(courseId: string, lessonId: string) {
  const lesson = await LessonRepo.findByIdAndCourseId(lessonId, courseId);
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.LESSON_NOT_FOUND);
  }
  if (lesson.type !== 'assignment') {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.LESSON_NOT_ASSIGNMENT,
    );
  }
  return lesson;
}

async function create(
  courseId: string,
  lessonId: string,
  input: CreateAssignmentInput,
) {
  await assertAssignmentLesson(courseId, lessonId);
  const existing = await AssignmentRepo.findByLessonId(lessonId);
  if (existing) {
    throw new RouteError(HttpStatusCodes.CONFLICT, Errors.ASSIGNMENT_EXISTS);
  }

  const assignment = await AssignmentRepo.create({
    lessonId,
    title: input.title ?? null,
    dueAt: input.due_at ?? null,
    maxScore: input.max_score,
    maxFileSizeMb: input.max_file_size_mb ?? null,
    allowedSubmissionTypes: serializeAllowedSubmissionTypes(
      input.allowed_submission_types,
    ),
    lateSubmissionAllowed: input.late_submission_allowed,
    maxSubmissions: input.max_submissions,
    passingScore: input.passing_score,
  });

  return { data: assignment };
}

async function update(assignmentId: string, input: UpdateAssignmentInput) {
  const assignment = await AssignmentRepo.findById(assignmentId);
  if (!assignment) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.ASSIGNMENT_NOT_FOUND,
    );
  }

  const updated = await AssignmentRepo.update(assignmentId, {
    ...(input.title !== undefined ? { title: input.title ?? null } : {}),
    ...(input.due_at !== undefined ? { dueAt: input.due_at ?? null } : {}),
    ...(input.max_score !== undefined ? { maxScore: input.max_score } : {}),
    ...(input.max_file_size_mb !== undefined
      ? { maxFileSizeMb: input.max_file_size_mb ?? null }
      : {}),
    ...(input.allowed_submission_types !== undefined
      ? {
          allowedSubmissionTypes: serializeAllowedSubmissionTypes(
            input.allowed_submission_types,
          ),
        }
      : {}),
    ...(input.late_submission_allowed !== undefined
      ? { lateSubmissionAllowed: input.late_submission_allowed }
      : {}),
    ...(input.max_submissions !== undefined
      ? { maxSubmissions: input.max_submissions }
      : {}),
    ...(input.passing_score !== undefined
      ? { passingScore: input.passing_score }
      : {}),
  });

  return { data: updated };
}

async function remove(assignmentId: string) {
  const deleted = await AssignmentRepo.remove(assignmentId);
  if (!deleted) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.ASSIGNMENT_NOT_FOUND,
    );
  }
  return { message: 'Assignment deleted' };
}

async function getMemberByLesson(
  courseId: string,
  lessonId: string,
  userId: number,
) {
  await assertAssignmentLesson(courseId, lessonId);
  const assignment = await AssignmentRepo.findByLessonId(lessonId);
  if (!assignment) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.ASSIGNMENT_NOT_FOUND,
    );
  }

  const submissionCount = await AssignmentSubmissionRepo.countByUser(
    assignment.id,
    userId,
  );
  const latest = await AssignmentSubmissionRepo.findLatestByUser(
    assignment.id,
    userId,
  );

  return {
    data: {
      id: assignment.id,
      title: assignment.title,
      dueAt: assignment.dueAt,
      maxScore: assignment.maxScore,
      maxFileSizeMb: assignment.maxFileSizeMb,
      allowedSubmissionTypes: parseAllowedSubmissionTypes(
        assignment.allowedSubmissionTypes,
      ),
      lateSubmissionAllowed: assignment.lateSubmissionAllowed,
      maxSubmissions: assignment.maxSubmissions,
      remainingSubmissions: Math.max(
        0,
        assignment.maxSubmissions - submissionCount,
      ),
      latestSubmission: latest ?? null,
    },
  };
}

function assertDeadline(assignment: {
  dueAt: Date | null;
  lateSubmissionAllowed: boolean;
}) {
  if (!assignment.dueAt) return;
  const now = new Date();
  if (now > assignment.dueAt && !assignment.lateSubmissionAllowed) {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.DEADLINE_PASSED,
    );
  }
}

function validateSubmissionContent(
  assignment: { allowedSubmissionTypes: string },
  input: SubmitAssignmentInput,
  hasFile: boolean,
) {
  const allowed = parseAllowedSubmissionTypes(
    assignment.allowedSubmissionTypes,
  );
  const hasText = Boolean(input.text_content?.trim());
  const hasUrl = Boolean(input.url?.trim());

  if (hasText && !allowed.includes('text')) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_SUBMISSION_TYPE,
    );
  }
  if (hasUrl && !allowed.includes('url')) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_SUBMISSION_TYPE,
    );
  }
  if (hasFile && !allowed.includes('file')) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_SUBMISSION_TYPE,
    );
  }
  if (!hasText && !hasUrl && !hasFile) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.SUBMISSION_REQUIRED,
    );
  }
}

async function submit(
  assignmentId: string,
  userId: number,
  input: SubmitAssignmentInput,
) {
  const assignment = await AssignmentRepo.findById(assignmentId);
  if (!assignment) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.ASSIGNMENT_NOT_FOUND,
    );
  }

  const lesson = await CourseAccessService.assertLessonAccess(
    userId,
    assignment.lessonId,
  );

  assertDeadline(assignment);
  validateSubmissionContent(assignment, input, false);

  const count = await AssignmentSubmissionRepo.countByUser(
    assignmentId,
    userId,
  );
  if (count >= assignment.maxSubmissions) {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.MAX_SUBMISSIONS_REACHED,
    );
  }

  const submission = await AssignmentSubmissionRepo.createSubmission({
    assignmentId,
    userId,
    submissionNumber: count + 1,
    status: 'submitted',
    textContent: input.text_content ?? null,
    url: input.url ?? null,
    submittedAt: new Date(),
  });

  return { data: submission };
}

async function listSubmissions(assignmentId: string) {
  const assignment = await AssignmentRepo.findById(assignmentId);
  if (!assignment) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.ASSIGNMENT_NOT_FOUND,
    );
  }

  const submissions =
    await AssignmentSubmissionRepo.listByAssignment(assignmentId);
  const withAttachments = await Promise.all(
    submissions.map(async (submission) => ({
      ...submission,
      attachments: await AssignmentSubmissionRepo.listAttachmentsBySubmission(
        submission.id,
      ),
    })),
  );

  return { data: withAttachments };
}

async function getMySubmission(assignmentId: string, userId: number) {
  const assignment = await AssignmentRepo.findById(assignmentId);
  if (!assignment) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.ASSIGNMENT_NOT_FOUND,
    );
  }

  await CourseAccessService.assertLessonAccess(userId, assignment.lessonId);

  const submission = await AssignmentSubmissionRepo.findLatestByUser(
    assignmentId,
    userId,
  );
  if (!submission) {
    return { data: null };
  }

  const attachments =
    await AssignmentSubmissionRepo.listAttachmentsBySubmission(submission.id);

  return { data: { ...submission, attachments } };
}

async function gradeSubmission(
  submissionId: string,
  graderId: number,
  input: GradeAssignmentSubmissionInput,
) {
  const submission = await AssignmentSubmissionRepo.findById(submissionId);
  if (!submission) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.SUBMISSION_NOT_FOUND,
    );
  }

  const assignment = await AssignmentRepo.findById(submission.assignmentId);
  if (!assignment) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.ASSIGNMENT_NOT_FOUND,
    );
  }

  const lesson = await LessonRepo.findById(assignment.lessonId);
  if (!lesson) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.LESSON_NOT_FOUND);
  }

  const now = new Date();
  const updated = await AssignmentSubmissionRepo.updateSubmission(
    submissionId,
    {
      status: 'graded',
      score: input.score,
      feedback: input.feedback ?? null,
      gradedById: graderId,
      gradedAt: now,
    },
  );

  const percentage =
    assignment.maxScore > 0 ? (input.score / assignment.maxScore) * 100 : 0;
  const passed = percentage >= assignment.passingScore;

  await LessonProgressSyncService.syncAssignmentResult({
    userId: submission.userId,
    courseId: lesson.courseId,
    lessonId: lesson.id,
    score: input.score,
    maxScore: assignment.maxScore,
    percentage,
    passed,
  });

  return { data: updated };
}

async function initUpload(
  assignmentId: string,
  userId: number,
  input: InitAssignmentUploadInput,
) {
  const assignment = await AssignmentRepo.findById(assignmentId);
  if (!assignment) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.ASSIGNMENT_NOT_FOUND,
    );
  }

  await CourseAccessService.assertLessonAccess(userId, assignment.lessonId);
  assertDeadline(assignment);

  const allowed = parseAllowedSubmissionTypes(
    assignment.allowedSubmissionTypes,
  );
  if (!allowed.includes('file')) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      Errors.INVALID_SUBMISSION_TYPE,
    );
  }

  if (
    assignment.maxFileSizeMb &&
    input.size > assignment.maxFileSizeMb * 1024 * 1024
  ) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.FILE_TOO_LARGE);
  }

  const count = await AssignmentSubmissionRepo.countByUser(
    assignmentId,
    userId,
  );
  if (count >= assignment.maxSubmissions) {
    throw new RouteError(
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
      Errors.MAX_SUBMISSIONS_REACHED,
    );
  }

  const storageKey = `assignments/${assignmentId}/${userId}/${randomUUID()}-${input.file_name}`;
  const uploadUrl = await getSignedUrl(
    getS3Client(),
    new PutObjectCommand({
      Bucket: getS3Bucket(),
      Key: storageKey,
      ContentType: input.content_type,
    }),
    { expiresIn: 3600 },
  );

  const submission = await AssignmentSubmissionRepo.createSubmission({
    assignmentId,
    userId,
    submissionNumber: count + 1,
    status: 'draft',
  });

  return {
    data: {
      submissionId: submission.id,
      uploadUrl,
      storageKey,
    },
  };
}

async function completeUpload(
  submissionId: string,
  userId: number,
  input: CompleteAssignmentUploadInput,
) {
  const submission = await AssignmentSubmissionRepo.findById(submissionId);
  if (!submission || submission.userId !== userId) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.SUBMISSION_NOT_FOUND,
    );
  }

  const assignment = await AssignmentRepo.findById(submission.assignmentId);
  if (!assignment) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      Errors.ASSIGNMENT_NOT_FOUND,
    );
  }

  if (
    assignment.maxFileSizeMb &&
    input.size &&
    input.size > assignment.maxFileSizeMb * 1024 * 1024
  ) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.FILE_TOO_LARGE);
  }

  await AssignmentSubmissionRepo.createAttachment({
    submissionId,
    fileName: input.file_name,
    storageKey: input.storage_key,
    mimeType: input.mime_type ?? null,
    size: input.size ?? null,
  });

  const updated = await AssignmentSubmissionRepo.updateSubmission(
    submissionId,
    {
      status: 'submitted',
      submittedAt: new Date(),
    },
  );

  return { data: updated };
}

export default {
  Errors,
  create,
  update,
  remove,
  getMemberByLesson,
  submit,
  listSubmissions,
  getMySubmission,
  gradeSubmission,
  initUpload,
  completeUpload,
};
