import React from 'react';

const pillars = [
  {
    id: 1,
    title: "Practical Training",
    description: "Chương trình đào tạo AI chất lượng cao, có tính ứng dụng thực tế sâu sắc và phù hợp với nhiều đối tượng người học.",
    image: "https://masterstudy.stylemixthemes.com/marketing/wp-content/uploads/sites/49/2024/10/options.png"
  },
  {
    id: 2,
    title: "Empower Minds",
    description: "Trang bị vững chắc kiến thức chuyên môn, kỹ năng thực hành và tư duy sáng tạo để khai thác tối đa công nghệ AI.",
    image: "https://masterstudy.stylemixthemes.com/marketing/wp-content/uploads/sites/49/2024/10/learning.png"
  },
  {
    id: 3,
    title: "AI Community",
    description: "Cấp chứng nhận chuẩn hóa, kết nối mạng lưới học viên và chuyên gia công nghệ đồng hành phát triển sự nghiệp.",
    image: "https://masterstudy.stylemixthemes.com/marketing/wp-content/uploads/sites/49/2024/10/degree.png"
  }
];

export default function WhyChooseUs() {
  return (
    <section className="section why-choose-section" id="why-choose-us">
      <div className="container">
        {/* Section Title */}
        <div className="section-header">
          <h2 className="section-title">GATS AI</h2>
        </div>

        {/* 3 Pillars Grid */}
        <div className="pillars-grid">
          {pillars.map((item) => (
            <div key={item.id} className="pillar-card">
              <div className="pillar-visual">
                <img
                  src={item.image}
                  alt={item.title}
                  className="pillar-img"
                  loading="lazy"
                />
              </div>
              <div className="pillar-content">
                <h3 className="pillar-title">{item.title}</h3>
                <p className="pillar-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .why-choose-section {
          background-color: #ffffff;
          padding: 100px 0;
        }
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .pillar-card {
          background: #ffffff;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-light);
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: var(--shadow-sm);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .pillar-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(64, 123, 255, 0.25);
        }
        .pillar-visual {
          width: 100%;
          max-width: 220px;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .pillar-img {
          max-height: 100%;
          width: auto;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        .pillar-card:hover .pillar-img {
          transform: scale(1.08);
        }
        .pillar-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--brand-dark);
          margin-bottom: 12px;
        }
        .pillar-desc {
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        @media (max-width: 992px) {
          .pillars-grid {
            grid-template-columns: 1fr;
            max-width: 480px;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
}
