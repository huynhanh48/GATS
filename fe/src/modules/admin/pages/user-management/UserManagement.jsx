import React from 'react';
import { Users } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function UserManagement() {
  return (
    <AdminSectionPlaceholder
      title="Quản lý người dùng"
      description="Quản lý danh sách học viên, giảng viên và phân quyền quản trị."
      icon={Users}
    />
  );
}
