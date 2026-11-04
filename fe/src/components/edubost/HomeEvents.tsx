import Link from "next/link";
import styles from "./HomeEvents.module.css";

const asset = (path: string) => `/edubost-reference/img/${path}`;
const events = [
  ["event/event-img01.png", "Trực tuyến qua Zoom · EDUGATS", "Live Q&A Trực Tiếp Cùng Chuyên Gia GATS"],
  ["event/event-img02.png", "TP. Hồ Chí Minh · EDUGATS", "Workshop Xây Dựng AI Workflow Thực Chiến"],
  ["event/event-img03.png", "Hà Nội · EDUGATS", "Ứng Dụng AI Agent Cho Vận Hành Doanh Nghiệp"],
] as const;

function Location({ children }: { children: React.ReactNode }) {
  return <span className={styles.location}><i className="far fa-map-marker-alt" aria-hidden="true" />{children}</span>;
}

export function HomeEvents() {
  return <section className={styles.section}>
    <div className={styles.container}>
      <div className={styles.heading}><span className="sub-title">Hoạt Động EDUGATS</span><h2 className="title">Sự Kiện Sắp Diễn Ra</h2></div>
      <div className={styles.layout}>
        <div className={styles.list}>{events.map(([image, location, title]) => <article className={styles.card} key={title}>
          <div className={styles.cardImage}><img src={asset(image)} alt={title} /></div>
          <div className={styles.cardContent}><Location>{location}</Location><h3 className={styles.cardTitle}><Link href="/contact">{title}</Link></h3></div>
        </article>)}</div>
        <article className={styles.featured}>
          <div className={styles.featuredImage}><img src={asset("event/event-img04.png")} alt="Workshop EDUGATS" /></div>
          <div className={styles.featuredBody}>
            <div className={styles.featuredContent}><Location>Workshop dành cho doanh nghiệp</Location><h3 className={styles.featuredTitle}><Link href="/contact">Xây dựng lộ trình ứng dụng AI và đo lường ROI thực tế</Link></h3><Link className={styles.button} href="/contact">Đăng ký tham gia <i className="far fa-arrow-right" /></Link></div>
            <div className={styles.date}><span className={styles.dateIcon}><img src={asset("icon/note-book.svg")} alt="" /></span><strong>24, Tháng 12<br />2026</strong></div>
          </div>
        </article>
      </div>
      <div className={styles.more}><Link className="more-btn" href="/contact">xem thêm sự kiện <span><i className="far fa-arrow-right" /></span></Link></div>
    </div>
    <div className={styles.decoration} aria-hidden="true"><img src={asset("event/event-img05.png")} alt="" /></div>
  </section>;
}
