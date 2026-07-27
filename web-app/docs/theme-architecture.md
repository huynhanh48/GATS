# GATS Academy — Theme Architecture Guide

> **Nguyên tắc vàng:** Sửa một chỗ → toàn bộ app thay đổi.
> Không bao giờ hardcode giá trị như `"#0070EB"`, `"16px"`, hay `"700"` trực tiếp trong code.

---

## Tổng quan kiến trúc (2 lớp)

```
┌─────────────────────────────────────────────────────┐
│  LỚP 1 — CSS Variables  (globals.css / :root)       │
│  → Runtime, hỗ trợ dark mode, Tailwind đọc được    │
│  Ví dụ: --primary: #FF7622                          │
└──────────────────┬────────────────────────────────────┘
                   │ tham chiếu lên
┌──────────────────▼───────────────────────────────────┐
│  LỚP 2 — TypeScript Theme  (src/lib/theme.ts)       │
│  → Design tokens, dùng trong JS/TSX/inline style    │
│  Ví dụ: theme.color.brand.blue = 'var(--secondary)' │
└──────────────────┬───────────────────────────────────┘
                   │ kế thừa
┌──────────────────▼───────────────────────────────────┐
│  LỚP 3 — Component Theme  (nếu component lớn)       │
│  → Chỉ tồn tại trong file component hoặc folder     │
│  Ví dụ: CourseCardTheme extends/tham chiếu theme    │
└─────────────────────────────────────────────────────┘
```

---

## Quy tắc sử dụng

### ✅ ĐÚNG
```tsx
import { theme } from '@/lib/theme'

<div style={{ color: theme.color.semantic.primary }}>
<h1 style={theme.typography.heroTitle}>
<p style={{ fontSize: theme.fontSize.base }}>

// Dùng Tailwind class (map từ CSS variables)
<div className="bg-primary text-primary-foreground">
<h2 className="font-heading text-foreground">
```

### ❌ SAI — Tuyệt đối không làm
```tsx
<div style={{ color: '#0070EB' }}>         ❌
<div style={{ background: '#FF7622' }}>    ❌
<p style={{ fontSize: '16px' }}>           ❌
<p style={{ fontWeight: 700 }}>            ❌
<div style={{ borderRadius: '12px' }}>     ❌
<div className="text-[#0070EB]">           ❌
```

---

## Khi nào tạo Component Theme?

### Dùng theme chính trực tiếp — khi component:
- Nhỏ, đơn giản (Button, Badge, Avatar, Divider...)
- Không tái sử dụng nhiều nơi
- Chỉ cần 1–3 token từ theme

```tsx
// ✅ Đơn giản → dùng thẳng theme
import { theme } from '@/lib/theme'

export function Badge({ children }) {
  return (
    <span style={{
      backgroundColor: theme.color.brand.blueLight,
      color: theme.color.brand.blue,
      fontSize: theme.fontSize.xs,
      borderRadius: theme.radius.full,
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    }}>
      {children}
    </span>
  )
}
```

### Tạo Component Theme riêng — khi component:
- **Lớn** (Hero, CourseCard, Navbar, Sidebar, PricingSection...)
- **Tái sử dụng nhiều nơi** với nhiều biến thể
- Có **nhiều hơn 5 token** cần dùng
- Có **variant** (size, color variant, state...)

```tsx
// ✅ Component lớn → tạo componentTheme riêng
// src/components/CourseCard/courseCard.theme.ts

import { theme } from '@/lib/theme'

export const courseCardTheme = {
  root: {
    background: theme.color.semantic.card,
    borderRadius: theme.radius.xl,
    boxShadow: theme.shadow.card,
    border: `1px solid ${theme.color.semantic.border}`,
  },
  title: {
    ...theme.typography.sectionTitle,
    fontSize: theme.fontSize['2xl'],  // override nếu cần
  },
  desc: {
    ...theme.typography.sectionDesc,
  },
  badge: {
    technology: { bg: theme.color.brand.blueLight, color: theme.color.brand.blue },
    creative:   { bg: theme.color.brand.orangeLight, color: theme.color.brand.orange },
    energy:     { bg: theme.color.brand.greenLight, color: theme.color.brand.green },
    ml:         { bg: theme.color.brand.amberLight, color: theme.color.brand.amber },
  },
  price: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.color.brand.blue,
  },
} as const
```

---

## Cấu trúc file đề xuất

```
src/
├── lib/
│   └── theme.ts                  ← SOURCE OF TRUTH duy nhất
│
├── components/
│   ├── ui/                       ← shadcn components (dùng theme trực tiếp)
│   │   ├── button.tsx
│   │   └── badge.tsx
│   │
│   ├── CourseCard/               ← Component lớn → có theme riêng
│   │   ├── CourseCard.tsx
│   │   ├── courseCard.theme.ts   ← chỉ import từ @/lib/theme
│   │   └── index.ts
│   │
│   ├── HeroSection/
│   │   ├── HeroSection.tsx
│   │   └── heroSection.theme.ts
│   │
│   └── Navbar/
│       ├── Navbar.tsx
│       └── navbar.theme.ts
```

---

## Cấu trúc Component Theme chuẩn

```typescript
// [componentName].theme.ts
import { theme } from '@/lib/theme'

/**
 * ComponentName Theme
 * Chỉ tham chiếu từ theme chính — không hardcode bất kỳ giá trị nào.
 * Khi cần thay đổi → sửa theme.ts, theme này tự cập nhật.
 */
export const componentNameTheme = {

  // --- Layout / Container ---
  root: {
    padding: theme.spacing[4],
    borderRadius: theme.radius.lg,
    background: theme.color.semantic.card,
  },

  // --- Typography ---
  title: {
    ...theme.typography.sectionTitle,
  },
  desc: {
    ...theme.typography.sectionDesc,
    color: theme.color.semantic.mutedForeground,
  },

  // --- Variants (nếu có) ---
  variants: {
    primary:   { background: theme.color.brand.blue,   color: '#ffffff' },
    secondary: { background: theme.color.brand.orange, color: '#ffffff' },
  },

} as const
```

---

## Checklist cho Agent khi code component

- [ ] Không có giá trị màu hardcode (`#xxx`, `rgb()`...)
- [ ] Không có font-size / font-weight hardcode (`16px`, `700`...)
- [ ] Không có spacing / padding / margin hardcode (`12px`...)
- [ ] Không có border-radius hardcode (`8px`, `0.5rem`...)
- [ ] Tất cả giá trị đếu đến từ `theme.*` hoặc Tailwind class
- [ ] Component lớn (>5 token) đã có file `*.theme.ts` riêng
- [ ] File `*.theme.ts` chỉ import từ `@/lib/theme`, không hardcode

---

## Sơ đồ luồng cập nhật

```
Muốn đổi màu brand blue (#0070EB → #0060D0)
           │
           ▼
   Sửa duy nhất 1 chỗ:
   src/lib/theme.ts  →  brand.blue: '#0060D0'
           │
           ├── courseCard.theme.ts   (tự cập nhật)
           ├── heroSection.theme.ts  (tự cập nhật)
           ├── navbar.theme.ts       (tự cập nhật)
           └── tất cả component dùng theme.color.brand.blue
                                     (tự cập nhật)
```

---

## Mapping nhanh — Token nào dùng khi nào

| Tình huống | Token nên dùng |
|---|---|
| Màu nền trang | `theme.color.semantic.background` |
| Màu chữ chính | `theme.color.semantic.foreground` |
| Button CTA (cam) | `theme.color.semantic.primary` |
| Link / nav (xanh) | `theme.color.semantic.secondary` |
| Màu xanh brand | `theme.color.brand.blue` |
| Tiêu đề Hero | `theme.typography.heroTitle` |
| Mô tả Hero | `theme.typography.heroDesc` |
| Tiêu đề Section | `theme.typography.sectionTitle` |
| Mô tả Section | `theme.typography.sectionDesc` |
| Card container | `theme.color.semantic.card` + `theme.shadow.card` |
| Border thông thường | `theme.color.semantic.border` |
| Text mờ (hint) | `theme.color.semantic.mutedForeground` |
| Spacing container | `theme.spacing[6]` đến `theme.spacing[16]` |
| Border radius card | `theme.radius.xl` |
| Border radius badge | `theme.radius.full` |
