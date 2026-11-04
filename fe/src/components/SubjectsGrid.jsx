import React, { useState, useEffect } from 'react';
import { subjects as defaultSubjects } from '../data/subjectsData';
import { courseService } from '@/modules/course/services/courseService';
import designIcon from '../assets/icons/subject-design.svg';
import architectureIcon from '../assets/icons/subject-architecture.svg';
import mathIcon from '../assets/icons/subject-math.svg';
import healthIcon from '../assets/icons/subject-health.svg';
import audioIcon from '../assets/icons/subject-audio.svg';
import marketingIcon from '../assets/icons/subject-marketing.svg';

const iconList = [designIcon, architectureIcon, mathIcon, healthIcon, audioIcon, marketingIcon];

const slugIconMap = {
  cowork: designIcon,
  coworking: designIcon,
  mastery: architectureIcon,
  automation: mathIcon,
  studio: audioIcon,
  'ai-studio': audioIcon,
  code: marketingIcon,
  'vibe-coding': marketingIcon,
  agents: healthIcon,
  'ai-agents': healthIcon,
  'design-art': designIcon,
  architecture: architectureIcon,
  math: mathIcon,
  health: healthIcon,
  'audio-music': audioIcon,
  marketing: marketingIcon,
};

function getCategoryIcon(item, index) {
  if (item.slug && slugIconMap[item.slug]) return slugIconMap[item.slug];
  if (item.id && slugIconMap[item.id]) return slugIconMap[item.id];
  return iconList[index % iconList.length];
}

export default function SubjectsGrid() {
  const [categories, setCategories] = useState(defaultSubjects);

  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const data = await courseService.getCategories();
        if (!mounted) return;

        if (Array.isArray(data) && data.length > 0) {
          // Map backend categories
          const formatted = data.map((cat) => ({
            id: cat.id,
            title: cat.name,
            slug: cat.slug,
            courseCount: cat.courseCount,
          }));

          // Đảm bảo hiển thị tối thiểu 6 items
          if (formatted.length < 6) {
            const combined = [...formatted];
            for (const fallback of defaultSubjects) {
              if (combined.length >= 6) break;
              if (!combined.some((c) => c.title.toLowerCase() === fallback.title.toLowerCase())) {
                combined.push(fallback);
              }
            }
            setCategories(combined);
          } else {
            setCategories(formatted);
          }
        } else {
          setCategories(defaultSubjects);
        }
      } catch (err) {
        console.warn('Categories fetch failed, using default subjects:', err);
        if (mounted) {
          setCategories(defaultSubjects);
        }
      }
    }

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="section subjects-section" id="subjects">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">GATS AI</h2>
          <p className="section-subtitle">
            Hệ thống chương trình đào tạo đa dạng, cập nhật liên tục các công nghệ Trí tuệ nhân tạo và Phân tích dữ liệu tiên tiến nhất, đáp ứng mọi mục tiêu học tập và phát triển sự nghiệp.
          </p>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="subjects-grid">
          {categories.map((sub, index) => {
            const iconSrc = getCategoryIcon(sub, index);

            return (
              <a
                key={sub.id || sub.slug || index}
                href="#courses"
                className="subject-card"
              >
                <div className="subject-icon-box">
                  <img
                    src={iconSrc}
                    alt={sub.title}
                    className="subject-icon-img"
                    width={56}
                    height={56}
                    loading="lazy"
                  />
                </div>
                <h3 className="subject-title">{sub.title}</h3>
              </a>
            );
          })}
        </div>
      </div>

      <style>{`
        .subjects-section {
          background-color: #ffffff;
          padding: 80px 0;
        }
        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 20px;
        }
        .subject-card {
          background-color: #f1f5f9;
          border-radius: 24px;
          padding: 36px 16px 28px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          text-decoration: none;
          border: 1px solid transparent;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), 
                      background-color 0.25s ease,
                      border-color 0.25s ease;
          cursor: pointer;
        }
        .subject-card:hover {
          transform: translateY(-6px);
          background-color: #e8eef5;
          box-shadow: 0 16px 32px -8px rgba(15, 23, 42, 0.08);
          border-color: rgba(24, 144, 255, 0.15);
        }
        .subject-icon-box {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          transition: transform 0.3s ease;
        }
        .subject-card:hover .subject-icon-box {
          transform: scale(1.08);
        }
        .subject-icon-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .subject-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }

        @media (max-width: 1200px) {
          .subjects-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }
        @media (max-width: 640px) {
          .subjects-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .subject-card {
            border-radius: 20px;
            padding: 26px 12px 22px 12px;
          }
          .subject-icon-box {
            width: 48px;
            height: 48px;
            margin-bottom: 14px;
          }
          .subject-title {
            font-size: 14px;
          }
        }
      `}</style>
    </section>
  );
}
