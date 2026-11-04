const ALLOWED_PREFIXES = [
  "user/login",
  "user/auth/google",
  "user/register",
  "user/logout",
  "user/me",
  "courses",
  "course-management",
  "flashcard-decks",
  "flashcards",
  "cart",
  "orders",
  "payment",
  "me",
  "quizzes",
  "quiz-questions",
  "quiz-attempts",
  "quiz-answers",
  "assignments",
  "assignment-submissions",
  "admin/videos",
  "admin/users",
  "media",
  "posts",
  "categories",
  "leads",
  "bank-accounts",
  "notifications",
  "moderation",
  "banned-words",
  "admin/metrics",
  "coupons",
  "certificates",
  "analytics",
] as const;

export function isPathAllowed(pathSegments: string[]): boolean {
  if (pathSegments.length === 0) return false;

  const path = pathSegments.join("/");

  return ALLOWED_PREFIXES.some((prefix) => {
    if (prefix === path) return true;
    if (path.startsWith(`${prefix}/`)) return true;
    return false;
  });
}
