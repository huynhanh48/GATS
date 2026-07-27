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

## Theme & Design Token Rules
Full architecture guide: `docs/theme-architecture.md`

### ABSOLUTE RULE — No Hardcoded Values
- **NEVER** hardcode colors directly: no `'#0070EB'`, `'rgb(...)'`, `'rgba(...)'`
- **NEVER** hardcode font sizes: no `'16px'`, `'1.6rem'` — use `theme.fontSize.*`
- **NEVER** hardcode font weights: no `700`, `'bold'` — use `theme.fontWeight.*`
- **NEVER** hardcode spacing: no `'12px'`, `'1.2rem'` — use `theme.spacing.*`
- **NEVER** hardcode border radius — use `theme.radius.*`
- **NEVER** use Tailwind arbitrary values for brand colors: no `text-[#0070EB]`

### ALWAYS Use Theme Tokens
```tsx
import { theme } from '@/lib/theme'

// Colors
theme.color.brand.blue          // → '#0070EB'
theme.color.brand.orange        // → '#FF7622'
theme.color.semantic.primary    // → 'var(--primary)'
theme.color.semantic.foreground // → 'var(--foreground)'

// Typography presets (spread directly as style object)
theme.typography.heroTitle      // → { fontSize:'6.4rem', fontWeight:'700', ... }
theme.typography.heroDesc       // → { fontSize:'1.8rem', fontWeight:'400', ... }
theme.typography.sectionTitle   // → { fontSize:'3.5rem', fontWeight:'600', ... }
theme.typography.sectionDesc    // → { fontSize:'1.6rem', fontWeight:'400', ... }

// Sizing
theme.fontSize.base             // → '1.6rem' (= 16px, 1rem=10px)
theme.radius.lg                 // → '1.2rem' (= 12px)
theme.spacing[4]                // → '1.6rem' (= 16px)
```

### When to Create a Component-Level Theme File
- **Use `theme` directly** when: component is small (<5 tokens), not reused widely
- **Create `[name].theme.ts`** when: component is large (Hero, Card, Navbar...), has variants, or uses >5 tokens
- Component theme files MUST only import from `@/lib/theme` — no hardcoding inside them

### REM Convention
- `1rem = 10px` (`html { font-size: 62.5% }` is set in globals.css)
- Formula: `rem = px ÷ 10` (e.g., 24px → 2.4rem, 48px → 4.8rem)
- Body text is reset to `1.6rem` (= 16px) in globals.css

## Layout & Container Rules

### MANDATORY — Always Use `<Container>` for Content Boundaries
- **EVERY** new page section, block component, or content area that needs horizontal boundary / centering **MUST** use `<Container>` from `@/components/layout/Container`.
- **NEVER** manually write `mx-auto`, `max-w-*`, `px-4`, `px-6`, `sm:px-6` for a content boundary — use `<Container>` instead.
- **NEVER** hardcode `max-width` or horizontal padding on a section's inner wrapper div.

### Standard 2-Layer Pattern
Every section follows this exact structure — NO exceptions:
```tsx
import { Container } from '@/components/layout/Container'

// ✅ CORRECT — outer section controls bg/py, Container controls boundary
<section className="w-full bg-background py-20">
  <Container>
    {/* content */}
  </Container>
</section>

// ❌ WRONG — manual px/max-w inside section
<section className="w-full bg-background py-20">
  <div className="mx-auto max-w-7xl px-4 sm:px-6">
    {/* content */}
  </div>
</section>
```

### Container `size` prop — choose based on content type
| size | maxWidth | When to use |
|---|---|---|
| `sm` | 640px | Blog post body, narrow form, modal content |
| `md` | 768px | Dashboard panel, settings page |
| `lg` | 1024px | Course listing, testimonials, focused section |
| `xl` | **1280px** | Home, landing page sections ← **DEFAULT** |
| `2xl` | 1536px | Editor, studio, wide data table |
| `full` | 100% | Full-bleed (manage padding yourself with `noPadding`) |

### Props reference
```tsx
import { Container } from '@/components/layout/Container'

// Default (xl = 1280px, with responsive padding)
<Container>...</Container>

// Custom size
<Container size="lg">...</Container>

// Render as <section> HTML element
<Container as="section" size="xl">...</Container>

// Add extra className (e.g. flex layout)
<Container className="flex flex-col gap-8">...</Container>

// Disable auto padding when needed (rare)
<Container noPadding>...</Container>
```

### Responsive padding (auto-managed by Container — do NOT override)
- Mobile `<768px` → `1.8rem` (18px) each side — content = `100vw − 36px`
- Tablet `768px+` → `3.2rem` (32px) each side
- Desktop `1024px+` → `4.8rem` (48px) each side

## Typography & Clipping Rules
- **Vietnamese Fonts Caution**: When using fonts like `Be Vietnam Pro` for headings with Vietnamese diacritics (dấu ắ, ầ, ể...), ALWAYS ensure sufficient `line-height` to prevent clipping at the top or bottom of the text bounding box.
- **Line-Height Minimums**: Avoid tight leading (e.g. `leading-[1.1]` or `leading-none`) for large Vietnamese headings. Use `leading-[1.3]`, `leading-[1.4]`, `leading-[1.5]`, or `leading-normal` depending on font size.
- **Padding fallback**: If necessary, add `py-2` or `py-4` to the heading element to give extra breathing room for ascenders/descenders if overflow clipping occurs within a tight flex/grid container.
