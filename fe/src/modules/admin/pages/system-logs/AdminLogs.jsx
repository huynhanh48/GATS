import { ScrollText } from 'lucide-react';
import AdminSectionPlaceholder from '../../components/AdminSectionPlaceholder';

export default function AdminLogs() {
  return (
    <AdminSectionPlaceholder
      title="Nhật ký hệ thống"
      description="Theo dõi các hoạt động quản trị và thay đổi quan trọng trên hệ thống."
      icon={ScrollText}
    />
  );
}
