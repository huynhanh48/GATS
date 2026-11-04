import React from 'react';
import { Send } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function NewsletterManagement() {
  return (
    <AdminSectionPlaceholder
      title="Quản lý Bản tin Newsletter"
      description="Danh sách email đăng ký nhận tin, chiến dịch email marketing tự động."
      icon={Send}
    />
  );
}
