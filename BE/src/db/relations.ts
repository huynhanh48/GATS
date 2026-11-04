import { defineRelations } from 'drizzle-orm';

import { aiCoachMessagesTable } from './schema/ai-coach-message';
import { aiCoachSessionsTable } from './schema/ai-coach-session';
import { bankAccountsTable } from './schema/bank-account';
import { cartItemsTable, cartsTable } from './schema/cart';
import { categoriesTable } from './schema/category';
import { categoryTagsTable } from './schema/category-tag';
import { commentsTable } from './schema/comment';
import { commentLikesTable } from './schema/comment-like';
import { coursesTable } from './schema/course';
import { courseIncludesTable } from './schema/course-include';
import { courseLearningOutcomesTable } from './schema/course-learning-outcome';
import { courseReviewsTable } from './schema/course-review';
import { courseSectionsTable } from './schema/course-section';
import { courseTagsTable } from './schema/course-tag';
import { courseEnrollmentsTable } from './schema/enrollment';
import { lessonsTable } from './schema/lesson';
import { lessonAttachmentsTable } from './schema/lesson-attachment';
import { lessonProgressTable } from './schema/lesson-progress';
import { mediaTable } from './schema/media';
import { orderItemsTable, ordersTable } from './schema/order';
import { permissionsTable } from './schema/permission';
import { postsTable } from './schema/post';
import { postLikesTable } from './schema/post-like';
import { postTagsTable } from './schema/post-tag';
import { quizzesTable } from './schema/quiz';
import { quizQuestionsTable } from './schema/quiz-question';
import { quizQuestionAnswersTable } from './schema/quiz-question-answer';
import { rolesTable } from './schema/role';
import { rolePermissionsTable } from './schema/role-permission';
import { tagsTable } from './schema/tag';
import { transactionsTable } from './schema/transaction';
import { usersTable } from './schema/user';
import { userRolesTable } from './schema/user-role';
import { videosTable } from './schema/video';
import { videoRenditionsTable } from './schema/video-rendition';

const tables = {
  usersTable,
  rolesTable,
  permissionsTable,
  userRolesTable,
  rolePermissionsTable,
  coursesTable,
  categoriesTable,
  categoryTagsTable,
  tagsTable,
  courseTagsTable,
  courseIncludesTable,
  courseLearningOutcomesTable,
  courseReviewsTable,
  courseSectionsTable,
  lessonsTable,
  lessonAttachmentsTable,
  mediaTable,
  videosTable,
  videoRenditionsTable,
  courseEnrollmentsTable,
  lessonProgressTable,
  quizzesTable,
  quizQuestionsTable,
  quizQuestionAnswersTable,
  postsTable,
  commentsTable,
  postLikesTable,
  commentLikesTable,
  postTagsTable,
  cartsTable,
  cartItemsTable,
  ordersTable,
  orderItemsTable,
  transactionsTable,
  bankAccountsTable,
  aiCoachSessionsTable,
  aiCoachMessagesTable,
};

export const relations = defineRelations(tables, (r) => ({
  usersTable: {
    userRoles: r.many.userRolesTable({
      from: r.usersTable.id,
      to: r.userRolesTable.userId,
    }),
    enrollments: r.many.courseEnrollmentsTable({
      from: r.usersTable.id,
      to: r.courseEnrollmentsTable.userId,
    }),
    lessonProgress: r.many.lessonProgressTable({
      from: r.usersTable.id,
      to: r.lessonProgressTable.userId,
    }),
    posts: r.many.postsTable({
      from: r.usersTable.id,
      to: r.postsTable.authorId,
    }),
    comments: r.many.commentsTable({
      from: r.usersTable.id,
      to: r.commentsTable.userId,
    }),
    postLikes: r.many.postLikesTable({
      from: r.usersTable.id,
      to: r.postLikesTable.userId,
    }),
    commentLikes: r.many.commentLikesTable({
      from: r.usersTable.id,
      to: r.commentLikesTable.userId,
    }),
    courseReviews: r.many.courseReviewsTable({
      from: r.usersTable.id,
      to: r.courseReviewsTable.userId,
    }),
    cart: r.one.cartsTable({
      from: r.usersTable.id,
      to: r.cartsTable.userId,
    }),
    orders: r.many.ordersTable({
      from: r.usersTable.id,
      to: r.ordersTable.userId,
    }),
  },
  rolesTable: {
    userRoles: r.many.userRolesTable({
      from: r.rolesTable.id,
      to: r.userRolesTable.roleId,
    }),
    rolePermissions: r.many.rolePermissionsTable({
      from: r.rolesTable.id,
      to: r.rolePermissionsTable.roleId,
    }),
  },
  permissionsTable: {
    rolePermissions: r.many.rolePermissionsTable({
      from: r.permissionsTable.id,
      to: r.rolePermissionsTable.permissionId,
    }),
  },
  userRolesTable: {
    user: r.one.usersTable({
      from: r.userRolesTable.userId,
      to: r.usersTable.id,
    }),
    role: r.one.rolesTable({
      from: r.userRolesTable.roleId,
      to: r.rolesTable.id,
    }),
  },
  rolePermissionsTable: {
    role: r.one.rolesTable({
      from: r.rolePermissionsTable.roleId,
      to: r.rolesTable.id,
    }),
    permission: r.one.permissionsTable({
      from: r.rolePermissionsTable.permissionId,
      to: r.permissionsTable.id,
    }),
  },
  coursesTable: {
    instructor: r.one.usersTable({
      from: r.coursesTable.instructorId,
      to: r.usersTable.id,
    }),
    sections: r.many.courseSectionsTable({
      from: r.coursesTable.id,
      to: r.courseSectionsTable.courseId,
    }),
    lessons: r.many.lessonsTable({
      from: r.coursesTable.id,
      to: r.lessonsTable.courseId,
    }),
    videos: r.many.videosTable({
      from: r.coursesTable.id,
      to: r.videosTable.courseId,
    }),
    enrollments: r.many.courseEnrollmentsTable({
      from: r.coursesTable.id,
      to: r.courseEnrollmentsTable.courseId,
    }),
    lessonProgress: r.many.lessonProgressTable({
      from: r.coursesTable.id,
      to: r.lessonProgressTable.courseId,
    }),
    category: r.one.categoriesTable({
      from: r.coursesTable.categoryId,
      to: r.categoriesTable.id,
    }),
    courseTags: r.many.courseTagsTable({
      from: r.coursesTable.id,
      to: r.courseTagsTable.courseId,
    }),
    reviews: r.many.courseReviewsTable({
      from: r.coursesTable.id,
      to: r.courseReviewsTable.courseId,
    }),
    learningOutcomes: r.many.courseLearningOutcomesTable({
      from: r.coursesTable.id,
      to: r.courseLearningOutcomesTable.courseId,
    }),
    includes: r.many.courseIncludesTable({
      from: r.coursesTable.id,
      to: r.courseIncludesTable.courseId,
    }),
  },
  categoriesTable: {
    courses: r.many.coursesTable({
      from: r.categoriesTable.id,
      to: r.coursesTable.categoryId,
    }),
    posts: r.many.postsTable({
      from: r.categoriesTable.id,
      to: r.postsTable.categoryId,
    }),
    categoryTags: r.many.categoryTagsTable({
      from: r.categoriesTable.id,
      to: r.categoryTagsTable.categoryId,
    }),
  },
  tagsTable: {
    courseTags: r.many.courseTagsTable({
      from: r.tagsTable.id,
      to: r.courseTagsTable.tagId,
    }),
    postTags: r.many.postTagsTable({
      from: r.tagsTable.id,
      to: r.postTagsTable.tagId,
    }),
    categoryTags: r.many.categoryTagsTable({
      from: r.tagsTable.id,
      to: r.categoryTagsTable.tagId,
    }),
  },
  categoryTagsTable: {
    category: r.one.categoriesTable({
      from: r.categoryTagsTable.categoryId,
      to: r.categoriesTable.id,
    }),
    tag: r.one.tagsTable({
      from: r.categoryTagsTable.tagId,
      to: r.tagsTable.id,
    }),
  },
  courseTagsTable: {
    course: r.one.coursesTable({
      from: r.courseTagsTable.courseId,
      to: r.coursesTable.id,
    }),
    tag: r.one.tagsTable({
      from: r.courseTagsTable.tagId,
      to: r.tagsTable.id,
    }),
  },
  courseReviewsTable: {
    course: r.one.coursesTable({
      from: r.courseReviewsTable.courseId,
      to: r.coursesTable.id,
    }),
    user: r.one.usersTable({
      from: r.courseReviewsTable.userId,
      to: r.usersTable.id,
    }),
  },
  courseLearningOutcomesTable: {
    course: r.one.coursesTable({
      from: r.courseLearningOutcomesTable.courseId,
      to: r.coursesTable.id,
    }),
  },
  courseIncludesTable: {
    course: r.one.coursesTable({
      from: r.courseIncludesTable.courseId,
      to: r.coursesTable.id,
    }),
  },
  courseSectionsTable: {
    course: r.one.coursesTable({
      from: r.courseSectionsTable.courseId,
      to: r.coursesTable.id,
    }),
    lessons: r.many.lessonsTable({
      from: r.courseSectionsTable.id,
      to: r.lessonsTable.sectionId,
    }),
  },
  lessonsTable: {
    course: r.one.coursesTable({
      from: r.lessonsTable.courseId,
      to: r.coursesTable.id,
    }),
    section: r.one.courseSectionsTable({
      from: r.lessonsTable.sectionId,
      to: r.courseSectionsTable.id,
    }),
    video: r.one.videosTable({
      from: r.lessonsTable.id,
      to: r.videosTable.lessonId,
    }),
    progress: r.many.lessonProgressTable({
      from: r.lessonsTable.id,
      to: r.lessonProgressTable.lessonId,
    }),
    quiz: r.one.quizzesTable({
      from: r.lessonsTable.id,
      to: r.quizzesTable.lessonId,
    }),
    attachments: r.many.lessonAttachmentsTable({
      from: r.lessonsTable.id,
      to: r.lessonAttachmentsTable.lessonId,
    }),
  },
  lessonAttachmentsTable: {
    lesson: r.one.lessonsTable({
      from: r.lessonAttachmentsTable.lessonId,
      to: r.lessonsTable.id,
    }),
    media: r.one.mediaTable({
      from: r.lessonAttachmentsTable.mediaId,
      to: r.mediaTable.id,
    }),
  },
  mediaTable: {
    uploader: r.one.usersTable({
      from: r.mediaTable.uploadedBy,
      to: r.usersTable.id,
    }),
    lessonAttachments: r.many.lessonAttachmentsTable({
      from: r.mediaTable.id,
      to: r.lessonAttachmentsTable.mediaId,
    }),
  },
  quizzesTable: {
    lesson: r.one.lessonsTable({
      from: r.quizzesTable.lessonId,
      to: r.lessonsTable.id,
    }),
    questions: r.many.quizQuestionsTable({
      from: r.quizzesTable.id,
      to: r.quizQuestionsTable.quizId,
    }),
  },
  quizQuestionsTable: {
    quiz: r.one.quizzesTable({
      from: r.quizQuestionsTable.quizId,
      to: r.quizzesTable.id,
    }),
    answers: r.many.quizQuestionAnswersTable({
      from: r.quizQuestionsTable.id,
      to: r.quizQuestionAnswersTable.questionId,
    }),
  },
  quizQuestionAnswersTable: {
    question: r.one.quizQuestionsTable({
      from: r.quizQuestionAnswersTable.questionId,
      to: r.quizQuestionsTable.id,
    }),
  },
  courseEnrollmentsTable: {
    user: r.one.usersTable({
      from: r.courseEnrollmentsTable.userId,
      to: r.usersTable.id,
    }),
    course: r.one.coursesTable({
      from: r.courseEnrollmentsTable.courseId,
      to: r.coursesTable.id,
    }),
  },
  lessonProgressTable: {
    user: r.one.usersTable({
      from: r.lessonProgressTable.userId,
      to: r.usersTable.id,
    }),
    course: r.one.coursesTable({
      from: r.lessonProgressTable.courseId,
      to: r.coursesTable.id,
    }),
    lesson: r.one.lessonsTable({
      from: r.lessonProgressTable.lessonId,
      to: r.lessonsTable.id,
    }),
    video: r.one.videosTable({
      from: r.lessonProgressTable.videoId,
      to: r.videosTable.id,
    }),
  },
  videosTable: {
    course: r.one.coursesTable({
      from: r.videosTable.courseId,
      to: r.coursesTable.id,
    }),
    lesson: r.one.lessonsTable({
      from: r.videosTable.lessonId,
      to: r.lessonsTable.id,
    }),
    renditions: r.many.videoRenditionsTable({
      from: r.videosTable.id,
      to: r.videoRenditionsTable.videoId,
    }),
  },
  videoRenditionsTable: {
    video: r.one.videosTable({
      from: r.videoRenditionsTable.videoId,
      to: r.videosTable.id,
    }),
  },
  postsTable: {
    author: r.one.usersTable({
      from: r.postsTable.authorId,
      to: r.usersTable.id,
    }),
    category: r.one.categoriesTable({
      from: r.postsTable.categoryId,
      to: r.categoriesTable.id,
    }),
    comments: r.many.commentsTable({
      from: r.postsTable.id,
      to: r.commentsTable.postId,
    }),
    likes: r.many.postLikesTable({
      from: r.postsTable.id,
      to: r.postLikesTable.postId,
    }),
    postTags: r.many.postTagsTable({
      from: r.postsTable.id,
      to: r.postTagsTable.postId,
    }),
  },
  postTagsTable: {
    post: r.one.postsTable({
      from: r.postTagsTable.postId,
      to: r.postsTable.id,
    }),
    tag: r.one.tagsTable({
      from: r.postTagsTable.tagId,
      to: r.tagsTable.id,
    }),
  },
  commentsTable: {
    post: r.one.postsTable({
      from: r.commentsTable.postId,
      to: r.postsTable.id,
    }),
    user: r.one.usersTable({
      from: r.commentsTable.userId,
      to: r.usersTable.id,
    }),
    likes: r.many.commentLikesTable({
      from: r.commentsTable.id,
      to: r.commentLikesTable.commentId,
    }),
  },
  postLikesTable: {
    post: r.one.postsTable({
      from: r.postLikesTable.postId,
      to: r.postsTable.id,
    }),
    user: r.one.usersTable({
      from: r.postLikesTable.userId,
      to: r.usersTable.id,
    }),
  },
  commentLikesTable: {
    comment: r.one.commentsTable({
      from: r.commentLikesTable.commentId,
      to: r.commentsTable.id,
    }),
    user: r.one.usersTable({
      from: r.commentLikesTable.userId,
      to: r.usersTable.id,
    }),
  },
  cartsTable: {
    user: r.one.usersTable({
      from: r.cartsTable.userId,
      to: r.usersTable.id,
    }),
    items: r.many.cartItemsTable({
      from: r.cartsTable.id,
      to: r.cartItemsTable.cartId,
    }),
  },
  cartItemsTable: {
    cart: r.one.cartsTable({
      from: r.cartItemsTable.cartId,
      to: r.cartsTable.id,
    }),
    course: r.one.coursesTable({
      from: r.cartItemsTable.courseId,
      to: r.coursesTable.id,
    }),
  },
  ordersTable: {
    user: r.one.usersTable({
      from: r.ordersTable.userId,
      to: r.usersTable.id,
    }),
    items: r.many.orderItemsTable({
      from: r.ordersTable.id,
      to: r.orderItemsTable.orderId,
    }),
    transaction: r.one.transactionsTable({
      from: r.ordersTable.id,
      to: r.transactionsTable.orderId,
    }),
  },
  orderItemsTable: {
    order: r.one.ordersTable({
      from: r.orderItemsTable.orderId,
      to: r.ordersTable.id,
    }),
    course: r.one.coursesTable({
      from: r.orderItemsTable.courseId,
      to: r.coursesTable.id,
    }),
  },
  transactionsTable: {
    order: r.one.ordersTable({
      from: r.transactionsTable.orderId,
      to: r.ordersTable.id,
    }),
  },
  bankAccountsTable: {},
  aiCoachSessionsTable: {
    user: r.one.usersTable({
      from: r.aiCoachSessionsTable.userId,
      to: r.usersTable.id,
    }),
    messages: r.many.aiCoachMessagesTable({
      from: r.aiCoachSessionsTable.id,
      to: r.aiCoachMessagesTable.sessionId,
    }),
  },
  aiCoachMessagesTable: {
    session: r.one.aiCoachSessionsTable({
      from: r.aiCoachMessagesTable.sessionId,
      to: r.aiCoachSessionsTable.id,
    }),
  },
}));

export { tables };
