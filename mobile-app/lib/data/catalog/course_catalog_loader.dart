import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/data/catalog/catalog_paths.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';

/// Đọc và ghép nhiều file JSON trong `assets/data/`.
class CourseCatalogLoader {
  CourseCatalogLoader._();
  static final CourseCatalogLoader instance = CourseCatalogLoader._();

  bool _loaded = false;
  String _mentorId = 'mock_mentor';
  List<AppCourse> _courses = [];
  final Map<String, String> _categoryByCourseId = {};
  final Map<String, Map<String, Set<String>>> _onboardingMeta = {};

  bool get isLoaded => _loaded;
  List<AppCourse> get courses => List.unmodifiable(_courses);

  Future<void> init() async {
    if (_loaded) return;
    try {
      final config = await _loadJson(CatalogPaths.config);
      _mentorId = config['mentorId'] as String? ?? 'mock_mentor';

      final coursesJson = await _loadJson(CatalogPaths.courses);
      final lecturesByCourse = await _groupByCourseId(CatalogPaths.lectures, 'lectures');
      final quizzesByCourse = await _groupByCourseId(CatalogPaths.quizzes, 'quizzes');
      await _loadOnboardingMeta();
      final enrollmentsByCourse = await _loadEnrollments();

      _courses = (coursesJson['courses'] as List<dynamic>? ?? [])
          .map((e) {
            final json = e as Map<String, dynamic>;
            final id = json['id'] as String;
            return _buildCourse(
              json,
              lectures: lecturesByCourse[id] ?? [],
              quizzes: quizzesByCourse[id] ?? [],
              enrolledUserIds: enrollmentsByCourse[id]?.$1 ?? {},
              progressByUser: enrollmentsByCourse[id]?.$2 ?? {},
            );
          })
          .toList();

      _loaded = true;
    } catch (e, st) {
      debugPrint('CourseCatalogLoader: load failed — $e\n$st');
      _courses = [];
      _loaded = true;
    }
  }

  AppCourse? courseById(String id) {
    for (final c in _courses) {
      if (c.id == id) return c;
    }
    return null;
  }

  AppCourse? courseBySlug(String slug) {
    for (final c in _courses) {
      if (c.slug == slug) return c;
    }
    return null;
  }

  String? categoryIdFor(String courseId) => _categoryByCourseId[courseId];

  Map<String, Set<String>> onboardingMetaFor(String courseId) {
    return _onboardingMeta[courseId] ?? {};
  }

  Future<Map<String, dynamic>> _loadJson(String path) async {
    final raw = await rootBundle.loadString(path);
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  Future<Map<String, List<Map<String, dynamic>>>> _groupByCourseId(
    String path,
    String listKey,
  ) async {
    final json = await _loadJson(path);
    final grouped = <String, List<Map<String, dynamic>>>{};
    for (final item in json[listKey] as List<dynamic>? ?? []) {
      final map = item as Map<String, dynamic>;
      final courseId = map['courseId'] as String;
      grouped.putIfAbsent(courseId, () => []).add(map);
    }
    for (final list in grouped.values) {
      list.sort((a, b) => (a['order'] as int? ?? 0).compareTo(b['order'] as int? ?? 0));
    }
    return grouped;
  }

  Future<void> _loadOnboardingMeta() async {
    final json = await _loadJson(CatalogPaths.courseOnboarding);
    for (final item in json['mappings'] as List<dynamic>? ?? []) {
      final map = item as Map<String, dynamic>;
      final courseId = map['courseId'] as String;
      _onboardingMeta[courseId] = {
        for (final key in map.keys)
          if (key != 'courseId')
            key: (map[key] as List<dynamic>? ?? []).map((e) => e.toString()).toSet(),
      };
    }
  }

  Future<Map<String, (Set<String>, Map<String, double>)>> _loadEnrollments() async {
    final json = await _loadJson(CatalogPaths.enrollmentsSeed);
    final result = <String, (Set<String>, Map<String, double>)>{};
    for (final item in json['enrollments'] as List<dynamic>? ?? []) {
      final map = item as Map<String, dynamic>;
      final courseId = map['courseId'] as String;
      final userId = map['userId'] as String;
      final progress = (map['progress'] as num?)?.toDouble() ?? 0;
      final entry = result.putIfAbsent(courseId, () => (<String>{}, <String, double>{}));
      entry.$1.add(userId);
      entry.$2[userId] = progress;
    }
    return result;
  }

  AppCourse _buildCourse(
    Map<String, dynamic> json, {
    required List<Map<String, dynamic>> lectures,
    required List<Map<String, dynamic>> quizzes,
    required Set<String> enrolledUserIds,
    required Map<String, double> progressByUser,
  }) {
    final id = json['id'] as String;
    _categoryByCourseId[id] = json['categoryId'] as String? ?? '';

    final price = (json['price'] as num?)?.toDouble() ?? 0;
    final saleRaw = json['salePrice'];
    final salePrice = saleRaw == null ? null : (saleRaw as num).toDouble();
    final isFree = json['isFree'] as bool? ?? price <= 0;
    final thumb = json['thumbnail'] as String?;

    return AppCourse(
      id: id,
      slug: json['slug'] as String? ?? '',
      title: json['title'] as String,
      description: json['description'] as String,
      tag: json['tag'] as String,
      lessonCount: json['lessonCount'] as int,
      durationMinutes: json['durationMinutes'] as int,
      mentorId: _mentorId,
      groupChatId: json['groupChatId'] as String,
      isPublished: json['isPublished'] as bool? ?? true,
      isFree: isFree,
      price: price,
      salePrice: salePrice,
      thumbnailUrl: (thumb != null && thumb.isNotEmpty) ? thumb : null,
      enrolledUserIds: enrolledUserIds,
      progressByUser: progressByUser,
      lectures: lectures
          .map(
            (e) => CourseLecture(
              id: e['id'] as String,
              title: e['title'] as String,
              durationMinutes: e['durationMinutes'] as int,
            ),
          )
          .toList(),
      quizzes: quizzes
          .map(
            (e) => CourseQuiz(
              id: e['id'] as String,
              title: e['title'] as String,
              questionCount: e['questionCount'] as int,
              isPublished: e['isPublished'] as bool? ?? false,
            ),
          )
          .toList(),
    );
  }
}
