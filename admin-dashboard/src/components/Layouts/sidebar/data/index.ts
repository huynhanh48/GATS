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
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
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
