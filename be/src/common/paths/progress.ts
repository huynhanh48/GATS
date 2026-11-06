const ProgressPaths = {
  _: '/api',
  Sync: {
    _: '/progress',
    Batch: '/sync',
    Changes: '/changes',
  },
  Progress: {
    _: '/courses/:courseId',
    CourseAggregate: '/progress',
    Lesson: '/lessons/:lessonId/progress',
  },
} as const;

export default ProgressPaths;
