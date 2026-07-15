const EnrollmentPaths = {
  _: '/api',
  Enrollment: {
    _: '/courses/:courseId/enrollments',
    Create: '/',
    List: '/',
    Update: '/:userId',
    Revoke: '/:userId',
  },
  Me: {
    _: '/me/enrollments',
    List: '/',
  },
} as const;

export default EnrollmentPaths;
