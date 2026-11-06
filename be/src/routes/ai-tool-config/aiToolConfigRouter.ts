import type { Request, Response } from 'express';
import { z } from 'zod';
import { aiToolTypeSchema, createApiModelSchema, createMcpSchema, createPromptSchema, createSkillSchema, createToolSchema, createStemSchema, listAiToolConfigQuerySchema, updateAiToolConfigSchema } from '@src/models/AiToolConfig.model';
import * as repo from '@src/repos/AiToolConfigRepo';
import { RouteError } from '@src/common/utils/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import * as OrderRepo from '@src/repos/OrderRepo';
import ApiModelSyncService from '@src/services/ApiModelSyncService';

async function listPublic(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const query = listAiToolConfigQuerySchema.parse(req.query);
  const ownedPromptKeys = new Set<string>();
  if (req.authUser) {
    try {
      const orders = await OrderRepo.listByUserId(req.authUser.id);
      orders.filter((order) => order.status === 'paid' && order.promptItemKey).forEach((order) => ownedPromptKeys.add(order.promptItemKey!));
    } catch (error) {
      // Giữ danh sách Prompt hoạt động trong lúc một instance cũ chưa chạy migration.
      // Nội dung trả phí vẫn bị ẩn nên fallback này không làm lộ dữ liệu.
      console.error('Unable to resolve owned prompts', error);
    }
  }
  const keyword = query.q?.toLocaleLowerCase('vi');
  const filtered = (await repo.findAll(query.type))
    .filter((item) => item.isPublic && (item.type !== 'prompt' || item.payload !== null))
    .filter((item) => {
      const payload = item.payload ?? {};
      const pricingType = item.isPaid ? 'paid' : 'free';
      const provider = String(payload.provider ?? payload.providerType ?? '').toLocaleLowerCase('vi');
      const category = String(payload.category ?? '').toLocaleLowerCase('vi');
      if (query.pricingType && pricingType !== query.pricingType) return false;
      if (query.provider && provider !== query.provider.toLocaleLowerCase('vi')) return false;
      if (query.category && category !== query.category.toLocaleLowerCase('vi')) return false;
      if (!keyword) return true;
      return [item.itemKey, item.title, String(payload.description ?? '')]
        .some((value) => value.toLocaleLowerCase('vi').includes(keyword));
    });
  const start = (query.page - 1) * query.take;
  const data = filtered
    .slice(start, start + query.take)
    .map((item) => {
      if (item.type === 'skill' && item.isPaid && item.payload) {
        return { ...item, payload: { ...item.payload, files: [] } };
      }
      if (item.type !== 'prompt') {
        return item;
      }
      const isOwned = !item.isPaid || ownedPromptKeys.has(item.itemKey);
      if (!item.isPaid || !item.payload || isOwned) return { ...item, isOwned };
      return {
        ...item,
        isOwned: false,
        payload: {
          ...item.payload,
          template: '',
          variables: [],
          instructions: '',
          sampleOutputs: [],
          negativePrompt: '',
          attachments: [],
        },
      };
    });
  return res.json({
    data,
    pagination: {
      page: query.page,
      take: query.take,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / query.take),
    },
  });
}
async function getPublic(req: Request, res: Response) {
  const type = aiToolTypeSchema.parse(req.params.type);
  const item = await repo.findByKey(type, String(req.params.itemKey));
  if (!item?.isPublic) throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Không tìm thấy nội dung AI');
  return res.json({ item });
}
async function listAdmin(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const query = listAiToolConfigQuerySchema.parse(req.query);
  const keyword = query.q?.toLocaleLowerCase('vi');
  const filtered = (await repo.findAll(query.type)).filter((item) => {
    const payload = item.payload ?? {};
    const pricingType = item.isPaid ? 'paid' : 'free';
    const provider = String(payload.provider ?? payload.providerType ?? '').toLocaleLowerCase('vi');
    const category = String(payload.category ?? '').toLocaleLowerCase('vi');
    if (query.pricingType && pricingType !== query.pricingType) return false;
    if (query.provider && provider !== query.provider.toLocaleLowerCase('vi')) return false;
    if (query.category && category !== query.category.toLocaleLowerCase('vi')) return false;
    if (!keyword) return true;
    return [item.itemKey, item.title, String(payload.description ?? '')]
      .some((value) => value.toLocaleLowerCase('vi').includes(keyword));
  });
  const start = (query.page - 1) * query.take;
  return res.json({
    data: filtered.slice(start, start + query.take),
    pagination: {
      page: query.page,
      take: query.take,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / query.take),
    },
  });
}
async function getAdmin(req: Request, res: Response) {
  const type = aiToolTypeSchema.parse(req.params.type);
  const item = await repo.findByKey(type, String(req.params.itemKey));
  if (!item) throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Không tìm thấy nội dung AI');
  return res.json({ item });
}
async function listApiModels(req: Request, res: Response) {
  const item = await repo.findByKey('api_provider', String(req.params.itemKey));
  if (!item) throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Không tìm thấy API provider');
  const models = Array.isArray(item.payload?.models) ? item.payload.models : [];
  return res.json({
    provider: { itemKey: item.itemKey, title: item.title },
    data: models
      .filter((model) => typeof model === 'object' && model !== null && (model as { isActive?: boolean }).isActive !== false)
      .map((model) => {
        const value = model as Record<string, unknown>;
        return {
          id: value.id,
          isActive: value.isActive !== false,
        };
      }),
  });
}
async function listPublicApiModels(req: Request, res: Response) {
  const item = await repo.findByKey('api_provider', String(req.params.itemKey));
  if (!item?.isPublic) throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Không tìm thấy API provider');
  return listApiModels(req, res);
}
async function update(req: Request, res: Response) {
  const type = aiToolTypeSchema.parse(req.params.type);
  const itemKey = String(req.params.itemKey);
  const input = updateAiToolConfigSchema.parse(req.body);
  const item = await repo.update(type, itemKey, input);
  if (!item) throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Không tìm thấy nội dung AI');
  return res.json({ item });
}
async function createPrompt(req: Request, res: Response) {
  const input=createPromptSchema.parse(req.body);
  const item=await repo.create({...input,type:'prompt'});
  return res.status(201).json({item});
}
async function createApiModel(req: Request, res: Response) {
  const input=createApiModelSchema.parse(req.body);
  const item=await repo.upsert({...input,type:'api_provider'});
  return res.status(201).json({item});
}
async function createMcp(req: Request, res: Response) {
  const input = createMcpSchema.parse(req.body);
  const item = await repo.upsert({ ...input, type: 'mcp' });
  return res.status(HttpStatusCodes.CREATED).json({ item });
}
async function createTool(req: Request, res: Response) {
  const input = createToolSchema.parse(req.body);
  const item = await repo.upsert({ ...input, type: 'tool' });
  return res.status(HttpStatusCodes.CREATED).json({ item });
}
async function createStem(req: Request, res: Response) {
  const input = createStemSchema.parse(req.body);
  const item = await repo.upsert({ ...input, type: 'stem' });
  return res.status(HttpStatusCodes.CREATED).json({ item });
}
async function bulkDeleteApiProviders(req: Request, res: Response) {
  const { itemKeys } = z.object({ itemKeys: z.array(z.string().min(1)).min(1).max(100) }).parse(req.body);
  const deletedCount = await repo.removeMany('api_provider', itemKeys);
  return res.json({ deletedCount });
}

async function bulkDeleteResources(req: Request, res: Response) {
  const { type, itemKeys } = z.object({
    type: z.enum(['prompt', 'skill', 'mcp', 'tool', 'stem']),
    itemKeys: z.array(z.string().min(1)).min(1).max(100),
  }).parse(req.body);
  const deletedCount = await repo.removeMany(type, itemKeys);
  return res.json({ deletedCount });
}
async function bulkDeleteApiModels(req: Request, res: Response) {
  const { models } = z.object({
    models: z.array(z.object({ providerKey: z.string().min(1), modelId: z.string().min(1) })).min(1).max(500),
  }).parse(req.body);
  const grouped = new Map<string, Set<string>>();
  for (const model of models) {
    const ids = grouped.get(model.providerKey) ?? new Set<string>();
    ids.add(model.modelId);
    grouped.set(model.providerKey, ids);
  }
  let deletedCount = 0;
  for (const [providerKey, modelIds] of grouped) {
    const provider = await repo.findByKey('api_provider', providerKey);
    if (!provider) continue;
    const currentModels = Array.isArray(provider.payload?.models) ? provider.payload.models : [];
    const nextModels = currentModels.filter((model) => {
      const id = typeof model === 'object' && model !== null ? String((model as { id?: unknown }).id ?? '') : '';
      if (!modelIds.has(id)) return true;
      deletedCount += 1;
      return false;
    });
    await repo.update('api_provider', providerKey, { payload: { ...(provider.payload ?? {}), models: nextModels } });
  }
  return res.json({ deletedCount });
}
async function upsertApiModel(req: Request, res: Response) {
  const input = z.object({ providerKey: z.string().min(1), id: z.string().min(1), isActive: z.boolean().default(true) }).parse(req.body);
  const provider = await repo.findByKey('api_provider', input.providerKey);
  if (!provider) throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Không tìm thấy API Provider');
  const models = Array.isArray(provider.payload?.models) ? provider.payload.models : [];
  const nextModel = { id: input.id, isActive: input.isActive };
  const index = models.findIndex((model) => typeof model === 'object' && model !== null && (model as { id?: unknown }).id === input.id);
  const nextModels = [...models];
  if (index >= 0) nextModels[index] = nextModel;
  else nextModels.push(nextModel);
  await repo.update('api_provider', input.providerKey, { payload: { ...(provider.payload ?? {}), models: nextModels } });
  return res.status(HttpStatusCodes.CREATED).json({ model: nextModel });
}
async function syncFreeApiModels(_req: Request, res: Response) {
  const summary = await ApiModelSyncService.syncFreeApiModels();
  if (summary.skippedLocked) {
    return res.status(HttpStatusCodes.CONFLICT).json({
      message: 'Một tiến trình đồng bộ API Model khác đang chạy',
      summary,
    });
  }
  return res.json({
    message: 'Đồng bộ API Model miễn phí hoàn tất',
    summary,
  });
}
async function createSkill(req: Request, res: Response) {
  const input=createSkillSchema.parse(req.body);
  const item=await repo.upsert({...input,type:'skill'});
  return res.status(201).json({item});
}
async function remove(req: Request,res: Response){
  const type=aiToolTypeSchema.parse(req.params.type); const itemKey=String(req.params.itemKey);
  if(!await repo.remove(type,itemKey)) throw new RouteError(HttpStatusCodes.NOT_FOUND,'Không tìm thấy nội dung AI');
  return res.json({message:'Đã xóa'});
}
export default { listPublic, getPublic, listAdmin, getAdmin, listApiModels, listPublicApiModels, createPrompt, createApiModel, syncFreeApiModels, createSkill, createMcp, createTool, createStem, bulkDeleteResources, bulkDeleteApiProviders, bulkDeleteApiModels, upsertApiModel, update, remove };
