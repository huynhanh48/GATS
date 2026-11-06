import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import {
  parseCompleteAssignmentUploadInput,
  parseCreateAssignmentInput,
  parseGradeAssignmentSubmissionInput,
  parseInitAssignmentUploadInput,
  parseSubmitAssignmentInput,
  parseUpdateAssignmentInput,
} from '@src/models/Assignment.model';
import AssignmentService from '@src/services/AssignmentService';
import CourseAccessService from '@src/services/CourseAccessService';

function authUserId(req: Request): number {
  return req.authUser!.id;
}

async function createAssignment(req: Request, res: Response) {
  const input = parseCreateAssignmentInput(req.body);
  const result = await AssignmentService.create(
    getRouteParam(req.params.courseId),
    getRouteParam(req.params.lessonId),
    input,
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function updateAssignment(req: Request, res: Response) {
  const input = parseUpdateAssignmentInput(req.body);
  const result = await AssignmentService.update(
    getRouteParam(req.params.assignmentId),
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function removeAssignment(req: Request, res: Response) {
  const result = await AssignmentService.remove(
    getRouteParam(req.params.assignmentId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getMemberAssignment(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const lessonId = getRouteParam(req.params.lessonId);
  await CourseAccessService.assertLessonAccess(authUserId(req), lessonId);
  const result = await AssignmentService.getMemberByLesson(
    courseId,
    lessonId,
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function submitAssignment(req: Request, res: Response) {
  const input = parseSubmitAssignmentInput(req.body);
  const result = await AssignmentService.submit(
    getRouteParam(req.params.assignmentId),
    authUserId(req),
    input,
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function listSubmissions(req: Request, res: Response) {
  const result = await AssignmentService.listSubmissions(
    getRouteParam(req.params.assignmentId),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getMySubmission(req: Request, res: Response) {
  const result = await AssignmentService.getMySubmission(
    getRouteParam(req.params.assignmentId),
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function gradeSubmission(req: Request, res: Response) {
  const input = parseGradeAssignmentSubmissionInput(req.body);
  const result = await AssignmentService.gradeSubmission(
    getRouteParam(req.params.submissionId),
    authUserId(req),
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function initUpload(req: Request, res: Response) {
  const input = parseInitAssignmentUploadInput(req.body);
  const result = await AssignmentService.initUpload(
    getRouteParam(req.params.assignmentId),
    authUserId(req),
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function completeUpload(req: Request, res: Response) {
  const input = parseCompleteAssignmentUploadInput(req.body);
  const result = await AssignmentService.completeUpload(
    getRouteParam(req.params.submissionId),
    authUserId(req),
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  createAssignment,
  updateAssignment,
  removeAssignment,
  getMemberAssignment,
  submitAssignment,
  listSubmissions,
  getMySubmission,
  gradeSubmission,
  initUpload,
  completeUpload,
};
