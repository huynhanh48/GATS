import 'package:flutter/material.dart';
import 'package:gats_academy/core/l10n/l10n.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/review_prompt_dialog.dart';
import 'package:gats_academy/core/widgets/ted/ted.dart';
import 'package:gats_academy/data/mock/mock_reviews_l10n.dart';

class RateUsScreen extends StatefulWidget {
  const RateUsScreen({
    super.key,
    required this.recommendedCourseIds,
    required this.onSkip,
    required this.onContinue,
  });

  final List<String> recommendedCourseIds;
  final VoidCallback onSkip;
  final void Function({required bool didRequestReview}) onContinue;

  @override
  State<RateUsScreen> createState() => _RateUsScreenState();
}

class _RateUsScreenState extends State<RateUsScreen> {
  int _filter = 0;
  bool _isFinishing = false;

  Future<void> _onNext() async {
    if (_isFinishing) return;
    setState(() => _isFinishing = true);
    final result = await ReviewPromptDialog.show(context);
    if (!mounted) return;
    if (result == null) {
      setState(() => _isFinishing = false);
      return;
    }
    widget.onContinue(didRequestReview: result);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final reviews = MockReviewsL10n.filtered(l10n, _filter);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(l10n.rateUsAppBarTitle),
        backgroundColor: AppColors.background,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.lg),
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    boxShadow: AppShadows.card,
                  ),
                  child: TedSocialProofHeader(
                    selectedFilter: _filter,
                    onFilterSelected: (i) => setState(() => _filter = i),
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  l10n.rateUsContextLine,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.lg),
                ...reviews.map(
                  (review) => Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.md),
                    child: TedReviewCard(
                      authorName: review.authorName,
                      body: review.body,
                      rating: review.rating,
                      likes: review.likes,
                      timeAgo: review.timeAgo,
                    ),
                  ),
                ),
                if (reviews.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
                    child: Text(
                      l10n.rateUsNoReviewsForFilter,
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.lg),
            child: Column(
              children: [
                TedPrimaryPillButton(
                  label: l10n.onboardingNext,
                  onPressed: _onNext,
                  enabled: !_isFinishing,
                ),
                TextButton(
                  onPressed: _isFinishing ? null : widget.onSkip,
                  child: Text(l10n.rateUsLater),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
