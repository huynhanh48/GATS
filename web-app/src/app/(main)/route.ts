import { readFile } from "node:fs/promises";
import path from "node:path";

// The Edubost document is served directly as the application home page.
export const dynamic = "force-dynamic";

const copy: Array<[string, string]> = [
  ["Edubost - University and College HTML Template", "GATS Academy - Đào tạo AI & Enterprise Workflow"],
  ["Help Desk :", "Tư vấn:"], ["+1Â (415)Â 555â€'0132", "(+84) 888 888 888"],
  ["Information For :", "Dành cho:"], ["Students", "Học viên"], ["Faculty", "Giảng viên"],
  ["Alumni", "Cựu học viên"], ["Research", "Doanh nghiệp"], ["Community", "Cộng đồng"],
  [">Home<", ">Trang chủ<"], [">University<", ">GATS Academy<"], [">College<", ">AI thực chiến<"],
  [">High School<", ">Enterprise Workflow<"], [">Admission<", ">Giới thiệu<"], [">Courses<", ">Khóa học<"],
  [">Course Details<", ">Chi tiết khóa học<"], [">Pages<", ">Khám phá<"], [">About Us<", ">Về GATS<"],
  [">Blog<", ">Tri thức AI<"], [">Blog Details<", ">Chi tiết bài viết<"], [">Event<", ">Sự kiện<"],
  [">Event Details<", ">Chi tiết sự kiện<"], [">Team<", ">Chuyên gia<"], [">Team Details<", ">Hồ sơ chuyên gia<"],
  [">Tuition & Fees<", ">Học phí<"], [">Contact<", ">Liên hệ<"], ["Search", "Tìm kiếm"], ["English", "Tiếng Việt"],
  ["Welcome to University", "NỀN TẢNG ĐÀO TẠO AI & ENTERPRISE WORKFLOW"],
  ["Edubost University Your <br> Pathway to Success", "GATS Academy — Con Đường <br> Làm Chủ Công Nghệ AI"],
  ["explore programs", "khám phá chương trình"], ["apply now", "đăng ký ngay"], ["talk with a teacher", "tư vấn cùng chuyên gia"],
  ["Latest News", "Tin tức & tri thức AI"], ["Campus News", "Cập Nhật Công Nghệ AI"],
  ["EduFord University Hosts International on Climate..", "Ứng Dụng ChatGPT & Claude API Tự Động Hóa Workflow.."],
  ["Thirty-one UChicago faculty members receive named..", "Khung Chuẩn Bảo Mật Dữ Liệu AI Doanh Nghiệp.."],
  ["EduFord University Receives Grant for <br> Advanced STEM Programs..", "Hệ Thống Đào Tạo AI Thực Chiến <br> Đạt Chứng Nhận Toàn Quốc.."],
  ["our Awarded National for Community Outreach..", "Khai Phá 80% Năng Suất Với Multi-Agent N8N & Make.."],
  ["Expands Campus Facilities <br> with State of-the-Art Lab..", "Xu Hướng AI Marketing & <br> Sáng Tạo Nội Dung Mới.."],
  ["More Campus News", "xem tất cả bài viết"], ["Our academics offerings", "Hệ thống đào tạo thực chiến"],
  ["Our Top Department", "Chuyên Ngành Nổi Bật"], [">Economics<", ">Kinh Tế Số & Quản Trị AI<"],
  [">Medical<", ">AI Agent & LLM<"], [">Technology<", ">Tự Động Hóa Workflow<"],
  [">Mathematics<", ">Phân Tích Dữ Liệu<"], [">Science<", ">AI Marketing<"],
  [">Marketing<", ">Prompt Engineering<"], [">Research<", ">Nghiên Cứu AI<"],
  [">Health &amp; Fitness<", ">Bảo Mật Dữ Liệu AI<"],
  ["our teaching quality is best <br> from other university", "đào tạo thực chiến tạo nên <br> kết quả khác biệt"],
  ["Institutes in University", "Năm Kinh Nghiệm Cố Vấn"], ["library  in University", "Doanh Nghiệp Đồng Hành"],
  ["Top Programs", "Chương Trình Nổi Bật"], ["view all programs", "xem tất cả chương trình"],
  ["MBA in Biomedical Engineering..", "AI Cơ Bản — Miễn Phí 100%.."],
  ["MBA in Advanced Construction..", "AI Nâng Cao & Tự Động Hóa Workflow.."],
  ["MBA in Management and Strategic..", "Quản Trị AI & Đo Lường ROI.."],
  ["MBA in Mechanical Engineering..", "AI Agent & Prompt Engineering.."],
  ["MBA in Sustainable Energy..", "Bảo Mật Dữ Liệu AI Doanh Nghiệp.."],
  ["MBA in Real Estate and Urban..", "Workshop AI Theo Từng Phòng Ban.."],
  ["Get Your Quality Skills Certificate Through Edubost", "Nhận Chứng Nhận Kỹ Năng AI Thực Chiến Từ GATS"],
  ["Our Campus Life", "Trải Nghiệm Học Tập"], ["Cultural Experiences", "Workshop Thực Chiến"],
  ["read more", "tìm hiểu thêm"], ["Our Student Stories", "Cảm nhận học viên"],
  ["Happy Student Feedback", "Kết Quả Thực Tế Từ Học Viên"], ["Our Events", "Lịch hoạt động"],
  ["Our upcoming events", "Sự Kiện Sắp Diễn Ra"],
  ["Celebrating Diversity through Art and Performance..", "Live Q&A Trực Tiếp Cùng Chuyên Gia GATS.."],
  ["Global Perspectives Bridging Cultures, Shaping Futures..", "Workshop Xây Dựng AI Workflow Thực Chiến.."],
  ["Throw an event to kick off a mentorship program..", "Ứng Dụng AI Agent Cho Vận Hành Doanh Nghiệp.."],
  ["Hongbo Chi, Ph.D., Integrating systems immunology with..", "Bảo Mật Dữ Liệu Trong Kỷ Nguyên AI Agent.."],
  ["get a tickets", "đăng ký tham gia"], ["Admissions", "Tuyển sinh"],
  ["Quick Links", "Liên kết nhanh"], ["Additional Links", "Hỗ trợ"],
];

const links: Array<[string, string]> = [
  ["index.html", "/"], ["courses.html", "/courses"], ["course-single.html", "/courses"],
  ["admission.html", "/about"], ["about.html", "/about"], ["blog.html", "/posts"],
  ["blog-single.html", "/posts"], ["event.html", "/contact"], ["event-single.html", "/contact"],
  ["team.html", "/about"], ["team-single.html", "/about"], ["tuition-fees.html", "/courses"], ["contact.html", "/contact"],
];

const sharedNav = `<nav class="main-menu collapse navbar-collapse" aria-label="Điều hướng chính"><ul>
  <li class="active"><a href="/">Trang chủ</a></li>
  <li><a href="/about">Giới thiệu</a></li>
  <li><a href="/courses">Khóa học</a></li>
  <li><a href="/posts">Tri thức AI</a></li>
  <li><a href="/contact">Liên hệ</a></li>
</ul></nav>`;

const sharedMobileNav = `<nav class="xb-header-nav" aria-label="Điều hướng di động"><ul class="xb-menu-primary clearfix">
  <li class="menu-item active"><a href="/">Trang chủ</a></li>
  <li class="menu-item"><a href="/about">Giới thiệu</a></li>
  <li class="menu-item"><a href="/courses">Khóa học</a></li>
  <li class="menu-item"><a href="/posts">Tri thức AI</a></li>
  <li class="menu-item"><a href="/contact">Liên hệ</a></li>
</ul></nav>`;

const profileMenu = `<a class="header-cart" href="/cart" aria-label="Giỏ hàng"><i class="far fa-shopping-cart"></i></a>
<details class="header-profile">
  <summary aria-label="Menu cá nhân"><i class="far fa-user profile-fallback"></i><img class="profile-avatar" alt="Ảnh đại diện"></summary>
  <div class="header-profile-menu">
    <a href="/profile"><i class="far fa-user-circle"></i><span>Hồ sơ cá nhân</span></a>
    <a href="/profile?tab=courses"><i class="far fa-book-open"></i><span>Khóa học của tôi</span></a>
    <a href="/cart"><i class="far fa-shopping-cart"></i><span>Giỏ hàng</span></a>
  </div>
</details>`;

export async function GET() {
  const templatePath = path.join(process.cwd(), "design_template", "edubost", "index.html");
  let html = await readFile(templatePath, "utf8");
  html = html
    .replaceAll('href="css/', 'href="/edubost/css/')
    .replaceAll('src="js/', 'src="/edubost/js/')
    .replaceAll('src="images/', 'src="/edubost/images/')
    .replaceAll('href="images/', 'href="/edubost/images/')
    .replaceAll('<form role="search" action="#">', '<form role="search" action="/courses" method="get">')
    .replaceAll('<form role="search" class="search-form" action="#">', '<form role="search" class="search-form" action="/courses" method="get">')
    .replaceAll('name="s"', 'name="keyword"')
    .replaceAll('data-background="assets/img/bg/hero_bg.jpg"', 'data-background="/edubost-reference/img/bg/hero_bg.jpg" style="background-image:url(/edubost-reference/img/bg/hero_bg.jpg)"')
    .replaceAll('data-background="assets/img/bg/news_bg01.jpg"', 'data-background="/edubost-reference/img/bg/news_bg01.jpg" style="background-image:url(/edubost-reference/img/bg/news_bg01.jpg)"')
    .replaceAll('data-background="assets/img/bg/pro-banner.png"', 'data-background="/edubost-reference/img/bg/pro-banner.png" style="background-image:url(/edubost-reference/img/bg/pro-banner.png)"')
    .replaceAll('data-background="assets/img/bg/campus-bg.jpg"', 'data-background="/edubost-reference/img/bg/campus-bg.jpg" style="background-image:url(/edubost-reference/img/bg/campus-bg.jpg)"')
    .replaceAll('data-background="assets/img/bg/footer-bg.jpg"', 'data-background="/edubost-reference/img/bg/footer-bg.jpg" style="background-image:url(/edubost-reference/img/bg/footer-bg.jpg)"');
  for (const [from, to] of copy) html = html.replaceAll(from, to);
  for (const [from, to] of links) html = html.replaceAll(from, to);
  html = html
    .replace(/<nav class="main-menu collapse navbar-collapse">[\s\S]*?<\/nav>/, sharedNav)
    .replace(/<nav class="xb-header-nav">[\s\S]*?<\/nav>/, sharedMobileNav)
    .replace('<div class="language_dropdown dropdown">', `${profileMenu}<div class="language_dropdown dropdown">`);
  html = html.replace("</head>", `<style>
    #preloader{display:none!important}
    #xb-header-area .header-top_wrap,#xb-header-area .header-top{background-color:#60060f!important}
    #xb-header-area .language_dropdown{display:none!important}
    #xb-header-area .header-cart{width:46px;height:46px;margin-left:28px;display:flex;align-items:center;justify-content:center;color:#170006;font-size:21px;border-left:1px solid #d0c4c4;padding-left:24px;box-sizing:content-box}
    #xb-header-area .header-cart:hover{color:#60060f}
    #xb-header-area .header-profile{position:relative;margin-left:14px}
    #xb-header-area .header-profile summary{overflow:hidden;list-style:none;width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#60060f;color:#fff;font-size:20px;cursor:pointer;transition:.25s}
    #xb-header-area .header-profile summary::-webkit-details-marker{display:none}
    #xb-header-area .header-profile summary:hover,#xb-header-area .header-profile[open] summary{background:#781921}
    #xb-header-area .profile-avatar{display:none;width:100%;height:100%;object-fit:cover}
    #xb-header-area .header-profile.has-avatar .profile-avatar{display:block}
    #xb-header-area .header-profile.has-avatar .profile-fallback{display:none}
    #xb-header-area .header-profile-menu{position:absolute;top:calc(100% + 12px);right:0;width:220px;padding:8px;background:#fff;border:1px solid #eee;border-radius:8px;box-shadow:0 12px 32px rgba(23,0,6,.14);z-index:1000}
    #xb-header-area .header-profile-menu:before{content:"";position:absolute;right:15px;top:-7px;width:14px;height:14px;background:#fff;border-left:1px solid #eee;border-top:1px solid #eee;transform:rotate(45deg)}
    #xb-header-area .header-profile-menu a{position:relative;display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:6px;color:#170006;font-size:15px;font-weight:600;white-space:nowrap}
    #xb-header-area .header-profile-menu a:hover{background:rgba(96,6,15,.07);color:#60060f}
    #xb-header-area .header-profile-menu i{width:18px;text-align:center;color:#60060f}
    .hero>.bg_img{min-height:640px;background-position:center center;background-size:cover;background-repeat:no-repeat}
    .hero .hero__content-wrap{position:relative;z-index:2}
    .hero .hero__content-wrap .wow{visibility:visible!important}
    .hero .bg_img:after{content:"";position:absolute;inset:0;background:rgba(23,0,6,.44);z-index:0}.hero .container{position:relative;z-index:1}
    @media(max-width:767px){.hero>.bg_img{min-height:480px}.hero__content-wrap{padding-top:35px}.hero .title{font-size:42px;line-height:1.08}.hero-btns .btns{gap:10px}.hero-btns .thm-btn{font-size:11px}}
  </style></head>`);
  html = html.replace("</body>", `<script>
    (function(){
      fetch('/api/user/me',{credentials:'include'}).then(function(response){if(!response.ok)throw new Error('anonymous');return response.json()}).then(function(data){
        var url=data&&data.user&&data.user.avatarUrl;
        if(!url)return;
        document.querySelectorAll('.header-profile').forEach(function(profile){
          var avatar=profile.querySelector('.profile-avatar');
          if(!avatar)return;
          avatar.addEventListener('error',function(){profile.classList.remove('has-avatar');avatar.removeAttribute('src')});
          avatar.src=url;profile.classList.add('has-avatar');
        });
      }).catch(function(){});
    })();
  </script></body>`);
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
