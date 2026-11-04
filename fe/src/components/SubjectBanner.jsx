import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function SubjectBanner() {
  return (
    <section className="section subject-banner-section">
      <div className="container banner-grid">
        {/* Left Graphic Illustration */}
        <div className="banner-visual">
          <div className="visual-wrapper">
            <img
              src="https://masterstudy.stylemixthemes.com/marketing/wp-content/uploads/sites/49/elementor/thumbs/wonderfully-1-quys91gwo4hz0qkk2eidv9bz8y7e5mfjo71cjc4fts.png"
              alt="Master Any Subject illustration"
              className="wonderfully-img"
              loading="lazy"
            />
            <div className="accent-shape-zig-zag"></div>
          </div>
        </div>

        {/* Right Content */}
        <div className="banner-text">
          <span className="banner-eyebrow">Học Tập Tương Tác và Thực Chiến</span>
          <h2 className="banner-title">
            Làm Chủ Mọi Kỹ Năng Cùng GATS AI
          </h2>
          <p className="banner-description">
            Trải nghiệm phương pháp học tập kết hợp công nghệ AI tiên tiến, linh hoạt theo tốc độ của bạn. Hệ sinh thái bài giảng trực quan giúp nâng cao kỹ năng nhanh chóng và hiệu quả.
          </p>

          <ul className="banner-checklist">
            <li>
              <CheckCircle2 size={18} className="check-icon" />
              <span>Bài giảng video thực chiến kèm tài liệu và bộ Prompt, Skill mẫu chuẩn hóa</span>
            </li>
            <li>
              <CheckCircle2 size={18} className="check-icon" />
              <span>Thực hành dự án thực tế, kiểm chứng kết quả và nhận phản hồi từ chuyên gia</span>
            </li>
            <li>
              <CheckCircle2 size={18} className="check-icon" />
              <span>Cấp chứng nhận hoàn thành khóa học có xác thực chính thức từ GATS Academy</span>
            </li>
          </ul>

          <div className="banner-actions">
            <a href="#subjects" className="btn-primary">
              Khám phá các môn học
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .subject-banner-section {
          padding: 100px 0;
          background-color: #ffffff;
          overflow: hidden;
        }
        .banner-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 60px;
        }
        .banner-visual {
          display: flex;
          justify-content: center;
        }
        .visual-wrapper {
          position: relative;
          max-width: 480px;
          width: 100%;
        }
        .wonderfully-img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 15px 30px rgba(64, 123, 255, 0.12));
          transition: transform 0.3s ease;
        }
        .visual-wrapper:hover .wonderfully-img {
          transform: translateY(-6px);
        }
        .banner-eyebrow {
          color: var(--primary);
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: inline-block;
          margin-bottom: 12px;
        }
        .banner-title {
          font-size: 42px;
          font-weight: 800;
          color: var(--brand-dark);
          line-height: 1.2;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }
        .banner-description {
          font-size: 16px;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 28px;
        }
        .banner-checklist {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 36px;
        }
        .banner-checklist li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          font-weight: 500;
          color: var(--brand-dark);
        }
        .check-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        @media (max-width: 992px) {
          .banner-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }
          .banner-checklist {
            text-align: left;
            max-width: 460px;
            margin: 0 auto 36px auto;
          }
          .banner-title {
            font-size: 32px;
          }
        }
      `}</style>
    </section>
  );
}
