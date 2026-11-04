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
 * Chuẩn hóa Skill
 */
export function formatSkill(raw) {
  if (!raw) return null;
  const payload = raw.payload || {};
  const isFree = !raw.isPaid || !payload.price || payload.price === 0;
  const rawCategory = payload.category || 'AI Skill';
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
    isPublic: raw.isPublic !== false,
    isPaid: Boolean(raw.isPaid),
    isFree,
    price: priceFormatted,
    priceValue: payload.price || 0,
    category,
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

/**
 * Chuẩn hóa MCP Server
 */
export function formatMcp(raw) {
  if (!raw) return null;
  const payload = raw.payload || {};
  const isFree = !raw.isPaid || !payload.price || payload.price === 0;
  const priceFormatted = isFree
    ? 'Miễn phí'
    : `${Number(payload.price).toLocaleString('vi-VN')}đ`;

  const providerType = (payload.providerType || 'claude').toLowerCase();
  const providerLabel =
    providerType === 'claude'
      ? 'Claude MCP'
      : providerType === 'openai'
        ? 'OpenAI'
        : providerType === 'gemini'
          ? 'Google Gemini'
          : 'MCP Server';

  return {
    id: raw.id,
    itemKey: raw.itemKey,
    title: raw.title,
    isPublic: raw.isPublic !== false,
    isPaid: Boolean(raw.isPaid),
    isFree,
    price: priceFormatted,
    priceValue: payload.price || 0,
    category: providerLabel,
    providerType,
    description:
      payload.description ||
      'Máy chủ MCP cung cấp ngữ cảnh, tài nguyên và công cụ mở rộng cho mô hình AI.',
    installation: payload.installation || '',
    image:
      payload.imageUrl ||
      payload.image ||
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
    websiteUrl: raw.websiteUrl || 'https://github.com/modelcontextprotocol/servers',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    raw,
  };
}

/**
 * Chuẩn hóa API Model / Provider
 */
export function formatApiModel(raw) {
  if (!raw) return null;
  const payload = raw.payload || {};
  const isFree = !raw.isPaid || !payload.price || payload.price === 0;
  const priceFormatted = isFree
    ? 'Miễn phí'
    : `${Number(payload.price).toLocaleString('vi-VN')}đ`;

  const rawProvider = payload.provider || 'OpenRouter';
  const provider = rawProvider.replace(/\s*&\s*/g, ' và ');

  const features = Array.isArray(payload.features)
    ? payload.features.map((f) => f.replace(/\s*&\s*/g, ' và '))
    : [];

  return {
    id: raw.id,
    itemKey: raw.itemKey,
    title: raw.title,
    isPublic: raw.isPublic !== false,
    isPaid: Boolean(raw.isPaid),
    isFree,
    price: priceFormatted,
    priceValue: payload.price || 0,
    category: provider,
    provider,
    badge: payload.badge || (isFree ? 'Miễn phí' : 'Pro'),
    contextWindow: payload.contextWindow || '128,000 tokens',
    features,
    description:
      payload.description ||
      payload.sourceDescription ||
      'Mô hình trí tuệ nhân tạo hiệu năng cao sẵn sàng tích hợp vào ứng dụng.',
    endpointUrl: payload.endpointUrl || (raw.websiteUrl ? `${raw.websiteUrl}/api/v1` : ''),
    docsUrl: payload.docsUrl || raw.websiteUrl || 'https://openrouter.ai',
    websiteUrl: raw.websiteUrl || 'https://openrouter.ai',
    models: Array.isArray(payload.models) ? payload.models : [],
    codeCurl: payload.codeCurl || '',
    codePython: payload.codePython || '',
    codeNode: payload.codeNode || '',
    installCmdPython: payload.installCmdPython || 'pip install openai',
    installCmdNode: payload.installCmdNode || 'npm install openai',
    image:
      payload.image ||
      payload.imageUrl ||
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    raw,
  };
}

/**
 * Chuẩn hóa Tool
 */
export function formatTool(raw) {
  if (!raw) return null;
  const payload = raw.payload || {};
  const isFree = !raw.isPaid || !payload.price || payload.price === 0;
  const priceFormatted = isFree
    ? 'Miễn phí'
    : `${Number(payload.price).toLocaleString('vi-VN')}đ`;

  const rawProvider = payload.provider || 'Công cụ AI';
  const provider = rawProvider.replace(/\s*&\s*/g, ' và ');

  return {
    id: raw.id,
    itemKey: raw.itemKey,
    title: raw.title,
    isPublic: raw.isPublic !== false,
    isPaid: Boolean(raw.isPaid),
    isFree,
    price: priceFormatted,
    priceValue: payload.price || 0,
    category: provider,
    provider,
    description:
      payload.description ||
      'Công cụ và môi trường phát triển tối ưu cho lập trình viên và người dùng AI.',
    image:
      payload.imageUrl ||
      payload.image ||
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    websiteUrl: raw.websiteUrl || null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    raw,
  };
}

/**
 * Chuẩn hóa Prompt
 */
export function formatPrompt(raw) {
  if (!raw) return null;
  const payload = raw.payload || {};
  const isFree = !raw.isPaid || !payload.price || payload.price === 0 || payload.price === 'Miễn phí';
  const priceFormatted = isFree
    ? 'Miễn phí'
    : typeof payload.price === 'number'
      ? `${Number(payload.price).toLocaleString('vi-VN')}đ`
      : String(payload.price);

  const rawCategory = payload.category || 'Prompt Engineering';
  const category = rawCategory.replace(/\s*&\s*/g, ' và ');

  return {
    id: raw.id,
    itemKey: raw.itemKey,
    title: raw.title,
    isPublic: raw.isPublic !== false,
    isPaid: Boolean(raw.isPaid),
    isFree,
    price: priceFormatted,
    priceValue: typeof payload.price === 'number' ? payload.price : 0,
    category,
    model: payload.model || 'Universal AI',
    template: payload.template || '',
    variables: Array.isArray(payload.variables) ? payload.variables : [],
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    rating: payload.rating || 5.0,
    salesCount: payload.salesCount || 0,
    authorName: payload.authorName || 'GATS Academy',
    authorBadge: payload.authorBadge || 'Official',
    authorAvatar: payload.authorAvatar || '',
    instructions: payload.instructions || '',
    description:
      payload.description ||
      'Mẫu câu lệnh prompt chuyên sâu giúp tối ưu kết quả phản hồi của mô hình AI.',
    image:
      payload.image ||
      payload.imageUrl ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    websiteUrl: raw.websiteUrl || null,
    modelBadgeColor: payload.modelBadgeColor || 'bg-blue-500/10 text-blue-600 border-blue-200',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    raw,
  };
}

/**
 * Chuẩn hóa STEM
 */
export function formatStem(raw) {
  if (!raw) return null;
  const payload = raw.payload || {};
  const isFree = !raw.isPaid || !payload.price || payload.price === 0;
  const priceFormatted = isFree
    ? 'Miễn phí'
    : `${Number(payload.price).toLocaleString('vi-VN')}đ`;

  const rawCategory = payload.category || 'STEM';
  const category = rawCategory.replace(/\s*&\s*/g, ' và ');
  const provider = payload.provider || 'GATS STEM Lab';
  const level = payload.level || payload.difficulty || payload.ageGroup || 'Cơ bản';
  const ageGroup = payload.ageGroup || 'Mọi lứa tuổi';
  const difficulty = payload.difficulty || 'Cơ bản';
  const topics = Array.isArray(payload.topics) ? payload.topics : [];
  const hardware = Array.isArray(payload.hardware) ? payload.hardware : [];
  const software = Array.isArray(payload.software) ? payload.software : [];
  const specifications = Array.isArray(payload.specifications) ? payload.specifications : [];
  const kitIncluded = payload.kitIncluded !== undefined ? Boolean(payload.kitIncluded) : false;

  return {
    id: raw.id,
    itemKey: raw.itemKey,
    title: raw.title,
    isPublic: raw.isPublic !== false,
    isPaid: Boolean(raw.isPaid),
    isFree,
    price: priceFormatted,
    priceValue: payload.price || 0,
    category,
    provider,
    level,
    ageGroup,
    difficulty,
    topics,
    hardware,
    software,
    specifications,
    kitIncluded,
    rating: payload.rating || 5.0,
    studentsCount: payload.studentsCount || 0,
    badge: payload.badge || (isFree ? 'Miễn phí' : 'STEM Kit'),
    description:
      payload.description ||
      'Chương trình học và dự án STEM thực hành khoa học, công nghệ, kỹ thuật và toán học.',
    content: payload.content || '',
    docUrl: payload.docUrl || raw.websiteUrl || '',
    image:
      payload.imageUrl ||
      payload.image ||
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    websiteUrl: raw.websiteUrl || null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    raw,
  };
}

/**
 * Service gọi API chung cho các loại tài nguyên AI và STEM
 */
export const aiToolsService = {
  async getItems(type = 'skill', params = {}) {
    try {
      const res = await httpClient.get(API.AI_TOOLS.LIST(type), { params });
      const rawList = Array.isArray(res?.data) ? res.data : [];
      let items = [];

      if (type === 'mcp') {
        items = rawList.map(formatMcp);
      } else if (type === 'api_model' || type === 'api_provider') {
        items = rawList.map(formatApiModel);
      } else if (type === 'tool') {
        items = rawList.map(formatTool);
      } else if (type === 'prompt') {
        items = rawList.map(formatPrompt);
      } else if (type === 'stem') {
        items = rawList.map(formatStem);
      } else {
        items = rawList.map(formatSkill);
      }

      return {
        items,
        pagination: res?.pagination || {
          page: params.page || 1,
          take: params.take || 20,
          total: items.length,
          totalPages: 1,
        },
      };
    } catch (error) {
      console.warn(`Lỗi lấy danh sách ${type}:`, error);
      return { items: [], pagination: { page: 1, take: 20, total: 0, totalPages: 1 } };
    }
  },

  async getItemDetail(type, itemKey) {
    try {
      const res = await httpClient.get(API.AI_TOOLS.DETAIL(type, itemKey));
      const raw = res?.item || res?.data || res;
      if (type === 'mcp') return formatMcp(raw);
      if (type === 'api_model' || type === 'api_provider') return formatApiModel(raw);
      if (type === 'tool') return formatTool(raw);
      if (type === 'prompt') return formatPrompt(raw);
      if (type === 'stem') return formatStem(raw);
      return formatSkill(raw);
    } catch (error) {
      console.warn(`Lỗi lấy chi tiết ${type}/${itemKey}:`, error);
      return null;
    }
  },

  /**
   * Lấy danh sách models của một API Provider cụ thể (OpenRouter, Anthropic, OpenAI...) cho dropdown
   * @param {string} itemKey - e.g. 'openrouter', 'anthropic', 'openai', 'google-gemini'
   */
  async getApiProviderModels(itemKey) {
    if (!itemKey) return { provider: null, models: [] };
    try {
      const res = await httpClient.get(API.AI_TOOLS.API_MODELS(itemKey));
      return {
        provider: res?.provider || null,
        models: Array.isArray(res?.data) ? res.data : [],
      };
    } catch (error) {
      console.warn(`Lỗi lấy danh sách models của ${itemKey}:`, error);
      return { provider: null, models: [] };
    }
  },
};
