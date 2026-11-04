import React, { useState } from 'react';
import { testimonials, partnerLogos } from '../data/testimonialsData';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevReview = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const current = testimonials[currentIndex];

  return (
    <section className="section testimonials-section" id="testimonials">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">HỌC VIÊN NÓI GÌ ?</h2>
        </div>

        {/* Testimonial Quote Carousel */}
        <div className="testimonial-slider-wrap">
          <button
            className="slider-arrow arrow-left"
            onClick={prevReview}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="testimonial-card-outer">
            {/* Blue Speech Box */}
            <div className="quote-blue-box">
              <Quote size={40} className="quote-icon" />
              <p className="quote-text">"{current.quote}"</p>

              <div className="rating-stars quote-stars">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#ffb606" color="#ffb606" />
                ))}
              </div>

              <h4 className="author-name">{current.name}</h4>
              <span className="author-role">{current.role}</span>
            </div>

            {/* Author Avatar below */}
            <div className="author-avatar-wrap">
              <img
                src={current.avatar}
                alt={current.name}
                className="author-avatar-img"
              />
            </div>
          </div>

          <button
            className="slider-arrow arrow-right"
            onClick={nextReview}
            aria-label="Next testimonial"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Partner Logos Strip */}
        <div className="partners-strip">
          {partnerLogos.map((partner, idx) => (
            <div key={idx} className="partner-logo-item">
              <img
                src={partner.logo}
                alt={partner.name}
                className="partner-logo-img"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .testimonials-section {
          background-color: #ffffff;
          padding: 100px 0 80px 0;
          overflow: hidden;
        }
        .testimonial-slider-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          margin-bottom: 80px;
          position: relative;
        }
        .slider-arrow {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brand-dark);
          box-shadow: var(--shadow-sm);
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .slider-arrow:hover {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }
        .testimonial-card-outer {
          max-width: 720px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .quote-blue-box {
          background: #2575fc;
          border-radius: var(--radius-lg);
          padding: 50px 48px;
          color: #ffffff;
          text-align: center;
          position: relative;
          box-shadow: 0 20px 40px rgba(37, 117, 252, 0.22);
          width: 100%;
        }
        .quote-icon {
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 16px;
        }
        .quote-text {
          font-size: 20px;
          font-weight: 500;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .quote-stars {
          justify-content: center;
          margin-bottom: 16px;
        }
        .author-name {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .author-role {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }
        .author-avatar-wrap {
          margin-top: -36px;
          width: 76px;
          height: 76px;
          border-radius: 50%;
          border: 4px solid #ffffff;
          box-shadow: var(--shadow-md);
          overflow: hidden;
          background: #ffffff;
          position: relative;
          z-index: 3;
        }
        .author-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .partners-strip {
          display: flex;
          align-items: center;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 30px;
          padding-top: 40px;
          border-top: 1px solid var(--border-light);
        }
        .partner-logo-item {
          opacity: 0.7;
          filter: grayscale(100%);
          transition: all 0.3s ease;
        }
        .partner-logo-item:hover {
          opacity: 1;
          filter: grayscale(0%);
          transform: translateY(-2px);
        }
        .partner-logo-img {
          max-height: 36px;
          width: auto;
        }

        @media (max-width: 768px) {
          .quote-blue-box {
            padding: 36px 24px;
          }
          .quote-text {
            font-size: 16px;
          }
          .slider-arrow {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
