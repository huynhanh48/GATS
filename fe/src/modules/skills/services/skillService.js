import { httpClient } from '@/shared/api-client/httpClient';
import { API } from '@/shared/constants/api';

/**
 * Format bytes sang chuỗi hiển thị dễ đọc (KB, MB)
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Chuẩn hóa một bản ghi Skill từ API về chuẩn ViewModel hiển thị trên UI
 */
export function formatSkill(raw) {
  if (!raw) return null;

  const payload = raw.payload || {};
  const isFree = !raw.isPaid || !payload.price || payload.price === 0;
  const rawCategory = payload.category || 'AI Skill';
  // Tuân thủ quy chuẩn giao diện: thay '&' thành 'và'
  const category = rawCategory.replace(/\s*&\s*/g, ' và ');

  const priceFormatted = isFree
    ? 'Miễn phí'
    : `${Number(payload.price).toLocaleString('vi-VN')}đ`;

  const files = Array.isArray(payload.files)
    ? payload.files.map((f) => ({
        id: f.id,
        name: f.name,
        url: f.url,
        size: f.size,
        sizeFormatted: formatFileSize(f.size),
        mimeType: f.mimeType || 'text/markdown',
      }))
    : [];

  return {
    id: raw.id,
    itemKey: raw.itemKey,
    title: raw.title,
    slug: raw.itemKey,
    isPublic: raw.isPublic !== false,
    isPaid: Boolean(raw.isPaid),
    isFree,
    price: priceFormatted,
    priceValue: payload.price || 0,
    pricingType: payload.pricingType || (isFree ? 'free' : 'paid'),
    category,
    rawCategory,
    version: payload.version || '1.0.0',
    description:
      payload.description ||
      'Kỹ năng AI thực chiến tối ưu hiệu năng làm việc và tự động hóa quy trình.',
    instructions: payload.instructions || '',
    files,
    fileCount: files.length,
    image:
      payload.image ||
      payload.imageUrl ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    websiteUrl: raw.websiteUrl || null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    raw,
  };
}

export const skillService = {
  /**
   * Lấy danh sách kỹ năng theo filter
   * @param {Object} params - { q, pricingType, category, page, take }
   */
  async getSkills(params = {}) {
    try {
      const res = await httpClient.get(API.AI_TOOLS.LIST('skill'), { params });
      const rawList = Array.isArray(res?.data) ? res.data : [];
      const skills = rawList.map(formatSkill);
      return {
        skills,
        pagination: res?.pagination || {
          page: 1,
          take: 20,
          total: skills.length,
          totalPages: 1,
        },
      };
    } catch (error) {
      console.warn('Lỗi lấy danh sách skills:', error);
      return { skills: [], pagination: { page: 1, take: 20, total: 0, totalPages: 1 } };
    }
  },

  /**
   * Lấy chi tiết một kỹ năng theo itemKey
   * @param {string} itemKey
   */
  async getSkillDetail(itemKey) {
    try {
      const res = await httpClient.get(API.AI_TOOLS.DETAIL('skill', itemKey));
      const raw = res?.item || res?.data || res;
      return formatSkill(raw);
    } catch (error) {
      console.warn(`Lỗi lấy chi tiết skill ${itemKey}:`, error);
      return null;
    }
  },
};
