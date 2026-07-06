import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/theme/gats_surface.dart';
import 'package:gats_academy/data/mock/mock_data.dart';

class LeaderboardSection extends StatefulWidget {
  const LeaderboardSection({super.key});

  @override
  State<LeaderboardSection> createState() => _LeaderboardSectionState();
}

class _LeaderboardSectionState extends State<LeaderboardSection> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final entries = MockData.leaderboard;
    final displayEntries = _expanded ? entries : entries.take(5).toList();
    final currentUser = entries.firstWhere(
      (e) => e.isCurrentUser,
      orElse: () => entries.last,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Podium for top 3
        if (!_expanded) ...[
          _Podium(top3: entries.take(3).toList()),
          const SizedBox(height: AppSpacing.xl),
        ],

        // List
        Container(
          decoration: GatsSurfaceDecoration.card(
            context,
            borderRadius: BorderRadius.circular(AppRadius.xl),
          ),
          child: Column(
            children: [
              ...displayEntries.map((entry) => _LeaderboardRow(
                    entry: entry,
                  )),
              // Your rank (if not in displayed list)
              if (!displayEntries.any((e) => e.isCurrentUser)) ...[
                const Divider(height: 1),
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.lg,
                    vertical: AppSpacing.sm,
                  ),
                  child: Text(
                    AppStrings.homeYourRank,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 11),
                    textAlign: TextAlign.center,
                  ),
                ),
                _LeaderboardRow(entry: currentUser),
              ],
              // Expand/Collapse
              TextButton(
                onPressed: () => setState(() => _expanded = !_expanded),
                style: TextButton.styleFrom(
                  foregroundColor: gats.lavenderAccent,
                  padding: const EdgeInsets.all(AppSpacing.md),
                  textStyle: AppTypography.style(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ).copyWith(decoration: TextDecoration.none),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _expanded ? 'Thu gọn' : AppStrings.hubViewAll,
                      style: AppTypography.style(
                        color: gats.lavenderAccent,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ).copyWith(decoration: TextDecoration.none),
                    ),
                    Icon(
                      _expanded ? Icons.expand_less : Icons.expand_more,
                      color: gats.lavenderAccent,
                      size: 18,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Podium extends StatelessWidget {
  const _Podium({required this.top3});

  final List<LeaderboardEntry> top3;

  @override
  Widget build(BuildContext context) {
    if (top3.length < 3) return const SizedBox.shrink();

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        _PodiumPlace(entry: top3[1], height: 70, medal: '🥈'),
        _PodiumPlace(entry: top3[0], height: 90, medal: '🥇'),
        _PodiumPlace(entry: top3[2], height: 55, medal: '🥉'),
      ],
    );
  }
}

class _PodiumPlace extends StatelessWidget {
  const _PodiumPlace({
    required this.entry,
    required this.height,
    required this.medal,
  });

  final LeaderboardEntry entry;
  final double height;
  final String medal;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(medal, style: const TextStyle(fontSize: 24, decoration: TextDecoration.none)),
        const SizedBox(height: 4),
        CircleAvatar(
          radius: 22,
          backgroundColor: entry.avatarColor.withValues(alpha: 0.15),
          child: Text(
            entry.name.characters.first,
            style: TextStyle(
              fontWeight: FontWeight.w800,
              color: entry.avatarColor,
              decoration: TextDecoration.none,
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          entry.name,
          style: TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 12,
            color: gats.textPrimary,
            decoration: TextDecoration.none,
          ),
          overflow: TextOverflow.ellipsis,
        ),
        Text(
          '${entry.xp} XP',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontSize: 11,
                decoration: TextDecoration.none,
              ),
        ),
        const SizedBox(height: 6),
        Container(
          width: 80,
          height: height,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                entry.avatarColor.withValues(alpha: 0.2),
                entry.avatarColor.withValues(alpha: 0.05),
              ],
            ),
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(AppRadius.md),
            ),
          ),
          child: Center(
            child: Text(
              '#${entry.rank}',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 18,
                color: entry.avatarColor,
                decoration: TextDecoration.none,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _LeaderboardRow extends StatelessWidget {
  const _LeaderboardRow({required this.entry});

  final LeaderboardEntry entry;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      decoration: BoxDecoration(
        color: entry.isCurrentUser
            ? gats.lavenderAccent.withValues(alpha: 0.06)
            : null,
      ),
      child: Row(
        children: [
          SizedBox(
            width: 28,
            child: Text(
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
          Expanded(
            child: Text(
              entry.name,
              style: TextStyle(
                fontWeight: entry.isCurrentUser ? FontWeight.w700 : FontWeight.w500,
                color: entry.isCurrentUser ? gats.lavenderAccent : gats.textPrimary,
              ),
            ),
          ),
          Text(
            '${entry.xp} XP',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 13,
              color: entry.isCurrentUser ? gats.lavenderAccent : gats.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
