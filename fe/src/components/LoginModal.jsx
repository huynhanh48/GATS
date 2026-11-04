import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedMessage(`Welcome! You are now logged in as ${email}.`);
    setTimeout(() => {
      setSubmittedMessage('');
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Tab Header */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {submittedMessage ? (
          <div className="auth-success-box">
            <div className="success-icon">✓</div>
            <h3>Authentication Success</h3>
            <p>{submittedMessage}</p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {activeTab === 'register' && (
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-field-wrap">
                  <User size={18} className="field-icon" />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-field-wrap">
                <Mail size={18} className="field-icon" />
                <input 
                  type="email" 
                  placeholder="student@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Password</label>
                {activeTab === 'login' && (
                  <a href="#" className="forgot-pass-link">Forgot password?</a>
                )}
              </div>
              <div className="input-field-wrap">
                <Lock size={18} className="field-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="pass-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password view"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full auth-submit-btn">
              {activeTab === 'login' ? 'Log In' : 'Create Account'}
            </button>

            <div className="auth-divider">
              <span>Or continue with</span>
            </div>

            <div className="social-auth-grid">
              <button type="button" className="social-btn google-btn">
                <span>Google</span>
              </button>
              <button type="button" className="social-btn facebook-btn">
                <span>Facebook</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .auth-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 440px;
          border-radius: var(--radius-lg);
          padding: 36px 32px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          position: relative;
        }
        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          color: #94a3b8;
          padding: 4px;
        }
        .modal-close-btn:hover {
          color: var(--brand-dark);
        }
        .auth-tabs {
          display: flex;
          border-bottom: 2px solid var(--border-light);
          margin-bottom: 28px;
        }
        .auth-tab-btn {
          flex: 1;
          background: transparent;
          padding: 12px;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-muted);
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
        }
        .auth-tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .input-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--brand-dark);
          margin-bottom: 6px;
        }
        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .forgot-pass-link {
          font-size: 12px;
          color: var(--primary);
          font-weight: 600;
        }
        .input-field-wrap {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 0 12px;
          background: #f8fafc;
          transition: border-color 0.2s, background 0.2s;
        }
        .input-field-wrap:focus-within {
          border-color: var(--primary);
          background: #ffffff;
        }
        .field-icon {
          color: #94a3b8;
          margin-right: 8px;
        }
        .input-field-wrap input {
          width: 100%;
          border: none;
          background: transparent;
          outline: none;
          padding: 12px 0;
          font-size: 14px;
          font-family: inherit;
          color: var(--brand-dark);
        }
        .pass-toggle-btn {
          background: transparent;
          color: #94a3b8;
          padding: 4px;
        }
        .auth-submit-btn {
          padding: 13px;
          font-size: 15px;
          margin-top: 6px;
        }
        .auth-divider {
          text-align: center;
          position: relative;
          margin: 10px 0;
        }
        .auth-divider::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 1px;
          background: var(--border-light);
        }
        .auth-divider span {
          background: #ffffff;
          position: relative;
          padding: 0 12px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .social-auth-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .social-btn {
          background: #f8fafc;
          border: 1px solid var(--border-light);
          padding: 10px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 13px;
          color: var(--brand-dark);
        }
        .social-btn:hover {
          background: #f1f5f9;
        }
        .auth-success-box {
          text-align: center;
          padding: 30px 10px;
        }
        .success-icon {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #dcfce7;
          color: #15803d;
          font-size: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
        }
        .auth-success-box h3 {
          font-size: 20px;
          margin-bottom: 8px;
        }
        .auth-success-box p {
          color: var(--text-muted);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
