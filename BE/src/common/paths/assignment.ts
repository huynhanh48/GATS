const AssignmentPaths = {
  _: '/api',
  Assignment: {
    _: '/assignments',
    Update: '/:assignmentId',
    Delete: '/:assignmentId',
    Submissions: {
      List: '/:assignmentId/submissions',
      Mine: '/:assignmentId/submissions/mine',
      Submit: '/:assignmentId/submissions',
      InitUpload: '/:assignmentId/submissions/init-upload',
    },
  },
  Submission: {
    Grade: '/assignment-submissions/:submissionId/grade',
    CompleteUpload:
      '/assignment-submissions/:submissionId/attachments/complete',
  },
  LessonAssignment: {
    Create: '/courses/:courseId/lessons/:lessonId/assignment',
    Get: '/courses/:courseId/lessons/:lessonId/assignment',
  },
} as const;

export default AssignmentPaths;
