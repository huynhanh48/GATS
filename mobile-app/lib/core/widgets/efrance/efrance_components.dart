import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/illustrations/flat_vector/flat_vector.dart';

class EFranceFloatingRings extends StatefulWidget {
  const EFranceFloatingRings({super.key, this.coolPalette = false});

  final bool coolPalette;

  @override
  State<EFranceFloatingRings> createState() => _EFranceFloatingRingsState();
}

class _EFranceFloatingRingsState extends State<EFranceFloatingRings>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  List<_RingSpec> get _rings {
    if (widget.coolPalette) {
      return const [
        _RingSpec(left: 0.06, top: 0.1, size: 32, stroke: 2, color: AppColors.primary, phase: 0),
        _RingSpec(left: 0.82, top: 0.06, size: 24, stroke: 1.5, color: AppColors.primary, phase: 0.5),
        _RingSpec(left: 0.75, top: 0.42, size: 18, stroke: 1.5, color: AppColors.textSecondary, phase: 1.0),
        _RingSpec(left: 0.1, top: 0.55, size: 28, stroke: 2, color: AppColors.primary, phase: 1.5),
      ];
    }
    return const [
      _RingSpec(left: 0.08, top: 0.12, size: 28, stroke: 2.5, color: AppColors.accent, phase: 0),
      _RingSpec(left: 0.78, top: 0.08, size: 36, stroke: 3, color: AppColors.primary, phase: 0.4),
      _RingSpec(left: 0.72, top: 0.38, size: 22, stroke: 2, color: AppColors.primary, phase: 0.8),
      _RingSpec(left: 0.12, top: 0.52, size: 40, stroke: 3.5, color: AppColors.accent, phase: 1.2),
      _RingSpec(left: 0.55, top: 0.18, size: 18, stroke: 2, color: AppColors.primary, phase: 1.6),
      _RingSpec(left: 0.35, top: 0.62, size: 26, stroke: 2.5, color: AppColors.primary, phase: 2.0),
    ];
  }

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
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
        return LayoutBuilder(
          builder: (context, constraints) {
            return Stack(
              children: _rings.map((ring) {
                final offset = math.sin((_controller.value * math.pi * 2) + ring.phase) * 4;
                final alpha = widget.coolPalette ? 0.35 : 0.25;
                return Positioned(
                  left: constraints.maxWidth * ring.left,
                  top: constraints.maxHeight * ring.top + offset,
                  child: Container(
                    width: ring.size,
                    height: ring.size,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: ring.color.withValues(alpha: alpha),
                        width: ring.stroke,
                      ),
                    ),
                  ),
                );
              }).toList(),
            );
          },
        );
      },
    );
  }
}

class _RingSpec {
  const _RingSpec({
    required this.left,
    required this.top,
    required this.size,
    required this.stroke,
    required this.color,
    required this.phase,
  });

  final double left;
  final double top;
  final double size;
  final double stroke;
  final Color color;
  final double phase;
}

class EFranceHeroStage extends StatelessWidget {
  const EFranceHeroStage({super.key, this.useIllustration = true});

  final bool useIllustration;

  @override
  Widget build(BuildContext context) {
    if (useIllustration) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, 0),
        child: AnimatedParticlesBackground(
          height: 260,
          child: Container(
            width: double.infinity,
            margin: const EdgeInsets.only(top: AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(AppRadius.xl),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: const ClipRRect(
              borderRadius: BorderRadius.all(Radius.circular(AppRadius.xl)),
              child: CourseAppIllustration(height: 220),
            ),
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, 0),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned.fill(
            child: Container(
              margin: const EdgeInsets.only(bottom: AppSpacing.lg),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppRadius.xl),
                color: AppColors.primary.withValues(alpha: 0.12),
              ),
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: AppSpacing.lg,
            height: 80,
            child: DecoratedBox(
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(AppRadius.xl)),
                gradient: RadialGradient(
                  center: Alignment.bottomCenter,
                  radius: 1.2,
                  colors: [
                    AppColors.heroGlow,
                    AppColors.heroGlow.withValues(alpha: 0),
                  ],
                ),
              ),
            ),
          ),
          const Positioned.fill(
            child: EFranceFloatingRings(),
          ),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    color: AppColors.darkCanvasElevated,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.accent.withValues(alpha: 0.35),
                      width: 2,
                    ),
                  ),
                  child: Icon(
                    Icons.laptop_mac_rounded,
                    size: 72,
                    color: AppColors.primary.withValues(alpha: 0.7),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Icon(
                  Icons.person_rounded,
                  size: 48,
                  color: AppColors.surface.withValues(alpha: 0.5),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class EFranceFilledButton extends StatelessWidget {
  const EFranceFilledButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.color,
  });

  final String label;
  final VoidCallback onPressed;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final fill = color ?? AppColors.accent;
    return SizedBox(
      width: double.infinity,
      child: Material(
        color: fill,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        elevation: 2,
        shadowColor: fill.withValues(alpha: 0.25),
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
            child: Text(
              label.toUpperCase(),
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 15,
                letterSpacing: 0.8,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class EFranceOutlinedButton extends StatelessWidget {
  const EFranceOutlinedButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.borderColor,
    this.textColor,
  });

  final String label;
  final VoidCallback onPressed;
  final Color? borderColor;
  final Color? textColor;

  @override
  Widget build(BuildContext context) {
    final border = borderColor ?? AppColors.accent;
    final text = textColor ?? border;
    return SizedBox(
      width: double.infinity,
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.pill),
              border: Border.all(color: border, width: 2),
            ),
            child: Text(
              label.toUpperCase(),
              textAlign: TextAlign.center,
              style: TextStyle(
                color: text,
                fontWeight: FontWeight.w800,
                fontSize: 15,
                letterSpacing: 0.8,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class EFranceEntryLayout extends StatelessWidget {
  const EFranceEntryLayout({
    super.key,
    required this.greeting,
    required this.subtitle,
    required this.primaryLabel,
    required this.secondaryLabel,
    required this.onPrimary,
    required this.onSecondary,
    this.lightTheme = false,
  });

  final String greeting;
  final String subtitle;
  final String primaryLabel;
  final String secondaryLabel;
  final VoidCallback onPrimary;
  final VoidCallback onSecondary;
  final bool lightTheme;

  @override
  Widget build(BuildContext context) {
    final headlineColor = lightTheme ? AppColors.textPrimary : Colors.white;
    final subtitleColor = lightTheme
        ? AppColors.textSecondary
        : Colors.white.withValues(alpha: 0.85);

    return Column(
      children: [
        Expanded(
          child: lightTheme
              ? const EFranceHeroStage(useIllustration: true)
              : const EFranceHeroStage(),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(AppSpacing.xl, AppSpacing.lg, AppSpacing.xl, AppSpacing.xl),
          child: Column(
            children: [
              Text(
                greeting,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: headlineColor,
                      fontWeight: FontWeight.w800,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                subtitle,
                style: TextStyle(
                  color: subtitleColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  letterSpacing: lightTheme ? 0 : 0.6,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.xl),
              EFranceFilledButton(
                label: primaryLabel,
                onPressed: onPrimary,
                color: lightTheme ? AppColors.primary : null,
              ),
              const SizedBox(height: AppSpacing.md),
              EFranceOutlinedButton(
                label: secondaryLabel,
                onPressed: onSecondary,
                borderColor: lightTheme ? AppColors.primary.withValues(alpha: 0.35) : null,
                textColor: lightTheme ? AppColors.textSecondary : null,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
