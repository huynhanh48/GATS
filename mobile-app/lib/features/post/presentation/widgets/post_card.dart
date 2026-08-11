import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/utils/media_url.dart';
import 'package:gats_academy/data/mock/models/post_models.dart';

/// Ảnh bìa bài viết — crop vừa khung [aspectRatio].
/// Hỗ trợ asset local và URL mạng (thumbnail từ BE).
class PostCoverImage extends StatelessWidget {
  const PostCoverImage({
    super.key,
    required this.assetPath,
    this.aspectRatio = 16 / 9,
    this.borderRadius,
    this.fallbackSeed = 0,
  });

  final String assetPath;
  final double aspectRatio;
  final BorderRadius? borderRadius;
  final int fallbackSeed;

  bool get _isNetwork {
    final resolved = MediaUrl.resolve(assetPath) ?? assetPath;
    return resolved.startsWith('http://') || resolved.startsWith('https://');
  }

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? BorderRadius.zero;
    final fallback = DecoratedBox(
      decoration: BoxDecoration(
        gradient: AppGradients.courseCover(fallbackSeed),
      ),
    );
    final path = MediaUrl.resolve(assetPath) ?? assetPath;

    return ClipRRect(
      borderRadius: radius,
      child: AspectRatio(
        aspectRatio: aspectRatio,
        child: _isNetwork
            ? Image.network(
                path,
                fit: BoxFit.cover,
                width: double.infinity,
                errorBuilder: (context, error, stackTrace) => fallback,
              )
            : Image.asset(
                path,
                fit: BoxFit.cover,
                width: double.infinity,
                errorBuilder: (context, error, stackTrace) => fallback,
              ),
      ),
    );
  }
}

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
    final body = post.previewExcerpt;
    final theme = Theme.of(context);
    final hasCover = post.coverImage != null && post.coverImage!.isNotEmpty;
    final contentPadding = EdgeInsets.all(compact ? AppSpacing.md : AppSpacing.lg);

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Container(
          clipBehavior: Clip.antiAlias,
          decoration: GatsSurfaceDecoration.card(
            context,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (hasCover)
                PostCoverImage(
                  assetPath: post.coverImage!,
                  aspectRatio: compact ? 2.1 : 16 / 9,
                  fallbackSeed: post.id.hashCode,
                ),
              Padding(
                padding: contentPadding,
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
                      style: theme.textTheme.labelSmall?.copyWith(color: gats.textSecondary),
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
