import React, { useState } from 'react';
import { Send } from 'lucide-react';

/**
 * PlayerDiscussionsTab - Tab thảo luận và hỏi đáp bài học
 */
export default function PlayerDiscussionsTab({ currentLessonTitle: _currentLessonTitle }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: 'Nguyễn Văn Hùng',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      time: 'Hôm qua',
      content: 'Cho mình hỏi phần cấu hình API có cần cài thêm môi trường nào không ạ?',
      replies: [
        {
          id: 101,
          author: 'GATS Instructor',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          time: 'Hôm qua',
          content: 'Chào bạn, bạn chỉ cần làm theo video bài giảng hướng dẫn và không cần cài thêm thư viện nào khác nhé!',
        },
      ],
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        author: 'Tôi (Học viên)',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
        time: 'Vừa xong',
        content: inputMsg.trim(),
        replies: [],
      },
    ]);
    setInputMsg('');
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-[#f8fafc] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#273044] mb-1">
            Thảo luận bài học
          </h2>
          <p className="text-xs text-slate-500">
            Đặt câu hỏi và trao đổi trực tiếp cùng cộng đồng học viên và ban giảng huấn GATS Academy.
          </p>
        </div>

        {/* Form gửi thảo luận */}
        <form onSubmit={handleSend} className="bg-white p-5 rounded-[10px] border border-slate-200 shadow-2xs space-y-3">
          <textarea
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Đặt câu hỏi hoặc chia sẻ ý kiến về bài học..."
            rows={3}
            className="w-full p-3 text-xs sm:text-sm border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#1a56db] transition-colors resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Send size={13} />
              <span>Gửi câu hỏi</span>
            </button>
          </div>
        </form>

        {/* Danh sách tin thảo luận */}
        <div className="space-y-4">
          {messages.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-[10px] border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.author}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#273044]">
                    {item.author}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.time}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-12 font-medium">
                {item.content}
              </p>

              {/* Phản hồi (Replies) */}
              {item.replies && item.replies.length > 0 && (
                <div className="ml-12 pl-4 border-l-2 border-blue-200 space-y-3 pt-2">
                  {item.replies.map((reply) => (
                    <div key={reply.id} className="space-y-1 bg-slate-50 p-3 rounded-[8px]">
                      <div className="flex items-center gap-2">
                        <img
                          src={reply.avatar}
                          alt={reply.author}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-[#1a56db]">
                          {reply.author}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {reply.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 pl-8">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
