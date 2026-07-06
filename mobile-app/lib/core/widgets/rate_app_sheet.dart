import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:gats_academy/core/config/store_config.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:url_launcher/url_launcher.dart';

enum RateAppOutcome { nativeRequested, storeOpened, failed }

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
    await _openPlayStore(feedbackContext: null);
  }

  /// Gọi dialog đánh giá native (iOS/Android). Fallback sang Google Play / App Store.
  static Future<RateAppOutcome> requestNativeReview({BuildContext? feedbackContext}) async {
    if (kIsWeb) return RateAppOutcome.failed;
    if (_reviewInFlight) return RateAppOutcome.failed;

    _reviewInFlight = true;
    try {
      final review = InAppReview.instance;
      final available = await review.isAvailable();
      debugPrint('[RateApp] isAvailable=$available, release=$kReleaseMode');

      // flutter run / sideload: Google thường không cho hiện in-app review.
      final skipNativeOnDebugAndroid =
          kDebugMode && !kIsWeb && defaultTargetPlatform == TargetPlatform.android;

      if (!skipNativeOnDebugAndroid && available) {
        await review.requestReview();
        // Google có thể gọi thành công nhưng không vẽ UI (quota) — không detect được.
        return RateAppOutcome.nativeRequested;
      }

      if (!available) {
        _showSnackIfMounted(
          feedbackContext,
          AppStrings.reviewNativeUnavailable,
        );
      }

      final opened = await _openPlayStore(feedbackContext: feedbackContext);
      return opened ? RateAppOutcome.storeOpened : RateAppOutcome.failed;
    } catch (e, st) {
      debugPrint('[RateApp] requestNativeReview failed: $e\n$st');
      final opened = await _openPlayStore(feedbackContext: feedbackContext);
      return opened ? RateAppOutcome.storeOpened : RateAppOutcome.failed;
    } finally {
      _reviewInFlight = false;
    }
  }

  static Future<bool> _openPlayStore({BuildContext? feedbackContext}) async {
    if (kIsWeb) return false;

    try {
      await InAppReview.instance.openStoreListing();
      _showSnackIfMounted(feedbackContext, AppStrings.reviewOpenedPlayStore);
      return true;
    } catch (e) {
      debugPrint('[RateApp] openStoreListing plugin failed: $e');
    }

    if (!Platform.isAndroid) return false;

    final marketOk = await _launchExternal(StoreConfig.playStoreMarketUri);
    if (marketOk) {
      _showSnackIfMounted(feedbackContext, AppStrings.reviewOpenedPlayStore);
      return true;
    }

    final httpsOk = await _launchExternal(StoreConfig.playStoreHttpsUri);
    if (httpsOk) {
      _showSnackIfMounted(feedbackContext, AppStrings.reviewOpenedPlayStore);
    }
    return httpsOk;
  }

  static Future<bool> _launchExternal(Uri uri) async {
    try {
      if (!await canLaunchUrl(uri)) return false;
      return launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (e) {
      debugPrint('[RateApp] launchUrl failed ($uri): $e');
      return false;
    }
  }

  static void _showSnackIfMounted(BuildContext? context, String message) {
    if (context == null || !context.mounted) return;
    _showSnack(context, message);
  }

  static void _showSnack(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
      ),
    );
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
      await RateAppSheet.requestNativeReview(feedbackContext: context);
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
