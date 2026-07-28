import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/daily_checkin_api_paths.dart';

class DailyCheckInApiStatus {
  const DailyCheckInApiStatus({
    required this.streakDays,
    required this.checkedInToday,
    required this.totalXp,
    required this.dailyGoalMinutes,
  });

  final int streakDays;
  final bool checkedInToday;
  final int totalXp;
  final int dailyGoalMinutes;

  factory DailyCheckInApiStatus.fromJson(Map<String, dynamic> json) {
    final data = json['data'] is Map
        ? Map<String, dynamic>.from(json['data'] as Map)
        : json;
    return DailyCheckInApiStatus(
      streakDays: (data['streakDays'] as num?)?.toInt() ?? 0,
      checkedInToday: data['checkedInToday'] == true,
      totalXp: (data['totalXp'] as num?)?.toInt() ?? 0,
      dailyGoalMinutes: (data['dailyGoalMinutes'] as num?)?.toInt() ?? 10,
    );
  }
}

abstract final class DailyCheckInApiService {
  static Future<DailyCheckInApiStatus> getStatus({required String token}) async {
    final json = await ApiClient.get(
      DailyCheckInApiPaths.status,
      token: token,
    );
    return DailyCheckInApiStatus.fromJson(json);
  }

  static Future<DailyCheckInApiStatus> claim({required String token}) async {
    final json = await ApiClient.post(
      DailyCheckInApiPaths.claim,
      token: token,
      body: const {},
    );
    return DailyCheckInApiStatus.fromJson(json);
  }
}

/// Thin helper used by DailyCheckInStore.
abstract final class DailyCheckInApi {
  static Future<DailyCheckInApiStatus?> fetchOrNull() async {
    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) return null;
    try {
      return await DailyCheckInApiService.getStatus(token: token);
    } catch (_) {
      return null;
    }
  }

  static Future<DailyCheckInApiStatus?> claimOrNull() async {
    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) return null;
    try {
      return await DailyCheckInApiService.claim(token: token);
    } catch (_) {
      return null;
    }
  }
}
