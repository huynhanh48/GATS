import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:in_app_review/in_app_review.dart';

class RateAppSheet {
  static bool _reviewInFlight = false;

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => const _RateAppSheetContent(),
    );
  }

  static Future<void> openStoreListing() async {
    if (kIsWeb) return;
    await InAppReview.instance.openStoreListing();
  }

  /// Gọi dialog đánh giá native (iOS/Android). Web bỏ qua.
  static Future<bool> requestNativeReview() async {
    if (kIsWeb) return false;
    if (_reviewInFlight) return false;

    _reviewInFlight = true;
    try {
      final review = InAppReview.instance;
      if (await review.isAvailable()) {
        await review.requestReview();
        return true;
      }
      await review.openStoreListing();
      return true;
    } catch (_) {
      return false;
    } finally {
      _reviewInFlight = false;
    }
  }
}

class _RateAppSheetContent extends StatefulWidget {
  const _RateAppSheetContent();

  @override
  State<_RateAppSheetContent> createState() => _RateAppSheetContentState();
}

class _RateAppSheetContentState extends State<_RateAppSheetContent> {
  bool _isSubmitting = false;

  Future<void> _onRate() async {
    if (_isSubmitting) return;
    setState(() => _isSubmitting = true);
    try {
      await RateAppSheet.requestNativeReview();
      if (mounted) Navigator.of(context).pop();
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      margin: const EdgeInsets.all(AppSpacing.lg),
      padding: const EdgeInsets.fromLTRB(AppSpacing.xl, AppSpacing.xl, AppSpacing.xl, AppSpacing.lg),
      decoration: GatsSurfaceDecoration.card(
        context,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        lightShadow: AppShadows.elevated,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: gats.divider,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (_) {
              return const Padding(
                padding: EdgeInsets.symmetric(horizontal: 2),
                child: Icon(Icons.star_rounded, color: AppColors.accent, size: 28),
              );
            }),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            AppStrings.rateSheetTitle,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            AppStrings.rateSheetSubtitle,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: gats.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xl),
          TedPrimaryPillButton(
            label: AppStrings.rateSheetCta,
            onPressed: _onRate,
            enabled: !_isSubmitting,
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(AppStrings.rateSheetLater),
          ),
        ],
      ),
    );
  }
}
