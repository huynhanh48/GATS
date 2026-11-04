import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Sparkles,
  Layers,
  Bot,
  Cpu,
  Workflow,
  Wand2,
  Code2,
  BookOpen,
  Zap,
  GraduationCap,
  Award,
} from 'lucide-react';

function getTagIcon(nameOrSlug = '', size = 16) {
  const s = String(nameOrSlug).toLowerCase();
  if (s.includes('gemini')) return <Sparkles size={size} className="text-indigo-600 shrink-0" />;
  if (s.includes('chatgpt') || s.includes('gpt')) return <Bot size={size} className="text-emerald-600 shrink-0" />;
  if (s.includes('claude')) return <Zap size={size} className="text-amber-600 shrink-0" />;
  if (s.includes('mastery') || s.includes('tri-thuc') || s.includes('notebooklm')) return <BookOpen size={size} className="text-purple-600 shrink-0" />;
  if (s.includes('antigravity') || s.includes('agent')) return <Cpu size={size} className="text-blue-600 shrink-0" />;
  if (s.includes('automation') || s.includes('tu-dong-hoa') || s.includes('n8n')) return <Workflow size={size} className="text-emerald-600 shrink-0" />;
  if (s.includes('code') || s.includes('lap-trinh') || s.includes('python') || s.includes('javascript')) return <Code2 size={size} className="text-sky-600 shrink-0" />;
  if (s.includes('studio') || s.includes('sang-tao') || s.includes('video')) return <Wand2 size={size} className="text-pink-600 shrink-0" />;
  return <Layers size={size} className="text-slate-700 shrink-0" />;
}

function getLevelMeta(levelKey = '') {
  if (levelKey === 'advanced') {
    return {
      icon: Award,
      color: 'text-purple-600',
      border: 'border-purple-300 hover:border-purple-600',
      bg: 'bg-white hover:bg-purple-50/50',
    };
  }
  if (levelKey === 'intermediate') {
    return {
      icon: GraduationCap,
      color: 'text-blue-600',
      border: 'border-blue-300 hover:border-blue-600',
      bg: 'bg-white hover:bg-blue-50/50',
    };
  }
  return {
    icon: BookOpen,
    color: 'text-emerald-600',
    border: 'border-emerald-300 hover:border-emerald-600',
    bg: 'bg-white hover:bg-emerald-50/50',
  };
}

// 1. Root Category Node (Khung Danh mục chuẩn layout GATS: Border xanh #1a56db, width cố định 320px)
export const CategoryRootNode = memo(({ data }) => {
  const { title, description } = data;

  return (
    <div className="relative w-[320px] bg-white rounded-[10px] border-2 border-[#1a56db] shadow-sm p-4 select-none box-border">
      {/* Hàng trên: [Icon] Title */}
      <div className="flex items-center justify-center gap-2.5 pb-2.5">
        <div className="w-8 h-8 rounded-[6px] bg-blue-50 border border-blue-200 text-[#1a56db] flex items-center justify-center shrink-0">
          {getTagIcon(title, 18)}
        </div>
        <h3 className="roadmap-vietnamese-title text-base font-bold text-slate-900 text-center">
          {title}
        </h3>
      </div>

      {/* Hàng dưới: Ô Mô tả từ API */}
      {description && (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-[6px] px-3 py-2 text-center text-xs text-slate-600 font-medium leading-relaxed">
          {description}
        </div>
      )}

      {/* Handle chấm tròn kết nối căn chính giữa tâm */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-slate-800 !border-2 !border-white !rounded-full !-bottom-1.5 !left-1/2 !-translate-x-1/2 cursor-crosshair shadow-xs"
      />
    </div>
  );
});
CategoryRootNode.displayName = 'CategoryRootNode';

// 2. Tag Branch Node (Khung Công cụ / Tag chuẩn layout GATS: width cố định 190px hoặc rộng hơn nếu có text)
export const TagBranchNode = memo(({ data }) => {
  const { name, description } = data;

  return (
    <div className={`relative ${description ? 'w-[220px]' : 'w-[190px]'} bg-white rounded-[8px] border-2 border-slate-300 hover:border-[#1a56db] shadow-xs hover:shadow-sm px-3.5 py-2.5 select-none transition-all flex flex-col items-center justify-center gap-2 box-border`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-slate-800 !border-2 !border-white !rounded-full !-top-1.5 !left-1/2 !-translate-x-1/2"
      />

      <div className="flex items-center gap-2 overflow-hidden w-full justify-center">
        {getTagIcon(name, 16)}
        <span className="text-sm font-extrabold text-slate-900 tracking-tight truncate text-center">
          {name}
        </span>
      </div>

      {description && (
        <div className="w-full bg-slate-50 border border-slate-100 rounded-[6px] px-2 py-1.5 text-center text-[10px] text-slate-600 font-medium leading-relaxed mt-0.5">
          {description}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-slate-800 !border-2 !border-white !rounded-full !-bottom-1.5 !left-1/2 !-translate-x-1/2 cursor-crosshair"
      />
    </div>
  );
});
TagBranchNode.displayName = 'TagBranchNode';

// 3. Level Leaf Node (Khung Cấp độ / Level chuẩn layout GATS)
export const LevelLeafNode = memo(({ data }) => {
  const {
    levelKey, // 'beginner' | 'intermediate' | 'advanced'
    levelName,
    description,
    onNodeClick,
  } = data;

  const meta = getLevelMeta(levelKey);
  const IconComponent = meta.icon;

  return (
    <div
      onClick={() => onNodeClick && onNodeClick(data)}
      className={`relative cursor-pointer ${description ? 'w-[180px]' : 'w-[150px]'} ${meta.bg} rounded-[8px] border-2 ${meta.border} shadow-xs hover:shadow-sm transition-all px-2.5 py-2 select-none flex flex-col items-center justify-center gap-1.5 text-center box-border`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-slate-800 !border-2 !border-white !rounded-full !-top-1.5 !left-1/2 !-translate-x-1/2"
      />

      <div className="flex items-center justify-center gap-1.5 w-full">
        <IconComponent size={14} className={`${meta.color} shrink-0`} />
        <span className="text-xs font-bold text-slate-900 tracking-tight truncate">
          {levelName}
        </span>
      </div>
      
      {description && (
        <div className="w-full bg-white/50 border border-slate-200/50 rounded-[4px] px-2 py-1 text-center text-[9px] text-slate-600 font-medium leading-relaxed mt-0.5">
          {description}
        </div>
      )}
    </div>
  );
});
LevelLeafNode.displayName = 'LevelLeafNode';



