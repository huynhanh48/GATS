import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseCertificateListQuery,
  parseIssueCertificateInput,
} from '@src/models/Certificate.model';
import CertificateService from '@src/services/CertificateService';

function authUserId(req: Request): number {
  return req.authUser!.id;
}

async function listMine(req: Request, res: Response) {
  const result = await CertificateService.listMine(authUserId(req));
  return res.status(HttpStatusCodes.OK).json(result);
}

async function verify(req: Request, res: Response) {
  const result = await CertificateService.verify(
    getRouteParam(req.params.certificateNumber),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

async function adminList(req: Request, res: Response) {
  const query = parseCertificateListQuery(req.query);
  const result = await CertificateService.adminList(query);
  return res.status(HttpStatusCodes.OK).json(result);
}

async function adminIssue(req: Request, res: Response) {
  const input = parseIssueCertificateInput(req.body);
  const result = await CertificateService.adminIssue(
    input.userId,
    input.courseId,
    authUserId(req),
  );
  return res.status(HttpStatusCodes.CREATED).json(result);
}

async function adminRevoke(req: Request, res: Response) {
  const result = await CertificateService.revoke(
    getRouteParam(req.params.id),
    authUserId(req),
  );
  return res.status(HttpStatusCodes.OK).json(result);
}

export default {
  listMine: errorHandle(listMine),
  verify: errorHandle(verify),
  adminList: errorHandle(adminList),
  adminIssue: errorHandle(adminIssue),
  adminRevoke: errorHandle(adminRevoke),
};
