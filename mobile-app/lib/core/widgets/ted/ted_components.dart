import 'package:flutter/material.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/data/mock/mock_data.dart';

class TedSearchBar extends StatelessWidget {
  const TedSearchBar({
    super.key,
    this.hint = 'Tìm khóa học AI...',
    this.onFilterTap,
  });

  final String hint;
  final VoidCallback? onFilterTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            decoration: GatsSurfaceDecoration.pill(context),
            child: Row(
              children: [
                Icon(Icons.search, color: gats.textSecondary, size: 22),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: hint,
                      hintStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: gats.textSecondary,
                          ),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Material(
          color: gats.lavenderAccent,
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: InkWell(
            onTap: onFilterTap,
            borderRadius: BorderRadius.circular(AppRadius.md),
            child: const SizedBox(
              width: 52,
              height: 52,
              child: Icon(Icons.tune_rounded, color: Colors.white),
            ),
          ),
        ),
      ],
    );
  }
}

class TedSectionHeader extends StatelessWidget {
  const TedSectionHeader({
    super.key,
    required this.title,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Row(
      children: [
        Expanded(
          child: Text(title, style: Theme.of(context).textTheme.titleMedium),
        ),
        if (actionLabel != null)
          TextButton(
            onPressed: onAction,
            style: TextButton.styleFrom(foregroundColor: gats.lavenderAccent),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(actionLabel!, style: const TextStyle(fontWeight: FontWeight.w600)),
                const Icon(Icons.chevron_right, size: 18),
              ],
            ),
          ),
      ],
    );
  }
}

class TedFilterChips extends StatelessWidget {
  const TedFilterChips({
    super.key,
    required this.labels,
    required this.selectedIndex,
    required this.onSelected,
  });

  final List<String> labels;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(labels.length, (index) {
          final selected = index == selectedIndex;
          return Padding(
            padding: EdgeInsets.only(right: index < labels.length - 1 ? AppSpacing.sm : 0),
            child: FilterChip(
              label: Text(labels[index]),
              selected: selected,
              onSelected: (_) => onSelected(index),
              showCheckmark: false,
              backgroundColor: gats.lavenderAccent.withValues(alpha: 0.08),
              selectedColor: gats.lavenderAccent,
              labelStyle: TextStyle(
                color: selected ? Colors.white : gats.textPrimary,
                fontWeight: FontWeight.w600,
              ),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.pill)),
              side: BorderSide.none,
            ),
          );
        }),
      ),
    );
  }
}

class TedCategoryRow extends StatelessWidget {
  const TedCategoryRow({
    super.key,
    required this.categories,
    required this.selectedIndex,
    required this.onSelected,
  });

  final List<String> categories;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.lg),
        itemBuilder: (context, index) {
          final selected = index == selectedIndex;
          return GestureDetector(
            onTap: () => onSelected(index),
            child: Text(
              categories[index],
              style: TextStyle(
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? gats.lavenderAccent : gats.textSecondary,
                fontSize: 15,
              ),
            ),
          );
        },
      ),
    );
  }
}

class TedPromoBanner extends StatefulWidget {
  const TedPromoBanner({
    super.key,
    required this.title,
    required this.subtitle,
    this.badge,
  });

  final String title;
  final String subtitle;
  final String? badge;

  @override
  State<TedPromoBanner> createState() => _TedPromoBannerState();
}

class _TedPromoBannerState extends State<TedPromoBanner> {
  int _page = 0;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: AppShadows.elevated,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.badge != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.bannerOverlay,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                widget.badge!,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
              ),
            ),
          if (widget.badge != null) const SizedBox(height: AppSpacing.sm),
          Text(
            widget.title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              height: 1.2,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            widget.subtitle,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 13),
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            children: List.generate(3, (index) {
              final active = index == _page;
              return GestureDetector(
                onTap: () => setState(() => _page = index),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.only(right: 6),
                  width: active ? 18 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: active ? AppColors.accent : Colors.white38,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _TedCourseCover extends StatelessWidget {
  const _TedCourseCover({required this.seed});

  final int seed;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: AppGradients.courseCover(seed),
      ),
    );
  }
}

class TedCourseCard extends StatelessWidget {
  const TedCourseCard({
    super.key,
    required this.course,
    this.showProgress = true,
    this.bookmarked = false,
    this.compact = false,
    this.vertical = false,
    this.showAddToCart = false,
    this.inCart = false,
    this.isPurchased = false,
    this.onTap,
    this.onAddToCart,
  });

  final CourseItem course;
  final bool showProgress;
  final bool bookmarked;
  final bool compact;
  final bool vertical;
  final bool showAddToCart;
  final bool inCart;
  final bool isPurchased;
  final VoidCallback? onTap;
  final VoidCallback? onAddToCart;

  @override
  Widget build(BuildContext context) {
    if (vertical) return _buildVertical(context);
    return _buildHorizontal(context);
  }

  Widget _buildVertical(BuildContext context) {
    final gats = context.gatsColors;
    final priceLabel = isPurchased
        ? context.l10n.storePurchased
        : course.isFree
            ? context.l10n.storeFree
            : '${course.price.toInt().toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')} đ';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Container(
          height: double.infinity,
          decoration: GatsSurfaceDecoration.card(
            context,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          padding: const EdgeInsets.all(AppSpacing.sm),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      _TedCourseCover(seed: course.id.hashCode),
                      if (isPurchased)
                        Positioned(
                          top: 6,
                          right: 6,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.green.shade600,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              context.l10n.storePurchased,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              SizedBox(
                height: 78,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      course.tag,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: gats.lavenderAccent,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Expanded(
                      child: Text(
                        course.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ),
                    Row(
                      children: [
                        Icon(Icons.star_rounded, color: gats.lavenderAccent, size: 14),
                        const SizedBox(width: 2),
                        Expanded(
                          child: Text(
                            '4.${course.id.hashCode % 5 + 2}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                        Text(
                          priceLabel,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: isPurchased
                                ? Colors.green.shade700
                                : course.isFree
                                    ? gats.lavenderAccent
                                    : AppColors.accent,
                          ),
                        ),
                        if (showAddToCart && !isPurchased) ...[
                          const SizedBox(width: 6),
                          GestureDetector(
                            onTap: onAddToCart,
                            behavior: HitTestBehavior.opaque,
                            child: Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: inCart
                                    ? gats.lavenderAccent.withValues(alpha: 0.12)
                                    : gats.lavenderAccent,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                inCart ? Icons.check : Icons.add,
                                color: inCart ? gats.lavenderAccent : Colors.white,
                                size: 16,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHorizontal(BuildContext context) {
    final gats = context.gatsColors;
    final thumbSize = compact ? 64.0 : 88.0;
    final effectiveShowProgress = showProgress && !compact;
    final hasProgress = effectiveShowProgress && course.progress > 0;
    final cardHeight = compact ? 76.0 : (hasProgress ? 132.0 : 120.0);

    return SizedBox(
      height: cardHeight,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          child: Container(
            decoration: GatsSurfaceDecoration.card(
              context,
              borderRadius: BorderRadius.circular(AppRadius.lg),
            ),
            padding: EdgeInsets.all(compact ? AppSpacing.sm : AppSpacing.md),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  child: SizedBox(
                    width: thumbSize,
                    height: thumbSize,
                    child: _TedCourseCover(seed: course.id.hashCode),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              course.tag,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: AppColors.accent,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          Icon(
                            bookmarked ? Icons.bookmark : Icons.bookmark_border,
                            color: bookmarked ? gats.lavenderAccent : gats.textSecondary,
                            size: 20,
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        course.title,
                        maxLines: compact ? 1 : 2,
                        overflow: TextOverflow.ellipsis,
                        style: (compact
                                ? Theme.of(context).textTheme.bodyMedium
                                : Theme.of(context).textTheme.titleSmall)
                            ?.copyWith(fontWeight: FontWeight.w700),
                      ),
                      SizedBox(height: compact ? 2 : 4),
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, color: AppColors.accent, size: 16),
                          const SizedBox(width: 2),
                          Flexible(
                            child: Text(
                              '4.${course.id.hashCode % 5 + 2} · ${course.lessonCount} bài',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ),
                        ],
                      ),
                      if (hasProgress) ...[
                        const SizedBox(height: AppSpacing.sm),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: course.progress,
                            minHeight: 6,
                            backgroundColor: gats.divider,
                            color: gats.lavenderAccent,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class TedOnboardingDots extends StatelessWidget {
  const TedOnboardingDots({super.key, required this.count, required this.index});

  final int count;
  final int index;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(count, (i) {
        final active = i == index;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          margin: const EdgeInsets.only(right: 6),
          width: active ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: active ? AppColors.primary : AppColors.chipInactive,
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }
}

class TedCircleNextButton extends StatelessWidget {
  const TedCircleNextButton({super.key, required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.primary,
      shape: const CircleBorder(),
      elevation: 4,
      shadowColor: AppColors.primary.withValues(alpha: 0.35),
      child: InkWell(
        onTap: onPressed,
        customBorder: const CircleBorder(),
        child: const SizedBox(
          width: 64,
          height: 64,
          child: Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 28),
        ),
      ),
    );
  }
}

class TedPrimaryPillButton extends StatelessWidget {
  const TedPrimaryPillButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.enabled = true,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final color = enabled ? AppColors.accent : AppColors.accent.withValues(alpha: 0.45);
    return Opacity(
      opacity: enabled ? 1 : 0.7,
      child: Material(
        color: color,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        child: InkWell(
          onTap: enabled ? onPressed : null,
          borderRadius: BorderRadius.circular(AppRadius.pill),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl, vertical: AppSpacing.lg),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Container(
                width: 36,
                height: 36,
                decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                child: const Icon(Icons.arrow_forward_rounded, color: AppColors.accent, size: 20),
              ),
            ],
          ),
        ),
        ),
      ),
    );
  }
}

class TedSocialProofHeader extends StatelessWidget {
  const TedSocialProofHeader({
    super.key,
    this.score = '4.8',
    this.reviewCount = '448',
    this.selectedFilter = 0,
    this.onFilterSelected,
  });

  final String score;
  final String reviewCount;
  final int selectedFilter;
  final ValueChanged<int>? onFilterSelected;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Column(
      children: [
        Text(score, style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w800)),
        const SizedBox(height: AppSpacing.sm),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(5, (_) {
            return const Icon(Icons.star_rounded, color: AppColors.accent, size: 28);
          }),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(l10n.rateUsBasedOnReviews(reviewCount), style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: AppSpacing.lg),
        TedFilterChips(
          labels: [
            l10n.reviewFilterExcellent,
            l10n.reviewFilterGood,
            l10n.reviewFilterAverage,
            l10n.reviewFilterNeedsImprovement,
          ],
          selectedIndex: selectedFilter,
          onSelected: onFilterSelected ?? (_) {},
        ),
      ],
    );
  }
}

class TedReviewSummary extends TedSocialProofHeader {
  const TedReviewSummary({
    super.key,
    super.score,
    super.reviewCount,
    super.selectedFilter,
    super.onFilterSelected,
  });
}

class TedReviewCard extends StatelessWidget {
  const TedReviewCard({
    super.key,
    required this.authorName,
    required this.body,
    required this.rating,
    required this.likes,
    required this.timeAgo,
  });

  final String authorName;
  final String body;
  final double rating;
  final int likes;
  final String timeAgo;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: GatsSurfaceDecoration.card(
        context,
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: gats.lavenderAccent.withValues(alpha: 0.12),
                child: Text(
                  authorName.characters.first,
                  style: TextStyle(fontWeight: FontWeight.w700, color: gats.lavenderAccent),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(authorName, style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.star_rounded, color: AppColors.accent, size: 14),
                    const SizedBox(width: 2),
                    Text(
                      rating.toStringAsFixed(1),
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.accent),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Text(body, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Icon(Icons.favorite_border, size: 16, color: gats.textSecondary),
              const SizedBox(width: 4),
              Text('$likes', style: Theme.of(context).textTheme.bodySmall),
              const Spacer(),
              Text(timeAgo, style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ],
      ),
    );
  }
}

class TedHomeHeader extends StatelessWidget {
  const TedHomeHeader({
    super.key,
    required this.greeting,
    required this.subtitle,
    this.onNotificationTap,
  });

  final String greeting;
  final String subtitle;
  final VoidCallback? onNotificationTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                greeting,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 4),
              Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),
        Material(
          color: GatsSurfaceDecoration.surfaceColor(context),
          shape: const CircleBorder(),
          child: InkWell(
            onTap: onNotificationTap,
            customBorder: const CircleBorder(),
            child: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: gats.lavenderAccent.withValues(alpha: 0.25)),
              ),
              child: Icon(Icons.notifications_none_rounded, color: gats.lavenderAccent),
            ),
          ),
        ),
      ],
    );
  }
}

class TedIllustrationPlaceholder extends StatelessWidget {
  const TedIllustrationPlaceholder({super.key, required this.icon});

  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 220,
        height: 220,
        decoration: BoxDecoration(
          color: AppColors.chipInactive,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, size: 96, color: AppColors.primary.withValues(alpha: 0.5)),
      ),
    );
  }
}
