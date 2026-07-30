import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User } from 'lucide-react';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
  isList?: boolean;
}

export const PostCard = ({ post, isList = false }: PostCardProps) => {
  const formattedDate = post.publishedAt || post.createdAt 
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(post.publishedAt || post.createdAt))
    : 'Gần đây';

  // Extract category name for badge
  const categoryName = post.category?.name || 'Bài viết';

  return (
    <Link 
      href={`/posts/${post.slug}`} 
      className={`group flex h-full bg-white rounded-3xl overflow-hidden border border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isList ? 'flex-col md:flex-row' : 'flex-col'}`}
    >
      {/* Thumbnail Area */}
      <div className={`relative overflow-hidden bg-muted shrink-0 ${isList ? 'w-full md:w-[280px] lg:w-[320px] aspect-[4/3] md:aspect-auto' : 'w-full aspect-[16/9]'}`}>
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
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#ff782d] text-white shadow-md">
            {categoryName}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex flex-col flex-1 p-5 ${isList ? 'md:p-8' : 'md:p-6'}`}>
        <h3 className={`font-bold text-[#111827] leading-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors ${isList ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
          {post.title}
        </h3>
        
        <p className="text-slate-500 text-[1.4rem] line-clamp-3 mb-6 flex-1">
          {post.excerpt || 'Đang cập nhật nội dung...'}
        </p>

        {/* Footer meta */}
        <div className="flex items-center justify-between text-slate-500 text-[1.3rem] mt-auto">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-[#ff782d]" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center">
            <span className="mr-1.5 font-medium">{post.author?.userName || 'GATS Academy'}</span>
            <User className="w-4 h-4 text-[#ff782d]" />
          </div>
        </div>
      </div>
    </Link>
  );
};
