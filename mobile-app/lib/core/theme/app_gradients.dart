import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

abstract final class AppGradients {
  static const primary = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF3D8FEF), AppColors.primary],
  );

  static const accent = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFF9A56), AppColors.accent],
  );

  /// Softer accent → primary diagonal for hero cards.
  static const heroCta = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.accent, Color(0xFF0052B4)],
  );

  static const cardSoft = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.surface, AppColors.background],
  );

  /// Night-mode variant for hero sections.
  static const nightHero = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF2A1F5E), AppColors.nightSkyBottom],
  );

  static LinearGradient courseCover(int seed) {
    final palettes = [
      [const Color(0xFF3D8FEF), AppColors.primary],
      [const Color(0xFFFF9A56), AppColors.accent],
      [const Color(0xFF7C3AED), const Color(0xFF5B21B6)],
      [const Color(0xFF10B981), const Color(0xFF059669)],
      [AppColors.primary, const Color(0xFF7C3AED)],
    ];
    final colors = palettes[seed.abs() % palettes.length];
    return LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: colors,
    );
  }
}

