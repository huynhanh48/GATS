import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/notification_deep_link.dart';
import 'package:gats_academy/core/navigation/root_navigator.dart';
import 'package:gats_academy/core/services/daily_reminder_prefs.dart';
import 'package:gats_academy/core/widgets/gats_notification_banner.dart';
import 'package:timezone/data/latest.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;

/// Thông báo trong app (banner trên) + ngoài app (local push).
abstract final class GatsNotificationService {
  static const _androidChannelId = 'gats_notifications_high';
  static const _androidChannelName = 'GATS Academy';
  static const _dailyReminderChannelId = 'gats_daily_reminder';
  static const _dailyReminderChannelName = 'Nhắc học hàng ngày';
  static const _dailyReminderNotificationId = 9001;

  static final FlutterLocalNotificationsPlugin _plugin = FlutterLocalNotificationsPlugin();
  static OverlayEntry? _bannerEntry;
  static int _systemId = 0;
  static bool _timezoneReady = false;

  static bool _lifecycleBound = false;

  static Future<void> init() async {
    _bindLifecycleObserver();
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
        importance: Importance.high,
        playSound: true,
        enableVibration: true,
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
    tz_data.initializeTimeZones();
    try {
      final name = await FlutterTimezone.getLocalTimezone();
      try {
        tz.setLocalLocation(tz.getLocation(name));
      } catch (_) {
        // Một số máy trả "GMT+07:00" thay vì IANA — app VN-first.
        final fallback = DateTime.now().timeZoneOffset.inHours == 7
            ? 'Asia/Ho_Chi_Minh'
            : 'UTC';
        debugPrint(
          'GatsNotificationService: unknown TZ "$name", using $fallback',
        );
        tz.setLocalLocation(tz.getLocation(fallback));
      }
      _timezoneReady = true;
    } catch (e) {
      debugPrint('GatsNotificationService: timezone fallback Asia/Ho_Chi_Minh ($e)');
      try {
        tz.setLocalLocation(tz.getLocation('Asia/Ho_Chi_Minh'));
      } catch (_) {
        tz.setLocalLocation(tz.UTC);
      }
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
    NotificationDeepLink.open(response.payload);
  }

  static void _bindLifecycleObserver() {
    if (_lifecycleBound) return;
    _lifecycleBound = true;
    WidgetsBinding.instance.addObserver(_AppLifecycleBridge.instance);
  }

  static bool get _isAppInForeground {
    final state = WidgetsBinding.instance.lifecycleState;
    return state == null || state == AppLifecycleState.resumed;
  }

  static void showInApp({
    required String message,
    String? title,
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
        title: title,
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
    bool mirrorInForeground = true,
  }) async {
    final notificationId = id ?? ++_systemId;
    final useHigh = highPriority || mirrorInForeground;

    final androidDetails = AndroidNotificationDetails(
      _androidChannelId,
      _androidChannelName,
      channelDescription: 'Thông báo GATS Academy',
      importance: useHigh ? Importance.max : Importance.high,
      priority: useHigh ? Priority.max : Priority.high,
      ticker: title,
      visibility: NotificationVisibility.public,
    );
    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
      interruptionLevel: InterruptionLevel.timeSensitive,
    );
    final details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _plugin.show(notificationId, title, body, details, payload: payload);

    // Android/MIUI không heads-up khi app đang mở — mirror banner trên màn hình.
    if (mirrorInForeground && _isAppInForeground) {
      showInApp(
        title: title,
        message: body,
        kind: GatsNotificationKind.info,
      );
    }
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
    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );
    const details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    Future<void> schedule(AndroidScheduleMode mode) {
      return _plugin.zonedSchedule(
        _dailyReminderNotificationId,
        AppStrings.dailyReminderTitle,
        AppStrings.dailyReminderBody,
        scheduled,
        details,
        androidScheduleMode: mode,
        matchDateTimeComponents: DateTimeComponents.time,
        payload: '/daily',
      );
    }

    if (defaultTargetPlatform == TargetPlatform.android) {
      final android = _plugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();
      try {
        await android?.requestExactAlarmsPermission();
      } catch (e) {
        debugPrint('GatsNotificationService: exact alarm permission — $e');
      }
    }

    try {
      await schedule(AndroidScheduleMode.exactAllowWhileIdle);
    } catch (e) {
      debugPrint('GatsNotificationService: exact schedule failed, inexact — $e');
      await schedule(AndroidScheduleMode.inexactAllowWhileIdle);
    }

    debugPrint(
      'GatsNotificationService: daily reminder at '
      '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')} '
      '(next ${scheduled.toIso8601String()})',
    );
  }

  /// Returns whether notification permission is currently usable.
  static Future<bool> hasSystemPermission() async {
    if (defaultTargetPlatform == TargetPlatform.android) {
      final android = _plugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();
      return await android?.areNotificationsEnabled() ?? true;
    }
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      final ios = _plugin
          .resolvePlatformSpecificImplementation<
              IOSFlutterLocalNotificationsPlugin>();
      final settings = await ios?.checkPermissions();
      return settings?.isEnabled ?? false;
    }
    return true;
  }

  static Future<void> cancelDailyReminder() async {
    await _plugin.cancel(_dailyReminderNotificationId);
  }

  static const _testTitle = 'GATS Academy';
  static const _testBody = 'Thông báo test — push hệ thống hoạt động!';

  static Future<bool> testInAppBanner() async {
    showInApp(
      title: _testTitle,
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
      await showSystem(title: title, body: body, mirrorInForeground: false);
    }
  }
}

class _AppLifecycleBridge extends WidgetsBindingObserver {
  _AppLifecycleBridge._();
  static final instance = _AppLifecycleBridge._();

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Giữ observer sống — trạng thái đọc qua WidgetsBinding.instance.lifecycleState.
  }
}

