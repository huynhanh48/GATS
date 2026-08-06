import 'package:flutter/material.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/navigation/main_shell_tab_controller.dart';
import 'package:gats_academy/core/navigation/root_navigator.dart';
import 'package:gats_academy/features/course/navigation/course_navigator.dart';
import 'package:gats_academy/features/notifications/presentation/notifications_screen.dart';
import 'package:gats_academy/shell/main_shell.dart';

/// Handles allowlisted deep links from local/FCM notification payloads.
/// Allowed prefixes (match BE DeviceService): gats://, /course/, /courses/, /home, /notifications
abstract final class NotificationDeepLink {
  static Future<void> open(String? raw) async {
    if (raw == null || raw.trim().isEmpty) return;
    var path = raw.trim();
    if (path.startsWith('gats://')) {
      path = path.substring('gats://'.length);
      if (!path.startsWith('/')) path = '/$path';
    }

    final ctx = rootNavigatorKey.currentContext;
    if (ctx == null || !ctx.mounted) {
      debugPrint('NotificationDeepLink: no navigator for $path');
      return;
    }

    if (path == '/home' || path == '/') {
      Navigator.of(ctx).popUntil((r) => r.isFirst);
      return;
    }

    if (path == '/daily' || path.startsWith('/daily')) {
      Navigator.of(ctx).popUntil((r) => r.isFirst);
      MainShellTabController.instance.goTo(MainShellTabs.daily);
      return;
    }

    if (path == '/notifications' || path.startsWith('/notifications')) {
      await GatsMainNavigator.push<void>(ctx, const NotificationsScreen());
      return;
    }

    final courseMatch = RegExp(r'^/courses?/([^/?#]+)').firstMatch(path);
    if (courseMatch != null) {
      final courseId = courseMatch.group(1)!;
      await CourseNavigator.open(ctx, courseId: courseId);
      return;
    }

    debugPrint('NotificationDeepLink: ignored path $path');
  }
}
