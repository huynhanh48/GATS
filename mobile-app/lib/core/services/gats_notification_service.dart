import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/root_navigator.dart';
import 'package:gats_academy/core/services/daily_reminder_prefs.dart';
import 'package:gats_academy/core/widgets/gats_notification_banner.dart';
import 'package:timezone/data/latest.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;

/// Thông báo trong app (banner trên) + ngoài app (local push).
abstract final class GatsNotificationService {
  static const _androidChannelId = 'gats_notifications';
  static const _androidChannelName = 'GATS Academy';
  static const _dailyReminderChannelId = 'gats_daily_reminder';
  static const _dailyReminderChannelName = 'Nhắc học hàng ngày';
  static const _dailyReminderNotificationId = 9001;

  static final FlutterLocalNotificationsPlugin _plugin = FlutterLocalNotificationsPlugin();
  static OverlayEntry? _bannerEntry;
  static int _systemId = 0;
  static bool _timezoneReady = false;

  static Future<void> init() async {
    await _configureLocalTimeZone();

    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const ios = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    await _plugin.initialize(
      const InitializationSettings(android: android, iOS: ios),
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    final androidPlugin = _plugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    await androidPlugin?.createNotificationChannel(
      const AndroidNotificationChannel(
        _androidChannelId,
        _androidChannelName,
        description: 'Thông báo GATS Academy',
        importance: Importance.defaultImportance,
      ),
    );
    await androidPlugin?.createNotificationChannel(
      const AndroidNotificationChannel(
        _dailyReminderChannelId,
        _dailyReminderChannelName,
        description: 'Nhắc bạn học và điểm danh mỗi ngày',
        importance: Importance.high,
      ),
    );

    await DailyReminderPrefs.init();
    final saved = await DailyReminderPrefs.load();
    if (saved.enabled) {
      await scheduleDailyReminder(hour: saved.hour, minute: saved.minute);
    }
  }

  static Future<void> _configureLocalTimeZone() async {
    if (_timezoneReady) return;
    try {
      tz_data.initializeTimeZones();
      final name = await FlutterTimezone.getLocalTimezone();
      tz.setLocalLocation(tz.getLocation(name));
      _timezoneReady = true;
    } catch (e) {
      debugPrint('GatsNotificationService: timezone fallback UTC ($e)');
      tz_data.initializeTimeZones();
      tz.setLocalLocation(tz.UTC);
      _timezoneReady = true;
    }
  }

  /// Xin quyền push — gọi trong onboarding hoặc lần đầu cần thông báo ngoài app.
  static Future<bool> requestSystemPermission() async {
    if (defaultTargetPlatform == TargetPlatform.android) {
      final android = _plugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
      return await android?.requestNotificationsPermission() ?? false;
    }
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      final ios = _plugin.resolvePlatformSpecificImplementation<IOSFlutterLocalNotificationsPlugin>();
      return await ios?.requestPermissions(alert: true, badge: true, sound: true) ?? false;
    }
    return false;
  }

  static void _onNotificationTap(NotificationResponse response) {
    debugPrint('Notification tap: ${response.payload}');
  }

  static void showInApp({
    required String message,
    String? actionLabel,
    VoidCallback? onAction,
    GatsNotificationKind kind = GatsNotificationKind.success,
    Duration duration = const Duration(seconds: 4),
  }) {
    _hideBanner();

    final overlay = rootNavigatorKey.currentState?.overlay;
    if (overlay == null) {
      debugPrint('GatsNotificationService: overlay chưa sẵn sàng — $message');
      return;
    }

    _bannerEntry = OverlayEntry(
      builder: (context) => GatsNotificationBanner(
        message: message,
        actionLabel: actionLabel,
        onAction: onAction,
        kind: kind,
        duration: duration,
        onDismiss: _hideBanner,
      ),
    );

    overlay.insert(_bannerEntry!);
  }

  static void _hideBanner() {
    _bannerEntry?.remove();
    _bannerEntry = null;
  }

  static Future<void> showSystem({
    required String title,
    required String body,
    String? payload,
    int? id,
    bool highPriority = false,
  }) async {
    final notificationId = id ?? ++_systemId;

    final androidDetails = AndroidNotificationDetails(
      _androidChannelId,
      _androidChannelName,
      channelDescription: 'Thông báo GATS Academy',
      importance: highPriority ? Importance.high : Importance.defaultImportance,
      priority: highPriority ? Priority.high : Priority.defaultPriority,
    );
    const iosDetails = DarwinNotificationDetails();
    final details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _plugin.show(notificationId, title, body, details, payload: payload);
  }

  static tz.TZDateTime _nextDailyInstance(int hour, int minute) {
    final now = tz.TZDateTime.now(tz.local);
    var scheduled = tz.TZDateTime(tz.local, now.year, now.month, now.day, hour, minute);
    if (scheduled.isBefore(now)) {
      scheduled = scheduled.add(const Duration(days: 1));
    }
    return scheduled;
  }

  static Future<void> scheduleDailyReminder({
    required int hour,
    required int minute,
  }) async {
    await _configureLocalTimeZone();
    await cancelDailyReminder();

    final scheduled = _nextDailyInstance(hour, minute);
    const androidDetails = AndroidNotificationDetails(
      _dailyReminderChannelId,
      _dailyReminderChannelName,
      channelDescription: 'Nhắc bạn học và điểm danh mỗi ngày',
      importance: Importance.high,
      priority: Priority.high,
    );
    const iosDetails = DarwinNotificationDetails();
    const details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _plugin.zonedSchedule(
      _dailyReminderNotificationId,
      AppStrings.dailyReminderTitle,
      AppStrings.dailyReminderBody,
      scheduled,
      details,
      androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }

  static Future<void> cancelDailyReminder() async {
    await _plugin.cancel(_dailyReminderNotificationId);
  }

  static const _testTitle = 'GATS Academy';
  static const _testBody = 'Thông báo test — push hệ thống hoạt động!';

  static Future<bool> testInAppBanner() async {
    showInApp(
      message: _testBody,
      kind: GatsNotificationKind.info,
      actionLabel: 'OK',
    );
    return true;
  }

  static Future<bool> testSystemPush() async {
    final granted = await requestSystemPermission();
    if (!granted) return false;
    await showSystem(title: _testTitle, body: _testBody, payload: 'test', highPriority: true);
    return true;
  }

  static Future<bool> testDelayedSystemPush() async {
    final granted = await requestSystemPermission();
    if (!granted) return false;
    await Future<void>.delayed(const Duration(seconds: 5));
    await showSystem(title: _testTitle, body: _testBody, payload: 'test_delayed', highPriority: true);
    return true;
  }

  static Future<void> notify({
    required String title,
    required String body,
    String? actionLabel,
    VoidCallback? onAction,
    GatsNotificationKind kind = GatsNotificationKind.success,
    bool alsoSystem = false,
  }) async {
    showInApp(
      message: body,
      actionLabel: actionLabel,
      onAction: onAction,
      kind: kind,
    );

    if (alsoSystem) {
      await showSystem(title: title, body: body);
    }
  }
}
