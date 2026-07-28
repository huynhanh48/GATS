import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:gats_academy/app.dart';
import 'package:gats_academy/core/config/api_config.dart';
import 'package:gats_academy/core/config/social_auth_config.dart';
import 'package:gats_academy/core/services/app_locale_controller.dart';
import 'package:gats_academy/core/services/app_theme_controller.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/services/device_registration_service.dart';
import 'package:gats_academy/core/services/gats_notification_service.dart';
import 'package:gats_academy/core/services/push_token_service.dart';
import 'package:gats_academy/features/course/course_module.dart';

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
    await AuthPrefs.init();
    await CourseModule.init();
    await CartController.instance.syncFromApi();
    await GatsNotificationService.init();
    await PushTokenService.init();
    PushTokenService.listenTokenRefresh((token) {
      DeviceRegistrationService.register(pushToken: token);
    });
  } catch (e, st) {
    debugPrint('Khởi tạo ứng dụng thất bại: $e\n$st');
  }
  runApp(const GatsAcademyApp());
}
