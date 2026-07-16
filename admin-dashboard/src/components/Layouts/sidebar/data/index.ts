import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "Tổng quan",
            url: "/admin",
          },
          {
            title: "Doanh thu & Đơn hàng",
            url: "/admin/analytics/sales",
          },
          {
            title: "Học viên & Lượt xem",
            url: "/admin/analytics/engagement",
          },
          {
            title: "Kết quả học tập",
            url: "/admin/analytics/assessments",
          },
          {
            title: "Hiệu suất Khóa học",
            url: "/admin/analytics/courses",
          },
        ],
      },
      {
        title: "Bài viết",
        icon: Icons.DocumentIcon,
        items: [
          {
            title: "Danh sách",
            url: "/admin/post",
          },
          {
            title: "Danh mục",
            url: "/admin/post/category",
          }
        ],
      },
      {
        title: "Calendar",
        url: "/admin/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Profile",
        url: "/admin/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Khóa học",
        icon: Icons.BookIcon,
        items: [
          {
            title: "Danh sách",
            url: "/admin/course",
          },
          {
            title: "Danh mục",
            url: "/admin/course/category",
          },
          {
            title: "Thêm khóa học",
            url: "/admin/course/new",
          },
          {
            title: "Quản lý Quiz",
            url: "/admin/course/quiz",
          }
        ],
      },
      {
        title: "Tài Nguyên",
        icon: Icons.FolderIcon,
        items: [
          {
            title: "Video",
            url: "/admin/video",
          },
          {
            title: "Thumnails",
            url: "/admin/thumbnail",
          },
          {
            title: "Files",
            url: "/admin/file",
          }
        ],
      },
      {
        title: "Thùng rác",
        icon: Icons.TrashIcon,
        items: [
          {
            title: "Khóa học",
            url: "/admin/course/trash",
          },
          {
            title: "Bài viết",
            url: "/admin/post/trash",
          }
        ],
      },
      {
        title: "AI",
        icon: Icons.SparklesIcon,
        items: [
          {
            title: "Chatbox",
            url: "/admin/ai/chatbox",
          },
          {
            title: "RAG",
            url: "/admin/ai/rag",
          },
        ],
      },
      {
        title: "Forms",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Form Elements",
            url: "/admin/forms/form-elements",
          },
          {
            title: "Form Layout",
            url: "/admin/forms/form-layout",
          },
        ],
      },
      {
        title: "Tables",
        url: "/admin/tables",
        icon: Icons.Table,
        items: [
          {
            title: "Tables",
            url: "/admin/tables",
          },
        ],
      },
      {
        title: "Pages",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Settings",
            url: "/admin/pages/settings",
          },
        ],
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "Charts",
        icon: Icons.PieChart,
        items: [
          {
            title: "Basic Chart",
            url: "/admin/charts/basic-chart",
          },
        ],
      },
      {
        title: "UI Elements",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Alerts",
            url: "/admin/ui-elements/alerts",
          },
          {
            title: "Buttons",
            url: "/admin/ui-elements/buttons",
          },
        ],
      },
    ],
  },
];
