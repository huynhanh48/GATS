import React from 'react';
import { Package } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function ProductManagement() {
  return (
    <AdminSectionPlaceholder
      title="Quản lý sản phẩm và Giáo trình"
      description="Quản trị danh mục sản phẩm, cập nhật giá và tồn kho."
      icon={Package}
    />
  );
}
