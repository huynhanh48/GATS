import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseCreateLeadInput,
  parseLeadListQuery,
  parseUpdateLeadInput,
} from '@src/models/Lead.model';
import LeadService from '@src/services/LeadService';

function authUserId(req: Request): number {
  return req.authUser!.id;
}

async function create(req: Request, res: Response) {
  const input = parseCreateLeadInput(req.body);
  const result = await LeadService.create(input);
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function list(req: Request, res: Response) {
  const query = parseLeadListQuery(req.query);
  const result = await LeadService.list(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function getById(req: Request, res: Response) {
  const result = await LeadService.getById(getRouteParam(req.params.id));
  return res.status(HttpStatusCodes.OK).json(result);
}

async function update(req: Request, res: Response) {
  const input = parseUpdateLeadInput(req.body);
  const result = await LeadService.update(
    getRouteParam(req.params.id),
    input,
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  create: errorHandle(create),
  list: errorHandle(list),
  getById: errorHandle(getById),
  update: errorHandle(update),
};
