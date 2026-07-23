import logger from 'jet-logger';

import EnvVars, { NodeEnvs } from '@src/common/constants/env';
import { hashPassword } from '@src/common/utils/password';
import { slugify } from '@src/common/utils/slug';
import db from '@src/db';
import type { CourseLevel, CourseStatus } from '@src/db/schema/course';
import type { PostStatus, PostVisibility } from '@src/db/schema/post';
import type { LessonRecord } from '@src/models/Lesson.model';
import * as AssignmentRepo from '@src/repos/AssignmentRepo';
import * as CategoryRepo from '@src/repos/CategoryRepo';
import * as CourseIncludeRepo from '@src/repos/CourseIncludeRepo';
import * as CourseLearningOutcomeRepo from '@src/repos/CourseLearningOutcomeRepo';
import * as CourseRepo from '@src/repos/CourseRepo';
import * as CourseReviewRepo from '@src/repos/CourseReviewRepo';
import * as CourseSectionRepo from '@src/repos/CourseSectionRepo';
import * as CourseTagRepo from '@src/repos/CourseTagRepo';
import * as EnrollmentRepo from '@src/repos/EnrollmentRepo';
import * as LessonRepo from '@src/repos/LessonRepo';
import * as PostRepo from '@src/repos/PostRepo';
import * as PostTagRepo from '@src/repos/PostTagRepo';
import * as QuizQuestionRepo from '@src/repos/QuizQuestionRepo';
import * as QuizRepo from '@src/repos/QuizRepo';
import * as RoleRepo from '@src/repos/RoleRepo';
import * as TagRepo from '@src/repos/TagRepo';
import * as UserRepo from '@src/repos/UserRepo';
import { seedPermissions } from '@src/services/PermissionSeedService';

export const RAG_COURSE_SLUG = 'rag-cho-doanh-nghiep-tu-pdf-den-chatbot';

const DEFAULT_COURSE_CATEGORIES = [
  { name: 'Khóa học', slug: 'course' },
  { name: 'Mẫu báo cáo', slug: 'template' },
  { name: 'Bootcamp', slug: 'bootcamp' },
  { name: 'AI Automation', slug: 'ai-automation' },
  { name: 'Marketing', slug: 'marketing' },
  { name: 'Data Analysis', slug: 'data-analysis' },
  // Aligned with mobile-app/assets/data/course_categories.json
  { name: 'AI cho công sở', slug: 'ai-office' },
  { name: 'Automation', slug: 'automation' },
  { name: 'Lập trình', slug: 'programming' },
  { name: 'Ngoại ngữ', slug: 'language' },
  { name: 'Kỹ năng mềm', slug: 'soft-skills' },
] as const;

const DEFAULT_POST_CATEGORIES = [
  { name: 'Kiến thức AI', slug: 'kien-thuc-ai' },
  { name: 'Tin tức', slug: 'tin-tuc' },
  { name: 'Hướng dẫn', slug: 'huong-dan' },
] as const;

const DEFAULT_GLOBAL_TAGS = [
  { name: 'AI', slug: 'ai' },
  { name: 'ChatGPT', slug: 'chatgpt' },
  { name: 'Gemini', slug: 'gemini' },
] as const;

const DEFAULT_COURSE_TAGS = [
  { name: 'n8n', slug: 'n8n' },
  { name: 'Prompt Engineering', slug: 'prompt-engineering' },
  { name: 'Automation', slug: 'automation' },
  { name: 'Workflow', slug: 'workflow' },
] as const;

const DEFAULT_POST_TAGS = [
  { name: 'Tutorial', slug: 'tutorial' },
  { name: 'News', slug: 'news' },
  { name: 'Case Study', slug: 'case-study' },
  { name: 'Machine Learning', slug: 'machine-learning' },
  { name: 'RAG', slug: 'rag' },
  { name: 'E-Learning', slug: 'e-learning' },
  { name: 'MLOps', slug: 'mlops' },
  { name: 'Computer Vision', slug: 'computer-vision' },
  { name: 'NLP', slug: 'nlp' },
  { name: 'Chatbot', slug: 'chatbot' },
] as const;

async function ensureDevCategories(): Promise<void> {
  const courseCount = await CategoryRepo.countByType('course');
  const postCount = await CategoryRepo.countByType('post');

  if (courseCount === 0) {
    for (const category of DEFAULT_COURSE_CATEGORIES) {
      await CategoryRepo.create({
        name: category.name,
        slug: category.slug,
        type: 'course',
      });
    }
    logger.info(
      `Dev bootstrap: seeded ${DEFAULT_COURSE_CATEGORIES.length} course categories`,
    );
  } else {
    // Backfill mobile-aligned categories if DB already had older seeds.
    let added = 0;
    for (const category of DEFAULT_COURSE_CATEGORIES) {
      const existing = await CategoryRepo.findByTypeAndSlug(
        'course',
        category.slug,
      );
      if (existing) continue;
      await CategoryRepo.create({
        name: category.name,
        slug: category.slug,
        type: 'course',
      });
      added += 1;
    }
    if (added > 0) {
      logger.info(`Dev bootstrap: added ${added} missing course categories`);
    }
  }

  if (postCount === 0) {
    for (const category of DEFAULT_POST_CATEGORIES) {
      await CategoryRepo.create({
        name: category.name,
        slug: category.slug,
        type: 'post',
      });
    }
    logger.info(
      `Dev bootstrap: seeded ${DEFAULT_POST_CATEGORIES.length} post categories`,
    );
  }
}

async function ensureDevTags(): Promise<void> {
  if ((await TagRepo.countByType('global')) === 0) {
    for (const tag of DEFAULT_GLOBAL_TAGS) {
      await TagRepo.create({ name: tag.name, slug: tag.slug, type: 'global' });
    }
  }

  if ((await TagRepo.countByType('course')) === 0) {
    for (const tag of DEFAULT_COURSE_TAGS) {
      await TagRepo.create({ name: tag.name, slug: tag.slug, type: 'course' });
    }
  }

  if ((await TagRepo.countByType('post')) === 0) {
    for (const tag of DEFAULT_POST_TAGS) {
      await TagRepo.create({ name: tag.name, slug: tag.slug, type: 'post' });
    }
    logger.info(`Dev bootstrap: seeded tags (post/global/course)`);
  }
}

async function assignTagsToPost(
  postId: string,
  tagSlugs: string[],
): Promise<void> {
  const tagIds: string[] = [];
  for (const slug of tagSlugs) {
    const rows = await TagRepo.findBySlugsForEntity([slug], 'post');
    if (rows[0]) {
      tagIds.push(rows[0].id);
    }
  }
  await PostTagRepo.syncForPost(postId, tagIds);
}

async function assignTagsToCourse(
  courseId: string,
  tagSlugs: string[],
): Promise<void> {
  const tagIds: string[] = [];
  for (const slug of tagSlugs) {
    const rows = await TagRepo.findBySlugsForEntity([slug], 'course');
    if (rows[0]) {
      tagIds.push(rows[0].id);
    }
  }
  await CourseTagRepo.syncForCourse(courseId, tagIds);
}

async function ensureDevPostTags(): Promise<void> {
  await ensureDevTags();
}

async function backfillPostTags(): Promise<number> {
  const tagSlugs = DEFAULT_POST_TAGS.map((tag) => tag.slug);
  let updated = 0;

  for (let index = 0; index < DEV_POST_FIXTURES.length; index += 1) {
    const fixture = DEV_POST_FIXTURES[index]!;
    const slug = slugify(fixture.title);
    const post = await PostRepo.findBySlug(slug);
    if (!post) {
      continue;
    }

    const existingTags = await PostTagRepo.findByPostIds([post.id]);
    if ((existingTags.get(post.id) ?? []).length > 0) {
      continue;
    }

    const assignedTags = [
      tagSlugs[index % tagSlugs.length]!,
      tagSlugs[(index + 3) % tagSlugs.length]!,
    ];
    await assignTagsToPost(post.id, assignedTags);
    updated += 1;
  }

  return updated;
}

type DevPostFixture = {
  title: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  visibility: PostVisibility;
  imageSeed: string;
};

const DEV_POST_FIXTURES: DevPostFixture[] = [
  {
    title: 'Hướng dẫn học AI cho người mới bắt đầu',
    excerpt: 'Lộ trình 30 ngày để làm quen machine learning và deep learning.',
    content:
      '<p>Bài viết giới thiệu các khái niệm nền tảng về AI, Python và mô hình neural network cơ bản.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-ai-beginner',
  },
  {
    title: 'Prompt engineering: Viết prompt hiệu quả cho ChatGPT',
    excerpt: 'Kỹ thuật viết prompt giúp tăng chất lượng câu trả lời từ LLM.',
    content:
      '<p>Tìm hiểu zero-shot, few-shot và chain-of-thought prompting trong thực tế.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-prompt-engineering',
  },
  {
    title: 'Xây dựng chatbot RAG cho doanh nghiệp',
    excerpt: 'Tích hợp vector database và LLM để trả lời tài liệu nội bộ.',
    content:
      '<p>Hướng dẫn pipeline RAG từ ingest PDF đến retrieval và generation.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-rag-chatbot',
  },
  {
    title: 'Fine-tuning LLM với dataset tiếng Việt',
    excerpt: 'Quy trình chuẩn bị dữ liệu và fine-tune mô hình open-source.',
    content: '<p>So sánh LoRA, QLoRA và full fine-tuning cho team nhỏ.</p>',
    status: 'published',
    visibility: 'members_only',
    imageSeed: 'gats-finetune-vi',
  },
  {
    title: 'Computer Vision trong kiểm tra chất lượng sản xuất',
    excerpt: 'Ứng dụng YOLO và segmentation trong nhà máy thông minh.',
    content: '<p>Case study triển khai vision AI trên dây chuyền sản xuất.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-computer-vision',
  },
  {
    title: 'MLOps cơ bản cho startup',
    excerpt: 'Version model, tracking experiment và deploy API inference.',
    content: '<p>Stack gợi ý: MLflow, Docker và CI/CD cho model serving.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-mlops-startup',
  },
  {
    title: 'Ethics & AI: Trách nhiệm khi triển khai AI',
    excerpt: 'Bias, privacy và governance trong hệ thống AI doanh nghiệp.',
    content: '<p>Khung đánh giá rủi ro trước khi đưa model vào production.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-ai-ethics',
  },
  {
    title: 'LangChain vs LlamaIndex: Chọn framework nào?',
    excerpt: 'So sánh hai framework phổ biến cho ứng dụng LLM.',
    content: '<p>Tiêu chí chọn tool theo quy mô team và loại dữ liệu.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-langchain-llamaindex',
  },
  {
    title: 'Vector database: Pinecone, Qdrant hay pgvector?',
    excerpt: 'Benchmark và trade-off khi chọn vector store.',
    content: '<p>Hướng dẫn chọn giải pháp phù hợp workload retrieval.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-vector-db',
  },
  {
    title: 'AI Agent: Từ concept đến prototype',
    excerpt: 'Thiết kế agent có tool calling và memory ngắn hạn.',
    content: '<p>Demo agent đặt lịch và truy vấn API nội bộ.</p>',
    status: 'published',
    visibility: 'members_only',
    imageSeed: 'gats-ai-agent',
  },
  {
    title: 'Học Deep Learning với PyTorch',
    excerpt: 'Notebook thực hành CNN, RNN và Transformer.',
    content: '<p>Lộ trình bài tập từ MNIST đến fine-tune BERT.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-pytorch-dl',
  },
  {
    title: 'Generative AI cho marketing content',
    excerpt: 'Tự động hóa blog, social post và email campaign.',
    content: '<p>Workflow human-in-the-loop để kiểm soát brand voice.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-genai-marketing',
  },
  {
    title: 'Speech-to-text tiếng Việt với Whisper',
    excerpt: 'Transcribe audio meeting và podcast chất lượng cao.',
    content: '<p>Tối ưu latency và chi phí khi xử lý batch lớn.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-whisper-vi',
  },
  {
    title: 'Data labeling: Chiến lược gán nhãn hiệu quả',
    excerpt: 'Active learning và quality control cho dataset ML.',
    content: '<p>Giảm chi phí labeling mà vẫn giữ chất lượng model.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-data-labeling',
  },
  {
    title: 'Deploy LLM on-premise cho enterprise',
    excerpt: 'Chạy Llama 3 local với GPU và bảo mật dữ liệu.',
    content: '<p>Checklist hạ tầng, quantization và monitoring.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-llm-onprem',
  },
  {
    title: 'Time series forecasting với AI',
    excerpt: 'Dự báo doanh thu và demand planning bằng ML.',
    content:
      '<p>So sánh ARIMA, Prophet và deep learning cho chuỗi thời gian.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-time-series',
  },
  {
    title: 'Graph neural network cho recommendation',
    excerpt: 'Mô hình gợi ý khóa học dựa trên hành vi học viên.',
    content:
      '<p>Xây graph user-course và train GNN cho e-learning platform.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-gnn-recommend',
  },
  {
    title: 'AI trong e-learning: Cá nhân hóa lộ trình học',
    excerpt: 'Adaptive learning path theo năng lực từng học viên.',
    content:
      '<p>Kiến trúc gợi ý bài học tiếp theo dựa trên progress và quiz score.</p>',
    status: 'published',
    visibility: 'public',
    imageSeed: 'gats-elearning-ai',
  },
  {
    title: 'Bản nháp: Xu hướng AI 2026',
    excerpt: 'Tổng hợp xu hướng multimodal và edge AI (chưa publish).',
    content: '<p>Bài viết đang soạn thảo, dùng để test trạng thái draft.</p>',
    status: 'draft',
    visibility: 'public',
    imageSeed: 'gats-ai-trends-draft',
  },
  {
    title: 'Lưu trữ: Triển khai chatbot cũ trên GPT-3.5',
    excerpt: 'Bài viết archive để test filter status.',
    content: '<p>Nội dung lưu trữ, không hiển thị trên public list.</p>',
    status: 'archived',
    visibility: 'public',
    imageSeed: 'gats-archived-chatbot',
  },
];

function thumbnailUrl(imageSeed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(imageSeed)}/800/450`;
}

type DevCourseFixture = {
  title: string;
  description: string;
  categorySlug: (typeof DEFAULT_COURSE_CATEGORIES)[number]['slug'];
  level: CourseLevel;
  price: number;
  salePrice?: number;
  status: CourseStatus;
  imageSeed: string;
  /** Absolute or path thumbnail (preferred for local admin assets) */
  thumbnail?: string;
  /** Optional tag slug(s) from mobile catalog */
  tagSlugs?: string[];
  lessonCount?: number;
  durationMinutes?: number;
};

const LOCAL_COURSE_THUMBS = [
  '/images/courses/thumb-a.jpg',
  '/images/courses/thumb-b.jpg',
  '/images/courses/thumb-c.jpg',
] as const;

/** Mirrors mobile-app/assets/data/courses.json */
const MOBILE_COURSE_FIXTURES: DevCourseFixture[] = [
  {
    title: 'AI cho Dân văn phòng',
    description: 'Từ zero đến thành thạo AI trong công việc hàng ngày',
    categorySlug: 'ai-office',
    level: 'beginner',
    price: 299_000,
    salePrice: 199_000,
    status: 'published',
    imageSeed: 'gats-mobile-ai-office',
    thumbnail: LOCAL_COURSE_THUMBS[0],
    tagSlugs: ['ai', 'prompt-engineering'],
    lessonCount: 24,
    durationMinutes: 480,
  },
  {
    title: 'Prompt Engineering',
    description: 'Viết prompt chuyên nghiệp cho mọi tình huống',
    categorySlug: 'ai-office',
    level: 'intermediate',
    price: 0,
    status: 'published',
    imageSeed: 'gats-mobile-prompt',
    thumbnail: LOCAL_COURSE_THUMBS[1],
    tagSlugs: ['prompt-engineering', 'ai'],
    lessonCount: 18,
    durationMinutes: 360,
  },
  {
    title: 'Tự động hóa với AI',
    description: 'Workflow và agent cho team nhỏ',
    categorySlug: 'automation',
    level: 'intermediate',
    price: 499_000,
    salePrice: 399_000,
    status: 'published',
    imageSeed: 'gats-mobile-automation',
    thumbnail: LOCAL_COURSE_THUMBS[2],
    tagSlugs: ['automation', 'n8n', 'workflow'],
    lessonCount: 12,
    durationMinutes: 240,
  },
  {
    title: 'Nhập môn Lập trình Flutter',
    description: 'Tạo ứng dụng di động đa nền tảng nhanh chóng',
    categorySlug: 'programming',
    level: 'beginner',
    price: 899_000,
    status: 'published',
    imageSeed: 'gats-mobile-flutter',
    thumbnail: LOCAL_COURSE_THUMBS[0],
    tagSlugs: ['ai'],
    lessonCount: 40,
    durationMinutes: 1200,
  },
  {
    title: 'Digital Marketing Thực chiến',
    description: 'Tối ưu quảng cáo và tăng tỷ lệ chuyển đổi',
    categorySlug: 'marketing',
    level: 'beginner',
    price: 0,
    status: 'published',
    imageSeed: 'gats-mobile-marketing',
    thumbnail: LOCAL_COURSE_THUMBS[1],
    tagSlugs: ['ai'],
    lessonCount: 20,
    durationMinutes: 600,
  },
  {
    title: 'Tiếng Anh Giao tiếp cơ bản',
    description: 'Tự tin giao tiếp tiếng Anh trong 30 ngày',
    categorySlug: 'language',
    level: 'beginner',
    price: 149_000,
    salePrice: 99_000,
    status: 'published',
    imageSeed: 'gats-mobile-english',
    thumbnail: LOCAL_COURSE_THUMBS[2],
    tagSlugs: ['ai'],
    lessonCount: 30,
    durationMinutes: 900,
  },
  {
    title: 'Kỹ năng thuyết trình trước đám đông',
    description: 'Nói trước đám đông không còn là nỗi sợ',
    categorySlug: 'soft-skills',
    level: 'beginner',
    price: 0,
    status: 'published',
    imageSeed: 'gats-mobile-presentation',
    thumbnail: LOCAL_COURSE_THUMBS[0],
    tagSlugs: ['ai'],
    lessonCount: 15,
    durationMinutes: 450,
  },
];

const DEV_COURSE_FIXTURES: DevCourseFixture[] = [
  ...MOBILE_COURSE_FIXTURES,
  {
    title: 'Python cho Data Science từ con số 0',
    description:
      'Khóa học nền tảng Python, NumPy, Pandas và trực quan hóa dữ liệu cho người mới bắt đầu.',
    categorySlug: 'course',
    level: 'beginner',
    price: 1_599_000,
    salePrice: 1_165_000,
    status: 'published',
    imageSeed: 'gats-course-python-ds',
  },
  {
    title: 'Machine Learning cơ bản cho doanh nghiệp',
    description:
      'Hiểu regression, classification và quy trình triển khai model ML trong môi trường thực tế.',
    categorySlug: 'course',
    level: 'beginner',
    price: 2_490_000,
    salePrice: 1_990_000,
    status: 'published',
    imageSeed: 'gats-course-ml-basic',
  },
  {
    title: 'Deep Learning với PyTorch',
    description:
      'Xây dựng CNN, RNN và Transformer từ lý thuyết đến bài tập thực hành end-to-end.',
    categorySlug: 'course',
    level: 'intermediate',
    price: 3_290_000,
    salePrice: 2_690_000,
    status: 'published',
    imageSeed: 'gats-course-pytorch',
  },
  {
    title: 'NLP tiếng Việt nâng cao',
    description:
      'Fine-tune BERT/PhoBERT, sentiment analysis và named entity recognition cho tiếng Việt.',
    categorySlug: 'course',
    level: 'advanced',
    price: 4_500_000,
    salePrice: 3_800_000,
    status: 'published',
    imageSeed: 'gats-course-nlp-vi',
  },
  {
    title: 'Mẫu báo cáo tài chính Excel chuyên nghiệp',
    description:
      'Bộ template báo cáo P&L, cash flow và dashboard tài chính sẵn công thức.',
    categorySlug: 'template',
    level: 'beginner',
    price: 590_000,
    salePrice: 390_000,
    status: 'published',
    imageSeed: 'gats-template-finance',
  },
  {
    title: 'Dashboard Power BI cho phòng Marketing',
    description:
      'Mẫu báo cáo KPI campaign, funnel conversion và cohort analysis trên Power BI.',
    categorySlug: 'template',
    level: 'intermediate',
    price: 790_000,
    salePrice: 590_000,
    status: 'published',
    imageSeed: 'gats-template-powerbi',
  },
  {
    title: 'Bootcamp Fullstack AI Engineer 12 tuần',
    description:
      'Chương trình intensive: Python, ML, LLM, MLOps và deploy production API.',
    categorySlug: 'bootcamp',
    level: 'intermediate',
    price: 18_900_000,
    salePrice: 15_900_000,
    status: 'published',
    imageSeed: 'gats-bootcamp-fullstack-ai',
  },
  {
    title: 'Bootcamp LLM Application Developer',
    description:
      'Xây dựng ứng dụng RAG, agent và chatbot enterprise với open-source LLM.',
    categorySlug: 'bootcamp',
    level: 'advanced',
    price: 22_500_000,
    salePrice: 19_500_000,
    status: 'published',
    imageSeed: 'gats-bootcamp-llm-app',
  },
  {
    title: 'RAG cho doanh nghiệp: Từ PDF đến chatbot',
    description:
      'Pipeline ingest tài liệu, embedding, retrieval và guardrails cho chatbot nội bộ.',
    categorySlug: 'course',
    level: 'intermediate',
    price: 2_990_000,
    salePrice: 2_490_000,
    status: 'published',
    imageSeed: 'gats-course-rag',
  },
  {
    title: 'Computer Vision với YOLO & Segmentation',
    description:
      'Phát hiện đối tượng, phân đoạn ảnh và triển khai model real-time trên edge device.',
    categorySlug: 'course',
    level: 'advanced',
    price: 3_990_000,
    salePrice: 3_290_000,
    status: 'published',
    imageSeed: 'gats-course-computer-vision',
  },
];

async function seedDevCourses(instructorId?: number): Promise<number> {
  let created = 0;

  for (const fixture of DEV_COURSE_FIXTURES) {
    const slug = slugify(fixture.title);
    const exists = await CourseRepo.slugExists(slug);
    if (exists) {
      continue;
    }

    const category = await CategoryRepo.findByTypeAndSlug(
      'course',
      fixture.categorySlug,
    );
    if (!category) {
      logger.warn(
        `Dev bootstrap: skip course "${fixture.title}" – category "${fixture.categorySlug}" not found`,
      );
      continue;
    }

    const course = await CourseRepo.create({
      title: fixture.title,
      slug,
      description: fixture.description,
      thumbnail: fixture.thumbnail ?? thumbnailUrl(fixture.imageSeed),
      introVideo: null,
      price: fixture.price,
      salePrice: fixture.salePrice ?? null,
      level: fixture.level,
      status: fixture.status,
      instructorId: instructorId ?? null,
      categoryId: category.id,
      publishedAt: fixture.status === 'published' ? new Date() : null,
    });
    await assignTagsToCourse(
      course.id,
      fixture.tagSlugs ?? ['ai', 'prompt-engineering'],
    );

    // Lightweight curriculum placeholder so admin catalog has lesson counts.
    if (fixture.lessonCount && fixture.lessonCount > 0) {
      const section = await CourseSectionRepo.create({
        courseId: course.id,
        title: 'Nội dung khóa học',
        order: 0,
      });
      const lessonTotal = Math.min(fixture.lessonCount, 8);
      const durationEach = fixture.durationMinutes
        ? Math.round((fixture.durationMinutes * 60) / fixture.lessonCount)
        : 600;
      for (let i = 0; i < lessonTotal; i += 1) {
        await LessonRepo.create({
          courseId: course.id,
          sectionId: section.id,
          title: `Bài ${i + 1}`,
          type: 'video',
          order: i,
          duration: durationEach,
          isPreview: i === 0,
        });
      }
    }

    created += 1;
  }

  return created;
}

async function backfillCourseTags(): Promise<number> {
  const courses = await CourseRepo.findMany({
    skip: 0,
    take: 100,
  });
  let updated = 0;

  for (const course of courses.data) {
    const tagMap = await CourseTagRepo.findByCourseIds([course.id]);
    if ((tagMap.get(course.id) ?? []).length > 0) {
      continue;
    }
    await assignTagsToCourse(course.id, ['ai', 'prompt-engineering']);
    updated += 1;
  }

  return updated;
}

async function backfillPostCategories(): Promise<number> {
  const postCategorySlugs = DEFAULT_POST_CATEGORIES.map((c) => c.slug);
  let updated = 0;

  for (let index = 0; index < DEV_POST_FIXTURES.length; index += 1) {
    const fixture = DEV_POST_FIXTURES[index]!;
    const post = await PostRepo.findBySlug(slugify(fixture.title));
    if (!post || post.categoryId) {
      continue;
    }
    const category = await CategoryRepo.findByTypeAndSlug(
      'post',
      postCategorySlugs[index % postCategorySlugs.length]!,
    );
    if (!category) {
      continue;
    }
    await PostRepo.update(post.id, { categoryId: category.id });
    updated += 1;
  }

  return updated;
}

async function backfillMobileCourseMedia(): Promise<number> {
  let updated = 0;
  for (const fixture of MOBILE_COURSE_FIXTURES) {
    if (!fixture.thumbnail && fixture.salePrice == null) continue;
    const slug = slugify(fixture.title);
    const course = await CourseRepo.findBySlug(slug);
    if (!course) continue;

    const needsThumb =
      !!fixture.thumbnail &&
      (!course.thumbnail ||
        course.thumbnail.includes('picsum.photos') ||
        course.thumbnail.includes('localhost:9000'));
    const needsSale =
      fixture.salePrice != null && course.salePrice !== fixture.salePrice;

    if (!needsThumb && !needsSale) continue;

    await CourseRepo.update(course.id, {
      ...(needsThumb ? { thumbnail: fixture.thumbnail } : {}),
      ...(needsSale ? { salePrice: fixture.salePrice ?? null } : {}),
      ...(fixture.price !== course.price ? { price: fixture.price } : {}),
    });
    updated += 1;
  }
  return updated;
}

async function ensureDevCourses(instructorId?: number): Promise<void> {
  // Always attempt seed — seedDevCourses skips titles that already exist by slug.
  const created = await seedDevCourses(instructorId);
  if (created > 0) {
    logger.info(`Dev bootstrap: seeded ${created} sample courses`);
  }
  const mediaUpdated = await backfillMobileCourseMedia();
  if (mediaUpdated > 0) {
    logger.info(
      `Dev bootstrap: backfilled thumbnails/sale for ${mediaUpdated} mobile courses`,
    );
  }
}

async function seedDevPosts(authorId: number): Promise<number> {
  await ensureDevTags();
  const tagSlugs = DEFAULT_POST_TAGS.map((tag) => tag.slug);
  const postCategorySlugs = DEFAULT_POST_CATEGORIES.map((c) => c.slug);
  let created = 0;

  for (let index = 0; index < DEV_POST_FIXTURES.length; index += 1) {
    const fixture = DEV_POST_FIXTURES[index]!;
    const slug = slugify(fixture.title);
    const exists = await PostRepo.slugExists(slug);
    if (exists) {
      continue;
    }

    const postCategory = await CategoryRepo.findByTypeAndSlug(
      'post',
      postCategorySlugs[index % postCategorySlugs.length]!,
    );

    const post = await PostRepo.create({
      authorId,
      title: fixture.title,
      slug,
      excerpt: fixture.excerpt,
      content: fixture.content,
      thumbnail: thumbnailUrl(fixture.imageSeed),
      status: fixture.status,
      visibility: fixture.visibility,
      categoryId: postCategory?.id ?? null,
      publishedAt: fixture.status === 'published' ? new Date() : null,
    });

    await assignTagsToPost(post.id, [
      tagSlugs[index % tagSlugs.length]!,
      tagSlugs[(index + 3) % tagSlugs.length]!,
    ]);
    created += 1;
  }

  return created;
}

async function createDefaultAdmin(
  email: string,
  password: string,
): Promise<number> {
  const passwordHash = await hashPassword(password);

  const user = await UserRepo.create({
    userName: 'admin',
    email,
    passwordHash,
    verified: true,
    verifyToken: null,
    type: 'default',
  });

  const adminRole = await RoleRepo.findByName('admin');
  if (!adminRole) {
    throw new Error('Admin role not found after seeding');
  }

  await RoleRepo.assignRoleToUser(user.id, adminRole.id);
  return user.id;
}

type RagLessonFixture = {
  order: number;
  title: string;
  type: LessonRecord['type'];
  duration: number;
  isPreview: boolean;
  description: string;
};

type RagSectionFixture = {
  order: number;
  title: string;
  lessons: RagLessonFixture[];
};

const RAG_LEARNING_OUTCOMES = [
  'Hiểu kiến trúc RAG end-to-end',
  'Ingest và xử lý tài liệu PDF',
  'Chunking và tạo embedding',
  'Lưu trữ, tìm kiếm bằng vector database',
  'Xây dựng retrieval pipeline',
  'Đánh giá, guardrails và triển khai chatbot nội bộ',
] as const;

const RAG_INCLUDES = [
  {
    key: 'Monitor',
    label: 'Video theo yêu cầu',
    value: '24',
    unit: 'hour',
  },
  {
    key: 'Download',
    label: 'Tài liệu tải về',
    value: '12',
    unit: 'resource',
  },
  {
    key: 'FileText',
    label: 'Bài viết',
    value: '8',
    unit: 'article',
  },
  {
    key: 'Smartphone',
    label: 'Truy cập trên mobile & TV',
    value: null,
    unit: null,
  },
  {
    key: 'Trophy',
    label: 'Chứng chỉ hoàn thành',
    value: null,
    unit: null,
  },
] as const;

const RAG_SECTIONS: RagSectionFixture[] = [
  {
    order: 0,
    title: 'Introduction',
    lessons: [
      {
        order: 0,
        title: 'Giới thiệu khóa học',
        type: 'video',
        duration: 180,
        isPreview: true,
        description: 'Tổng quan mục tiêu và lộ trình học RAG cho doanh nghiệp.',
      },
      {
        order: 1,
        title: 'Giới thiệu giảng viên',
        type: 'video',
        duration: 54,
        isPreview: true,
        description: 'Làm quen với giảng viên và kinh nghiệm triển khai RAG.',
      },
      {
        order: 2,
        title: 'Tổng quan kiến trúc RAG',
        type: 'video',
        duration: 420,
        isPreview: true,
        description:
          'Các thành phần ingest, retrieval, generation và guardrails.',
      },
      {
        order: 3,
        title: 'Công cụ và stack công nghệ',
        type: 'text',
        duration: 300,
        isPreview: false,
        description:
          'Python, vector DB, LLM API và các thư viện sẽ dùng trong khóa.',
      },
    ],
  },
  {
    order: 1,
    title: 'Chuẩn bị môi trường và dữ liệu',
    lessons: [
      {
        order: 0,
        title: 'Cài đặt môi trường Python',
        type: 'video',
        duration: 360,
        isPreview: false,
        description: 'Thiết lập virtualenv, dependencies và cấu trúc project.',
      },
      {
        order: 1,
        title: 'Thu thập và làm sạch tài liệu nội bộ',
        type: 'video',
        duration: 480,
        isPreview: false,
        description:
          'Quy trình chuẩn hóa PDF, metadata và phân quyền truy cập.',
      },
      {
        order: 2,
        title: 'Đánh giá chất lượng corpus',
        type: 'text',
        duration: 240,
        isPreview: false,
        description:
          'Checklist đánh giá độ phủ và chất lượng dữ liệu trước ingest.',
      },
    ],
  },
  {
    order: 2,
    title: 'Ingest PDF và chunking',
    lessons: [
      {
        order: 0,
        title: 'Parse PDF và trích xuất text',
        type: 'video',
        duration: 540,
        isPreview: false,
        description: 'Xử lý layout, bảng biểu và OCR khi cần.',
      },
      {
        order: 1,
        title: 'Chiến lược chunking',
        type: 'video',
        duration: 600,
        isPreview: false,
        description:
          'Fixed-size, semantic và hybrid chunking cho tài liệu doanh nghiệp.',
      },
      {
        order: 2,
        title: 'Metadata và tagging chunk',
        type: 'text',
        duration: 300,
        isPreview: false,
        description: 'Gắn metadata nguồn, phòng ban và phiên bản tài liệu.',
      },
      {
        order: 3,
        title: 'Lab: Pipeline ingest PDF',
        type: 'assignment',
        duration: 900,
        isPreview: false,
        description: 'Thực hành ingest bộ PDF mẫu và kiểm tra output.',
      },
    ],
  },
  {
    order: 3,
    title: 'Embedding và vector database',
    lessons: [
      {
        order: 0,
        title: 'Chọn embedding model',
        type: 'video',
        duration: 420,
        isPreview: false,
        description: 'So sánh open-source và API embedding cho tiếng Việt.',
      },
      {
        order: 1,
        title: 'Lưu trữ vector và indexing',
        type: 'video',
        duration: 540,
        isPreview: false,
        description: 'Thiết kế schema collection và chiến lược index.',
      },
      {
        order: 2,
        title: 'Similarity search và filtering',
        type: 'video',
        duration: 480,
        isPreview: false,
        description: 'Top-k retrieval, hybrid search và metadata filter.',
      },
      {
        order: 3,
        title: 'Quiz: Vector database',
        type: 'quiz',
        duration: 600,
        isPreview: false,
        description: 'Kiểm tra hiểu biết về embedding và vector search.',
      },
    ],
  },
  {
    order: 4,
    title: 'Xây dựng chatbot RAG',
    lessons: [
      {
        order: 0,
        title: 'Thiết kế retrieval pipeline',
        type: 'video',
        duration: 540,
        isPreview: false,
        description: 'Query rewrite, reranking và context assembly.',
      },
      {
        order: 1,
        title: 'Prompt template cho enterprise Q&A',
        type: 'video',
        duration: 480,
        isPreview: false,
        description: 'System prompt, citation và format câu trả lời.',
      },
      {
        order: 2,
        title: 'Tích hợp LLM API',
        type: 'video',
        duration: 420,
        isPreview: false,
        description: 'Streaming response, timeout và fallback.',
      },
      {
        order: 3,
        title: 'Lab: Chatbot RAG end-to-end',
        type: 'assignment',
        duration: 1200,
        isPreview: false,
        description:
          'Ghép ingest, retrieval và generation thành chatbot hoàn chỉnh.',
      },
      {
        order: 4,
        title: 'API endpoint và session handling',
        type: 'text',
        duration: 360,
        isPreview: false,
        description: 'Thiết kế REST API và quản lý hội thoại.',
      },
    ],
  },
  {
    order: 5,
    title: 'Evaluation, guardrails và deployment',
    lessons: [
      {
        order: 0,
        title: 'Đánh giá chất lượng RAG',
        type: 'video',
        duration: 480,
        isPreview: false,
        description: 'Faithfulness, relevance và benchmark nội bộ.',
      },
      {
        order: 1,
        title: 'Guardrails và safety',
        type: 'video',
        duration: 420,
        isPreview: false,
        description: 'Lọc prompt injection, PII và hallucination.',
      },
      {
        order: 2,
        title: 'Triển khai production',
        type: 'video',
        duration: 540,
        isPreview: false,
        description: 'Docker, monitoring và scaling pipeline RAG.',
      },
      {
        order: 3,
        title: 'Checklist go-live',
        type: 'text',
        duration: 300,
        isPreview: false,
        description: 'Các bước kiểm tra trước khi đưa chatbot vào sử dụng.',
      },
    ],
  },
];

const RAG_DEMO_STUDENTS = [
  { userName: 'rag-learner-1', email: 'rag-learner-1@gats.dev' },
  { userName: 'rag-learner-2', email: 'rag-learner-2@gats.dev' },
  { userName: 'rag-learner-3', email: 'rag-learner-3@gats.dev' },
  { userName: 'rag-learner-4', email: 'rag-learner-4@gats.dev' },
] as const;

const RAG_REVIEW_RATINGS = [5, 5, 4, 5, 4] as const;

async function ensureDemoStudent(
  userName: string,
  email: string,
): Promise<number> {
  const existing = await UserRepo.findByEmail(email);
  if (existing) {
    return existing.id;
  }

  const user = await UserRepo.create({
    userName,
    email,
    verified: true,
    type: 'default',
  });
  return user.id;
}

async function ensureRagCourse(instructorId?: number) {
  const existing = await CourseRepo.findBySlug(RAG_COURSE_SLUG);
  if (existing) {
    if (!existing.instructorId && instructorId) {
      await CourseRepo.update(existing.id, { instructorId });
    }
    return existing;
  }

  const fixture = DEV_COURSE_FIXTURES.find(
    (item) => slugify(item.title) === RAG_COURSE_SLUG,
  );
  if (!fixture) {
    throw new Error('RAG course fixture not found');
  }

  const category = await CategoryRepo.findByTypeAndSlug(
    'course',
    fixture.categorySlug,
  );
  if (!category) {
    throw new Error(
      `Category "${fixture.categorySlug}" not found for RAG course`,
    );
  }

  const course = await CourseRepo.create({
    title: fixture.title,
    slug: RAG_COURSE_SLUG,
    description: fixture.description,
    thumbnail: thumbnailUrl(fixture.imageSeed),
    introVideo: null,
    price: fixture.price,
    salePrice: fixture.salePrice ?? null,
    level: fixture.level,
    status: fixture.status,
    instructorId: instructorId ?? null,
    categoryId: category.id,
    publishedAt: fixture.status === 'published' ? new Date() : null,
  });
  await assignTagsToCourse(course.id, ['ai', 'prompt-engineering']);
  return course;
}

async function ensureInstructorDisplayName(
  instructorId: number,
): Promise<void> {
  const instructor = await UserRepo.findById(instructorId);
  if (!instructor) {
    return;
  }
  if (instructor.userName === 'AI Coding') {
    return;
  }
  const existing = await UserRepo.findByUserName('AI Coding');
  if (existing && existing.id !== instructorId) {
    return;
  }
  await UserRepo.update(instructorId, { userName: 'AI Coding' });
}

export async function backfillRagCourseDetail(
  instructorId?: number,
): Promise<void> {
  const course = await ensureRagCourse(instructorId);
  const effectiveInstructorId = course.instructorId ?? instructorId;

  if (effectiveInstructorId) {
    await ensureInstructorDisplayName(effectiveInstructorId);
    if (!course.instructorId) {
      await CourseRepo.update(course.id, {
        instructorId: effectiveInstructorId,
      });
    }
  }

  await db.transaction(async () => {
    for (let index = 0; index < RAG_LEARNING_OUTCOMES.length; index += 1) {
      const existing = await CourseLearningOutcomeRepo.findByCourseAndOrder(
        course.id,
        index,
      );
      if (!existing) {
        await CourseLearningOutcomeRepo.create({
          courseId: course.id,
          content: RAG_LEARNING_OUTCOMES[index]!,
          order: index,
        });
      }
    }

    for (let index = 0; index < RAG_INCLUDES.length; index += 1) {
      const include = RAG_INCLUDES[index]!;
      const existing = await CourseIncludeRepo.findByCourseAndOrder(
        course.id,
        index,
      );
      if (!existing) {
        await CourseIncludeRepo.create({
          courseId: course.id,
          key: include.key,
          label: include.label,
          value: include.value,
          unit: include.unit,
          order: index,
        });
      } else if (
        existing.key !== include.key ||
        existing.label !== include.label ||
        existing.value !== include.value ||
        existing.unit !== include.unit
      ) {
        await CourseIncludeRepo.update(existing.id, {
          key: include.key,
          label: include.label,
          value: include.value,
          unit: include.unit,
        });
      }
    }

    for (const sectionFixture of RAG_SECTIONS) {
      let section = await CourseSectionRepo.findByCourseAndOrder(
        course.id,
        sectionFixture.order,
      );
      if (!section) {
        section = await CourseSectionRepo.create({
          courseId: course.id,
          title: sectionFixture.title,
          order: sectionFixture.order,
        });
      }

      for (const lessonFixture of sectionFixture.lessons) {
        const existingLesson = await LessonRepo.findBySectionAndOrder(
          section.id,
          lessonFixture.order,
        );
        if (!existingLesson) {
          await LessonRepo.create({
            courseId: course.id,
            sectionId: section.id,
            title: lessonFixture.title,
            description: lessonFixture.description,
            type: lessonFixture.type,
            order: lessonFixture.order,
            isPreview: lessonFixture.isPreview,
            duration: lessonFixture.duration,
          });
        }
      }
    }

    const enrolledUserIds: number[] = [];
    for (const student of RAG_DEMO_STUDENTS) {
      const userId = await ensureDemoStudent(student.userName, student.email);
      enrolledUserIds.push(userId);
      await EnrollmentRepo.upsert({
        userId,
        courseId: course.id,
        source: 'admin_granted',
        status: 'active',
        expiredAt: null,
      });
    }

    const reviewContents = [
      'Khóa học rất thực tế, pipeline RAG rõ ràng từng bước.',
      'Phần chunking và vector DB giải thích dễ hiểu.',
      'Lab chatbot giúp mình triển khai nhanh cho team nội bộ.',
      'Nội dung guardrails và deployment rất hữu ích.',
      'Giảng viên trình bày mạch lạc, ví dụ sát doanh nghiệp.',
    ];

    for (let index = 0; index < RAG_REVIEW_RATINGS.length; index += 1) {
      const userId = enrolledUserIds[index % enrolledUserIds.length]!;
      const existingReview = await CourseReviewRepo.findByCourseAndUser(
        course.id,
        userId,
      );
      if (!existingReview) {
        await CourseReviewRepo.upsert({
          courseId: course.id,
          userId,
          rating: RAG_REVIEW_RATINGS[index]!,
          content: reviewContents[index] ?? null,
        });
      }
    }
  });

  await ensureQuizAndAssignmentSeed(course.id);

  logger.info(
    `Dev bootstrap: backfilled RAG course detail (${RAG_COURSE_SLUG})`,
  );
}

async function ensureQuizAndAssignmentSeed(courseId: string): Promise<void> {
  const lessons = await LessonRepo.listByCourse(courseId);

  for (const lesson of lessons) {
    if (lesson.type === 'quiz' && lesson.title.includes('Vector database')) {
      const existingQuiz = await QuizRepo.findByLessonId(lesson.id);
      if (!existingQuiz) {
        const quiz = await QuizRepo.create({
          lessonId: lesson.id,
          title: lesson.title,
          description: lesson.description,
          passingScore: 70,
          timeLimit: 15,
          maxAttempts: 3,
          shuffleQuestions: true,
          shuffleOptions: true,
        });
        await LessonRepo.update(lesson.id, {
          content:
            '<p>Bài kiểm tra ngắn về embedding và vector search. Đọc kỹ câu hỏi trước khi nộp bài.</p>',
        });

        await QuizQuestionRepo.createQuestion({
          quizId: quiz.id,
          type: 'single_choice',
          question: 'Vector database dùng để làm gì?',
          points: 1,
          order: 0,
          explanation: 'Vector database lưu trữ và tìm kiếm dữ liệu vector.',
        }).then(async (q) => {
          await QuizQuestionRepo.createOptions(q.id, [
            {
              content: 'Lưu trữ và tìm kiếm vector',
              isCorrect: true,
              order: 0,
            },
            { content: 'Chỉ lưu file hình ảnh', isCorrect: false, order: 1 },
            { content: 'Thay thế hoàn toàn LLM', isCorrect: false, order: 2 },
            { content: 'Chỉ dùng để gửi email', isCorrect: false, order: 3 },
          ]);
        });

        await QuizQuestionRepo.createQuestion({
          quizId: quiz.id,
          type: 'single_choice',
          question: 'Embedding biểu diễn ngữ nghĩa của văn bản như thế nào?',
          points: 1,
          order: 1,
          explanation:
            'Embedding chuyển văn bản thành vector để có thể so sánh ngữ nghĩa.',
        }).then(async (q) => {
          await QuizQuestionRepo.createOptions(q.id, [
            { content: 'Dưới dạng vector', isCorrect: true, order: 0 },
            { content: 'Dưới dạng file ảnh', isCorrect: false, order: 1 },
            { content: 'Dưới dạng mật khẩu', isCorrect: false, order: 2 },
            { content: 'Dưới dạng email', isCorrect: false, order: 3 },
          ]);
        });

        await QuizQuestionRepo.createQuestion({
          quizId: quiz.id,
          type: 'fill_blank',
          question: 'RAG là viết tắt của cụm từ nào?',
          points: 1,
          order: 2,
        }).then(async (q) => {
          await QuizQuestionRepo.createAcceptedAnswers(q.id, [
            { content: 'Retrieval-Augmented Generation' },
            { content: 'retrieval augmented generation' },
          ]);
        });
      }
    }

    if (lesson.type === 'assignment') {
      const existingAssignment = await AssignmentRepo.findByLessonId(lesson.id);
      if (!existingAssignment) {
        await AssignmentRepo.create({
          lessonId: lesson.id,
          title: lesson.title,
          dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          maxScore: 100,
          maxFileSizeMb: 25,
          allowedSubmissionTypes: JSON.stringify(['text', 'url', 'file']),
          maxSubmissions: 2,
          passingScore: 70,
        });
        await LessonRepo.update(lesson.id, {
          content: `<p>${lesson.description ?? 'Hoàn thành bài lab theo hướng dẫn.'}</p>`,
        });
      }
    }
  }
}

export async function runDevBootstrapIfNeeded(): Promise<void> {
  if (EnvVars.NodeEnv !== NodeEnvs.DEV) {
    return;
  }

  await ensureDevCategories();

  if (!EnvVars.AdminDefaultEmail || !EnvVars.AdminDefaultPassword) {
    await ensureDevCourses();
    await backfillRagCourseDetail();
    logger.warn(
      'Dev bootstrap skipped: ADMIN_DEFAULT_EMAIL or ADMIN_DEFAULT_PASSWORD not set',
    );
    return;
  }

  const adminEmail = EnvVars.AdminDefaultEmail;
  const adminPassword = EnvVars.AdminDefaultPassword;

  const existingAdmin = await UserRepo.findByEmail(adminEmail);
  if (existingAdmin) {
    await ensureDevPostTags();
    await ensureDevCategories();
    const tagged = await backfillPostTags();
    const courseTagged = await backfillCourseTags();
    const categorized = await backfillPostCategories();
    if (tagged > 0) {
      logger.info(`Dev bootstrap: backfilled tags for ${tagged} posts`);
    }
    if (courseTagged > 0) {
      logger.info(`Dev bootstrap: backfilled tags for ${courseTagged} courses`);
    }
    if (categorized > 0) {
      logger.info(
        `Dev bootstrap: backfilled categories for ${categorized} posts`,
      );
    }
    await ensureDevCourses(existingAdmin.id);
    await backfillRagCourseDetail(existingAdmin.id);

    const { default: BankAccountService } = await import(
      '@src/services/BankAccountService'
    );
    const seededBank = await BankAccountService.seedFromEnvIfEmpty();
    if (seededBank) {
      logger.info(
        `Dev bootstrap: seeded default bank account ${seededBank.accountNumber}`,
      );
    }

    logger.info('Dev bootstrap skipped: admin user already exists');
    return;
  }

  logger.info('Dev bootstrap: seeding admin, permissions and sample data...');

  await seedPermissions();
  const adminId = await createDefaultAdmin(adminEmail, adminPassword);
  const [postsCreated, coursesCreated] = await Promise.all([
    seedDevPosts(adminId),
    seedDevCourses(adminId),
  ]);
  await backfillRagCourseDetail(adminId);

  const { default: BankAccountService } = await import(
    '@src/services/BankAccountService'
  );
  const seededBank = await BankAccountService.seedFromEnvIfEmpty();
  if (seededBank) {
    logger.info(
      `Dev bootstrap: seeded default bank account ${seededBank.accountNumber}`,
    );
  }

  logger.info(
    `Dev bootstrap complete: admin=${adminEmail}, posts=${postsCreated}, courses=${coursesCreated}`,
  );
}

export default {
  runDevBootstrapIfNeeded,
  backfillRagCourseDetail,
  RAG_COURSE_SLUG,
};
