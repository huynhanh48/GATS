const VideoPaths = {
  _: '/api',
  Admin: {
    _: '/admin/videos',
    InitUpload: '/init-upload',
    InitMultipartUpload: '/init-multipart-upload',
    Link: '/link',
    Upload: '/:videoId/upload',
    CompleteUpload: '/:videoId/complete-upload',
    MultipartPartUrl: '/:videoId/multipart/part-url',
    MultipartComplete: '/:videoId/multipart/complete',
    MultipartAbort: '/:videoId/multipart/abort',
    TestMultipartUploadPage: '/test-multipart-upload-page',
    Status: '/:videoId/status',
    Delete: '/:videoId',
  },
  Playback: {
    _: '/courses/:courseId/videos/:videoId/playback',
  },
  LessonVideo: {
    Get: '/courses/:courseId/lessons/:lessonId/video',
  },
} as const;

export default VideoPaths;
