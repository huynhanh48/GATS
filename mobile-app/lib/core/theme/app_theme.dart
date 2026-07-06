import 'package:flutter/material.dart';

import 'app_typography.dart';

import 'gats_theme_extension.dart';

export 'app_gradients.dart';
export 'app_shadows.dart';
export 'app_spacing.dart';
export 'app_typography.dart';
export 'gats_surface.dart';
export 'gats_theme_extension.dart';

abstract final class AppColors {
  static const surface = Color(0xFFFFFFFF);
  static const background = Color(0xFFF9F9FE);
  static const accent = Color(0xFFFF7622);
  static const primary = Color(0xFF0070EB);

  static const primaryLight = Color(0xFF3D8FEF);
  static const surfaceElevated = background;
  static const textPrimary = Color(0xFF101828);
  static const textSecondary = Color(0xFF667085);
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFEF4444);
  static const divider = Color(0xFFE5E7F0);
  static const darkCanvas = Color(0xFF101828);
  static const darkCanvasElevated = Color(0xFF1A2234);

  /// Dark mode — palette kiểu app sleep (Silent Moon).
  static const nightSkyTop = Color(0xFF1A2151);
  static const nightSkyBottom = Color(0xFF0B112B);
  static const nightSurface = Color(0xFF1E2347);
  static const nightSurfaceElevated = Color(0xFF252B52);
  static const nightLavender = Color(0xFF8E97FD);
  static const nightCloud = Color(0xFF2A1F5E);

  static Color get chipInactive => primary.withValues(alpha: 0.08);
  static Color get bannerOverlay => surface.withValues(alpha: 0.15);
  static Color get heroGlow => accent.withValues(alpha: 0.35);
  static Color get onboardingBlob => primary.withValues(alpha: 0.06);
  static Color get onboardingBlobAccent => primary.withValues(alpha: 0.12);
}

abstract final class AppTheme {
  static ThemeData get light {
    final baseText = AppTypography.materialTextTheme(
      bodyColor: AppColors.textPrimary,
      displayColor: AppColors.textPrimary,
    );
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      primary: AppColors.primary,
      secondary: AppColors.accent,
      surface: AppColors.surface,
    );

    return ThemeData(
      useMaterial3: true,
      fontFamily: AppTypography.family,
      fontFamilyFallback: AppTypography.fallbacks,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.background,
      textTheme: AppTypography.withoutUnderline(baseText.copyWith(
        headlineSmall: baseText.headlineSmall?.copyWith(
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
        ),
        titleMedium: baseText.titleMedium?.copyWith(
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        bodyMedium: baseText.bodyMedium?.copyWith(color: AppColors.textPrimary),
        bodySmall: baseText.bodySmall?.copyWith(color: AppColors.textSecondary),
      )),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: AppTypography.style(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.surface,
        height: 64,
        indicatorColor: AppColors.primary.withValues(alpha: 0.12),
        labelBehavior: NavigationDestinationLabelBehavior.alwaysHide,
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return IconThemeData(
            size: 26,
            color: selected ? AppColors.primary : AppColors.textSecondary,
          );
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return AppTypography.style(
            fontSize: 10,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
            color: selected ? AppColors.primary : AppColors.textSecondary,
          );
        }),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.accent,
          foregroundColor: Colors.white,
          textStyle: AppTypography.style(fontWeight: FontWeight.w700),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        contentTextStyle: AppTypography.style(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Colors.white,
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      dialogTheme: DialogThemeData(
        titleTextStyle: AppTypography.style(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
        ),
        contentTextStyle: AppTypography.style(
          fontSize: 14,
          color: AppColors.textSecondary,
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.surface,
        labelStyle: AppTypography.style(
          color: AppColors.textPrimary,
          fontSize: 13,
        ),
        side: const BorderSide(color: AppColors.divider),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: AppTypography.style(fontWeight: FontWeight.w600).copyWith(
            decoration: TextDecoration.none,
            decorationColor: Colors.transparent,
          ),
        ),
      ),
      dividerTheme: const DividerThemeData(color: AppColors.divider),
      extensions: const [GatsThemeExtension.light],
    );
  }

  static ThemeData get dark {
    final baseText = AppTypography.materialTextTheme(
      bodyColor: const Color(0xFFF4F6FF),
      displayColor: const Color(0xFFF4F6FF),
    );
    final colorScheme = ColorScheme.dark(
      primary: AppColors.nightLavender,
      secondary: AppColors.accent,
      surface: AppColors.nightSurface,
      onSurface: const Color(0xFFF4F6FF),
      onPrimary: AppColors.nightSkyBottom,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: AppTypography.family,
      fontFamilyFallback: AppTypography.fallbacks,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.nightSkyBottom,
      canvasColor: AppColors.nightSkyBottom,
      textTheme: AppTypography.withoutUnderline(baseText.copyWith(
        headlineSmall: baseText.headlineSmall?.copyWith(
          fontWeight: FontWeight.w700,
          color: const Color(0xFFF4F6FF),
        ),
        titleMedium: baseText.titleMedium?.copyWith(
          fontWeight: FontWeight.w600,
          color: const Color(0xFFF4F6FF),
        ),
        bodyMedium: baseText.bodyMedium?.copyWith(color: const Color(0xFFF4F6FF)),
        bodySmall: baseText.bodySmall?.copyWith(color: const Color(0xFF9AA3C7)),
      )),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: const Color(0xFFF4F6FF),
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: AppTypography.style(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: const Color(0xFFF4F6FF),
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.nightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.nightSurface,
        height: 64,
        indicatorColor: AppColors.nightLavender.withValues(alpha: 0.2),
        labelBehavior: NavigationDestinationLabelBehavior.alwaysHide,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.nightLavender,
          foregroundColor: AppColors.nightSkyBottom,
          textStyle: AppTypography.style(fontWeight: FontWeight.w700),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        contentTextStyle: AppTypography.style(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: const Color(0xFFF4F6FF),
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      dialogTheme: DialogThemeData(
        titleTextStyle: AppTypography.style(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: const Color(0xFFF4F6FF),
        ),
        contentTextStyle: AppTypography.style(
          fontSize: 14,
          color: const Color(0xFF9AA3C7),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.nightSurfaceElevated,
        labelStyle: AppTypography.style(
          color: const Color(0xFFF4F6FF),
          fontSize: 13,
        ),
        side: const BorderSide(color: Color(0xFF2A3158)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.nightLavender,
          textStyle: AppTypography.style(fontWeight: FontWeight.w600).copyWith(
            decoration: TextDecoration.none,
            decorationColor: Colors.transparent,
          ),
        ),
      ),
      dividerTheme: const DividerThemeData(color: Color(0xFF2A3158)),
      extensions: const [GatsThemeExtension.dark],
    );
  }
}
