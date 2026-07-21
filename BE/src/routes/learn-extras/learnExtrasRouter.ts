import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseCreateLessonAnswerInput,
  parseCreateLessonBookmarkInput,
  parseCreateLessonNoteInput,
  parseCreateLessonQuestionInput,
  parseUpdateLessonNoteInput,
  parseUpdateLessonQuestionInput,
} from '@src/models/LessonQna.model';
import LessonBookmarkService from '@src/services/LessonBookmarkService';
import LessonNoteService from '@src/services/LessonNoteService';
import LessonQnaService from '@src/services/LessonQnaService';

function authUserId(req: Request): number {
  return req.authUser!.id;
}

function isInstructorOrAdmin(req: Request): boolean {
  const roles = req.authUser?.roles ?? [];
  return roles.includes('admin') || roles.includes('instructor');
}

// Questions
async function listQuestions(req: Request, res: Response) {
  const lessonId = getRouteParam(req.params.lessonId);
  const result = await LessonQnaService.listQuestions(
    authUserId(req),
    lessonId,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function askQuestion(req: Request, res: Response) {
  const lessonId = getRouteParam(req.params.lessonId);
  const input = parseCreateLessonQuestionInput(req.body);
  const result = await LessonQnaService.askQuestion(
    authUserId(req),
    lessonId,
    input,
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function answerQuestion(req: Request, res: Response) {
  const questionId = getRouteParam(req.params.questionId);
  const input = parseCreateLessonAnswerInput(req.body);
  const result = await LessonQnaService.answerQuestion(
    authUserId(req),
    questionId,
    input,
    isInstructorOrAdmin(req),
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function resolveQuestion(req: Request, res: Response) {
  const questionId = getRouteParam(req.params.questionId);
  const input = parseUpdateLessonQuestionInput(req.body);
  const result = await LessonQnaService.setResolved(
    authUserId(req),
    questionId,
    input.isResolved ?? true,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function deleteQuestion(req: Request, res: Response) {
  const questionId = getRouteParam(req.params.questionId);
  const result = await LessonQnaService.removeQuestion(
    authUserId(req),
    questionId,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

// Notes
async function listLessonNotes(req: Request, res: Response) {
  const lessonId = getRouteParam(req.params.lessonId);
  const result = await LessonNoteService.listByLesson(
    authUserId(req),
    lessonId,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listCourseNotes(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const result = await LessonNoteService.listByCourse(
    authUserId(req),
    courseId,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function addNote(req: Request, res: Response) {
  const lessonId = getRouteParam(req.params.lessonId);
  const input = parseCreateLessonNoteInput(req.body);
  const result = await LessonNoteService.addNote(
    authUserId(req),
    lessonId,
    input,
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function updateNote(req: Request, res: Response) {
  const noteId = getRouteParam(req.params.noteId);
  const input = parseUpdateLessonNoteInput(req.body);
  const result = await LessonNoteService.update(
    authUserId(req),
    noteId,
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function deleteNote(req: Request, res: Response) {
  const noteId = getRouteParam(req.params.noteId);
  const result = await LessonNoteService.remove(authUserId(req), noteId);
  return res.status(HttpStatusCodes.OK).json(result);
}

// Bookmarks
async function listLessonBookmarks(req: Request, res: Response) {
  const lessonId = getRouteParam(req.params.lessonId);
  const result = await LessonBookmarkService.listByLesson(
    authUserId(req),
    lessonId,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listCourseBookmarks(req: Request, res: Response) {
  const courseId = getRouteParam(req.params.courseId);
  const result = await LessonBookmarkService.listByCourse(
    authUserId(req),
    courseId,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function addBookmark(req: Request, res: Response) {
  const lessonId = getRouteParam(req.params.lessonId);
  const input = parseCreateLessonBookmarkInput(req.body);
  const result = await LessonBookmarkService.addBookmark(
    authUserId(req),
    lessonId,
    input,
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function deleteBookmark(req: Request, res: Response) {
  const bookmarkId = getRouteParam(req.params.bookmarkId);
  const result = await LessonBookmarkService.remove(
    authUserId(req),
    bookmarkId,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  listQuestions: errorHandle(listQuestions),
  askQuestion: errorHandle(askQuestion),
  answerQuestion: errorHandle(answerQuestion),
  resolveQuestion: errorHandle(resolveQuestion),
  deleteQuestion: errorHandle(deleteQuestion),
  listLessonNotes: errorHandle(listLessonNotes),
  listCourseNotes: errorHandle(listCourseNotes),
  addNote: errorHandle(addNote),
  updateNote: errorHandle(updateNote),
  deleteNote: errorHandle(deleteNote),
  listLessonBookmarks: errorHandle(listLessonBookmarks),
  listCourseBookmarks: errorHandle(listCourseBookmarks),
  addBookmark: errorHandle(addBookmark),
  deleteBookmark: errorHandle(deleteBookmark),
};
