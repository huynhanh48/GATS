export type AuthType = "facebook" | "apple" | "google" | "default";

export type UserPublic = {
  id: number;
  userName: string;
  verified: boolean;
  email: string;
  type: AuthType;
  roles: string[];
};

export type MeResponse = {
  user: UserPublic;
};

export type CourseStatus = "draft" | "published" | "archived";
export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type LessonType = "video" | "text" | "quiz" | "assignment";

export type CategoryPublic = {
  id: string;
  name: string;
  slug: string;
  type?: string;
  description?: string | null;
};

export type CategoryType = "course" | "post";
export type CategoryStatus = "active" | "inactive";

export type CategoryWithCounts = {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  status: CategoryStatus;
  sortOrder?: number;
  description?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  courseCount: number;
  postCount: number;
  tagIds: string[];
};

export type CategoryListResponse = {
  data: CategoryWithCounts[];
};

export type CreateCategoryInput = {
  name: string;
  type: CategoryType;
  slug?: string;
  description?: string;
  thumbnail?: string;
  icon?: string;
  tagIds?: string[];
};

export type UpdateCategoryInput = {
  name?: string;
  slug?: string;
  status?: CategoryStatus;
  description?: string | null;
  thumbnail?: string | null;
  icon?: string | null;
  tagIds?: string[];
};

export type TagPublic = {
  id: string;
  name: string;
  slug: string;
  type?: string;
  description?: string | null;
};

export type TagType = "course" | "post" | "global";
export type TagStatus = "active" | "inactive";

export type TagWithCounts = TagPublic & {
  type: TagType;
  status: TagStatus;
  sortOrder?: number;
  level?: "beginner" | "intermediate" | "advanced" | string | null;
  courseCount: number;
  postCount: number;
};

export type TagListResponse = {
  data: TagWithCounts[];
};

export type CreateTagInput = {
  name: string;
  type: TagType;
  slug?: string;
  level?: string | null;
  description?: string;
};

export type LevelMetadata = {
  code: CourseLevel;
  name: string;
  description: string | null;
  sortOrder: number;
  status: "active" | "inactive";
};

export type LevelListResponse = { data: LevelMetadata[] };

export type CoursePublic = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  introVideo: string | null;
  price: number;
  salePrice: number | null;
  level: CourseLevel;
  status: CourseStatus;
  category: CategoryPublic | null;
  tags: TagPublic[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  /** Present when soft-deleted (trash list uses deleted=only) */
  deletedAt?: string | null;
};

export type CoursePagination = {
  skip: number;
  take: number;
  total: number;
  hasMore: boolean;
  page?: number;
  totalPages?: number;
};

export type CourseListResponse = {
  data: CoursePublic[];
  pagination: CoursePagination;
};

export type CourseAuthor = {
  id: number;
  userName: string;
};

export type CourseStats = {
  enrollmentCount: number;
  ratingCount: number;
  averageRating: number | null;
  sectionCount: number;
  lessonCount: number;
  totalDurationSeconds: number;
};

export type LearningOutcome = {
  id: string;
  content: string;
  order: number;
};

export type CourseInclude = {
  id: string;
  key: string;
  label: string;
  value: string | null;
  unit: string | null;
  order: number;
};

/** Downloadable file linked to a lesson (PDF, DOC, TXT, …) */
export type LessonAttachment = {
  id: string;
  lessonId: string;
  mediaId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  order: number;
  createdAt: string;
};

export type AttachLessonMediaInput = {
  mediaId: string;
  title?: string;
};

/** Lesson item inside curriculum/section list */
export type CourseDetailLesson = {
  id: string;
  title: string;
  description: string | null;
  type: LessonType;
  order: number;
  isPreview: boolean;
  isArticlePreview?: boolean;
  videoPreviewDurationSeconds?: number;
  duration: number | null;
  locked: boolean;
  /** HTML content – replaces the old textContent / text_content field */
  content?: string | null;
  videoUrl?: string | null;
  /** Downloadable files attached to this lesson (PDF, DOC, TXT, …) */
  attachments?: LessonAttachment[];
  linkedPostId?: string | null;
  linkedPost?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
  } | null;
};

export type CourseDetailSection = {
  id: string;
  title: string;
  order: number;
  lessonCount: number;
  totalDurationSeconds: number;
  lessons: CourseDetailLesson[];
};

export type CourseDetail = CoursePublic & {
  author: CourseAuthor | null;
  stats: CourseStats;
  learningOutcomes: LearningOutcome[];
  includes: CourseInclude[];
  sections: CourseDetailSection[];
};

export type LearningOutcomeInput = {
  content: string;
};

export type CourseIncludeInput = {
  key: string;
  label: string;
  value?: string | null;
  unit?: string | null;
};

export type CreateCourseInput = {
  title: string;
  description?: string;
  thumbnail?: string;
  intro_video?: string;
  price?: number;
  sale_price?: number;
  level?: CourseLevel;
  category?: string;
  category_id?: string;
  tags?: string[];
  tag_ids?: string[];
  learning_outcomes?: LearningOutcomeInput[];
  includes?: CourseIncludeInput[];
};

export type UpdateCourseInput = {
  title?: string;
  description?: string | null;
  thumbnail?: string | null;
  intro_video?: string | null;
  price?: number;
  sale_price?: number | null;
  level?: CourseLevel;
  status?: CourseStatus;
  category?: string | null;
  category_id?: string | null;
  tags?: string[];
  tag_ids?: string[];
  learning_outcomes?: LearningOutcomeInput[];
  includes?: CourseIncludeInput[];
};

export type CreateSectionInput = {
  title: string;
  order?: number;
};

export type UpdateSectionInput = {
  title?: string;
  order?: number;
};

export type CreateLessonInput = {
  title: string;
  description?: string;
  type?: LessonType;
  order?: number;
  /** HTML content – used by all lesson types */
  content?: string;
  is_preview?: boolean;
  is_article_preview?: boolean;
  video_preview_duration_seconds?: number;
  duration?: number;
  linked_post_id?: string | null;
};

export type UpdateLessonInput = {
  title?: string;
  description?: string | null;
  type?: LessonType;
  order?: number;
  /** HTML content – used by all lesson types */
  content?: string | null;
  is_preview?: boolean;
  is_article_preview?: boolean;
  video_preview_duration_seconds?: number;
  duration?: number | null;
  linked_post_id?: string | null;
};

/** Shape of the data object returned by POST lesson endpoint */
export type LessonCreateResponseData = {
  id: string;
  courseId: string;
  sectionId: string;
  title: string;
  type: LessonType;
  order: number;
  content: string | null;
  isPreview: boolean;
  isArticlePreview?: boolean;
  videoPreviewDurationSeconds?: number;
  duration: number | null;
};

// ─── Quiz Types ──────────────────────────────────────────────────────────────

export type QuizQuestionType =
  "single_choice" | "multiple_choice" | "fill_blank" | "true_false";

export type QuizOption = {
  id?: string;
  content: string;
  is_correct: boolean;
  order: number;
};

export type AcceptedAnswer = {
  id?: string;
  content: string;
  is_exact: boolean;
};

export type CreateQuizInput = {
  title?: string;
  description?: string;
  passing_score?: number;
  time_limit?: number;
  max_attempts?: number;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  show_result?: boolean;
  show_correct_answer?: boolean;
  show_explanation?: boolean;
  available_from?: string;
  available_until?: string;
};

export type UpdateQuizInput = Partial<CreateQuizInput>;

export type CreateQuizQuestionInput = {
  type: QuizQuestionType;
  title: string;
  description?: string;
  explanation?: string;
  points?: number;
  order?: number;
  is_required?: boolean;
  case_sensitive?: boolean;
  options?: QuizOption[];
  accepted_answers?: AcceptedAnswer[];
};

export type UpdateQuizQuestionInput = Partial<CreateQuizQuestionInput>;

export type QuizQuestionOption = {
  id: string;
  content: string;
  is_correct: boolean;
  order: number;
};

export type QuizQuestionAcceptedAnswer = {
  id: string;
  content: string;
  is_exact: boolean;
};

export type QuizQuestion = {
  id: string;
  quizId: string;
  type: QuizQuestionType;
  title?: string;
  question?: string;
  description: string | null;
  explanation: string | null;
  points: number;
  order: number;
  is_required: boolean;
  case_sensitive: boolean;
  options?: QuizQuestionOption[];
  acceptedAnswers?: QuizQuestionAcceptedAnswer[];
  answers?: {
    id: string;
    answer: string;
    isCorrect: boolean;
    order: number;
  }[];
};

export type Quiz = {
  id: string;
  lessonId: string;
  title: string | null;
  description: string | null;
  passingScore: number;
  timeLimit: number | null;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResult: boolean;
  showCorrectAnswer: boolean;
  showExplanation: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  questions: QuizQuestion[];
};

// ─── Assignment Types ─────────────────────────────────────────────────────────

export type AssignmentSubmissionType = "text" | "url" | "file";

export type CreateAssignmentInput = {
  title?: string;
  due_at?: string;
  max_score?: number;
  max_file_size_mb?: number;
  allowed_submission_types?: AssignmentSubmissionType[];
  late_submission_allowed?: boolean;
  max_submissions?: number;
  passing_score?: number;
};

export type UpdateAssignmentInput = Partial<CreateAssignmentInput>;

export type Assignment = {
  id: string;
  lessonId: string;
  title: string | null;
  dueAt: string | null;
  maxScore: number;
  maxFileSizeMb: number | null;
  allowedSubmissionTypes: AssignmentSubmissionType[];
  lateSubmissionAllowed: boolean;
  maxSubmissions: number;
  passingScore: number;
};

// ─── Video Types ──────────────────────────────────────────────────────────────

export type VideoContentType = "video/mp4" | "video/quicktime" | "video/webm";

export type VideoStatus =
  "pending_upload" | "uploaded" | "processing" | "ready" | "failed";

export type VideoRecord = {
  videoId: string;
  courseId: string;
  lessonId: string;
  title?: string | null;
  status: VideoStatus;
  originalKey: string | null;
  hlsKey: string | null;
  audioFlacKey?: string | null;
  audioFlacUrl?: string | null;
  mp4Url: string | null;
  processingPhase?: string | null;
  errorMessage: string | null;
  duration: number | null;
  size: number | null;
  createdAt: string;
  updatedAt: string;
};

export type VideoWithDetails = VideoRecord & {
  courseTitle: string | null;
  lessonTitle: string | null;
};

export type InitMultipartUploadInput = {
  courseId: string;
  lessonId: string;
  title: string;
  filename: string;
  contentType: VideoContentType;
  size: number;
};

export type InitMultipartUploadData = {
  videoId: string;
  originalKey: string;
  uploadId: string;
  partSize: number;
  totalParts: number;
  status: "pending_upload";
};

export type MultipartPartUrlData = {
  url: string;
  partNumber: number;
  expiresIn: number;
};

export type MultipartPart = {
  partNumber: number;
  etag: string;
};

export type MultipartCompleteData = {
  videoId: string;
  originalKey: string;
  size: number;
  status: VideoStatus;
};

export type MultipartAbortData = {
  videoId: string;
  aborted: true;
};

export type LinkVideoInput = {
  courseId: string;
  lessonId: string;
  title: string;
  playbackUrl: string;
  playbackType?: "hls" | "mp4";
  duration?: number;
};

export type VideoPlaybackData = {
  videoId: string;
  courseId: string;
  playbackUrl: string;
  playbackType: "hls" | "mp4";
  hlsKey: string | null;
  audioFlacKey?: string | null;
  audioFlacUrl?: string | null;
  mp4Url: string | null;
};

// ─── Posts ────────────────────────────────────────────────────────────────────

export type PostStatus = "draft" | "published" | "archived";
export type PostVisibility = "public" | "members_only" | "private";

export type PostAuthor = {
  id: number;
  userName: string;
};

export type PostListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  status: PostStatus;
  visibility: PostVisibility;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  author: PostAuthor;
  category: CategoryPublic | null;
  tags: TagPublic[];
};

export type PostDetail = PostListItem & {
  content: string;
};

export type CreatePostInput = {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  thumbnail?: string;
  visibility?: PostVisibility;
  category?: string;
  category_id?: string;
  tags?: string[];
  tag_ids?: string[];
};

export type UpdatePostInput = {
  title?: string;
  content?: string;
  slug?: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  status?: PostStatus;
  visibility?: PostVisibility;
  category?: string | null;
  category_id?: string | null;
  tags?: string[];
  tag_ids?: string[];
};

export type PostPagination = {
  skip: number;
  take: number;
  total: number;
  hasMore: boolean;
  page?: number;
  totalPages?: number;
};

export type PostListResponse = {
  data: PostListItem[];
  pagination: PostPagination;
};

// ─── Media library ──────────────────────────────────────────────────────────

export type MediaKind = "thumbnail" | "file";

export type MediaRecord = {
  id: string;
  kind: MediaKind;
  originalName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaListResponse = {
  data: MediaRecord[];
  total: number;
};

// ─── Common ───────────────────────────────────────────────────────────────────

export type ActionResult = {
  ok: boolean;
  message: string;
};

export type CourseMenuItem = {
  id: string;
  title: string;
  parentId: string | null;
  courseId: string | null;
  url: string | null;
  badge: string | null;
  icon: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type TagWithLevelCounts = {
  id: string;
  name: string;
  slug: string;
  type: string;
  counts: {
    beginner: number;
    intermediate: number;
    advanced: number;
    total: number;
  };
};

export type TagWithCategoryCounts = {
  id: string;
  name: string;
  slug: string;
  type: string;
  categoryCounts: Record<string, number>;
  total: number;
};

// ─── Cart / Orders / Enrollments (learner) ───────────────────────────────────

export type CartCourse = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  salePrice: number | null;
  status: string;
};

export type CartItem = {
  id: string;
  cartId: string;
  courseId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  course: CartCourse;
  finalPrice: number;
  lineTotal: number;
};

export type CartView = {
  id: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
};

export type CartResponse = { cart: CartView };

export type PaymentMethod = "bank_transfer" | "wallet" | "vnpay" | "momo";

export type BankTransferPayment = {
  method: "bank_transfer";
  status: "pending";
  txnRef: string;
  amount: number;
  qrUrl: string;
  transferContent: string;
  bankAccountId?: string;
  bankAccountSource?: string;
  bankAccountNumber: string;
  bankName: string;
  bankAccountName: string;
  bankLabel?: string;
};

export type CreateOrderResponse = {
  order: {
    id: string;
    userId: number;
    totalAmount: number;
    status: string;
    paymentMethod: PaymentMethod;
  };
  transaction: {
    id: string;
    orderId: string;
    txnRef: string;
    amount: number;
    status: string;
  };
  payment: BankTransferPayment | { method: string; status: string };
};

export type SepayCheckResponse = {
  success: boolean;
  status: "PAID" | "PENDING" | string;
  txnRef: string;
  orderId?: string;
  amount?: number;
  message?: string;
};

export type EnrollmentRecord = {
  id: string;
  userId: number;
  courseId: string;
  source: string;
  status: string;
  enrolledAt: string;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EnrollmentListResponse = {
  data: EnrollmentRecord[];
};

// ─── Course learners + progress (admin) ──────────────────────────────────────

export type CourseLearner = {
  enrollmentId: string;
  userId: number;
  userName: string | null;
  email: string | null;
  status: string;
  source: string;
  enrolledAt: string;
  expiredAt: string | null;
  completedLessons: number;
  totalLessons: number;
  percent: number;
  lastActivityAt: string | null;
};

export type CourseLearnersResponse = {
  data: CourseLearner[];
  totalLessons: number;
};

export type QuizAttemptHistoryItem = {
  kind: "quiz";
  lessonId: string;
  lessonTitle: string | null;
  quizId: string;
  quizTitle: string | null;
  attemptId: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  passed: boolean | null;
  submittedAt: string | null;
  wrongQuestions: Array<{
    questionId: string;
    question: string;
    score: number | null;
  }>;
};

export type AssignmentHistoryItem = {
  kind: "assignment";
  lessonId: string;
  lessonTitle: string | null;
  assignmentId: string;
  assignmentTitle: string | null;
  submissionId: string;
  submissionNumber: number;
  status: string;
  score: number | null;
  maxScore: number;
  percentage: number | null;
  passed: boolean | null;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
};

export type CourseExerciseHistory = {
  course: { id: string; title: string };
  user: { id: number; name: string | null; email: string | null };
  summary: {
    quizAttempts: number;
    assignmentSubmissions: number;
    avgQuizPercentage: number | null;
    weakLessons: string[];
  };
  items: Array<QuizAttemptHistoryItem | AssignmentHistoryItem>;
};

export type LearningCoachFile = {
  storageKey: string;
  url: string;
  filename: string;
};

export type LearningCoachResponse = {
  message: string;
  data: {
    history: CourseExerciseHistory;
    reportMarkdown: string;
    usedAi: boolean;
    files: {
      markdown: LearningCoachFile;
      historyJson: LearningCoachFile;
    };
  };
};

// ─── Publish readiness checklist (admin) ─────────────────────────────────────

export type PublishReadinessCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
};

export type PublishReadiness = {
  ready: boolean;
  checks: PublishReadinessCheck[];
};

export type PublishReadinessResponse = {
  data: PublishReadiness;
};

// ─── Quiz attempts (admin) ───────────────────────────────────────────────────

export type QuizAttemptStatus =
  "in_progress" | "submitted" | "graded" | "expired";

export type QuizAttemptAdmin = {
  id: string;
  userId: number;
  userName: string | null;
  email: string | null;
  attemptNumber: number;
  status: QuizAttemptStatus;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  passed: boolean | null;
  startedAt: string;
  submittedAt: string | null;
  gradedAt: string | null;
  expiresAt: string | null;
};

export type QuizAttemptsResponse = {
  data: QuizAttemptAdmin[];
};

// ─── Assignment submissions (admin grading inbox) ────────────────────────────

export type AssignmentSubmissionStatus =
  "draft" | "submitted" | "graded" | "returned";

export type AssignmentSubmissionAttachment = {
  id: string;
  submissionId: string;
  fileName: string;
  storageKey: string;
  mimeType: string | null;
  size: number | null;
  url: string;
  createdAt: string;
};

export type AssignmentSubmissionAdmin = {
  id: string;
  assignmentId: string;
  userId: number;
  userName: string | null;
  email: string | null;
  submissionNumber: number;
  status: AssignmentSubmissionStatus;
  textContent: string | null;
  url: string | null;
  score: number | null;
  feedback: string | null;
  gradedById: number | null;
  gradedAt: string | null;
  submittedAt: string | null;
  createdAt: string;
  attachments: AssignmentSubmissionAttachment[];
};

export type AssignmentSubmissionsResponse = {
  data: AssignmentSubmissionAdmin[];
  maxScore: number;
};

export type GradeAssignmentSubmissionInput = {
  score: number;
  feedback?: string;
};
