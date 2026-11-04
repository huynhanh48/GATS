import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    setError('');
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <section className="newsletter-section">
      <div className="container newsletter-container">
        {/* Left Copy */}
        <div className="newsletter-copy">
          <h2 className="newsletter-title">GATS AI</h2>
          <p className="newsletter-text">
            Cập nhật sớm nhất các khóa học AI mới, tài liệu thực chiến chuyên sâu và thông tin ưu đãi đặc quyền từ GATS Academy.
          </p>
        </div>

        {/* Right Form */}
        <div className="newsletter-form-box">
          <label htmlFor="newsletter-email" className="form-label">
            Địa chỉ email của bạn:
          </label>

          <form className="subscribe-form" onSubmit={handleSubmit}>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Nhập địa chỉ email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="subscribe-input"
              required
            />
            <button type="submit" className="subscribe-submit-btn">
              {subscribed ? 'ĐÃ ĐĂNG KÝ!' : 'ĐĂNG KÝ NGAY'}
            </button>
          </form>

          {error && <p className="form-error">{error}</p>}
          {subscribed && (
            <p className="form-success">
              <CheckCircle2 size={16} /> Cảm ơn bạn! Bạn đã đăng ký nhận bản tin thành công.
            </p>
          )}
        </div>
      </div>

      <style>{`
        .newsletter-section {
          background-color: #2671f7;
          color: #ffffff;
          padding: 60px 0;
          position: relative;
        }
        .newsletter-container {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          align-items: center;
          gap: 50px;
        }
        .newsletter-title {
          color: #ffffff;
          font-size: 36px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        .newsletter-text {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.6;
          max-width: 520px;
        }
        .newsletter-form-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }
        .subscribe-form {
          display: flex;
          background: #ffffff;
          border-radius: var(--radius-sm);
          padding: 6px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        .subscribe-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 12px 18px;
          font-size: 15px;
          font-family: inherit;
          color: var(--brand-dark);
          border-radius: var(--radius-sm);
        }
        .subscribe-input::placeholder {
          color: #94a3b8;
        }
        .subscribe-submit-btn {
          background-color: #1a2233;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 12px 28px;
          border-radius: var(--radius-sm);
          transition: background-color 0.2s;
          white-space: nowrap;
        }
        .subscribe-submit-btn:hover {
          background-color: #0f1522;
        }
        .form-error {
          font-size: 13px;
          color: #fecaca;
          margin-top: 4px;
        }
        .form-success {
          font-size: 13px;
          color: #bbf7d0;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
        }

        @media (max-width: 992px) {
          .newsletter-container {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .newsletter-title {
            font-size: 28px;
          }
        }
        @media (max-width: 600px) {
          .subscribe-form {
            flex-direction: column;
            gap: 8px;
          }
          .subscribe-submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
