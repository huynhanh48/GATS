import React from 'react';
import { BarChart2 } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function ReportManagement() {
  return (
    <AdminSectionPlaceholder
      title="Báo cáo tổng hợp và Xuất dữ liệu"
      description="Tổng hợp dữ liệu kinh doanh, tỷ lệ hoàn thành khóa học và xuất file Excel/CSV."
      icon={BarChart2}
    />
  );
}
