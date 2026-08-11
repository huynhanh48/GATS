'use client';

import React, { useEffect, useState } from 'react';
import { Post } from '@/types/post';
import apiClient from '@/lib/apiClient';
import { PathApi } from '@/constants/PathApi';
import { Calendar, MessageCircle, Link as LinkIcon, User, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { PostComments } from '@/components/posts/PostComments';
import { BlogSidebar } from '@/components/posts/BlogSidebar';
import { Container } from '@/components/layout/Container';
import { theme as designTheme } from '@/lib/theme';

interface PostDetailClientProps {
  slug: string;
}

export const PostDetailClient = ({ slug }: PostDetailClientProps) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [processedContent, setProcessedContent] = useState<string>('');

  useEffect(() => {
    if (!post) return;
    setProcessedContent(post.content || '');
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const response: any = await apiClient.get(PathApi.posts.detail(slug));
        const postData = response?.post ?? null;
        if (postData && postData.slug) {
          setPost(postData);
        } else {
          setPost(null);
        }
      } catch (apiError: any) {
        const status = apiError?.status ?? apiError?.statusCode;
        if (status !== 404) {
          console.error('Error fetching post:', apiError);
        }
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // TOC logic
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [isTocOpen, setIsTocOpen] = useState(true);
  const tocListRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (!processedContent) return;

    const extractedHeadings: { id: string; text: string; level: number }[] = [];

    // Helper to slugify identical to MarkdownRenderer
    const slugify = (text: string) => {
      return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .trim();
    };

    // 1. Try Markdown headings
    const mdRegex = /^(#{2,3})\s+(.+)$/gm;
    let match;
    while ((match = mdRegex.exec(processedContent)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = slugify(text) || `h${level}-${Math.random().toString(36).substr(2, 5)}`;
      extractedHeadings.push({ id, text, level });
    }

    // 2. Try HTML headings if no markdown headings found (or if mixed)
    const htmlRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
    while ((match = htmlRegex.exec(processedContent)) !== null) {
      const level = parseInt(match[1]);
      // Strip inner tags if any (e.g. <h2><strong>Text</strong></h2>)
      const text = match[2].replace(/<[^>]+>/g, '').trim();
      // Try to extract existing id attribute
      const idMatch = match[0].match(/id=["']([^"']+)["']/);
      const id = idMatch ? idMatch[1] : (slugify(text) || `h${level}-${Math.random().toString(36).substr(2, 5)}`);
      
      // Avoid duplicates if markdown and HTML are somehow both parsed
      if (!extractedHeadings.find(h => h.text === text)) {
        extractedHeadings.push({ id, text, level });
      }
    }

    setHeadings(extractedHeadings);
  }, [processedContent]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
            if (tocListRef.current) {
              const activeLink = tocListRef.current.querySelector(`[data-toc-id="${entry.target.id}"]`);
              if (activeLink) {
                const container = tocListRef.current;
                const linkTop = (activeLink as HTMLElement).offsetTop;
                container.scrollTo({
                  top: linkTop - container.clientHeight / 2 + 20,
                  behavior: 'smooth'
                });
              }
            }
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveHeadingId(id);
    }
  };

  const hasHeadings = headings.length > 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-32 min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#111827]">Không tìm thấy bài viết</h1>
        <p className="text-xl text-slate-500 mb-8">Rất tiếc, bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link href="/posts" className="px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors">
          Quay lại trang Blog
        </Link>
      </div>
    );
  }

  const formattedDate = post.publishedAt || post.createdAt
    ? new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(post.publishedAt || post.createdAt))
    : '';

  return (
    <div className="body_wrap">
      <section className="breadcrumb bg_img ul_li" style={{ backgroundImage: "url(/edubost-reference/img/bg/breadcrumb_bg.jpg)" }}>
        <div className="container"><div className="breadcrumb__content text-center">
          <h1 className="breadcrumb__title">Chi tiết bài viết</h1>
          <p className="breadcrumb__desc">Phân tích chuyên sâu và kiến thức ứng dụng từ GATS Academy</p>
        </div></div>
      </section>

      <section className="blog_details_section section_space" style={{ backgroundColor: "#F1F1E9" }}><div className="container">
        
        <div className="row mt-none-30">
          
          {/* Main Content Column */}
          <article className="col-lg-8 mt-30">
            
            {/* Title & Meta */}
            <h1 className="details_item_title">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-slate-500 text-[1.3rem] mb-10">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#ff782d]" />
                <span className="font-medium text-slate-700">{post.author?.userName || 'Admin'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#ff782d]" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#ff782d]" />
                <span>0 Comments</span>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="details_item_image">
              {post.thumbnail ? (
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No image available
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className={cn(
              "mx-auto w-full max-w-4xl text-slate-600 leading-relaxed text-[1.7rem] md:text-[1.8rem]",
              "[&_h2]:text-[2.4rem] [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-6 [&_h2]:text-[#111827] [&_h2]:font-heading",
              "[&_h3]:text-[2rem] [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-[#111827] [&_h3]:font-heading",
              "[&_p]:mb-6 [&_p]:leading-[1.8]",
              "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-slate-700 [&_blockquote]:bg-slate-50 [&_blockquote]:rounded-r-xl [&_blockquote]:my-8",
              "[&_img]:rounded-2xl [&_img]:my-8 [&_img]:mx-auto",
              "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2",
              "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2",
              "[&_a]:text-primary hover:[&_a]:underline"
            )}>
              {processedContent ? (
                <MarkdownRenderer content={processedContent} />
              ) : (
                <>
                  <p className="text-[1.8rem] text-slate-700 font-medium mb-8">
                    {post.excerpt}
                  </p>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilisis faucibus odio arcu duis dui, adipiscing facilisis. Urna, donec turpis egestas volutpat. Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabitur lorem in. Pulvinar sit ultrices mi ut eleifend luctus ut. Id sed faucibus bibendum augue id cras purus. At eget euismod cursus non. Molestie dignissim sed volutpat feugiat vel enim eu turpis imperdiet.</p>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilisis faucibus odio arcu duis dui, adipiscing facilisis. Urna, donec turpis egestas volutpat. Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabitur lorem in. Pulvinar sit ultrices mi ut eleifend luctus ut. Id sed faucibus bibendum augue id cras purus.</p>
                </>
              )}
            </div>

            {/* Tags and Share */}
            <div className="mt-12 flex flex-col gap-6 pb-12 border-b border-border/10">
              <div className="flex items-center gap-6">
                <span className="text-[1.4rem] font-medium text-slate-700 w-[70px]">Từ khóa:</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags && post.tags.length > 0 ? (
                    post.tags.map(t => (
                      <Link 
                        href={`/posts?tag=${t.slug}`}
                        key={t.id} 
                        className="px-4 py-1.5 border border-slate-200 rounded-md text-[1.3rem] text-slate-600 hover:text-primary hover:border-primary transition-colors cursor-pointer"
                      >
                        {t.name}
                      </Link>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[1.3rem] italic">Chưa có từ khóa</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-[1.4rem] font-medium text-slate-700 w-[70px]">Chia sẻ:</span>
                <div className="flex items-center gap-4">
                  {['f', 'P', 'X', 'in', 'YT'].map((network, i) => (
                    <button key={i} className="flex items-center justify-center text-slate-500 hover:text-primary transition-colors text-[1.4rem] font-bold">
                      {network}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Previous / Next Article Links */}
            {(post.prevPost || post.nextPost) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
                {post.prevPost ? (
                  <Link href={`/posts/${post.prevPost.slug}`} className="flex items-center gap-4 p-6 border border-slate-100 rounded-2xl hover:border-primary/30 hover:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[1.2rem] text-slate-400 mb-1 block">Bài viết trước</span>
                      <h4 className="text-[1.4rem] font-bold text-[#111827] line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {post.prevPost.title}
                      </h4>
                    </div>
                  </Link>
                ) : <div />}
                
                {post.nextPost ? (
                  <Link href={`/posts/${post.nextPost.slug}`} className="flex items-center gap-4 p-6 border border-slate-100 rounded-2xl hover:border-primary/30 hover:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] transition-all cursor-pointer group text-right flex-row-reverse">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[1.2rem] text-slate-400 mb-1 block">Bài tiếp theo</span>
                      <h4 className="text-[1.4rem] font-bold text-[#111827] line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {post.nextPost.title}
                      </h4>
                    </div>
                  </Link>
                ) : <div />}
              </div>
            )}

            {/* Comments Section */}
            <PostComments postId={post.id} />
          </article>

          {/* Sidebar */}
          <div className="col-lg-4 mt-30"><BlogSidebar tocContent={
            hasHeadings ? (
              <div className="hidden lg:block mb-10">
                <button 
                  onClick={() => setIsTocOpen(!isTocOpen)}
                  className="w-full flex items-center justify-between text-[2rem] font-bold text-[#111827] font-heading mb-6 pb-2 border-b border-border/10 transition-colors hover:text-primary"
                >
                  Mục lục
                  <ChevronDown className={cn("w-6 h-6 transition-transform", isTocOpen ? "rotate-180" : "")} />
                </button>
                <AnimatePresence>
                  {isTocOpen && (
                    <motion.nav
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      ref={tocListRef}
                      aria-label="Mục lục bài viết"
                      className="flex flex-col gap-1.5 overflow-hidden"
                    >
                      {headings.map((heading) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          data-toc-id={heading.id}
                          onClick={(event) => handleTocClick(event, heading.id)}
                          className={cn(
                            'block rounded-xl px-4 py-2 text-[1.4rem] leading-relaxed transition-all duration-200',
                            heading.level === 3 && 'pl-8 text-[1.3rem]',
                            activeHeadingId === heading.id
                              ? 'bg-primary/10 font-bold text-primary'
                              : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                          )}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </motion.nav>
                  )}
                </AnimatePresence>
              </div>
            ) : undefined
          } /></div>

        </div>
      </div></section>
    </div>
  );
};
