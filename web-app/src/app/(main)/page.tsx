import Link from "next/link";
import { EdubostFooter, EdubostHeader } from "@/components/edubost/EdubostShell";
import { HomeEvents } from "@/components/edubost/HomeEvents";
import { CampusCarousel } from "@/components/edubost/CampusCarousel";
import { resolveMediaUrl } from "@/lib/media/url";
import type { Course, CourseCategory } from "@/types/course";
import type { Post } from "@/types/post";
import { FanfactSlider } from "./components/sections/FanfactSlider";
import { BlogSection } from "./components/sections/BlogSection";
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
        fetch(`${origin}/api/courses?status=published&page=1&limit=100`, { next: { revalidate: 60 } }),
        fetch(`${origin}/api/categories?type=course`, { next: { revalidate: 60 } }),
        fetch(`${origin}/api/posts?status=published&page=1&limit=5`, { next: { revalidate: 60 } }),
      ]);
      if (!courseResponse.ok || !categoryResponse.ok) continue;
      const [coursePayload, categoryPayload, postPayload] = await Promise.all([courseResponse.json(), categoryResponse.json(), postResponse.ok ? postResponse.json() : null]);
      return {
        courses: selectFeaturedCourses(Array.isArray(coursePayload.data) ? coursePayload.data : []),
        categories: Array.isArray(categoryPayload.data) ? categoryPayload.data.slice(0, 8) : [],
        posts: Array.isArray(postPayload?.data) ? postPayload.data.slice(0, 5) : [],
      };
    } catch {
      // Try the next configured API origin.
    }
  }
  return { courses: [], categories: [], posts: [] };
}

/** Selects the six published courses with the strongest learner demand. */
function selectFeaturedCourses(courses: Course[]): Course[] {
  return [...courses]
    .sort((left, right) => {
      const enrollmentDifference =
        (right.stats?.enrollmentCount ?? 0) - (left.stats?.enrollmentCount ?? 0);
      if (enrollmentDifference !== 0) return enrollmentDifference;

      const ratingDifference =
        (right.stats?.ratingCount ?? 0) - (left.stats?.ratingCount ?? 0);
      if (ratingDifference !== 0) return ratingDifference;

      return left.title.localeCompare(right.title, "vi");
    })
    .slice(0, 6);
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

      <BlogSection posts={posts} />

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

      <FanfactSlider />

      <section className="program pos-rel pt-115"><div className="container">
        <div className="pro-top ul_li_between mb-40"><div className="section-title mb-20"><span className="sub-title">Hệ thống đào tạo thực chiến</span><h2 className="title">Chương Trình Nổi Bật</h2></div><div className="pro-btn mb-20"><Link className="thm-btn thm-btn--stroke-black" href="/courses">xem tất cả chương trình <span><i className="far fa-book-open" /></span></Link></div></div>
        {courses.length ? <div className="row mt-none-60">
          {courses.slice(0, 6).map((course, index) => <div className="col-lg-4 col-md-6 mt-60" key={course.id}><div className="xb-program__wrapper">
            <div className="xb-item--img text-center"><Link href={`/courses/${course.slug}`}><img src={resolveMediaUrl(course.thumbnail, asset(`program/pro-img0${(index % 6) + 1}.png`))} alt={course.title} /></Link></div>
            <div className="xb-item--holder"><div className="xb-item--deprt ul_li_between"><span className="xb-item--group"># {course.category?.name ?? "Khóa học"}</span><div className="xb-item--rating"><i className="fas fa-star" /><span>{course.stats?.averageRating?.toFixed(1) ?? "Chưa đánh giá"}</span></div></div>
              <h2 className="xb-item--title border-effect-2"><Link href={`/courses/${course.slug}`}>{course.title}</Link></h2>
              <ul className="xb-item--meta ul_li"><li><i className="far fa-users" />{(course.stats?.enrollmentCount ?? 0).toLocaleString("vi-VN")} học viên</li><li><i className="far fa-book-open" />{course.stats?.lessonCount ?? 0} bài học</li></ul>
              <div className="xb-item--dep-btn"><Link href={`/courses/${course.slug}`}>{formatPrice(course)} · xem chi tiết</Link></div>
            </div>
          </div></div>)}
        </div> : <p className={styles.empty}>Chương trình đang được cập nhật.</p>}
        <div
          className="xb-cta bg_img mt-[140px] mb-[60px] pos-rel transition-transform duration-300"
          style={{
            backgroundImage: `url(${asset("bg/pro-banner.png")})`,
            transform: "scale(1.2)",
            transformOrigin: "center",
          }}
        >
          <h2 className="mb-15">Nhận Chứng Nhận Kỹ Năng AI Thực Chiến Từ EDUGATS</h2>
          <div className="xb-btn xb-cta-btn ul_li">
            <Link className="thm-btn btn-yellow mt-20" href="/courses">
              đăng ký ngay <span><img src={asset("icon/learning.png")} alt="" /></span>
            </Link>
            <span className="mt-20">
              <img src={asset("icon/calling-icon.png")} alt="" /> 090 1876888
            </span>
          </div>
        </div>
      </div></section>

      <CampusCarousel />

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


      <HomeEvents />

      <EdubostFooter />
    </main>
  );
}
