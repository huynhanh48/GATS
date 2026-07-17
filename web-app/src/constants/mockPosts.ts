import { CourseCategory } from '@/types/course';
import { Post } from '@/types/post';

export const MOCK_CATEGORIES: CourseCategory[] = [
  { id: 'c1', name: 'AI 2026', slug: 'ai-2026', type: 'post' },
  { id: 'c2', name: 'AI Automation', slug: 'ai-automation', type: 'post' },
  { id: 'c3', name: 'Công cụ AI', slug: 'cong-cu-ai', type: 'post' },
  { id: 'c4', name: 'Làm việc hiệu suất', slug: 'hieu-suat', type: 'post' },
  { id: 'c5', name: 'Lãnh đạo & Quản lý', slug: 'lanh-dao', type: 'post' },
];

export const BASE_MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    title: 'Tạo Video Short Dạng Dọc Trên NotebookLM Dễ Dàng',
    slug: 'tao-video-short-notebook-lm',
    excerpt: 'Bạn chưa khai thác hết tính năng project của NotebookLM? Hãy xem hướng dẫn chi tiết...',
    category: { id: 'c3', name: 'Công cụ AI', slug: 'cong-cu-ai', type: 'post' },
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'published'
  },
  {
    id: 'p2',
    title: 'Quy Trình 4 Bước Để Tạo TVC Có Cốt Truyện',
    slug: 'quy-trinh-4-buoc-tao-tvc',
    excerpt: 'Làm bạn với AI tập 82: Tạo TVC kể chuyện bằng AI, hướng dẫn chi tiết từ A-Z...',
    category: { id: 'c1', name: 'AI 2026', slug: 'ai-2026', type: 'post' },
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'published'
  },
  {
    id: 'p3',
    title: 'Codex Không Chỉ Để Code! (+Hướng Dẫn Tạo Thư Ký AI)',
    slug: 'codex-khong-chi-de-code',
    excerpt: 'Bỏ qua Codex là một sai lầm! Nhiều bạn vẫn nghĩ Codex là công cụ giúp các lập trình viên viết code...',
    category: { id: 'c3', name: 'Công cụ AI', slug: 'cong-cu-ai', type: 'post' },
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'published'
  },
  {
    id: 'p4',
    title: '1 Giờ Tạo TVC Với AI! (Không Cần Máy Quay, Studio, Ekip)',
    slug: '1-gio-tao-tvc-voi-ai',
    excerpt: 'Trong bài viết này, mình sẽ chia sẻ với các bạn cách tạo TVC chuyên nghiệp với AI mà ai cũng có thể làm được...',
    category: { id: 'c2', name: 'AI Automation', slug: 'ai-automation', type: 'post' },
    thumbnail: 'https://images.unsplash.com/photo-1531297122539-d3db9c6ae921?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'published',
    content: `
      <p>Để bắt đầu dự án này, chúng ta cần một đề bài cụ thể. Trong bài viết ngày hôm nay, chúng ta sẽ cùng nhau thử nghiệm với một thương hiệu nước hoa giả định mang tên Verde. Nhiệm vụ là phải tạo ra một TVC ngắn khoảng 15 đến 30 giây để quảng cáo cho sản phẩm này.</p>
      <p>Trước khi đi vào chi tiết, chúng ta cần phải xác định yêu cầu sáng tạo, hay còn gọi là creative brief cụ thể cho TVC này. Đối với thương hiệu nước hoa Verde, chúng ta sẽ định vị đây là một dòng nước hoa cao cấp dành cho những người trẻ đi làm, những người đang nỗ lực phát triển bản thân và khẳng định vị thế của mình trong...</p>
      <h2>2. Thực Hành</h2>
      <p>Chúng ta sẽ đi vào các bước thực hành chi tiết.</p>
      <h2>2.1. Bước 1: Tạo Kịch Bản, Mô Tả Phân Cảnh Với Gemini</h2>
      <p>Bước đầu tiên trong quá trình sản xuất hình ảnh chính là tạo storyboard. Storyboard giúp chúng ta hình dung trực quan toàn bộ câu chuyện sẽ diễn ra như thế nào trước khi tiến hành làm video.</p>
      <p>Để làm việc này, chúng ta sẽ sử dụng một công cụ AI hỗ trợ trò chuyện và xử lý hình ảnh. Ở đây mình sẽ dùng Gemini, nhưng bạn hoàn toàn có thể sử dụng các AI khác như ChatGPT hoặc Claude đều được nha!</p>
      <p>Ok, đầu tiên, bạn cần tải một bức hình sản phẩm gốc của chai nước hoa Verde lên Gemini và nhập câu lệnh...</p>
      <h2>2.2. Bước 2: Tạo Video Bằng Google Flow</h2>
      <p>Tiếp theo chúng ta sẽ tạo video bằng công cụ của Google.</p>
      <h2>2.3. Bước 3: Tạo Nhạc Bằng Google Flow Music</h2>
      <p>Âm nhạc rất quan trọng để tạo cảm xúc.</p>
      <h2>Lời kết</h2>
      <p>Hy vọng qua bài viết này bạn có thể tự tay làm một TVC chất lượng cho riêng mình.</p>
    `
  },
  {
    id: 'p5',
    title: 'Kimi K2.6: AI Giúp Bạn Làm Web, Slide Và AI Skills',
    slug: 'kimi-k2-6-ai-giup-ban',
    excerpt: 'Khi nhắc đến AI, thì ai cũng biết ChatGPT, Gemini, Claude hay Deep Seek. Nhưng bạn đã biết đến Kimi AI chưa?',
    category: { id: 'c3', name: 'Công cụ AI', slug: 'cong-cu-ai', type: 'post' },
    thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'published'
  },
  {
    id: 'p6',
    title: 'Xây Khung Nền Tảng Cho AI Agent',
    slug: 'xay-khung-nen-tang-ai-agent',
    excerpt: 'Làm bạn với AI tập 80: Xây dựng nền tảng vững chắc cho các tác vụ tự động hóa...',
    category: { id: 'c2', name: 'AI Automation', slug: 'ai-automation', type: 'post' },
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'published'
  }
];

// Duplicate mock posts to demonstrate pagination
export const MOCK_POSTS: Post[] = [
  ...BASE_MOCK_POSTS,
  ...BASE_MOCK_POSTS.map(p => ({ ...p, id: p.id + '-2', title: p.title + ' (Phần 2)', slug: p.slug + '-2' })),
  ...BASE_MOCK_POSTS.map(p => ({ ...p, id: p.id + '-3', title: p.title + ' (Phần 3)', slug: p.slug + '-3' }))
];
