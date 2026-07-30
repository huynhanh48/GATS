import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import {
  getRouteParam,
  getUuidRouteParam,
} from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseCreateCategoryInput,
  parseUpdateCategoryInput,
} from '@src/models/Category.model';
import {
  parseCreateCourseInput,
  parseListCoursesQuery,
  parseUpdateCourseInput,
} from '@src/models/Course.model';
import {
  parseCreateCourseSectionInput,
  parseUpdateCourseSectionInput,
} from '@src/models/CourseSection.model';
import {
  parseCreateLessonInput,
  parseUpdateLessonInput,
} from '@src/models/Lesson.model';
import {
  parseAttachLessonMediaInput,
  parseLessonAttachmentIdParam,
} from '@src/models/LessonAttachment.model';
import { parseOnboardingAnswers } from '@src/models/Onboarding.model';
import CategoryService from '@src/services/CategoryService';
import CourseSectionService from '@src/services/CourseSectionService';
import CourseService from '@src/services/CourseService';
import CurriculumService from '@src/services/CurriculumService';
import LessonAttachmentService from '@src/services/LessonAttachmentService';
import LessonService from '@src/services/LessonService';
import OnboardingRecommendationService from '@src/services/OnboardingRecommendationService';
import RecommendationAnalyticsService from '@src/services/RecommendationAnalyticsService';
import VideoService from '@src/services/VideoService';

function isAuthenticated(req: Request): boolean {
  return req.authUser !== undefined;
}

function authUserId(req: Request): number | null {
  return req.authUser?.id ?? null;
}

async function listCategories(_req: Request, res: Response) {
  const result = await CategoryService.list({ type: 'course' });
  const data = result.data.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    courseCount: item.courseCount,
  }));
  return res.status(HttpStatusCodes.OK).json({ data });
}

async function createCategory(req: Request, res: Response) {
  const input = parseCreateCategoryInput({ ...req.body, type: 'course' });
  const category = await CategoryService.create(input);
  return res.status(HttpStatusCodes.CREATED).json({ category });
}

async function updateCategory(req: Request, res: Response) {
  const input = parseUpdateCategoryInput(req.body);
  const category = await CategoryService.update(
    getUuidRouteParam(req.params.categoryId, 'categoryId'),
    input,
  );
  return res.status(HttpStatusCodes.OK).json({ category });
}

async function removeCategory(req: Request, res: Response) {
  const result = await CategoryService.remove(
    getUuidRouteParam(req.params.categoryId, 'categoryId'),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function list(req: Request, res: Response) {
  const query = parseListCoursesQuery(req.query);
  const result = await CourseService.listPublic(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function recommendations(req: Request, res: Response) {
  const answers = parseOnboardingAnswers(req.body);
  const result = await OnboardingRecommendationService.recommend(
    answers,
    req.authUser?.id,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function recommendationEvent(req: Request, res: Response) {
  const result = await RecommendationAnalyticsService.track(
    req.authUser?.id,
    req.body,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listManaged(req: Request, res: Response) {
  const query = parseListCoursesQuery(req.query);
  const result = await CourseService.listManaged(query, req.authUser!);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getBySlug(req: Request, res: Response) {
  const course = await CourseService.getBySlug(
    getRouteParam(req.params.slug),
    authUserId(req),
    isAuthenticated(req),
  );
  return res.status(HttpStatusCodes.OK).json({ course });
}

async function getById(req: Request, res: Response) {
  const course = await CourseService.getById(
    getUuidRouteParam(req.params.id, 'id'),
    undefined,
  );
  return res.status(HttpStatusCodes.OK).json({ course });
}

async function getManagedById(req: Request, res: Response) {
  const course = await CourseService.getById(
    getUuidRouteParam(req.params.id, 'id'),
    req.authUser,
  );
  return res.status(HttpStatusCodes.OK).json({ course });
}

async function create(req: Request, res: Response) {
  const input = parseCreateCourseInput(req.body);
  const course = await CourseService.create(input, req.authUser);
  return res.status(HttpStatusCodes.CREATED).json({ course });
}

async function update(req: Request, res: Response) {
  const input = parseUpdateCourseInput(req.body);
  const course = await CourseService.update(
    getUuidRouteParam(req.params.id, 'id'),
    input,
    req.authUser,
  );
  return res.status(HttpStatusCodes.OK).json({ course });
}

async function publish(req: Request, res: Response) {
  const course = await CourseService.publish(
    getUuidRouteParam(req.params.id, 'id'),
  );
  return res.status(HttpStatusCodes.OK).json({ course });
}

async function getPublishReadiness(req: Request, res: Response) {
  const result = await CourseService.getPublishReadiness(
    getUuidRouteParam(req.params.id, 'id'),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function remove(req: Request, res: Response) {
  const mode =
    req.query.mode === 'hard' ? ('hard' as const) : ('soft' as const);
  const result = await CourseService.remove(
    getUuidRouteParam(req.params.id, 'id'),
    req.authUser!.id,
    mode,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function restore(req: Request, res: Response) {
  const course = await CourseService.restore(
    getUuidRouteParam(req.params.id, 'id'),
  );
  return res.status(HttpStatusCodes.OK).json({ course });
}

async function getCurriculum(req: Request, res: Response) {
  const result = await CurriculumService.getCurriculum(
    getUuidRouteParam(req.params.courseId, 'courseId'),
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listSections(req: Request, res: Response) {
  const result = await CourseSectionService.list(
    getUuidRouteParam(req.params.courseId, 'courseId'),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function createSection(req: Request, res: Response) {
  const input = parseCreateCourseSectionInput(req.body);
  const result = await CourseSectionService.create(
    getUuidRouteParam(req.params.courseId, 'courseId'),
    input,
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function updateSection(req: Request, res: Response) {
  const input = parseUpdateCourseSectionInput(req.body);
  const result = await CourseSectionService.update(
    getUuidRouteParam(req.params.courseId, 'courseId'),
    getUuidRouteParam(req.params.sectionId, 'sectionId'),
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function removeSection(req: Request, res: Response) {
  const result = await CourseSectionService.remove(
    getUuidRouteParam(req.params.courseId, 'courseId'),
    getUuidRouteParam(req.params.sectionId, 'sectionId'),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function createLesson(req: Request, res: Response) {
  const input = parseCreateLessonInput(req.body);
  const result = await LessonService.create(
    getUuidRouteParam(req.params.courseId, 'courseId'),
    getUuidRouteParam(req.params.sectionId, 'sectionId'),
    input,
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function updateLesson(req: Request, res: Response) {
  const input = parseUpdateLessonInput(req.body);
  const result = await LessonService.update(
    getUuidRouteParam(req.params.courseId, 'courseId'),
    getUuidRouteParam(req.params.lessonId, 'lessonId'),
    input,
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function removeLesson(req: Request, res: Response) {
  const result = await LessonService.remove(
    getUuidRouteParam(req.params.courseId, 'courseId'),
    getUuidRouteParam(req.params.lessonId, 'lessonId'),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listLessonAttachments(req: Request, res: Response) {
  const data = await LessonAttachmentService.list(
    getUuidRouteParam(req.params.courseId, 'courseId'),
    getUuidRouteParam(req.params.lessonId, 'lessonId'),
  );
  return res.status(HttpStatusCodes.OK).json({ data });
}

async function attachLessonMedia(req: Request, res: Response) {
  const input = parseAttachLessonMediaInput(req.body);
  const attachment = await LessonAttachmentService.attach(
    getUuidRouteParam(req.params.courseId, 'courseId'),
    getUuidRouteParam(req.params.lessonId, 'lessonId'),
    input,
  );
  return res.status(HttpStatusCodes.CREATED).json({ attachment });
}

async function uploadLessonAttachment(req: Request, res: Response) {
  const attachment = await LessonAttachmentService.uploadAndAttach(
    getUuidRouteParam(req.params.courseId, 'courseId'),
    getUuidRouteParam(req.params.lessonId, 'lessonId'),
    req.file,
    req.authUser?.id,
  );
  return res.status(HttpStatusCodes.CREATED).json({ attachment });
}

async function removeLessonAttachment(req: Request, res: Response) {
  const result = await LessonAttachmentService.remove(
    getUuidRouteParam(req.params.courseId, 'courseId'),
    getUuidRouteParam(req.params.lessonId, 'lessonId'),
    parseLessonAttachmentIdParam(req.params),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function listAiQuizSources(req: Request, res: Response) {
  const result = await VideoService.listAiQuizSources(
    getUuidRouteParam(req.params.courseId, 'courseId'),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  list: errorHandle(list),
  recommendations: errorHandle(recommendations),
  recommendationEvent: errorHandle(recommendationEvent),
  listManaged: errorHandle(listManaged),
  listCategories: errorHandle(listCategories),
  createCategory: errorHandle(createCategory),
  updateCategory: errorHandle(updateCategory),
  removeCategory: errorHandle(removeCategory),
  getBySlug: errorHandle(getBySlug),
  getById: errorHandle(getById),
  getManagedById: errorHandle(getManagedById),
  listAiQuizSources: errorHandle(listAiQuizSources),
  create: errorHandle(create),
  update: errorHandle(update),
  publish: errorHandle(publish),
  getPublishReadiness: errorHandle(getPublishReadiness),
  remove: errorHandle(remove),
  restore: errorHandle(restore),
  getCurriculum: errorHandle(getCurriculum),
  listSections: errorHandle(listSections),
  createSection: errorHandle(createSection),
  updateSection: errorHandle(updateSection),
  removeSection: errorHandle(removeSection),
  createLesson: errorHandle(createLesson),
  updateLesson: errorHandle(updateLesson),
  removeLesson: errorHandle(removeLesson),
  listLessonAttachments: errorHandle(listLessonAttachments),
  attachLessonMedia: errorHandle(attachLessonMedia),
  uploadLessonAttachment: errorHandle(uploadLessonAttachment),
  removeLessonAttachment: errorHandle(removeLessonAttachment),
} as const;
