import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:gats_academy/app.dart';
import 'package:gats_academy/core/config/api_config.dart';
import 'package:gats_academy/core/config/social_auth_config.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:gats_academy/core/services/app_theme_controller.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/onboarding_prefs.dart';
import 'package:gats_academy/core/services/gats_notification_service.dart';
import 'package:gats_academy/data/catalog/course_catalog_loader.dart';
import 'package:gats_academy/data/catalog/learning_activities_catalog.dart';
import 'package:gats_academy/data/catalog/onboarding_scorer.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/routine/data/routine_workflow_store.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: '.env');
    ApiConfig.debugLogBaseUrl();
    await SocialAuthConfig.init();
  } catch (e, st) {
    debugPrint('Không load được .env, dùng API_BASE_URL mặc định: $e\n$st');
  }
  try {
    await AppLocaleController.instance.init();
    await AppThemeController.instance.init();
    await OnboardingPrefs.init();
    await AuthPrefs.init();
    // Sync courses + enrollment từ BE (non-blocking nếu thất bại)
    unawaited(CourseModule.init());
    await CourseCatalogLoader.instance.init();
    await OnboardingScorer.instance.init();
    await LearningActivitiesCatalog.instance.init();
    await MockCourseStore.ensureLoaded();
    await RoutineWorkflowStore.init();
    await GatsNotificationService.init();
  } catch (e, st) {
    debugPrint('OnboardingPrefs.init thất bại, tiếp tục với bộ nhớ tạm: $e\n$st');
  }
  runApp(const GatsAcademyApp());
}
