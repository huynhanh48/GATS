import { NextFunction, Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import type { PermissionAction } from '@src/db/schema/permission';
import { RouteError } from '@src/common/utils/route-errors';
import authorizationService from '@src/services/AuthorizationService';
import * as VideoRepo from '@src/repos/VideoRepo';

export function requireVideoCoursePermission(action: PermissionAction) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) {
      throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
    }

    const rawVideoId = req.params.videoId;
    const videoId = typeof rawVideoId === 'string' ? rawVideoId : rawVideoId?.[0];
    if (!videoId) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'videoId is required');
    }

    const video = await VideoRepo.findById(videoId);
    if (!video) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Video not found');
    }

    const allowed = await authorizationService.canPerform({
      userId: req.authUser.id,
      action,
      resourceType: RESOURCE_TYPES.COURSE,
      resourceId: video.courseId,
    });

    if (!allowed) {
      throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Forbidden');
    }

    return next();
  };
}

export default requireVideoCoursePermission;
