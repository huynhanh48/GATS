import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { errorHandle } from '@src/middleware/errorHandle';
import PaymentService from '@src/services/PaymentService';

async function sepayWebhook(req: Request, res: Response) {
  const authHeader = req.headers['authorization'] as string | undefined;
  const apiKey =
    authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader?.startsWith('Apikey ')
        ? authHeader.substring(7)
        : ((req.headers['x-api-key'] as string | undefined) ?? authHeader);

  const result = await PaymentService.handleSepayWebhook(req.body, apiKey);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function sepayCheck(req: Request, res: Response) {
  const txnRef = req.query.txnRef;
  if (typeof txnRef !== 'string' || !txnRef.trim()) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'txnRef is required');
  }
  const result = await PaymentService.checkSepayPayment(txnRef.trim());
  return res.status(HttpStatusCodes.OK).json(result);
}

async function vnpayReturn(req: Request, res: Response) {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') query[key] = value;
  }
  const result = await PaymentService.handleVnpayReturn(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function momoReturn(req: Request, res: Response) {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') query[key] = value;
  }
  const result = await PaymentService.handleMomoReturn(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  sepayWebhook: errorHandle(sepayWebhook),
  sepayCheck: errorHandle(sepayCheck),
  vnpayReturn: errorHandle(vnpayReturn),
  momoReturn: errorHandle(momoReturn),
} as const;
