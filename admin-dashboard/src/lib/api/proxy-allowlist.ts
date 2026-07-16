const ALLOWED_PREFIXES = [
  "user/login",
  "user/register",
  "user/logout",
  "user/me",
  "courses",
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
  "media",
  "posts",
  "categories",
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
