import React from 'react';
import { Search } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function SearchLog() {
  return (
    <AdminSectionPlaceholder
      title="Nhật ký tìm kiếm"
      description="Thống kê các từ khóa được người dùng tìm kiếm nhiều nhất trên nền tảng."
      icon={Search}
    />
  );
}
