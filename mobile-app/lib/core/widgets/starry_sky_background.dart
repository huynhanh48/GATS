import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_assets.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Nền gradient đêm + sao + mây + trăng — kiểu app sleep.
class StarrySkyBackground extends StatelessWidget {
  const StarrySkyBackground({
    super.key,
    required this.child,
    this.showMoon = true,
    this.showClouds = true,
  });

  final Widget child;
  final bool showMoon;
  final bool showClouds;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        const CustomPaint(painter: _StarrySkyPainter()),
        if (showClouds) const CustomPaint(painter: _NightCloudsPainter()),
        if (showMoon)
          Positioned(
            top: MediaQuery.paddingOf(context).top + 8,
            left: 24,
            child: Opacity(
              opacity: 0.9,
              child: Image.asset(
                AppAssets.starryMoonGlow,
                width: 72,
                height: 72,
                fit: BoxFit.contain,
                filterQuality: FilterQuality.high,
              ),
            ),
          ),
        child,
      ],
    );
  }
}

class _StarrySkyPainter extends CustomPainter {
  const _StarrySkyPainter();

  static final _stars = _generateStars(120, 42);

  static List<_Star> _generateStars(int count, int seed) {
    final random = math.Random(seed);
    return List.generate(count, (_) {
      return _Star(
        x: random.nextDouble(),
        y: random.nextDouble() * 0.85,
        radius: random.nextDouble() * 1.6 + 0.4,
        opacity: random.nextDouble() * 0.55 + 0.25,
      );
    });
  }

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    canvas.drawRect(
      rect,
      Paint()
        ..shader = const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [AppColors.nightSkyTop, AppColors.nightSkyBottom],
        ).createShader(rect),
    );

    for (final star in _stars) {
      canvas.drawCircle(
        Offset(star.x * size.width, star.y * size.height),
        star.radius,
        Paint()..color = Colors.white.withValues(alpha: star.opacity),
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _NightCloudsPainter extends CustomPainter {
  const _NightCloudsPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = AppColors.nightCloud.withValues(alpha: 0.55);

    _drawCloud(canvas, paint, centerX: size.width * 0.2, centerY: size.height * 0.78, scale: 1.1);
    _drawCloud(canvas, paint, centerX: size.width * 0.75, centerY: size.height * 0.88, scale: 0.9);
    _drawCloud(canvas, paint, centerX: size.width * 0.5, centerY: size.height * 0.95, scale: 1.4);
  }

  void _drawCloud(Canvas canvas, Paint paint, {
    required double centerX,
    required double centerY,
    required double scale,
  }) {
    final r = 36.0 * scale;
    canvas.drawCircle(Offset(centerX - r * 0.8, centerY), r * 0.9, paint);
    canvas.drawCircle(Offset(centerX, centerY - r * 0.2), r, paint);
    canvas.drawCircle(Offset(centerX + r * 0.85, centerY), r * 0.85, paint);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(centerX, centerY + r * 0.15), width: r * 3.2, height: r * 1.1),
        const Radius.circular(24),
      ),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _Star {
  const _Star({
    required this.x,
    required this.y,
    required this.radius,
    required this.opacity,
  });

  final double x;
  final double y;
  final double radius;
  final double opacity;
}

/// Bọc scaffold chính — tự bật trời sao khi dark mode.
class GatsThemedScaffold extends StatelessWidget {
  const GatsThemedScaffold({
    super.key,
    required this.body,
    this.appBar,
    this.bottomNavigationBar,
    this.floatingActionButton,
    this.extendBody = false,
  });

  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? bottomNavigationBar;
  final Widget? floatingActionButton;
  final bool extendBody;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final content = Scaffold(
      backgroundColor: gats.isStarry ? Colors.transparent : gats.background,
      extendBody: extendBody,
      appBar: appBar,
      body: body,
      bottomNavigationBar: bottomNavigationBar,
      floatingActionButton: floatingActionButton,
    );

    if (!gats.isStarry) return content;

    return StarrySkyBackground(child: content);
  }
}
