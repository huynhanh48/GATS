import 'dotenv/config';
import { eq, or } from 'drizzle-orm';
import db from '../src/db';
import {
  coursesTable,
  courseSectionsTable,
  lessonsTable,
  videosTable,
  categoriesTable,
  usersTable,
} from '../src/db/schema';
import crypto from 'crypto';
const uuidv4 = () => crypto.randomUUID();
import slugify from 'slugify';

const COURSE_TITLE_1 = 'Flutter Mastery: Xây dựng ứng dụng đa nền tảng';
const COURSE_TITLE_2 = 'Mastering AI Tools for Content Creation';

async function main() {
  console.log('--- Bắt đầu tạo dữ liệu Mock Khoá học ---');

  // Lấy hoặc tạo user làm Author
  let author = await db.query.usersTable.findFirst({
    where: (t, { eq }) => eq(t.email, 'admin@gmail.com'),
  });
  if (!author) {
    console.log('Không tìm thấy admin@gmail.com. Tạo user mock_author...');
    const [newAuthor] = await db.insert(usersTable).values({
      email: 'mock_author@gmail.com',
      displayName: 'Mock Author',
      hashedPassword: 'hash', // fake
    }).returning();
    author = newAuthor;
  }
  const authorId = author.id;

  // Xoá course cũ nếu có để tránh trùng lặp
  await db.delete(coursesTable).where(
    or(
      eq(coursesTable.title, COURSE_TITLE_1),
      eq(coursesTable.title, COURSE_TITLE_2)
    )
  );

  // --- COURSE 1: LẬP TRÌNH ---
  let catDev = await db.query.categoriesTable.findFirst({
    where: (t, { eq }) => eq(t.slug, 'lap-trinh'),
  });
  if (!catDev) {
    const [c] = await db.insert(categoriesTable).values({
      name: 'Lập trình',
      slug: 'lap-trinh',
      type: 'course',
      status: 'active',
    }).returning();
    catDev = c;
  }

  const course1Id = uuidv4();
  await db.insert(coursesTable).values({
    id: course1Id,
    title: COURSE_TITLE_1,
    slug: slugify(COURSE_TITLE_1, { lower: true, strict: true }),
    description: 'Khóa học giúp bạn nắm vững Flutter từ cơ bản đến nâng cao. Tự tin xây dựng ứng dụng di động cho cả iOS và Android chỉ với một codebase duy nhất.',
    categoryId: catDev.id,
    authorId: authorId,
    price: 999000,
    salePrice: 499000,
    status: 'published',
    thumbnail: 'https://via.placeholder.com/600x400.png?text=Flutter+Mastery', // Fake thumbnail
  });

  // Section 1
  const s1Id = uuidv4();
  await db.insert(courseSectionsTable).values({
    id: s1Id,
    courseId: course1Id,
    title: 'Phần 1: Nhập môn Flutter & Dart',
    order: 1,
  });

  // Lesson 1.1
  const l1_1Id = uuidv4();
  await db.insert(lessonsTable).values({
    id: l1_1Id,
    courseId: course1Id,
    sectionId: s1Id,
    title: '1. Cài đặt môi trường phát triển',
    type: 'video',
    order: 1,
    isPreview: true,
    duration: 360, // seconds
  });
  // Video cho Lesson 1.1 (sử dụng S3 HLS mẫu)
  await db.insert(videosTable).values({
    courseId: course1Id,
    lessonId: l1_1Id,
    title: '1. Cài đặt môi trường phát triển',
    storageProvider: 's3',
    hlsKey: 'videos/hls/704c7707-1c14-4bde-a275-770fa5ba70ca/30b520d7-7375-4ffe-bb6c-b1ef28a119de/index.m3u8',
    status: 'ready',
    duration: 360,
  });

  // Lesson 1.2
  const l1_2Id = uuidv4();
  await db.insert(lessonsTable).values({
    id: l1_2Id,
    courseId: course1Id,
    sectionId: s1Id,
    title: '2. Widget cơ bản trong Flutter',
    type: 'video',
    order: 2,
    isPreview: false,
    duration: 600,
  });
  // Video cho Lesson 1.2
  await db.insert(videosTable).values({
    courseId: course1Id,
    lessonId: l1_2Id,
    title: '2. Widget cơ bản trong Flutter',
    storageProvider: 's3',
    hlsKey: 'videos/hls/704c7707-1c14-4bde-a275-770fa5ba70ca/53002ec3-9ba0-48bb-a131-4a7a5a3dd0da/index.m3u8',
    status: 'ready',
    duration: 600,
  });

  // --- COURSE 2: AI CONTENT CREATION ---
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

  const course2Id = uuidv4();
  await db.insert(coursesTable).values({
    id: course2Id,
    title: COURSE_TITLE_2,
    slug: slugify(COURSE_TITLE_2, { lower: true, strict: true }),
    description: 'Sử dụng AI như ChatGPT, Midjourney để tự động hoá toàn bộ quá trình sáng tạo nội dung của bạn.',
    categoryId: catAI.id,
    authorId: authorId,
    price: 599000,
    salePrice: 199000,
    status: 'published',
    thumbnail: 'https://via.placeholder.com/600x400.png?text=AI+Content',
  });

  // Section 2.1
  const s2Id = uuidv4();
  await db.insert(courseSectionsTable).values({
    id: s2Id,
    courseId: course2Id,
    title: 'Chương 1: Công cụ tạo text với ChatGPT',
    order: 1,
  });

  const l2_1Id = uuidv4();
  await db.insert(lessonsTable).values({
    id: l2_1Id,
    courseId: course2Id,
    sectionId: s2Id,
    title: 'Bài 1: Viết prompt hiệu quả',
    type: 'video',
    order: 1,
    isPreview: true,
    duration: 450,
  });
  await db.insert(videosTable).values({
    courseId: course2Id,
    lessonId: l2_1Id,
    title: 'Bài 1: Viết prompt hiệu quả',
    storageProvider: 's3',
    hlsKey: 'videos/hls/704c7707-1c14-4bde-a275-770fa5ba70ca/93eec268-685a-40fc-9cd5-23dab2291a25/index.m3u8',
    status: 'ready',
    duration: 450,
  });

  console.log('✅ Đã tạo thành công 2 khoá học mẫu (Flutter Mastery & AI Content) với video thực!');
  process.exit(0);
}

main().catch((e) => {
  console.error('Lỗi khi seed mock courses:', e);
  process.exit(1);
});
