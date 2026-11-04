import React from 'react';
import { ShoppingCart } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function OrderManagement() {
  return (
    <AdminSectionPlaceholder
      title="Quản lý đơn hàng"
      description="Theo dõi, xác nhận và xử lý giao vận đơn hàng từ người dùng."
      icon={ShoppingCart}
    />
  );
}
