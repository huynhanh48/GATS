import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_assets.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Coach ghi chú — PNG nền trong suốt, nhún nhẹ khi ack quiz.
class CoachNotetakingIllustration extends StatefulWidget {
  const CoachNotetakingIllustration({
    super.key,
    this.height = 200,
    this.bobAmplitude = 3,
  });

  final double height;
  final double bobAmplitude;

  @override
  State<CoachNotetakingIllustration> createState() => _CoachNotetakingIllustrationState();
}

class _CoachNotetakingIllustrationState extends State<CoachNotetakingIllustration>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  double get _bobAmplitude => widget.bobAmplitude;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: widget.height,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          final t = _controller.value;
          final bob = math.sin(t * math.pi) * _bobAmplitude;
          final tilt = math.sin(t * math.pi) * 0.012;

          return Transform.translate(
            offset: Offset(0, bob),
            child: Transform.rotate(
              angle: tilt,
              child: child,
            ),
          );
        },
        child: Stack(
          alignment: Alignment.bottomCenter,
          clipBehavior: Clip.none,
          children: [
            Image.asset(
              AppAssets.coachNotetaking,
              height: widget.height,
              fit: BoxFit.contain,
              filterQuality: FilterQuality.high,
            ),
            Positioned(
              right: widget.height * 0.18,
              bottom: widget.height * 0.28,
              child: _WritingDots(controller: _controller),
            ),
          ],
        ),
      ),
    );
  }
}

class _WritingDots extends StatelessWidget {
  const _WritingDots({required this.controller});

  final Animation<double> controller;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        final phase = controller.value;
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (i) {
            final delay = i * 0.22;
            final local = ((phase + delay) % 1.0);
            final opacity = local < 0.5 ? local * 2 : (1 - local) * 2;
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 1.5),
              child: Opacity(
                opacity: opacity.clamp(0.25, 1.0),
                child: Container(
                  width: 4,
                  height: 4,
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            );
          }),
        );
      },
    );
  }
}
