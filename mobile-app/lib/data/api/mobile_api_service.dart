import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/mobile_api_paths.dart';

class MobileBootstrapDto {
  const MobileBootstrapDto({
    required this.serverTime,
    this.continueLearning,
    this.daily,
    this.unreadCount = 0,
    this.cartItemCount = 0,
    this.cartTotal = 0,
    this.featureFlags = const {},
    this.minAndroid = '1.0.0',
    this.minIos = '1.0.0',
  });

  final String serverTime;
  final ContinueLearningDto? continueLearning;
  final DailyBootstrapDto? daily;
  final int unreadCount;
  final int cartItemCount;
  final int cartTotal;
  final Map<String, bool> featureFlags;
  final String minAndroid;
  final String minIos;

  factory MobileBootstrapDto.fromJson(Map<String, dynamic> json) {
    final data = json['data'] is Map
        ? Map<String, dynamic>.from(json['data'] as Map)
        : json;
    final dailyRaw = data['daily'];
    final contRaw = data['continueLearning'];
    final notif = data['notifications'];
    final cart = data['cart'];
    final flags = data['featureFlags'];
    final min = data['minSupportedVersion'];
    return MobileBootstrapDto(
      serverTime: data['serverTime']?.toString() ??
          DateTime.now().toUtc().toIso8601String(),
      continueLearning: contRaw is Map
          ? ContinueLearningDto.fromJson(Map<String, dynamic>.from(contRaw))
          : null,
      daily: dailyRaw is Map
          ? DailyBootstrapDto.fromJson(Map<String, dynamic>.from(dailyRaw))
          : null,
      unreadCount: notif is Map
          ? (notif['unreadCount'] as num?)?.toInt() ?? 0
          : 0,
      cartItemCount:
          cart is Map ? (cart['itemCount'] as num?)?.toInt() ?? 0 : 0,
      cartTotal: cart is Map ? (cart['total'] as num?)?.toInt() ?? 0 : 0,
      featureFlags: flags is Map
          ? flags.map((k, v) => MapEntry(k.toString(), v == true))
          : const {},
      minAndroid: min is Map
          ? min['android']?.toString() ?? '1.0.0'
          : '1.0.0',
      minIos: min is Map ? min['ios']?.toString() ?? '1.0.0' : '1.0.0',
    );
  }
}

class ContinueLearningDto {
  const ContinueLearningDto({
    required this.courseId,
    required this.lessonId,
    required this.progress,
    this.resumePositionSeconds = 0,
  });

  final String courseId;
  final String lessonId;
  final double progress;
  final int resumePositionSeconds;

  factory ContinueLearningDto.fromJson(Map<String, dynamic> json) {
    return ContinueLearningDto(
      courseId: json['courseId']?.toString() ?? '',
      lessonId: json['lessonId']?.toString() ?? '',
      progress: (json['progress'] as num?)?.toDouble() ?? 0,
      resumePositionSeconds:
          (json['resumePositionSeconds'] as num?)?.toInt() ?? 0,
    );
  }
}

class DailyBootstrapDto {
  const DailyBootstrapDto({
    required this.goalMinutes,
    required this.completedMinutes,
    required this.streak,
    this.checkedInToday = false,
    this.totalXp = 0,
  });

  final int goalMinutes;
  final int completedMinutes;
  final int streak;
  final bool checkedInToday;
  final int totalXp;

  factory DailyBootstrapDto.fromJson(Map<String, dynamic> json) {
    return DailyBootstrapDto(
      goalMinutes: (json['goalMinutes'] as num?)?.toInt() ?? 10,
      completedMinutes: (json['completedMinutes'] as num?)?.toInt() ?? 0,
      streak: (json['streak'] as num?)?.toInt() ?? 0,
      checkedInToday: json['checkedInToday'] == true,
      totalXp: (json['totalXp'] as num?)?.toInt() ?? 0,
    );
  }
}

abstract final class MobileApiService {
  static Future<MobileBootstrapDto> bootstrap({required String token}) async {
    final json = await ApiClient.get(MobileApiPaths.bootstrap, token: token);
    return MobileBootstrapDto.fromJson(json);
  }
}
