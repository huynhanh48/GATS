# GATS Academy Web Design System

Nguồn chuẩn là [`mobile-app/docs/design-system.md`](../../mobile-app/docs/design-system.md)
và implementation trong `mobile-app/lib/core/theme/`. Web remap các token này
sang shadcn/Tailwind trong `src/app/globals.css`.

## Light tokens

- Canvas: `background` — `#F9F9FE`
- Surface/card/dialog: `card` — `#FFFFFF`
- Navigation, link, selected, progress: `brand-primary` — `#0070EB`
- Filled CTA, important badge: `brand-accent` / shadcn `primary` — `#FF7622`
- Main text: `foreground` — `#101828`
- Secondary text: `muted-foreground` — `#667085`
- Divider/input border: `divider` / `border` — `#E5E7F0`
- Card shadow: `0 4px 16px rgb(0 112 235 / 8%)`
- Elevated shadow: `0 8px 24px rgb(0 112 235 / 12%)`

Spacing uses `4 / 8 / 12 / 16 / 24 / 32 / 48px`. Cards use `16px` radius,
buttons and inputs `12px`, intentional pill CTAs/chips `32px`.

## Component rules

- Use `Button` for actions; default is orange CTA, `link` and navigation use blue.
- Use `Surface` for cards and elevated content instead of raw white/hex values.
- Use `TedCourseCard`, `SectionHeader`, and `ContentState` for catalog sections.
- Interactive targets should be at least 44×44px and have visible keyboard focus.
- Use semantic utilities (`bg-card`, `text-brand-primary`, `border-divider`).
  Do not introduce `violet-*`, `fuchsia-*`, `emerald-*`, or raw brand hex values.
- Green/yellow/red are reserved for success, warning, and error states.
- Motion lasts 150–300ms, communicates state, and must respect reduced motion.
- Images need meaningful `alt`; decorative images use `alt=""`.

Dark mode remains supported as an optional theme, but light mode is the default
and the current cross-platform source of truth.
