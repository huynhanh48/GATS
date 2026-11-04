import React from 'react';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        {/* Left Content */}
        <div className="hero-content">
          <div className="hero-badge">
            <span>GATS: Giỏi AI thành công sớm</span>
          </div>

          <h1 className="hero-title">
            AI Cowork <br className="br-desktop" />Kiến Tạo Tương Lai
          </h1>

          <p className="hero-lead">
            GATS là tổ chức tiên phong trong đào tạo và phổ biến kiến thức AI cùng Phân tích dữ liệu. Khám phá các khóa học thực chiến để nâng cao hiệu suất và bứt phá sự nghiệp.
          </p>

          <div className="hero-actions">
            <a href="#courses" className="btn-primary hero-btn">
              Khám phá khóa học
            </a>
            <a href="#instructor" className="btn-secondary hero-btn">
              Giảng viên
            </a>
          </div>

          <div className="hero-features-strip">
            <div className="strip-item">
              <strong>50K+</strong>
              <span>Học viên đồng hành</span>
            </div>
            <div className="strip-divider"></div>
            <div className="strip-item">
              <strong>1.200+</strong>
              <span>Khóa học và Tài nguyên</span>
            </div>
            <div className="strip-divider"></div>
            <div className="strip-item">
              <strong>4.9/5</strong>
              <span>Mức độ hài lòng</span>
            </div>
          </div>
        </div>

        {/* Right Blob Mask Image */}
        <div className="hero-visual">
          <div className="blob-wrapper">
            <div className="blob-shape">
              <img
                src="https://masterstudy.stylemixthemes.com/marketing/wp-content/uploads/sites/49/elementor/thumbs/main-1-quys8xpgpg6c2kn4pmpusmko1ltdeoznbtf4zgsjzy.jpg"
                alt="Học viên học tập cùng GATS AI Academy"
                className="hero-img"
              />
            </div>

            {/* Decorative background blobs and shapes */}
            <div className="decor-circle circle-1"></div>
            <div className="decor-circle circle-2"></div>
            <div className="floating-card course-floating">
              <div className="floating-dot"></div>
              <span>🎓 Chứng nhận đào tạo chuẩn GATS AI</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding: 80px 0 100px 0;
          background: radial-gradient(circle at 85% 30%, rgba(64, 123, 255, 0.06) 0%, transparent 60%), #ffffff;
          position: relative;
          overflow: hidden;
        }
        .hero-container {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          align-items: center;
          gap: 50px;
        }
        .hero-content {
          max-width: 580px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: var(--primary-soft);
          color: var(--primary);
          padding: 6px 14px;
          border-radius: var(--radius-pill);
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 24px;
        }
        .hero-badge-icon {
          color: var(--primary);
        }
        .hero-title {
          font-size: 60px;
          font-weight: 800;
          color: var(--brand-dark);
          line-height: 1.12;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
        }
        .hero-lead {
          font-size: 17px;
          color: var(--text-muted);
          line-height: 1.65;
          margin-bottom: 36px;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }
        .hero-actions .hero-btn {
          min-width: 200px;
          height: 52px;
          padding: 0 28px;
          font-size: 15px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          text-align: center;
          box-sizing: border-box;
          line-height: 1;
          transition: all 0.2s ease;
        }
        .hero-actions .btn-secondary.hero-btn {
          background-color: #ffffff;
          color: var(--brand-dark);
          border: 1.5px solid var(--border-light);
          box-shadow: none;
        }
        .hero-actions .btn-secondary.hero-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }
        .hero-features-strip {
          display: flex;
          align-items: center;
          gap: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border-light);
        }
        .strip-item strong {
          display: block;
          font-size: 20px;
          font-weight: 800;
          color: var(--brand-dark);
        }
        .strip-item span {
          font-size: 13px;
          color: var(--text-muted);
        }
        .strip-divider {
          width: 1px;
          height: 32px;
          background: var(--border-light);
        }
        .hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
        }
        .blob-wrapper {
          position: relative;
          width: 100%;
          max-width: 520px;
        }
        /* Custom organic blob shape mask */
        .blob-shape {
          width: 100%;
          aspect-ratio: 1.15;
          border-radius: 46% 54% 68% 32% / 48% 44% 56% 52%;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(64, 123, 255, 0.18);
          background: #e2ecff;
          position: relative;
          z-index: 2;
          transition: border-radius 0.6s ease;
        }
        .blob-shape:hover {
          border-radius: 54% 46% 38% 62% / 54% 58% 42% 46%;
        }
        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1.02);
          transition: transform 0.4s ease;
        }
        .blob-shape:hover .hero-img {
          transform: scale(1.06);
        }
        .decor-circle {
          position: absolute;
          border-radius: 50%;
          z-index: 1;
        }
        .circle-1 {
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(64, 123, 255, 0.2) 0%, transparent 70%);
          top: -30px;
          right: -40px;
        }
        .circle-2 {
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(255, 152, 0, 0.15) 0%, transparent 70%);
          bottom: -20px;
          left: -30px;
        }
        .floating-card {
          position: absolute;
          bottom: 24px;
          left: -20px;
          background: #ffffff;
          padding: 12px 20px;
          border-radius: var(--radius-pill);
          box-shadow: var(--shadow-lg);
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 13px;
          color: var(--brand-dark);
          animation: floatSlow 4s ease-in-out infinite alternate;
        }
        .floating-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
        }

        @keyframes floatSlow {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }

        @media (max-width: 992px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }
          .hero-content {
            margin: 0 auto;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-features-strip {
            justify-content: center;
          }
          .hero-title {
            font-size: 44px;
          }
          .floating-card {
            left: 50%;
            transform: translateX(-50%);
          }
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 34px;
          }
          .hero-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
