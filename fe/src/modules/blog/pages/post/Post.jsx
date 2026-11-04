import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '@/modules/blog/services/postService';
import { useAuthStore } from '@/modules/auth';
import { resolveMediaUrl } from '@/shared/utils/media';
import {
  Calendar,
  Clock,
  Eye,
  MessageSquare,
  ThumbsUp,
  Share2,
  Printer,
  ChevronRight,
  Send,
  Loader2,
  Flame,
  Tag,
  BookOpen,
  Mail,
} from 'lucide-react';

export default function Post() {
  const { slug } = useParams();
  const { user } = useAuthStore();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [copied, setCopied] = useState(false);

  // Danh sách bài viết khác cho Sidebar và Related
  const [allPosts, setAllPosts] = useState([]);

  // Bình luận State
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // 1. Tải chi tiết bài viết và danh sách bài viết từ Backend API
  useEffect(() => {
    let mounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadData() {
      setLoading(true);
      try {
        const [detailData, listData] = await Promise.all([
          postService.getPostBySlug(slug),
          postService.getPosts(),
        ]);

        if (mounted) {
          if (detailData) {
            setPost(detailData);
            setLikesCount(detailData.likes || 0);
          } else {
            setPost(null);
          }

          if (Array.isArray(listData) && listData.length > 0) {
            setAllPosts(listData);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải bài viết từ Backend:', err);
        if (mounted) {
          setPost(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (slug) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [slug]);

  // 2. Tải bình luận của bài viết
  useEffect(() => {
    let mounted = true;
    async function loadComments() {
      if (!post?.id) return;
      try {
        const cList = await postService.getComments(post.id);
        if (mounted && Array.isArray(cList) && cList.length > 0) {
          setComments(cList);
        } else if (mounted) {
          setComments([
            {
              id: 'c1',
              author: 'Nguyễn Văn Hùng',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
              date: 'Hôm qua lúc 14:30',
              content: 'Bài viết phân tích rất thực tế và chi tiết! Cảm ơn đội ngũ GATS Academy đã chia sẻ.',
              likes: 5,
              isLiked: false,
            },
            {
              id: 'c2',
              author: 'Trần Thị Mai',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
              date: 'Hôm nay lúc 09:15',
              content: 'Mình đã áp dụng thử tính năng Learning Hub mới và thấy quản lý tiến độ học tập tiện lợi hơn rất nhiều.',
              likes: 3,
              isLiked: false,
            },
          ]);
        }
      } catch {
        // Ignored
      }
    }

    loadComments();
    return () => {
      mounted = false;
    };
  }, [post?.id]);

  // Xử lý Like bài viết
  const handleLike = async () => {
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      if (post?.id) {
        try {
          await postService.toggleLikePost(post.id);
        } catch {
          // Optimistic update
        }
      }
    }
  };

  // Xử lý Like comment
  const handleCommentLike = (commentId) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const nextIsLiked = !c.isLiked;
          const nextLikes = nextIsLiked ? (c.likes || 0) + 1 : Math.max(0, (c.likes || 0) - 1);
          return { ...c, isLiked: nextIsLiked, likes: nextLikes };
        }
        return c;
      })
    );

    if (post?.id) {
      try {
        postService.likeComment(post.id, commentId);
      } catch {
        // Optimistic
      }
    }
  };

  // Sao chép liên kết chia sẻ
  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Chia sẻ mạng xã hội
  const handleShareSocial = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const titleText = encodeURIComponent(post?.title || 'Bài viết GATS Academy');
    let shareUrl = '';

    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${titleText}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    } else if (platform === 'telegram') {
      shareUrl = `https://t.me/share/url?url=${url}&text=${titleText}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=450');
    }
  };

  // In bài viết
  const handlePrint = () => {
    window.print();
  };

  // Gửi bình luận
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setSubmittingComment(true);
    const authorName = user?.userName || user?.name || 'Bạn đọc';
    const authorAvatar = resolveMediaUrl(
      user?.avatar || user?.avatarUrl || user?.image,
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`
    );

    const newComment = {
      id: `c_${Date.now()}`,
      author: authorName,
      avatar: authorAvatar,
      date: 'Vừa xong',
      content: commentInput.trim(),
      likes: 0,
      isLiked: false,
    };

    setComments([newComment, ...comments]);
    setCommentInput('');

    if (post?.id) {
      try {
        await postService.addComment(post.id, { content: newComment.content });
      } catch {
        // Keep optimistic
      }
    }
    setSubmittingComment(false);
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center gap-3 bg-[#f8fafc]">
        <Loader2 size={36} className="animate-spin text-[#1a56db]" />
        <p className="text-xs font-medium text-slate-500">Đang tải nội dung bài viết...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-6 text-center bg-[#f8fafc]">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1a56db] flex items-center justify-center mb-4">
          <BookOpen size={28} />
        </div>
        <h2 className="text-xl font-bold text-[#273044] mb-2">
          Không tìm thấy bài viết
        </h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Bài viết bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang đường dẫn khác.
        </p>
        <Link
          to="/blog"
          className="px-6 py-2.5 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold transition-all shadow-sm"
        >
          Quay lại danh sách bài viết
        </Link>
      </div>
    );
  }

  // Dữ liệu hiển thị an toàn
  const displayPost = post;
  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);
  const popularPosts = [...allPosts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  const currentUserAvatar = resolveMediaUrl(
    user?.avatar || user?.avatarUrl || user?.image,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.userName || user?.name || 'User')}`
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 sm:py-12">
      {/* VÙNG CHỨA CÙNG CHIỀU RỘNG CHUẨN CONTAINER */}
      <div className="container">
        {/* ========================================================
            1. BREADCRUMB ĐIỀU HƯỚNG CHUẨN JANNAH
            ======================================================== */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#1a56db] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={13} className="text-slate-300" />
          <Link to="/blog" className="hover:text-[#1a56db] transition-colors">
            Bài viết
          </Link>
          <ChevronRight size={13} className="text-slate-300" />
          <Link
            to={`/blog?category=${encodeURIComponent(displayPost.category)}`}
            className="text-slate-600 hover:text-[#1a56db] transition-colors font-semibold"
          >
            {displayPost.category}
          </Link>
          <ChevronRight size={13} className="text-slate-300" />
          <span className="text-slate-400 truncate max-w-xs sm:max-w-md">
            {displayPost.title}
          </span>
        </nav>

        {/* ========================================================
            2. HEADER BÀI VIẾT CHUẨN JANNAH THEME (Category, Title, Excerpt, Meta)
            ======================================================== */}
        <header className="bg-white rounded-[10px] border border-slate-200/90 p-6 sm:p-10 mb-8 shadow-2xs space-y-4">
          {/* Huy hiệu chuyên mục */}
          <div>
            <Link
              to={`/blog?category=${encodeURIComponent(displayPost.category)}`}
              className="inline-block px-3 py-1 bg-[#1a56db] text-white text-xs font-bold rounded-[4px] uppercase tracking-wider hover:bg-[#1545b3] transition-colors shadow-2xs"
            >
              {displayPost.category}
            </Link>
          </div>

          {/* Tiêu đề H1 lớn */}
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-black text-[#273044] leading-tight tracking-tight">
            {displayPost.title}
          </h1>

          {/* Đoạn mô tả / Subtitle mở đầu */}
          {displayPost.subtitle && (
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              {displayPost.subtitle}
            </p>
          )}

          {/* Thanh thông tin Meta Bar chuẩn phong cách báo chí */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            {/* Tác giả, Ngày tháng, Lượt xem, Thời gian đọc */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium">
              <div className="flex items-center gap-2">
                <img
                  src={displayPost.authorAvatar}
                  alt={displayPost.author}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
                <span className="text-[#273044] font-bold">
                  Bởi {displayPost.author}
                </span>
              </div>

              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                {displayPost.date}
              </span>

              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-slate-400" />
                {displayPost.views.toLocaleString()} lượt xem
              </span>

              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" />
                {displayPost.readingTime} phút đọc
              </span>

              <span className="flex items-center gap-1.5">
                <MessageSquare size={14} className="text-slate-400" />
                {comments.length} bình luận
              </span>
            </div>

            {/* Các nút công cụ: In, Chia sẻ */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="p-2 rounded-[6px] text-slate-500 hover:text-[#1a56db] hover:bg-slate-100 transition-colors cursor-pointer"
                title="In bài viết"
                aria-label="In bài viết"
              >
                <Printer size={16} />
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#1a56db] font-bold text-xs transition-colors border border-slate-200 cursor-pointer"
              >
                <Share2 size={13} />
                <span>{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
              </button>
            </div>
          </div>

          {/* ========================================================
              3. THANH CHIA SẺ MẠNG XÃ HỘI (Social Share Buttons)
              ======================================================== */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleShareSocial('facebook')}
              className="px-3.5 py-1.5 rounded-[6px] bg-[#1877f2] hover:bg-[#1464cc] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Facebook</span>
            </button>
            <button
              type="button"
              onClick={() => handleShareSocial('twitter')}
              className="px-3.5 py-1.5 rounded-[6px] bg-[#1da1f2] hover:bg-[#0c85d0] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Twitter</span>
            </button>
            <button
              type="button"
              onClick={() => handleShareSocial('linkedin')}
              className="px-3.5 py-1.5 rounded-[6px] bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>LinkedIn</span>
            </button>
            <button
              type="button"
              onClick={() => handleShareSocial('telegram')}
              className="px-3.5 py-1.5 rounded-[6px] bg-[#229ed9] hover:bg-[#1b81b2] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Telegram</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-[6px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>{copied ? 'Đã sao chép liên kết' : 'Sao chép link'}</span>
            </button>
          </div>
        </header>

        {/* ========================================================
            4. ẢNH ĐẠI DIỆN BÀI VIẾT (FEATURED IMAGE - FULL CONTAINER)
            ======================================================== */}
        <div className="mb-8 rounded-[10px] overflow-hidden border border-slate-200/80 shadow-sm bg-white">
          <img
            src={displayPost.image}
            alt={displayPost.title}
            className="w-full h-auto object-cover block"
            loading="eager"
          />
        </div>

        {/* ========================================================
            5. LAYOUT 2 CỘT CHUẨN JANNAH: 8 CỘT NỘI DUNG + 4 CỘT SIDEBAR
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI (8 Cột): NỘI DUNG BÀI VIẾT VÀ TƯƠNG TÁC */}
          <div className="lg:col-span-8 min-w-0 space-y-8">
            <article className="bg-white rounded-[10px] border border-slate-200/90 p-6 sm:p-10 shadow-2xs space-y-8 overflow-hidden">
              {/* Nội dung chi tiết bài viết */}
              {displayPost.content ? (
                <div
                  className="tiptap-rendered-content text-slate-700 text-sm sm:text-base leading-relaxed space-y-5 overflow-hidden max-w-full"
                  dangerouslySetInnerHTML={{ __html: displayPost.content }}
                />
              ) : (
                <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-5">
                  <p className="font-semibold text-lg text-[#273044]">
                    {displayPost.excerpt}
                  </p>
                  <p>
                    Chào mừng bạn đến với chuyên mục phân tích công nghệ từ GATS Academy. Nội dung bài viết đang được cập nhật chi tiết.
                  </p>
                </div>
              )}

              {/* Thẻ từ khóa của bài viết (Post Tags) */}
              {displayPost.tags && displayPost.tags.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
                      <Tag size={13} /> Thẻ:
                    </span>
                    {displayPost.tags.map((t) => (
                      <Link
                        key={t}
                        to={`/blog?tag=${encodeURIComponent(t)}`}
                        className="px-3 py-1 rounded-[6px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#1a56db] text-xs font-semibold transition-colors"
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Nút Thích bài viết và Chia sẻ ở cuối */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-xs font-extrabold transition-all cursor-pointer shadow-2xs ${liked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                >
                  <ThumbsUp size={15} className={liked ? 'fill-current' : ''} />
                  <span>{liked ? 'Đã thích bài viết' : 'Thích bài viết'}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white text-slate-800 text-[11px] font-bold border border-slate-200">
                    {likesCount}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Chia sẻ:</span>
                  <button
                    type="button"
                    onClick={() => handleShareSocial('facebook')}
                    className="w-8 h-8 rounded-full bg-[#1877f2] text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer text-xs font-bold"
                  >
                    f
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareSocial('twitter')}
                    className="w-8 h-8 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer text-xs font-bold"
                  >
                    t
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-[6px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {copied ? 'Đã sao chép' : 'Copy link'}
                  </button>
                </div>
              </div>
            </article>

            {/* ========================================================
                KHỐI THÔNG TIN TÁC GIẢ (ABOUT AUTHOR BOX)
                ======================================================== */}
            <div className="bg-white rounded-[10px] border border-slate-200/90 p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <img
                src={displayPost.authorAvatar}
                alt={displayPost.author}
                className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md shrink-0"
              />
              <div className="space-y-2 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-base font-extrabold text-[#273044]">
                    {displayPost.author}
                  </h3>
                  <span className="text-xs font-bold text-[#1a56db] uppercase tracking-wider">
                    Tác giả chuyên môn
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {displayPost.authorBio}
                </p>
                <div className="pt-2">
                  <Link
                    to="/blog"
                    className="text-xs font-bold text-[#1a56db] hover:underline"
                  >
                    Xem tất cả bài viết của tác giả
                  </Link>
                </div>
              </div>
            </div>

            {/* ========================================================
                BÀI VIẾT LIÊN QUAN (RELATED POSTS)
                ======================================================== */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-[10px] border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-[#273044] flex items-center gap-2">
                    <Flame size={18} className="text-[#1a56db]" />
                    <span>Bài viết liên quan</span>
                  </h3>
                  <Link
                    to="/blog"
                    className="text-xs font-bold text-[#1a56db] hover:underline"
                  >
                    Xem thêm
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {relatedPosts.map((rPost) => (
                    <article key={rPost.id} className="space-y-2.5 group">
                      <Link
                        to={`/post/${rPost.slug}`}
                        className="block aspect-[16/10] rounded-[8px] overflow-hidden bg-slate-100 border border-slate-200/60 relative"
                      >
                        <img
                          src={rPost.thumbnail}
                          alt={rPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Link>
                      <span className="text-[11px] font-bold text-[#1a56db] uppercase">
                        {rPost.category}
                      </span>
                      <h4 className="text-xs font-bold text-[#273044] group-hover:text-[#1a56db] transition-colors line-clamp-2 leading-snug">
                        <Link to={`/post/${rPost.slug}`}>{rPost.title}</Link>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {rPost.date}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================
                KHU VỰC BÌNH LUẬN VÀ THẢO LUẬN (COMMENTS SECTION)
                ======================================================== */}
            <div className="bg-white rounded-[10px] border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-[#273044] flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#1a56db]" />
                  <span>Bình luận</span>
                </h3>
              </div>

              {/* Form gửi bình luận kèm Avatar tác giả lấy từ User API */}
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={currentUserAvatar}
                    alt={user?.userName || 'User Avatar'}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 mt-1 shadow-2xs"
                  />
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Chia sẻ ý kiến hoặc đặt câu hỏi về bài viết này..."
                      rows={3}
                      required
                      className="w-full p-3.5 rounded-[8px] border border-slate-200 text-xs sm:text-sm text-[#273044] placeholder:text-slate-400 focus:outline-none focus:border-[#1a56db] transition-colors bg-white shadow-2xs"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {user
                          ? `Đang bình luận: ${user.userName || user.name || 'Thành viên'}`
                          : 'Vui lòng nhập bình luận lịch sự'}
                      </span>
                      <button
                        type="submit"
                        disabled={submittingComment || !commentInput.trim()}
                        className="px-5 py-2 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Send size={13} />
                        <span>Gửi bình luận</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Danh sách các bình luận */}
              <div className="space-y-4 pt-2">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!
                  </p>
                ) : (
                  comments.map((cm) => {
                    const authorStr =
                      typeof cm.author === 'string'
                        ? cm.author
                        : cm.author?.userName || cm.author?.name || cm.user?.userName || cm.user?.name || cm.userName || 'Học viên GATS';
                    const rawAvatar =
                      cm.avatar ||
                      cm.avatarUrl ||
                      cm.authorAvatar ||
                      cm.author?.avatar ||
                      cm.author?.avatarUrl ||
                      cm.user?.avatar ||
                      cm.user?.avatarUrl;
                    const avatarStr = resolveMediaUrl(
                      rawAvatar,
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorStr)}`
                    );
                    const contentStr =
                      typeof cm.content === 'string' ? cm.content : '';
                    const dateStr =
                      typeof cm.date === 'string' ? cm.date : 'Gần đây';

                    return (
                      <div
                        key={cm.id}
                        className="p-4 rounded-[8px] bg-slate-50/80 border border-slate-200/60 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={avatarStr}
                              alt={authorStr}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-[#273044]">
                                {authorStr}
                              </h4>
                              <span className="text-[10px] text-slate-400">
                                {dateStr}
                              </span>
                            </div>
                          </div>

                          {/* Nút Thích Bình Luận chuẩn Icon ThumbsUp */}
                          <button
                            type="button"
                            onClick={() => handleCommentLike(cm.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer border ${cm.isLiked
                                ? 'bg-blue-50 text-[#1a56db] border-blue-200'
                                : 'bg-white text-slate-500 hover:text-[#1a56db] hover:bg-slate-100 border-slate-200'
                              }`}
                            title="Thích bình luận"
                          >
                            <ThumbsUp
                              size={13}
                              className={cm.isLiked ? 'fill-current text-[#1a56db]' : 'text-slate-400'}
                            />
                            <span>{cm.likes || 0}</span>
                          </button>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed pl-10">
                          {contentStr}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (4 Cột): SIDEBAR CHUẨN JANNAH */}
          <aside className="lg:col-span-4 space-y-6">
            {/* 1. TOP BÀI VIẾT XEM NHIỀU NHẤT (POPULAR / TRENDING) */}
            <div className="bg-white rounded-[10px] border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-[#273044] flex items-center gap-2">
                  <Flame size={16} className="text-rose-500" />
                  <span>Xem nhiều nhất</span>
                </h3>
              </div>

              <div className="space-y-3.5">
                {popularPosts.map((pPost, idx) => (
                  <article
                    key={pPost.id}
                    className="flex items-start gap-3 group cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-[4px] bg-slate-100 text-[#273044] group-hover:bg-[#1a56db] group-hover:text-white transition-colors text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="text-xs font-bold text-[#273044] group-hover:text-[#1a56db] transition-colors line-clamp-2 leading-snug">
                        <Link to={`/post/${pPost.slug}`}>{pPost.title}</Link>
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                        <span>{pPost.date}</span>
                        <span>•</span>
                        <span>{pPost.views} lượt xem</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* 2. KHUNG ĐĂNG KÝ BẢN TIN (NEWSLETTER WIDGET GỌN GÀNG VÀ CÓ ICON EMAIL) */}
            <div className="rounded-[10px] bg-slate-900 p-5 text-white shadow-sm border border-slate-800 space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Mail size={16} className="text-blue-400 shrink-0" />
                  <span>Nhận bản tin</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Cập nhật bài viết và tin tức AI mới nhất hàng tuần.
                </p>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-2.5 pt-1">
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="email"
                    placeholder="Email của bạn..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-[6px] bg-slate-800/90 border border-slate-700 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-[6px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </form>
            </div>

            {/* 3. DANH MỤC BÀI VIẾT (CATEGORIES WIDGET) */}
            <div className="bg-white rounded-[10px] border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-[#273044] flex items-center gap-2">
                  <BookOpen size={16} className="text-[#1a56db]" />
                  <span>Danh mục</span>
                </h3>
              </div>

              <div className="space-y-1.5">
                {[
                  'Updates và Features',
                  'Tutorials',
                  'Comparison',
                  'Case Studies',
                  'Insights',
                ].map((cat) => (
                  <Link
                    key={cat}
                    to={`/blog?category=${encodeURIComponent(cat)}`}
                    className="flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#1a56db] transition-colors"
                  >
                    <span>{cat}</span>
                    <span className="text-[11px] text-slate-400">Xem</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
