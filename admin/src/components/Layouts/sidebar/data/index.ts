import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "Quản trị",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "Tổng quan",
            url: "/",
          },
        ],
      },
      {
        title: "Khóa học",
        icon: Icons.BookIcon,
        items: [
          {
            title: "Danh sách",
            url: "/course",
          },
          {
            title: "Thêm khóa học",
            url: "/course/new",
          },
          {
            title: "Danh mục",
            url: "/course/category",
          },
          {
            title: "Quản lý Quiz",
            url: "/course/quiz",
          },
          {
            title: "Quản lý Flashcard",
            url: "/course/flashcards",
          },
        ],
      },
      {
        title: "AI Gen (Viava v2)",
        icon: Icons.SparklesIcon,
        items: [
          {
            title: "Sinh Quiz AI",
            url: "/ai-gen",
          },
        ],
      },
      {
        title: "Bài viết",
        icon: Icons.DocumentIcon,
        items: [
          {
            title: "Danh sách",
            url: "/post",
          },
          {
            title: "Thêm bài viết",
            url: "/post/new",
          },
          {
            title: "Danh mục",
            url: "/post/category",
          },
        ],
      },
      {
        title: "Tài nguyên",
        icon: Icons.FolderIcon,
        items: [
          {
            title: "Video",
            url: "/video",
          },
          {
            title: "Thumbnail",
            url: "/thumbnail",
          },
          {
            title: "Files",
            url: "/file",
          },
        ],
      },
      {
        title: "Thanh toán",
        icon: Icons.PieChart,
        adminOnly: true,
        items: [
          {
            title: "Đơn hàng",
            url: "/orders",
          },
          {
            title: "Ngoại lệ thanh toán",
            url: "/orders/exceptions",
          },
          {
            title: "Tài khoản ngân hàng",
            url: "/bank-accounts",
          },
          {
            title: "Mã giảm giá",
            url: "/coupons",
          },
        ],
      },
      {
        title: "Công cụ AI",
        icon: Icons.SparklesIcon,
        adminOnly: true,
        items: [
          { title: "Prompts", url: "/ai-tools/prompts" },
          { title: "API Providers", url: "/ai-tools/api-providers" },
          { title: "API Models", url: "/ai-tools/api-models" },
          { title: "Skills", url: "/ai-tools/skills" },
          { title: "MCP", url: "/ai-tools/mcps" },
          { title: "Tools", url: "/ai-tools/tools" },
          { title: "STEM", url: "/ai-tools/stem" },
        ],
      },
      {
        title: "Membership",
        icon: Icons.PieChart,
        adminOnly: true,
        items: [
          {
            title: "Gói & hội viên",
            url: "/memberships",
          },
        ],
      },
      {
        title: "Chứng chỉ",
        icon: Icons.BookIcon,
        items: [
          {
            title: "Danh sách",
            url: "/certificates",
          },
        ],
      },
      {
        title: "Phân tích",
        icon: Icons.PieChart,
        adminOnly: true,
        items: [
          {
            title: "Tổng quan",
            url: "/analytics",
          },
        ],
      },
      {
        title: "Đăng ký tư vấn",
        icon: Icons.User,
        items: [
          {
            title: "Danh sách tư vấn",
            url: "/leads",
          },
        ],
      },
      {
        title: "Thông báo",
        icon: Icons.Calendar,
        items: [
          {
            title: "Tất cả",
            url: "/notifications",
          },
        ],
      },
      {
        title: "Kiểm duyệt",
        icon: Icons.ShieldIcon,
        items: [
          {
            title: "Hàng đợi bình luận",
            url: "/moderation",
          },
          {
            title: "Từ cấm",
            url: "/moderation/banned-words",
          },
        ],
      },
      {
        title: "Thùng rác",
        icon: Icons.TrashIcon,
        items: [
          {
            title: "Khóa học",
            url: "/course/trash",
          },
          {
            title: "Bài viết",
            url: "/post/trash",
          },
        ],
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      {
        title: "Người dùng",
        icon: Icons.User,
        adminOnly: true,
        items: [
          {
            title: "Danh sách",
            url: "/users",
          },
        ],
      },
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Cài đặt",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Tài khoản",
            url: "/pages/settings",
          },
        ],
      },
    ],
  },
];
