import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { errorHandle } from '@src/middleware/errorHandle';
import AdminMetricsService from '@src/services/AdminMetricsService';

async function getMetrics(_req: Request, res: Response) {
  const result = await AdminMetricsService.getDashboardMetrics();
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  getMetrics: errorHandle(getMetrics),
};
