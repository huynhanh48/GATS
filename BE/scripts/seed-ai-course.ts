import 'dotenv/config';
import { eq } from 'drizzle-orm';
import db from '../src/db';
import {
  coursesTable,
  courseSectionsTable,
  lessonsTable,
  categoriesTable,
  usersTable,
} from '../src/db/schema';
import crypto from 'crypto';
const uuidv4 = () => crypto.randomUUID();
import slugify from 'slugify';

const COURSE_TITLE = 'CHƯƠNG TRÌNH ĐÀO TẠO AI THỰC CHIẾN';

async function main() {
  console.log('--- Bắt đầu tạo dữ liệu Mock Khoá học AI ---');

  let author = await db.query.usersTable.findFirst({
    where: (t, { eq }) => eq(t.email, 'admin@gmail.com'),
  });
  if (!author) {
    const [newAuthor] = await db.insert(usersTable).values({
      email: 'mock_author@gmail.com',
      displayName: 'Mock Author',
      hashedPassword: 'hash', 
    }).returning();
    author = newAuthor;
  }
  const authorId = author.id;

  await db.delete(coursesTable).where(eq(coursesTable.title, COURSE_TITLE));

  let catAI = await db.query.categoriesTable.findFirst({
    where: (t, { eq }) => eq(t.slug, 'ai'),
  });
  if (!catAI) {
    const [c] = await db.insert(categoriesTable).values({
      name: 'Trí tuệ nhân tạo (AI)',
      slug: 'ai',
      type: 'course',
      status: 'active',
    }).returning();
    catAI = c;
  }

  const courseId = uuidv4();
  await db.insert(coursesTable).values({
    id: courseId,
    title: COURSE_TITLE,
    slug: slugify(COURSE_TITLE, { lower: true, strict: true }),
    description: 'Dành cho doanh nghiệp & nhân viên văn phòng. Thời lượng: 6 buổi (3 giờ/buổi). Ứng dụng Generative AI, ChatGPT, Gemini, Claude, Automation và AI Agent vào công việc thực tế.',
    categoryId: catAI.id,
    authorId: authorId,
    price: 1999000,
    salePrice: 999000,
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800', 
  });

  const syllabus = [
    {
      title: 'Buổi 1. Tư duy AI & Làm quen với AI',
      lessons: [
        '1. Tổng quan AI',
        '2. Khả năng của AI',
        '3. Những hạn chế của AI',
        '4. AI trong doanh nghiệp',
        '5. Hệ sinh thái AI phổ biến',
        'Thực hành (Buổi 1)',
      ]
    },
    {
      title: 'Buổi 2. Prompt Engineering',
      lessons: [
        '1. AI hiểu Prompt như thế nào',
        '2. Công thức Prompt chuẩn',
        '3. Prompt cho từng công việc',
        'Thực hành (Buổi 2)'
      ]
    },
    {
      title: 'Buổi 3. Làm việc với Gemini & Google Workspace',
      lessons: [
        'Gemini',
        'Google Docs',
        'Google Sheets',
        'Google Slides',
        'Google Meet',
        'Google Drive',
        'Thực hành (Buổi 3)'
      ]
    },
    {
      title: 'Buổi 4. AI Research & Quản lý tri thức (Nâng cao)',
      lessons: [
        'NotebookLM',
        'Perplexity',
        'Deep Research',
        'Thực hành (Buổi 4)'
      ]
    },
    {
      title: 'Buổi 5. AI Multimedia (Nâng cao)',
      lessons: [
        'Hình ảnh (Imagen, Midjourney, Flux)',
        'Video (Veo, Kling, Runway, CapCut AI)',
        'Voice (ElevenLabs) & Music (Suno)',
        'Avatar (HeyGen)',
        'Thực hành (Buổi 5)'
      ]
    },
    {
      title: 'Buổi 6. AI Automation & AI Agent (Nâng cao)',
      lessons: [
        'Automation (n8n, Make)',
        'AI Agent (MCP, RAG, Vector Database)',
        'Demo Chatbot & RAG doanh nghiệp'
      ]
    }
  ];

  for (let i = 0; i < syllabus.length; i++) {
    const sectionData = syllabus[i];
    const sectionId = uuidv4();
    
    await db.insert(courseSectionsTable).values({
      id: sectionId,
      courseId: courseId,
      title: sectionData.title,
      order: i + 1,
    });

    for (let j = 0; j < sectionData.lessons.length; j++) {
      const lessonTitle = sectionData.lessons[j];
      await db.insert(lessonsTable).values({
        id: uuidv4(),
        courseId: courseId,
        sectionId: sectionId,
        title: lessonTitle,
        type: 'text',
        order: j + 1,
        isPreview: (i === 0 && j === 0), // Preview bài đầu tiên
        duration: 900, // 15 phút
        content: `<h3>${lessonTitle}</h3><p>Nội dung chi tiết cho phần: ${lessonTitle} sẽ được cập nhật trong khóa học.</p>`
      });
    }
  }

  console.log('✅ Đã tạo thành công khóa học: CHƯƠNG TRÌNH ĐÀO TẠO AI THỰC CHIẾN!');
  process.exit(0);
}

main().catch((e) => {
  console.error('Lỗi khi seed AI course:', e);
  process.exit(1);
});
