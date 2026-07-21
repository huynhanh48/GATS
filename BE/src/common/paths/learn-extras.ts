const LearnExtrasPaths = {
  _: '/api',
  LessonQuestions: {
    _: '/courses/:courseId/lessons/:lessonId/questions',
    List: '/',
    Create: '/',
  },
  Questions: {
    _: '/questions',
    Answer: '/:questionId/answers',
    Resolve: '/:questionId/resolve',
    Delete: '/:questionId',
  },
  LessonNotes: {
    _: '/courses/:courseId/lessons/:lessonId/notes',
    List: '/',
    Create: '/',
  },
  CourseNotes: {
    _: '/courses/:courseId/notes',
    List: '/',
  },
  Notes: {
    _: '/notes',
    Update: '/:noteId',
    Delete: '/:noteId',
  },
  LessonBookmarks: {
    _: '/courses/:courseId/lessons/:lessonId/bookmarks',
    List: '/',
    Create: '/',
  },
  CourseBookmarks: {
    _: '/courses/:courseId/bookmarks',
    List: '/',
  },
  Bookmarks: {
    _: '/bookmarks',
    Delete: '/:bookmarkId',
  },
} as const;

export default LearnExtrasPaths;
