import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/app_header.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/data/api/certificate_api_service.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/hub/data/learning_charts_controller.dart';
import 'package:gats_academy/features/hub/data/learning_charts_models.dart';
import 'package:gats_academy/features/hub/presentation/widgets/achievement_timeline.dart';
import 'package:gats_academy/features/hub/presentation/widgets/learning_charts_section.dart';

class HubScreen extends StatelessWidget {
  const HubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final charts = LearningChartsController.instance;

    return GatsThemedScaffold(
      appBar: AppBar(
        backgroundColor: gats.isStarry ? Colors.transparent : gats.background,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: gats.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              AppStrings.quickActionHub,
              style: AppTypography.style(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: gats.textPrimary,
              ),
            ),
            Text(
              AppHeaderSubtitles.hub,
              style: AppTypography.style(
                fontSize: 12,
                color: gats.textSecondary,
              ).copyWith(decoration: TextDecoration.none),
            ),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          ListenableBuilder(
            listenable: charts,
            builder: (context, _) {
              final progress = charts.hubProgress;
              return _XpLevelCard(
                key: ValueKey('xp_${progress.level}_${progress.currentXp}'),
                progress: progress,
                rankTitle: MockData.rankTitle(progress.level),
              );
            },
          ),
          const SizedBox(height: AppSpacing.xl),
          const LearningChartsSection(),
          const SizedBox(height: AppSpacing.xl),
          Text(
            AppStrings.hubBadgesTitle,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.md),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.3,
            ),
            itemCount: MockData.badges.length,
            itemBuilder: (context, index) {
              final badge = MockData.badges[index];
              return _BadgeCard(badge: badge);
            },
          ),
          const SizedBox(height: AppSpacing.xl),
          Text(
            AppStrings.hubAchievements,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.md),
          const AchievementTimeline(),
          const SizedBox(height: AppSpacing.xl),
          const _CertificatesSection(),
        ],
      ),
    );
  }
}
class _XpLevelCard extends StatefulWidget {
  const _XpLevelCard({
    super.key,
    required this.progress,
    required this.rankTitle,
  });

  final HubProgress progress;
  final String rankTitle;

  @override
  State<_XpLevelCard> createState() => _XpLevelCardState();
}

class _XpLevelCardState extends State<_XpLevelCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _progressAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _progressAnim = Tween<double>(
      begin: 0,
      end: widget.progress.currentXp / widget.progress.xpToNextLevel,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    ));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GradientCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                AppStrings.hubXpTitle,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.85),
                  fontSize: 13,
                  decoration: TextDecoration.none,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  widget.rankTitle,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                    decoration: TextDecoration.none,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Level ${widget.progress.level}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    decoration: TextDecoration.none,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Text(
                '${widget.progress.currentXp} / ${widget.progress.xpToNextLevel} XP',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  decoration: TextDecoration.none,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          AnimatedBuilder(
            animation: _progressAnim,
            builder: (context, child) {
              return ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: _progressAnim.value,
                  minHeight: 10,
                  backgroundColor: Colors.white24,
                  color: AppColors.accent,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
class _BadgeCard extends StatelessWidget {
  const _BadgeCard({required this.badge});

  final BadgeItem badge;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                badge.isUnlocked
                    ? '✅ "${badge.name}" — Đã mở khóa!'
                    : '🔒 "${badge.name}" — Hoàn thành thêm bài tập để mở khóa.',
              ),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: GatsSurfaceDecoration.card(
            context,
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: badge.isUnlocked
                      ? AppColors.accent.withValues(alpha: 0.15)
                      : gats.divider.withValues(alpha: 0.5),
                  shape: BoxShape.circle,
                  border: badge.isUnlocked
                      ? Border.all(color: AppColors.accent, width: 2)
                      : null,
                  boxShadow: badge.isUnlocked
                      ? [
                          BoxShadow(
                            color: AppColors.accent.withValues(alpha: 0.25),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                        ]
                      : null,
                ),
                child: Icon(
                  badge.icon,
                  color: badge.isUnlocked
                      ? AppColors.accent
                      : gats.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                badge.name,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontWeight: badge.isUnlocked
                          ? FontWeight.w600
                          : FontWeight.normal,
                      decoration: TextDecoration.none,
                    ),
                textAlign: TextAlign.center,
              ),
              if (!badge.isUnlocked)
                Icon(Icons.lock_outline, size: 14, color: gats.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}

class _CertificatesSection extends StatefulWidget {
  const _CertificatesSection();

  @override
  State<_CertificatesSection> createState() => _CertificatesSectionState();
}

class _CertificatesSectionState extends State<_CertificatesSection> {
  bool _loading = true;
  String? _error;
  List<MyCertificateDto> _certs = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final token = await AuthPrefs.accessToken();
      if (token == null || token.isEmpty) {
        setState(() {
          _loading = false;
          _error = 'Đăng nhập để xem chứng chỉ.';
          _certs = const [];
        });
        return;
      }
      final list = await CertificateApiService.listMine(token: token);
      if (!mounted) return;
      setState(() {
        _certs = list.where((c) => c.isIssued).toList();
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Không tải được chứng chỉ.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            AppStrings.hubCertTitle,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppSpacing.lg),
          if (_loading)
            const Center(child: CircularProgressIndicator())
          else if (_error != null)
            Column(
              children: [
                Text(_error!, textAlign: TextAlign.center),
                TextButton(onPressed: _load, child: const Text('Thử lại')),
              ],
            )
          else if (_certs.isEmpty)
            Text(
              'Hoàn thành khóa học để nhận chứng chỉ từ GATS Academy.',
              textAlign: TextAlign.center,
              style: TextStyle(color: gats.textSecondary),
            )
          else
            ..._certs.map((c) {
              return Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.md),
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: gats.divider),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.workspace_premium,
                            color: gats.lavenderAccent),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(
                            c.courseTitle ?? 'Chứng chỉ khóa học',
                            style: TextStyle(
                              fontWeight: FontWeight.w700,
                              color: gats.textPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Số: ${c.certificateNumber}',
                      style: TextStyle(
                        fontSize: 12,
                        color: gats.textSecondary,
                      ),
                    ),
                    Text(
                      'Cấp: ${c.issuedAt}',
                      style: TextStyle(
                        fontSize: 12,
                        color: gats.textSecondary,
                      ),
                    ),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton.icon(
                        onPressed: () async {
                          await Clipboard.setData(
                            ClipboardData(text: c.certificateNumber),
                          );
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Đã copy mã chứng chỉ'),
                            ),
                          );
                        },
                        icon: const Icon(Icons.copy, size: 16),
                        label: const Text('Copy mã'),
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}

