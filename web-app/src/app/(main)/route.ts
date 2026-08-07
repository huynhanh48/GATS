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

const profileMenu = `<a class="header-cart" href="/cart" aria-label="Giỏ hàng"><i class="far fa-shopping-cart"></i><span class="header-cart-count" hidden></span></a>
<a class="header-login" href="/courses?auth=login" hidden>Đăng nhập</a>
<details class="header-profile" hidden>
  <summary aria-label="Menu cá nhân"><i class="far fa-user profile-fallback"></i><img class="profile-avatar" alt="Ảnh đại diện"></summary>
  <div class="header-profile-menu">
    <a href="/profile"><i class="far fa-user-circle"></i><span>Hồ sơ cá nhân</span></a>
    <a href="/profile?tab=courses"><i class="far fa-book-open"></i><span>Khóa học của tôi</span></a>
    <a href="/cart"><i class="far fa-shopping-cart"></i><span>Giỏ hàng</span></a>
    <a class="profile-login" href="/courses?auth=login" hidden><i class="far fa-sign-in"></i><span>Đăng nhập</span></a>
    <button class="profile-logout" type="button" hidden><i class="far fa-sign-out"></i><span>Đăng xuất</span></button>
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
    .replaceAll('/edubost/images/logo.svg', '/edubost-reference/img/logo/logo-gats.svg')
    .replaceAll('/edubost/images/logo_white.svg', '/edubost-reference/img/logo/logo-gats-white.svg')
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
    .replace(
      /<ul class="xb-item--links-btn list-unstyled">[\s\S]*?<\/ul>/,
      `<ul class="xb-item--links-btn list-unstyled">
        <li><a class="thm-btn" href="/courses">Khóa học</a></li>
        <li><a class="thm-btn" href="/posts">Bài viết</a></li>
        <li><a class="thm-btn" href="/about">Về GATS</a></li>
        <li><a class="thm-btn" href="/contact">Liên hệ</a></li>
      </ul>`,
    )
    .replace('<div class="language_dropdown dropdown">', `${profileMenu}<div class="language_dropdown dropdown">`);
  html = html.replace("</head>", `<style>
    #preloader{display:none!important}
    #xb-header-area .header-top_wrap,#xb-header-area .header-top{background-color:#60060f!important}
    #xb-header-area .xb-help_desk{display:flex;align-items:center;flex-wrap:nowrap;gap:6px;white-space:nowrap}
    #xb-header-area .xb-help_desk img{flex:0 0 auto;display:block}
    #xb-header-area .xb-help_desk p{display:block;margin:0;line-height:30px}
    #xb-header-area .language_dropdown{display:none!important}
    #xb-header-area .header-right{display:flex;align-items:center;flex-wrap:nowrap}
    #xb-header-area .header-search{margin-right:16px;padding-right:18px;white-space:nowrap}
    #xb-header-area .header-search:before{height:32px;background:#d0c4c4}
    #xb-header-area .header-cart{position:relative;width:42px;height:42px;margin:0;display:flex;align-items:center;justify-content:center;color:#170006;font-size:21px;border:0;padding:0;box-sizing:border-box}
    #xb-header-area .header-cart:hover{color:#60060f}
    #xb-header-area .header-cart-count{position:absolute;top:-2px;right:-3px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:#60060f;color:#fff;font:700 10px/17px Arial;text-align:center}
    #xb-header-area .header-login{min-width:112px;height:44px;margin-left:10px;padding:0 20px;align-items:center;justify-content:center;background:#60060f;color:#fff;font-size:15px;font-weight:700;border-radius:4px}
    #xb-header-area .header-login:not([hidden]){display:inline-flex}
    #xb-header-area .header-login:hover{background:#4b040c;color:#fff}
    #xb-header-area .header-profile{position:relative;margin-left:10px}
    #xb-header-area .header-profile summary{overflow:hidden;list-style:none;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#60060f;color:#fff;font-size:20px;cursor:pointer;transition:.25s}
    #xb-header-area .header-profile summary::-webkit-details-marker{display:none}
    #xb-header-area .header-profile summary:hover,#xb-header-area .header-profile[open] summary{background:#781921}
    #xb-header-area .profile-avatar{display:none;width:100%;height:100%;object-fit:cover}
    #xb-header-area .header-profile.has-avatar .profile-avatar{display:block}
    #xb-header-area .header-profile.has-avatar .profile-fallback{display:none}
    #xb-header-area .header-profile-menu{position:absolute;top:calc(100% + 12px);right:0;width:246px;padding:8px;background:#fff;border:1px solid #eee;border-radius:8px;box-shadow:0 12px 32px rgba(23,0,6,.14);z-index:1000}
    #xb-header-area .header-profile-menu:before{content:"";position:absolute;right:15px;top:-7px;width:14px;height:14px;background:#fff;border-left:1px solid #eee;border-top:1px solid #eee;transform:rotate(45deg)}
    #xb-header-area .header-profile-menu a,#xb-header-area .profile-logout{position:relative;width:100%;display:flex;align-items:center;gap:11px;padding:11px 12px;border:0;border-radius:6px;background:#fff;color:#170006;font-size:15px;font-weight:600;white-space:nowrap;text-align:left;cursor:pointer}
    #xb-header-area .header-profile-menu a:hover,#xb-header-area .profile-logout:hover{background:rgba(96,6,15,.07);color:#60060f}
    #xb-header-area .header-profile-menu i{width:18px;text-align:center;color:#60060f}
    @media(max-width:767px){#xb-header-area .header-top{display:flex;align-items:center;min-height:62px}#xb-header-area .xb-info{display:none!important}#xb-header-area .header-search{margin-right:8px;padding-right:10px}#xb-header-area .header-search{font-size:0}#xb-header-area .header-cart{width:38px;height:38px}#xb-header-area .header-profile{margin-left:6px}#xb-header-area .header-profile summary{width:40px;height:40px}}
    .hero>.bg_img{min-height:640px;background-position:center center;background-size:cover;background-repeat:no-repeat}
    .hero .hero__content-wrap{position:relative;z-index:2}
    .hero .hero__content-wrap .wow{visibility:visible!important}
    .hero .bg_img:after{content:"";position:absolute;inset:0;background:rgba(23,0,6,.44);z-index:0}.hero .container{position:relative;z-index:1}
    @media(max-width:767px){.hero>.bg_img{min-height:480px}.hero__content-wrap{padding-top:35px}.hero .title{font-size:42px;line-height:1.08}.hero-btns .btns{gap:10px}.hero-btns .thm-btn{font-size:11px}}
  </style></head>`);
  html = html.replace("</body>", `<script>
    (function(){
      function showProfile(){document.querySelectorAll('.header-profile').forEach(function(el){el.hidden=false});document.querySelectorAll('.header-login').forEach(function(el){el.hidden=true})}
      function showLogin(){document.querySelectorAll('.header-profile').forEach(function(el){el.hidden=true});document.querySelectorAll('.header-login').forEach(function(el){el.hidden=false})}
      function applyAvatar(url){
        if(!url)return;showProfile();
        document.querySelectorAll('.header-profile').forEach(function(profile){
          var avatar=profile.querySelector('.profile-avatar');
          if(!avatar)return;
          avatar.addEventListener('error',function(){profile.classList.remove('has-avatar');avatar.removeAttribute('src')});
          avatar.src=url;profile.classList.add('has-avatar');
        });
      }
      function applyCartCount(count){
        document.querySelectorAll('.header-cart-count').forEach(function(badge){
          if(count>0){badge.textContent=String(count);badge.hidden=false}else{badge.hidden=true}
        });
      }
      try{applyAvatar(localStorage.getItem('gats.header.avatar'));applyCartCount(Number(localStorage.getItem('gats.header.cart')||0))}catch(e){}
      fetch('/api/user/me',{credentials:'include'}).then(function(response){if(!response.ok)throw new Error('anonymous');return response.json()}).then(function(data){
        var url=data&&data.user&&data.user.avatarUrl;
        showProfile();
        if(url){try{localStorage.setItem('gats.header.avatar',url)}catch(e){};applyAvatar(url)}
        document.querySelectorAll('.profile-logout').forEach(function(el){el.hidden=false});
        return fetch('/api/cart',{credentials:'include'});
      }).then(function(response){if(!response||!response.ok)return null;return response.json()}).then(function(data){
        if(!data)return;var cart=data.cart||(data.data&&data.data.cart);var count=cart&&Array.isArray(cart.items)?cart.items.length:0;
        try{localStorage.setItem('gats.header.cart',String(count))}catch(e){};applyCartCount(count);
      }).catch(function(){
        try{localStorage.removeItem('gats.header.avatar');localStorage.removeItem('gats.header.cart')}catch(e){}
        applyCartCount(0);showLogin();document.querySelectorAll('.profile-login').forEach(function(el){el.hidden=false});
      });
      Promise.all([
        fetch('/api/courses?status=published&page=1&limit=100').then(function(r){return r.ok?r.json():null}),
        fetch('/api/categories?type=course').then(function(r){return r.ok?r.json():null})
      ]).then(function(results){
        function mediaUrl(value){
          if(!value)return '';
          var url=String(value);
          if(url.indexOf('http://')===0||url.indexOf('https://')===0||url.indexOf('/')===0)return url;
          while(url.indexOf('/')===0)url=url.slice(1);
          return '/'+url;
        }
        var coursePayload=results[0]||{};var categoryPayload=results[1]||{};
        var courses=Array.isArray(coursePayload.data)?coursePayload.data:(Array.isArray(coursePayload.courses)?coursePayload.courses:[]);
        var categories=Array.isArray(categoryPayload.data)?categoryPayload.data:(Array.isArray(categoryPayload.categories)?categoryPayload.categories:[]);
        var counts={};courses.forEach(function(course){var category=course.category||{};var key=category.slug||category.id;if(key)counts[key]=(counts[key]||0)+1});
        document.querySelectorAll('.xb-department').forEach(function(card,index){
          var category=categories[index];if(!category){card.hidden=true;return}
          var key=category.slug||category.id;var title=card.querySelector('.xb-item--title');var count=card.querySelector(':scope>span');var link=card.querySelector('.div-link');
          if(title)title.textContent=category.name||'Danh mục';if(count)count.textContent='Khóa học: '+(counts[key]||0);if(link)link.href='/courses?category='+encodeURIComponent(category.slug||category.id);
        });
        document.querySelectorAll('.xb-program__wrapper').forEach(function(card,index){
          var course=courses[index];if(!course){var column=card.closest('.col-lg-4');if(column)column.hidden=true;else card.hidden=true;return}
          var href='/courses/'+encodeURIComponent(course.slug);var image=card.querySelector('.xb-item--img img');var title=card.querySelector('.xb-item--title a');var group=card.querySelector('.xb-item--group');var rating=card.querySelector('.xb-item--rating span');var meta=card.querySelectorAll('.xb-item--meta li');
          card.querySelectorAll('a').forEach(function(link){link.href=href});
          if(image&&course.thumbnail){image.src=mediaUrl(course.thumbnail);image.alt=course.title||''}
          if(title)title.textContent=course.title||'Khóa học';if(group)group.textContent='# '+((course.category&&course.category.name)||'Khóa học');
          var stats=course.stats||{};var ratingValue=stats.averageRating!=null?stats.averageRating:(course.averageRating!=null?course.averageRating:course.rating);
          if(rating)rating.textContent=Number(ratingValue||0).toFixed(1);
          if(meta[0]){var img0=meta[0].querySelector('img');meta[0].textContent='';if(img0)meta[0].appendChild(img0);meta[0].append(' '+Number(stats.enrollmentCount||course.enrollmentCount||0).toLocaleString('vi-VN')+' Học viên')}
          if(meta[1]){var img1=meta[1].querySelector('img');meta[1].textContent='';if(img1)meta[1].appendChild(img1);meta[1].append(' '+Number(stats.lessonCount||course.lessonCount||0).toLocaleString('vi-VN')+' Bài học')}
        });
      }).catch(function(){});
      document.addEventListener('click',function(event){
        var target=event.target instanceof Element?event.target.closest('.profile-logout'):null;if(!target)return;
        fetch('/api/user/logout',{method:'POST',credentials:'include'}).finally(function(){try{localStorage.removeItem('gats.header.avatar');localStorage.removeItem('gats.header.cart')}catch(e){};location.href='/'});
      });
    })();
  </script></body>`);
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
