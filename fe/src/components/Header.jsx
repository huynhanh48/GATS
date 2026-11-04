import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  User,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  BookOpen,
  LogOut,
  Compass,
  Sparkles,
  Cpu,
  Network,
  Wrench,
  Atom,
} from 'lucide-react';
import { useAuthStore, useAuthUiStore } from '@/modules/auth';
import { courseService } from '@/modules/course/services/courseService';

export default function Header({ onOpenSearch, onOpenLogin }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const { user, isAuthenticated, logout, initAuth } = useAuthStore();
  const { openAuthModal } = useAuthUiStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Tải danh mục và tag từ API Backend
  useEffect(() => {
    let mounted = true;
    async function fetchMenuData() {
      try {
        const [catList, tagList] = await Promise.all([
          courseService.getCategories(),
          courseService.getTags(),
        ]);
        if (mounted) {
          if (Array.isArray(catList) && catList.length > 0) {
            setCategories(catList);
          } else {
            setCategories([
              { name: 'Coworking', slug: 'coworking' },
              { name: 'Mastery', slug: 'mastery' },
              { name: 'Automation', slug: 'automation' },
              { name: 'AI Studio', slug: 'ai-studio' },
              { name: 'Vibe Coding', slug: 'vibe-coding' },
              { name: 'AI Agents', slug: 'ai-agents' },
            ]);
          }

          if (Array.isArray(tagList) && tagList.length > 0) {
            setTags(tagList);
          } else {
            setTags([
              { name: 'Lộ trình AI Thực chiến', slug: 'lo-trinh-ai' },
              { name: 'Prompt Engineering', slug: 'prompt-engineering' },
              { name: 'AI Automation', slug: 'ai-automation' },
              { name: 'Khóa học Chuyên sâu', slug: 'chuyen-sau' },
            ]);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải categories/tags cho header:', err);
      }
    }

    fetchMenuData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigateFilter = (type, value) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    if (!type || !value) {
      navigate('/courses');
      return;
    }
    navigate(`/courses?${type}=${encodeURIComponent(value)}`);
  };

  const toggleMobileSection = (key) => {
    setMobileExpandedSection((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      if (location.pathname.startsWith('/courses') || location.pathname.startsWith('/roadmap')) {
        setMobileExpandedSection('courses');
      } else if (
        location.pathname.startsWith('/skills') ||
        location.pathname.startsWith('/mcp') ||
        location.pathname.startsWith('/api') ||
        location.pathname.startsWith('/tools')
      ) {
        setMobileExpandedSection('features');
      } else if (location.pathname.startsWith('/blog') || location.pathname.startsWith('/post')) {
        setMobileExpandedSection('blog');
      }
    }
  }, [mobileMenuOpen, location.pathname]);

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo" aria-label="GATS AI Home">
            <img 
              src="/icons/logo.svg" 
              alt="GATS AI Logo" 
              className="logo-icon-svg"
            />
            <span className="logo-text">GATS <span className="logo-accent">AI</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <div className="nav-item">
              <Link to="/" className="nav-link">
                Trang chủ
              </Link>
            </div>

            <div 
              className="nav-item has-dropdown"
              onMouseEnter={() => setActiveDropdown('courses')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link 
                to="/roadmap" 
                className="nav-link"
                onClick={() => {
                  setActiveDropdown(null);
                }}
              >
                Khóa học <ChevronDown size={14} />
              </Link>
              {activeDropdown === 'courses' && (
                <div className="dropdown-menu courses-dropdown">
                  <div className="dropdown-column">
                    <span className="dropdown-heading">Danh mục khóa học</span>
                    <div className="courses-grid-2col">
                      <div className="courses-col">
                        {categories.slice(0, 3).map((cat, idx) => (
                          <button
                            key={cat.id || cat.slug || idx}
                            type="button"
                            onClick={() => handleNavigateFilter('category', cat.name || cat.slug)}
                            className="sub-link text-left cursor-pointer truncate"
                          >
                            {cat.name || cat.slug}
                          </button>
                        ))}
                      </div>
                      <div className="courses-col">
                        {categories.slice(3, 6).map((cat, idx) => (
                          <button
                            key={cat.id || cat.slug || idx + 3}
                            type="button"
                            onClick={() => handleNavigateFilter('category', cat.name || cat.slug)}
                            className="sub-link text-left cursor-pointer truncate"
                          >
                            {cat.name || cat.slug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="nav-item">
              <Link
                to="/stem"
                className={`nav-link ${location.pathname.startsWith('/stem') ? 'active' : ''}`}
              >
                STEM
              </Link>
            </div>

            <div 
              className="nav-item has-dropdown"
              onMouseEnter={() => setActiveDropdown('features')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <span className="nav-link">
                Tính năng <ChevronDown size={14} />
              </span>
              {activeDropdown === 'features' && (
                <div className="dropdown-menu features-dropdown">
                  <div className="features-grid">
                    <Link
                      to="/skills"
                      onClick={() => setActiveDropdown(null)}
                      className="feature-item cursor-pointer"
                    >
                      <Sparkles size={16} className="feature-icon" />
                      <div>
                        <strong>Skills</strong>
                        <p>Danh mục kỹ năng AI thực chiến</p>
                      </div>
                    </Link>
                    <Link
                      to="/mcp"
                      onClick={() => setActiveDropdown(null)}
                      className="feature-item cursor-pointer"
                    >
                      <Cpu size={16} className="feature-icon" />
                      <div>
                        <strong>MCP</strong>
                        <p>Model Context Protocol Server</p>
                      </div>
                    </Link>
                    <Link
                      to="/api"
                      onClick={() => setActiveDropdown(null)}
                      className="feature-item cursor-pointer"
                    >
                      <Network size={16} className="feature-icon" />
                      <div>
                        <strong>API</strong>
                        <p>Tài liệu và tích hợp API hệ thống</p>
                      </div>
                    </Link>
                    <Link
                      to="/tools"
                      onClick={() => setActiveDropdown(null)}
                      className="feature-item cursor-pointer"
                    >
                      <Wrench size={16} className="feature-icon" />
                      <div>
                        <strong>Tools</strong>
                        <p>Bộ công cụ AI và tiện ích hỗ trợ</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div 
              className="nav-item has-dropdown"
              onMouseEnter={() => setActiveDropdown('blog')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link 
                to="/blog" 
                className="nav-link"
                onClick={() => setActiveDropdown(null)}
              >
                Bài viết <ChevronDown size={14} />
              </Link>
              {activeDropdown === 'blog' && (
                <div className="dropdown-menu simple-dropdown">
                  <Link
                    to="/blog"
                    onClick={() => setActiveDropdown(null)}
                    className="sub-link text-left cursor-pointer"
                  >
                    Tất cả bài viết
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate('/blog?category=Tin tức');
                    }}
                    className="sub-link text-left cursor-pointer"
                  >
                    Tin tức & Xu hướng AI
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate('/blog?category=Kiến thức');
                    }}
                    className="sub-link text-left cursor-pointer"
                  >
                    Kiến thức thực chiến
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate('/blog?category=Hướng dẫn');
                    }}
                    className="sub-link text-left cursor-pointer"
                  >
                    Hướng dẫn thực hành
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      navigate('/blog?category=Case Study');
                    }}
                    className="sub-link text-left cursor-pointer"
                  >
                    Case Study Doanh nghiệp
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Action buttons on right */}
          <div className="header-actions">
            <button 
              className="icon-circle-btn search-btn" 
              onClick={onOpenSearch} 
              aria-label="Tìm kiếm khóa học"
              title="Tìm kiếm khóa học"
            >
              <Search size={18} />
            </button>

            {/* User Account / Login Button */}
            {isAuthenticated ? (
              <div 
                className="relative h-full flex items-center"
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <img
                    src={
                      user?.avatarUrl ||
                      user?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.userName || 'User'}`
                    }
                    alt={user?.userName || 'Tài khoản'}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                  />
                  <span className="text-xs sm:text-sm font-bold text-[#273044] hidden md:inline-block">
                    {user?.userName || user?.email?.split('@')[0] || 'Tài khoản'}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Dropdown Menu User - Positioned below bottom of main header bar */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-0 w-60 bg-white rounded-b-[10px] shadow-2xl border border-slate-200 border-t-2 border-t-[#1a56db] py-2 z-[1000] animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-xs font-bold text-[#273044] truncate">
                        {user?.userName || 'Học viên GATS'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {user?.email || 'hocvien@gats.vn'}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/account/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1a56db] transition-colors"
                      >
                        <User size={15} className="text-[#1a56db]" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>

                      <Link
                        to="/account/my-courses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1a56db] transition-colors"
                      >
                        <BookOpen size={15} className="text-[#1a56db]" />
                        <span>Khóa học của tôi</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="user-login-btn" 
                onClick={onOpenLogin || (() => openAuthModal('login'))}
                aria-label="Đăng nhập hoặc Đăng ký"
              >
                <div className="user-avatar-circle">
                  <User size={18} />
                </div>
                <span className="login-text">ĐĂNG NHẬP / ĐĂNG KÝ</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button 
              className="mobile-hamburger" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Mở menu điều hướng"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <nav className="mobile-nav">
              {/* 1. Trang chủ */}
              <div className="mobile-nav-group">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-nav-row ${location.pathname === '/' ? 'active-route' : ''}`}
                >
                  <span className="mobile-nav-title">Trang chủ</span>
                </Link>
              </div>

              {/* 2. Khóa học */}
              <div className="mobile-nav-group">
                <div 
                  className={`mobile-nav-row ${(location.pathname.startsWith('/courses') || location.pathname.startsWith('/roadmap')) ? 'active-route' : ''}`}
                >
                  <Link
                    to="/roadmap"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-nav-title flex-1"
                  >
                    Khóa học
                  </Link>
                  <button
                    type="button"
                    className="mobile-chevron-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMobileSection('courses');
                    }}
                    aria-label="Mở danh mục Khóa học"
                  >
                    {mobileExpandedSection === 'courses' ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
                {(location.pathname.startsWith('/courses') || location.pathname.startsWith('/roadmap')) && mobileExpandedSection !== 'courses' && (
                  <div className="mobile-active-line" />
                )}
                {mobileExpandedSection === 'courses' && (
                  <div className="mobile-sub-list">
                    {categories.slice(0, 6).map((cat, idx) => (
                      <button
                        key={cat.id || cat.slug || idx}
                        type="button"
                        onClick={() => handleNavigateFilter('category', cat.name || cat.slug)}
                        className="mobile-sub-link text-left"
                      >
                        {cat.name || cat.slug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. STEM */}
              <div className="mobile-nav-group">
                <Link
                  to="/stem"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-nav-row ${location.pathname.startsWith('/stem') ? 'active-route' : ''}`}
                >
                  <span className="mobile-nav-title">STEM</span>
                </Link>
              </div>

              {/* 4. Tính năng */}
              <div className="mobile-nav-group">
                <div 
                  className={`mobile-nav-row ${['/skills', '/mcp', '/api', '/tools'].some(p => location.pathname.startsWith(p)) ? 'active-route' : ''}`}
                  onClick={() => toggleMobileSection('features')}
                >
                  <span className="mobile-nav-title">Tính năng</span>
                  <button
                    type="button"
                    className="mobile-chevron-btn"
                    aria-label="Mở danh mục Tính năng"
                  >
                    {mobileExpandedSection === 'features' ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
                {['/skills', '/mcp', '/api', '/tools'].some(p => location.pathname.startsWith(p)) && mobileExpandedSection !== 'features' && (
                  <div className="mobile-active-line" />
                )}
                {mobileExpandedSection === 'features' && (
                  <div className="mobile-sub-list">
                    <Link
                      to="/skills"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mobile-sub-link flex items-center gap-2"
                    >
                      <Sparkles size={16} className="text-[#2563eb] shrink-0" />
                      <span>Skills (Kỹ năng AI thực chiến)</span>
                    </Link>
                    <Link
                      to="/mcp"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mobile-sub-link flex items-center gap-2"
                    >
                      <Cpu size={16} className="text-[#2563eb] shrink-0" />
                      <span>MCP (Model Context Protocol)</span>
                    </Link>
                    <Link
                      to="/api"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mobile-sub-link flex items-center gap-2"
                    >
                      <Network size={16} className="text-[#2563eb] shrink-0" />
                      <span>API (Tài liệu & Tích hợp)</span>
                    </Link>
                    <Link
                      to="/tools"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mobile-sub-link flex items-center gap-2"
                    >
                      <Wrench size={16} className="text-[#2563eb] shrink-0" />
                      <span>Tools (Bộ công cụ & Tiện ích)</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 4. Bài viết */}
              <div className="mobile-nav-group">
                <div 
                  className={`mobile-nav-row ${(location.pathname.startsWith('/blog') || location.pathname.startsWith('/post')) ? 'active-route' : ''}`}
                  onClick={() => toggleMobileSection('blog')}
                >
                  <span className="mobile-nav-title">Bài viết</span>
                  <button
                    type="button"
                    className="mobile-chevron-btn"
                    aria-label="Mở danh mục Bài viết"
                  >
                    {mobileExpandedSection === 'blog' ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
                {(location.pathname.startsWith('/blog') || location.pathname.startsWith('/post')) && mobileExpandedSection !== 'blog' && (
                  <div className="mobile-active-line" />
                )}
                {mobileExpandedSection === 'blog' && (
                  <div className="mobile-sub-list">
                    <Link
                      to="/blog"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mobile-sub-link font-semibold text-[#1a56db]"
                    >
                      Tất cả bài viết
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/blog?category=Tin tức');
                      }}
                      className="mobile-sub-link text-left"
                    >
                      Tin tức & Xu hướng AI
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/blog?category=Kiến thức');
                      }}
                      className="mobile-sub-link text-left"
                    >
                      Kiến thức thực chiến
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/blog?category=Hướng dẫn');
                      }}
                      className="mobile-sub-link text-left"
                    >
                      Hướng dẫn thực hành
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/blog?category=Case Study');
                      }}
                      className="mobile-sub-link text-left"
                    >
                      Case Study Doanh nghiệp
                    </button>
                  </div>
                )}
              </div>
              <div className="mobile-actions">
                {isAuthenticated ? (
                  <button
                    className="btn-primary w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    ĐĂNG XUẤT ({user?.userName || 'Tài khoản'})
                  </button>
                ) : (
                  <button
                    className="btn-primary w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenLogin) onOpenLogin();
                      else openAuthModal('login');
                    }}
                  >
                    ĐĂNG NHẬP / ĐĂNG KÝ
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid var(--border-light);
          z-index: 1000;
          transition: box-shadow 0.25s ease, background 0.25s ease;
        }
        .site-header.scrolled {
          box-shadow: 0 4px 20px rgba(39, 48, 68, 0.08);
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
          position: relative;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-icon-svg {
          height: 40px;
          width: 40px;
          object-fit: contain;
          display: block;
        }
        .logo-text {
          font-family: var(--font-heading);
          font-size: 22px;
          font-weight: 800;
          color: var(--brand-dark);
          letter-spacing: -0.02em;
        }
        .logo-accent {
          color: var(--primary);
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          height: 100%;
          gap: 28px;
        }
        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          height: 100%;
        }
        .nav-link {
          font-size: 15px;
          font-weight: 600;
          color: var(--brand-dark);
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 0;
          cursor: pointer;
          height: 100%;
        }
        .nav-link:hover,
        .nav-link.active {
          color: var(--primary);
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 1px;
          background: #ffffff;
          box-shadow: 0 16px 36px rgba(39, 48, 68, 0.12);
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          border: 1px solid var(--border-light);
          border-top: 2px solid var(--primary);
          padding: 16px;
          z-index: 100;
          animation: slideDown 0.2s ease-out;
        }
        .mega-menu {
          width: 480px;
        }
        .mega-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .mega-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-main);
          transition: background 0.15s ease;
        }
        .mega-item:hover, .mega-item.active {
          background-color: var(--primary-soft);
          color: var(--primary);
        }
        .badge-pro {
          background: #ff543e;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .badge-tag {
          background: #407bff;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 6px;
        }
        .courses-dropdown {
          display: flex;
          flex-direction: column;
          width: 320px;
          padding: 12px 10px;
        }
        .dropdown-column {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .dropdown-heading {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          padding: 0 8px;
        }
        .courses-grid-2col {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0 6px;
        }
        .courses-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sub-link {
          font-size: 13.5px;
          color: var(--text-main);
          padding: 7px 8px;
          display: flex;
          align-items: center;
          border-radius: 6px;
          transition: all 0.15s ease;
          width: 100%;
          text-align: left;
        }
        .sub-link:hover {
          color: var(--primary);
          background: rgba(26, 86, 219, 0.06);
          padding-left: 10px;
        }
        .features-dropdown {
          width: 420px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .feature-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 8px;
          border-radius: var(--radius-sm);
        }
        .feature-item:hover {
          background: var(--primary-soft);
        }
        .feature-icon {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 3px;
        }
        .feature-item strong {
          display: block;
          font-size: 13px;
          color: var(--brand-dark);
        }
        .feature-item p {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .simple-dropdown {
          width: 200px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .instructor-link {
          color: var(--brand-dark);
        }
        .header-actions {
          display: flex;
          align-items: center;
          height: 100%;
          gap: 14px;
        }
        .icon-circle-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #5b8cf6;
          color: #ffffff;
          transition: background 0.2s, transform 0.2s;
        }
        .icon-circle-btn:hover {
          background: #3973ee;
          transform: scale(1.05);
        }
        .user-login-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: transparent;
          padding: 4px 8px;
          border-radius: var(--radius-pill);
        }
        .user-avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #5b8cf6;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-text {
          font-size: 14px;
          font-weight: 700;
          color: var(--brand-dark);
          letter-spacing: 0.02em;
        }
        .user-login-btn:hover .login-text {
          color: var(--primary);
        }
        .mobile-hamburger {
          display: none;
          background: transparent;
          color: var(--brand-dark);
          padding: 6px;
        }
        .mobile-drawer {
          display: none;
          background: #ffffff;
          border-top: 1px solid var(--border-light);
          padding: 16px 20px 28px 20px;
          max-height: calc(100vh - 80px);
          overflow-y: auto;
        }
        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .mobile-nav-group {
          display: flex;
          flex-direction: column;
          padding-bottom: 6px;
          border-bottom: 1px solid #f1f5f9;
        }
        .mobile-nav-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 4px;
          cursor: pointer;
          user-select: none;
        }
        .mobile-nav-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--brand-dark);
          letter-spacing: -0.01em;
          transition: color 0.15s ease;
        }
        .mobile-nav-row:hover .mobile-nav-title,
        .mobile-nav-row.active-route .mobile-nav-title {
          color: #2563eb;
        }
        .mobile-active-line {
          height: 2.5px;
          background: #2563eb;
          width: 100%;
          border-radius: 2px;
          margin-top: 2px;
          margin-bottom: 4px;
        }
        .mobile-chevron-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #2563eb;
          padding: 6px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .mobile-sub-list {
          margin-top: 6px;
          margin-bottom: 12px;
          margin-left: 8px;
          border-left: 2px solid #2563eb;
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: slideDownMobile 0.2s ease-out;
        }
        @keyframes slideDownMobile {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .mobile-sub-link {
          font-size: 15px;
          font-weight: 500;
          color: #273044;
          text-decoration: none;
          text-align: left;
          background: none;
          border: none;
          padding: 4px 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .mobile-sub-link:hover, .mobile-sub-link:active {
          color: #2563eb;
          transform: translateX(4px);
        }
        .mobile-actions {
          margin-top: 18px;
          padding-top: 8px;
        }
        .w-full {
          width: 100%;
        }

        @media (max-width: 992px) {
          .desktop-nav, .user-login-btn .login-text {
            display: none;
          }
          .mobile-hamburger {
            display: block;
          }
          .mobile-drawer {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
