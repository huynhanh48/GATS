# GATS Academy Mobile Design System

Tài liệu này là nguồn tham chiếu màu cho `mobile-app`. Mọi màn hình mới nên bắt đầu từ 4 màu nền tảng bên dưới, sau đó dùng opacity/shadow thay vì thêm màu brand mới.

**Luồng màn hình (Entry → Onboarding → Main):** xem [`app-flow.md`](app-flow.md).

**Tác nhân USER / MENTOR / ADMIN & use case:** xem [`user-agent.md`](user-agent.md) — draft để bạn review/sửa scope.

## Brand Palette

| Token | Hex | Vai trò |
|---|---|---|
| `AppColors.surface` | `#FFFFFF` | Card, sheet, app bar, vùng nội dung nổi |
| `AppColors.background` | `#F9F9FE` | Nền app, canvas, vùng empty state |
| `AppColors.accent` | `#FF7622` | CTA chính, điểm nhấn, icon active phụ |
| `AppColors.primary` | `#0070EB` | Navigation active, link, progress, workflow node chính |

## Usage Rules

- `#0070EB` là màu hành động chính cho navigation, progress, link và trạng thái selected.
- `#FF7622` dùng cho CTA nổi bật như `FilledButton`, rating star, badge quan trọng.
- `#FFFFFF` dùng cho surface nổi: card, bottom sheet, dialog, node workflow.
- `#F9F9FE` dùng cho nền tổng thể và canvas editor.
- Không thêm palette xanh lá, tím, vàng khác cho tính năng mới. Nếu cần phân cấp, dùng opacity của `primary` hoặc `accent`.
- Text dùng neutral riêng để đảm bảo độ tương phản, nhưng không xem là màu brand.

## Flutter Tokens

Các token chính nằm tại:

```dart
AppColors.surface      // #FFFFFF
AppColors.background   // #F9F9FE
AppColors.accent       // #FF7622
AppColors.primary      // #0070EB
```

Gradient cũng phải dựa trên các token này:

```dart
AppGradients.primary   // blue
AppGradients.accent    // orange -> blue
AppGradients.cardSoft  // white -> near-white
```

## Component Guidance

- Primary CTA: nền `AppColors.accent`, chữ trắng.
- Secondary action: text/icon `AppColors.primary`.
- Cards: nền `AppColors.surface`, shadow xanh nhẹ từ `AppShadows`.
- Screen background: `AppColors.background`.
- Workflow nodes: chỉ dùng `primary` và `accent` để phân loại node.

## Ted Lead Adaptation

UI layout lấy từ bộ Ted Lead (`design/ted_lead/`). **Không copy màu teal/cam/navy gốc** — remap theo bảng:

| Ted element | GATS token |
|---|---|
| Active nav, active chip, bookmark, progress chính | `primary` |
| Category tag, star, badge, CTA pill | `accent` |
| Filter button, link "Xem tất cả", giá | `primary` |
| Nền màn / inactive chip | `background` hoặc `chipInactive` |
| Card, modal | `surface` |
| Splash full-screen | `primary` nền |

Chi tiết mapping màn: [`ted-lead-mapping.md`](ted-lead-mapping.md).

## e-France Adaptation

UI entry/onboarding sinh động lấy từ bộ e-France (`design/e-France/`). **Không copy hồng/magenta gốc** — remap theo bảng:

| e-France element | GATS token |
|---|---|
| Nền đen entry | `darkCanvas` (#101828) |
| Hero card + glow | `primary` opacity + `heroGlow` (accent) |
| Vòng tròn bay | `accent`, `primary`, `surface` opacity |
| CTA filled | `accent` |
| CTA outline | border/text `accent` |

Entry thay Splash + Welcome carousel Ted. Chi tiết: [`e-france-mapping.md`](e-france-mapping.md).


Ảnh thì dùng Modern flat vector illustration hoặc SaaS/EdTech onboarding illustration.