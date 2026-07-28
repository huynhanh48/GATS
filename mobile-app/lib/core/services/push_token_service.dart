import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

/// FCM token helper. Requires Firebase project files:
/// - Android: `android/app/google-services.json`
/// - iOS: `ios/Runner/GoogleService-Info.plist`
/// Without them, [getToken] returns null and device register still works.
abstract final class PushTokenService {
  static bool _initialized = false;

  static Future<void> init() async {
    if (kIsWeb || _initialized) return;
    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp();
      }
      final messaging = FirebaseMessaging.instance;
      await messaging.setAutoInitEnabled(true);
      if (defaultTargetPlatform == TargetPlatform.iOS) {
        await messaging.requestPermission(alert: true, badge: true, sound: true);
      }
      _initialized = true;
    } catch (e) {
      debugPrint(
        'PushTokenService: Firebase unavailable (add google-services.json / '
        'GoogleService-Info.plist) — $e',
      );
    }
  }

  static Future<String?> getToken() async {
    await init();
    if (!_initialized) return null;
    try {
      return await FirebaseMessaging.instance.getToken();
    } catch (e) {
      debugPrint('PushTokenService.getToken failed — $e');
      return null;
    }
  }

  /// Call after login so BE gets a fresh token when FCM rotates.
  static void listenTokenRefresh(void Function(String token) onToken) {
    if (!_initialized) return;
    FirebaseMessaging.instance.onTokenRefresh.listen(onToken);
  }
}
