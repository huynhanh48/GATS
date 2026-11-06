import { NextFunction, Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { getRouteParam } from '@src/common/utils/route-params';
import { categoryTypeEnum } from '@src/db/schema/category';
import { RESOURCE_TYPES } from '@src/db/schema/constants';
import * as CategoryRepo from '@src/repos/CategoryRepo';
import authorizationService from '@src/services/AuthorizationService';

const CATEGORY_TYPES = new Set(categoryTypeEnum.enumValues);

function resourceTypeForCategoryType(type: string): string {
  if (type === 'post') return RESOURCE_TYPES.POST;
  return RESOURCE_TYPES.COURSE;
}

/**
 * Create: require update permission for body.type (course|post).
 * Update/Delete: load category by :categoryId and require update for that type.
 */
export function requireCategoryWritePermission() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authUser) {
      throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Unauthorized');
    }

    let categoryType: string | undefined;

    if (req.method === 'POST' || req.method === 'PUT') {
      const raw = req.body?.type;
      if (
        typeof raw !== 'string' ||
        !CATEGORY_TYPES.has(raw as 'course' | 'post')
      ) {
        throw new RouteError(
          HttpStatusCodes.BAD_REQUEST,
          'Invalid category type',
        );
      }
      categoryType = raw;
    } else {
      const categoryId = getRouteParam(req.params.categoryId);
      const category = await CategoryRepo.findById(categoryId);
      if (!category) {
        throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Category not found');
      }
      categoryType = category.type;
    }

    const allowed = await authorizationService.canPerform({
      userId: req.authUser.id,
      action: 'update',
      resourceType: resourceTypeForCategoryType(categoryType!),
    });

    if (!allowed) {
      throw new RouteError(HttpStatusCodes.FORBIDDEN, 'Forbidden');
    }

    return next();
  };
}

export default requireCategoryWritePermission;
