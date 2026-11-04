import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import {
  Plus,
  Download,
  Sparkles,
  RotateCcw,
  Layers,
  Bot,
  Zap,
  BookOpen,
  Cpu,
  Workflow,
  Code2,
  Wand2,
  X,
  Edit3,
  GraduationCap,
  Award,
  BookMarked,
  FolderKanban,
  Wrench,
  BarChart,
  Settings,
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

// Custom Designer Node
const CustomDesignerNode = ({ id, data }) => {
  const { title, subtitle, description, level, isRoot, onDelete, onEditRoot } = data;

  if (isRoot) {
    return (
      <div
        onClick={() => onEditRoot && onEditRoot()}
        title="Nhấn vào để chỉnh sửa mục tiêu lộ trình"
        className="relative w-[320px] bg-white rounded-[10px] border-2 border-[#1a56db] shadow-md p-4 select-none cursor-pointer hover:ring-2 hover:ring-blue-400/40 transition-all box-border group"
      >
        <div className="flex items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[6px] bg-blue-50 border border-blue-200 text-[#1a56db] flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <h3 className="roadmap-vietnamese-title text-sm font-bold text-slate-900 truncate">
              {title}
            </h3>
          </div>
          <span className="p-1 rounded bg-slate-100 text-slate-500 group-hover:text-[#1a56db] opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit3 size={13} />
          </span>
        </div>

        {subtitle && (
          <div className="w-full bg-slate-50 border border-slate-200 rounded-[6px] px-3 py-1.5 text-center text-xs text-slate-600 font-medium leading-relaxed truncate">
            {subtitle}
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2.5 !h-2.5 !bg-slate-800 !border-2 !border-white !rounded-full !-bottom-1.5 !left-1/2 !-translate-x-1/2 cursor-crosshair shadow-xs"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${description ? 'w-[220px]' : 'w-[180px]'} bg-white rounded-[8px] border-2 border-slate-300 hover:border-[#1a56db] p-3 shadow-xs select-none transition-all group box-border`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-slate-800 !border-2 !border-white !rounded-full !-top-1.5 !left-1/2 !-translate-x-1/2"
      />

      {/* Delete button on hover */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          title="Xóa node này"
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer hover:bg-rose-600"
        >
          <X size={12} />
        </button>
      )}

      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-[6px] bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
          {getTagIcon(title, 16)}
        </div>
        <div className="min-w-0 flex-1">
          {level && (
            <span className="text-[9px] font-bold text-slate-500 block truncate">
              {level}
            </span>
          )}
          <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
            {title}
          </h4>
        </div>
      </div>
      
      {description && (
        <div className="w-full bg-slate-50 border border-slate-100 rounded-[6px] px-2 py-1.5 text-center text-[10px] text-slate-600 font-medium leading-relaxed mt-1">
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
};

const customNodeTypes = {
  customDesignerNode: CustomDesignerNode,
};

export default function CustomRoadmapDesigner({ categories = [], tags = [] }) {
  const reactFlowWrapper = useRef(null);

  // Root Node Title & Subtitle State
  const [rootTitle, setRootTitle] = useState('MỤC TIÊU LỘ TRÌNH CỦA BẠN');
  const [rootSubtitle, setRootSubtitle] = useState('Kéo nối các kỹ năng bên dưới để tạo lộ trình riêng');
  const [editRootModalOpen, setEditRootModalOpen] = useState(false);

  // Initial nodes
  const initialNodes = useMemo(() => [
    {
      id: 'custom-root',
      type: 'customDesignerNode',
      position: { x: 300, y: 40 },
      data: {
        title: rootTitle,
        subtitle: rootSubtitle,
        isRoot: true,
      },
    },
    {
      id: 'custom-node-1',
      type: 'customDesignerNode',
      position: { x: 180, y: 180 },
      data: {
        title: 'ChatGPT',
        level: 'Cơ bản',
      },
    },
    {
      id: 'custom-node-2',
      type: 'customDesignerNode',
      position: { x: 420, y: 180 },
      data: {
        title: 'n8n Workflow',
        level: 'Trung cấp',
      },
    },
  ], [rootTitle, rootSubtitle]);

  const initialEdges = useMemo(() => [
    {
      id: 'e-root-1',
      source: 'custom-root',
      target: 'custom-node-1',
      type: 'smoothstep',
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    },
    {
      id: 'e-root-2',
      source: 'custom-root',
      target: 'custom-node-2',
      type: 'smoothstep',
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    },
  ], []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Modals state
  const [addNodeModalOpen, setAddNodeModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('category'); // 'category' | 'tool' | 'level' | 'custom'

  // Custom tab form fields
  const [customNodeTitle, setCustomNodeTitle] = useState('');
  const [customNodeLevel, setCustomNodeLevel] = useState('Cơ bản');

  const [isExporting, setIsExporting] = useState(false);

  // Handle Delete Node
  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  // Connect Nodes
  const onConnect = useCallback((params) => {
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: 'smoothstep',
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        },
        eds
      )
    );
  }, [setEdges]);

  // Helper add single node
  const appendNodeToCanvas = useCallback((title, level = '', description = null) => {
    const timestamp = Date.now();
    const newNodeId = `custom-node-${timestamp}`;
    const offset = (timestamp % 200);
    const newNode = {
      id: newNodeId,
      type: 'customDesignerNode',
      position: {
        x: 180 + offset,
        y: 260 + (offset % 100),
      },
      data: {
        title,
        level,
        description,
        onDelete: handleDeleteNode,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setAddNodeModalOpen(false);
  }, [handleDeleteNode, setNodes]);

  // Add Node from Custom tab
  const handleAddCustomNode = (e) => {
    e.preventDefault();
    if (!customNodeTitle.trim()) return;
    appendNodeToCanvas(customNodeTitle.trim(), customNodeLevel);
    setCustomNodeTitle('');
  };

  // Save Root Edit
  const handleSaveRootEdit = (e) => {
    e.preventDefault();
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === 'custom-root') {
          return {
            ...n,
            data: {
              ...n.data,
              title: rootTitle,
              subtitle: rootSubtitle,
            },
          };
        }
        return n;
      })
    );
    setEditRootModalOpen(false);
  };

  // Reset to default
  const handleReset = () => {
    setNodes(initialNodes.map((n) => ({
      ...n,
      data: { ...n.data, onDelete: n.data.isRoot ? null : handleDeleteNode, onEditRoot: () => setEditRootModalOpen(true) },
    })));
    setEdges(initialEdges);
  };

  // Export Image PNG
  const handleDownloadImage = async () => {
    if (!reactFlowWrapper.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(reactFlowWrapper.current, {
        backgroundColor: '#F8FAFC',
        quality: 1,
        pixelRatio: 2,
        filter: (node) => {
          const className = node?.classList?.value || '';
          return !className.includes('react-flow__controls') && !className.includes('react-flow__minimap');
        },
      });

      const link = document.createElement('a');
      link.download = `GATS-Roadmap-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export roadmap image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Lấy ra tất cả các thẻ tags (bao gồm cả description) từ các danh mục để tái sử dụng
  const richTags = useMemo(() => {
    const map = new Map();
    categories.forEach(c => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach(t => {
          if (!map.has(t.name)) {
            map.set(t.name, t);
          }
        });
      }
    });
    // Gộp thêm từ props tags nếu chưa có
    tags.forEach(t => {
      if (!map.has(t.name)) {
        map.set(t.name, t);
      }
    });
    return Array.from(map.values());
  }, [categories, tags]);


  return (
    <div className="w-full bg-white rounded-[8px] border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Designer Toolbar */}
      <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddNodeModalOpen(true)}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus size={15} />
            <span>Thêm Kỹ Năng</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-[6px] bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
          >
            <RotateCcw size={14} />
            <span>Đặt lại</span>
          </button>
        </div>

        {/* Action Button: Tải ảnh PNG */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadImage}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Download size={14} />
            <span>{isExporting ? 'Đang xuất ảnh...' : 'Tải xuống'}</span>
          </button>
        </div>
      </div>

      {/* React Flow Canvas Designer */}
      <div className="w-full h-[680px] bg-[#F8FAFC] relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes.map((n) => ({
            ...n,
            data: {
              ...n.data,
              onDelete: n.data.isRoot ? null : handleDeleteNode,
              onEditRoot: () => setEditRootModalOpen(true),
            },
          }))}
          edges={edges}
          nodeTypes={customNodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          defaultViewport={{ x: 120, y: 80, zoom: 0.85 }}
          minZoom={0.2}
          maxZoom={1.5}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls position="bottom-right" className="!bg-white !rounded-[8px] !border !border-slate-200 !shadow-xs" />
          <MiniMap position="bottom-left" className="!bg-white !rounded-[8px] !border !border-slate-200 !shadow-xs hidden sm:block" />
        </ReactFlow>
      </div>

      {/* Modal: Chỉnh sửa Mục Tiêu Lộ Trình (Root Node) */}
      {editRootModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-[10px] border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Chỉnh Sửa Mục Tiêu Lộ Trình
              </h3>
              <button
                type="button"
                onClick={() => setEditRootModalOpen(false)}
                className="cursor-pointer p-1 rounded-md hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRootEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên mục tiêu / Dự án lộ trình:
                </label>
                <input
                  type="text"
                  required
                  value={rootTitle}
                  onChange={(e) => setRootTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mô tả định hướng đào tạo:
                </label>
                <textarea
                  rows={3}
                  value={rootSubtitle}
                  onChange={(e) => setRootSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditRootModalOpen(false)}
                  className="cursor-pointer px-4 py-2 rounded-[6px] bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-4 py-2 rounded-[6px] bg-[#1a56db] text-white text-xs font-bold hover:bg-blue-700"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Thêm Node Kỹ Năng với 4 Tabs chuẩn */}
      {addNodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-[10px] border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Thêm Kỹ Năng / Node Vào Lộ Trình
              </h3>
              <button
                type="button"
                onClick={() => setAddNodeModalOpen(false)}
                className="cursor-pointer p-1 rounded-md hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* 4 Tabs Header */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-[8px] mb-4">
              <button
                type="button"
                onClick={() => setActiveModalTab('category')}
                className={`cursor-pointer inline-flex items-center justify-center gap-1 py-1.5 rounded-[6px] text-xs font-bold transition-all ${
                  activeModalTab === 'category'
                    ? 'bg-white text-[#1a56db] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderKanban size={13} />
                <span>Danh mục</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('tool')}
                className={`cursor-pointer inline-flex items-center justify-center gap-1 py-1.5 rounded-[6px] text-xs font-bold transition-all ${
                  activeModalTab === 'tool'
                    ? 'bg-white text-[#1a56db] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench size={13} />
                <span>Công cụ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('level')}
                className={`cursor-pointer inline-flex items-center justify-center gap-1 py-1.5 rounded-[6px] text-xs font-bold transition-all ${
                  activeModalTab === 'level'
                    ? 'bg-white text-[#1a56db] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart size={13} />
                <span>Mức độ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('custom')}
                className={`cursor-pointer inline-flex items-center justify-center gap-1 py-1.5 rounded-[6px] text-xs font-bold transition-all ${
                  activeModalTab === 'custom'
                    ? 'bg-white text-[#1a56db] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings size={13} />
                <span>Tùy chỉnh</span>
              </button>
            </div>

            {/* TAB 1: DANH MỤC */}
            {activeModalTab === 'category' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">
                  Nhấn vào một danh mục để thêm node danh mục từ Database vào canvas:
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {categories.map((c) => (
                    <button
                      key={c.id || c.slug}
                      type="button"
                      onClick={() => appendNodeToCanvas(c.name, 'Danh mục', c.description)}
                      className="cursor-pointer text-left p-3 rounded-[8px] bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition-all flex items-center gap-2 group"
                    >
                      <div className="w-7 h-7 rounded-[6px] bg-blue-100/60 text-[#1a56db] flex items-center justify-center shrink-0">
                        {getTagIcon(c.name, 15)}
                      </div>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-[#1a56db] truncate">
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: CÔNG CỤ */}
            {activeModalTab === 'tool' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">
                  Chọn công cụ AI / kỹ năng từ Database API:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                  {(richTags.length > 0 ? richTags : [
                    { name: 'ChatGPT' },
                    { name: 'Gemini' },
                    { name: 'Claude' },
                    { name: 'n8n' },
                    { name: 'NotebookLM' },
                    { name: 'Python' },
                    { name: 'JavaScript' },
                    { name: 'Antigravity' },
                    { name: 'Prompt Engineering' },
                  ]).map((t, idx) => (
                    <button
                      key={t.id || t.slug || idx}
                      type="button"
                      onClick={() => appendNodeToCanvas(t.name, 'Công cụ', t.description)}
                      className="cursor-pointer text-left p-2.5 rounded-[8px] bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition-all flex items-center gap-2 group"
                    >
                      {getTagIcon(t.name, 15)}
                      <span className="text-xs font-bold text-slate-900 group-hover:text-[#1a56db] truncate">
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MỨC ĐỘ */}
            {activeModalTab === 'level' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">
                  Chọn cấp độ đào tạo để thêm node cấp độ vào canvas:
                </p>
                <div className="space-y-2">
                  {[
                    { name: 'Cơ bản', icon: BookMarked },
                    { name: 'Trung cấp', icon: GraduationCap },
                    { name: 'Nâng cao', icon: Award },
                  ].map((lvl) => {
                    const Icon = lvl.icon;
                    return (
                      <button
                        key={lvl.name}
                        type="button"
                        onClick={() => appendNodeToCanvas(lvl.name, lvl.name)}
                        className="cursor-pointer w-full text-left p-3 rounded-[8px] bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={17} className="text-[#1a56db]" />
                          <span className="text-xs font-bold text-slate-800">
                            Cấp độ: {lvl.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-[#1a56db] group-hover:underline">
                          + Thêm node
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: TÙY CHỈNH */}
            {activeModalTab === 'custom' && (
              <form onSubmit={handleAddCustomNode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tên kỹ năng / Công cụ riêng:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: AI Automation Lead, LangChain, Vibe Coding..."
                    value={customNodeTitle}
                    onChange={(e) => setCustomNodeTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-[8px] border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mức độ kỹ năng:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Cơ bản', 'Trung cấp', 'Nâng cao'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setCustomNodeLevel(lvl)}
                        className={`cursor-pointer py-1.5 rounded-[6px] text-xs font-bold transition-all border ${
                          customNodeLevel === lvl
                            ? 'bg-[#1a56db] text-white border-[#1a56db]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddNodeModalOpen(false)}
                    className="cursor-pointer px-4 py-2 rounded-[6px] bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer px-4 py-2 rounded-[6px] bg-[#1a56db] text-white text-xs font-bold hover:bg-blue-700"
                  >
                    Thêm vào Canvas
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
