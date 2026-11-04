import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  ExternalLink,
  X,
  FileText,
  Network,
  Bot,
  Cpu,
  Wand2,
  Workflow,
  Code2,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { postService } from '@/modules/blog/services/postService';
import BookFinLoading from '@/shared/components/BookFinLoading';
import ReactFlowRoadmapCanvas from './components/ReactFlowRoadmapCanvas';
import CustomRoadmapDesigner from './components/CustomRoadmapDesigner';
import InteractiveRoadmapTimeline from './components/InteractiveRoadmapTimeline';

// Predefined fallback structures for each of the 6 core categories
const CATEGORY_META = {
  cowork: {
    icon: Bot,
    color: '#1a56db',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
    title: 'AI Coworking và Năng Suất',
    description: 'Lộ trình làm chủ các trợ lý AI hàng đầu và tích hợp AI vào quy trình làm việc văn phòng hàng ngày.',
    milestones: [
      {
        id: 'cowork-m1',
        title: 'Giai đoạn 1: Nền tảng Trợ lý AI và Prompt Cơ bản',
        level: 'beginner',
        levelName: 'Cơ bản cho người mới',
        description: 'Làm quen tư duy giao tiếp với LLM, cấu trúc prompt hiệu quả và làm chủ bộ công cụ ChatGPT, Gemini, Claude.',
        nodes: [
          { id: 'chatgpt', name: 'ChatGPT', tag: 'ChatGPT', type: 'required', status: 'completed', desc: 'Thành thạo kỹ năng đối thoại, phân tích tài liệu và tạo nội dung với GPT-4o.' },
          { id: 'gemini', name: 'Google Gemini', tag: 'Gemini', type: 'required', status: 'learning', desc: 'Khai thác sức mạnh tích hợp của Gemini với hệ sinh thái Google Workspace.' },
          { id: 'claude', name: 'Claude AI', tag: 'Claude', type: 'recommended', status: 'todo', desc: 'Ứng dụng Claude Artifacts, xử lý tài liệu dài (200k context) và viết lách chuyên sâu.' },
          { id: 'prompt-eng', name: 'Prompt Engineering', tag: 'Prompt Engineering', type: 'required', status: 'completed', desc: 'Nguyên tắc Zero-shot, Few-shot, Chain-of-Thought và System Prompts chuẩn xác.' }
        ]
      },
      {
        id: 'cowork-m2',
        title: 'Giai đoạn 2: Tối ưu Quy trình Văn phòng và Không Gian Làm Việc',
        level: 'intermediate',
        levelName: 'Trung cấp nâng cao',
        description: 'Kết hợp nhiều công cụ AI vào bảng tính, báo cáo, bài thuyết trình và xử lý văn bản tự động.',
        nodes: [
          { id: 'google-workspace-ai', name: 'Google Workspace AI', tag: 'Google Workspace AI', type: 'required', status: 'todo', desc: 'Tự động soạn thảo Docs, phân tích Google Sheets và tạo Slide thuyết trình chuyên nghiệp.' },
          { id: 'workflow-ai-use', name: 'Workflow AI Use', tag: 'Workflow AI Use', type: 'required', status: 'todo', desc: 'Xây dựng quy trình luân chuyển dữ liệu và xử lý tác vụ giữa các phòng ban.' },
          { id: 'tool-stack', name: 'Tool Stack Tích hợp', tag: 'Tool Stack', type: 'optional', status: 'todo', desc: 'Bộ công cụ bổ trợ: Perplexity, Gamma, Midjourney và Canva AI.' }
        ]
      },
      {
        id: 'cowork-m3',
        title: 'Giai đoạn 3: Tự động hóa và Ứng dụng Doanh nghiệp',
        level: 'advanced',
        levelName: 'Chuyên sâu và Doanh nghiệp',
        description: 'Triển khai AI diện rộng, chuẩn hóa bảo mật thông tin và đo lường hiệu suất ROI.',
        nodes: [
          { id: 'no-code-automation', name: 'No-code Automation', tag: 'No-code automation', type: 'required', status: 'todo', desc: 'Tự động hóa tác vụ không cần lập trình, giải phóng 70% thời gian thủ công.' },
          { id: 'enterprise-ai-security', name: 'Bảo mật và Phân quyền AI', tag: 'Dành cho Doanh nghiệp', type: 'recommended', status: 'todo', desc: 'Thiết lập chính sách dữ liệu an toàn khi ứng dụng AI trong tổ chức.' }
        ]
      }
    ]
  },
  mastery: {
    icon: Sparkles,
    color: '#7c3aed',
    bgLight: 'bg-purple-50',
    border: 'border-purple-200',
    title: 'AI Mastery và Bộ Não Tri Thức',
    description: 'Xây dựng hệ thống Second Brain, tổng hợp tài liệu chuyên sâu và tự động hóa nghiên cứu với NotebookLM và Antigravity.',
    milestones: [
      {
        id: 'mastery-m1',
        title: 'Giai đoạn 1: Quản trị Tri thức và Xử lý Tài liệu Đa nguồn',
        level: 'beginner',
        levelName: 'Cơ bản cho người mới',
        description: 'Chuyển hóa dữ liệu thô (PDF, Audio, Video, Web) thành nguồn tri thức có cấu trúc.',
        nodes: [
          { id: 'large-language-model', name: 'Large Language Model', tag: 'Large Language Model', type: 'required', status: 'completed', desc: 'Hiểu kiến trúc LLM, Context Window, Tokens và cơ chế Attention.' },
          { id: 'notebooklm', name: 'NotebookLM Cơ bản', tag: 'NotebookLM', type: 'required', status: 'learning', desc: 'Tổng hợp hàng trăm trang tài liệu nghiên cứu, tạo Audio Overview thông minh.' }
        ]
      },
      {
        id: 'mastery-m2',
        title: 'Giai đoạn 2: Kỹ thuật Prompt Nâng cao và Kiến trúc Hệ thống Tri thức',
        level: 'intermediate',
        levelName: 'Trung cấp nâng cao',
        description: 'Thiết kế cấu trúc dữ liệu tri thức dài hạn và các prompt phân tích đa chiều.',
        nodes: [
          { id: 'prompt-eng-adv', name: 'Prompt Engineering nâng cao', tag: 'Prompt Engineering nâng cao', type: 'required', status: 'todo', desc: 'Tạo Personas, Metaprompting, RAG-friendly prompt structures.' },
          { id: 'google-ai-workspace', name: 'Google AI Workspace', tag: 'Google AI Workspace', type: 'required', status: 'todo', desc: 'Đồng bộ Google Drive, Gemini Pro 1.5 và kho tài liệu đám mây.' }
        ]
      },
      {
        id: 'mastery-m3',
        title: 'Giai đoạn 3: Tự động hóa Toàn diện với Google Antigravity',
        level: 'advanced',
        levelName: 'Chuyên sâu nâng cao',
        description: 'Sử dụng AI agent tự động trích xuất thông tin định kỳ và xuất báo cáo phân tích tự động.',
        nodes: [
          { id: 'google-antigravity', name: 'Google Antigravity Mastery', tag: 'Google Antigravity', type: 'required', status: 'todo', desc: 'Làm chủ IDE thế hệ mới của Google DeepMind, điều phối đa agent tự động hóa giải pháp.' },
          { id: 'workflow-ai-deep', name: 'Workflow AI Nghiên cứu', tag: 'Workflow AI Use', type: 'recommended', status: 'todo', desc: 'Quy trình phân tích chuyên sâu cho chuyên gia và lãnh đạo doanh nghiệp.' }
        ]
      }
    ]
  },
  automation: {
    icon: Workflow,
    color: '#059669',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200',
    title: 'AI Automation và Tự Động Hóa Quy Trình',
    description: 'Lộ trình từ xây dựng kịch bản no-code đến thiết lập webhook và luồng n8n AI tự vận hành 24/7.',
    milestones: [
      {
        id: 'auto-m1',
        title: 'Giai đoạn 1: Tư duy Tự động hóa và No-Code Logic',
        level: 'beginner',
        levelName: 'Cơ bản cho người mới',
        description: 'Nắm vững khái niệm Triggers, Actions, Webhooks và biến đổi dữ liệu JSON.',
        nodes: [
          { id: 'no-code-concept', name: 'No-code Automation', tag: 'No-code automation', type: 'required', status: 'completed', desc: 'Nguyên lý kết nối các API dịch vụ qua nền tảng tự động hóa trực quan.' },
          { id: 'process-mapping', name: 'Tự động hóa quy trình', tag: 'Tự động hóa quy trình', type: 'required', status: 'learning', desc: 'Khảo sát và chuẩn hóa quy trình trước khi số hóa và tự động hóa.' }
        ]
      },
      {
        id: 'auto-m2',
        title: 'Giai đoạn 2: Tự động hóa Chuyên sâu với n8n và AI Agents',
        level: 'intermediate',
        levelName: 'Trung cấp nâng cao',
        description: 'Triển khai n8n workflow tự lưu trữ, tích hợp OpenAI / Gemini Nodes xử lý dữ liệu động.',
        nodes: [
          { id: 'n8n-workflow', name: 'n8n Workflow Mastery', tag: 'n8n', type: 'required', status: 'todo', desc: 'Xây dựng kịch bản n8n: xử lý email, phân loại lead CRM và đẩy tin Telegram/Zalo.' },
          { id: 'workflow-logic', name: 'Workflow AI Logic', tag: 'Workflow', type: 'required', status: 'todo', desc: 'Điều kiện phân nhánh, vòng lặp xử lý danh sách và xử lý ngoại lệ (Error Handling).' }
        ]
      },
      {
        id: 'auto-m3',
        title: 'Giai đoạn 3: Hệ thống AI Pipeline Doanh nghiệp',
        level: 'advanced',
        levelName: 'Chuyên sâu và Doanh nghiệp',
        description: 'Kết nối Database, Vector Store và tạo AI Bot chăm sóc khách hàng tự động.',
        nodes: [
          { id: 'enterprise-pipeline', name: 'Enterprise Data Pipeline', tag: 'Dành cho Doanh nghiệp', type: 'required', status: 'todo', desc: 'Tự động hóa báo cáo doanh thu, cảnh báo tài chính và đồng bộ đa hệ thống.' }
        ]
      }
    ]
  },
  studio: {
    icon: Wand2,
    color: '#ea580c',
    bgLight: 'bg-amber-50',
    border: 'border-amber-200',
    title: 'AI Studio: Sáng Tạo Nội Dung và Đa Phương Tiện',
    description: 'Quy trình ứng dụng AI tạo Video, Voiceover, Hình ảnh và Content Marketing chất lượng cao quy mô lớn.',
    milestones: [
      {
        id: 'studio-m1',
        title: 'Giai đoạn 1: Sáng tạo Nội dung và Kịch bản AI',
        level: 'beginner',
        levelName: 'Cơ bản cho người mới',
        description: 'Tạo dàn ý kịch bản, viết bài SEO và chuẩn bị tài nguyên truyền thông.',
        nodes: [
          { id: 'prompt-creative', name: 'Prompt Engineering sáng tạo', tag: 'Prompt Engineering', type: 'required', status: 'completed', desc: 'Kỹ thuật prompt viết bài quảng cáo, kịch bản video TikTok, Youtube ngắn.' },
          { id: 'content-strategy', name: 'Chiến lược Nội dung AI', tag: 'ChatGPT', type: 'required', status: 'learning', desc: 'Xây dựng lịch đăng bài tự động và ma trận nội dung chuyển đổi.' }
        ]
      },
      {
        id: 'studio-m2',
        title: 'Giai đoạn 2: Tạo Hình ảnh và Video Thực chiến',
        level: 'intermediate',
        levelName: 'Trung cấp nâng cao',
        description: 'Ứng dụng các nền tảng GenAI hình ảnh và video để sản xuất tư liệu chuyên nghiệp.',
        nodes: [
          { id: 'ai-video-gen', name: 'AI Video Production', tag: 'video', type: 'required', status: 'todo', desc: 'Sản xuất video AI với Runway, Kling AI, HeyGen và lồng tiếng tự động.' },
          { id: 'image-assets', name: 'Thiết kế Asset Đồ họa AI', tag: 'Tool Stack', type: 'recommended', status: 'todo', desc: 'Tạo hình ảnh quảng cáo, thumbnail Youtube bắt mắt bằng Midjourney và Flux.' }
        ]
      },
      {
        id: 'studio-m3',
        title: 'Giai đoạn 3: Hệ thống Sản xuất Đa kênh Tự động',
        level: 'advanced',
        levelName: 'Chuyên sâu nâng cao',
        description: 'Tự động hóa luồng sản xuất hàng loạt từ ý tưởng đến video thành phẩm sẵn sàng đăng tải.',
        nodes: [
          { id: 'auto-content-hub', name: 'Content Engine Tự động', tag: 'Tự động hóa quy trình', type: 'required', status: 'todo', desc: 'Kết hợp n8n + AI LLM + Video API để sản xuất nội dung quy mô lớn.' }
        ]
      }
    ]
  },
  code: {
    icon: Code2,
    color: '#0284c7',
    bgLight: 'bg-sky-50',
    border: 'border-sky-200',
    title: 'Vibe Coding và Lập Trình Ứng Dụng với AI',
    description: 'Lộ trình lập trình hiện đại: Sử dụng AI để sinh mã, phân tích kiến trúc, gỡ lỗi và triển khai ứng dụng thực tế.',
    milestones: [
      {
        id: 'code-m1',
        title: 'Giai đoạn 1: Nền tảng Ngôn ngữ và Môi trường Lập trình',
        level: 'beginner',
        levelName: 'Cơ bản cho người mới',
        description: 'Làm quen với JavaScript, Python, môi trường dòng lệnh và quản lý mã nguồn Git.',
        nodes: [
          { id: 'javascript-base', name: 'JavaScript Hiện Đại', tag: 'JavaScript', type: 'required', status: 'completed', desc: 'Cú pháp ES6+, Async/Await, DOM và Fetch API kết nối dữ liệu.' },
          { id: 'python-base', name: 'Python Cơ Bản', tag: 'Python', type: 'recommended', status: 'learning', desc: 'Ngôn ngữ nền tảng cho xử lý dữ liệu, kịch bản tự động và tương tác AI model.' },
          { id: 'github-workflow', name: 'GitHub và Quản lý Phiên bản', tag: 'GitHub', type: 'required', status: 'completed', desc: 'Quản lý kho mã nguồn, Git branch, commit và GitHub Actions CI/CD cơ bản.' }
        ]
      },
      {
        id: 'code-m2',
        title: 'Giai đoạn 2: Lập trình với Trợ lý AI và AI Coding IDEs',
        level: 'intermediate',
        levelName: 'Trung cấp nâng cao',
        description: 'Tận dụng Claude Code, Cursor, Copilot và Antigravity để tăng tốc độ phát triển 5x-10x.',
        nodes: [
          { id: 'ai-codegen', name: 'AI Coding và Prompt cho Lập trình', tag: 'Prompt Engineering', type: 'required', status: 'todo', desc: 'Tư duy chia nhỏ bài toán, viết TDD với AI và sinh mã tối ưu.' },
          { id: 'api-integration', name: 'Xây dựng và Kết nối API RESTful', tag: 'Workflow', type: 'required', status: 'todo', desc: 'Thiết kế RESTful API, xác thực JWT và kết nối Frontend React với Backend.' }
        ]
      },
      {
        id: 'code-m3',
        title: 'Giai đoạn 3: Phát triển Ứng dụng Fullstack và Đóng gói Triển khai',
        level: 'advanced',
        levelName: 'Chuyên sâu nâng cao',
        description: 'Xây dựng ứng dụng hoàn chỉnh từ giao diện UI đến cơ sở dữ liệu và triển khai Cloud.',
        nodes: [
          { id: 'antigravity-dev', name: 'Google Antigravity Coding', tag: 'Google Antigravity', type: 'required', status: 'todo', desc: 'Xây dựng ứng dụng Fullstack tự động hóa cao cùng Antigravity IDE.' },
          { id: 'enterprise-app', name: 'Kiến trúc Phần mềm Doanh nghiệp', tag: 'Dành cho Doanh nghiệp', type: 'recommended', status: 'todo', desc: 'Clean Architecture, Modular Monolith, tối ưu bảo mật và hiệu năng cao.' }
        ]
      }
    ]
  },
  agents: {
    icon: Cpu,
    color: '#4f46e5',
    bgLight: 'bg-indigo-50',
    border: 'border-indigo-200',
    title: 'AI Agents và Đa Tác Tử Tự Hành',
    description: 'Lộ trình làm chủ kiến trúc Autonomous AI Agents: ReAct framework, Function Calling, Memory và Multi-Agent Swarms.',
    milestones: [
      {
        id: 'agent-m1',
        title: 'Giai đoạn 1: Nền tảng AI Agent và Tool Use',
        level: 'beginner',
        levelName: 'Cơ bản cho người mới',
        description: 'Hiểu sự khác biệt giữa Chatbot thông thường và Autonomous Agent có khả năng hành động.',
        nodes: [
          { id: 'llm-fundamentals', name: 'Large Language Model', tag: 'Large Language Model', type: 'required', status: 'completed', desc: 'Hiểu cơ chế suy luận, Function Calling và Structured Outputs JSON schema.' },
          { id: 'prompt-agents', name: 'Prompt Engineering cho Agents', tag: 'Prompt Engineering', type: 'required', status: 'learning', desc: 'Khung tư duy ReAct (Reason + Act), Plan-and-Solve và Self-Consistency.' }
        ]
      },
      {
        id: 'agent-m2',
        title: 'Giai đoạn 2: Tích hợp Công cụ, Bộ nhớ và MCP Servers',
        level: 'intermediate',
        levelName: 'Trung cấp nâng cao',
        description: 'Kết nối Agent với hệ thống dữ liệu qua Model Context Protocol (MCP) và bộ nhớ Vector.',
        nodes: [
          { id: 'mcp-integration', name: 'Model Context Protocol (MCP)', tag: 'Google Antigravity', type: 'required', status: 'todo', desc: 'Tiêu chuẩn kết nối Agent với cơ sở dữ liệu, file system và external APIs.' },
          { id: 'workflow-agentic', name: 'Agentic Workflows với n8n', tag: 'n8n', type: 'required', status: 'todo', desc: 'Xây dựng Agent tự động ra quyết định theo luồng công việc cụ thể.' }
        ]
      },
      {
        id: 'agent-m3',
        title: 'Giai đoạn 3: Hệ thống Đa Agent Tự hành (Multi-Agent Swarm)',
        level: 'advanced',
        levelName: 'Chuyên sâu và Doanh nghiệp',
        description: 'Điều phối nhiều AI Agent chuyên biệt phối hợp cùng giải quyết bài toán phức tạp.',
        nodes: [
          { id: 'multi-agent-system', name: 'Multi-Agent Collaboration', tag: 'Google Antigravity', type: 'required', status: 'todo', desc: 'Phân quyền Supervisor Agent, Worker Agents và kiểm soát chất lượng đầu ra.' },
          { id: 'agent-governance', name: 'Quản trị và Giám sát AI Agent', tag: 'Dành cho Doanh nghiệp', type: 'recommended', status: 'todo', desc: 'Human-in-the-loop, bảo mật Token, chi phí vận hành và an toàn hệ thống.' }
        ]
      }
    ]
  }
};

export default function RoadmapPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Category State (Synced with URL ?cat=slug)
  const [activeCategorySlug, setActiveCategorySlug] = useState(() => searchParams.get('cat') || 'cowork');

  // Tag Filter State cho React Flow ('all' hoặc slug của tag)
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');

  // View Mode: 'flow' (React Flow Graph) or 'vertical' (roadmap.sh vertical track)
  const [viewMode, setViewMode] = useState('flow');

  // Interactive Node Drawer State
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch Categories, Tags, Courses and Posts for comprehensive mapping
  useEffect(() => {
    let mounted = true;
    async function loadRoadmapData() {
      try {
        setLoading(true);
        const [catsRes, tagsRes, coursesRes, postsRes] = await Promise.all([
          courseService.getCategories(),
          courseService.getTags(),
          courseService.getCourses(),
          postService.getPosts({ take: 20 }).catch(() => [])
        ]);

        if (mounted) {
          const courseCats = Array.isArray(catsRes) ? catsRes.filter(c => c.type === 'course' || !c.type) : [];
          setCategories(courseCats);
          setTags(Array.isArray(tagsRes) ? tagsRes : []);
          setCourses(Array.isArray(coursesRes) ? coursesRes : []);
          setPosts(Array.isArray(postsRes?.data) ? postsRes.data : Array.isArray(postsRes) ? postsRes : []);

          // Set default active category if url param not yet set
          const initialCat = searchParams.get('cat');
          if (courseCats.length > 0 && !initialCat) {
            const firstSlug = courseCats[0]?.slug || 'cowork';
            setActiveCategorySlug(firstSlug);
          }
        }
      } catch (err) {
        console.error('Failed to load roadmap data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRoadmapData();
    return () => {
      mounted = false;
    };
  }, [searchParams]);

  // Update URL param when active category changes
  const handleSelectCategory = (slug) => {
    setActiveCategorySlug(slug);
    setSelectedTagFilter('all');
    setSearchParams({ cat: slug });
    setSelectedNode(null);
    setDrawerOpen(false);
  };

  // Resolve top 6 categories
  const displayCategories = useMemo(() => {
    if (categories.length === 0) {
      return Object.keys(CATEGORY_META).map((key) => ({
        id: key,
        name: CATEGORY_META[key].title.split(':')[0].split(' và ')[0],
        slug: key,
        courseCount: 2
      }));
    }
    return categories.slice(0, 6);
  }, [categories]);

  // Current Category Meta
  const currentCategory = useMemo(() => {
    const fromApi = categories.find((c) => c.slug === activeCategorySlug);
    const fallbackKey = Object.keys(CATEGORY_META).includes(activeCategorySlug) ? activeCategorySlug : 'cowork';
    const meta = CATEGORY_META[fallbackKey] || CATEGORY_META.cowork;

    // Generate dynamic milestones from API if available
    let dynamicMilestones = null;
    if (fromApi && Array.isArray(fromApi.levels) && Array.isArray(fromApi.tags)) {
      dynamicMilestones = fromApi.levels.map((level, idx) => {
        // Tìm milestone tương ứng trong CATEGORY_META để lấy fallback desc
        const metaMilestone = meta.milestones?.find(m => m.level === level.code);

        // Lọc các tags có khóa học trong level này, hoặc nếu level của tag trùng khớp
        const tagsForLevel = fromApi.tags.filter(tag => {
          if (tag.level === level.code) return true;
          const tagLevel = tag.levels?.find(l => l.code === level.code);
          return tagLevel && tagLevel.courseCount > 0;
        });

        const nodes = tagsForLevel.map(tag => {
          // Tìm node tương ứng trong CATEGORY_META để lấy fallback desc
          const metaNode = metaMilestone?.nodes?.find(n => n.id === tag.slug || n.tag?.toLowerCase() === tag.name?.toLowerCase())
            || meta.milestones?.flatMap(m => m.nodes).find(n => n.id === tag.slug || n.tag?.toLowerCase() === tag.name?.toLowerCase());

          return {
            id: tag.slug || tag.id,
            name: tag.name,
            tag: tag.name,
            type: metaNode?.type || 'required',
            status: metaNode?.status || 'todo',
            desc: tag.description || metaNode?.desc || ''
          };
        });

        return {
          id: `${fromApi.slug}-m${idx + 1}`,
          title: metaMilestone?.title || `Giai đoạn ${idx + 1}: ${level.name}`,
          level: level.code,
          levelName: level.name,
          description: level.description || metaMilestone?.description || '',
          nodes: nodes
        };
      });

      // Nếu có tag nào chưa được phân bổ, đưa vào giai đoạn đầu tiên
      const assignedTagIds = new Set(dynamicMilestones.flatMap(m => m.nodes.map(n => n.id)));
      const unassignedTags = fromApi.tags.filter(tag => !assignedTagIds.has(tag.slug || tag.id));
      if (unassignedTags.length > 0 && dynamicMilestones.length > 0) {
        const beginnerMilestone = dynamicMilestones.find(m => m.level === 'beginner') || dynamicMilestones[0];
        const metaMilestone = meta.milestones?.find(m => m.level === beginnerMilestone.level);

        beginnerMilestone.nodes.push(...unassignedTags.map(tag => {
          const metaNode = metaMilestone?.nodes?.find(n => n.id === tag.slug || n.tag?.toLowerCase() === tag.name?.toLowerCase())
            || meta.milestones?.flatMap(m => m.nodes).find(n => n.id === tag.slug || n.tag?.toLowerCase() === tag.name?.toLowerCase());
          return {
            id: tag.slug || tag.id,
            name: tag.name,
            tag: tag.name,
            type: metaNode?.type || 'recommended',
            status: metaNode?.status || 'todo',
            desc: tag.description || metaNode?.desc || ''
          };
        }));
      }
    }

    return {
      id: fromApi?.id || fallbackKey,
      name: fromApi?.name || meta.title,
      slug: fromApi?.slug || fallbackKey,
      title: fromApi?.name || meta.title,
      description: fromApi?.description || meta.description,
      icon: meta.icon,
      color: meta.color,
      bgLight: meta.bgLight,
      border: meta.border,
      milestones: dynamicMilestones && dynamicMilestones.length > 0 ? dynamicMilestones : meta.milestones,
      tags: fromApi?.tags || null
    };
  }, [categories, activeCategorySlug]);

  // Danh sách các Tags có sẵn của Category hiện tại để hiển thị làm nút lọc
  const availableTags = useMemo(() => {
    let rawTags = [];
    if (Array.isArray(currentCategory.tags) && currentCategory.tags.length > 0) {
      rawTags = currentCategory.tags;
    } else if (currentCategory.milestones) {
      rawTags = currentCategory.milestones.flatMap((m) =>
        m.nodes.map((n) => ({
          id: n.id,
          name: n.name,
          slug: n.tag?.toLowerCase().replace(/\s+/g, '-') || n.id,
        }))
      );
    } else {
      rawTags = [
        { id: 'chatgpt', name: 'ChatGPT', slug: 'chatgpt' },
        { id: 'claude', name: 'Claude', slug: 'claude' },
        { id: 'gemini', name: 'Gemini', slug: 'gemini' },
      ];
    }

    const uniqueMap = new Map();
    rawTags.forEach((t) => {
      const key = (t.slug || t.name || '').toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, t);
      }
    });
    return Array.from(uniqueMap.values()).slice(0, 6);
  }, [currentCategory]);

  // Handle clicking a skill node to open details Drawer
  const handleNodeClick = useCallback((node, milestone) => {
    // Find matching courses by tag or category
    const matchedCourses = courses.filter((c) => {
      const nodeTag = (node.tag || node.name || '').toLowerCase();
      const hasTag = c.tags?.some((t) => t.toLowerCase() === nodeTag);
      const hasCat = c.category?.toLowerCase()?.includes(currentCategory.slug.toLowerCase()) || c.category?.toLowerCase()?.includes(currentCategory.name.toLowerCase());
      return hasTag || hasCat;
    });

    // Find matching posts
    const matchedPosts = posts.filter((p) => {
      const nodeTag = (node.tag || node.name || '').toLowerCase();
      return p.tags?.some((t) => t.toLowerCase() === nodeTag);
    });

    setSelectedNode({
      ...node,
      milestoneTitle: milestone?.title || node.milestoneTitle || 'Kỹ năng chuyên môn',
      milestoneLevel: milestone?.levelName || node.milestoneLevel || 'Cơ bản đến Nâng cao',
      courses: matchedCourses.length > 0 ? matchedCourses : courses.slice(0, 2),
      posts: matchedPosts.length > 0 ? matchedPosts : posts.slice(0, 3)
    });
    setDrawerOpen(true);
  }, [courses, posts, currentCategory]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F8FAFC]">
        <BookFinLoading />
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Đang tải bản đồ lộ trình học tập...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Top Banner Hero */}
      <section className="bg-transparent pt-6 sm:pt-8">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
            <Link to="/" className="hover:text-[#1a56db] transition-colors">Trang chủ</Link>
            <span className="text-slate-300">/</span>
            <Link to="/courses" className="hover:text-[#1a56db] transition-colors">Khóa học</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">Roadmap</span>
          </div>

          {/* Hero Banner Roadmap - Chuyển đổi thành Interactive Code Component */}
          <InteractiveRoadmapTimeline categories={categories} />

          {/* 6 Category Selection Tabs (Sticky Bar) */}
          <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 py-2 no-scrollbar">
            {displayCategories.map((cat, idx) => {
              const isActive = cat.slug === activeCategorySlug;
              const meta = CATEGORY_META[cat.slug] || CATEGORY_META.cowork;
              const TabIcon = meta.icon || BookOpen;

              return (
                <button
                  key={cat.id || cat.slug || idx}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`cursor-pointer inline-flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] text-xs font-bold whitespace-nowrap transition-all duration-200 ${isActive
                    ? 'bg-[#1a56db] text-white shadow-sm ring-2 ring-[#1a56db]/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <TabIcon size={15} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Control Bar: View Mode Switcher & Interactive Tag Filters (Vuông vắn chuẩn Layout GATS) */}
      <section className="container pt-6">
        <div className="bg-white rounded-[8px] border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-[8px] border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('flow')}
              className={`cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] text-xs font-bold transition-all ${viewMode === 'flow'
                ? 'bg-white text-[#1a56db] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Network size={14} />
              <span>Sơ đồ chuẩn GATS</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('custom')}
              className={`cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] text-xs font-bold transition-all ${viewMode === 'custom'
                ? 'bg-[#1a56db] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Sparkles size={14} className={viewMode === 'custom' ? 'text-amber-300' : 'text-[#1a56db]'} />
              <span>Thiết kế lộ trình riêng bạn</span>
            </button>
          </div>

          {/* Interactive Tag Filter Bar (Khi ở Sơ đồ chuẩn GATS) */}
          {viewMode === 'flow' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
              <span className="text-xs font-bold text-slate-600 mr-1 shrink-0">Tuyến đường:</span>

              <button
                type="button"
                onClick={() => setSelectedTagFilter('all')}
                className={`cursor-pointer px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all whitespace-nowrap ${selectedTagFilter === 'all'
                  ? 'bg-[#1a56db] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                Tất cả
              </button>

              {availableTags.map((tag) => {
                const isSelected = selectedTagFilter.toLowerCase() === (tag.slug || tag.name || '').toLowerCase();
                return (
                  <button
                    key={tag.id || tag.slug}
                    type="button"
                    onClick={() => setSelectedTagFilter(tag.slug || tag.name)}
                    className={`cursor-pointer px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all whitespace-nowrap ${isSelected
                      ? 'bg-[#1a56db] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Main Roadmap Interactive Canvas */}
      <main className="container mt-6">
        {viewMode === 'flow' ? (
          <ReactFlowRoadmapCanvas
            category={currentCategory}
            allTags={tags}
            selectedTagFilter={selectedTagFilter}
            onSelectNode={handleNodeClick}
          />
        ) : (
          <CustomRoadmapDesigner
            categories={categories}
            tags={tags}
          />
        )}
      </main>

      {/* Interactive Skill Drawer (Popup when clicking any Node) */}
      {drawerOpen && selectedNode && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1a56db] bg-blue-100 px-2.5 py-0.5 rounded-full mb-2">
                  {selectedNode.milestoneLevel}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {selectedNode.milestoneTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="cursor-pointer p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Skill Description */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                  Tổng quan kỹ năng
                </h4>
                <div className="p-4 rounded-[10px] bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedNode.desc}
                </div>
              </div>

              {/* Connected Courses */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={14} className="text-[#1a56db]" />
                    <span>Khóa học liên quan ({selectedNode.courses?.length || 0})</span>
                  </h4>
                  <Link
                    to={`/courses?tag=${encodeURIComponent(selectedNode.tag)}`}
                    className="text-xs font-bold text-[#1a56db] hover:underline"
                  >
                    Xem tất cả
                  </Link>
                </div>

                <div className="space-y-3">
                  {selectedNode.courses?.map((course) => (
                    <div
                      key={course.id}
                      className="p-3.5 rounded-[12px] border border-slate-200 hover:border-[#1a56db] bg-white transition-all duration-200 flex gap-3 group"
                    >
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-20 h-16 rounded-[8px] object-cover bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <Link
                            to={`/courses/${course.slug}`}
                            className="text-xs font-bold text-slate-900 group-hover:text-[#1a56db] line-clamp-2 transition-colors"
                          >
                            {course.title}
                          </Link>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                            {course.category}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                          <span className="text-xs font-extrabold text-[#1a56db]">
                            {course.price}
                          </span>
                          <Link
                            to={`/courses/${course.slug}`}
                            className="text-[11px] font-bold text-slate-700 group-hover:text-[#1a56db] inline-flex items-center gap-0.5"
                          >
                            <span>Học ngay</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Articles / Insights */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText size={14} className="text-amber-600" />
                  <span>Bài viết và Hướng dẫn thực hành</span>
                </h4>

                <div className="space-y-2.5">
                  {selectedNode.posts?.map((post) => (
                    <Link
                      key={post.id || post.slug}
                      to={`/post/${post.slug}`}
                      className="p-3 rounded-[10px] bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 transition-colors block group"
                    >
                      <h5 className="text-xs font-bold text-slate-800 group-hover:text-[#1a56db] line-clamp-2 transition-colors">
                        {post.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 mt-1 inline-block">
                        {post.readTime || '5 phút đọc'} • GATS Knowledge Base
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="cursor-pointer px-4 py-2.5 rounded-[10px] bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Đóng lại
              </button>
              <Link
                to={`/courses?tag=${encodeURIComponent(selectedNode.tag)}`}
                className="cursor-pointer flex-1 text-center px-4 py-2.5 rounded-[10px] bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Khám phá khóa học theo kỹ năng này
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
