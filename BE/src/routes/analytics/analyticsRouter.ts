import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { errorHandle } from '@src/middleware/errorHandle';
import AnalyticsService from '@src/services/AnalyticsService';

function parseDaysQuery(req: Request): number | undefined {
  const daysRaw = req.query.days;
  if (typeof daysRaw === 'string' || typeof daysRaw === 'number') {
    return Number(daysRaw);
  }
  return undefined;
}

async function getOverview(req: Request, res: Response) {
  const result = await AnalyticsService.getOverview({
    days: parseDaysQuery(req),
  });
  return res.status(HttpStatusCodes.OK).json(result);
}

async function exportCsv(req: Request, res: Response) {
  const { csv, filename } = await AnalyticsService.exportCsv({
    days: parseDaysQuery(req),
  });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(HttpStatusCodes.OK).send(csv);
}

export default {
  getOverview: errorHandle(getOverview),
  exportCsv: errorHandle(exportCsv),
};
