import type { Metadata } from "next";
import { EdubostFooter, EdubostHeader } from "@/components/edubost/EdubostShell";
import { EdubostOriginalStyles } from "@/components/edubost/EdubostOriginalStyles";
import "./contact.css";

export const metadata: Metadata = {
  title: "Liên hệ | GATS Academy",
  description: "Liên hệ đội ngũ tư vấn GATS Academy.",
};

const asset = (path: string) => `/edubost-reference/img/${path}`;

export default function ContactPage() {
  return (
    <div className="body_wrap">
      <EdubostOriginalStyles />
      <EdubostHeader />
      <main>
        <section className="breadcrumb bg_img ul_li" style={{ backgroundImage: `url(${asset("bg/breadcrumb_bg.jpg")})` }}>
          <div className="container"><div className="breadcrumb__content text-center">
            <h1 className="breadcrumb__title">Liên hệ với chúng tôi</h1>
            <p className="breadcrumb__desc">Kết nối cùng đội ngũ GATS Academy</p>
          </div></div>
        </section>

        <section className="contact_section section_space" style={{ backgroundColor: "#F1F1E9" }}>
          <div className="container">
            <div className="row justify-content-lg-between mt-none-30">
              <div className="col-lg-7 mt-30">
                <form className="contact_form mb-0" action="mailto:support@gatsacademy.com" method="post" encType="text/plain">
                  <h2 className="title">Gửi tin nhắn cho GATS</h2>
                  <p className="content">Chia sẻ mục tiêu của bạn để chúng tôi tư vấn lộ trình phù hợp.</p>
                  <div className="row">
                    <div className="col-md-6"><div className="form-group">
                      <label className="input_title" htmlFor="input_name">Họ và tên</label>
                      <input id="input_name" className="form-control" type="text" name="name" placeholder="Nguyễn Văn A" required />
                    </div></div>
                    <div className="col-md-6"><div className="form-group">
                      <label className="input_title" htmlFor="input_email">Email</label>
                      <input id="input_email" className="form-control" type="email" name="email" placeholder="email@doanhnghiep.vn" required />
                    </div></div>
                    <div className="col-12"><div className="form-group">
                      <label className="input_title" htmlFor="input_phone">Số điện thoại</label>
                      <input id="input_phone" className="form-control" type="tel" name="phone" placeholder="090 1876888" />
                    </div></div>
                    <div className="col-12"><div className="form-group">
                      <label className="input_title" htmlFor="input_textarea">Nhu cầu tư vấn</label>
                      <textarea id="input_textarea" className="form-control" name="message" placeholder="Bạn muốn ứng dụng AI cho công việc nào?" required />
                    </div>
                    <button type="submit" className="thm-btn">Gửi yêu cầu <span aria-hidden="true"><i className="far fa-arrow-right" /></span></button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="col-lg-5 mt-30">
                <div className="gmap_canvas ps-lg-5">
                  <iframe title="Bản đồ GATS Academy" src="https://maps.google.com/maps?q=Ho%20Chi%20Minh%20City%2C%20Vietnam&t=&z=12&ie=UTF8&iwloc=&output=embed" loading="lazy" />
                </div>
              </div>
            </div>

            <div className="contact_info_box_inner pt-110"><h2 className="text-center">GATS Academy có thể hỗ trợ bạn</h2></div>
            <div className="contact_info_box row mt-none-30">
              {[
                ["call-calling.svg", "Tư vấn chương trình", "Thứ Hai – Thứ Sáu, 8:00 – 17:00", "090 1876888"],
                ["call-calling.svg", "Hỗ trợ học viên", "Hỗ trợ tài khoản và khóa học", "090 1876888"],
                ["sms-edit.svg", "Gửi Email", "Trao đổi cùng đội ngũ GATS", "support@gatsacademy.com"],
                ["location-add.svg", "Địa điểm", "Gặp trực tiếp theo lịch hẹn", "GATS Academy, Việt Nam"],
              ].map(([icon, title, description, value]) => (
                <div className="contact-info-column col-lg-3 col-md-6 col-sm-6 mt-30" key={title}>
                  <div className="contact_iconbox">
                    <div className="iconbox_icon"><img src={asset(`icon/${icon}`)} alt="" /></div>
                    <div className="iconbox_content"><h2 className="iconbox_title">{title}</h2><p>{description}</p><h3>{value}</h3></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <EdubostFooter />
    </div>
  );
}
