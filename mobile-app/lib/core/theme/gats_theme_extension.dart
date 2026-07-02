import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Màu theo theme — dùng `context.gatsColors` thay vì `AppColors` tĩnh khi cần dark mode.
@immutable
class GatsThemeExtension extends ThemeExtension<GatsThemeExtension> {
  const GatsThemeExtension({
    required this.surface,
    required this.background,
    required this.textPrimary,
    required this.textSecondary,
    required this.divider,
    required this.navSelectedFill,
    required this.isStarry,
    required this.lavenderAccent,
  });

  final Color surface;
  final Color background;
  final Color textPrimary;
  final Color textSecondary;
  final Color divider;
  final Color navSelectedFill;
  final bool isStarry;
  final Color lavenderAccent;

  static const light = GatsThemeExtension(
    surface: AppColors.surface,
    background: AppColors.background,
    textPrimary: AppColors.textPrimary,
    textSecondary: AppColors.textSecondary,
    divider: AppColors.divider,
    navSelectedFill: Color(0xFFE9EAEF),
    isStarry: false,
    lavenderAccent: AppColors.primary,
  );

  static const dark = GatsThemeExtension(
    surface: AppColors.nightSurface,
    background: AppColors.nightSkyBottom,
    textPrimary: Color(0xFFF4F6FF),
    textSecondary: Color(0xFF9AA3C7),
    divider: Color(0xFF2A3158),
    navSelectedFill: Color(0xFF2D3560),
    isStarry: true,
    lavenderAccent: AppColors.nightLavender,
  );

  @override
  GatsThemeExtension copyWith({
    Color? surface,
    Color? background,
    Color? textPrimary,
    Color? textSecondary,
    Color? divider,
    Color? navSelectedFill,
    bool? isStarry,
    Color? lavenderAccent,
  }) {
    return GatsThemeExtension(
      surface: surface ?? this.surface,
      background: background ?? this.background,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      divider: divider ?? this.divider,
      navSelectedFill: navSelectedFill ?? this.navSelectedFill,
      isStarry: isStarry ?? this.isStarry,
      lavenderAccent: lavenderAccent ?? this.lavenderAccent,
    );
  }

  @override
  GatsThemeExtension lerp(ThemeExtension<GatsThemeExtension>? other, double t) {
    if (other is! GatsThemeExtension) return this;
    return GatsThemeExtension(
      surface: Color.lerp(surface, other.surface, t)!,
      background: Color.lerp(background, other.background, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      divider: Color.lerp(divider, other.divider, t)!,
      navSelectedFill: Color.lerp(navSelectedFill, other.navSelectedFill, t)!,
      isStarry: t < 0.5 ? isStarry : other.isStarry,
      lavenderAccent: Color.lerp(lavenderAccent, other.lavenderAccent, t)!,
    );
  }
}

extension GatsThemeContext on BuildContext {
  GatsThemeExtension get gatsColors =>
      Theme.of(this).extension<GatsThemeExtension>() ?? GatsThemeExtension.light;

  bool get isGatsDark => Theme.of(this).brightness == Brightness.dark;
}
