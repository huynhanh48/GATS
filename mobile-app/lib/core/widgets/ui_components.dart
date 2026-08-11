import 'package:flutter/material.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';

class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.trailing,
  });

  final String title;
  final String? subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleMedium),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(subtitle!, style: Theme.of(context).textTheme.bodySmall),
              ],
            ],
          ),
        ),
        ?trailing,
      ],
    );
  }
}

class StatTile extends StatelessWidget {
  const StatTile({
    super.key,
    required this.icon,
    required this.value,
    required this.label,
    this.color = AppColors.primary,
    this.backgroundColor,
  });

  final IconData icon;
  final String value;
  final String label;
  final Color color;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: backgroundColor ?? color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: AppSpacing.sm),
          Text(value, style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: color)),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}

class ProgressRing extends StatelessWidget {
  const ProgressRing({
    super.key,
    required this.progress,
    this.size = 72,
    this.strokeWidth = 6,
    this.color = AppColors.primary,
    this.child,
  });

  final double progress;
  final double size;
  final double strokeWidth;
  final Color color;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CircularProgressIndicator(
            value: progress.clamp(0.0, 1.0),
            strokeWidth: strokeWidth,
            backgroundColor: gats.divider,
            color: color,
          ),
          child ?? Text(
            '${(progress * 100).round()}%',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
        ],
      ),
    );
  }
}

class PillTabBar extends StatelessWidget {
  const PillTabBar({
    super.key,
    required this.tabs,
    required this.controller,
  });

  final List<String> tabs;
  final TabController controller;

  @override
  Widget build(BuildContext context) {
    // Equal-width pills look better for 2–4 course tabs; scroll only when crowded.
    final useFill = tabs.length <= 4;
    final trackRadius = BorderRadius.circular(AppRadius.lg);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
      padding: const EdgeInsets.all(4),
      decoration: GatsSurfaceDecoration.track(context, borderRadius: trackRadius),
      child: ClipRRect(
        borderRadius: trackRadius,
        child: useFill
            ? _FillPillTabBar(tabs: tabs, controller: controller)
            : _ScrollPillTabBar(tabs: tabs, controller: controller),
      ),
    );
  }
}

/// 3 tab trở xuống — 1 pill trượt, bo tròn cố định (không shadow).
class _FillPillTabBar extends StatelessWidget {
  const _FillPillTabBar({required this.tabs, required this.controller});

  final List<String> tabs;
  final TabController controller;

  @override
  Widget build(BuildContext context) {
    final animation = controller.animation ?? AlwaysStoppedAnimation(controller.index.toDouble());

    return LayoutBuilder(
      builder: (context, constraints) {
        return AnimatedBuilder(
          animation: animation,
          builder: (context, _) {
            final position = animation.value.clamp(0.0, (tabs.length - 1).toDouble());
            final tabWidth = constraints.maxWidth / tabs.length;

            return SizedBox(
              height: 40,
              child: Stack(
                children: [
                  Positioned(
                    left: position * tabWidth,
                    width: tabWidth,
                    top: 0,
                    bottom: 0,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: GatsSurfaceDecoration.surfaceColor(context),
                        borderRadius: BorderRadius.circular(AppRadius.pill),
                      ),
                    ),
                  ),
                  Row(
                    children: List.generate(tabs.length, (index) {
                      final selected = (position - index).abs() < 0.5;
                      return Expanded(
                        child: _PillTabLabel(
                          label: tabs[index],
                          selected: selected,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 4,
                            vertical: 10,
                          ),
                          onTap: () {
                            if (controller.index != index) {
                              controller.animateTo(index);
                            }
                          },
                        ),
                      );
                    }),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

/// Nhiều tab — không trượt, đổi pill tức thì (không animate decoration).
class _ScrollPillTabBar extends StatelessWidget {
  const _ScrollPillTabBar({required this.tabs, required this.controller});

  final List<String> tabs;
  final TabController controller;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: List.generate(tabs.length, (index) {
              final selected = controller.index == index;
              return _PillTabLabel(
                label: tabs[index],
                selected: selected,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                showBackground: selected,
                onTap: () {
                  if (controller.index != index) {
                    controller.animateTo(index);
                  }
                },
              );
            }),
          ),
        );
      },
    );
  }
}

class _PillTabLabel extends StatelessWidget {
  const _PillTabLabel({
    required this.label,
    required this.selected,
    required this.onTap,
    this.padding = const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 10),
    this.showBackground = false,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;
  final EdgeInsets padding;
  final bool showBackground;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: padding,
        decoration: showBackground
            ? BoxDecoration(
                color: GatsSurfaceDecoration.surfaceColor(context),
                borderRadius: BorderRadius.circular(AppRadius.pill),
              )
            : null,
        alignment: Alignment.center,
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            label,
            maxLines: 1,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
              fontSize: 12,
              color: selected ? gats.lavenderAccent : gats.textSecondary,
              decoration: TextDecoration.none,
            ),
          ),
        ),
      ),
    );
  }
}

class CourseCover extends StatelessWidget {
  const CourseCover({
    super.key,
    required this.title,
    required this.seed,
    this.height = 80,
    this.subtitle,
    this.matchBadge,
  });

  final String title;
  final int seed;
  final double height;
  final String? subtitle;
  final String? matchBadge;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      constraints: BoxConstraints(minHeight: height),
      decoration: BoxDecoration(
        gradient: AppGradients.courseCover(seed),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.md)),
      ),
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (matchBadge != null)
            Align(
              alignment: Alignment.centerRight,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  matchBadge!,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          if (matchBadge != null) const SizedBox(height: AppSpacing.sm),
          Text(
            title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 16,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(
              subtitle!,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }
}

class FlipCard extends StatefulWidget {
  const FlipCard({
    super.key,
    required this.isFlipped,
    required this.front,
    required this.back,
  });

  final bool isFlipped;
  final Widget front;
  final Widget back;

  @override
  State<FlipCard> createState() => _FlipCardState();
}

class _FlipCardState extends State<FlipCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );
    if (widget.isFlipped) {
      _controller.value = 1;
    }
  }

  @override
  void didUpdateWidget(covariant FlipCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isFlipped != oldWidget.isFlipped) {
      if (widget.isFlipped) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    }
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
        final angle = _controller.value * 3.1415926535;
        final showFront = angle < 3.1415926535 / 2;

        return Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..setEntry(3, 2, 0.001)
            ..rotateY(angle),
          child: showFront
              ? widget.front
              : Transform(
                  alignment: Alignment.center,
                  transform: Matrix4.rotationY(3.1415926535),
                  child: widget.back,
                ),
        );
      },
    );
  }
}
