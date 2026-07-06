import 'package:flutter/material.dart';

/// Typography chuẩn app — Helvetica Neue (fallback Helvetica / Arial).
abstract final class AppTypography {
  static const family = 'Helvetica Neue';
  static const fallbacks = <String>['Helvetica', 'Arial', 'sans-serif'];

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

  static TextTheme materialTextTheme({Color? bodyColor, Color? displayColor}) {
    final base = Typography.material2021().black.apply(
      fontFamily: family,
      bodyColor: bodyColor,
      displayColor: displayColor,
    );
    return withoutUnderline(base);
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
