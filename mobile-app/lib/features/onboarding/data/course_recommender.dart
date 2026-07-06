import 'package:gats_academy/data/catalog/onboarding_scorer.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';

abstract final class CourseRecommender {
  static List<CourseItem> recommend(OnboardingAnswers answers) {
    return OnboardingScorer.instance.recommend(answers);
  }
}
