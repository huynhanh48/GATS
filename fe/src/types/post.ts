import { CourseCategory, CourseTag, CourseAuthor } from './course';

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  thumbnail?: string | null;
  status: string;
  visibility?: 'public' | 'private' | 'members_only';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  category?: CourseCategory | null;
  tags?: CourseTag[];
  author?: CourseAuthor | null;
  prevPost?: { title: string; slug: string } | null;
  nextPost?: { title: string; slug: string } | null;
}
