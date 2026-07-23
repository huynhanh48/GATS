import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/course_chat_api_paths.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';

abstract final class CourseChatApiService {
  static List<Map<String, dynamic>> _list(dynamic data) {
    if (data is! List) return const [];
    return data
        .whereType<Map>()
        .map((item) => Map<String, dynamic>.from(item))
        .toList();
  }

  static GroupChatMessage _message(
    String courseId,
    Map<String, dynamic> json,
  ) {
    return GroupChatMessage(
      id: json['id']?.toString() ?? '',
      groupChatId: courseId,
      senderId: json['senderId']?.toString() ?? '',
      senderName: json['senderName']?.toString() ?? 'Học viên',
      text: json['content']?.toString() ?? '',
      sentAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      isPinned: json['pinnedAt'] != null,
      isMentor: json['isMentor'] == true,
    );
  }

  static Future<List<GroupChatMessage>> list({
    required String courseId,
    required String token,
  }) async {
    final json = await ApiClient.get(
      CourseChatApiPaths.messages(courseId),
      token: token,
    );
    return _list(json['data'])
        .map((item) => _message(courseId, item))
        .toList();
  }

  static Future<void> send({
    required String courseId,
    required String token,
    required String content,
  }) async {
    await ApiClient.post(
      CourseChatApiPaths.messages(courseId),
      token: token,
      body: {'content': content},
    );
  }

  static Future<void> setPinned({
    required String courseId,
    required String messageId,
    required String token,
    required bool isPinned,
  }) async {
    await ApiClient.patch(
      CourseChatApiPaths.pin(courseId, messageId),
      token: token,
      body: {'isPinned': isPinned},
    );
  }
}
