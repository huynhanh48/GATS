import { aiToolsService } from '@/shared/services/aiToolsService';

export const stemService = {
  async getStemItems(params = {}) {
    try {
      const res = await aiToolsService.getItems('stem', params);
      let items = res.items || [];

      if (params.category && params.category !== 'all') {
        items = items.filter((i) => i.category === params.category);
      }

      if (params.q) {
        const q = params.q.toLowerCase().trim();
        items = items.filter(
          (i) =>
            i.title?.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q) ||
            i.category?.toLowerCase().includes(q)
        );
      }

      return {
        items,
        pagination: res.pagination || {
          page: params.page || 1,
          take: params.take || 20,
          total: items.length,
          totalPages: Math.ceil(items.length / (params.take || 20)) || 1,
        },
      };
    } catch (error) {
      console.warn('Lỗi tải danh sách STEM từ máy chủ:', error);
      return { items: [], pagination: { page: 1, take: 20, total: 0, totalPages: 1 } };
    }
  },

  async getStemDetail(itemKey) {
    return await aiToolsService.getItemDetail('stem', itemKey);
  },
};
