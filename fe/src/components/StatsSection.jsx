import React, { useState, useEffect } from 'react';

const statsData = [
  {
    target: 50000,
    prefix: "",
    suffix: "+",
    description: "Học viên đã hoàn thành khóa học và làm chủ công cụ AI trong công việc thực tế."
  },
  {
    target: 1200,
    prefix: "",
    suffix: "+",
    description: "Bài giảng và tài nguyên thực chiến cập nhật liên tục các mô hình AI mới nhất."
  },
  {
    target: 5,
    isFloat: true,
    prefix: "",
    suffix: ".0",
    description: "Đánh giá tích cực từ học viên và đối tác doanh nghiệp đồng hành cùng GATS."
  },
  {
    target: 350,
    prefix: "",
    suffix: "+",
    description: "Giảng viên và chuyên gia công nghệ dày dạn kinh nghiệm thực chiến."
  }
];

export default function StatsSection() {
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounts([
        Math.floor(statsData[0].target * progress),
        Math.floor(statsData[1].target * progress),
        5,
        Math.floor(statsData[3].target * progress)
      ]);

      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="stats-section">
      <div className="stats-overlay"></div>

      <div className="container stats-container">
        <h2 className="stats-main-heading">GATS AI</h2>

        <div className="stats-grid">
          {statsData.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-number-row">
                <span className="stat-val">
                  {idx === 0
                    ? `${(counts[0] / 1000).toFixed(0)}K`
                    : idx === 1
                      ? counts[1].toLocaleString()
                      : idx === 2
                        ? '5'
                        : counts[3]}
                </span>
                <span className="stat-suffix">{stat.suffix}</span>
              </div>
              <p className="stat-explanation">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .stats-section {
          position: relative;
          background: linear-gradient(rgba(24, 33, 49, 0.88), rgba(24, 33, 49, 0.94)), 
                      url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat;
          color: #ffffff;
          padding: 90px 0;
          overflow: hidden;
        }
        .stats-container {
          position: relative;
          z-index: 2;
        }
        .stats-main-heading {
          font-size: 38px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 50px;
          letter-spacing: -0.02em;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }
        .stat-card {
          border-left: 2px solid #ff9800;
          padding-left: 24px;
        }
        .stat-number-row {
          display: flex;
          align-items: baseline;
          margin-bottom: 12px;
        }
        .stat-val {
          font-size: 54px;
          font-weight: 800;
          font-family: var(--font-heading);
          color: #ffffff;
          line-height: 1;
        }
        .stat-suffix {
          font-size: 36px;
          font-weight: 700;
          color: #ff9800;
          margin-left: 2px;
        }
        .stat-explanation {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.6;
        }

        @media (max-width: 992px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }
          .stats-main-heading {
            font-size: 30px;
          }
        }
        @media (max-width: 580px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .stat-val {
            font-size: 42px;
          }
        }
      `}</style>
    </section>
  );
}
