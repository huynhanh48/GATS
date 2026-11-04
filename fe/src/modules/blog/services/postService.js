import { httpClient } from '@/shared/api-client/httpClient';
import { API } from '@/shared/constants/api';
import { resolveMediaUrl } from '@/shared/utils/media';

/**
 * Chuẩn hóa an toàn object Post trả về từ Backend API
 */
export function formatPost(raw) {
  if (!raw) return null;

  let authorName = 'GATS Academy';
  let authorAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';
  let authorBio = 'Đội ngũ chuyên gia đào tạo và phát triển hệ sinh thái chuyển đổi số tại GATS Academy.';

  if (typeof raw.author === 'string') {
    authorName = raw.author;
  } else if (raw.author && typeof raw.author === 'object') {
    authorName =
      raw.author.userName ||
      raw.author.name ||
      raw.author.fullName ||
      raw.author.email ||
      'GATS Academy';
    if (raw.author.avatar || raw.author.avatarUrl) {
      authorAvatar = resolveMediaUrl(raw.author.avatar || raw.author.avatarUrl, authorAvatar);
    }
    if (typeof raw.author.bio === 'string') {
      authorBio = raw.author.bio;
    }
  } else if (raw.user && typeof raw.user === 'object') {
    authorName =
      raw.user.userName ||
      raw.user.name ||
      raw.user.fullName ||
      raw.user.email ||
      'GATS Academy';
    if (raw.user.avatar || raw.user.avatarUrl) {
      authorAvatar = resolveMediaUrl(raw.user.avatar || raw.user.avatarUrl, authorAvatar);
    }
    if (typeof raw.user.bio === 'string') {
      authorBio = raw.user.bio;
    }
  } else if (typeof raw.userName === 'string') {
    authorName = raw.userName;
  }

  let catName = 'Insights';
  if (typeof raw.category === 'string') {
    catName = raw.category;
  } else if (raw.category && typeof raw.category === 'object') {
    catName = raw.category.name || raw.category.title || raw.category.slug || 'Insights';
  }

  const tagsList = Array.isArray(raw.tags)
    ? raw.tags
        .map((t) => (typeof t === 'string' ? t : t?.name || t?.slug || ''))
        .filter(Boolean)
    : [];

  const titleStr = typeof raw.title === 'string' ? raw.title : 'Bài viết chuyên môn';
  const slugStr = typeof raw.slug === 'string'
    ? raw.slug
    : titleStr.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return {
    id: raw.id || raw._id || raw.postId || 1,
    slug: slugStr,
    title: titleStr,
    subtitle: typeof raw.subtitle === 'string' ? raw.subtitle : (typeof raw.summary === 'string' ? raw.summary : ''),
    excerpt:
      typeof raw.excerpt === 'string'
        ? raw.excerpt
        : typeof raw.summary === 'string'
          ? raw.summary
          : titleStr.length > 80
            ? titleStr.slice(0, 80) + '...'
            : 'Khám phá các bài viết chuyên môn và giải pháp AI thực chiến từ GATS Academy.',
    content: typeof raw.content === 'string' ? raw.content : (typeof raw.body === 'string' ? raw.body : ''),
    image: resolveMediaUrl(
      raw.thumbnail || raw.image || raw.coverImage,
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80'
    ),
    thumbnail: resolveMediaUrl(
      raw.thumbnail || raw.image || raw.coverImage,
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
    ),
    category: catName,
    tags: tagsList,
    date: raw.publishedAt || raw.createdAt
      ? new Date(raw.publishedAt || raw.createdAt).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '05/03/2026',
    rawDate: raw.publishedAt || raw.createdAt || new Date().toISOString(),
    author: String(authorName),
    authorAvatar: String(authorAvatar),
    authorBio: String(authorBio),
    views: typeof raw.views === 'number' ? raw.views : (typeof raw.viewCount === 'number' ? raw.viewCount : 1250),
    likes: typeof raw.likes === 'number' ? raw.likes : (typeof raw.likeCount === 'number' ? raw.likeCount : 42),
    commentsCount: typeof raw.commentsCount === 'number' ? raw.commentsCount : (typeof raw.commentCount === 'number' ? raw.commentCount : 0),
    readingTime: typeof raw.readingTime === 'number' ? raw.readingTime : 5,
    raw,
  };
}

export const postService = {
  /**
   * Lấy danh sách bài viết
   */
  async getPosts(params = {}) {
    try {
      const res = await httpClient.get(API.POSTS.LIST, { params });
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.posts)
          ? res.posts
          : Array.isArray(res)
            ? res
            : [];
      return list.map(formatPost).filter(Boolean);
    } catch {
      return [];
    }
  },

  /**
   * Chi tiết bài viết theo slug
   */
  async getPostBySlug(slug) {
    try {
      const res = await httpClient.get(API.POSTS.DETAIL(slug));
      const data = res?.data || res?.post || res;
      if (data && (data.id || data.title || data.slug)) {
        return formatPost(data);
      }
    } catch {
      // Fallback: Tìm bài trong danh sách
      try {
        const posts = await this.getPosts();
        const found = posts.find((p) => p.slug === slug);
        if (found) return found;
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Thả tim / Bỏ like bài viết
   */
  async toggleLikePost(postId) {
    return httpClient.post(API.POSTS.LIKE(postId));
  },

  /**
   * Lấy danh sách bình luận của bài viết và chuẩn hóa author/content
   */
  async getComments(postId) {
    try {
      const res = await httpClient.get(API.POSTS.COMMENTS(postId));
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.comments)
          ? res.comments
          : Array.isArray(res)
            ? res
            : [];

      return list.map((c, idx) => {
        let authorName = 'Học viên GATS';
        let authorAvatar = '';

        if (typeof c.author === 'string') {
          authorName = c.author;
        } else if (c.author && typeof c.author === 'object') {
          authorName = c.author.userName || c.author.name || c.author.fullName || 'Học viên GATS';
          authorAvatar = c.author.avatar || c.author.avatarUrl || '';
        } else if (c.user && typeof c.user === 'object') {
          authorName = c.user.userName || c.user.name || c.user.fullName || 'Học viên GATS';
          authorAvatar = c.user.avatar || c.user.avatarUrl || '';
        } else if (typeof c.userName === 'string') {
          authorName = c.userName;
        }

        if (!authorAvatar) {
          authorAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(authorName))}`;
        }

        return {
          id: c.id || c._id || `c_${idx}`,
          author: String(authorName),
          avatar: String(authorAvatar),
          date: c.createdAt || c.publishedAt
            ? new Date(c.createdAt || c.publishedAt).toLocaleDateString('vi-VN')
            : 'Gần đây',
          content: typeof c.content === 'string' ? c.content : '',
          likes: typeof c.likes === 'number' ? c.likes : (c.likeCount || 0),
        };
      });
    } catch {
      return [];
    }
  },

  /**
   * Gửi bình luận vào bài viết
   */
  async addComment(postId, { content, parentId }) {
    return httpClient.post(API.POSTS.COMMENTS(postId), { content, parentId });
  },

  /**
   * Thả tim bình luận
   */
  async likeComment(postId, commentId) {
    return httpClient.post(API.POSTS.COMMENT_LIKE(postId, commentId));
  },
};
