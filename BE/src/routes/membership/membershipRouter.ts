import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import {
  createMembershipPlanSchema,
  extendMembershipSchema,
  grantMembershipSchema,
  membershipListQuerySchema,
  revokeMembershipSchema,
  updateMembershipPlanSchema,
} from '@src/models/Membership.model';
import MembershipService from '@src/services/MembershipService';

function actorId(req: Request) {
  return req.authUser!.id;
}

async function listPlans(req: Request, res: Response) {
  return res.status(HttpStatusCodes.OK).json(await MembershipService.listPlans());
}

async function createPlan(req: Request, res: Response) {
  const input = createMembershipPlanSchema.parse(req.body);
  return res
    .status(HttpStatusCodes.CREATED)
    .json(await MembershipService.createPlan(input, actorId(req)));
}

async function updatePlan(req: Request, res: Response) {
  const input = updateMembershipPlanSchema.parse(req.body);
  return res.status(HttpStatusCodes.OK).json(
    await MembershipService.updatePlan(
      getRouteParam(req.params.id),
      input,
      actorId(req),
    ),
  );
}

async function listMembers(req: Request, res: Response) {
  const query = membershipListQuerySchema.parse(req.query);
  return res
    .status(HttpStatusCodes.OK)
    .json(await MembershipService.listMemberships(query));
}

async function grant(req: Request, res: Response) {
  const input = grantMembershipSchema.parse(req.body);
  return res
    .status(HttpStatusCodes.CREATED)
    .json(await MembershipService.grant(input, actorId(req)));
}

async function extend(req: Request, res: Response) {
  const input = extendMembershipSchema.parse(req.body);
  return res.status(HttpStatusCodes.OK).json(
    await MembershipService.extend(
      getRouteParam(req.params.id),
      input.days,
      input.reason,
      actorId(req),
    ),
  );
}

async function revoke(req: Request, res: Response) {
  const input = revokeMembershipSchema.parse(req.body);
  return res.status(HttpStatusCodes.OK).json(
    await MembershipService.revoke(
      getRouteParam(req.params.id),
      input.reason,
      actorId(req),
    ),
  );
}

export default { listPlans, createPlan, updatePlan, listMembers, grant, extend, revoke };

