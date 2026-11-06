import { Router } from 'express';
import Paths from '@src/common/paths/ai-tool-config';
import authMiddleware from '@src/middleware/authMiddleware';
import requireStaff from '@src/middleware/requireStaff';
import { errorHandle } from '@src/middleware/errorHandle';
import handlers from './aiToolConfigRouter';
import optionalAuthMiddleware from '@src/middleware/optionalAuthMiddleware';

const api = Router();
const router = Router();
router.get('/', errorHandle(optionalAuthMiddleware), handlers.listPublic);
router.get('/admin', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.listAdmin);
router.get('/admin/:type/:itemKey', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.getAdmin);
router.get('/admin/api/:itemKey/models', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.listApiModels);
router.get('/api/:itemKey/models', handlers.listPublicApiModels);
router.get('/:type/:itemKey', handlers.getPublic);
router.post('/prompt', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.createPrompt);
router.post('/api-model', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.createApiModel);
router.post('/api', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.createApiModel);
router.post('/api-model/sync-free', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.syncFreeApiModels);
router.post('/api-provider/bulk-delete', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.bulkDeleteApiProviders);
router.post('/api-model/bulk-delete', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.bulkDeleteApiModels);
router.post('/api-model/upsert', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.upsertApiModel);
router.post('/bulk-delete', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.bulkDeleteResources);
router.post('/skill', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.createSkill);
router.post('/mcp', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.createMcp);
router.post('/tool', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.createTool);
router.post('/stem', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.createStem);
// `:type` must be part of the path: the handlers read req.params.type
// (e.g. PATCH /ai-tools-config/prompt/:itemKey).
router.patch('/:type/:itemKey', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.update);
router.delete('/:type/:itemKey', errorHandle(authMiddleware), errorHandle(requireStaff), handlers.remove);
api.use(Paths.AiTools._, router);
export default api;
