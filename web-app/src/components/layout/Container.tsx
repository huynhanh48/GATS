import React from 'react'
import { cn } from '@/lib/utils'
import { theme, type ContainerSize } from '@/lib/theme'

// ─────────────────────────────────────────────────────────────
// Container
// ─────────────────────────────────────────────────────────────
// Vùng boundary tái sử dụng cho mọi trang / section.
//
// Công thức width trên mobile:
//   100vw − (1.8rem × 2) = 100vw − 36px
//
// Responsive padding:
//   mobile  (mặc định) : 1.8rem = 18px mỗi bên
//   tablet  (md 768px+)  : 3.2rem = 32px mỗi bên
//   desktop (lg 1024px+) : 4.8rem = 48px mỗi bên
//
// Max-width theo size prop:
//   sm    640px   → bài viết, form, modal nội dung
//   md    768px   → dashboard, settings
//   lg    1024px  → danh sách khóa học, course
//   xl    1280px  → trang chính (home, landing) — mặc định
//   2xl   1536px  → editor, studio
//   full  100%    → không giới hạn
// ─────────────────────────────────────────────────────────────

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  /** Tiếu tố HTML render (mặc định: div) */
  as?: React.ElementType

  /** Giới hạn chiều rộng tối đa (mặc định: xl = 1280px) */
  size?: ContainerSize

  /** Tắt padding nếu muốn tự quản lý (hiếm dùng) */
  noPadding?: boolean

  children: React.ReactNode
}

/**
 * Container
 *
 * Component tạo boundary layout tái sử dụng.
 * Dùng cho mọi trang: home, post, course, profile...
 *
 * @example
 * // Sử dụng cơ bản
 * <Container>
 *   <HeroSection />
 * </Container>
 *
 * @example
 * // Bài viết dùng size nhỏ hơn
 * <Container size="md">
 *   <PostContent />
 * </Container>
 *
 * @example
 * // Render dưới dạng <section>
 * <Container as="section" size="xl">
 *   <FeatureGrid />
 * </Container>
 */
export function Container({
  as: Tag = 'div',
  size = 'xl',
  noPadding = false,
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        // Căn giữa theo trục ngang
        'mx-auto w-full',
        // Responsive padding: mobile → tablet → desktop
        !noPadding && 'px-[1.8rem] md:px-[3.2rem] lg:px-[4.8rem]',
        className,
      )}
      style={{
        maxWidth: theme.container.maxWidth[size],
      }}
      {...props}
    >
      {children}
    </Tag>
  )
}

export default Container
