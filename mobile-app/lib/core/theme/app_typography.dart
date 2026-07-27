import 'package:flutter/material.dart';

/// Typography dùng chung với Web và Admin.
abstract final class AppTypography {
  static const family = 'Inter';
  static const headingFamily = 'Outfit';
  static const fallbacks = <String>['Roboto', 'Arial', 'sans-serif'];

  static TextStyle style({
    double? fontSize,
    FontWeight fontWeight = FontWeight.w400,
    Color? color,
    double? height,
    double? letterSpacing,
    FontStyle fontStyle = FontStyle.normal,
    TextDecoration decoration = TextDecoration.none,
  }) {
    return TextStyle(
      fontFamily: family,
      fontFamilyFallback: fallbacks,
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
      fontStyle: fontStyle,
      decoration: decoration,
      decorationColor: Colors.transparent,
    );
  }

  /// Chỉ dùng cho heading thương hiệu/marketing, không dùng cho form hoặc
  /// nội dung học tập dài.
  static TextStyle headingStyle({
    double? fontSize,
    FontWeight fontWeight = FontWeight.w700,
    Color? color,
    double? height,
    double? letterSpacing,
  }) {
    return TextStyle(
      fontFamily: headingFamily,
      fontFamilyFallback: const <String>[family, ...fallbacks],
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
      decoration: TextDecoration.none,
      decorationColor: Colors.transparent,
    );
  }

  static TextTheme materialTextTheme({Color? bodyColor, Color? displayColor}) {
    final base = Typography.material2021().black.apply(
      fontFamily: family,
      bodyColor: bodyColor,
      displayColor: displayColor,
    );
    TextStyle? heading(TextStyle? style) => style?.copyWith(
      fontFamily: headingFamily,
      fontFamilyFallback: const <String>[family, ...fallbacks],
    );

    return withoutUnderline(
      base.copyWith(
        displayLarge: heading(base.displayLarge),
        displayMedium: heading(base.displayMedium),
        displaySmall: heading(base.displaySmall),
        headlineLarge: heading(base.headlineLarge),
        headlineMedium: heading(base.headlineMedium),
        headlineSmall: heading(base.headlineSmall),
        titleLarge: heading(base.titleLarge),
      ),
    );
  }

  /// Material 3 + TextButton có thể gây gạch chân kép — strip toàn bộ theme.
  static TextTheme withoutUnderline(TextTheme theme) {
    TextStyle? strip(TextStyle? style) => style?.copyWith(
      decoration: TextDecoration.none,
      decorationColor: Colors.transparent,
    );

    return theme.copyWith(
      displayLarge: strip(theme.displayLarge),
      displayMedium: strip(theme.displayMedium),
      displaySmall: strip(theme.displaySmall),
      headlineLarge: strip(theme.headlineLarge),
      headlineMedium: strip(theme.headlineMedium),
      headlineSmall: strip(theme.headlineSmall),
      titleLarge: strip(theme.titleLarge),
      titleMedium: strip(theme.titleMedium),
      titleSmall: strip(theme.titleSmall),
      bodyLarge: strip(theme.bodyLarge),
      bodyMedium: strip(theme.bodyMedium),
      bodySmall: strip(theme.bodySmall),
      labelLarge: strip(theme.labelLarge),
      labelMedium: strip(theme.labelMedium),
      labelSmall: strip(theme.labelSmall),
    );
  }
}
