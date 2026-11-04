<!-- context7 -->

Use Context7 MCP to fetch current documentation whenever the task asks about a
library, framework, SDK, API, CLI tool, or cloud service. Start with
`resolve-library-id`, choose the best `/org/project` match, then call
`query-docs` with the full task question.

<!-- context7 -->

# GATS Academy Admin Dashboard Rules

This repo is the Next.js Admin Dashboard for GATS Academy. It was cloned from
an admin template, so keep the template's layout/components where useful, but
move GATS-specific behavior behind small project modules.

## Project Shape

- Frontend: Next.js App Router, React, TypeScript, Tailwind.
- Backend reference: `../be`. Treat `../be/src/common/paths/*` and
  `../be/src/models/*` as the source of truth for backend paths and payloads.
- Backend proxy: browser requests go through `src/app/api/be/[...path]/route.ts`.
  Add new backend prefixes in `src/lib/api/proxy-allowlist.ts` before exposing
  them to the browser.
- Auth cookie: the BE owns `access_token`. Do not read it in client code.

## API Pattern

- Client Components must call the BE through the shared Axios client in
  `src/lib/api/client.ts`.
- Browser-facing domain calls live in `src/services/*.client.ts`; do not call
  `axios` directly from UI components.
- Auth browser calls live in `src/services/auth.client.ts`.
- Admin access policy lives in `src/lib/auth/access.ts`.
- Server Components and Server Actions should use `src/lib/api/server.ts`
  (`beFetch`) because it forwards the HTTP-only auth cookie and sets the BE
  origin expected by the CSRF guard.
- Mirror BE response types in `src/lib/api/types.ts`. Prefer names and enum
  values from the BE zod models.
- Mutations should return `{ ok, message }` from Server Actions and call
  `revalidatePath` for the affected admin routes.

## Routes

- Current admin dashboard routes use the admin template layout in
  `src/app/(with-layout)`.
- Admin course management uses singular `/course`:
  `/course`, `/course/new`, `/course/[id]`, `/course/[id]/edit`.
- Public course website routes should use plural `/courses` and should not use
  the admin shell. Add them under a separate route group such as
  `src/app/(public)/courses`.
- Auth routes live under `src/app/(without-layout)/auth`.
- Keep route strings local until they are reused in multiple modules. Add a
  route constants file only when duplication becomes real.

## Dashboard UI Pattern

- When coding dashboard UI, inspect and reuse the cloned admin template patterns
  in `src/components/Layouts`, `src/components/FormElements`,
  `src/components/Tables`, `src/components/Charts`, `src/components/ui`, and
  `src/components/ui-elements` before creating new components.
- When building a new common UI primitive, prefer shadcn/ui if it has a matching
  component. Use `npx shadcn@latest add <component>` after checking whether
  `components.json` exists or after deliberately initializing shadcn for the
  project.
- Keep shadcn components visually aligned with the existing admin template.

## Course Module Checklist

When adding or changing course features:

1. Read the BE route constants in `../be/src/common/paths/course.ts`.
2. Check payload schemas in `../be/src/models/Course.model.ts`,
   `CourseSection.model.ts`, and `Lesson.model.ts`.
3. Update `src/lib/api/types.ts` if the response shape changed.
4. Update the Axios client service in `src/services/courses.client.ts` for
   browser workflows, or the Server Action in
   `src/app/(with-layout)/course/actions.ts` for server workflows.
5. Update `src/lib/api/proxy-allowlist.ts` only for backend prefixes that should
   be reachable from the browser.
6. Check for asymmetry in backend payloads: when finding root causes for missing data (like quiz options), verify if the BE accepts one shape (e.g. `options`) but returns a different shape (e.g. `answers`). Ensure `types.ts` and FE components handle the exact shape returned by the API.
7. Validate with `npm run build` when possible.
