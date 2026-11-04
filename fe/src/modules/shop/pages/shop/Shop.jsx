import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';

export default function Shop() {
  const { category } = useParams();

  const demoProducts = [
    { id: 'tai-lieu-gats-pro', name: 'Bộ Giáo Trình GATS Pro 2026', price: '450.000đ', category: 'sach', rating: 4.9 },
    { id: 'template-notion-student', name: 'Template Quản Lý Học Tập Notion', price: '120.000đ', category: 'tai-lieu', rating: 4.8 },
    { id: 'ao-thun-gats-signature', name: 'Áo Thun Polo GATS Signature', price: '290.000đ', category: 'phu-kien', rating: 5.0 },
  ];

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Cửa hàng GATS</h1>
        <p className="text-slate-500">Giáo trình, tài liệu và phụ kiện độc quyền từ GATS Academy.</p>
        {category && (
          <span className="inline-block mt-3 px-3 py-1 bg-blue-50 text-[#407bff] rounded-full text-xs font-semibold uppercase">
            Danh mục: {category}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoProducts.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="h-48 bg-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-400">
              <ShoppingBag size={48} />
            </div>
            <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
              <Star size={14} className="fill-amber-400" />
              <span className="font-semibold text-slate-700">{p.rating}</span>
            </div>
            <h3 className="font-bold text-slate-900 mb-2 line-clamp-1">{p.name}</h3>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <span className="font-bold text-lg text-[#407bff]">{p.price}</span>
              <Link
                to={`/product/${p.id}`}
                className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-[#407bff] hover:underline"
              >
                Chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
