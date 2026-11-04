import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

/**
 * CourseFaqTab - Tab 3: Câu hỏi thường gặp (FAQ)
 */
export default function CourseFaqTab() {
  const faqs = [
    {
      question: 'Khóa học này dành cho ai và có yêu cầu biết lập trình trước không?',
      answer:
        'Khóa học được thiết kế dành cho mọi đối tượng từ người mới bắt đầu đến người đi làm, quản lý doanh nghiệp. Bạn hoàn toàn không cần kiến thức lập trình chuyên sâu, các bài giảng đều hướng dẫn từng bước trực quan và dễ tiếp thu.',
    },
    {
      question: 'Sau khi thanh toán tôi có thể học trong bao lâu?',
      answer:
        'Bạn sẽ được sở hữu khóa học vĩnh viễn và truy cập không giới hạn thời gian. Đồng thời bạn nhận được toàn bộ các bản cập nhật nội dung bài giảng mới trong tương lai.',
    },
    {
      question: 'Tôi có được cấp chứng chỉ sau khi hoàn thành khóa học không?',
      answer:
        'Có. Sau khi xem đầy đủ các bài giảng và hoàn thành các bài tập thực hành/bài kiểm tra cuối khóa, hệ thống GATS Academy sẽ tự động cấp chứng chỉ hoàn thành khóa học điện tử chuẩn quốc tế.',
    },
    {
      question: 'Tôi có được hỗ trợ giải đáp thắc mắc trong quá trình học không?',
      answer:
        'Có. Bạn có thể đặt câu hỏi trực tiếp dưới mỗi bài học hoặc tham gia nhóm hỗ trợ học viên độc quyền của GATS Academy để được đội ngũ giảng viên và trợ giảng giải đáp 24/7.',
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
        <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1a56db] flex items-center justify-center">
          <HelpCircle size={18} />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#273044]">
          Câu hỏi thường gặp
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="border border-slate-200 rounded-[10px] overflow-hidden bg-white shadow-2xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
              >
                <span className="font-bold text-sm sm:text-base text-[#273044]">
                  {faq.question}
                </span>
                <span className="text-slate-400 shrink-0">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              {isOpen && (
                <div className="p-5 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
