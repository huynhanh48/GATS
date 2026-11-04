import React from 'react';
import { Image } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function AdminMedia() {
  return (
    <AdminSectionPlaceholder
      title="Thư viện Media và Hero Slides"
      description="Quản lý hình ảnh, video và banner slide hiển thị trên trang chủ."
      icon={Image}
    />
  );
}
