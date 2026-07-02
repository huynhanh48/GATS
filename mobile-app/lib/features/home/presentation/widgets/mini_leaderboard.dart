import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/data/mock/mock_data.dart';

class MiniLeaderboard extends StatelessWidget {
  const MiniLeaderboard({super.key, this.onSeeAll});

  final VoidCallback? onSeeAll;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final top3 = MockData.leaderboard.take(3).toList();
    final currentUser = MockData.leaderboard.firstWhere(
      (e) => e.isCurrentUser,
      orElse: () => MockData.leaderboard.last,
    );

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: GatsSurfaceDecoration.card(
        context,
        borderRadius: BorderRadius.circular(AppRadius.xl),
      ),
      child: Column(
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.accent.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.leaderboard_rounded,
                  color: AppColors.accent,
                  size: 16,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  AppStrings.homeLeaderboard,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ),
              TextButton(
                onPressed: onSeeAll,
                style: TextButton.styleFrom(
                  foregroundColor: gats.lavenderAccent,
                  padding: EdgeInsets.zero,
                  visualDensity: VisualDensity.compact,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      AppStrings.seeAll,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                    const Icon(Icons.chevron_right, size: 18),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          // Top 3
          ...top3.map((entry) => _LeaderboardRow(
                entry: entry,
                isLast: entry == top3.last && !currentUser.isCurrentUser,
              )),
          // Separator if user is not in top 3
          if (currentUser.rank > 3) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
              child: Row(
                children: [
                  const Expanded(child: Divider()),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                    ),
                    child: Text(
                      AppStrings.homeYourRank,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontSize: 11,
                          ),
                    ),
                  ),
                  const Expanded(child: Divider()),
                ],
              ),
            ),
            _LeaderboardRow(entry: currentUser, isLast: true),
          ],
        ],
      ),
    );
  }
}

class _LeaderboardRow extends StatelessWidget {
  const _LeaderboardRow({
    required this.entry,
    this.isLast = false,
  });

  final LeaderboardEntry entry;
  final bool isLast;

  IconData? get _medalIcon {
    return switch (entry.rank) {
      1 => Icons.emoji_events,
      2 => Icons.emoji_events,
      3 => Icons.emoji_events,
      _ => null,
    };
  }

  Color get _medalColor {
    return switch (entry.rank) {
      1 => const Color(0xFFFFD700),
      2 => const Color(0xFFC0C0C0),
      3 => const Color(0xFFCD7F32),
      _ => AppColors.textSecondary,
    };
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      margin: EdgeInsets.only(bottom: isLast ? 0 : AppSpacing.sm),
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: entry.isCurrentUser
            ? gats.lavenderAccent.withValues(alpha: 0.08)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: entry.isCurrentUser
            ? Border.all(
                color: gats.lavenderAccent.withValues(alpha: 0.2),
              )
            : null,
      ),
      child: Row(
        children: [
          // Rank
          SizedBox(
            width: 28,
            child: _medalIcon != null
                ? Icon(_medalIcon, color: _medalColor, size: 20)
                : Text(
                    '#${entry.rank}',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: entry.isCurrentUser
                          ? gats.lavenderAccent
                          : gats.textSecondary,
                    ),
                  ),
          ),
          const SizedBox(width: AppSpacing.md),
          // Avatar
          CircleAvatar(
            radius: 16,
            backgroundColor: entry.avatarColor.withValues(alpha: 0.15),
            child: Text(
              entry.name.characters.first,
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 12,
                color: entry.avatarColor,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          // Name
          Expanded(
            child: Text(
              entry.name,
              style: TextStyle(
                fontWeight: entry.isCurrentUser
                    ? FontWeight.w700
                    : FontWeight.w500,
                fontSize: 14,
                color: entry.isCurrentUser
                    ? gats.lavenderAccent
                    : gats.textPrimary,
              ),
            ),
          ),
          // XP
          Text(
            '${entry.xp} XP',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 13,
              color: entry.isCurrentUser
                  ? gats.lavenderAccent
                  : gats.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
