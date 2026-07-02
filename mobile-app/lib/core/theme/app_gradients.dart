import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

abstract final class AppGradients {
  static const primary = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.primary, AppColors.primaryLight],
  );

  static const accent = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.accent, AppColors.primary],
  );

  static const cardSoft = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.surface, AppColors.background],
  );

  static LinearGradient courseCover(int seed) {
    final palettes = [
      [AppColors.primary, AppColors.primary],
      [AppColors.accent, AppColors.accent],
      [AppColors.primary, AppColors.accent],
      [AppColors.surface, AppColors.background],
    ];
    final colors = palettes[seed.abs() % palettes.length];
    return LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: colors,
    );
  }
}
