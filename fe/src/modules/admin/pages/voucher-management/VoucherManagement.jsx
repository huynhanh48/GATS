import React from 'react';
import { Ticket } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function VoucherManagement() {
  return (
    <AdminSectionPlaceholder
      title="Quản lý mã giảm giá"
      description="Thiết lập các chương trình khuyến mãi, mã voucher và chiết khấu khóa học."
      icon={Ticket}
    />
  );
}
