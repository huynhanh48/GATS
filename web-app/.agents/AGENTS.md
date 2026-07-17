# GATS Academy Workspace Rules

## Color System Rules
All components and new features designed for GATS Academy must adhere strictly to the following 4 standard brand colors:
1. **Technology / Default (Xanh Dương)**: `#0070EB` (represented by `primary` / `blue-500` classes)
2. **Creative (Cam / Secondary)**: `#FF7622` (represented by `secondary` / `orange-500` classes)
3. **Energy (Xanh Lá)**: `#10B981` (represented by `emerald-500`/`emerald-600` classes)
4. **Machine Learning / Warning (Vàng Cam)**: `#F59E0B` (represented by `amber-500`/`amber-600` classes)

### Constraints
- DO NOT use arbitrary colors like `indigo` or other non-standard purple variations for highlight backgrounds, glows, spotlights, badges, text highlights, or buttons.
- For primary highlights (e.g. mentor section spotlight, main glow overlays, primary buttons), default to the **Technology / Default (Xanh Dương - `#0070EB`)** color unless a themed switcher or distinct design grouping requires the other 3 colors.

## API Fetching Rules
- **ALWAYS** use the pre-configured axios instance (`@/lib/apiClient`) for data fetching instead of native `fetch`.
- Do not append `process.env.NEXT_PUBLIC_API_URL` to endpoints manually, the `apiClient`'s baseURL already handles it.
- Expect `apiClient` to directly return `response.data` via interceptors, so `.json()` parsing is not needed.
- **ALWAYS** test and verify the API response structure (e.g. via `curl` or terminal check) before designing and writing Frontend integration code. Do not assume standard response structures (like `response.data`), always double check to prevent data mismatches (e.g., checking if response is nested like `response.post`).

## Error Handling & Notifications
- **ALWAYS** use `toast` from `sonner` (`import { toast } from 'sonner';`) to display error or success messages to the user.
- **DO NOT** use `console.error` or `console.warn` as the primary way of notifying users about errors (e.g. API fetch failures).
