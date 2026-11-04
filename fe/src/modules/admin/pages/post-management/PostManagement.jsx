import React from 'react';
import { FileText } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function PostManagement() {
  return (
    <AdminSectionPlaceholder
      title="Quản lý bài viết Blog"
      description="Biên tập bài viết, tối ưu On-page SEO và xuất bản nội dung."
      icon={FileText}
    />
  );
}
