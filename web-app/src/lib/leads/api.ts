import apiClient from "@/lib/apiClient";
import { PathApi } from "@/constants/PathApi";

export const leadApi = {
  create: async (data: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
    source?: string;
  }) => {
    return apiClient.post(PathApi.leads.create, data);
  },
};
