import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container footer-container">
        {/* Col 1: Brand & About */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-logo" aria-label="GATS AI Home">
            <img
              src="/icons/logo.svg"
              alt="GATS AI Logo"
              className="footer-logo-icon"
            />
            <span className="logo-text">GATS <span className="logo-accent">AI</span></span>
          </Link>
          <p className="footer-desc">
            CÔNG TY CỔ PHẦN GIẢI PHÁP CÔNG NGHỆ THÍCH ỨNG TOÀN CẦU.
          </p>

          <div className="footer-socials">
            <a href="#" className="social-icon" aria-label="Facebook">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="#" className="social-icon" aria-label="LinkedIn">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
            </a>
            <a href="#" className="social-icon" aria-label="YouTube">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            </a>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Liên kết nhanh</h4>
          <ul className="footer-links">
            <li><a href="#courses">Tất cả khóa học</a></li>
            <li><a href="#why-choose-us">Giá trị cốt lõi</a></li>
            <li><a href="#instructor">Hợp tác giảng dạy</a></li>
            <li><a href="#testimonials">Đánh giá học viên</a></li>
            <li><a href="#faq">Câu hỏi thường gặp và Hỗ trợ</a></li>
          </ul>
        </div>

        {/* Col 3: Categories */}
        <div className="footer-col">
          <h4 className="footer-heading">Chủ đề đào tạo</h4>
          <ul className="footer-links">
            <li><a href="#courses">Trí tuệ nhân tạo và Tự động hóa</a></li>
            <li><a href="#courses">Lập trình và Phát triển Web</a></li>
            <li><a href="#courses">Thiết kế Đồ họa và UI/UX</a></li>
            <li><a href="#courses">Digital Marketing và Tăng trưởng</a></li>
            <li><a href="#courses">Kinh doanh và Khởi nghiệp số</a></li>
            <li><a href="#courses">Phân tích Dữ liệu Thực chiến</a></li>
          </ul>
        </div>

        {/* Col 4: Platform Features */}
        <div className="footer-col">
          <h4 className="footer-heading">Hệ sinh thái GATS AI</h4>
          <ul className="footer-links">
            <li><a href="#">Lộ trình học tập cá nhân hóa với AI</a></li>
            <li><a href="#">Cấp chứng chỉ hoàn thành khóa học</a></li>
            <li><a href="#">Lớp học trực tuyến tương tác cao</a></li>
            <li><a href="#">Kho tài liệu và Prompt mẫu chuẩn SEO</a></li>
            <li><a href="#">Hỗ trợ giải đáp 1 kèm 1 cùng chuyên gia</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container bottom-inner">
          <p className="copyright-text">
            © Bản quyền thuộc về <a href="https://gats.vn" target="_blank" rel="noopener noreferrer">GATS AI Academy</a> 2026. Bảo lưu mọi quyền.
          </p>

          <button onClick={scrollToTop} className="back-to-top-btn" aria-label="Cuộn lên đầu trang">
            <span>Lên đầu trang</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>

      <style>{`
        .site-footer {
          background-color: #1a2233;
          color: #ffffff;
          padding-top: 80px;
          border-top: 1px solid #28354d;
        }
        .footer-container {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
          gap: 50px;
          padding-bottom: 60px;
        }
        .footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          margin-bottom: 18px;
        }
        .footer-logo-icon {
          height: 38px;
          width: 38px;
          object-fit: contain;
          display: block;
        }
        .footer-logo .logo-text {
          font-family: var(--font-heading);
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
        }
        .footer-logo .logo-accent {
          color: var(--primary);
        }
        .footer-desc {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.7;
          margin-bottom: 24px;
          max-width: 320px;
        }
        .footer-socials {
          display: flex;
          gap: 10px;
        }
        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .social-icon:hover {
          background: var(--primary);
          color: #ffffff;
          transform: translateY(-2px);
        }
        .footer-heading {
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 20px;
          letter-spacing: -0.01em;
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-links a {
          font-size: 14px;
          color: #94a3b8;
          transition: color 0.2s, padding-left 0.2s;
        }
        .footer-links a:hover {
          color: #ffffff;
          padding-left: 4px;
        }
        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 24px 0;
          background: #151c2a;
        }
        .bottom-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .copyright-text {
          font-size: 13px;
          color: #94a3b8;
        }
        .copyright-text a {
          color: var(--primary);
          font-weight: 600;
        }
        .back-to-top-btn {
          background: transparent;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
        }
        .back-to-top-btn:hover {
          color: #ffffff;
        }

        @media (max-width: 992px) {
          .footer-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
          }
        }
        @media (max-width: 580px) {
          .footer-container {
            grid-template-columns: 1fr;
          }
          .bottom-inner {
            flex-direction: column;
            gap: 14px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
