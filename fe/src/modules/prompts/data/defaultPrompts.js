/**
 * Fallback danh sách 8 Prompts mẫu chuẩn hóa của GATS Academy
 * Đảm bảo giao diện luôn hiển thị đầy đủ ngay cả khi chạy ở môi trường Local/Offline
 */
export const DEFAULT_PROMPTS = [
  {
    id: "c6eb1584-a1bf-462d-901b-bf731ab5c99e",
    type: "prompt",
    itemKey: "prompt-02",
    title: "Chuyên Gia Copywriting Viết Bài Sales Page Chuyển Đổi Cao",
    isPublic: true,
    isPaid: false,
    payload: {
      tags: ["ChatGPT", "Marketing", "Copywriting", "SalesPage", "AIDA"],
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
      model: "ChatGPT 4o",
      price: "Miễn phí",
      rating: 5,
      category: "Marketing",
      template: "Bạn là một Chuyên gia Copywriter thương mại điện tử. Hãy viết bài viết quảng cáo bán hàng cho [product_name] nhắm tới nhóm khách hàng [target_audience]. Mục tiêu chính là [conversion_goal]. Sử dụng giọng văn [tone_style] và chèn 3 lời kêu gọi hành động (CTA) cực mạnh.",
      variables: [
        {
          name: "product_name",
          label: "Tên Sản Phẩm",
          placeholder: "Tên sản phẩm/dịch vụ của bạn",
          defaultValue: "Khóa học AI Workflow Thực Chiến"
        },
        {
          name: "target_audience",
          label: "Khách Hàng Mục Tiêu",
          placeholder: "Ví dụ: Nhân viên văn phòng, Học sinh",
          defaultValue: "Chủ doanh nghiệp nhỏ và Chuyên viên Marketing"
        },
        {
          name: "conversion_goal",
          label: "Mục Tiêu Chuyển Đổi",
          placeholder: "Mua hàng, Đăng ký dùng thử...",
          defaultValue: "Đăng ký tư vấn miễn phí ngay hôm nay"
        },
        {
          name: "tone_style",
          label: "Phong Cách",
          placeholder: "Ví dụ: Thân thiện, Chuyên nghiệp",
          defaultValue: "Thuyết phục, uy tín và năng lượng tích cực"
        }
      ],
      authorName: "GATS_Academy",
      isFeatured: true,
      salesCount: 2450,
      authorBadge: "Official",
      description: "Khung prompt chuẩn hóa công thức AIDA & PAS, giúp viết trang bán hàng và bài quảng cáo Facebook thu hút khách hàng tiềm năng tức thì.",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      instructions: "Điền thông tin chi tiết vào các ô biến bên dưới. Bạn có thể yêu cầu AI xuất ra định dạng Markdown hoặc HTML sẵn sàng đăng bài.",
      reviewsCount: 310,
      modelBadgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200"
    }
  },
  {
    id: "2d9b89e2-d8c1-4551-8420-3a23f076b10c",
    type: "prompt",
    itemKey: "prompt-08",
    title: "Kịch Bản Chatbot AI Tư Vấn & Chăm Sóc Khách Hàng Tự Động",
    isPublic: true,
    isPaid: false,
    payload: {
      tags: ["ChatGPT", "AIAgents", "Chatbot", "CustomerService", "Automation"],
      image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
      model: "ChatGPT 4o",
      price: "Miễn phí",
      rating: 5,
      category: "AI Agents",
      template: "Bạn là một AI Agent tư vấn bán hàng cho thương hiệu [brand_name]. Khách hàng đang băn khoăn về [customer_concern]. Hãy phản hồi với phong cách [tone], đồng cảm và thuyết phục giải quyết mối lo, sau đó nhẹ nhàng gợi ý ưu đãi đặc quyền [offer_details].",
      variables: [
        { name: "brand_name", label: "Tên Thương Hiệu", placeholder: "Ví dụ: GATS AI", defaultValue: "GATS Academy" },
        { name: "customer_concern", label: "Vấn Đề Khách Băn Khoăn", placeholder: "Giá cao, chưa biết bắt đầu...", defaultValue: "Chưa có kinh nghiệm lập trình sợ học khó" },
        { name: "tone", label: "Giọng Điệu", placeholder: "Thân thiện, chuyên nghiệp", defaultValue: "Nhiệt tình, ân cần và tự tin" },
        { name: "offer_details", label: "Ưu Đãi / Quà Tặng", placeholder: "Giảm giá 20%, tặng kèm...", defaultValue: "Tặng kèm 1 buổi 1:1 định hướng lộ trình học" }
      ],
      authorName: "AIAgent_Factory",
      salesCount: 970,
      authorBadge: "Verified",
      description: "Prompt đóng vai AI Agent tư vấn bán hàng chuyên nghiệp, xử lý từ chối giá khéo léo và điều hướng chốt đơn.",
      authorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
      instructions: "Dán prompt vào ChatGPT hoặc tích hợp vào chatbot n8n để tự động chăm sóc khách 24/7.",
      reviewsCount: 145,
      modelBadgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200"
    }
  },
  {
    id: "7e80ce1d-3e32-451b-8a71-447f61d829ca",
    type: "prompt",
    itemKey: "prompt-03",
    title: "Kỹ Sư AI Tự Động Viết & Tối Ưu Code Python Enterprise",
    isPublic: true,
    isPaid: false,
    payload: {
      tags: ["DeepSeek", "Python", "Coding", "Backend", "FastAPI"],
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      model: "DeepSeek R1",
      price: "Miễn phí",
      rating: 4.8,
      category: "Coding",
      template: "Bạn là một Senior Python Architect. Hãy viết mã nguồn Python hoàn chỉnh cho tác vụ [task_description] sử dụng framework [framework_name]. Yêu cầu áp dụng Clean Architecture, đầy đủ Type Hints, Docstrings và bộ Unit Test pytest có độ bao phủ 100%.",
      variables: [
        { name: "task_description", label: "Mô Tả Tác Vụ", placeholder: "Ví dụ: REST API xác thực JWT", defaultValue: "Xây dựng service xử lý thanh toán và webhook bảo mật" },
        { name: "framework_name", label: "Framework", placeholder: "FastAPI, Django...", defaultValue: "FastAPI + Pydantic v2" }
      ],
      authorName: "DevMaster_VN",
      salesCount: 520,
      description: "Prompts lập luận suy luận sâu (Chain-of-Thought) cho DeepSeek R1 để tạo mã nguồn Python chuẩn PEP8, đầy đủ Type Hinting & Unit Test.",
      authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      instructions: "Phù hợp nhất khi dùng cùng DeepSeek R1, Claude 3.5 Sonnet hoặc Cursor AI.",
      reviewsCount: 98,
      modelBadgeColor: "bg-blue-500/10 text-blue-600 border-blue-200"
    }
  },
  {
    id: "5dc5e5d8-71b4-4d9c-91c4-38c7f974f7c7",
    type: "prompt",
    itemKey: "prompt-05",
    title: "Lập Kế Hoạch Chiến Lược Content Marketing 30 Ngày",
    isPublic: true,
    isPaid: false,
    payload: {
      tags: ["ChatGPT", "ContentPlan", "Business", "Marketing", "Strategy"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      model: "ChatGPT 4o",
      price: "Miễn phí",
      rating: 4.9,
      category: "Business",
      template: "Hãy đóng vai Trưởng phòng Marketing. Lập bảng kế hoạch nội dung 30 ngày cho kênh [platform] thuộc ngành hàng [industry]. Mỗi ngày bao gồm: Tiêu đề Hook, Định dạng (Video/Post/Infographic), Góc tiếp cận tâm lý và Lời kêu gọi hành động.",
      variables: [
        { name: "platform", label: "Nền Tảng", placeholder: "Facebook, TikTok, LinkedIn...", defaultValue: "TikTok & Facebook Reels" },
        { name: "industry", label: "Ngành Hàng / Lĩnh Vực", placeholder: "Thời trang, F&B, Giáo dục AI...", defaultValue: "Đào tạo AI và Tự động hóa Doanh nghiệp" }
      ],
      authorName: "GATS_Academy",
      salesCount: 1650,
      authorBadge: "Official",
      description: "Tạo ma trận nội dung 30 ngày đa kênh, phân bổ bài viết theo phễu nhận biết, tương tác và chuyển đổi đơn hàng.",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      instructions: "Điền ngành hàng và nền tảng để AI xuất bảng lịch chi tiết theo định dạng Markdown bảng biểu.",
      reviewsCount: 182,
      modelBadgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200"
    }
  },
  {
    id: "ec8b499e-7fa4-469a-9e19-0bb3aa575f0f",
    type: "prompt",
    itemKey: "prompt-06",
    title: "Phân Tích & Tóm Tắt Báo Cáo Tài Chính / PDF Dài",
    isPublic: true,
    isPaid: false,
    payload: {
      tags: ["Claude", "Finance", "PDF", "Productivity", "Analysis"],
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
      model: "Claude 3.5 Sonnet",
      price: "Miễn phí",
      rating: 4.9,
      category: "Productivity",
      template: "Bạn là một Chuyên gia Phân tích Tài chính & Dữ liệu. Hãy đọc tài liệu đính kèm về [document_name] và trích xuất:\n1. Tóm tắt điều hành 3 câu ngắn gọn.\n2. Bảng 5 chỉ số tài chính quan trọng nhất.\n3. Phân tích 3 rủi ro chính và đề xuất giải pháp kiểm soát.",
      variables: [
        { name: "document_name", label: "Tên Tài Liệu", placeholder: "Tên tài liệu hoặc đề án", defaultValue: "Báo cáo tài chính quý 4 năm 2025" }
      ],
      authorName: "GATS_Academy",
      salesCount: 1890,
      authorBadge: "Official",
      description: "Trích xuất nhanh các chỉ số cốt lõi, ma trận rủi ro và bản tóm tắt điều hành Executive Summary từ tài liệu hàng trăm trang.",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      instructions: "Đính kèm file PDF hoặc dán văn bản trực tiếp vào cửa sổ chat cùng với prompt này trên Claude 3.5 Sonnet.",
      reviewsCount: 215,
      modelBadgeColor: "bg-amber-500/10 text-amber-600 border-amber-200"
    }
  },
  {
    id: "75f52128-d819-4fab-b598-c450bf5ba9a1",
    type: "prompt",
    itemKey: "prompt-04",
    title: "Thiết Kế Logo Vector Minimalist Thương Hiệu Sang Trọng",
    isPublic: true,
    isPaid: false,
    payload: {
      tags: ["Flux", "Logo", "Vector", "Design", "Minimalist"],
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
      model: "Flux.1 AI",
      price: "Miễn phí",
      rating: 4.9,
      category: "Design",
      template: "Minimalist flat vector logo of [logo_symbol] for a luxury modern brand [brand_name], elegant clean lines, geometric simplicity, solid color palette [color_palette], isolated on pure white background, no text, premium vector graphics, 8k resolution --v 6.0",
      variables: [
        { name: "logo_symbol", label: "Biểu Tượng Logo", placeholder: "Chim ưng, cánh hoa, chữ G cách điệu...", defaultValue: "Chim phượng hoàng cách điệu hình học tối giản" },
        { name: "brand_name", label: "Tên Thương Hiệu", placeholder: "Tên công ty / thương hiệu", defaultValue: "Aura Luxury" },
        { name: "color_palette", label: "Bảng Màu", placeholder: "Xanh cobalt và vàng gold...", defaultValue: "Deep royal blue and metallic gold" }
      ],
      authorName: "StudioDesign_Pro",
      salesCount: 430,
      description: "Bộ prompt thiết kế logo phong cách tối giản phẳng, vector sắc nét không dính chữ, thích hợp làm nhận diện thương hiệu cho Startup.",
      authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      instructions: "Sao chép và dán trực tiếp vào Midjourney hoặc Flux.1 AI để sinh ảnh chất lượng cao.",
      reviewsCount: 76,
      modelBadgeColor: "bg-amber-500/10 text-amber-600 border-amber-200"
    }
  },
  {
    id: "28e452fe-a496-49f8-8422-3a01a384dea4",
    type: "prompt",
    itemKey: "prompt-07",
    title: "Tạo Phối Cảnh Nội Thất Căn Hộ Luxury Modern 3D",
    isPublic: true,
    isPaid: false,
    payload: {
      tags: ["Midjourney", "Architecture", "3D", "Interior", "Luxury"],
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      model: "Midjourney v6",
      price: "Miễn phí",
      rating: 4.9,
      category: "Art & 3D",
      template: "Interior design rendering of a luxury penthouse [room_type], contemporary architecture, Italian marble flooring, walnut wood panels, soft ambient sunset lighting through floor-to-ceiling windows, high-end designer furniture, photorealistic, architectural digest photography, 8k, --ar 16:9 --v 6.0",
      variables: [
        { name: "room_type", label: "Loại Phòng", placeholder: "Phòng khách, phòng ngủ master...", defaultValue: "Phòng khách kết hợp quầy bar hiện đại" }
      ],
      authorName: "ArchViz_Pro",
      salesCount: 380,
      description: "Prompt dựng phối cảnh 3D nội thất kiến trúc sang trọng, chi tiết mảng tường gỗ, đá marble và ánh sáng tự nhiên.",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      instructions: "Dùng cho Midjourney v6 với tỷ lệ khung hình ngang 16:9.",
      reviewsCount: 62,
      modelBadgeColor: "bg-purple-500/10 text-purple-600 border-purple-200"
    }
  },
  {
    id: "d2f9b8c0-302b-4cc9-b4ca-86c97011bab6",
    type: "prompt",
    itemKey: "prompt-01",
    title: "Tạo Ảnh Chân Dung Cinematic 8K Học Viên & Doanh Nhân Việt",
    isPublic: true,
    isPaid: false,
    payload: {
      tags: ["Midjourney", "Portrait", "Vietnamese", "Photorealistic", "Cinematic"],
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      model: "Midjourney v6",
      price: "Miễn phí",
      rating: 4.9,
      category: "Photography",
      template: "Cinematic portrait photograph of a confident Vietnamese [profession], age around [age_range], sharp facial features, wearing modern smart-casual attire, in a high-tech modern office with blurred background bokeh lights, shot on Hasselblad 50mm f/1.2 lens, photorealistic studio lighting, ultra-detailed skin texture, 8k, --ar 3:4 --v 6.0",
      variables: [
        { name: "profession", label: "Nghề Nghiệp / Phong Thái", placeholder: "Doanh nhân, Kỹ sư AI...", defaultValue: "Tech Entrepreneur and AI Leader" },
        { name: "age_range", label: "Độ Tuổi", placeholder: "28-35 years old", defaultValue: "30-35 years old" }
      ],
      authorName: "MinhTu_AIArt",
      isFeatured: true,
      salesCount: 890,
      authorBadge: "Top Creator",
      description: "Bộ prompt tạo ảnh chân dung góc rộng cinematic sắc nét dành riêng cho khuôn mặt và phong cách người Việt Nam. Phù hợp làm banner, avatar chuyên nghiệp.",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      instructions: "Dán vào Midjourney v6 để có ảnh chân dung avatar chuẩn phong thái lãnh đạo công nghệ.",
      reviewsCount: 142,
      modelBadgeColor: "bg-purple-500/10 text-purple-600 border-purple-200"
    }
  }
];

