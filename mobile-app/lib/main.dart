import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:gats_academy/app.dart';
import 'package:gats_academy/core/config/api_config.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:gats_academy/core/services/app_theme_controller.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/onboarding_prefs.dart';
import 'package:gats_academy/features/routine/data/routine_workflow_store.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: '.env');
    ApiConfig.debugLogBaseUrl();
  } catch (e, st) {
    debugPrint('Không load được .env, dùng API_BASE_URL mặc định: $e\n$st');
  }
  try {
    await AppLocaleController.instance.init();
    await AppThemeController.instance.init();
    await OnboardingPrefs.init();
    await AuthPrefs.init();
    await RoutineWorkflowStore.init();
  } catch (e, st) {
    debugPrint('OnboardingPrefs.init thất bại, tiếp tục với bộ nhớ tạm: $e\n$st');
  }
  runApp(const GatsAcademyApp());
}
