'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, Send, MessageSquare, LogIn, Reply, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { PathApi } from '@/constants/PathApi';
import { toast } from 'sonner';
import { useAuth, useAuthModal } from '@/hooks/useAuth';

interface Author {
  id: number;
  userName: string;
}

interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  userId: number;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked: boolean;
  author?: Author;
  replyCount?: number;
}

interface PostCommentsProps {
  postId: string;
}

// 4 brand colors matching the workspace rules
const BRAND_COLORS = [
  'bg-[#0070EB] text-white', // Technology / Default (Xanh Dương)
  'bg-[#FF7622] text-white', // Creative (Cam / Secondary)
  'bg-[#10B981] text-white', // Energy (Xanh Lá)
  'bg-[#F59E0B] text-black', // Machine Learning / Warning (Vàng Cam)
];

// Helper to assign a brand color based on the username string
const getAvatarColor = (username: string) => {
  if (!username) return BRAND_COLORS[0];
  const charSum = username.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return BRAND_COLORS[charSum % BRAND_COLORS.length];
};

export const PostComments = ({ postId }: PostCommentsProps) => {
  const { user, isAuthenticated, status } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Replies state
  const [repliesMap, setRepliesMap] = useState<Record<string, Comment[]>>({});
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Guest state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [saveGuestInfo, setSaveGuestInfo] = useState(false);

  const currentUsername = user?.userName || '';
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Load saved guest info
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('guestName');
      const savedEmail = localStorage.getItem('guestEmail');
      if (savedName) setGuestName(savedName);
      if (savedEmail) setGuestEmail(savedEmail);
      if (savedName || savedEmail) setSaveGuestInfo(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = (await apiClient.get(
          PathApi.comments.list(postId)
        )) as { data?: Comment[] };
        if (!cancelled && response?.data) {
          // Filter top level comments if backend returns flat list
          const allComments = response.data;
          const topLevel = allComments.filter(c => !c.parentId);
          setComments(topLevel);

          // Optionally populate repliesMap if all are returned flat
          const replies = allComments.filter(c => c.parentId);
          if (replies.length > 0) {
            const rMap: Record<string, Comment[]> = {};
            replies.forEach(r => {
              if (r.parentId) {
                if (!rMap[r.parentId]) rMap[r.parentId] = [];
                rMap[r.parentId].push(r);
              }
            });
            setRepliesMap(rMap);
            setExpandedReplies(new Set(Object.keys(rMap))); // Auto expand if they came together
          }
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          toast.error('Lỗi khi tải bình luận');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postId, reloadKey]);

  const handleLoginPrompt = () => {
    openAuthModal('login');
  };

  const handleSaveGuestInfo = () => {
    if (saveGuestInfo) {
      localStorage.setItem('guestName', guestName);
      localStorage.setItem('guestEmail', guestEmail);
    } else {
      localStorage.removeItem('guestName');
      localStorage.removeItem('guestEmail');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      toast.error('Vui lòng nhập Tên và Email để bình luận');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = { content: content.trim() };
      if (!isAuthenticated) {
        payload.guestName = guestName.trim();
        payload.guestEmail = guestEmail.trim();
        handleSaveGuestInfo();
      }

      const response = (await apiClient.post(PathApi.comments.create(postId), payload)) as { comment?: Comment; data?: Comment };

      const newComment = response.comment || response.data;
      if (newComment) {
        const enrichedComment: Comment = {
          ...newComment,
          likeCount: 0,
          isLiked: false,
          author: {
            id: newComment.userId || 0,
            userName: currentUsername || guestName.trim() || 'Bạn',
          },
        };
        setComments((prev) => [enrichedComment, ...prev]);
        setContent('');
        toast.success('Gửi bình luận thành công!');
      } else {
        setReloadKey((k) => k + 1);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Không thể gửi bình luận, vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || submittingReply) return;

    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      toast.error('Vui lòng nhập Tên và Email ở Form dưới cùng để phản hồi');
      return;
    }

    setSubmittingReply(true);
    try {
      const payload: any = { content: replyContent.trim() };
      if (!isAuthenticated) {
        payload.guestName = guestName.trim();
        payload.guestEmail = guestEmail.trim();
        handleSaveGuestInfo();
      }

      const response = (await apiClient.post(PathApi.comments.createReply(postId, parentId), payload)) as { comment?: Comment; data?: Comment };

      const newReply = response.comment || response.data;
      if (newReply) {
        const enrichedReply: Comment = {
          ...newReply,
          likeCount: 0,
          isLiked: false,
          author: {
            id: newReply.userId || 0,
            userName: currentUsername || guestName.trim() || 'Bạn',
          },
        };
        setRepliesMap(prev => ({
          ...prev,
          [parentId]: [...(prev[parentId] || []), enrichedReply]
        }));

        // Ensure replies are visible
        setExpandedReplies(prev => {
          const next = new Set(prev);
          next.add(parentId);
          return next;
        });

        setReplyingTo(null);
        setReplyContent('');
        toast.success('Gửi phản hồi thành công!');
      } else {
        setReloadKey((k) => k + 1);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Không thể gửi phản hồi, vui lòng thử lại!');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleLike = async (comment: Comment, isReply: boolean = false) => {
    if (!isAuthenticated) {
      handleLoginPrompt();
      return;
    }

    const originalLiked = comment.isLiked;
    const originalCount = comment.likeCount;
    const parentId = comment.parentId;

    // Optimistically update UI
    const updateFn = (c: Comment) =>
      c.id === comment.id
        ? { ...c, isLiked: !c.isLiked, likeCount: c.likeCount + (c.isLiked ? -1 : 1) }
        : c;

    if (isReply && parentId) {
      setRepliesMap(prev => ({
        ...prev,
        [parentId]: (prev[parentId] || []).map(updateFn)
      }));
    } else {
      setComments(prev => prev.map(updateFn));
    }

    try {
      if (originalLiked) {
        await apiClient.delete(PathApi.comments.unlike(postId, comment.id));
      } else {
        await apiClient.post(PathApi.comments.like(postId, comment.id));
      }
    } catch {
      // Revert if API fails
      const revertFn = (c: Comment) =>
        c.id === comment.id ? { ...c, isLiked: originalLiked, likeCount: originalCount } : c;

      if (isReply && parentId) {
        setRepliesMap(prev => ({
          ...prev,
          [parentId]: (prev[parentId] || []).map(revertFn)
        }));
      } else {
        setComments(prev => prev.map(revertFn));
      }
      toast.error('Không thể thực hiện tương tác');
    }
  };

  const handleDelete = async (comment: Comment, isReply: boolean = false) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) return;

    try {
      await apiClient.delete(PathApi.comments.delete(postId, comment.id));

      const parentId = comment.parentId;
      if (isReply && parentId) {
        setRepliesMap(prev => ({
          ...prev,
          [parentId]: (prev[parentId] || []).filter(c => c.id !== comment.id)
        }));
      } else {
        setComments(prev => prev.filter(c => c.id !== comment.id));
      }
      toast.success('Đã xóa bình luận');
    } catch {
      toast.error('Lỗi khi xóa bình luận');
    }
  };

  const toggleReplies = async (parentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });

    // If expanding and we don't have replies loaded, fetch them
    if (!expandedReplies.has(parentId) && (!repliesMap[parentId] || repliesMap[parentId].length === 0)) {
      try {
        const response = (await apiClient.get(PathApi.comments.replies(postId, parentId))) as { data?: Comment[] };
        if (response?.data) {
          setRepliesMap(prev => ({
            ...prev,
            [parentId]: response.data || []
          }));
        }
      } catch (e) {
        console.error('Failed to load replies', e);
      }
    }
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isOwner = comment.author?.userName === currentUsername && currentUsername !== '';
    const hasReplies = comment.replyCount && comment.replyCount > 0;
    const isExpanded = expandedReplies.has(comment.id);
    const replies = repliesMap[comment.id] || [];
    const showReplies = hasReplies || replies.length > 0;

    return (
      <div key={comment.id} className={`flex gap-5 ${isReply ? 'mt-6 ml-16' : ''}`}>
        <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-bold text-[1.4rem] uppercase ${getAvatarColor(comment.author?.userName || 'Khách')}`}>
          {(comment.author?.userName || 'Khách').substring(0, 2)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#111827] text-[1.5rem]">
              {comment.author?.userName || 'Khách'}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[1.3rem] text-slate-400">
                {new Intl.DateTimeFormat('en-US', {
                  month: 'long',
                  day: '2-digit',
                  year: 'numeric',
                }).format(new Date(comment.createdAt))}
              </span>
              {isOwner && (
                <button
                  onClick={() => handleDelete(comment, isReply)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  title="Xóa bình luận"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <p className="text-slate-500 text-[1.4rem] leading-relaxed whitespace-pre-wrap mb-2">
            {comment.content}
          </p>

          <div className="flex items-center gap-4">
            {!isReply && (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    handleLoginPrompt();
                    return;
                  }
                  setReplyingTo(replyingTo === comment.id ? null : comment.id);
                  setReplyContent('');
                }}
                className="flex items-center gap-1.5 text-[1.3rem] font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}

            {!isReply && showReplies && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-1.5 text-[1.3rem] font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>{replies.length || comment.replyCount} replies</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && !isReply && (
            <div className="mt-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
              <div className="w-full relative">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Phản hồi ${comment.author?.userName || 'người dùng'}...`}
                  className="w-full min-h-[70px] p-3 text-sm bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none shadow-inner"
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={submittingReply || !replyContent.trim()}
                    className="px-4 py-1.5 text-xs bg-primary text-primary-foreground font-semibold rounded-full flex items-center gap-1.5 hover:opacity-95 disabled:opacity-50 transition-all duration-300"
                  >
                    {submittingReply ? 'Đang gửi...' : 'Gửi'}
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Render Replies */}
          {!isReply && isExpanded && replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-border/40 space-y-2 animate-in fade-in slide-in-from-top-2">
              {replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-20 pt-10">
      <div className="mb-8">
        <h3 className="text-[2.2rem] font-bold text-[#111827] font-heading mb-2">
          Comments
        </h3>
        <p className="text-slate-500 text-[1.4rem]">{comments.length} Comments</p>
      </div>



      {/* Comments List */}
      {loading ? (
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0"></div>
              <div className="space-y-3 flex-1">
                <div className="h-4 bg-slate-200 rounded-full w-32"></div>
                <div className="h-3 bg-slate-200 rounded-full w-full"></div>
                <div className="h-3 bg-slate-200 rounded-full w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-8">
          {comments.map((comment) => renderComment(comment, false))}
          
          {/* Pagination Mock */}
          <div className="flex items-center justify-center gap-2 mt-12 pt-8">
            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-colors text-[1.4rem]">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center font-medium text-[1.4rem]">
              1
            </button>
            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-colors font-medium text-[1.4rem]">
              2
            </button>
            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-colors font-medium text-[1.4rem]">
              3
            </button>
            <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-colors text-[1.4rem]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-500 text-[1.4rem]">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}

      {/* Leave A Comment */}
      <div className="mt-16">
        <h3 className="text-[2.2rem] font-bold text-[#111827] font-heading mb-2">
          Leave A Comment
        </h3>
        <p className="text-slate-500 text-[1.4rem] mb-8">
          Your email address will not be published. Required fields are marked *
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Name*"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full p-4 bg-transparent border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors text-[1.4rem]"
                required
              />
              <input
                type="email"
                placeholder="Email*"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full p-4 bg-transparent border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors text-[1.4rem]"
                required
              />
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comment"
            className="w-full min-h-[160px] p-4 bg-transparent border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors resize-y text-[1.4rem]"
            required
          />
          {!isAuthenticated && (
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="save-info" 
                checked={saveGuestInfo}
                onChange={(e) => setSaveGuestInfo(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" 
              />
              <label htmlFor="save-info" className="text-[1.4rem] text-slate-500">
                Save my name, email in this browser for the next time I comment
              </label>
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-8 py-3 bg-[#FF7622] text-white font-semibold rounded-full hover:bg-[#FF7622]/90 disabled:opacity-50 transition-colors text-[1.4rem]"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
};
