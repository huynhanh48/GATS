# e-France → GATS Academy Mapping

Nguồn mockup: [`design/e-France/`](../design/e-France/)

## Màn đã áp dụng

| e-France file | GATS screen | Flutter file |
|---|---|---|
| `TELA DE ENTRADA ESCURO.png` | Entry onboarding (dark) | `features/onboarding/presentation/entry_screen.dart` |
| `TELA LOGING ALUNO ESCURO.png` | Login mock (email/Google/Apple) | `features/auth/presentation/login_screen.dart` |
| Widgets hero + rings + CTA | e-France component library | `core/widgets/efrance/efrance_components.dart` |

## Màn tham chiếu (chưa implement)

| e-France file | Ghi chú |
|---|---|
| `TELA DE ENTRADA CLARO.png` | Light variant — future, theo system theme |
| `TELA CODIGO ESCURO.png` | Decorative circles header — có thể áp loading sau |
| `PAGINA DO ALUNO ESCURO.png` | Home dark + 3D avatar — future |
| Login, Payment, Inbox, Forum... | Ngoài scope GATS hiện tại |

## Remap màu

| e-France element | GATS token |
|---|---|
| Nền đen full-screen | `AppColors.darkCanvas` (#101828) |
| Card hero | `primary` 12% opacity + `darkCanvasElevated` |
| Glow đáy hero | `AppColors.heroGlow` (accent 35%) |
| Vòng tròn decorative | `accent`, `primary`, `surface` opacity |
| CTA filled (ESTUDANTE) | `AppColors.accent` → "Bắt đầu" |
| CTA outline (PROFESSOR) | border/text `accent` → "Bỏ qua" |
| Headline trắng | `Colors.white` trên `darkCanvas` |

**Không copy** hồng/magenta gốc e-France — chỉ layout và pattern sinh động.

## Flow onboarding

```
EntryScreen → (Bắt đầu) LoginScreen → Quiz → Results → Rate Us (social proof) → [Dialog native] → Loading → MainShell
EntryScreen → (Bỏ qua) markComplete → MainShell (guest)
Rate Us "Để sau" → Loading (không dialog)
LoginScreen Back → EntryScreen
Quiz Back bước 1 → EntryScreen
```
