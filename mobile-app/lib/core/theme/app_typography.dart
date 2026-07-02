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
    );
  }

  static TextTheme materialTextTheme({Color? bodyColor, Color? displayColor}) {
    return Typography.material2021().black.apply(
      fontFamily: family,
      bodyColor: bodyColor,
      displayColor: displayColor,
    );
  }
}
