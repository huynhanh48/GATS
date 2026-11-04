import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  CategoryRootNode,
  TagBranchNode,
  LevelLeafNode,
} from './ReactFlowNodes';

const nodeTypes = {
  rootCategory: CategoryRootNode,
  tagBranch: TagBranchNode,
  levelLeaf: LevelLeafNode,
};

// 3 cấp độ chuẩn từ database API (ngắn gọn, không thêm chữ bịa đặt)
const STANDARD_LEVELS = [
  { key: 'beginner', name: 'Cơ bản' },
  { key: 'intermediate', name: 'Trung cấp' },
  { key: 'advanced', name: 'Nâng cao' },
];

export default function ReactFlowRoadmapCanvas({
  category,
  allTags = [],
  selectedTagFilter = 'all',
  onSelectNode,
}) {
  // Bố cục sơ đồ React Flow dạng cây từ Database API:
  // Hàng 1 (Top): Node Danh mục [Icon] Title + Box Mô tả từ API
  // Hàng 2 (Middle): Các Box Tag/Tool (ChatGPT, Gemini, Claude...)
  // Hàng 3 (Bottom): Các Box Level phân nhánh bên dưới từng Tag
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!category) return { initialNodes: [], initialEdges: [] };

    const flowNodes = [];
    const flowEdges = [];

    // 1. Trích xuất danh sách tags thực tế từ Backend API của category này
    let currentTags = [];
    if (Array.isArray(category.tags) && category.tags.length > 0) {
      currentTags = category.tags;
    } else if (category.milestones) {
      currentTags = category.milestones.flatMap((m) =>
        m.nodes.map((n) => ({
          id: n.id,
          name: n.name,
          slug: n.tag?.toLowerCase().replace(/\s+/g, '-') || n.id,
        }))
      );
    } else {
      currentTags = [
        { id: 'chatgpt', name: 'ChatGPT', slug: 'chatgpt' },
        { id: 'claude', name: 'Claude', slug: 'claude' },
        { id: 'gemini', name: 'Gemini', slug: 'gemini' },
      ];
    }

    // Khử trùng lặp tags và gộp dữ liệu để giữ được các trường mô tả (description, levels) từ category.tags
    const uniqueTagsMap = new Map();
    currentTags.forEach((t) => {
      const key = (t.slug || t.name || '').toLowerCase();
      if (!uniqueTagsMap.has(key)) {
        const fullTagFromAll = allTags.find((at) => at.slug === t.slug || at.name?.toLowerCase() === t.name?.toLowerCase());
        const mergedTag = { ...fullTagFromAll, ...t };
        uniqueTagsMap.set(key, mergedTag);
      }
    });

    let mainTags = Array.from(uniqueTagsMap.values());

    // Lọc theo tag được chọn từ header (nếu không phải 'all')
    if (selectedTagFilter && selectedTagFilter !== 'all') {
      const filterKey = selectedTagFilter.toLowerCase();
      const filtered = mainTags.filter((t) => {
        const tSlug = (t.slug || '').toLowerCase();
        const tName = (t.name || '').toLowerCase();
        return tSlug === filterKey || tName === filterKey || tSlug.includes(filterKey) || filterKey.includes(tSlug);
      });
      if (filtered.length > 0) {
        mainTags = filtered;
      }
    } else {
      mainTags = mainTags.slice(0, 4);
    }

    // Kích thước chuẩn của từng loại Node (Vuông vắn gọn gàng chuẩn Layout GATS)
    const rootNodeWidth = 320;
    const tagNodeWidth = 220; // Tăng lên 220 để vừa description
    const levelCardWidth = 180; // Tăng lên 180 để vừa description
    const levelCardGap = 24; // Khoảng cách giữa các Level
    const columnInterGap = 48; // Khoảng cách giữa các cột công cụ

    // Chiều rộng tổng thể của 3 Level Node bên dưới mỗi Tag:
    const totalLevelsWidth = STANDARD_LEVELS.length * levelCardWidth + (STANDARD_LEVELS.length - 1) * levelCardGap;
    const tagColumnWidth = totalLevelsWidth;

    const startX = 60;
    const row0_Y = 40;   // Hàng Danh mục (Top)
    const row1_Y = 210;  // Hàng Tags (Middle)
    const row2_Y = 340;  // Hàng Levels (Bottom)

    const rootNodeId = `root-category-${category.slug || 'cat'}`;
    
    // Tọa độ tâm X của từng cột Tag
    const tagCentersX = mainTags.map((_, tIdx) => {
      const colStartX = startX + tIdx * (tagColumnWidth + columnInterGap);
      return colStartX + totalLevelsWidth / 2;
    });

    // Căn giữa Root Category Node tuyệt đối
    const firstTagCenterX = tagCentersX[0] || startX;
    const lastTagCenterX = tagCentersX[tagCentersX.length - 1] || startX;
    const overallCenterX = (firstTagCenterX + lastTagCenterX) / 2;
    const rootPosX = overallCenterX - rootNodeWidth / 2;

    // 1. Thêm Root Category Node (Lấy icon, title, description trực tiếp từ Database API)
    flowNodes.push({
      id: rootNodeId,
      type: 'rootCategory',
      position: { x: rootPosX, y: row0_Y },
      data: {
        title: category.title || category.name || 'AI COWORKING',
        description: category.description || '',
      },
    });

    // 2. Thêm từng nhánh Tag và Level con
    mainTags.forEach((tagItem, tIdx) => {
      const tagKey = (tagItem.slug || tagItem.name || '').toLowerCase();
      const tagNodeId = `tag-node-${tagKey}`;
      const colStartX = startX + tIdx * (tagColumnWidth + columnInterGap);

      // Tọa độ X của Tag căn giữa cột
      const tagPosX = tagCentersX[tIdx] - tagNodeWidth / 2;

      // Tag Node
      flowNodes.push({
        id: tagNodeId,
        type: 'tagBranch',
        position: { x: tagPosX, y: row1_Y },
        data: {
          name: tagItem.name,
          slug: tagItem.slug || tagItem.name,
          description: tagItem.description || null,
        },
      });

      // Đường line nối từ Root Category xuống Tag Node (Dạng line bo tròn góc, không mũi tên)
      flowEdges.push({
        id: `edge-${rootNodeId}-to-${tagNodeId}`,
        source: rootNodeId,
        target: tagNodeId,
        type: 'smoothstep',
        style: {
          stroke: '#94a3b8',
          strokeWidth: 2,
        },
      });

      // Level Nodes bên dưới Tag
      STANDARD_LEVELS.forEach((lvl, lIdx) => {
        const leafNodeId = `leaf-${tagKey}-${lvl.key}`;
        const leafX = colStartX + lIdx * (levelCardWidth + levelCardGap);

        // Lấy description tương ứng với level của Tag này từ API
        const tagLevelData = tagItem.levels?.find(l => l.code === lvl.key);
        const leafDescription = tagLevelData?.description || null;

        flowNodes.push({
          id: leafNodeId,
          type: 'levelLeaf',
          position: { x: leafX, y: row2_Y },
          data: {
            levelKey: lvl.key,
            levelName: lvl.name,
            tag: tagItem.name,
            description: leafDescription,
            onNodeClick: (nodeData) =>
              onSelectNode(nodeData, { title: tagItem.name }),
          },
        });

        // Đường line nối từ Tag Node xuống Level Node (Dạng line bo tròn góc, không mũi tên)
        flowEdges.push({
          id: `edge-${tagNodeId}-to-${leafNodeId}`,
          source: tagNodeId,
          target: leafNodeId,
          type: 'smoothstep',
          style: {
            stroke: '#94a3b8',
            strokeWidth: 2,
          },
        });
      });
    });

    return { initialNodes: flowNodes, initialEdges: flowEdges };
  }, [category, allTags, selectedTagFilter, onSelectNode]);

  // React Flow state cho phép kéo giữ và di chuyển tự do các nodes
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Đồng bộ lại khi initialNodes thay đổi (ví dụ khi user chuyển category)
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Sự kiện khi Hover vào một Node để kích hoạt hiệu ứng animated di chuyển trên toàn bộ chuỗi cha - con
  const onNodeMouseEnter = useCallback((_, node) => {
    const targetId = node.id;

    setEdges((prevEdges) => {
      // 1. Tìm tập hợp tất cả các edge thuộc chuỗi kế thừa (Ancestor Lineage & Descendant Lineage)
      const highlightedEdgeIds = new Set();

      // Nếu target là Level (leaf-tag-level)
      if (targetId.startsWith('leaf-')) {
        // Tìm edge nối Tag -> Leaf
        const leafEdge = prevEdges.find((e) => e.target === targetId);
        if (leafEdge) {
          highlightedEdgeIds.add(leafEdge.id);
          // Tìm tiếp edge nối Root -> Tag đó
          const tagEdge = prevEdges.find((e) => e.target === leafEdge.source);
          if (tagEdge) {
            highlightedEdgeIds.add(tagEdge.id);
          }
        }
      } 
      // Nếu target là Tag Node (tag-node-...)
      else if (targetId.startsWith('tag-node-')) {
        // Sáng edge từ Root -> Tag
        const rootToTagEdge = prevEdges.find((e) => e.target === targetId);
        if (rootToTagEdge) highlightedEdgeIds.add(rootToTagEdge.id);

        // Và sáng tất cả edges từ Tag này xuống các Level con của nó
        prevEdges.forEach((e) => {
          if (e.source === targetId) highlightedEdgeIds.add(e.id);
        });
      }
      // Nếu target là Root Category
      else if (targetId.startsWith('root-category')) {
        // Sáng toàn bộ các edges
        prevEdges.forEach((e) => highlightedEdgeIds.add(e.id));
      }

      return prevEdges.map((e) => {
        const isHighlighted = highlightedEdgeIds.has(e.id);

        if (!isHighlighted) return e;

        return {
          ...e,
          animated: true,
          style: {
            ...e.style,
            stroke: '#1a56db',
            strokeWidth: 3,
          },
        };
      });
    });
  }, [setEdges]);

  const onNodeMouseLeave = useCallback(() => {
    setEdges((prevEdges) =>
      prevEdges.map((e) => ({
        ...e,
        animated: false,
        style: {
          ...e.style,
          stroke: '#94a3b8',
          strokeWidth: 2,
        },
      }))
    );
  }, [setEdges]);

  return (
    <div className="w-full h-[720px] bg-[#F8FAFC] rounded-[16px] border border-slate-200 overflow-hidden shadow-xs relative">
      <ReactFlow
        key={`flow-${category?.slug || 'default'}-${selectedTagFilter}`}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{
          padding: 0.12,
          includeHiddenNodes: false,
          minZoom: 0.4,
          maxZoom: 1,
        }}
        minZoom={0.25}
        maxZoom={1.5}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        className="gats-roadmap-flow"
      >
        <Background color="#cbd5e1" gap={20} size={1} />
        <Controls
          position="bottom-right"
          className="!bg-white !rounded-[10px] !border !border-slate-200 !shadow-sm !overflow-hidden"
        />
        <MiniMap
          position="bottom-left"
          nodeStrokeWidth={2}
          nodeColor={(node) => {
            if (node.type === 'rootCategory') return '#1a56db';
            if (node.type === 'tagBranch') return '#4f46e5';
            return '#10b981';
          }}
          className="!bg-white !rounded-[12px] !border !border-slate-200 !shadow-md !overflow-hidden hidden sm:block"
        />
      </ReactFlow>
    </div>
  );
}
