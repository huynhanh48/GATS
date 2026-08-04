import 'package:gats_academy/core/network/api_client.dart';

abstract final class AiCoachApiService {
  static Future<String> chat({
    required String token,
    required String query,
    List<String>? domains,
  }) async {
    final response = await ApiClient.post(
      '/api/ai-coach/chat',
      token: token,
      body: {
        'query': query,
        if (domains != null && domains.isNotEmpty) 'domains': domains,
      },
    );
    final rawData = response['data'];
    final data = rawData is Map ? Map<String, dynamic>.from(rawData) : response;
    final answer = data['answer']?.toString().trim() ?? '';
    if (answer.isEmpty) {
      throw const FormatException('AI Coach không trả về nội dung.');
    }
    return answer;
  }
}
