"use client";

import { apiRequest, type ApiResult } from "@/lib/api/client";
import type {
  CreateOrderResponse,
  EnrollmentListResponse,
  EnrollmentRecord,
  PaymentMethod,
  SepayCheckResponse,
} from "@/lib/api/types";

export const orderClient = {
  create(input: {
    paymentMethod: PaymentMethod;
    fromCart?: boolean;
    items?: Array<{ courseId: string; quantity?: number }>;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    notes?: string;
  }): Promise<ApiResult<CreateOrderResponse>> {
    return apiRequest<CreateOrderResponse>({
      url: "/orders",
      method: "POST",
      data: input,
    });
  },
};

export const paymentClient = {
  checkSepay(txnRef: string): Promise<ApiResult<SepayCheckResponse>> {
    return apiRequest<SepayCheckResponse>({
      url: "/payment/sepay/check",
      method: "GET",
      params: { txnRef },
    });
  },
};

export const enrollmentClient = {
  listMine(): Promise<ApiResult<EnrollmentListResponse>> {
    return apiRequest<EnrollmentListResponse>({
      url: "/me/enrollments",
      method: "GET",
    });
  },

  enrollFree(courseId: string): Promise<ApiResult<{ data: EnrollmentRecord }>> {
    return apiRequest<{ data: EnrollmentRecord }>({
      url: `/courses/${courseId}/enrollments`,
      method: "POST",
      data: {},
    });
  },
};
