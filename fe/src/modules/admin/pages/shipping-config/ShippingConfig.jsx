import React from 'react';
import { Truck } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function ShippingConfig() {
  return (
    <AdminSectionPlaceholder
      title="Cấu hình giao vận"
      description="Thiết lập phí vận chuyển theo khu vực, kết nối đối tác giao hàng."
      icon={Truck}
    />
  );
}
