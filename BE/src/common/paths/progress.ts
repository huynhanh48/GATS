const ProgressPaths = {
  _: '/api',
  Progress: {
    _: '/courses/:courseId',
    CourseAggregate: '/progress',
    Lesson: '/lessons/:lessonId/progress',
  },
} as const;

export default ProgressPaths;
