"use client";

import { apiRequest, type ApiResult } from "@/lib/api/client";
import type { CartResponse } from "@/lib/api/types";

export const cartClient = {
  get(): Promise<ApiResult<CartResponse>> {
    return apiRequest<CartResponse>({ url: "/cart", method: "GET" });
  },

  add(courseId: string): Promise<ApiResult<CartResponse>> {
    return apiRequest<CartResponse>({
      url: "/cart",
      method: "POST",
      data: { courseId, quantity: 1 },
    });
  },

  removeItem(itemId: string): Promise<ApiResult<CartResponse>> {
    return apiRequest<CartResponse>({
      url: `/cart/items/${itemId}`,
      method: "DELETE",
    });
  },

  clear(): Promise<ApiResult<CartResponse>> {
    return apiRequest<CartResponse>({ url: "/cart", method: "DELETE" });
  },
};
