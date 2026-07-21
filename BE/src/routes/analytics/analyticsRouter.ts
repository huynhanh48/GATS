import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { errorHandle } from '@src/middleware/errorHandle';
import AnalyticsService from '@src/services/AnalyticsService';

async function getOverview(_req: Request, res: Response) {
  const result = await AnalyticsService.getOverview();
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  getOverview: errorHandle(getOverview),
};
