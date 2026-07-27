/**
 * ============================================================
 *  GATS ACADEMY — CENTRALIZED THEME DEFINITION
 * ============================================================
 *  Đây là nguồn duy nhất (single source of truth) cho toàn bộ
 *  design system của GATS Academy.
 *
 *  Cách dùng trong component:
 *    import { theme } from '@/lib/theme'
 *
 *    theme.font.primary       → 'var(--font-roboto)'
 *    theme.color.brand.blue   → '#0070EB'
 *    theme.radius.lg          → '1.2rem'
 *
 *  QUY ƯỚC REM: 1rem = 10px (html font-size: 62.5%)
 *    Công thức: rem = px / 10
 *    VD: 16px → 1.6rem | 24px → 2.4rem | 48px → 4.8rem
 *
 *  Khi muốn thay đổi toàn bộ app → chỉ sửa file này.
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// 1. FONTS
// ─────────────────────────────────────────────────────────────
export const font = {
  /**
   * Font body chính — Roboto
   * Dùng cho: paragraph, label, button text, form input
   */
  primary: 'var(--font-roboto)',

  /**
   * Font secondary — Open Sans
   * Dùng cho: caption, description, small text, tooltip, badge
   */
  secondary: 'var(--font-open-sans)',

  /**
   * Font heading — Poppins
   * Dùng cho: H1, H2, H3, hero title, card title nổi bật
   */
  heading: 'var(--font-poppins)',

  /** Font monospace cho code block */
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',

  /** CSS fallback stack cho body (Roboto) */
  sansStack:
    'var(--font-roboto), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',

  /** CSS fallback stack cho secondary (Open Sans) */
  secondaryStack:
    'var(--font-open-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',

  /** CSS fallback stack cho heading (Poppins) */
  headingStack:
    'var(--font-poppins), var(--font-roboto), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
} as const

// ─────────────────────────────────────────────────────────────
// 2. COLORS — BRAND PALETTE (4 màu thương hiệu chuẩn)
// ─────────────────────────────────────────────────────────────
const brand = {
  /** Technology / Default — Xanh Dương */
  blue: '#0070EB',
  blueLight: '#EAF3FE',
  blueDark: '#005BC4',

  /** Creative / Secondary — Cam */
  orange: '#FF7622',
  orangeLight: '#FFF0E6',
  orangeDark: '#D95E10',

  /** Energy — Xanh Lá */
  green: '#10B981',
  greenLight: '#D1FAE5',
  greenDark: '#059669',

  /** Machine Learning / Warning — Vàng Cam */
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  amberDark: '#D97706',
} as const

// ─────────────────────────────────────────────────────────────
// 3. COLORS — SEMANTIC (ánh xạ từ CSS variables Tailwind)
// ─────────────────────────────────────────────────────────────
const semantic = {
  /** Màu nền trang */
  background: 'var(--background)',

  /** Màu chữ chính */
  foreground: 'var(--foreground)',

  /** Primary button / CTA → Orange */
  primary: 'var(--primary)',
  primaryForeground: 'var(--primary-foreground)',

  /** Secondary / Navigation → Blue */
  secondary: 'var(--secondary)',
  secondaryForeground: 'var(--secondary-foreground)',

  /** Accent nhẹ (highlight row, hover bg) */
  accent: 'var(--accent)',
  accentForeground: 'var(--accent-foreground)',

  /** Muted text và muted bg */
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',

  /** Card */
  card: 'var(--card)',
  cardForeground: 'var(--card-foreground)',

  /** Border / Divider */
  border: 'var(--border)',
  divider: 'var(--divider)',

  /** Input */
  input: 'var(--input)',

  /** Ring (focus outline) */
  ring: 'var(--ring)',

  /** Destructive (error state) */
  destructive: 'var(--destructive)',

  /** Brand aliases (shortcut) */
  brandPrimary: 'var(--brand-primary)',
  brandAccent: 'var(--brand-accent)',
} as const

// ─────────────────────────────────────────────────────────────
// 4. COLORS — NEUTRAL GRAY SCALE
// ─────────────────────────────────────────────────────────────
const gray = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
  950: '#030712',
} as const

// ─────────────────────────────────────────────────────────────
// 5. COLORS — STATUS / FEEDBACK
// ─────────────────────────────────────────────────────────────
const status = {
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#0070EB',
  infoLight: '#EAF3FE',
} as const

// ─────────────────────────────────────────────────────────────
// 6. BORDER RADIUS
// ─────────────────────────────────────────────────────────────
export const radius = {
  none: '0',
  xs: '0.4rem',   /* 4px  */
  sm: '0.6rem',   /* 6px  */
  md: '0.8rem',   /* 8px  */
  lg: '1.2rem',   /* 12px */
  xl: '1.6rem',   /* 16px */
  '2xl': '2rem',  /* 20px */
  '3xl': '2.4rem',/* 24px */
  full: '9999px',
} as const

// ─────────────────────────────────────────────────────────────
// 7. SHADOWS
// ─────────────────────────────────────────────────────────────
export const shadow = {
  card: '0 4px 16px rgb(0 112 235 / 0.08)',
  elevated: '0 8px 24px rgb(0 112 235 / 0.12)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  none: 'none',
} as const

// ─────────────────────────────────────────────────────────────
// 8. TRANSITIONS
// ─────────────────────────────────────────────────────────────
export const transition = {
  duration: {
    fast: '100ms',
    default: '200ms',
    slow: '400ms',
    slower: '640ms',
  },
  easing: {
    default: 'cubic-bezier(0.46, 0.03, 0.52, 0.96)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    quart: 'cubic-bezier(0.77, 0, 0.18, 1)',
  },
  /** Preset shorthand */
  preset: {
    fast: '100ms cubic-bezier(0.46, 0.03, 0.52, 0.96)',
    default: '200ms cubic-bezier(0.46, 0.03, 0.52, 0.96)',
    slow: '400ms cubic-bezier(0.77, 0, 0.18, 1)',
  },
} as const

// ─────────────────────────────────────────────────────────────
// 9. TYPOGRAPHY SCALE
// ─────────────────────────────────────────────────────────────
export const fontSize = {
  xs: '1.2rem',   /* 12px */
  sm: '1.4rem',   /* 14px */
  base: '1.6rem', /* 16px — mặc định body */
  lg: '1.8rem',   /* 18px */
  xl: '2rem',     /* 20px */
  '2xl': '2.4rem',/* 24px */
  '3xl': '3rem',  /* 30px */
  '4xl': '3.6rem',/* 36px */
  '5xl': '4.8rem',/* 48px */
  '6xl': '6rem',  /* 60px */
} as const

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const

export const lineHeight = {
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const

// ─────────────────────────────────────────────────────────────
// 10. TYPOGRAPHY PRESETS — semantic text styles
// ─────────────────────────────────────────────────────────────
export const typography = {
  /**
   * HERO SECTION
   * H1 chính — tên to nhất trang, dùng Poppins Bold
   */
  heroTitle: {
    fontSize: '6.4rem',    /* 64px */
    fontWeight: '700',
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
    fontFamily: 'var(--font-poppins)',
  },

  /**
   * HERO DESC
   * Sub-text bên dưới heroTitle, dùng Roboto Regular
   */
  heroDesc: {
    fontSize: '1.8rem',    /* 18px */
    fontWeight: '400',
    lineHeight: '1.625',
    fontFamily: 'var(--font-roboto)',
  },

  /**
   * SECTION TITLE
   * Tiêu đề các section khác (Features, Pricing, Testimonials...)
   */
  sectionTitle: {
    fontSize: '3.5rem',    /* 35px */
    fontWeight: '600',
    lineHeight: '1.25',
    letterSpacing: '-0.01em',
    fontFamily: 'var(--font-poppins)',
  },

  /**
   * SECTION DESC
   * Mô tả / sub-text của các section, dùng Roboto Regular
   */
  sectionDesc: {
    fontSize: '1.6rem',    /* 16px */
    fontWeight: '400',
    lineHeight: '1.5',
    fontFamily: 'var(--font-roboto)',
  },
} as const

// ─────────────────────────────────────────────────────────────
// 11. SPACING SCALE
// ─────────────────────────────────────────────────────────────
export const spacing = {
  0: '0',
  1: '0.4rem',   /* 4px  */
  2: '0.8rem',   /* 8px  */
  3: '1.2rem',   /* 12px */
  4: '1.6rem',   /* 16px */
  5: '2rem',     /* 20px */
  6: '2.4rem',   /* 24px */
  8: '3.2rem',   /* 32px */
  10: '4rem',    /* 40px */
  12: '4.8rem',  /* 48px */
  16: '6.4rem',  /* 64px */
  20: '8rem',    /* 80px */
  24: '9.6rem',  /* 96px */
} as const

// ─────────────────────────────────────────────────────────────
// 12. BREAKPOINTS
// ─────────────────────────────────────────────────────────────
export const breakpoint = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ─────────────────────────────────────────────────────────────
// 13. CONTAINER — layout boundary tokens
// ─────────────────────────────────────────────────────────────
export const container = {
  paddingX: {
    mobile: '1.8rem',
    tablet: '3.2rem',
    desktop: '4.8rem',
  },
  maxWidth: {
    sm: '64rem',
    md: '76.8rem',
    lg: '102.4rem',
    xl: '128rem',
    '2xl': '153.6rem',
    full: '100%',
  },
} as const

// ─────────────────────────────────────────────────────────────
// 14. LAYOUT
// ─────────────────────────────────────────────────────────────
export const layout = {
  headerHeight: '5.4rem', /* 54px */
} as const

// ─────────────────────────────────────────────────────────────
// 15. Z-INDEX SCALE
// ─────────────────────────────────────────────────────────────
export const zIndex = {
  behind: -1,
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  tooltip: 700,
} as const

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT — import { theme } from '@/lib/theme'
//              dùng dạng: theme.font.primary
// ─────────────────────────────────────────────────────────────
export const theme = {
  font,
  color: {
    brand,
    semantic,
    gray,
    status,
  },
  radius,
  shadow,
  transition,
  fontSize,
  fontWeight,
  lineHeight,
  typography,
  spacing,
  container,
  layout,
  breakpoint,
  zIndex,
} as const

// ─────────────────────────────────────────────────────────────
// TYPE HELPERS — dùng khi cần TypeScript inference
// ─────────────────────────────────────────────────────────────
export type Theme = typeof theme
export type BrandColor = keyof typeof brand
export type SemanticColor = keyof typeof semantic
export type FontKey = keyof typeof font
export type RadiusKey = keyof typeof radius
export type ShadowKey = keyof typeof shadow
export type ZIndexKey = keyof typeof zIndex
export type ContainerSize = keyof typeof container.maxWidth

export default theme
