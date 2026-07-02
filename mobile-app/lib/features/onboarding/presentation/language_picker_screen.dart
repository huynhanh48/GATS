import 'package:flutter/material.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';
import 'package:gats_academy/features/onboarding/presentation/widgets/onboarding_option_card.dart';
import 'package:gats_academy/l10n/app_localizations.dart';

/// Màn chọn ngôn ngữ lần đầu vào app (trước welcome).
class LanguagePickerScreen extends StatefulWidget {
  const LanguagePickerScreen({super.key, required this.onContinue});

  final VoidCallback onContinue;

  @override
  State<LanguagePickerScreen> createState() => _LanguagePickerScreenState();
}

class _LanguagePickerScreenState extends State<LanguagePickerScreen> {
  AppLanguage _selected = AppLanguage.english;

  AppLocalizations get _l10n => lookupAppLocalizations(_previewLocale);

  Locale get _previewLocale => switch (_selected) {
        AppLanguage.english => const Locale('en'),
        AppLanguage.vietnamese => const Locale('vi'),
      };

  Future<void> _continue() async {
    await AppLocaleController.instance.setLocale(_previewLocale);
    if (!mounted) return;
    widget.onContinue();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = _l10n;
    final bottomInset = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.fromLTRB(AppSpacing.xl, AppSpacing.xl, AppSpacing.xl, bottomInset + AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(flex: 2),
              Text(
                l10n.languagePickerTitle,
                textAlign: TextAlign.center,
                style: AppTypography.style(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  height: 1.15,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                l10n.languagePickerSubtitle,
                textAlign: TextAlign.center,
                style: AppTypography.style(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                  height: 1.45,
                ),
              ),
              const Spacer(flex: 2),
              OnboardingOptionCard(
                icon: Icons.translate_rounded,
                title: l10n.languageVietnamese,
                subtitle: l10n.languageVietnameseSubtitle,
                isSelected: _selected == AppLanguage.vietnamese,
                onTap: () => setState(() => _selected = AppLanguage.vietnamese),
              ),
              const SizedBox(height: AppSpacing.md),
              OnboardingOptionCard(
                icon: Icons.language_rounded,
                title: l10n.languageEnglish,
                subtitle: l10n.languageEnglishSubtitle,
                isSelected: _selected == AppLanguage.english,
                onTap: () => setState(() => _selected = AppLanguage.english),
              ),
              const Spacer(flex: 3),
              SizedBox(
                height: 54,
                child: FilledButton(
                  onPressed: _continue,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.pill)),
                    textStyle: AppTypography.style(fontWeight: FontWeight.w700, fontSize: 16),
                  ),
                  child: Text(l10n.languagePickerContinue),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
