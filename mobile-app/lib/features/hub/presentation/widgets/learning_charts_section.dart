import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/features/hub/data/learning_charts_controller.dart';
import 'package:gats_academy/features/hub/data/learning_charts_models.dart';

/// Biểu đồ học tập trên Hub — dữ liệu thật từ BE (fallback local).
class LearningChartsSection extends StatefulWidget {
  const LearningChartsSection({super.key});

  @override
  State<LearningChartsSection> createState() => _LearningChartsSectionState();
}

class _LearningChartsSectionState extends State<LearningChartsSection> {
  final _controller = LearningChartsController.instance;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onUpdate);
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _controller.removeListener(_onUpdate);
    super.dispose();
  }

  void _onUpdate() {
    if (mounted) setState(() {});
  }

  Future<void> _load() async {
    await _controller.refresh(
      lessonsLabel: AppStrings.hubChartsMixLessons,
      flashcardsLabel: AppStrings.hubChartsMixFlashcards,
      quizLabel: AppStrings.hubChartsMixQuiz,
      coachLabel: AppStrings.hubChartsMixCoach,
    );
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final data = _controller.data;
    final week = data.weeklyMinutes;
    final xp = data.weeklyXp;
    final mix = data.activityMix;
    final weekTotal = week.fold<int>(0, (s, e) => s + e.minutes);
    final avg = week.isEmpty ? 0 : (weekTotal / week.length).round();
    final hasActivity = weekTotal > 0 ||
        xp.any((e) => e.xp > 0) ||
        mix.any((e) => e.value > 0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                AppStrings.hubChartsTitle,
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            if (_controller.isLoading)
              const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            else
              IconButton(
                tooltip: 'Refresh',
                onPressed: _load,
                icon: Icon(
                  Icons.refresh_rounded,
                  size: 20,
                  color: gats.textSecondary,
                ),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          AppStrings.hubChartsSubtitle,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: gats.textSecondary,
              ),
        ),
        const SizedBox(height: AppSpacing.md),
        if (!hasActivity && !_controller.isLoading) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: GatsSurfaceDecoration.card(
              context,
              borderRadius: BorderRadius.circular(AppRadius.lg),
            ),
            child: Text(
              AppStrings.hubChartsEmpty,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: gats.textSecondary,
                  ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
        ],
        Row(
          children: [
            Expanded(
              child: _StatChip(
                label: AppStrings.hubChartsWeekTotal,
                value: AppStrings.hubChartsMinutes(weekTotal),
                icon: Icons.timer_outlined,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: _StatChip(
                label: AppStrings.hubChartsWeekAvg,
                value: AppStrings.hubChartsMinutes(avg),
                icon: Icons.trending_up_rounded,
                color: AppColors.accent,
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        _ChartCard(
          title: AppStrings.hubChartsWeeklyTitle,
          child: SizedBox(
            height: 180,
            child: week.isEmpty
                ? const SizedBox.shrink()
                : _WeeklyMinutesChart(days: week),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        _ChartCard(
          title: AppStrings.hubChartsXpTitle,
          child: SizedBox(
            height: 160,
            child: xp.isEmpty
                ? const SizedBox.shrink()
                : _XpTrendChart(points: xp),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        _ChartCard(
          title: AppStrings.hubChartsMixTitle,
          child: SizedBox(
            height: 190,
            child: mix.isEmpty
                ? const SizedBox.shrink()
                : _ActivityMixChart(slices: mix),
          ),
        ),
      ],
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: GatsSurfaceDecoration.card(
        context,
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(AppRadius.sm),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: gats.textSecondary,
                      ),
                ),
                Text(
                  value,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: gats.textPrimary,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChartCard extends StatelessWidget {
  const _ChartCard({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.md,
        AppSpacing.md,
        AppSpacing.sm,
      ),
      decoration: GatsSurfaceDecoration.card(
        context,
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: gats.textPrimary,
                ),
          ),
          const SizedBox(height: AppSpacing.md),
          child,
        ],
      ),
    );
  }
}

class _WeeklyMinutesChart extends StatelessWidget {
  const _WeeklyMinutesChart({required this.days});

  final List<StudyDayStat> days;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final maxY = days
        .map((e) => e.minutes)
        .fold<int>(0, (a, b) => a > b ? a : b)
        .toDouble();
    final chartMax = (maxY < 40 ? 40 : maxY * 1.2).ceilToDouble();

    return BarChart(
      BarChartData(
        maxY: chartMax,
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: chartMax / 4,
          getDrawingHorizontalLine: (value) => FlLine(
            color: gats.divider.withValues(alpha: 0.7),
            strokeWidth: 1,
          ),
        ),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 28,
              interval: chartMax / 4,
              getTitlesWidget: (value, meta) => Text(
                value.toInt().toString(),
                style: TextStyle(fontSize: 10, color: gats.textSecondary),
              ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final i = value.toInt();
                if (i < 0 || i >= days.length) return const SizedBox.shrink();
                return Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    days[i].label,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: gats.textSecondary,
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        barGroups: [
          for (var i = 0; i < days.length; i++)
            BarChartGroupData(
              x: i,
              barRods: [
                BarChartRodData(
                  toY: days[i].minutes.toDouble(),
                  width: 16,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(8),
                  ),
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      AppColors.primary.withValues(alpha: 0.55),
                      AppColors.primary,
                    ],
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

class _XpTrendChart extends StatelessWidget {
  const _XpTrendChart({required this.points});

  final List<XpTrendPoint> points;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final maxY = points
        .map((e) => e.xp)
        .fold<int>(0, (a, b) => a > b ? a : b)
        .toDouble();
    final chartMax = (maxY < 50 ? 50 : maxY * 1.15).ceilToDouble();

    return LineChart(
      LineChartData(
        minY: 0,
        maxY: chartMax,
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: chartMax / 4,
          getDrawingHorizontalLine: (value) => FlLine(
            color: gats.divider.withValues(alpha: 0.7),
            strokeWidth: 1,
          ),
        ),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 28,
              interval: chartMax / 4,
              getTitlesWidget: (value, meta) => Text(
                value.toInt().toString(),
                style: TextStyle(fontSize: 10, color: gats.textSecondary),
              ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 1,
              getTitlesWidget: (value, meta) {
                final i = value.toInt();
                if (i < 0 || i >= points.length) return const SizedBox.shrink();
                return Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    points[i].label,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: gats.textSecondary,
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            getTooltipItems: (touched) => touched
                .map(
                  (t) => LineTooltipItem(
                    '+${t.y.toInt()} XP',
                    const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                )
                .toList(),
          ),
        ),
        lineBarsData: [
          LineChartBarData(
            spots: [
              for (var i = 0; i < points.length; i++)
                FlSpot(i.toDouble(), points[i].xp.toDouble()),
            ],
            isCurved: true,
            curveSmoothness: 0.35,
            color: AppColors.accent,
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: FlDotData(
              show: true,
              getDotPainter: (spot, percent, bar, index) => FlDotCirclePainter(
                radius: 3.5,
                color: Colors.white,
                strokeWidth: 2,
                strokeColor: AppColors.accent,
              ),
            ),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.accent.withValues(alpha: 0.28),
                  AppColors.accent.withValues(alpha: 0.02),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActivityMixChart extends StatelessWidget {
  const _ActivityMixChart({required this.slices});

  final List<StudyActivitySlice> slices;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final total = slices.fold<int>(0, (s, e) => s + e.value);
    final pieSlices = total == 0
        ? [
            StudyActivitySlice(
              label: '',
              value: 1,
              color: gats.divider.withValues(alpha: 0.5),
            ),
          ]
        : slices;

    return Row(
      children: [
        Expanded(
          flex: 5,
          child: PieChart(
            PieChartData(
              sectionsSpace: 3,
              centerSpaceRadius: 36,
              startDegreeOffset: -90,
              sections: [
                for (final slice in pieSlices)
                  PieChartSectionData(
                    value: slice.value.toDouble(),
                    color: slice.color,
                    radius: 28,
                    title: total == 0
                        ? ''
                        : '${((slice.value / total) * 100).round()}%',
                    titleStyle: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          flex: 5,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              for (final slice in slices)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: slice.color,
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          slice.label,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: gats.textPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                      ),
                      Text(
                        '${slice.value}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: gats.textSecondary,
                            ),
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
