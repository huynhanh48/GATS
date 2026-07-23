const CourseChatPaths = {
  _: '/api/courses/:courseId/chat',
  Messages: '/',
  Message: '/:messageId',
  Pin: '/:messageId/pin',
} as const;

export default CourseChatPaths;
