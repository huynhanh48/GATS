const MediaPaths = {
  _: '/api',
  Media: {
    _: '/media',
    UploadThumbnail: '/thumbnails',
    UploadFile: '/files',
    List: '/',
    Detail: '/:mediaId',
    Link: '/:mediaId/link',
    Delete: '/:mediaId',
  },
} as const;

export default MediaPaths;
