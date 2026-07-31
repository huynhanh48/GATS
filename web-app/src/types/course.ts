/**
 * Type definitions for Course-related API responses.
 * Matches the shape returned by the GATS Academy backend.
 */

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  type: string;
  status?: string;
  description?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  courseCount?: number;
  postCount?: number;
}

export interface CourseTag {
  id: string;
  name: string;
  slug: string;
  type: string;
}

export interface CourseStats {
  enrollmentCount: number;
  ratingCount: number;
  averageRating: number | null;
  ratingDistribution?: Record<number, number>;
  sectionCount: number;
  lessonCount: number;
  totalDurationSeconds: number;
}

export interface CourseAuthor {
  id: number;
  userName: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  introVideo?: string | null;
  price: number;
  salePrice?: number | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  category?: CourseCategory | null;
  tags?: CourseTag[];
  author?: CourseAuthor | null;
  stats?: CourseStats | null;
  learningOutcomes?: any[];
  includes?: any[];
  sections?: any[];
}

export interface PaginationData {
  skip: number;
  take: number;
  total: number;
  hasMore: boolean;
  page: number;
  totalPages: number;
}

export interface CoursesListResponse {
  data: Course[];
  pagination: PaginationData;
}

export interface CourseDetailResponse {
  course: Course;
}
