import Link from "next/link";
import { EdubostFooter, EdubostHeader } from "@/components/edubost/EdubostShell";
import { resolveMediaUrl } from "@/lib/media/url";
import type { Course, CourseCategory } from "@/types/course";
import type { Post } from "@/types/post";
import styles from "./home.module.css";

export const revalidate = 60;

const asset = (path: string) => `/edubost-reference/img/${path}`;

function apiOrigins() {
  return Array.from(new Set([
    process.env.INTERNAL_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.API_REWRITE_ORIGIN,
    "http://be:3000",
    "https://api.gats.vn",
    "http://127.0.0.1:3000",
  ].filter(Boolean).map((value) => String(value).replace(/\/$/, ""))));
}

async function loadHomeData(): Promise<{ courses: Course[]; categories: CourseCategory[]; posts: Post[] }> {
  for (const origin of apiOrigins()) {
    try {
      const [courseResponse, categoryResponse, postResponse] = await Promise.all([
        fetch(`${origin}/api/courses?status=published&page=1&limit=6`, { next: { revalidate: 60 } }),
        fetch(`${origin}/api/categories?type=course`, { next: { revalidate: 60 } }),
        fetch(`${origin}/api/posts?status=published&page=1&limit=5`, { next: { revalidate: 60 } }),
      ]);
      if (!courseResponse.ok || !categoryResponse.ok) continue;
      const [coursePayload, categoryPayload, postPayload] = await Promise.all([courseResponse.json(), categoryResponse.json(), postResponse.ok ? postResponse.json() : null]);
      return {
        courses: Array.isArray(coursePayload.data) ? coursePayload.data.slice(0, 6) : [],
        categories: Array.isArray(categoryPayload.data) ? categoryPayload.data.slice(0, 8) : [],
        posts: Array.isArray(postPayload?.data) ? postPayload.data.slice(0, 5) : [],
      };
    } catch {
      // Try the next configured API origin.
    }
  }
  return { courses: [], categories: [], posts: [] };
}

function formatPrice(course: Course) {
  const value = course.salePrice != null && course.salePrice < course.price ? course.salePrice : course.price;
  return value <= 0 ? "Miễn phí" : `${value.toLocaleString("vi-VN")}đ`;
}

const departmentIcons = ["ci_01.svg", "ci_02.svg", "ci_03.svg", "ci_04.svg", "ci_05.svg", "ci_06.svg", "ci_07.svg", "ci_08.svg"];

export default async function HomePage() {
  const { courses, categories, posts } = await loadHomeData();

  return (
    <main className={`body_wrap ${styles.home}`}>
      <EdubostHeader />

      <section className="hero o-hidden pos-rel">
        <div className="bg_img" style={{ backgroundImage: `url(${asset("bg/hero_bg.jpg")})` }}>
          <div className="container"><div className="hero__content-wrap text-center pt-55">
            <div className="section-title clr-white">
              <span className="sub-title">Nền Tảng Đào Tạo AI Thực Chiến</span>
              <h1 className="title">EDUGATS — Con Đường <br /> Làm Chủ AI &amp; Workflow</h1>
            </div>
            <div className="xb-hero-img"><img src={asset("hero/hero_img01.png")} alt="Học viên EDUGATS" /></div>
          </div></div>
        </div>
      </section>

      <div className="hero-btns"><div className="btns ul_li_center">
        <Link className="thm-btn thm-btn--stroke-white sec-btn" href="/courses">khám phá chương trình <span><i className="far fa-book-open" /></span></Link>
        <Link className="thm-btn thm-btn--stroke-white sec-btn" href="/courses">đăng ký ngay <span><i className="far fa-graduation-cap" /></span></Link>
        <Link className="thm-btn thm-btn--stroke-white sec-btn" href="/contact">tư vấn cùng chuyên gia <span><i className="far fa-comments" /></span></Link>
      </div></div>

      {posts.length > 0 ? <section className="blog pt-115 pb-120 bg_img" style={{ backgroundImage: `url(${asset("bg/news_bg01.jpg")})` }}><div className="container">
        <div className="blog-sec-top ul_li_between"><div className="section-title mb-40"><span className="sub-title">Tin Tức &amp; Tri Thức AI</span><h2 className="title">Cập Nhật Công Nghệ AI</h2></div><div className="xb-topic"><Link className="thm-btn thm-btn--stroke-black" href="/posts">Tất cả bài viết</Link></div></div>
        <div className="row justify-content-center">
          <div className="col-lg-3 col-md-8"><div className="xb-blog__left">
            {posts.slice(0, 2).map((post, index) => <article className="xb-blog pos-rel mt-20" key={post.id}><div className="xb-item--img"><Link href={`/posts/${post.slug}`}><img src={resolveMediaUrl(post.thumbnail, asset(index === 0 ? "news/news-img01.jpg" : "news/news-img02.png"))} alt={post.title} /></Link></div><div className="xb-item--holder"><span className="xb-item--cta"># {post.category?.name ?? "AI"}</span><h2 className="xb-item--title border-effect-2"><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2></div></article>)}
          </div></div>
          {posts[2] ? <div className="col-lg-6 col-md-8"><article className="xb-blog chn-margin pos-rel mt-20"><div className="xb-item--img"><Link href={`/posts/${posts[2].slug}`}><img src={resolveMediaUrl(posts[2].thumbnail, asset("news/news-img03.png"))} alt={posts[2].title} /></Link></div><div className="xb-item--holder"><span className="xb-item--cta"># {posts[2].category?.name ?? "Tri thức AI"}</span><h2 className="xb-item--title border-effect"><Link href={`/posts/${posts[2].slug}`}>{posts[2].title}</Link></h2><div className="xb-item--meta ul_li"><span><i className="far fa-user" /> {posts[2].author?.userName ?? "EDUGATS"}</span><span><i className="far fa-clock" /> {new Date(posts[2].publishedAt ?? posts[2].createdAt).toLocaleDateString("vi-VN")}</span><span><i className="far fa-comment" /> {posts[2].commentCount ?? 0}</span></div></div></article></div> : null}
          <div className="col-lg-3 col-md-8"><div className="xb-blog__right">
            {posts.slice(3, 5).map((post, index) => <article className="xb-blog mr-left pos-rel mt-20" key={post.id}><div className="xb-item--img"><Link href={`/posts/${post.slug}`}><img src={resolveMediaUrl(post.thumbnail, asset(`news/news-img0${index + 3}.png`))} alt={post.title} /></Link></div><div className="xb-item--holder"><span className="xb-item--cta"># {post.category?.name ?? "AI"}</span><h2 className="xb-item--title border-effect-2"><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2></div></article>)}
          </div></div>
        </div>
        <div className="xb-btn text-center pt-60"><Link className="thm-btn" href="/posts">xem tất cả bài viết <span className="icon"><i className="far fa-arrow-right" /></span></Link></div>
      </div></section> : null}

      <section className="department pt-115 pb-200 pos-rel">
        <div className="container">
          <div className="section-title text-center mb-25"><span className="sub-title">Hệ thống đào tạo thực chiến</span><h2 className="title">Chuyên Ngành Nổi Bật</h2></div>
          <div className="dep-inner pb-200 pos-rel"><div className="row g-0">
            {Array.from({ length: Math.ceil(categories.length / 2) }, (_, columnIndex) => (
              <div className="col-lg-3 col-md-6 mt-30 mb-30 dp-col" key={columnIndex}><div className="xb-dep-wrapper">
                {categories.slice(columnIndex * 2, columnIndex * 2 + 2).map((category, itemIndex) => (
                  <div className="xb-department text-center pos-rel" key={category.id}>
                    <div className="xb-item--icon"><img src={asset(`icon/${departmentIcons[columnIndex * 2 + itemIndex]}`)} alt="" /></div>
                    <h3 className="xb-item--title">{category.name}</h3><span>Khóa học: {category.courseCount ?? 0}</span>
                    <Link className="div-link" href={`/courses?category=${encodeURIComponent(category.slug)}`} aria-label={category.name} />
                  </div>
                ))}
              </div></div>
            ))}
          </div></div>
        </div>
      </section>

      <section className="fanfact pos-rel"><div className="container"><div className="fanfact-wrapper">
        <div className={`${styles.staticSwiper} fanfact-slider swiper-container`}><div className="swiper-wrapper"><div className="swiper-slide swiper-slide-active">
          <div className="xb-fanfact__wrapper pos-rel">
            <div className="xb-item--img"><img src={asset("feature/feature-img01.png")} alt="Đào tạo EDUGATS" /></div>
            <h2 className="xb-item--title">đào tạo thực chiến tạo nên <br /> kết quả khác biệt</h2>
            <div className="xb-item--holder"><h3 className="xb-item--number">15+</h3><h2 className="xb-item--text">Năm Kinh Nghiệm Cố Vấn</h2><p className="xb-item--content">Chương trình được xây dựng từ bài toán vận hành thực tế của cá nhân và doanh nghiệp, giúp học viên ứng dụng AI vào công việc thay vì chỉ dừng ở lý thuyết.</p></div>
          </div>
        </div></div></div>
      </div></div></section>

      <section className="program pos-rel pt-115"><div className="container">
        <div className="pro-top ul_li_between mb-40"><div className="section-title mb-20"><span className="sub-title">Hệ thống đào tạo thực chiến</span><h2 className="title">Chương Trình Nổi Bật</h2></div><div className="pro-btn mb-20"><Link className="thm-btn thm-btn--stroke-black" href="/courses">xem tất cả chương trình <span><i className="far fa-book-open" /></span></Link></div></div>
        {courses.length ? <div className="row mt-none-60">
          {courses.map((course, index) => <div className="col-lg-4 col-md-6 mt-60" key={course.id}><div className="xb-program__wrapper">
            <div className="xb-item--img text-center"><Link href={`/courses/${course.slug}`}><img src={resolveMediaUrl(course.thumbnail, asset(`program/pro-img0${(index % 6) + 1}.png`))} alt={course.title} /></Link></div>
            <div className="xb-item--holder"><div className="xb-item--deprt ul_li_between"><span className="xb-item--group"># {course.category?.name ?? "Khóa học"}</span><div className="xb-item--rating"><i className="fas fa-star" /><span>{course.stats?.averageRating?.toFixed(1) ?? "Chưa đánh giá"}</span></div></div>
              <h2 className="xb-item--title border-effect-2"><Link href={`/courses/${course.slug}`}>{course.title}</Link></h2>
              <ul className="xb-item--meta ul_li"><li><i className="far fa-users" />{(course.stats?.enrollmentCount ?? 0).toLocaleString("vi-VN")} học viên</li><li><i className="far fa-book-open" />{course.stats?.lessonCount ?? 0} bài học</li></ul>
              <div className="xb-item--dep-btn"><Link href={`/courses/${course.slug}`}>{formatPrice(course)} · xem chi tiết</Link></div>
            </div>
          </div></div>)}
        </div> : <p className={styles.empty}>Chương trình đang được cập nhật.</p>}
        <div className="xb-cta bg_img mt-120 pos-rel" style={{ backgroundImage: `url(${asset("bg/pro-banner.png")})` }}><h2 className="mb-15">Nhận Chứng Nhận Kỹ Năng AI Thực Chiến Từ EDUGATS</h2><div className="xb-btn xb-cta-btn ul_li"><Link className="thm-btn btn-yellow mt-20" href="/courses">đăng ký ngay <span><img src={asset("icon/learning.png")} alt="" /></span></Link><span className="mt-20"><img src={asset("icon/calling-icon.png")} alt="" /> (+84) 888 888 888</span></div></div>
      </div></section>

      <section className="campus pos-rel bg_img z-1 pt-195 pb-200" style={{ backgroundImage: `url(${asset("bg/campus-bg.jpg")})` }}>
        <div className="section-title mb-60 mt-80 text-center"><span className="sub-title">Trải Nghiệm Học Tập</span><h2 className="title">Học Để Làm Được Việc</h2></div>
        <div className={`${styles.campusStatic} campus-slider mr-set`}><div className="swiper-wrapper">
          {[
            ["campus/campus-img01.png", "Workshop Thực Chiến", "Thực hành trực tiếp trên bài toán thật cùng chuyên gia."],
            ["campus/campus-img02.png", "Cộng Đồng Đồng Hành", "Kết nối học viên, giảng viên và doanh nghiệp trong suốt lộ trình."],
            ["campus/campus-img03.png", "Chứng Nhận EDUGATS", "Ghi nhận năng lực hoàn thành chương trình đào tạo ứng dụng."],
          ].map(([image, title, description]) => <div className="swiper-slide swiper-slide-active" key={title}><div className="xb-campus__wrapper pos-rel"><div className="xb-item--img pos-rel"><img src={asset(image)} alt={title} /></div><div className="xb-item--holder"><h3 className="xb-item--title">{title}</h3><p className={styles.campusDescription}>{description}</p><div className="xb-btn_thm ul_li"><Link className="thm-btn btn-yellow" href="/courses">tìm hiểu thêm <span><i className="far fa-arrow-up-right" /></span></Link></div></div></div></div>)}
        </div></div>
      </section>

      <section className="testimonial pt-120 pb-120 pos-rel"><div className="container"><div className="row align-items-center mt-none-30">
        <div className="col-lg-6 mt-30"><div className="xb-testimonial-left pos-rel"><div className="tes-img"><img src={asset("testimonial/tes-img.png")} alt="Học viên EDUGATS" /></div><div className={styles.testimonialThumbs}><img src={asset("testimonial/tes-img02.png")} alt="" /><img src={asset("testimonial/tes-img03.png")} alt="" /></div></div></div>
        <div className="col-lg-6 mt-30">
          <div className="xb-testimonial-right">
            <div className="section-title mb-70"><span className="sub-title">Cảm Nhận Học Viên</span><h2 className="title">Kết Quả Thực Tế Từ Học Viên</h2></div>
            <div className={`${styles.staticSwiper} testimonial-slider swiper-container`}><div className="swiper-wrapper"><div className="swiper-slide swiper-slide-active">
              <div className="xb-item--holder"><div className="xb-item--quote mb-35"><img src={asset("icon/qua.png")} alt="" /></div><p className="xb-item--content">“Chương trình EDUGATS giúp tôi biến kiến thức AI thành quy trình làm việc cụ thể. Bài học sát thực tế, giảng viên hỗ trợ rõ ràng và có thể áp dụng ngay vào công việc.”</p></div>
              <div className="xb-item--author mt-60"><span className="xb-item--name">Nguyễn Minh Quân</span><span className="xb-item--desig">Học viên chương trình AI Workflow</span></div>
            </div></div></div>
          </div>
        </div>
      </div></div></section>

      <section className={`${styles.eventSection} event event-bg-clr pos-rel pt-115`}><div className={`${styles.eventContent} container`}><div className="section-title text-center mb-40"><span className="sub-title">Hoạt Động EDUGATS</span><h2 className="title">Sự Kiện Sắp Diễn Ra</h2></div><div className="row justify-content-center">
        <div className="col-xl-6 col-lg-8">
          {[
            ["event/event-img01.png", "Trực tuyến qua Zoom · EDUGATS", "Live Q&A Trực Tiếp Cùng Chuyên Gia GATS"],
            ["event/event-img02.png", "TP. Hồ Chí Minh · EDUGATS", "Workshop Xây Dựng AI Workflow Thực Chiến"],
            ["event/event-img03.png", "Hà Nội · EDUGATS", "Ứng Dụng AI Agent Cho Vận Hành Doanh Nghiệp"],
          ].map(([image, location, title]) => <div className="xb-event-wrapper mt-20" key={title}><div className={`${styles.eventRow} xb-event-left`}><div className={styles.eventRowImage}><img src={asset(image)} alt={title} /></div><div className="xb-item--author"><span className="xb-item--location"><i className="far fa-map-marker-alt" /> {location}</span><h2 className="xb-item--title border-effect"><Link href="/contact">{title}</Link></h2></div></div></div>)}
        </div>
        <div className="col-xl-6 col-lg-8"><div className={`${styles.featuredEvent} xb-event-item mt-20`}><div className="xb-item--img"><img src={asset("event/event-img04.png")} alt="Workshop EDUGATS" /></div><div className={`${styles.featuredEventBody} xb-item--wrap`}><div className="xb-item--content"><span className="xb-item--location"><i className="far fa-map-marker-alt" /> Workshop dành cho doanh nghiệp</span><h2 className="xb-item--title border-effect"><Link href="/contact">Xây dựng lộ trình ứng dụng AI và đo lường ROI thực tế</Link></h2><div className="xb-event-btn pt-15"><Link className="thm-btn" href="/contact">đăng ký tham gia <span className="icon"><i className="far fa-arrow-right" /></span></Link></div></div><div className="xb-item--date-inner text-center"><div className="xb-item--icon"><img src={asset("icon/note-book.svg")} alt="" /></div><span className="xb-item--date">24, Tháng 12<br />2026</span></div></div></div></div>
        <div className="event-btns pos-rel z-1 text-center mt-40"><Link className="more-btn" href="/contact">xem thêm sự kiện <span><i className="far fa-arrow-right" /></span></Link></div>
      </div></div><div className={`${styles.eventDecoration} xb-event-bottom`} aria-hidden="true"><img src={asset("event/event-img05.png")} alt="" /></div></section>

      <EdubostFooter />
    </main>
  );
}
