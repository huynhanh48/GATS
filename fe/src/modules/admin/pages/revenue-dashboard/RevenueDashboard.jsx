import React from 'react';
import { DollarSign } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function RevenueDashboard() {
  return (
    <AdminSectionPlaceholder
      title="Báo cáo Doanh thu và Dòng tiền"
      description="Biểu đồ phân tích doanh thu khóa học, sản phẩm và chiết khấu hoa hồng."
      icon={DollarSign}
    />
  );
}
