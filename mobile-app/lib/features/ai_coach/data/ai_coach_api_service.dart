import 'package:gats_academy/core/network/api_client.dart';

abstract final class AiCoachApiService {
  /// RAG + LLM thường > 20s; dùng timeout riêng dài hơn API mặc định.
  static const chatTimeout = Duration(seconds: 90);

  static Future<String> chat({
    required String token,
    required String query,
    List<String>? domains,
  }) async {
    final response = await ApiClient.post(
      '/api/ai-coach/chat',
      token: token,
      timeout: chatTimeout,
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
