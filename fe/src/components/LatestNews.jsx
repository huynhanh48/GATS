import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '@/modules/blog/services/postService';
import { Calendar, Loader2 } from 'lucide-react';

export default function LatestNews() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadPosts() {
      try {
        const data = await postService.getPosts();
        if (mounted) {
          setPosts(Array.isArray(data) ? data.slice(0, 6) : []);
        }
      } catch (err) {
        console.warn('API posts fetch failed:', err);
        if (mounted) {
          setPosts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadPosts();
    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && posts.length === 0) {
    return null;
  }

  return (
    <section className="section news-section" id="blog">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">TIN TỨC</h2>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#407bff]" />
            <p className="text-sm text-slate-400">Đang tải bài viết mới nhất từ máy chủ...</p>
          </div>
        ) : (
          /* 6-Article Grid (3x2) */
          <div className="news-grid">
            {posts.slice(0, 6).map((post) => (
              <article key={post.id} className="news-card">
                <div className="news-thumb-wrap">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="news-thumb-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                <div className="news-body">
                  {/* Categories */}
                  <div className="news-categories">
                    {(post.categories || []).map((cat, idx) => (
                      <span key={idx} className="cat-pill">
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="news-title">
                    <Link to={post.slug ? `/post/${post.slug}` : '/blog'}>{post.title}</Link>
                  </h3>

                  <p className="news-excerpt">{post.excerpt}</p>

                  <div className="news-footer">
                    <div className="news-date">
                      <Calendar size={13} />
                      <span>{post.date}</span>
                    </div>

                    <Link to={post.slug ? `/post/${post.slug}` : '/blog'} className="read-more-link">
                      Đọc tiếp
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Show More Button */}
        <div className="news-bottom-cta">
          <Link to="/blog" className="btn-primary show-more-btn">
            Xem thêm bài viết
          </Link>
        </div>
      </div>

      <style>{`
        .news-section {
          background-color: var(--bg-soft);
          padding: 100px 0;
        }
        .news-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-bottom: 48px;
        }
        .news-card {
          background: #ffffff;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .news-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
        .news-thumb-wrap {
          width: 100%;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background-color: #0f172a;
        }
        .news-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .news-card:hover .news-thumb-img {
          transform: scale(1.06);
        }
        .news-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .news-categories {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .cat-pill {
          font-size: 11px;
          font-weight: 700;
          color: var(--primary);
          background: var(--primary-soft);
          padding: 3px 8px;
          border-radius: 4px;
        }
        .news-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--brand-dark);
          line-height: 1.4;
          margin-bottom: 10px;
        }
        .news-title a:hover {
          color: var(--primary);
        }
        .news-excerpt {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .news-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--border-light);
          font-size: 12px;
          color: var(--text-muted);
        }
        .news-date {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .read-more-link {
          font-weight: 700;
          color: var(--primary);
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .read-more-link:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }
        .news-bottom-cta {
          text-align: center;
        }
        .show-more-btn {
          padding: 14px 38px;
        }

        @media (max-width: 992px) {
          .news-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .news-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
