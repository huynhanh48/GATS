import { Router } from 'express';
import authMiddleware from '@src/middleware/authMiddleware';
import requireAdmin from '@src/middleware/requireAdmin';
import { errorHandle } from '@src/middleware/errorHandle';
import handlers from './courseMenuRouter';

const router = Router();
router.get('/course-menu', errorHandle(handlers.publicTree));
router.get('/admin/course-menu', errorHandle(authMiddleware), errorHandle(requireAdmin), errorHandle(handlers.adminList));
router.get('/admin/course-menu/tag-counts', errorHandle(authMiddleware), errorHandle(requireAdmin), errorHandle(handlers.tagCounts));
router.post('/admin/course-menu/seed-default', errorHandle(authMiddleware), errorHandle(requireAdmin), errorHandle(handlers.seed));
router.put('/admin/course-menu/reorder', errorHandle(authMiddleware), errorHandle(requireAdmin), errorHandle(handlers.reorder));
router.post('/admin/course-menu', errorHandle(authMiddleware), errorHandle(requireAdmin), errorHandle(handlers.create));
router.patch('/admin/course-menu/:id', errorHandle(authMiddleware), errorHandle(requireAdmin), errorHandle(handlers.update));
router.delete('/admin/course-menu/:id', errorHandle(authMiddleware), errorHandle(requireAdmin), errorHandle(handlers.remove));

export default router;
