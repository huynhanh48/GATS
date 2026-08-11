import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/mobile_api_paths.dart';
import 'package:gats_academy/data/mock/mock_data.dart';

abstract final class FlashcardApiService {
  static Future<List<FlashcardItem>> due({
    required String token,
    int limit = 20,
    String? courseId,
  }) async {
    final query = <String, String>{'limit': '$limit'};
    if (courseId != null && courseId.isNotEmpty) {
      query['courseId'] = courseId;
    }
    final json = await ApiClient.get(
      FlashcardApiPaths.due,
      token: token,
      query: query,
    );
    final data = json['data'];
    if (data is! List) return const [];
    return data.whereType<Map>().map((e) {
      final m = Map<String, dynamic>.from(e);
      return FlashcardItem(
        id: m['id']?.toString() ?? m['cardId']?.toString() ?? '',
        front: m['front']?.toString() ?? '',
        back: m['back']?.toString() ?? '',
        hint: m['hint']?.toString(),
        deckId: m['deckId']?.toString(),
        deckTitle: m['deckTitle']?.toString(),
        courseId: m['courseId']?.toString(),
        courseTitle: m['courseTitle']?.toString(),
      );
    }).toList();
  }

  static Future<void> syncReviews({
    required String token,
    required List<Map<String, dynamic>> reviews,
  }) async {
    await ApiClient.post(
      FlashcardApiPaths.reviewsSync,
      token: token,
      body: {'reviews': reviews},
    );
  }

  static Future<Map<String, dynamic>> stats({
    required String token,
    String? courseId,
  }) async {
    final query = <String, String>{};
    if (courseId != null && courseId.isNotEmpty) {
      query['courseId'] = courseId;
    }
    final json = await ApiClient.get(
      FlashcardApiPaths.stats,
      token: token,
      query: query.isEmpty ? null : query,
    );
    if (json['data'] is Map) {
      return Map<String, dynamic>.from(json['data'] as Map);
    }
    return json;
  }

  /// Group due cards into per-deck study sessions.
  static List<FlashcardDeck> groupDueByDeck(List<FlashcardItem> cards) {
    final byDeck = <String, List<FlashcardItem>>{};
    for (final card in cards) {
      final key = card.deckId ?? 'unknown';
      byDeck.putIfAbsent(key, () => []).add(card);
    }
    return byDeck.entries.map((e) {
      final first = e.value.first;
      return FlashcardDeck(
        id: e.key,
        title: (first.deckTitle != null && first.deckTitle!.trim().isNotEmpty)
            ? first.deckTitle!.trim()
            : 'Bộ thẻ',
        moduleName: first.courseTitle?.trim().isNotEmpty == true
            ? first.courseTitle!.trim()
            : 'Khóa học',
        courseId: first.courseId,
        courseTitle: first.courseTitle,
        cards: e.value,
        dueToday: e.value.length,
      );
    }).toList();
  }
}
