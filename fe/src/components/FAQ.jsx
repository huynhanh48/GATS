import React, { useState } from 'react';
import { faqItems } from '../data/faqData';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openId, setOpenId] = useState('faq-1');

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="section faq-section" id="faq">
      <div className="container faq-grid">
        {/* Left Visual Illustration */}
        <div className="faq-visual">
          <div className="faq-img-wrapper">
            <img 
              src="https://masterstudy.stylemixthemes.com/marketing/wp-content/uploads/sites/49/elementor/thumbs/faq-quys9donkzqfsbp4nuops7dh3zesupna6zxj7wksok.png" 
              alt="Frequently Asked Questions" 
              className="faq-graphic"
              loading="lazy"
            />
          </div>
        </div>

        {/* Right FAQ Accordion */}
        <div className="faq-accordion-box">
          <h2 className="faq-title">FAQ</h2>
          
          <div className="accordion-list">
            {faqItems.map((item) => {
              const isOpen = openId === item.id;

              return (
                <div 
                  key={item.id} 
                  className={`accordion-item ${isOpen ? 'active' : ''}`}
                >
                  <button 
                    className="accordion-trigger"
                    onClick={() => toggleFAQ(item.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="question-text">{item.question}</span>
                    <span className="chevron-icon">
                      <ChevronDown size={18} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="accordion-content">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .faq-section {
          background-color: #ffffff;
          padding: 100px 0;
        }
        .faq-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          align-items: center;
          gap: 70px;
        }
        .faq-visual {
          display: flex;
          justify-content: center;
        }
        .faq-img-wrapper {
          max-width: 440px;
          width: 100%;
          position: relative;
        }
        .faq-graphic {
          width: 100%;
          height: auto;
          filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.06));
        }
        .faq-title {
          font-size: 38px;
          font-weight: 800;
          color: var(--brand-dark);
          margin-bottom: 30px;
        }
        .accordion-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .accordion-item {
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 16px;
          transition: border-color 0.2s;
        }
        .accordion-item.active {
          border-color: var(--primary);
        }
        .accordion-trigger {
          width: 100%;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          gap: 16px;
          padding: 8px 0;
        }
        .question-text {
          font-size: 17px;
          font-weight: 700;
          color: var(--brand-dark);
          transition: color 0.2s;
        }
        .accordion-item.active .question-text {
          color: var(--primary);
        }
        .chevron-icon {
          color: var(--brand-dark);
          transition: transform 0.25s ease, color 0.25s ease;
        }
        .accordion-item.active .chevron-icon {
          transform: rotate(180deg);
          color: var(--primary);
        }
        .accordion-content {
          padding-top: 14px;
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.7;
          animation: slideDown 0.2s ease-out;
        }

        @media (max-width: 992px) {
          .faq-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
      `}</style>
    </section>
  );
}
