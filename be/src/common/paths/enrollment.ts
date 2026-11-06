const EnrollmentPaths = {
  _: '/api',
  Enrollment: {
    _: '/courses/:courseId/enrollments',
    Create: '/',
    List: '/',
    Update: '/:userId',
    Revoke: '/:userId',
    Learners: '/learners',
    LearnersExportCsv: '/learners/export.csv',
    LearnerExerciseHistory: '/learners/:userId/exercise-history',
    LearnerAiCoach: '/learners/:userId/ai-coach',
  },
  Me: {
    _: '/me/enrollments',
    List: '/',
  },
} as const;

export default EnrollmentPaths;
