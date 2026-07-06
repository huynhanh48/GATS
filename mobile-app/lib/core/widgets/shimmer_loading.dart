import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';

/// Shimmer loading effect for skeleton screens.
///
/// Wrap placeholder shapes in this widget to show a subtle
/// left-to-right shimmer animation while content loads.
class ShimmerLoading extends StatefulWidget {
  const ShimmerLoading({
    super.key,
    required this.child,
    this.baseColor,
    this.highlightColor,
  });

  final Widget child;
  final Color? baseColor;
  final Color? highlightColor;

  @override
  State<ShimmerLoading> createState() => _ShimmerLoadingState();
}

class _ShimmerLoadingState extends State<ShimmerLoading>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final base = widget.baseColor ?? gats.divider.withValues(alpha: 0.3);
    final highlight =
        widget.highlightColor ?? gats.divider.withValues(alpha: 0.08);

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return ShaderMask(
          blendMode: BlendMode.srcATop,
          shaderCallback: (bounds) {
            return LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [base, highlight, base],
              stops: [
                (_controller.value - 0.3).clamp(0.0, 1.0),
                _controller.value,
                (_controller.value + 0.3).clamp(0.0, 1.0),
              ],
            ).createShader(bounds);
          },
          child: child,
        );
      },
      child: widget.child,
    );
  }
}

/// Skeleton placeholder for a card-shaped area.
class SkeletonCard extends StatelessWidget {
  const SkeletonCard({
    super.key,
    this.height = 120,
    this.width,
    this.borderRadius,
  });

  final double height;
  final double? width;
  final BorderRadius? borderRadius;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: gats.divider.withValues(alpha: 0.3),
        borderRadius: borderRadius ?? BorderRadius.circular(AppRadius.md),
      ),
    );
  }
}

/// Skeleton for a text line.
class SkeletonLine extends StatelessWidget {
  const SkeletonLine({
    super.key,
    this.width = double.infinity,
    this.height = 14,
  });

  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: gats.divider.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(height / 2),
      ),
    );
  }
}

/// Pre-built skeleton layout that mimics a course card.
class CourseCardSkeleton extends StatelessWidget {
  const CourseCardSkeleton({super.key, this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    return ShimmerLoading(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SkeletonCard(
            height: compact ? 56 : 100,
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          const SizedBox(height: AppSpacing.sm),
          const SkeletonLine(width: 140),
          const SizedBox(height: AppSpacing.xs),
          const SkeletonLine(width: 90, height: 10),
        ],
      ),
    );
  }
}

/// Pre-built skeleton for a horizontal course list.
class CourseListSkeleton extends StatelessWidget {
  const CourseListSkeleton({super.key, this.itemCount = 3, this.height = 92});

  final int itemCount;
  final double height;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height + 30,
      child: ShimmerLoading(
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: itemCount,
          separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.md),
          itemBuilder: (_, _) => SizedBox(
            width: 300,
            child: SkeletonCard(
              height: height,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
          ),
        ),
      ),
    );
  }
}

/// Full-page skeleton that mimics the home screen structure.
class HomeScreenSkeleton extends StatelessWidget {
  const HomeScreenSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ShimmerLoading(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Greeting bar
            const SkeletonCard(height: 56),
            const SizedBox(height: AppSpacing.lg),
            // Continue learning
            SkeletonCard(
              height: 130,
              borderRadius: BorderRadius.circular(AppRadius.xl),
            ),
            const SizedBox(height: AppSpacing.xl),
            // Section header
            const SkeletonLine(width: 160),
            const SizedBox(height: AppSpacing.md),
            // Course cards
            Row(
              children: [
                Expanded(
                  child: SkeletonCard(
                    height: 92,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: SkeletonCard(
                    height: 92,
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),
            // Tab bar
            const SkeletonCard(height: 40),
            const SizedBox(height: AppSpacing.lg),
            // List items
            for (var i = 0; i < 3; i++) ...[
              const SkeletonCard(height: 60),
              const SizedBox(height: AppSpacing.sm),
            ],
          ],
        ),
      ),
    );
  }
}
