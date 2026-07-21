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
            title: "Mã giảm giá",
            url: "/coupons",
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
            title: "Danh sách lead",
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
