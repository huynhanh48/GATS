import 'package:gats_academy/core/utils/html_plain_text.dart';
import 'package:gats_academy/core/utils/media_url.dart';
import 'package:gats_academy/data/api/course_api_paths.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';

/// Map JSON từ BE `CoursePublic` / `CourseDetail` → [AppCourse] (UI hiện tại).
///
/// Khi nối API: parse response rồi gọi [fromPublicJson] / [fromDetailJson].
abstract final class CourseBeMapper {
  static AppCourse fromPublicJson(
    Map<String, dynamic> json, {
    String mentorId = '',
    String groupChatId = '',
    Set<String> enrolledUserIds = const {},
    Map<String, double> progressByUser = const {},
    List<CourseLecture> lectures = const [],
    List<CourseQuiz> quizzes = const [],
  }) {
    final price = (json['price'] as num?)?.toDouble() ?? 0;
    final saleRaw = json['salePrice'];
    final salePrice = saleRaw == null ? null : (saleRaw as num).toDouble();
    // Free khi giá gốc = 0 hoặc salePrice = 0 (khuyến mãi miễn phí).
    final isFree = price <= 0 || (salePrice != null && salePrice <= 0);

    final tags = json['tags'];
    final category = json['category'];
    String tag = 'Khóa học';
    if (tags is List && tags.isNotEmpty) {
      final first = tags.first;
      if (first is Map && first['name'] is String) {
        tag = first['name'] as String;
      }
    } else if (category is Map && category['name'] is String) {
      tag = category['name'] as String;
    }

    final stats = json['stats'];
    int lessonCount = 0;
    int durationMinutes = 0;
    if (stats is Map) {
      lessonCount = (stats['lessonCount'] as num?)?.toInt() ?? 0;
      final seconds = (stats['totalDurationSeconds'] as num?)?.toInt() ?? 0;
      durationMinutes = (seconds / 60).round();
    }

    final thumb = MediaUrl.resolve(json['thumbnail'] as String?);

    return AppCourse(
      id: json['id'] as String,
      slug: json['slug'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: HtmlPlainText.from(json['description'] as String? ?? ''),
      tag: tag,
      lessonCount: lessonCount,
      durationMinutes: durationMinutes,
      mentorId: mentorId,
      groupChatId: groupChatId.isNotEmpty
          ? groupChatId
          : 'gc-${json['id']}',
      isPublished: (json['status'] as String?) == 'published',
      isFree: isFree,
      price: price,
      salePrice: salePrice,
      thumbnailUrl: thumb,
      enrolledUserIds: enrolledUserIds,
      progressByUser: progressByUser,
      lectures: lectures,
      quizzes: quizzes,
    );
  }

  /// Detail response có `sections` — flatten lesson titles thành [CourseLecture].
  static AppCourse fromDetailJson(
    Map<String, dynamic> json, {
    String mentorId = '',
    Set<String> enrolledUserIds = const {},
    Map<String, double> progressByUser = const {},
  }) {
    final lectures = <CourseLecture>[];
    final sections = json['sections'];
    if (sections is List) {
      for (final section in sections) {
        if (section is! Map) continue;
        final lessons = section['lessons'];
        if (lessons is! List) continue;
        for (final lesson in lessons) {
          if (lesson is! Map) continue;
          final durationSec = (lesson['duration'] as num?)?.toInt();
          final isPreview = lesson['isPreview'] as bool? ?? false;
          final locked = lesson['locked'] as bool? ?? !isPreview;
          lectures.add(
            CourseLecture(
              id: lesson['id'] as String? ?? '',
              title: lesson['title'] as String? ?? '',
              durationMinutes:
                  durationSec == null ? 0 : (durationSec / 60).round(),
              isPreview: isPreview,
              locked: locked,
              type: lesson['type'] as String? ?? 'video',
              content: lesson['content'] as String?,
            ),
          );
        }
      }
    }

    final author = json['author'];
    final authorId = author is Map ? '${author['id'] ?? ''}' : '';

    return fromPublicJson(
      json,
      mentorId: mentorId.isNotEmpty ? mentorId : authorId,
      enrolledUserIds: enrolledUserIds,
      progressByUser: progressByUser,
      lectures: lectures,
    );
  }

  /// Endpoint helpers — dùng chung với [CourseApiPaths].
  static String listUrl() => CourseApiPaths.list;
  static String detailBySlugUrl(String slug) => CourseApiPaths.bySlug(slug);
}
