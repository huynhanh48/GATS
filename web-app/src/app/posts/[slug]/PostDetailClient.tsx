'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Post } from '@/types/post';
import apiClient from '@/lib/apiClient';
import { PathApi } from '@/constants/PathApi';
import { Calendar, MessageCircle, Link as LinkIcon, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { PostComments } from '@/components/posts/PostComments';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

type TocHeading = { id: string; text: string; level: number };

const HEADER_OFFSET = 110;

interface PostDetailClientProps {
  slug: string;
}

export const PostDetailClient = ({ slug }: PostDetailClientProps) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [processedContent, setProcessedContent] = useState<string>('');
  const tocListRef = useRef<HTMLDivElement>(null);

  // Dynamically extract headings and inject IDs if missing
  useEffect(() => {
    if (!post) return;
    
    let contentHtml = post.content || `
      <h2 id="h1">1. Tạo TVC Cho Thương Hiệu Nước Hoa Verde</h2>
      <p>Để bắt đầu dự án này, chúng ta cần một đề bài cụ thể...</p>
      <h2 id="h2">2. Thực Hành</h2>
      <h3 id="h3">2.1. Bước 1: Tạo Kịch Bản, Mô Tả Phân Cảnh Với Gemini</h3>
      <h3 id="h4">2.2. Bước 2: Tạo Video Bằng Google Flow</h3>
      <h3 id="h5">2.3. Bước 3: Tạo Nhạc Bằng Google Flow Music</h3>
    `;

    // Inject IDs to H2/H3 tags if they don't have them (for raw HTML blocks)
    let h2Count = 0;
    let h3Count = 0;
    contentHtml = contentHtml.replace(/<(h2|h3)([^>]*)>/gi, (match, tag, attrs) => {
      if (/id=/i.test(attrs)) {
        return match;
      }
      const id = tag === 'h2' ? `h2-${++h2Count}` : `h3-${++h3Count}`;
      return `<${tag} id="${id}"${attrs}>`;
    });

    setProcessedContent(contentHtml);
  }, [post]);

  // Sync headings from rendered DOM so TOC IDs always match content
  useEffect(() => {
    if (!processedContent) return;

    const syncHeadings = () => {
      const contentEl = document.querySelector('.js-toc-content');
      if (!contentEl) return false;

      const domHeadings = Array.from(contentEl.querySelectorAll('h2, h3'))
        .map((el) => ({
          id: el.id,
          text: (el.textContent || '').trim(),
          level: Number(el.tagName.charAt(1)),
        }))
        .filter((heading) => heading.id && heading.text);

      if (domHeadings.length > 0) {
        setHeadings(domHeadings);
        setActiveHeadingId((current) => current ?? domHeadings[0].id);
      }

      return domHeadings.length > 0;
    };

    if (syncHeadings()) return;

    const timer = window.setTimeout(() => {
      syncHeadings();
    }, 100);

    return () => window.clearTimeout(timer);
  }, [processedContent]);

  // Highlight TOC item for the section currently in view
  useEffect(() => {
    if (headings.length === 0) return;

    const contentEl = document.querySelector('.js-toc-content');
    if (!contentEl) return;

    const headingElements = Array.from(
      contentEl.querySelectorAll<HTMLElement>('h2, h3')
    ).filter((el) => el.id);

    if (headingElements.length === 0) return;

    const getScrollPosition = () => window.scrollY + HEADER_OFFSET + 16;
    const getHeadingTop = (heading: HTMLElement) =>
      heading.getBoundingClientRect().top + window.scrollY;

    const updateActiveHeading = () => {
      const scrollPosition = getScrollPosition();
      let currentId = headingElements[0].id;

      headingElements.forEach((heading) => {
        if (getHeadingTop(heading) <= scrollPosition) {
          currentId = heading.id;
        }
      });

      setActiveHeadingId(currentId);
    };

    updateActiveHeading();
    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    window.addEventListener('resize', updateActiveHeading);

    return () => {
      window.removeEventListener('scroll', updateActiveHeading);
      window.removeEventListener('resize', updateActiveHeading);
    };
  }, [headings]);

  // Keep active TOC link visible inside the sticky sidebar
  useEffect(() => {
    if (!activeHeadingId || !tocListRef.current) return;

    const activeLink = tocListRef.current.querySelector<HTMLElement>(
      `[data-toc-id="${activeHeadingId}"]`
    );

    activeLink?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [activeHeadingId]);

  const handleTocClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();

    const target = document.getElementById(id);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveHeadingId(id);
    window.history.replaceState(null, '', `#${id}`);
  };

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
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">Không tìm thấy bài viết</h1>
        <p className="text-xl text-muted-foreground mb-8">Rất tiếc, bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link href="/posts" className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 transition-opacity">
          Quay lại trang Blog
        </Link>
      </div>
    );
  }

  const formattedDate = post.publishedAt || post.createdAt
    ? new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(post.publishedAt || post.createdAt))
    : 'Gần đây';

  const hasHeadings = headings.length > 0;

  return (
    <div className="relative z-10 w-full bg-background pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        
        {/* Title */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="mb-6 flex justify-center">
            <Breadcrumb>
              <BreadcrumbList className="justify-center text-muted-foreground">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="hover:text-foreground transition-colors">
                      Trang chủ
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-muted-foreground/50 [&>svg]:size-3" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/posts" className="hover:text-foreground transition-colors">
                      Bài viết
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {post.category?.name ? (
                  <>
                    <BreadcrumbSeparator className="text-muted-foreground/50 [&>svg]:size-3" />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          href={`/posts?category=${post.category.slug || post.category.id}`}
                          className="hover:text-foreground transition-colors"
                        >
                          {post.category.name}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                ) : null}
                <BreadcrumbSeparator className="text-muted-foreground/50 [&>svg]:size-3" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-primary font-semibold max-w-[180px] truncate sm:max-w-[280px]">
                    {post.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4.5 h-4.5" />
              <span>0 comments</span>
            </div>
          </div>
        </div>

        {/* Hero Image / Video Thumbnail */}
        <div className="max-w-4xl mx-auto mb-20 relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/30 group">
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              priority
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}

          {/* Mock YouTube Play Button Overlay */}
          {post.slug.includes('tvc') && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer group-hover:bg-black/35 transition-colors">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform">
                <PlayCircle className="w-8 h-8 md:w-10 md:h-10" fill="currentColor" strokeWidth={0.5} />
              </div>
            </div>
          )}
        </div>

        {/* Content Layout */}
        <div className={cn(
          "grid grid-cols-1 items-start gap-12 lg:gap-16",
          hasHeadings ? "lg:grid-cols-12" : "max-w-3xl mx-auto"
        )}>

          {/* Left Column: Table of Contents */}
          {hasHeadings && (
            <div className="lg:col-span-3 hidden lg:block sticky top-28 pr-4">
              <h3 className="font-bold text-lg mb-4 text-foreground">Mục lục</h3>
              <nav
                ref={tocListRef}
                aria-label="Mục lục bài viết"
                className="flex max-h-[calc(100vh-12rem)] flex-col gap-1.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    data-toc-id={heading.id}
                    onClick={(event) => handleTocClick(event, heading.id)}
                    className={cn(
                      'block rounded-xl px-4 py-2 text-sm leading-relaxed transition-all duration-200',
                      heading.level === 3 && 'pl-8 text-xs',
                      activeHeadingId === heading.id
                        ? 'bg-muted/80 font-semibold text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>

              {/* Share links */}
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <button className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors text-xs font-bold shadow-sm">
                    FB
                  </button>
                  <button className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors text-xs font-bold shadow-sm">
                    TW
                  </button>
                  <button className="w-9 h-9 rounded-full bg-muted text-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors shadow-sm">
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Main Content */}
          <div className={cn(
            "col-span-1",
            hasHeadings ? "lg:col-span-9" : "w-full"
          )}>
            {processedContent ? (
              <MarkdownRenderer content={processedContent} className="js-toc-content" />
            ) : (
              <div className={cn(
                "js-toc-content w-full text-foreground/90 leading-relaxed text-lg",
                // Custom children styles for HTML typography
                "[&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:mt-14 [&_h2]:mb-6 [&_h2]:text-foreground [&_h2]:tracking-tight",
                "[&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:font-semibold [&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:text-foreground [&_h3]:tracking-tight",
                "[&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-6 [&_p]:text-base md:[&_p]:text-[1.125rem]",
                "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-foreground [&_blockquote]:bg-muted/40 [&_blockquote]:p-6 [&_blockquote]:rounded-r-2xl [&_blockquote]:my-8",
                "[&_img]:rounded-[2rem] [&_img]:my-12 [&_img]:border [&_img]:border-border/30 [&_img]:shadow-lg [&_img]:mx-auto",
                "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:text-muted-foreground",
                "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:text-muted-foreground",
                "[&_li]:mb-3 [&_li]:pl-1",
                "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary/80 transition-colors"
              )}>
                <>
                  <p className="text-xl md:text-2xl text-foreground/80 font-medium mb-8 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <h2 id="h1">1. Tạo TVC Cho Thương Hiệu Nước Hoa Verde</h2>
                  <p>Để bắt đầu dự án này, chúng ta cần một đề bài cụ thể. Trong bài viết ngày hôm nay, chúng ta sẽ cùng nhau thử nghiệm với một thương hiệu nước hoa giả định mang tên Verde. Nhiệm vụ là phải tạo ra một TVC ngắn khoảng 15 đến 30 giây để quảng cáo cho sản phẩm này.</p>
                  <p>Trước khi đi vào chi tiết, chúng ta cần phải xác định yêu cầu sáng tạo, hay còn gọi là creative brief cụ thể cho TVC này. Đối với thương hiệu nước hoa Verde, chúng ta sẽ định vị đây là một dòng nước hoa cao cấp dành cho những người trẻ đi làm, những người đang nỗ lực phát triển bản thân và khẳng định vị thế của mình trong xã hội.</p>

                  <h2 id="h2">2. Thực Hành</h2>

                  <h3 id="h3">2.1. Bước 1: Tạo Kịch Bản, Mô Tả Phân Cảnh Với Gemini</h3>
                  <p>Bước đầu tiên trong quá trình sản xuất hình ảnh chính là tạo storyboard. Storyboard giúp chúng ta hình dung trực quan toàn bộ câu chuyện sẽ diễn ra như thế nào trước khi tiến hành làm video.</p>

                  <div className="my-8 rounded-[2rem] overflow-hidden border border-border shadow-md">
                    <Image
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"
                      alt="Storyboard"
                      width={1000}
                      height={600}
                      className="w-full object-cover m-0"
                    />
                  </div>

                  <p>Để làm việc này, chúng ta sẽ sử dụng một công cụ AI hỗ trợ trò chuyện và xử lý hình ảnh. Ở đây Linh sẽ dùng Gemini, nhưng bạn hoàn toàn có thể sử dụng các AI khác như ChatGPT hoặc Claude đều được nha!</p>
                  <p>Ok, đầu tiên, bạn cần tải một bức hình sản phẩm gốc của chai nước hoa Verde lên Gemini và nhập câu lệnh:</p>

                  <blockquote>
                    "Hãy đóng vai trò là một giám đốc sáng tạo, viết cho tôi một kịch bản TVC 30s cho sản phẩm nước hoa Verde này. Mục tiêu là nhấn mạnh sự tự tin và thành công."
                  </blockquote>

                  <h3 id="h4">2.2. Bước 2: Tạo Video Bằng Google Flow</h3>
                  <p>Sử dụng các frame đã có từ Gemini, đưa vào Google Flow để tạo chuyển động mượt mà cho các cảnh quay.</p>
                </>
              </div>
            )}

            {/* Tags (Mock) */}
            <div className="mt-16 pt-8 border-t border-border/50 flex flex-wrap gap-2">
              {post.tags && post.tags.length > 0 ? (
                post.tags.map(t => (
                  <span key={t.id} className="px-3.5 py-1 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full text-xs md:text-sm text-muted-foreground transition-colors cursor-pointer font-medium">
                    #{t.name}
                  </span>
                ))
              ) : (
                <>
                  <span className="px-3.5 py-1 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full text-xs md:text-sm text-muted-foreground transition-colors cursor-pointer font-medium">
                    #AI
                  </span>
                  <span className="px-3.5 py-1 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full text-xs md:text-sm text-muted-foreground transition-colors cursor-pointer font-medium">
                    #TVC
                  </span>
                  <span className="px-3.5 py-1 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full text-xs md:text-sm text-muted-foreground transition-colors cursor-pointer font-medium">
                    #VideoMarketing
                  </span>
                </>
              )}
            </div>

            {/* Comments Section */}
            <PostComments postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
};
