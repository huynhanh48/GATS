import { Router } from 'express';

import LearnExtrasPaths from '@src/common/paths/learn-extras';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import learnExtrasHandlers from './learnExtrasRouter';

const apiRouter = Router();

const lessonQuestionsRouter = Router({ mergeParams: true });
lessonQuestionsRouter.get(
  LearnExtrasPaths.LessonQuestions.List,
  errorHandle(authMiddleware),
  learnExtrasHandlers.listQuestions,
);
lessonQuestionsRouter.post(
  LearnExtrasPaths.LessonQuestions.Create,
  errorHandle(authMiddleware),
  learnExtrasHandlers.askQuestion,
);
apiRouter.use(LearnExtrasPaths.LessonQuestions._, lessonQuestionsRouter);

const questionsRouter = Router({ mergeParams: true });
questionsRouter.post(
  LearnExtrasPaths.Questions.Answer,
  errorHandle(authMiddleware),
  learnExtrasHandlers.answerQuestion,
);
questionsRouter.patch(
  LearnExtrasPaths.Questions.Resolve,
  errorHandle(authMiddleware),
  learnExtrasHandlers.resolveQuestion,
);
questionsRouter.delete(
  LearnExtrasPaths.Questions.Delete,
  errorHandle(authMiddleware),
  learnExtrasHandlers.deleteQuestion,
);
apiRouter.use(LearnExtrasPaths.Questions._, questionsRouter);

const lessonNotesRouter = Router({ mergeParams: true });
lessonNotesRouter.get(
  LearnExtrasPaths.LessonNotes.List,
  errorHandle(authMiddleware),
  learnExtrasHandlers.listLessonNotes,
);
lessonNotesRouter.post(
  LearnExtrasPaths.LessonNotes.Create,
  errorHandle(authMiddleware),
  learnExtrasHandlers.addNote,
);
apiRouter.use(LearnExtrasPaths.LessonNotes._, lessonNotesRouter);

const courseNotesRouter = Router({ mergeParams: true });
courseNotesRouter.get(
  LearnExtrasPaths.CourseNotes.List,
  errorHandle(authMiddleware),
  learnExtrasHandlers.listCourseNotes,
);
apiRouter.use(LearnExtrasPaths.CourseNotes._, courseNotesRouter);

const notesRouter = Router({ mergeParams: true });
notesRouter.patch(
  LearnExtrasPaths.Notes.Update,
  errorHandle(authMiddleware),
  learnExtrasHandlers.updateNote,
);
notesRouter.delete(
  LearnExtrasPaths.Notes.Delete,
  errorHandle(authMiddleware),
  learnExtrasHandlers.deleteNote,
);
apiRouter.use(LearnExtrasPaths.Notes._, notesRouter);

const lessonBookmarksRouter = Router({ mergeParams: true });
lessonBookmarksRouter.get(
  LearnExtrasPaths.LessonBookmarks.List,
  errorHandle(authMiddleware),
  learnExtrasHandlers.listLessonBookmarks,
);
lessonBookmarksRouter.post(
  LearnExtrasPaths.LessonBookmarks.Create,
  errorHandle(authMiddleware),
  learnExtrasHandlers.addBookmark,
);
apiRouter.use(LearnExtrasPaths.LessonBookmarks._, lessonBookmarksRouter);

const courseBookmarksRouter = Router({ mergeParams: true });
courseBookmarksRouter.get(
  LearnExtrasPaths.CourseBookmarks.List,
  errorHandle(authMiddleware),
  learnExtrasHandlers.listCourseBookmarks,
);
apiRouter.use(LearnExtrasPaths.CourseBookmarks._, courseBookmarksRouter);

const bookmarksRouter = Router({ mergeParams: true });
bookmarksRouter.delete(
  LearnExtrasPaths.Bookmarks.Delete,
  errorHandle(authMiddleware),
  learnExtrasHandlers.deleteBookmark,
);
apiRouter.use(LearnExtrasPaths.Bookmarks._, bookmarksRouter);

export default apiRouter;
