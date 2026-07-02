# GATS Academy — Mobile App

App mobile đào tạo AI cho dân công sở / người đi làm.

## Tính năng hiện tại

| Tab | Nội dung |
|-----|----------|
| Trang chủ | Hero tiếp tục học, sub-tab Lộ trình / Quiz / AI Report |
| Hàng ngày | Bài tập, **Flashcard** (lật + vuốt), Daily Routine |
| Thư viện | Khóa học featured + danh sách gradient cover |
| AI Coach | Chat mock + avatar + typing indicator |
| Hub | XP gradient, badges, chứng chỉ |

## Flashcard

- Vào từ tab **Hàng ngày** → section "Ôn flashcard"
- **Tap** lật thẻ, **vuốt trái** (chưa thuộc) / **vuốt phải** (đã thuộc)
- Hoàn thành phiên → tóm tắt + XP mock

## Design

- Font: Plus Jakarta Sans (`google_fonts`)
- Màu brand: `#FFFFFF`, `#F9F9FE`, `#FF7622`, `#0070EB`
- Design system: [`docs/design-system.md`](docs/design-system.md)
- Card: shadow thay border, gradient hero cards
- Bottom nav: Material 3 `NavigationBar` floating

## Cấu trúc

```
lib/
├── core/theme/          # colors, gradients, spacing, shadows
├── core/widgets/        # GradientCard, PillTabBar, FlipCard...
├── data/mock/
├── features/
│   ├── flashcard/       # deck section + study screen
│   ├── home/, daily/, library/, ai_coach/, hub/, settings/
└── shell/main_shell.dart
```

## Chạy app

```bash
cd mobile-app
flutter pub get
flutter run -d android
```

**Giảm log Android thừa** (MIUI, buffer queue...) khi dev trên Windows:

```powershell
cd mobile-app
.\scripts\run-android-quiet.ps1
```

Hoặc chỉ xem log Dart/Flutter của app:

```powershell
flutter logs
```

## Kiểm tra

```bash
flutter analyze
flutter test
```
