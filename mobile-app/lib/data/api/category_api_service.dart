import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/course_api_paths.dart';
import 'package:gats_academy/data/mock/models/post_models.dart';

/// BE `GET /api/categories?type=post`.
abstract final class CategoryApiService {
  static Future<List<PostCategory>> listPostCategories({String? token}) async {
    final json = await ApiClient.get(
      CategoryApiPaths.list,
      token: token,
      query: {
        'type': 'post',
        'status': 'active',
      },
    );
    final data = json['data'] ?? json['categories'] ?? json;
    if (data is! List) return const [];
    return data.whereType<Map>().map((e) {
      final m = Map<String, dynamic>.from(e);
      return PostCategory(
        id: m['id']?.toString() ?? '',
        name: m['name']?.toString() ?? '',
        slug: m['slug']?.toString() ?? '',
        postCount: (m['postCount'] as num?)?.toInt() ?? 0,
      );
    }).where((c) => c.id.isNotEmpty && c.name.isNotEmpty).toList();
  }
}
