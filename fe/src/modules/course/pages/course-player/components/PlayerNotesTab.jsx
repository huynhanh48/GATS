import React, { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';

/**
 * PlayerNotesTab - Tab quản lý và tạo ghi chú cho bài học
 */
export default function PlayerNotesTab({ notes = [], onAddNote, onDeleteNote }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddNote({
      id: Date.now().toString(),
      time: '02:45',
      content: content.trim(),
      date: new Date().toLocaleDateString('vi-VN'),
    });
    setContent('');
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-[#f8fafc] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#273044] mb-1">
            Ghi chú bài học
          </h2>
          <p className="text-xs text-slate-500">
            Lưu lại các kiến thức cốt lõi và các điểm mốc thời gian quan trọng để ôn tập nhanh chóng.
          </p>
        </div>

        {/* Form thêm ghi chú */}
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-[10px] border border-slate-200 shadow-2xs space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung ghi chú cho bài giảng hiện tại..."
            rows={3}
            className="w-full p-3 text-xs sm:text-sm border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#1a56db] transition-colors resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Plus size={14} />
              <span>Thêm ghi chú</span>
            </button>
          </div>
        </form>

        {/* Danh sách ghi chú */}
        <div className="space-y-3">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-white p-4 rounded-[10px] border border-slate-200 shadow-2xs flex items-start justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[4px] bg-blue-50 text-[#1a56db] text-[11px] font-bold flex items-center gap-1">
                      <Clock size={11} />
                      <span>{note.time}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {note.date}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {note.content}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteNote(note.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Xóa ghi chú"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center bg-white rounded-[10px] border border-slate-200 p-6">
              <p className="text-xs sm:text-sm text-slate-400">
                Chưa có ghi chú nào cho bài học này. Hãy tạo ghi chú đầu tiên của bạn ở trên!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
