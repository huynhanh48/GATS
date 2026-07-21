import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/course_api_paths.dart';
import 'package:gats_academy/data/api/course_be_mapper.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';

/// Gọi BE course APIs (display). Chưa thay [MockCourseRepository] — nối dần.
abstract final class CourseApiService {
  /// `GET /api/courses` — mặc định BE trả published khi unauth.
  static Future<List<AppCourse>> listPublished({String? token}) async {
    final json = await ApiClient.get(
      CourseApiPaths.list,
      token: token,
      query: const {'limit': '50', 'page': '1'},
    );
    final data = json['data'];
    if (data is! List) return [];
    return data
        .whereType<Map>()
        .map((e) => CourseBeMapper.fromPublicJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  static Future<AppCourse?> getBySlug(String slug, {String? token}) async {
    final json = await ApiClient.get(
      CourseApiPaths.bySlug(slug),
      token: token,
    );
    final course = json['course'];
    if (course is! Map) return null;
    return CourseBeMapper.fromDetailJson(Map<String, dynamic>.from(course));
  }

  static Future<AppCourse?> getById(String id, {String? token}) async {
    final json = await ApiClient.get(CourseApiPaths.byId(id), token: token);
    final course = json['course'];
    if (course is! Map) return null;
    final map = Map<String, dynamic>.from(course);
    // Detail/byId có `sections` → flatten lessons; list-only payload thì lectures rỗng.
    if (map['sections'] is List) {
      return CourseBeMapper.fromDetailJson(map);
    }
    return CourseBeMapper.fromPublicJson(map);
  }

  /// `GET /api/courses/:id/curriculum` — sections + lessons (isPreview/locked).
  static Future<List<CourseLecture>> listCurriculumLectures(
    String courseId, {
    String? token,
  }) async {
    final json = await ApiClient.get(
      CourseApiPaths.curriculum(courseId),
      token: token,
    );
    final sections = json['data'];
    if (sections is! List) return [];
    final mapped = CourseBeMapper.fromDetailJson({
      'id': courseId,
      'title': '',
      'description': '',
      'price': 0,
      'status': 'published',
      'sections': sections,
    });
    return mapped.lectures;
  }

  /// `GET /api/me/enrollments` — chỉ enrollment rows; join course bằng [getById].
  static Future<List<Map<String, dynamic>>> listMyEnrollments({
    required String token,
  }) async {
    final json = await ApiClient.get(
      CourseApiPaths.myEnrollments,
      token: token,
    );
    final data = json['data'];
    if (data is! List) return [];
    return data
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }

  static Future<void> enrollFree({
    required String courseId,
    required String token,
  }) async {
    await ApiClient.post(
      CourseApiPaths.enrollments(courseId),
      body: const <String, dynamic>{},
      token: token,
    );
  }
}
