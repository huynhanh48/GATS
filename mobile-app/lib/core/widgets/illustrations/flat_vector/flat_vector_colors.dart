import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Pastel palette derived from GATS brand — cool tones only on onboarding.
abstract final class FlatVectorColors {
  static Color get mint => AppColors.primary.withValues(alpha: 0.55);
  static Color get sky => AppColors.primary.withValues(alpha: 0.12);
  static Color get skyDeep => AppColors.primary.withValues(alpha: 0.22);
  static Color get mutedGrey => AppColors.textSecondary.withValues(alpha: 0.35);
  static Color get mutedBlueGrey => const Color(0xFF94A3B8);
  static Color get paleYellow => AppColors.accent.withValues(alpha: 0.45);
  static Color get figureBefore => const Color(0xFFCBD5E1);
  static Color get figureAfter => AppColors.primary;
  static Color get jacketInner => AppColors.surface;
}
