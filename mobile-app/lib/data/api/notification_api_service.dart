import 'package:flutter/material.dart';
import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/notifications/data/mock_notifications.dart';

abstract final class NotificationApiPaths {
  static const list = '/api/notifications';
  static const markRead = '/api/notifications/read';
  static const markAllRead = '/api/notifications/read-all';
  static String markOneRead(String id) => '/api/notifications/$id/read';
}

class ServerNotification {
  const ServerNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.createdAt,
    required this.isUnread,
    this.href,
    this.type,
  });

  final String id;
  final String title;
  final String body;
  final DateTime createdAt;
  final bool isUnread;
  final String? href;
  final String? type;

  factory ServerNotification.fromJson(Map<String, dynamic> json) {
    return ServerNotification(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      body: json['body']?.toString() ?? '',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      isUnread: json['isRead'] != true,
      href: json['href']?.toString(),
      type: json['type']?.toString(),
    );
  }

  AppNotificationSection get section {
    final now = DateTime.now();
    final local = createdAt.toLocal();
    final today = DateTime(now.year, now.month, now.day);
    final day = DateTime(local.year, local.month, local.day);
    if (day == today) return AppNotificationSection.today;
    if (day == today.subtract(const Duration(days: 1))) {
      return AppNotificationSection.yesterday;
    }
    return AppNotificationSection.earlier;
  }

  AppNotificationItem toUiItem() {
    return AppNotificationItem(
      id: id,
      title: title,
      body: body,
      icon: _iconForType(type),
      section: section,
      isUnread: isUnread,
      href: href,
    );
  }

  static IconData _iconForType(String? type) {
    switch (type) {
      case 'payment':
      case 'order_paid':
        return Icons.credit_card_outlined;
      case 'enrollment':
        return Icons.school_outlined;
      case 'admin_broadcast':
        return Icons.campaign_outlined;
      default:
        return Icons.notifications_none_rounded;
    }
  }
}

abstract final class NotificationApiService {
  /// Admin system feed types (often `userId: null`) — never show to learners.
  static const _adminFeedTypes = {
    'lead_created',
    'course_created',
    'post_created',
    'post_published',
  };

  static Future<List<AppNotificationItem>> list({
    required String token,
    int limit = 50,
  }) async {
    final json = await ApiClient.get(
      NotificationApiPaths.list,
      token: token,
      query: {'limit': '$limit'},
    );
    final data = json['data'];
    if (data is! List) return const [];
    final user = await AuthPrefs.currentUser();
    final isStaff =
        user?.role == UserRole.admin || user?.role == UserRole.mentor;
    final me = user?.id;
    final rows = data.whereType<Map>().map(Map<String, dynamic>.from).toList();
    final filtered = rows.where((e) {
      if (isStaff) return true;
      final type = e['type']?.toString();
      if (type != null && _adminFeedTypes.contains(type)) return false;
      final uid = e['userId'];
      if (uid == null) return false;
      if (me != null && uid.toString() != me) return false;
      return true;
    }).toList();
    // #region agent log
    debugPrint(
      'NotificationApiService.list isStaff=$isStaff raw=${rows.length} '
      'filtered=${filtered.length} types=${filtered.take(8).map((e) => e['type']).toList()}',
    );
    // #endregion
    return filtered
        .map((e) => ServerNotification.fromJson(e).toUiItem())
        .toList();
  }

  static Future<void> markOneRead({
    required String token,
    required String id,
  }) async {
    await ApiClient.post(NotificationApiPaths.markOneRead(id), token: token);
  }

  static Future<List<AppNotificationItem>> listOrEmpty() async {
    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) return const [];
    try {
      return await list(token: token);
    } catch (_) {
      return const [];
    }
  }
}
