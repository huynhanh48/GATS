import 'package:flutter/material.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/mock/models/course_landing_models.dart';
import 'package:gats_academy/l10n/app_localizations.dart';

/// Preview landing page kiểu Udemy — lộ trình, mô tả, học được gì.
class CourseLandingPreview extends StatefulWidget {
  const CourseLandingPreview({super.key, required this.landing});

  final CourseLandingContent landing;

  @override
  State<CourseLandingPreview> createState() => _CourseLandingPreviewState();
}

class _CourseLandingPreviewState extends State<CourseLandingPreview> {
  final Set<int> _expandedSections = {0};

  String _formatDuration(AppLocalizations l10n, int minutes) {
    if (minutes < 60) return l10n.durationMinutes(minutes);
    final h = minutes ~/ 60;
    final m = minutes % 60;
    return m == 0 ? l10n.durationHours(h) : l10n.durationHoursMinutes(h, m);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final landing = widget.landing;
    final bodySmall = Theme.of(context).textTheme.bodySmall;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _StatsRow(landing: landing, l10n: l10n, formatDuration: (m) => _formatDuration(l10n, m)),
        const SizedBox(height: AppSpacing.lg),
        _SectionTitle(title: l10n.courseLandingLearnOutcomes),
        const SizedBox(height: AppSpacing.sm),
        ...landing.learningOutcomes.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.check_circle_rounded, size: 18, color: AppColors.primary),
                const SizedBox(width: AppSpacing.sm),
                Expanded(child: Text(item, style: bodySmall)),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        _SectionTitle(title: l10n.courseLandingAbout),
        const SizedBox(height: AppSpacing.sm),
        Text(landing.about, style: bodySmall?.copyWith(height: 1.5)),
        const SizedBox(height: AppSpacing.lg),
        Row(
          children: [
            Expanded(child: _SectionTitle(title: l10n.courseLandingCurriculum)),
            Text(
              '${l10n.courseLandingLessonCount(landing.totalLessons)} · ${_formatDuration(l10n, landing.totalMinutes)}',
              style: bodySmall?.copyWith(color: AppColors.textSecondary),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        ...List.generate(landing.curriculum.length, (index) {
          final section = landing.curriculum[index];
          final expanded = _expandedSections.contains(index);
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: Material(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(AppRadius.md),
              child: InkWell(
                borderRadius: BorderRadius.circular(AppRadius.md),
                onTap: () {
                  setState(() {
                    if (expanded) {
                      _expandedSections.remove(index);
                    } else {
                      _expandedSections.add(index);
                    }
                  });
                },
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              section.title,
                              style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                            ),
                          ),
                          Text(
                            l10n.courseLandingLessonCount(section.lessons.length),
                            style: bodySmall?.copyWith(color: AppColors.textSecondary),
                          ),
                          Icon(expanded ? Icons.expand_less : Icons.expand_more, color: AppColors.textSecondary),
                        ],
                      ),
                      if (expanded) ...[
                        const SizedBox(height: AppSpacing.sm),
                        const Divider(height: 1),
                        ...section.lessons.map(
                          (lesson) => Padding(
                            padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Icon(
                                  lesson.isPreview ? Icons.play_circle_outline : Icons.lock_outline,
                                  size: 18,
                                  color: lesson.isPreview ? AppColors.primary : AppColors.textSecondary,
                                ),
                                const SizedBox(width: AppSpacing.sm),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(lesson.title, style: bodySmall),
                                      if (lesson.isPreview)
                                        Text(
                                          l10n.courseLandingPreviewFree,
                                          style: bodySmall?.copyWith(
                                            color: AppColors.primary,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                                Text(
                                  l10n.durationMinutes(lesson.durationMinutes),
                                  style: bodySmall?.copyWith(color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          );
        }),
        const SizedBox(height: AppSpacing.lg),
        _SectionTitle(title: l10n.courseLandingRequirements),
        const SizedBox(height: AppSpacing.sm),
        ...landing.requirements.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.xs),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('• ', style: TextStyle(color: AppColors.textSecondary)),
                Expanded(child: Text(item, style: bodySmall)),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.background,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: AppColors.divider),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: AppColors.primary.withValues(alpha: 0.12),
                child: const Icon(Icons.person_rounded, color: AppColors.primary),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      landing.instructorName,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                    ),
                    Text(landing.instructorTitle, style: bodySmall),
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

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({
    required this.landing,
    required this.l10n,
    required this.formatDuration,
  });

  final CourseLandingContent landing;
  final AppLocalizations l10n;
  final String Function(int minutes) formatDuration;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.sm,
      children: [
        _StatChip(
          icon: Icons.star_rounded,
          iconColor: AppColors.accent,
          label: '${landing.rating} (${landing.reviewCount})',
        ),
        _StatChip(icon: Icons.people_outline, label: l10n.courseLandingStudents(landing.studentCount)),
        _StatChip(icon: Icons.schedule, label: formatDuration(landing.totalMinutes)),
        _StatChip(icon: Icons.signal_cellular_alt, label: landing.level),
        _StatChip(icon: Icons.update, label: l10n.courseLandingLastUpdated(landing.lastUpdated)),
      ],
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({
    required this.icon,
    required this.label,
    this.iconColor,
  });

  final IconData icon;
  final String label;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: iconColor ?? AppColors.textSecondary),
        const SizedBox(width: 4),
        Text(label, style: Theme.of(context).textTheme.labelSmall),
      ],
    );
  }
}
