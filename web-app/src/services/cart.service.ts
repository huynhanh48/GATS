import apiClient from "@/lib/apiClient";
import { PathApi } from "@/constants/PathApi";

export const cartApi = {
  getCart: async () => {
    return apiClient.get(PathApi.cart.list);
  },
  addItem: async (courseId: string) => {
    return apiClient.post(PathApi.cart.add, { courseId });
  },
  removeItem: async (courseId: string) => {
    return apiClient.delete(PathApi.cart.remove(courseId));
  },
  clearCart: async () => {
    return apiClient.delete(PathApi.cart.clear);
  },
};

export const orderApi = {
  createOrder: async (data: {
    items?: { courseId: string; quantity: number }[];
    fromCart?: boolean;
    paymentMethod: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    couponCode?: string;
  }) => {
    return apiClient.post(PathApi.order.create, data);
  },
  getOrder: async (orderId: string) => {
    return apiClient.get(PathApi.order.get(orderId));
  },
  getReceipt: async (orderId: string) => {
    return apiClient.get(PathApi.order.receipt(orderId));
  },
  listOrders: async () => {
    return apiClient.get(PathApi.order.list);
  },
  cancelOrder: async (orderId: string) => {
    return apiClient.post(PathApi.order.cancel(orderId), {});
  },
  checkSepay: async (txnRef: string) => {
    return apiClient.get(PathApi.payment.sepayCheck, {
      params: { txnRef },
    });
  },
};

export type CouponPreview = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  discountAmount: number;
  finalAmount: number;
};

export const couponApi = {
  preview: async (code: string, orderAmount: number): Promise<CouponPreview> => {
    const res: any = await apiClient.post(PathApi.coupon.preview, {
      code,
      orderAmount,
    });
    return res?.data;
  },
};
