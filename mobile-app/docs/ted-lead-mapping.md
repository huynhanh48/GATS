# Ted Lead → GATS Academy Mapping

Nguồn mockup: [`design/ted_lead/`](../design/ted_lead/)

## Màn áp dụng

| Ted Lead file | GATS screen | Flutter file |
|---|---|---|
| `01_LAUNCHING.jpg` | ~~Splash~~ → Entry e-France | `entry_screen.dart` (thay splash/welcome) |
| `02-04_INTRO` | Quiz onboarding 8 bước + ack popup đa dạng | `onboarding_quiz_screen.dart`, `onboarding_answer_ack_sheet.dart` |
| `15_CONGRATULATIONS` | Kết quả gợi ý + Loading | `onboarding_results_screen.dart`, `onboarding_loading_screen.dart` |
| `16_HOME.jpg` | Tab Trang chủ (NestedScroll + tab pin) | `features/home/presentation/home_screen.dart` |
| `19_POPULAR COURSES.jpg` | Khóa nổi bật | `home_screen.dart` |
| `21_COURSES LIST.jpg` | Thư viện list | `features/library/presentation/library_screen.dart` |
| `39_MY COURSE - ONGOING.jpg` | Thư viện filter | `library_screen.dart` |
| `32_REVIEWS.jpg` | Rate Us (social proof + dialog native) | `rate_us_screen.dart`, `review_prompt_dialog.dart` |
| Bottom nav | Shell | `shell/main_shell.dart` |

## Remap màu

| Ted Lead | GATS token |
|---|---|
| Teal active nav/chip | `AppColors.primary` (#0070EB) |
| Orange category/tag | `AppColors.accent` (#FF7622) |
| Blue filter/price/link | `AppColors.primary` |
| Light background | `AppColors.background` (#F9F9FE) |
| White cards | `AppColors.surface` (#FFFFFF) |
| Primary CTA pill | `AppColors.accent` |

## Widget library

Xem [`lib/core/widgets/ted/ted.dart`](../lib/core/widgets/ted/ted.dart).
