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
            url: "/admin",
          },
        ],
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
            title: "Thêm khóa học",
            url: "/admin/course/new",
          },
          {
            title: "Danh mục",
            url: "/admin/course/category",
          },
          {
            title: "Quản lý Quiz",
            url: "/admin/course/quiz",
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
            title: "Thêm bài viết",
            url: "/admin/post/new",
          },
          {
            title: "Danh mục",
            url: "/admin/post/category",
          },
        ],
      },
      {
        title: "Tài nguyên",
        icon: Icons.FolderIcon,
        items: [
          {
            title: "Video",
            url: "/admin/video",
          },
          {
            title: "Thumbnail",
            url: "/admin/thumbnail",
          },
          {
            title: "Files",
            url: "/admin/file",
          },
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
          },
        ],
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
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
        title: "Cài đặt",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Tài khoản",
            url: "/admin/pages/settings",
          },
        ],
      },
    ],
  },
];
