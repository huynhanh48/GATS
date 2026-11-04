import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, PlayCircle, Clock, Loader2 } from 'lucide-react';
import { httpClient } from '@/shared/api-client/httpClient';
import { API } from '@/shared/constants/api';
import { formatCourse } from '@/modules/course/services/courseService';

export default function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadEnrolledCourses() {
      setLoading(true);
      try {
        let rawList = [];
        try {
          const res = await httpClient.get(API.ENROLLMENTS.MY_ENROLLMENTS);
          rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        } catch {
          const fallbackRes = await httpClient.get(API.COURSES.MY_COURSES);
          rawList = Array.isArray(fallbackRes?.data) ? fallbackRes.data : Array.isArray(fallbackRes) ? fallbackRes : [];
        }

        if (mounted) {
          const formatted = rawList
            .map((item) => {
              const rawCourse = item.course || item;
              if (!rawCourse) return null;
              const course = formatCourse(rawCourse);
              return course
                ? {
                    ...course,
                    progress: Math.min(100, Math.max(0, Number(item.percent ?? item.progress ?? 0))),
                  }
                : null;
            })
            .filter(Boolean);

          setCourses(formatted);
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách khóa học của tôi:', err);
        if (mounted) {
          setCourses([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadEnrolledCourses();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#273044]">
            Khóa học
          </h2>
        </div>
        <Link
          to="/courses"
          className="text-xs font-bold text-[#1a56db] hover:underline shrink-0"
        >
          Khám phá
        </Link>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-[10px] border border-slate-100">
          <Loader2 size={32} className="animate-spin text-[#1a56db]" />
          <p className="text-xs font-medium text-slate-500">Đang tải danh sách khóa học...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-slate-50/80 rounded-[10px] border border-dashed border-slate-200 p-12 text-center">
          <BookOpen size={44} className="text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-[#273044] text-sm mb-1">Chưa có khóa học nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Bạn chưa tham gia khóa học nào. Hãy đăng ký ngay để bắt đầu lộ trình học tập chuyên sâu.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs font-bold transition-all shadow-2xs"
          >
            <PlayCircle size={15} /> <span>Xem danh sách khóa học</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((item, idx) => {
            const progress = item.progress || 0;
            return (
              <div
                key={item.id || item.slug || idx}
                className="bg-white rounded-[10px] border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:-translate-y-0.5"
              >
                <div>
                  {/* Course Image */}
                  <div
                    className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer"
                    onClick={() => navigate(`/courses/learn/${item.slug || item.id}`)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/20" />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#10b981] text-white uppercase tracking-wider shadow-xs">
                      Đã kích hoạt
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    <span className="text-[11px] font-bold text-[#1a56db] uppercase tracking-wider block truncate">
                      {item.category || 'Khóa học GATS'}
                    </span>

                    <h3
                      className="text-sm font-extrabold text-[#273044] group-hover:text-[#1a56db] transition-colors line-clamp-2 leading-snug cursor-pointer min-h-[38px]"
                      onClick={() => navigate(`/courses/learn/${item.slug || item.id}`)}
                    >
                      {item.title}
                    </h3>

                    {/* Meta specs */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" /> {item.duration || '6 giờ'}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={12} className="text-slate-400" /> {item.lectures || '24 bài học'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Tiến độ hoàn thành:</span>
                        <span className="font-bold text-[#273044]">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1a56db] rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/courses/learn/${item.slug || item.id}`)}
                    className="w-full py-2 px-3 rounded-[6px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <PlayCircle size={14} />
                    <span>{progress > 0 ? 'Tiếp tục bài học' : 'Vào học ngay'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
