import React from 'react';
import { Warehouse } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function WarehouseManagement() {
  return (
    <AdminSectionPlaceholder
      title="Quản lý kho vận"
      description="Kiểm soát nhập xuất tồn sách, giáo trình và quà tặng học viên."
      icon={Warehouse}
    />
  );
}
