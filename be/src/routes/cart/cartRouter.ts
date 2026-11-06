import { Request, Response } from 'express';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { getRouteParam } from '@src/common/utils/route-params';
import { errorHandle } from '@src/middleware/errorHandle';
import {
  parseAddToCartInput,
  parseChangeCartItemQuantityInput,
} from '@src/models/Cart.model';
import CartService from '@src/services/CartService';

function authUserId(req: Request): number {
  return req.authUser!.id;
}

async function getCart(req: Request, res: Response) {
  const cart = await CartService.getCart(authUserId(req));
  return res.status(HttpStatusCodes.OK).json({ cart });
}

async function addItem(req: Request, res: Response) {
  const input = parseAddToCartInput(req.body);
  const cart = await CartService.addItem(authUserId(req), input);
  return res.status(HttpStatusCodes.CREATED).json({ cart });
}

async function changeQuantity(req: Request, res: Response) {
  const input = parseChangeCartItemQuantityInput(req.body);
  const cart = await CartService.changeQuantity(
    authUserId(req),
    getRouteParam(req.params.itemId),
    input,
  );
  return res.status(HttpStatusCodes.OK).json({ cart });
}

async function removeItem(req: Request, res: Response) {
  const cart = await CartService.removeItem(
    authUserId(req),
    getRouteParam(req.params.itemId),
  );
  return res.status(HttpStatusCodes.OK).json({ cart });
}

async function clearCart(req: Request, res: Response) {
  const cart = await CartService.clearCart(authUserId(req));
  return res.status(HttpStatusCodes.OK).json({ cart });
}

export default {
  getCart: errorHandle(getCart),
  addItem: errorHandle(addItem),
  changeQuantity: errorHandle(changeQuantity),
  removeItem: errorHandle(removeItem),
  clearCart: errorHandle(clearCart),
} as const;
