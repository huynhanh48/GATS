import Link from "next/link";
import { EdubostFooter, EdubostHeader } from "@/components/edubost/EdubostShell";
import { EdubostOriginalStyles } from "@/components/edubost/EdubostOriginalStyles";

const asset = (path: string) => `/edubost-reference/img/${path}`;

const missionItems = [
  "Kết nối tri thức với bài toán thực tế của doanh nghiệp.",
  "Nghiên cứu và ứng dụng những công nghệ AI mới nhất.",
  "Khuyến khích tinh thần học tập và thích nghi liên tục.",
  "Xây dựng lộ trình đào tạo có thử thách và đo lường được.",
  "Phát triển tư duy phản biện và năng lực lãnh đạo.",
  "Tạo môi trường học tập cởi mở, bình đẳng và thực tiễn.",
];

const visionItems = [
  "Dẫn đầu trong đào tạo và ứng dụng AI thực chiến.",
  "Liên tục đổi mới phương pháp giảng dạy.",
  "Đề cao phát triển bền vững và an toàn dữ liệu.",
  "Chuẩn bị năng lực làm việc trong môi trường toàn cầu.",
  "Xây dựng mạng lưới hợp tác vững mạnh.",
  "Trang bị kỹ năng cho một thế giới luôn thay đổi.",
];

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="xb-item--list list-unstyled">
      {items.map((item) => (
        <li key={item}>
          <span><img src={asset("icon/check.svg")} alt="" /></span>{item}
        </li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  return (
    <div className="body_wrap">
      <EdubostOriginalStyles />
      <EdubostHeader />
      <main>
        <section
          className="breadcrumb bg_img ul_li"
          style={{ backgroundImage: `url(${asset("bg/breadcrumb_bg.jpg")})` }}
        >
          <div className="container">
            <div className="breadcrumb__content text-center">
              <h1 className="breadcrumb__title">Về GATS Academy</h1>
              <p className="breadcrumb__desc">Đào tạo AI thực chiến vì năng lực phát triển bền vững</p>
            </div>
          </div>
        </section>

        <section className="about pt-80 pb-120">
          <div className="container">
            <div className="about-info-inner ul_li_between mt-none-30">
              <div className="about-info mt-30">
                <h3>ĐỊNH HƯỚNG</h3>
                <p>Đào tạo ứng dụng AI và Enterprise Workflow<br />cho cá nhân và doanh nghiệp Việt Nam.</p>
              </div>
              <div className="about-info mt-30">
                <h3>KINH NGHIỆM</h3>
                <p>Hơn 10 năm đồng hành<br />cùng hoạt động đào tạo và cố vấn.</p>
              </div>
              <div className="about-info mt-30">
                <h3>HỆ SINH THÁI</h3>
                <p>Chương trình trực tuyến, workshop chuyên sâu và lộ trình<br />triển khai riêng cho từng đội ngũ doanh nghiệp.</p>
              </div>
            </div>
            <div className="about-content mt-60">
              GATS Academy biến công nghệ phức tạp thành năng lực có thể áp dụng ngay. Chúng tôi chuyển giao kiến thức, prompt chuẩn hóa và workflow tự động, giúp học viên nâng cao hiệu suất, kiểm soát dữ liệu và tạo ra kết quả có thể đo lường trong công việc thực tế.
            </div>
            <div className="xb-video pos-rel mt-115">
              <img src={asset("bg/video_img.jpg")} alt="Hoạt động đào tạo tại GATS Academy" />
              <Link className="btn-video btn-video-center" href="/courses" aria-label="Khám phá các khóa học">
                <i className="fas fa-play" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mission-vission z-1 pos-rel pt-110">
          <div className="mission-vission-bg" style={{ backgroundImage: `url(${asset("bg/vm_bg.jpg")})` }} />
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="section-title text-center mb-65">
                  <h2 className="title mb-15">Sứ mệnh và tầm nhìn</h2>
                  <p>GATS Academy xây dựng năng lực ứng dụng AI có trách nhiệm, giúp mỗi cá nhân và tổ chức chủ động đổi mới, vận hành hiệu quả và tạo ra giá trị bền vững.</p>
                </div>
              </div>
            </div>
            <div className="row mt-none-30">
              {[
                ["Sứ mệnh của chúng tôi", "Trao quyền cho học viên qua chương trình đào tạo chuyển đổi, thúc đẩy tư duy đổi mới và khả năng tạo tác động thực tế.", missionItems],
                ["Tầm nhìn của chúng tôi", "Trở thành nền tảng đào tạo AI thực chiến hàng đầu, chuẩn bị cho học viên thành công trong một môi trường công nghệ liên tục biến đổi.", visionItems],
              ].map(([title, content, items]) => (
                <div className="col-lg-6 mt-30" key={title as string}>
                  <div className="mission-vission-item">
                    <h3 className="xb-item--title">{title as string}</h3>
                    <p className="xb-item--content">{content as string}</p>
                    <h4 className="xb-item--subtitle">Cùng GATS Academy, bạn có thể:</h4>
                    <Checklist items={items as string[]} />
                    <div className="xb-item--shape" aria-hidden="true">
                      <div className="shape shape--1"><img src={asset("shape/vm_shape1.png")} alt="" /></div>
                      <div className="shape shape--2"><img src={asset("shape/vm_shape2.png")} alt="" /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="fanfact pt-120 pb-120">
          <div className="container">
            <div className="section-title text-center mb-60">
              <span className="sub-title">Khám phá GATS</span>
              <h2 className="title">GATS Academy qua những con số</h2>
            </div>
            <div className="row mt-none-30">
              <div className="col-lg-4 mt-30"><div className="clg-fanfact"><div className="xb-fanfact_item clr-gray"><span className="xb-item--number">10+</span><span className="xb-item--contant">Năm kinh nghiệm<br />đào tạo và cố vấn</span></div><div className="xb-fanfact_wrap mt-30"><div className="fanfact-img"><img src={asset("fanfact/fanfact-img01.png")} alt="" /></div><div className="xb-fanfact_item"><span className="xb-item--number">91%</span><span className="xb-item--contant">Học viên hoàn thành các bài thực hành trong lộ trình</span></div></div></div></div>
              <div className="col-lg-4 mt-30"><div className="clg-fanfact"><div className="xb-fanfact_wrap clr-primary mb-30"><div className="fanfact-img"><img src={asset("fanfact/fanfact-img02.png")} alt="" /></div><div className="xb-fanfact_item"><span className="xb-item--number">90%</span><span className="xb-item--contant">Nội dung tập trung vào tình huống và dự án thực tế</span></div></div><div className="xb-fanfact_item clr-heading"><span className="xb-item--number">24/7</span><span className="xb-item--contant">Truy cập nội dung học tập trên mọi thiết bị</span></div></div></div>
              <div className="col-lg-4 mt-30"><div className="clg-fanfact"><div className="xb-fanfact_item clr-violate"><span className="xb-item--number">AI + Workflow</span><span className="xb-item--contant">Học công cụ song song với quy trình triển khai</span></div><div className="xb-fanfact_wrap clr-gray mt-30"><div className="fanfact-img"><img src={asset("fanfact/fanfact-img03.png")} alt="" /></div><div className="xb-fanfact_item"><span className="xb-item--number">100%</span><span className="xb-item--contant">Lộ trình hướng đến khả năng áp dụng vào công việc</span></div></div></div></div>
            </div>
          </div>
        </section>
      </main>
      <EdubostFooter />
    </div>
  );
}
