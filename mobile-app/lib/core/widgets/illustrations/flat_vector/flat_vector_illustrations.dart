import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/illustrations/flat_vector/flat_vector_colors.dart';

/// Soft organic blobs — nền kiểu SaaS flat vector.
class AnimatedBlobBackground extends StatefulWidget {
  const AnimatedBlobBackground({
    super.key,
    required this.child,
    this.height,
  });

  final Widget child;
  final double? height;

  @override
  State<AnimatedBlobBackground> createState() => _AnimatedBlobBackgroundState();
}

class _AnimatedBlobBackgroundState extends State<AnimatedBlobBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 5))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = _controller.value;
        return SizedBox(
          height: widget.height,
          width: double.infinity,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned(
                top: 12 + math.sin(t * math.pi * 2) * 6,
                left: -20,
                child: _blob(120, FlatVectorColors.sky),
              ),
              Positioned(
                top: 48 + math.cos(t * math.pi * 2) * 5,
                right: -10,
                child: _blob(90, FlatVectorColors.skyDeep),
              ),
              Positioned(
                bottom: 20 + math.sin(t * math.pi * 2 + 1) * 4,
                left: 60,
                child: _blob(56, FlatVectorColors.mint.withValues(alpha: 0.15)),
              ),
              child!,
            ],
          ),
        );
      },
      child: widget.child,
    );
  }

  Widget _blob(double size, Color color) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}

/// Before → After: học lan man vs lộ trình AI rõ ràng.
class TransformationIllustration extends StatefulWidget {
  const TransformationIllustration({super.key, this.height = 200});

  final double height;

  @override
  State<TransformationIllustration> createState() => _TransformationIllustrationState();
}

class _TransformationIllustrationState extends State<TransformationIllustration>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 4500))
      ..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: _TransformationPainter(t: _controller.value),
          size: Size(double.infinity, widget.height),
        );
      },
    );
  }
}

class _TransformationPainter extends CustomPainter {
  _TransformationPainter({required this.t});

  final double t;

  /// 0→1 trong nửa đầu chu kỳ — nhấn mạnh "Trước"
  double get _beforeEmphasis {
    if (t < 0.38) return 1;
    return (1 - Curves.easeIn.transform(((t - 0.38) / 0.22).clamp(0.0, 1.0))).clamp(0.35, 1.0);
  }

  /// 0→1 từ 0.42 — lộ "Sau"
  double get _afterReveal {
    if (t < 0.42) return 0;
    return Curves.easeOutCubic.transform(((t - 0.42) / 0.58).clamp(0.0, 1.0));
  }

  /// Mũi tên giữa nhấp nháy lúc chuyển cảnh
  double get _arrowPulse {
    if (t < 0.32 || t > 0.62) return 0.75;
    return 0.75 + math.sin(((t - 0.32) / 0.3) * math.pi) * 0.35;
  }

  @override
  void paint(Canvas canvas, Size size) {
    final rrect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.width, size.height),
      const Radius.circular(AppRadius.xl),
    );
    canvas.clipRRect(rrect);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), Paint()..color = AppColors.surface);

    final mid = size.width * 0.5;
    final leftBg = Color.lerp(
      FlatVectorColors.mutedGrey.withValues(alpha: 0.18),
      FlatVectorColors.mutedGrey.withValues(alpha: 0.08),
      _afterReveal,
    )!;
    final rightBg = Color.lerp(
      FlatVectorColors.sky.withValues(alpha: 0.5),
      FlatVectorColors.sky,
      _afterReveal,
    )!;

    canvas.drawRect(Rect.fromLTWH(0, 0, mid - 1, size.height), Paint()..color = leftBg);
    canvas.drawRect(Rect.fromLTWH(mid + 1, 0, mid, size.height), Paint()..color = rightBg);

    _drawLabel(canvas, 'Trước', Offset(mid * 0.5, 14), _beforeEmphasis);
    _drawLabel(canvas, 'Sau', Offset(mid + mid * 0.5, 14), 0.4 + _afterReveal * 0.6);

    canvas.saveLayer(null, Paint());
    canvas.save();
    canvas.clipRect(Rect.fromLTWH(0, 0, mid, size.height));
    _drawBeforeSide(canvas, size, mid, _beforeEmphasis);
    canvas.restore();

    canvas.save();
    canvas.clipRect(Rect.fromLTWH(mid, 0, mid, size.height));
    _drawAfterSide(canvas, size, mid, _afterReveal);
    canvas.restore();
    canvas.restore();

    _drawCenterArrow(canvas, size, mid);
  }

  void _drawLabel(Canvas canvas, String text, Offset center, double opacity) {
    if (opacity < 0.05) return;
    final tp = TextPainter(
      text: TextSpan(
        text: text,
        style: TextStyle(
          color: AppColors.textSecondary.withValues(alpha: opacity),
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(canvas, Offset(center.dx - tp.width / 2, center.dy));
  }

  void _drawCenterArrow(Canvas canvas, Size size, double mid) {
    final cy = size.height * 0.48;
    final scale = _arrowPulse;
    final r = 16 * scale;

    canvas.drawCircle(
      Offset(mid, cy),
      r,
      Paint()..color = AppColors.surface,
    );
    canvas.drawCircle(
      Offset(mid, cy),
      r,
      Paint()
        ..color = AppColors.primary.withValues(alpha: 0.25 + _afterReveal * 0.35)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );

    final arrowPaint = Paint()
      ..color = AppColors.primary.withValues(alpha: 0.6 + _arrowPulse * 0.4)
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    final path = Path()
      ..moveTo(mid - 6 * scale, cy)
      ..lineTo(mid + 2 * scale, cy)
      ..lineTo(mid - 1 * scale, cy - 5 * scale)
      ..moveTo(mid + 2 * scale, cy)
      ..lineTo(mid - 1 * scale, cy + 5 * scale);
    canvas.drawPath(path, arrowPaint);
  }

  void _drawBeforeSide(Canvas canvas, Size size, double mid, double emphasis) {
    final sway = math.sin(t * math.pi * 2) * 3 * emphasis;
    final cx = mid * 0.48;
    final baseY = size.height * 0.74 + sway;

    _drawPerson(
      canvas,
      cx: cx,
      baseY: baseY,
      headColor: FlatVectorColors.figureBefore,
      bodyColor: FlatVectorColors.mutedBlueGrey,
      mood: _Mood.tired,
      scale: 0.95 + emphasis * 0.05,
    );

    final bookPaint = Paint()..color = FlatVectorColors.mutedBlueGrey.withValues(alpha: 0.45 + emphasis * 0.2);
    for (var i = 0; i < 4; i++) {
      final wobble = math.sin(t * math.pi * 4 + i) * 1.5 * emphasis;
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromCenter(
            center: Offset(cx + 38, baseY - 18 - i * 5 + wobble),
            width: 30,
            height: 14 + i * 3.0,
          ),
          const Radius.circular(3),
        ),
        bookPaint,
      );
    }

    final hourglassX = cx - 44;
    final hourglassY = baseY - 6;
    canvas.drawPath(
      Path()
        ..moveTo(hourglassX - 7, hourglassY - 14)
        ..lineTo(hourglassX + 7, hourglassY - 14)
        ..lineTo(hourglassX, hourglassY)
        ..lineTo(hourglassX - 7, hourglassY + 14)
        ..lineTo(hourglassX + 7, hourglassY + 14)
        ..lineTo(hourglassX, hourglassY)
        ..close(),
      Paint()
        ..color = FlatVectorColors.mutedBlueGrey.withValues(alpha: 0.35)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5,
    );
    final sandY = hourglassY + 4 + (t % 0.38) / 0.38 * 8;
    if (t < 0.42) {
      canvas.drawRect(
        Rect.fromCenter(center: Offset(hourglassX, sandY.clamp(hourglassY, hourglassY + 10)), width: 4, height: 4),
        Paint()..color = FlatVectorColors.mutedBlueGrey.withValues(alpha: 0.5),
      );
    }

    if (emphasis > 0.5) {
      _drawZzz(canvas, Offset(cx - 20, baseY - 68), emphasis);
    }
  }

  void _drawZzz(Canvas canvas, Offset origin, double alpha) {
    final paint = Paint()
      ..color = AppColors.textSecondary.withValues(alpha: alpha * 0.5)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;
    for (var i = 0; i < 3; i++) {
      final o = origin + Offset(i * 7.0, -i * 5);
      canvas.drawLine(o, o + const Offset(6, 0), paint);
      canvas.drawLine(o + const Offset(6, 0), o + const Offset(10, -4), paint);
    }
  }

  void _drawAfterSide(Canvas canvas, Size size, double mid, double reveal) {
    if (reveal <= 0.01) return;

    final bounce = math.sin(reveal * math.pi) * 6;
    final cx = mid + (size.width - mid) * 0.42;
    final baseY = size.height * 0.7 - bounce;

    _drawPerson(
      canvas,
      cx: cx - 16,
      baseY: baseY,
      headColor: const Color(0xFF334155),
      bodyColor: FlatVectorColors.figureAfter,
      mood: _Mood.happy,
      scale: 0.9 + reveal * 0.1,
    );

    final phoneCenter = Offset(cx + 30, baseY - 30);
    final phoneW = 38.0 * (0.85 + reveal * 0.15);
    final phoneH = 54.0 * (0.85 + reveal * 0.15);
    final phone = RRect.fromRectAndRadius(
      Rect.fromCenter(center: phoneCenter, width: phoneW, height: phoneH),
      const Radius.circular(7),
    );
    canvas.drawRRect(phone, Paint()..color = const Color(0xFF334155));
    canvas.drawRRect(phone.deflate(3), Paint()..color = AppColors.surface);

    final progress = reveal * 0.82;
    canvas.drawArc(
      Rect.fromCenter(center: phoneCenter + const Offset(0, -4), width: 22, height: 22),
      -math.pi / 2,
      math.pi * 2 * progress,
      false,
      Paint()
        ..color = FlatVectorColors.figureAfter.withValues(alpha: reveal)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3
        ..strokeCap = StrokeCap.round,
    );

    final pct = (progress * 100).round();
    final tp = TextPainter(
      text: TextSpan(
        text: '$pct%',
        style: TextStyle(
          color: FlatVectorColors.figureAfter.withValues(alpha: reveal),
          fontSize: 8,
          fontWeight: FontWeight.w800,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(canvas, phoneCenter + Offset(-tp.width / 2, -tp.height / 2 - 4));

    final linePaint = Paint()
      ..color = FlatVectorColors.mint.withValues(alpha: reveal)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;
    final fullPath = Path()
      ..moveTo(cx + 50, baseY - 6)
      ..quadraticBezierTo(cx + 66, baseY - 30, cx + 80, baseY - 16)
      ..quadraticBezierTo(cx + 94, baseY - 2, cx + 108, baseY - 28);

    for (final metric in fullPath.computeMetrics()) {
      final extract = metric.extractPath(0, metric.length * reveal);
      canvas.drawPath(extract, linePaint);
    }

    for (var i = 0; i < 3; i++) {
      final starReveal = ((reveal - i * 0.12) / 0.7).clamp(0.0, 1.0);
      if (starReveal <= 0) continue;
      final pulse = 1 + math.sin(t * math.pi * 6 + i) * 0.15;
      canvas.drawCircle(
        Offset(cx + 86 + i * 11, baseY - 36 - i * 7),
        (4 + i) * starReveal * pulse,
        Paint()..color = FlatVectorColors.paleYellow.withValues(alpha: starReveal),
      );
    }
  }

  void _drawPerson(
    Canvas canvas, {
    required double cx,
    required double baseY,
    required Color headColor,
    required Color bodyColor,
    required _Mood mood,
    double scale = 1,
  }) {
    final headR = 16 * scale;
    canvas.drawCircle(Offset(cx, baseY - 52 * scale), headR, Paint()..color = headColor);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(cx, baseY - 22 * scale), width: 36 * scale, height: 44 * scale),
        Radius.circular(12 * scale),
      ),
      Paint()..color = bodyColor,
    );
    if (mood == _Mood.tired) {
      canvas.drawLine(
        Offset(cx - 5 * scale, baseY - 54 * scale),
        Offset(cx + 2 * scale, baseY - 50 * scale),
        Paint()
          ..color = AppColors.textSecondary
          ..strokeWidth = 1.5,
      );
    } else {
      canvas.drawArc(
        Rect.fromCenter(center: Offset(cx, baseY - 50 * scale), width: 12 * scale, height: 7 * scale),
        0.1,
        math.pi - 0.2,
        false,
        Paint()
          ..color = AppColors.textSecondary
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.5,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _TransformationPainter oldDelegate) => oldDelegate.t != t;
}

enum _Mood { tired, happy }

enum FlatQuizScene { referral, level, profile, motivation, interests, age, dailyGoal, purpose }

/// Mini illustration theo bước quiz — cùng phong cách flat vector.
class FlatQuizSceneIllustration extends StatefulWidget {
  const FlatQuizSceneIllustration({super.key, required this.scene});

  final FlatQuizScene scene;

  @override
  State<FlatQuizSceneIllustration> createState() => _FlatQuizSceneIllustrationState();
}

class _FlatQuizSceneIllustrationState extends State<FlatQuizSceneIllustration>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 2))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: _QuizScenePainter(scene: widget.scene, t: _controller.value),
          size: const Size(double.infinity, 88),
        );
      },
    );
  }
}

class _QuizScenePainter extends CustomPainter {
  _QuizScenePainter({required this.scene, required this.t});

  final FlatQuizScene scene;
  final double t;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(0, 0, size.width, size.height), const Radius.circular(16)),
      Paint()..color = FlatVectorColors.sky,
    );

    final floatY = math.sin(t * math.pi * 2) * 3;
    final cx = size.width * 0.5;

    switch (scene) {
      case FlatQuizScene.referral:
        for (var i = 0; i < 4; i++) {
          final angle = (i / 4) * math.pi * 2 + t * math.pi * 2;
          final dist = 26.0 + math.sin(t * math.pi * 2 + i) * 3;
          canvas.drawCircle(
            Offset(cx + math.cos(angle) * dist, size.height * 0.5 + math.sin(angle) * dist * 0.7 + floatY),
            6,
            Paint()..color = (i.isEven ? FlatVectorColors.figureAfter : FlatVectorColors.figureBefore)
                .withValues(alpha: 0.75),
          );
        }
        canvas.drawCircle(
          Offset(cx, size.height * 0.5 + floatY),
          14,
          Paint()..color = FlatVectorColors.figureAfter,
        );
        canvas.drawCircle(
          Offset(cx, size.height * 0.5 + floatY),
          6,
          Paint()..color = Colors.white,
        );
      case FlatQuizScene.level:
        for (var i = 0; i < 3; i++) {
          canvas.drawRRect(
            RRect.fromRectAndRadius(
              Rect.fromCenter(
                center: Offset(cx - 40 + i * 8, size.height * 0.55 - i * 6 + floatY),
                width: 32,
                height: 12 + i * 4.0,
              ),
              const Radius.circular(3),
            ),
            Paint()..color = FlatVectorColors.mutedBlueGrey.withValues(alpha: 0.55),
          );
        }
        canvas.drawCircle(
          Offset(cx + 36, size.height * 0.45 + floatY),
          14,
          Paint()..color = FlatVectorColors.figureAfter.withValues(alpha: 0.85),
        );
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromCenter(center: Offset(cx + 36, size.height * 0.62 + floatY), width: 28, height: 22),
            const Radius.circular(8),
          ),
          Paint()..color = FlatVectorColors.figureAfter,
        );
      case FlatQuizScene.profile:
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromCenter(center: Offset(cx - 28, size.height * 0.52 + floatY), width: 36, height: 44),
            const Radius.circular(6),
          ),
          Paint()..color = Colors.white.withValues(alpha: 0.9),
        );
        for (var i = 0; i < 3; i++) {
          canvas.drawCircle(
            Offset(cx - 36 + i * 10, size.height * 0.44 + floatY),
            2.5,
            Paint()..color = FlatVectorColors.figureAfter.withValues(alpha: 0.35 + i * 0.2),
          );
        }
        canvas.drawCircle(
          Offset(cx + 32, size.height * 0.4 + floatY),
          14,
          Paint()..color = FlatVectorColors.figureAfter,
        );
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromCenter(center: Offset(cx + 32, size.height * 0.58 + floatY), width: 26, height: 24),
            const Radius.circular(8),
          ),
          Paint()..color = FlatVectorColors.figureAfter.withValues(alpha: 0.85),
        );
      case FlatQuizScene.motivation:
        final pulse = 0.5 + math.sin(t * math.pi * 2) * 0.5;
        final path = Path();
        final hx = cx;
        final hy = size.height * 0.44 + floatY;
        final s = 12.0 + pulse * 3;
        path.moveTo(hx, hy + s * 0.8);
        path.cubicTo(hx - s * 1.6, hy - s * 0.4, hx - s * 0.6, hy - s * 1.2, hx, hy - s * 0.3);
        path.cubicTo(hx + s * 0.6, hy - s * 1.2, hx + s * 1.6, hy - s * 0.4, hx, hy + s * 0.8);
        canvas.drawPath(path, Paint()..color = FlatVectorColors.figureAfter);
        for (var i = 0; i < 3; i++) {
          canvas.drawCircle(
            Offset(cx + 30 + i * 6, hy - 14 - t * 8 - i * 4),
            2.5 - i * 0.4,
            Paint()..color = FlatVectorColors.paleYellow.withValues(alpha: (1 - t) * 0.8),
          );
        }
      case FlatQuizScene.interests:
        const positions = [
          Offset(-30, -8),
          Offset(0, -14),
          Offset(30, -8),
          Offset(-16, 16),
          Offset(16, 16),
        ];
        for (var i = 0; i < positions.length; i++) {
          final p = positions[i];
          final bob = math.sin(t * math.pi * 2 + i) * 2;
          canvas.drawRRect(
            RRect.fromRectAndRadius(
              Rect.fromCenter(
                center: Offset(cx + p.dx, size.height * 0.5 + p.dy + bob),
                width: 18,
                height: 18,
              ),
              const Radius.circular(5),
            ),
            Paint()..color = (i.isEven ? FlatVectorColors.figureAfter : FlatVectorColors.figureBefore)
                .withValues(alpha: 0.8),
          );
        }
      case FlatQuizScene.age:
        for (var i = 0; i < 3; i++) {
          final x = cx - 32 + i * 32.0;
          canvas.drawCircle(
            Offset(x, size.height * 0.38 + floatY),
            10,
            Paint()..color = i == 1 ? FlatVectorColors.figureAfter : FlatVectorColors.figureBefore,
          );
          canvas.drawRRect(
            RRect.fromRectAndRadius(
              Rect.fromCenter(center: Offset(x, size.height * 0.58 + floatY), width: 22, height: 26),
              const Radius.circular(8),
            ),
            Paint()..color = i == 1 ? FlatVectorColors.figureAfter : FlatVectorColors.mutedBlueGrey,
          );
        }
      case FlatQuizScene.dailyGoal:
        canvas.drawCircle(
          Offset(cx, size.height * 0.5 + floatY),
          20,
          Paint()
            ..color = FlatVectorColors.mutedBlueGrey.withValues(alpha: 0.35)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 5,
        );
        canvas.drawArc(
          Rect.fromCircle(center: Offset(cx, size.height * 0.5 + floatY), radius: 20),
          -math.pi / 2,
          math.pi * 2 * (0.25 + t * 0.5),
          false,
          Paint()
            ..color = FlatVectorColors.figureAfter
            ..style = PaintingStyle.stroke
            ..strokeWidth = 5
            ..strokeCap = StrokeCap.round,
        );
        canvas.drawCircle(
          Offset(cx, size.height * 0.5 + floatY),
          5,
          Paint()..color = FlatVectorColors.paleYellow,
        );
      case FlatQuizScene.purpose:
        canvas.drawCircle(
          Offset(cx, size.height * 0.42 + floatY),
          22,
          Paint()
            ..color = FlatVectorColors.figureAfter.withValues(alpha: 0.15)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 3,
        );
        canvas.drawCircle(
          Offset(cx, size.height * 0.42 + floatY),
          8,
          Paint()..color = FlatVectorColors.figureAfter,
        );
        canvas.drawLine(
          Offset(cx + 22, size.height * 0.42 + floatY),
          Offset(cx + 38, size.height * 0.32 + floatY),
          Paint()
            ..color = FlatVectorColors.figureAfter
            ..strokeWidth = 2.5,
        );
        canvas.drawCircle(
          Offset(cx + 52 + t * 4, size.height * 0.28 + floatY),
          4 + t * 2,
          Paint()..color = FlatVectorColors.paleYellow,
        );
    }
  }

  @override
  bool shouldRepaint(covariant _QuizScenePainter oldDelegate) =>
      oldDelegate.t != t || oldDelegate.scene != scene;
}

enum FlatCoachAckScene { recording, analyzing, encouraging, milestone }

/// Coach ghi chép / phân tích — popup ack giữa các bước quiz.
class FlatCoachNotetakingIllustration extends StatefulWidget {
  const FlatCoachNotetakingIllustration({
    super.key,
    required this.scene,
    this.size = 120,
  });

  final FlatCoachAckScene scene;
  final double size;

  @override
  State<FlatCoachNotetakingIllustration> createState() => _FlatCoachNotetakingIllustrationState();
}

class _FlatCoachNotetakingIllustrationState extends State<FlatCoachNotetakingIllustration>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 2000))
      ..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: _CoachNotetakingPainter(scene: widget.scene, t: _controller.value),
          size: Size(widget.size, widget.size * 0.85),
        );
      },
    );
  }
}

class _CoachNotetakingPainter extends CustomPainter {
  _CoachNotetakingPainter({required this.scene, required this.t});

  final FlatCoachAckScene scene;
  final double t;

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width * 0.5;
    final floatY = math.sin(t * math.pi * 2) * 4;
    final pencilBob = math.sin(t * math.pi * 2) * 6;

    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(0, 0, size.width, size.height), const Radius.circular(16)),
      Paint()..color = FlatVectorColors.sky,
    );

    switch (scene) {
      case FlatCoachAckScene.recording:
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromCenter(center: Offset(cx - 24, size.height * 0.55 + floatY), width: 44, height: 52),
            const Radius.circular(6),
          ),
          Paint()..color = Colors.white,
        );
        for (var i = 0; i < 3; i++) {
          final dotAlpha = ((t * 3 + i * 0.33) % 1.0);
          canvas.drawCircle(
            Offset(cx - 34 + i * 12, size.height * 0.48 + floatY),
            2.5,
            Paint()..color = FlatVectorColors.figureAfter.withValues(alpha: 0.2 + dotAlpha * 0.6),
          );
        }
        canvas.drawLine(
          Offset(cx + 8, size.height * 0.42 + floatY + pencilBob),
          Offset(cx + 22, size.height * 0.52 + floatY + pencilBob),
          Paint()
            ..color = FlatVectorColors.paleYellow
            ..strokeWidth = 3
            ..strokeCap = StrokeCap.round,
        );
        _drawCoach(canvas, size, Offset(cx + 28, size.height * 0.38 + floatY), floatY);
      case FlatCoachAckScene.analyzing:
        for (var i = 0; i < 3; i++) {
          final barH = 12.0 + (i + 1) * 8 + math.sin(t * math.pi * 2 + i) * 4;
          canvas.drawRRect(
            RRect.fromRectAndRadius(
              Rect.fromCenter(
                center: Offset(cx - 20 + i * 16, size.height * 0.58 + floatY),
                width: 10,
                height: barH,
              ),
              const Radius.circular(3),
            ),
            Paint()..color = FlatVectorColors.figureAfter.withValues(alpha: 0.35 + i * 0.15),
          );
        }
        canvas.drawCircle(
          Offset(cx + 36 + t * 6, size.height * 0.32 + floatY),
          5 + t * 2,
          Paint()..color = FlatVectorColors.paleYellow.withValues(alpha: 0.8),
        );
        _drawCoach(canvas, size, Offset(cx + 28, size.height * 0.38 + floatY), floatY);
      case FlatCoachAckScene.encouraging:
        final center = Offset(cx, size.height * 0.5 + floatY);
        canvas.drawCircle(center, 22, Paint()..color = FlatVectorColors.figureAfter);
        final check = Paint()
          ..color = Colors.white
          ..style = PaintingStyle.stroke
          ..strokeWidth = 4
          ..strokeCap = StrokeCap.round;
        canvas.drawLine(Offset(center.dx - 9, center.dy), Offset(center.dx - 2, center.dy + 7), check);
        canvas.drawLine(Offset(center.dx - 2, center.dy + 7), Offset(center.dx + 11, center.dy - 8), check);
        for (var i = 0; i < 5; i++) {
          final angle = (i / 5) * math.pi * 2 + t * math.pi * 2;
          final dist = 30.0 + math.sin(t * math.pi * 2 + i) * 3;
          canvas.drawCircle(
            Offset(center.dx + math.cos(angle) * dist, center.dy + math.sin(angle) * dist),
            2.5,
            Paint()..color = FlatVectorColors.paleYellow.withValues(alpha: 0.6 + math.sin(t * math.pi * 2 + i) * 0.4),
          );
        }
      case FlatCoachAckScene.milestone:
        final center = Offset(cx, size.height * 0.52 + floatY);
        canvas.drawCircle(
          center,
          24,
          Paint()
            ..color = FlatVectorColors.mutedBlueGrey.withValues(alpha: 0.3)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 6,
        );
        canvas.drawArc(
          Rect.fromCircle(center: center, radius: 24),
          -math.pi / 2,
          math.pi,
          false,
          Paint()
            ..color = FlatVectorColors.figureAfter
            ..style = PaintingStyle.stroke
            ..strokeWidth = 6
            ..strokeCap = StrokeCap.round,
        );
        final flag = Paint()..color = FlatVectorColors.paleYellow;
        canvas.drawLine(
          Offset(center.dx, center.dy - 6),
          Offset(center.dx, center.dy + 10),
          Paint()
            ..color = FlatVectorColors.figureAfter
            ..strokeWidth = 2.5,
        );
        canvas.drawPath(
          Path()
            ..moveTo(center.dx, center.dy - 6)
            ..lineTo(center.dx + 12, center.dy - 2)
            ..lineTo(center.dx, center.dy + 2)
            ..close(),
          flag,
        );
        for (var i = 0; i < 6; i++) {
          final angle = (i / 6) * math.pi * 2 + t * math.pi * 2;
          final dist = 34.0 + math.sin(t * math.pi * 2 + i) * 4;
          canvas.drawCircle(
            Offset(center.dx + math.cos(angle) * dist, center.dy + math.sin(angle) * dist),
            2.5,
            Paint()
              ..color = (i.isEven ? FlatVectorColors.figureAfter : FlatVectorColors.paleYellow)
                  .withValues(alpha: 0.7),
          );
        }
    }
  }

  void _drawCoach(Canvas canvas, Size size, Offset head, double floatY) {
    canvas.drawCircle(head, 18, Paint()..color = FlatVectorColors.figureAfter);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(head.dx, size.height * 0.6 + floatY), width: 34, height: 28),
        const Radius.circular(10),
      ),
      Paint()..color = FlatVectorColors.figureAfter.withValues(alpha: 0.9),
    );
  }

  @override
  bool shouldRepaint(covariant _CoachNotetakingPainter oldDelegate) =>
      oldDelegate.t != t || oldDelegate.scene != scene;
}

/// Confetti + check — loading hoàn tất onboarding.
class FlatCelebrationIllustration extends StatefulWidget {
  const FlatCelebrationIllustration({super.key, this.size = 100});

  final double size;

  @override
  State<FlatCelebrationIllustration> createState() => _FlatCelebrationIllustrationState();
}

class _FlatCelebrationIllustrationState extends State<FlatCelebrationIllustration>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1800))
      ..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: _CelebrationPainter(t: _controller.value),
          size: Size(widget.size, widget.size),
        );
      },
    );
  }
}

class _CelebrationPainter extends CustomPainter {
  _CelebrationPainter({required this.t});

  final double t;

  @override
  void paint(Canvas canvas, Size size) {
    final c = Offset(size.width / 2, size.height / 2);
    canvas.drawCircle(c, size.width * 0.38, Paint()..color = FlatVectorColors.skyDeep);

    canvas.drawCircle(c, size.width * 0.22, Paint()..color = FlatVectorColors.figureAfter);
    final check = Paint()
      ..color = AppColors.surface
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(c.dx - 10, c.dy), Offset(c.dx - 2, c.dy + 8), check);
    canvas.drawLine(Offset(c.dx - 2, c.dy + 8), Offset(c.dx + 12, c.dy - 8), check);

    for (var i = 0; i < 6; i++) {
      final angle = (i / 6) * math.pi * 2 + t * math.pi * 2;
      final dist = size.width * 0.32 + math.sin(t * math.pi * 2 + i) * 4;
      final color = i.isEven ? FlatVectorColors.figureAfter : FlatVectorColors.paleYellow;
      canvas.drawCircle(
        Offset(c.dx + math.cos(angle) * dist, c.dy + math.sin(angle) * dist),
        3.5,
        Paint()..color = color.withValues(alpha: 0.7 + math.sin(t * math.pi * 2 + i) * 0.3),
      );
    }
  }

  @override
  bool shouldRepaint(covariant _CelebrationPainter oldDelegate) => oldDelegate.t != t;
}

class AnimatedParticlesBackground extends StatefulWidget {
  const AnimatedParticlesBackground({
    super.key,
    required this.child,
    this.height,
  });

  final Widget child;
  final double? height;

  @override
  State<AnimatedParticlesBackground> createState() => _AnimatedParticlesBackgroundState();
}

class _AnimatedParticlesBackgroundState extends State<AnimatedParticlesBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 8))
      ..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = _controller.value;
        return SizedBox(
          height: widget.height,
          width: double.infinity,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned(
                top: 20 + math.sin(t * math.pi * 4) * 15,
                left: 10 + math.cos(t * math.pi * 2) * 10,
                child: _particle(18, FlatVectorColors.sky),
              ),
              Positioned(
                top: 80 + math.cos(t * math.pi * 6) * 20,
                right: 20 + math.sin(t * math.pi * 2) * 15,
                child: _particle(24, AppColors.accent.withValues(alpha: 0.6)),
              ),
              Positioned(
                bottom: 40 + math.sin(t * math.pi * 4 + 1) * 12,
                left: 60 + math.cos(t * math.pi * 4) * 8,
                child: _particle(14, AppColors.primary.withValues(alpha: 0.5)),
              ),
              Positioned(
                bottom: 80 + math.cos(t * math.pi * 2 + 2) * 18,
                right: 60 + math.sin(t * math.pi * 4) * 12,
                child: _particle(12, FlatVectorColors.skyDeep),
              ),
              Positioned(
                top: 40 + math.sin(t * math.pi * 8) * 8,
                left: 120 + math.cos(t * math.pi * 2) * 25,
                child: _particle(8, FlatVectorColors.mint),
              ),
              child!,
            ],
          ),
        );
      },
      child: widget.child,
    );
  }

  Widget _particle(double size, Color color) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}

class CourseAppIllustration extends StatefulWidget {
  const CourseAppIllustration({super.key, this.height = 200});

  final double height;

  @override
  State<CourseAppIllustration> createState() => _CourseAppIllustrationState();
}

class _CourseAppIllustrationState extends State<CourseAppIllustration>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 4))
      ..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return CustomPaint(
          painter: _CourseAppPainter(t: _controller.value),
          size: Size(double.infinity, widget.height),
        );
      },
    );
  }
}

class _CourseAppPainter extends CustomPainter {
  _CourseAppPainter({required this.t});

  final double t;

  @override
  void paint(Canvas canvas, Size size) {
    final rrect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.width, size.height),
      const Radius.circular(AppRadius.xl),
    );
    canvas.clipRRect(rrect);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), Paint()..color = AppColors.surface);

    final midX = size.width * 0.5;
    final midY = size.height * 0.5;

    canvas.drawCircle(
      Offset(midX, midY),
      80,
      Paint()..color = AppColors.primary.withValues(alpha: 0.05),
    );

    final float1 = math.sin(t * math.pi * 2) * 6;
    final float2 = math.cos(t * math.pi * 2 + 1) * 8;
    final float3 = math.sin(t * math.pi * 4) * 4;

    final deviceW = 100.0;
    final deviceH = 140.0;
    final deviceRect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: Offset(midX, midY + float1 * 0.5), width: deviceW, height: deviceH),
      const Radius.circular(12),
    );
    
    canvas.drawRRect(deviceRect, Paint()..color = const Color(0xFF334155));
    canvas.drawRRect(deviceRect.deflate(4), Paint()..color = AppColors.background);

    final videoW = deviceW - 16;
    final videoH = 50.0;
    final videoRect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: Offset(midX, midY - 25 + float1 * 0.5), width: videoW, height: videoH),
      const Radius.circular(6),
    );
    canvas.drawRRect(videoRect, Paint()..color = FlatVectorColors.skyDeep);

    final playPath = Path()
      ..moveTo(midX - 6, midY - 25 + float1 * 0.5 - 8)
      ..lineTo(midX + 10, midY - 25 + float1 * 0.5)
      ..lineTo(midX - 6, midY - 25 + float1 * 0.5 + 8)
      ..close();
    canvas.drawPath(playPath, Paint()..color = AppColors.surface);

    final barY = midY + 15 + float1 * 0.5;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(midX, barY), width: videoW, height: 6),
        const Radius.circular(3),
      ),
      Paint()..color = AppColors.divider,
    );
    final progress = (math.sin(t * math.pi) + 1) / 2 * 0.6 + 0.2;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(midX - videoW / 2, barY - 3, videoW * progress, 6),
        const Radius.circular(3),
      ),
      Paint()..color = AppColors.primary,
    );

    for(int i=0; i<3; i++) {
       canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(midX - videoW / 2, barY + 15 + i*10, videoW * (0.8 - i*0.2), 4),
          const Radius.circular(2),
        ),
        Paint()..color = AppColors.divider,
      );
    }

    _drawCertificate(canvas, Offset(midX - 70, midY - 20 + float2), 0.8);
    _drawCheckmark(canvas, Offset(midX + 70, midY - 30 + float3), 1.0);
    _drawStar(canvas, Offset(midX - 50, midY + 40 + float3), 0.7);
    _drawBook(canvas, Offset(midX + 60, midY + 30 + float2), 0.9);
  }

  void _drawCertificate(Canvas canvas, Offset center, double scale) {
    final w = 30 * scale;
    final h = 40 * scale;
    final rect = Rect.fromCenter(center: center, width: w, height: h);
    canvas.drawRect(rect, Paint()..color = AppColors.surface);
    canvas.drawRect(rect, Paint()..color = FlatVectorColors.mutedBlueGrey.withValues(alpha: 0.3)..style = PaintingStyle.stroke..strokeWidth = 2);
    
    canvas.drawCircle(Offset(center.dx, center.dy + h/2 - 10*scale), 6*scale, Paint()..color = AppColors.accent);
    final ribbonPath = Path()
      ..moveTo(center.dx - 4*scale, center.dy + h/2 - 8*scale)
      ..lineTo(center.dx - 6*scale, center.dy + h/2 + 6*scale)
      ..lineTo(center.dx, center.dy + h/2 + 2*scale)
      ..lineTo(center.dx + 6*scale, center.dy + h/2 + 6*scale)
      ..lineTo(center.dx + 4*scale, center.dy + h/2 - 8*scale);
    canvas.drawPath(ribbonPath, Paint()..color = AppColors.accent.withValues(alpha: 0.8));
  }

  void _drawCheckmark(Canvas canvas, Offset center, double scale) {
    final r = 16 * scale;
    canvas.drawCircle(center, r, Paint()..color = FlatVectorColors.mint);
    final check = Paint()
      ..color = AppColors.surface
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3 * scale
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(center.dx - 6*scale, center.dy), Offset(center.dx - 2*scale, center.dy + 4*scale), check);
    canvas.drawLine(Offset(center.dx - 2*scale, center.dy + 4*scale), Offset(center.dx + 6*scale, center.dy - 4*scale), check);
  }

  void _drawStar(Canvas canvas, Offset center, double scale) {
    final path = Path();
    final r1 = 12 * scale;
    final r2 = 5 * scale;
    for(int i=0; i<5; i++) {
      final angle1 = -math.pi/2 + i * math.pi*2/5;
      final angle2 = angle1 + math.pi/5;
      if (i == 0) {
        path.moveTo(center.dx + math.cos(angle1)*r1, center.dy + math.sin(angle1)*r1);
      } else {
        path.lineTo(center.dx + math.cos(angle1)*r1, center.dy + math.sin(angle1)*r1);
      }
      path.lineTo(center.dx + math.cos(angle2)*r2, center.dy + math.sin(angle2)*r2);
    }
    path.close();
    
    final pulse = 1 + math.sin(t * math.pi * 8) * 0.1;
    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.scale(pulse);
    canvas.translate(-center.dx, -center.dy);
    canvas.drawPath(path, Paint()..color = FlatVectorColors.paleYellow);
    canvas.restore();
  }

  void _drawBook(Canvas canvas, Offset center, double scale) {
    final w = 24 * scale;
    final h = 30 * scale;
    final rect = RRect.fromRectAndRadius(Rect.fromCenter(center: center, width: w, height: h), const Radius.circular(2));
    
    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(0.2);
    canvas.translate(-center.dx, -center.dy);
    
    canvas.drawRRect(rect, Paint()..color = AppColors.primary);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(center.dx - w/2 + 4*scale, center.dy - h/2 + 2*scale, w - 6*scale, h - 4*scale), const Radius.circular(1)), Paint()..color = AppColors.surface);
    canvas.drawLine(Offset(center.dx - w/2 + 6*scale, center.dy), Offset(center.dx + w/2 - 4*scale, center.dy), Paint()..color = AppColors.divider..strokeWidth = 2);
    
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _CourseAppPainter oldDelegate) => oldDelegate.t != t;
}
