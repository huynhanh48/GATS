import { Router } from 'express';

import VideoPaths from '@src/common/paths/video';
import EnvVars, { NodeEnvs } from '@src/common/constants/env';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import optionalAuthMiddleware from '@src/middleware/optionalAuthMiddleware';
import requirePermission from '@src/middleware/requirePermission';
import requireVideoCoursePermission from '@src/middleware/requireVideoCoursePermission';
import {
  handleVideoUploadError,
  videoUploadMiddleware,
} from '@src/middleware/videoUploadMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import videoHandlers from './videoRouter';

const apiRouter = Router();
const adminVideoRouter = Router();

if (EnvVars.NodeEnv === NodeEnvs.DEV) {
  adminVideoRouter.get(
    VideoPaths.Admin.TestMultipartUploadPage,
    videoHandlers.getTestMultipartUploadPage,
  );
}

adminVideoRouter.post(
  VideoPaths.Admin.InitMultipartUpload,
  errorHandle(authMiddleware),
  errorHandle(
    requirePermission('create', RESOURCE_TYPES.COURSE, (req) => req.body.courseId),
  ),
  videoHandlers.initMultipartUpload,
);

adminVideoRouter.post(
  VideoPaths.Admin.InitUpload,
  errorHandle(authMiddleware),
  errorHandle(
    requirePermission('create', RESOURCE_TYPES.COURSE, (req) => req.body.courseId),
  ),
  videoHandlers.initUpload,
);

adminVideoRouter.post(
  VideoPaths.Admin.Link,
  errorHandle(authMiddleware),
  errorHandle(
    requirePermission('create', RESOURCE_TYPES.COURSE, (req) => req.body.courseId),
  ),
  videoHandlers.linkVideo,
);

adminVideoRouter.post(
  VideoPaths.Admin.Upload,
  errorHandle(authMiddleware),
  errorHandle(requireVideoCoursePermission('update')),
  (req, res, next) => {
    videoUploadMiddleware(req, res, (err) => {
      if (err) {
        handleVideoUploadError(err, req, res, next);
        return;
      }
      next();
    });
  },
  videoHandlers.uploadFile,
);

adminVideoRouter.post(
  VideoPaths.Admin.CompleteUpload,
  errorHandle(authMiddleware),
  errorHandle(requireVideoCoursePermission('update')),
  videoHandlers.completeUpload,
);

adminVideoRouter.post(
  VideoPaths.Admin.MultipartPartUrl,
  errorHandle(authMiddleware),
  errorHandle(requireVideoCoursePermission('update')),
  videoHandlers.getMultipartPartUrl,
);

adminVideoRouter.post(
  VideoPaths.Admin.MultipartComplete,
  errorHandle(authMiddleware),
  errorHandle(requireVideoCoursePermission('update')),
  videoHandlers.completeMultipartUpload,
);

adminVideoRouter.post(
  VideoPaths.Admin.MultipartAbort,
  errorHandle(authMiddleware),
  errorHandle(requireVideoCoursePermission('update')),
  videoHandlers.abortMultipartUpload,
);

adminVideoRouter.get(
  VideoPaths.Admin.Status,
  errorHandle(authMiddleware),
  errorHandle(requireVideoCoursePermission('read')),
  videoHandlers.getStatus,
);

adminVideoRouter.delete(
  VideoPaths.Admin.Delete,
  errorHandle(authMiddleware),
  errorHandle(requireVideoCoursePermission('update')),
  videoHandlers.deleteVideo,
);

apiRouter.use(VideoPaths.Admin._, adminVideoRouter);
apiRouter.get(
  VideoPaths.Playback._,
  errorHandle(optionalAuthMiddleware),
  videoHandlers.getPlayback,
);
apiRouter.get(
  VideoPaths.LessonVideo.Get,
  errorHandle(authMiddleware),
  errorHandle(
    requirePermission('read', RESOURCE_TYPES.COURSE, (req) => req.params.courseId as string),
  ),
  videoHandlers.getByLesson,
);

export default apiRouter;
