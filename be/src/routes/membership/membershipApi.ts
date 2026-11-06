import { Router } from 'express';

import MembershipPaths from '@src/common/paths/membership';
import authMiddleware from '@src/middleware/authMiddleware';
import { errorHandle } from '@src/middleware/errorHandle';
import requireAdmin from '@src/middleware/requireAdmin';
import handlers from './membershipRouter';

const apiRouter = Router();
const publicRouter = Router();
const router = Router();

publicRouter.get(MembershipPaths.Public.Plans, errorHandle(handlers.listPlans));
apiRouter.use(MembershipPaths.Public._, publicRouter);

router.use(errorHandle(authMiddleware), errorHandle(requireAdmin));
router.get(MembershipPaths.Admin.Plans, errorHandle(handlers.listPlans));
router.post(MembershipPaths.Admin.Plans, errorHandle(handlers.createPlan));
router.patch(MembershipPaths.Admin.Plan, errorHandle(handlers.updatePlan));
router.get(MembershipPaths.Admin.Members, errorHandle(handlers.listMembers));
router.post(MembershipPaths.Admin.Grant, errorHandle(handlers.grant));
router.patch(MembershipPaths.Admin.Extend, errorHandle(handlers.extend));
router.post(MembershipPaths.Admin.Revoke, errorHandle(handlers.revoke));

apiRouter.use(MembershipPaths.Admin._, router);
export default apiRouter;
