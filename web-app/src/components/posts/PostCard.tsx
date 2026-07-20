import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const formattedDate = post.publishedAt || post.createdAt 
    ? new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(post.publishedAt || post.createdAt))
    : 'Gần đây';

  // Extract category name for badge
  const categoryName = post.category?.name || 'Bài viết';

  return (
    <Link href={`/posts/${post.slug}`} className="group flex flex-col h-full bg-card rounded-3xl overflow-hidden border border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Thumbnail Area */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {post.thumbnail ? (
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10 text-muted-foreground">
            No Image
          </div>
        )}
        
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-secondary text-secondary-foreground shadow-md">
            {categoryName}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-5 md:p-6">
        <h3 className="text-xl md:text-2xl font-bold text-card-foreground leading-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
          {post.excerpt || 'Đang cập nhật nội dung...'}
        </p>

        {/* Footer meta */}
        <div className="flex items-center justify-between text-muted-foreground text-sm mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center">
            <span className="mr-1.5 font-medium">{post.author?.userName || 'GATS Academy'}</span>
            <User className="w-4 h-4 text-secondary" />
          </div>
        </div>
      </div>
    </Link>
  );
};
