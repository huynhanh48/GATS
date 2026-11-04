import React from 'react';
import { FolderTree } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function CategoryManagement() {
  return (
    <AdminSectionPlaceholder
      title="Quản lý danh mục"
      description="Cấu trúc phân cấp danh mục khóa học, bài viết và sản phẩm."
      icon={FolderTree}
    />
  );
}
