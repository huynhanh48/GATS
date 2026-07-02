import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Decoration / surface helpers — dùng thay `AppColors.surface` tĩnh trong app chính.
abstract final class GatsSurfaceDecoration {
  static GatsThemeExtension _gats(BuildContext context) => context.gatsColors;

  static Color surfaceColor(BuildContext context, {double starryAlpha = 0.9}) {
    final gats = _gats(context);
    return gats.surface.withValues(alpha: gats.isStarry ? starryAlpha : 1);
  }

  static BoxDecoration card(
    BuildContext context, {
    BorderRadius? borderRadius,
    double starryAlpha = 0.9,
    List<BoxShadow>? lightShadow,
  }) {
    final gats = _gats(context);
    final radius = borderRadius ?? BorderRadius.circular(AppRadius.md);
    return BoxDecoration(
      color: surfaceColor(context, starryAlpha: starryAlpha),
      borderRadius: radius,
      border: gats.isStarry ? Border.all(color: gats.divider.withValues(alpha: 0.5)) : null,
      boxShadow: gats.isStarry ? null : (lightShadow ?? AppShadows.card),
    );
  }

  static BoxDecoration track(BuildContext context, {BorderRadius? borderRadius}) {
    final gats = _gats(context);
    return BoxDecoration(
      color: gats.divider.withValues(alpha: 0.5),
      borderRadius: borderRadius ?? BorderRadius.circular(AppRadius.lg),
    );
  }

  static BoxDecoration pill(BuildContext context, {double starryAlpha = 0.92}) {
    return card(
      context,
      borderRadius: BorderRadius.circular(AppRadius.pill),
      starryAlpha: starryAlpha,
    );
  }
}

class GatsSurface extends StatelessWidget {
  const GatsSurface({
    super.key,
    required this.child,
    this.borderRadius,
    this.starryAlpha = 0.9,
    this.padding,
    this.clipBehavior = Clip.antiAlias,
  });

  final Widget child;
  final BorderRadius? borderRadius;
  final double starryAlpha;
  final EdgeInsetsGeometry? padding;
  final Clip clipBehavior;

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? BorderRadius.circular(AppRadius.md);
    return DecoratedBox(
      decoration: GatsSurfaceDecoration.card(
        context,
        borderRadius: radius,
        starryAlpha: starryAlpha,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: radius,
        clipBehavior: clipBehavior,
        child: padding != null ? Padding(padding: padding!, child: child) : child,
      ),
    );
  }
}
