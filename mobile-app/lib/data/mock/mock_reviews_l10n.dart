import 'package:gats_academy/data/mock/mock_reviews.dart';
import 'package:gats_academy/l10n/app_localizations.dart';

abstract final class MockReviewsL10n {
  static List<String> filterLabels(AppLocalizations l10n) => [
        l10n.reviewFilterExcellent,
        l10n.reviewFilterGood,
        l10n.reviewFilterAverage,
        l10n.reviewFilterNeedsImprovement,
      ];

  static List<MockReview> all(AppLocalizations l10n) => [
        MockReview(
          id: 'r1',
          authorName: 'Minh T.',
          body: l10n.review1Body,
          rating: 4.9,
          likes: 760,
          timeAgo: l10n.review1TimeAgo,
          sentiment: ReviewSentiment.excellent,
        ),
        MockReview(
          id: 'r2',
          authorName: 'Lan P.',
          body: l10n.review2Body,
          rating: 4.7,
          likes: 412,
          timeAgo: l10n.review2TimeAgo,
          sentiment: ReviewSentiment.excellent,
        ),
        MockReview(
          id: 'r3',
          authorName: 'Hoàng N.',
          body: l10n.review3Body,
          rating: 4.5,
          likes: 289,
          timeAgo: l10n.review3TimeAgo,
          sentiment: ReviewSentiment.good,
        ),
        MockReview(
          id: 'r4',
          authorName: 'Thu H.',
          body: l10n.review4Body,
          rating: 4.2,
          likes: 156,
          timeAgo: l10n.review4TimeAgo,
          sentiment: ReviewSentiment.average,
        ),
      ];

  static List<MockReview> filtered(AppLocalizations l10n, int filterIndex) {
    final reviews = all(l10n);
    if (filterIndex <= 0) {
      return reviews.where((r) => r.sentiment == ReviewSentiment.excellent).toList();
    }
    if (filterIndex == 1) {
      return reviews.where((r) => r.sentiment == ReviewSentiment.good).toList();
    }
    if (filterIndex == 2) {
      return reviews.where((r) => r.sentiment == ReviewSentiment.average).toList();
    }
    return reviews.where((r) => r.sentiment == ReviewSentiment.belowAverage).toList();
  }
}
