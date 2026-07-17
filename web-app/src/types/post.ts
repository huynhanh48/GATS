import { CourseCategory, CourseTag, CourseAuthor } from './course';

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  thumbnail?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  category?: CourseCategory | null;
  tags?: CourseTag[];
  author?: CourseAuthor | null;
}
