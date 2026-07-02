import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/data/mock/models/post_models.dart';

class PostCard extends StatelessWidget {
  const PostCard({
    super.key,
    required this.post,
    required this.canReadFull,
    this.courseTitle,
    this.onTap,
    this.compact = false,
  });

  final CommunityPost post;
  final bool canReadFull;
  final String? courseTitle;
  final VoidCallback? onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final body = canReadFull ? post.body : post.previewExcerpt;
    final theme = Theme.of(context);

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Container(
          decoration: GatsSurfaceDecoration.card(
            context,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          padding: EdgeInsets.all(compact ? AppSpacing.md : AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _Badge(
                    label: post.badgeLabel,
                    highlight: post.scope == PostScope.global,
                  ),
                  if (courseTitle != null && !compact) ...[
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Text(
                        courseTitle!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.labelSmall?.copyWith(color: gats.textSecondary),
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                post.title,
                maxLines: compact ? 2 : 3,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                body,
                maxLines: compact ? 2 : 4,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: gats.textSecondary,
                  height: 1.45,
                ),
              ),
              if (!canReadFull) ...[
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: [
                    const Icon(Icons.lock_outline, size: 14, color: AppColors.accent),
                    const SizedBox(width: 4),
                    Text(
                      AppStrings.postPreviewLocked,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: AppColors.accent,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: AppSpacing.sm),
              Text(
                AppStrings.postByAuthor.replaceFirst('%s', post.authorName),
                style: theme.textTheme.labelSmall?.copyWith(color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.label, required this.highlight});

  final String label;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: highlight
            ? AppColors.primary.withValues(alpha: 0.12)
            : AppColors.accent.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: highlight ? AppColors.primary : AppColors.accent,
        ),
      ),
    );
  }
}

String formatPostTimeAgo(DateTime publishedAt) {
  final diff = DateTime.now().difference(publishedAt);
  if (diff.inMinutes < 60) {
    return AppStrings.postTimeAgo.replaceFirst('%s', '${diff.inMinutes} phút');
  }
  if (diff.inHours < 24) {
    return AppStrings.postTimeAgo.replaceFirst('%s', '${diff.inHours} giờ');
  }
  return AppStrings.postTimeAgo.replaceFirst('%s', '${diff.inDays} ngày');
}
