import React from 'react';
import { Mail } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function ContactManagement() {
  return (
    <AdminSectionPlaceholder
      title="Liên hệ và Phản hồi"
      description="Yêu cầu tư vấn và tin nhắn gửi từ học viên qua biểu mẫu."
      icon={Mail}
    />
  );
}
