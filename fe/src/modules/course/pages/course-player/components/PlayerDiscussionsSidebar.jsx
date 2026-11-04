import React, { useState, useEffect } from 'react';
import { X, Plus, MessageSquare, Send, ThumbsUp, CornerDownRight } from 'lucide-react';
import { useAuthStore } from '@/modules/auth';

/**
 * PlayerDiscussionsSidebar - Sidebar thảo luận và hỏi đáp dạng Drawer chuẩn template MasterStudy
 * - Hỗ trợ đăng bình luận mới và Trả lời (Reply) theo từng comment
 * - Like / Bỏ like chuẩn xác: Mỗi tài khoản chỉ được like 1 lần (toggle)
 * - Tự động hiển thị tên và avatar của tài khoản đang đăng nhập
 */
export default function PlayerDiscussionsSidebar({
  isOpen,
  onClose,
  currentLessonTitle,
  courseId,
  lessonId,
}) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const currentUserId = String(user?.id || user?._id || user?.userId || user?.userName || user?.email || 'guest');
  const storageKey = `gats_discussions_${courseId || 'default'}_${lessonId || 'general'}`;

  // Tải thảo luận từ LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, [storageKey]);

  if (!isOpen) return null;

  const getAuthorInfo = () => {
    const authorName =
      user?.userName || user?.name || user?.email?.split('@')[0] || 'Học viên GATS';
    const avatarUrl =
      user?.avatarUrl ||
      user?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;
    return { authorName, avatarUrl };
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const { authorName, avatarUrl } = getAuthorInfo();

    const newMsg = {
      id: Date.now(),
      author: authorName,
      avatar: avatarUrl,
      userId: currentUserId,
      time: 'Vừa xong',
      content: commentText.trim(),
      likes: 0,
      likedUserIds: [],
      replies: [],
    };

    const updated = [newMsg, ...messages];
    setMessages(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setCommentText('');
    setIsFormOpen(false);
  };

  const handleAddReply = (parentId, e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const { authorName, avatarUrl } = getAuthorInfo();

    const newReply = {
      id: Date.now(),
      author: authorName,
      avatar: avatarUrl,
      userId: currentUserId,
      time: 'Vừa xong',
      content: replyText.trim(),
      likes: 0,
      likedUserIds: [],
    };

    const updated = messages.map((m) => {
      if (m.id === parentId) {
        return {
          ...m,
          replies: [...(m.replies || []), newReply],
        };
      }
      return m;
    });

    setMessages(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setReplyText('');
    setReplyingToId(null);
  };

  // Like / Unlike toggle logic (1 like per account)
  const handleToggleLike = (msgId, isReply = false, parentId = null) => {
    const updated = messages.map((m) => {
      if (!isReply && m.id === msgId) {
        const likedIds = Array.isArray(m.likedUserIds) ? [...m.likedUserIds] : [];
        const hasLiked = likedIds.includes(currentUserId);
        const newLikedIds = hasLiked
          ? likedIds.filter((id) => id !== currentUserId)
          : [...likedIds, currentUserId];

        return {
          ...m,
          likedUserIds: newLikedIds,
          likes: newLikedIds.length,
        };
      }

      if (isReply && m.id === parentId && Array.isArray(m.replies)) {
        return {
          ...m,
          replies: m.replies.map((rep) => {
            if (rep.id === msgId) {
              const likedIds = Array.isArray(rep.likedUserIds) ? [...rep.likedUserIds] : [];
              const hasLiked = likedIds.includes(currentUserId);
              const newLikedIds = hasLiked
                ? likedIds.filter((id) => id !== currentUserId)
                : [...likedIds, currentUserId];

              return {
                ...rep,
                likedUserIds: newLikedIds,
                likes: newLikedIds.length,
              };
            }
            return rep;
          }),
        };
      }

      return m;
    });

    setMessages(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full sm:static sm:z-30 sm:w-96 bg-[#f4f7fa] border-l border-slate-200/90 h-full flex flex-col shadow-2xl sm:shadow-xl transition-all duration-200 shrink-0"
      aria-label="Khung thảo luận bài học"
    >
      {/* 1. Header Sidebar Thảo Luận */}
      <div className="h-16 px-5 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm sm:text-base">
          <MessageSquare size={17} className="text-[#1a56db]" />
          <span>Discussions</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          aria-label="Đóng bảng thảo luận"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. Top Action Bar: Nút + Comment */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-slate-500 truncate max-w-[200px]">
          {currentLessonTitle || 'Bài học hiện tại'}
        </span>
        <button
          type="button"
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            setReplyingToId(null);
          }}
          className="px-3.5 py-1.5 rounded-[6px] bg-[#e8f1ff] hover:bg-[#d6e5ff] text-[#1a56db] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none"
        >
          <Plus size={14} />
          <span>Comment</span>
        </button>
      </div>

      {/* Form nhập Comment khi bấm nút + Comment */}
      {isFormOpen && (
        <div className="p-4 bg-white border-b border-slate-200/80 animate-in fade-in slide-in-from-top-2 duration-150 shrink-0">
          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Đặt câu hỏi hoặc chia sẻ ý kiến về bài học..."
              rows={3}
              className="w-full p-3 text-xs border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#1a56db] bg-[#f8fafc] resize-none"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold rounded-[6px] transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Send size={12} />
                <span>Gửi thảo luận</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Thân danh sách thảo luận (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          /* Empty State chuẩn MasterStudy */
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12">
            <div className="w-14 h-14 rounded-full bg-[#e8f1ff] text-[#1a56db] flex items-center justify-center mb-3">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-base font-extrabold text-[#273044] mb-1">
              No discussions yet...
            </h3>
            <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">
              Here you can ask a question or discuss a topic with instructors and classmates
            </p>
          </div>
        ) : (
          /* Danh sách bình luận & Phản hồi */
          messages.map((item) => {
            const isItemLiked = Array.isArray(item.likedUserIds) && item.likedUserIds.includes(currentUserId);

            return (
              <div
                key={item.id}
                className="bg-white p-4 rounded-[10px] border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.avatar}
                    alt={item.author}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#273044] truncate">
                      {item.author}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {item.time}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {item.content}
                </p>

                {/* Actions: Thích và Trả lời */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(item.id, false)}
                    className={`inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                      isItemLiked ? 'text-[#1a56db]' : 'text-slate-500 hover:text-[#1a56db]'
                    }`}
                  >
                    <ThumbsUp size={12} className={isItemLiked ? 'fill-[#1a56db]' : ''} />
                    <span>{item.likes || 0} Thích</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingToId(replyingToId === item.id ? null : item.id);
                      setReplyText('');
                    }}
                    className="text-[#1a56db] hover:underline font-semibold cursor-pointer"
                  >
                    {replyingToId === item.id ? 'Đóng trả lời' : 'Trả lời'}
                  </button>
                </div>

                {/* Form Trả lời trực tiếp */}
                {replyingToId === item.id && (
                  <div className="pt-2.5 border-t border-slate-100 animate-in fade-in duration-150">
                    <form onSubmit={(e) => handleAddReply(item.id, e)} className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Trả lời @${item.author}...`}
                        rows={2}
                        className="w-full p-2.5 text-xs border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#1a56db] bg-[#f8fafc] resize-none"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyText('');
                          }}
                          className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-[#1a56db] hover:bg-[#1545b3] text-white text-[11px] font-bold rounded-[6px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Send size={11} />
                          <span>Gửi trả lời</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Danh sách các câu trả lời (Replies) */}
                {Array.isArray(item.replies) && item.replies.length > 0 && (
                  <div className="pt-2 pl-3 border-l-2 border-blue-100 space-y-2.5 mt-2 bg-slate-50/70 p-2.5 rounded-[8px]">
                    {item.replies.map((reply) => {
                      const isReplyLiked =
                        Array.isArray(reply.likedUserIds) && reply.likedUserIds.includes(currentUserId);

                      return (
                        <div key={reply.id} className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2">
                            <CornerDownRight size={11} className="text-slate-400 shrink-0" />
                            <img
                              src={reply.avatar}
                              alt={reply.author}
                              className="w-5 h-5 rounded-full object-cover border border-slate-200"
                            />
                            <h5 className="text-[11px] font-bold text-[#273044] truncate">
                              {reply.author}
                            </h5>
                            <span className="text-[9px] text-slate-400 ml-auto">
                              {reply.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-700 pl-5 leading-relaxed font-medium">
                            {reply.content}
                          </p>
                          <div className="pl-5 pt-1 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleLike(reply.id, true, item.id)}
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
                                isReplyLiked ? 'text-[#1a56db]' : 'text-slate-500 hover:text-[#1a56db]'
                              }`}
                            >
                              <ThumbsUp size={10} className={isReplyLiked ? 'fill-[#1a56db]' : ''} />
                              <span>{reply.likes || 0} Thích</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

