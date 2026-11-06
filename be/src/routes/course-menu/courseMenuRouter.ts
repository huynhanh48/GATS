import type { Request, Response } from 'express';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import Service from '@src/services/CourseMenuItemService';
import {
  createCourseMenuItemSchema,
  reorderCourseMenuItemsSchema,
  updateCourseMenuItemSchema,
} from '@src/models/CourseMenuItem.model';

async function publicTree(_req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res.json({ data: [] });
}

async function adminList(_req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ data: await Service.listAdmin() });
}

async function tagCounts(_req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ data: await Service.getTagCountsByCategory() });
}

async function create(req: Request, res: Response) {
  return res.status(HttpStatusCodes.CREATED).json({
    item: await Service.create(createCourseMenuItemSchema.parse(req.body)),
  });
}

async function update(req: Request, res: Response) {
  return res.json({
    item: await Service.update(String(req.params.id), updateCourseMenuItemSchema.parse(req.body)),
  });
}

async function remove(req: Request, res: Response) {
  await Service.remove(String(req.params.id));
  return res.json({ message: 'Đã xóa mục menu' });
}

async function reorder(req: Request, res: Response) {
  const input = reorderCourseMenuItemsSchema.parse(req.body);
  await Service.reorder(input.items);
  return res.json({ message: 'Đã cập nhật thứ tự' });
}

async function seed(_req: Request, res: Response) {
  return res.status(HttpStatusCodes.CREATED).json({ data: await Service.seedDefaults() });
}

export default {
  publicTree,
  adminList,
  tagCounts,
  create,
  update,
  remove,
  reorder,
  seed,
};
