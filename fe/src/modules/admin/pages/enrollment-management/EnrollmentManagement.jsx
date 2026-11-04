import React from 'react';
import { GraduationCap } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function EnrollmentManagement() {
  return (
    <AdminSectionPlaceholder
      title="Quản lý đăng ký học viên"
      description="Danh sách học viên đăng ký các khóa học và phê duyệt kích hoạt."
      icon={GraduationCap}
    />
  );
}
