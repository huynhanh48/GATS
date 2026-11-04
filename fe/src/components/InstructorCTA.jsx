import React from 'react';
import { Brain, Zap, Users } from 'lucide-react';

export default function InstructorCTA() {
  return (
    <section className="section instructor-section" id="instructor">
      <div className="container instructor-grid">
        {/* Left Content */}
        <div className="instructor-content">
          <span className="instructor-eyebrow">LAN TỎA TRI THỨC AI</span>
          <h2 className="instructor-title">GATS AI Expert</h2>
          <p className="instructor-subtitle">
            Chia sẻ kiến thức AI thực chiến, đào tạo thế hệ công dân số và cùng xây dựng cộng đồng AI phát triển bền vững.
          </p>

          <div className="perks-grid">
            <div className="perk-card">
              <div className="perk-icon-wrap">
                <Brain size={20} />
              </div>
              <div>
                <strong>Học đúng – Hiểu sâu</strong>
                <p>Nắm vững tư duy AI, hiểu bản chất công nghệ thay vì chỉ dùng công cụ.</p>
              </div>
            </div>

            <div className="perk-card">
              <div className="perk-icon-wrap">
                <Zap size={20} />
              </div>
              <div>
                <strong>Ứng dụng thực tế</strong>
                <p>Được hướng dẫn cách áp dụng AI vào công việc, tối ưu thời gian và nâng cao hiệu quả.</p>
              </div>
            </div>

            <div className="perk-card">
              <div className="perk-icon-wrap">
                <Users size={20} />
              </div>
              <div>
                <strong>Đồng hành phát triển</strong>
                <p>Nhận sự hỗ trợ từ chuyên gia và cộng đồng AI trong quá trình học tập.</p>
              </div>
            </div>
          </div>

          <div className="instructor-actions">
            <a href="#instructor" className="btn-primary start-teaching-btn">
              Đăng ký ngay
            </a>
          </div>
        </div>

        {/* Right Layered Visual with Real Instructors Graphic */}
        <div className="instructor-visual">
          <div className="visual-container">
            <img
              src="https://masterstudy.stylemixthemes.com/marketing/wp-content/uploads/sites/49/elementor/thumbs/instructors-quys94ab4u50g4zkhnnlvvcf28oeet8cm5w3ucm2pc.png"
              alt="Cộng đồng Giảng viên và Chuyên gia GATS AI"
              className="instructors-img"
              loading="lazy"
            />

            {/* Geometric accents matching live demo */}
            <div className="accent-plus plus-top">+</div>
            <div className="accent-plus plus-bottom">+</div>
          </div>
        </div>
      </div>

      <style>{`
        .instructor-section {
          background-color: var(--bg-soft);
          padding: 100px 0;
          position: relative;
        }
        .instructor-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          align-items: center;
          gap: 60px;
        }
        .instructor-eyebrow {
          color: var(--primary);
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: inline-block;
          margin-bottom: 12px;
        }
        .instructor-title {
          font-size: 44px;
          font-weight: 800;
          color: var(--brand-dark);
          line-height: 1.18;
          margin-bottom: 16px;
        }
        .instructor-subtitle {
          font-size: 18px;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 36px;
        }
        .perks-grid {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 40px;
        }
        .perk-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #ffffff;
          padding: 14px 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
        }
        .perk-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background-color: var(--primary-soft);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .perk-card strong {
          display: block;
          font-size: 15px;
          color: var(--brand-dark);
        }
        .perk-card p {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .start-teaching-btn {
          padding: 15px 34px;
          font-size: 16px;
        }
        .instructor-visual {
          display: flex;
          justify-content: center;
          position: relative;
        }
        .visual-container {
          position: relative;
          width: 100%;
          max-width: 540px;
        }
        .instructors-img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 20px 40px rgba(39, 48, 68, 0.12));
          transition: transform 0.4s ease;
        }
        .visual-container:hover .instructors-img {
          transform: scale(1.02);
        }
        .accent-plus {
          position: absolute;
          font-size: 36px;
          font-weight: 300;
          color: #ff9800;
          user-select: none;
        }
        .plus-top {
          top: -20px;
          left: 10%;
        }
        .plus-bottom {
          bottom: 10%;
          right: -10px;
          color: var(--primary);
        }

        @media (max-width: 992px) {
          .instructor-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 50px;
          }
          .perks-grid {
            text-align: left;
            max-width: 500px;
            margin: 0 auto 36px auto;
          }
          .instructor-title {
            font-size: 34px;
          }
          .instructor-actions {
            display: flex;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
