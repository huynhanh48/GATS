import { Router } from 'express';

import MediaPaths from '@src/common/paths/media';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  fileUploadMiddleware,
  handleMediaUploadError,
  thumbnailUploadMiddleware,
} from '@src/middleware/mediaUploadMiddleware';
import requirePermission from '@src/middleware/requirePermission';
import mediaHandlers from './mediaRouter';

const apiRouter = Router();
const mediaRouter = Router();

mediaRouter.post(
  MediaPaths.Media.UploadThumbnail,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('create', RESOURCE_TYPES.COURSE)),
  (req, res, next) => {
    thumbnailUploadMiddleware(req, res, (err) => {
      if (err) {
        handleMediaUploadError(err, req, res, next);
        return;
      }
      next();
    });
  },
  mediaHandlers.uploadThumbnail,
);

mediaRouter.post(
  MediaPaths.Media.UploadFile,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('create', RESOURCE_TYPES.COURSE)),
  (req, res, next) => {
    fileUploadMiddleware(req, res, (err) => {
      if (err) {
        handleMediaUploadError(err, req, res, next);
        return;
      }
      next();
    });
  },
  mediaHandlers.uploadFile,
);

mediaRouter.get(
  MediaPaths.Media.List,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('read', RESOURCE_TYPES.COURSE)),
  mediaHandlers.list,
);

mediaRouter.get(
  MediaPaths.Media.Detail,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('read', RESOURCE_TYPES.COURSE)),
  mediaHandlers.getOne,
);

mediaRouter.get(
  MediaPaths.Media.Link,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('read', RESOURCE_TYPES.COURSE)),
  mediaHandlers.getLink,
);

mediaRouter.delete(
  MediaPaths.Media.Delete,
  errorHandle(authMiddleware),
  errorHandle(requirePermission('update', RESOURCE_TYPES.COURSE)),
  mediaHandlers.remove,
);

apiRouter.use(MediaPaths.Media._, mediaRouter);

export default apiRouter;
