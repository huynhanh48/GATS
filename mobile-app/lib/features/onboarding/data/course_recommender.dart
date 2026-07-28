import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/course_api_paths.dart';
import 'package:gats_academy/data/api/course_be_mapper.dart';
import 'package:gats_academy/data/catalog/onboarding_scorer.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';

abstract final class CourseRecommender {
  static Future<List<CourseItem>> recommend(OnboardingAnswers answers) async {
    try {
      final token = await AuthPrefs.accessToken();
      final json = await ApiClient.post(
        CourseApiPaths.recommendations,
        body: answers.toJson(),
        token: token,
      );
      final raw = json['recommendations'];
      if (raw is List) {
        final courses = raw
            .whereType<Map>()
            .map((item) => item['course'])
            .whereType<Map>()
            .map(
              (course) => CourseBeMapper.fromPublicJson(
                Map<String, dynamic>.from(course),
              ).toListItem(),
            )
            .toList();
        if (courses.isNotEmpty) return courses;
      }
    } catch (_) {
      // Offline/dev fallback: use the bundled scorer.
    }
    return OnboardingScorer.instance.recommend(answers);
  }
}
