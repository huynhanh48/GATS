import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BookFinLoading from '@/shared/components/BookFinLoading';

import CoursesPage from '../pages/courses/CoursesPage';
const CourseDetailPage = lazy(() => import('../pages/course-detail/CourseDetailPage'));
const CoursePaymentInstruction = lazy(() => import('../pages/course-payment/CoursePaymentInstruction'));
const MyCourses = lazy(() => import('../pages/my-courses/MyCourses'));
const RoadmapPage = lazy(() => import('../pages/roadmap/RoadmapPage'));

/**
 * Dedicated Router cho module Khóa học (Course Module)
 * Quản lý độc lập toàn bộ các tuyến đường liên quan đến khóa học
 */
export default function CourseRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[500px] flex items-center justify-center bg-[#F8FAFC]">
          <BookFinLoading />
        </div>
      }
    >
      <Routes>
        {/* Trang chính: Courses Page chuẩn 100% template MasterStudy Marketing LMS */}
        <Route index element={<CoursesPage />} />

        {/* Lộ trình học tập chuyên sâu (Roadmap) */}
        <Route path="roadmap" element={<RoadmapPage />} />

        {/* Chuyển hướng các route phụ về trang khóa học chính */}
        <Route path="archive" element={<Navigate to="/courses" replace />} />
        <Route path="carousel" element={<Navigate to="/courses" replace />} />

        {/* Hướng dẫn thanh toán khóa học */}
        <Route path="payment" element={<CoursePaymentInstruction />} />

        {/* Khóa học của tôi */}
        <Route path="my-courses" element={<MyCourses />} />

        {/* Chi tiết khóa học và bài giảng */}
        <Route path=":slug/:lessonSlug?" element={<CourseDetailPage />} />
      </Routes>
    </Suspense>
  );
}
