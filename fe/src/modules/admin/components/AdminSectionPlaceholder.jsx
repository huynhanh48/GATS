import React from 'react';

export default function AdminSectionPlaceholder({ title, description, icon: Icon }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        {Icon && <Icon size={48} className="text-slate-300 mx-auto mb-3" />}
        <h3 className="font-semibold text-slate-700 text-sm mb-1">{title}</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Mô-đun quản trị đang sẵn sàng kết nối API Backend GATS.
        </p>
      </div>
    </div>
  );
}
