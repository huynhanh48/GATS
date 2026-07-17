'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, Send, MessageSquare, LogIn, Reply, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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

  const currentUsername = user?.userName || '';
  const [reloadKey, setReloadKey] = useState(0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    if (!isAuthenticated) {
      handleLoginPrompt();
      return;
    }

    setSubmitting(true);
    try {
      const response = (await apiClient.post(PathApi.comments.create(postId), {
        content: content.trim(),
      })) as { comment?: Comment; data?: Comment };

      const newComment = response.comment || response.data;
      if (newComment) {
        const enrichedComment: Comment = {
          ...newComment,
          likeCount: 0,
          isLiked: false,
          author: {
            id: newComment.userId,
            userName: currentUsername || 'Bạn',
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

    if (!isAuthenticated) {
      handleLoginPrompt();
      return;
    }

    setSubmittingReply(true);
    try {
      const response = (await apiClient.post(PathApi.comments.createReply(postId, parentId), {
        content: replyContent.trim(),
      })) as { comment?: Comment; data?: Comment };

      const newReply = response.comment || response.data;
      if (newReply) {
        const enrichedReply: Comment = {
          ...newReply,
          likeCount: 0,
          isLiked: false,
          author: {
            id: newReply.userId,
            userName: currentUsername || 'Bạn',
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
      <div key={comment.id} className={`flex gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-colors ${isReply ? 'mt-2' : ''}`}>
        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-sm uppercase ${getAvatarColor(comment.author?.userName || 'Khách')} shadow-sm`}>
          {(comment.author?.userName || 'Khách').substring(0, 2)}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground text-sm">
                {comment.author?.userName || 'Khách'}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat('vi-VN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(comment.createdAt))}
              </span>
            </div>

            {isOwner && (
              <button
                onClick={() => handleDelete(comment, isReply)}
                className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-500/10"
                title="Xóa bình luận"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap mt-1">
            {comment.content}
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => handleLike(comment, isReply)}
              className={`flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-full hover:bg-muted transition-colors ${comment.isLiked
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span>{comment.likeCount || 0}</span>
            </button>

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
                className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
                <span>Phản hồi</span>
              </button>
            )}

            {!isReply && showReplies && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-full text-primary hover:bg-primary/10 transition-colors ml-auto"
              >
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{replies.length || comment.replyCount} phản hồi</span>
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
    <div className="mt-20 pt-10 border-t border-border/40">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-[#0070EB]" />
        <h3 className="text-2xl font-bold text-foreground">
          Bình luận
        </h3>
      </div>

      {/* Comment Editor */}
      <div className="mb-10 bg-card/40 border border-border/40 backdrop-blur-md rounded-2xl p-6 shadow-sm">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-sm uppercase ${getAvatarColor(currentUsername)} shadow-sm`}>
                {currentUsername.substring(0, 2) || '??'}
              </div>
              <div className="w-full relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Chia sẻ ý kiến của bạn..."
                  className="w-full min-h-[90px] p-4 bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 rounded-xl focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none shadow-inner"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full flex items-center gap-2 hover:opacity-95 disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(0,112,235,0.2)] hover:shadow-[0_0_25px_rgba(0,112,235,0.4)] transition-all duration-300"
              >
                {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-muted-foreground text-sm max-w-sm">
              Tham gia thảo luận về bài học này cùng cộng đồng học viên tại GATS Academy.
            </p>
            <button
              onClick={handleLoginPrompt}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full flex items-center gap-2 hover:opacity-95 shadow-[0_0_20px_rgba(0,112,235,0.2)] transition-all duration-300"
            >
              <LogIn className="w-4.5 h-4.5" />
              Đăng nhập để bình luận
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-full shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded-full w-24"></div>
                <div className="h-3 bg-muted rounded-full w-full"></div>
                <div className="h-3 bg-muted rounded-full w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => renderComment(comment, false))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            Chưa có bình luận nào cho bài viết này. Hãy là người đầu tiên chia sẻ ý kiến của bạn!
          </p>
        </div>
      )}
    </div>
  );
};
