export type PostAuthor = {
  id: number;
  userName: string;
};

export type PostTag = {
  id: string;
  name: string;
  slug: string;
};

export type PostTagWithCount = PostTag & {
  postCount: number;
};

export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'members_only';
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  author: PostAuthor;
  tags: PostTag[];
};

export type PostDetail = PostListItem & {
  content: string;
};

export type PostPagination = {
  skip: number;
  take: number;
  total: number;
  hasMore: boolean;
  page?: number;
  totalPages?: number;
};

export type CommentListItem = {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  status: 'visible' | 'hidden' | 'deleted';
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked: boolean;
  author: PostAuthor;
};

export type ApiResponse<T> = {
  data: T;
  pagination?: PostPagination;
};

export type ApiError = {
  error: string;
};
