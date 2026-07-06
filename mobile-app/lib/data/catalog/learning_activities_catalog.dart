import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/core/services/onboarding_prefs.dart';
import 'package:gats_academy/data/catalog/catalog_paths.dart';
import 'package:gats_academy/data/mock/mock_data.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';

/// Đọc roadmap / daily tasks / flashcards từ các file JSON riêng.
class LearningActivitiesCatalog {
  LearningActivitiesCatalog._();
  static final LearningActivitiesCatalog instance = LearningActivitiesCatalog._();

  bool _loaded = false;
  final List<CatalogRoadmapModule> _roadmap = [];
  final List<CatalogDailyTask> _dailyTasks = [];
  final List<FlashcardDeck> _flashcardDecks = [];
  final Map<String, String> _deckCourseIds = {};

  Future<void> init() async {
    if (_loaded) return;
    try {
      final roadmapJson = jsonDecode(
        await rootBundle.loadString(CatalogPaths.roadmapModules),
      ) as Map<String, dynamic>;
      final dailyJson = jsonDecode(
        await rootBundle.loadString(CatalogPaths.dailyTasks),
      ) as Map<String, dynamic>;
      final decksJson = jsonDecode(
        await rootBundle.loadString(CatalogPaths.flashcardDecks),
      ) as Map<String, dynamic>;

      _roadmap.clear();
      for (final item in roadmapJson['modules'] as List<dynamic>? ?? []) {
        _roadmap.add(CatalogRoadmapModule.fromJson(item as Map<String, dynamic>));
      }
      _roadmap.sort((a, b) => a.order.compareTo(b.order));

      _dailyTasks.clear();
      for (final item in dailyJson['tasks'] as List<dynamic>? ?? []) {
        _dailyTasks.add(CatalogDailyTask.fromJson(item as Map<String, dynamic>));
      }
      _dailyTasks.sort((a, b) => a.order.compareTo(b.order));

      _flashcardDecks.clear();
      for (final item in decksJson['decks'] as List<dynamic>? ?? []) {
        final m = item as Map<String, dynamic>;
        final cards = (m['cards'] as List<dynamic>? ?? [])
            .map(
              (c) => FlashcardItem(
                id: c['id'] as String,
                front: c['front'] as String,
                back: c['back'] as String,
                hint: c['hint'] as String?,
              ),
            )
            .toList();
        _flashcardDecks.add(
          FlashcardDeck(
            id: m['id'] as String,
            title: m['title'] as String,
            moduleName: m['moduleName'] as String,
            dueToday: m['dueToday'] as int? ?? 0,
            cards: cards,
          ),
        );
        _deckCourseIds[m['id'] as String] = m['courseId'] as String? ?? '';
      }

      _loaded = true;
    } catch (e, st) {
      debugPrint('LearningActivitiesCatalog: load failed — $e\n$st');
      _loaded = true;
    }
  }

  /// Khóa đang học: owned + recommended từ onboarding.
  Future<Set<String>> activeCourseIds({String? userId, UserRole role = UserRole.user}) async {
    final ids = <String>{};
    final repo = CourseModule.repository;

    for (final item in repo.listOwned(userId: userId, role: role)) {
      ids.add(item.id);
    }

    final recommended = await OnboardingPrefs.recommendedCourseIds();
    ids.addAll(recommended);

    if (ids.isEmpty) {
      for (final item in repo.listPublished(userId: userId, role: role).take(2)) {
        ids.add(item.id);
      }
    }
    return ids;
  }

  Future<List<RoadmapModule>> roadmapModules({String? userId, UserRole role = UserRole.user}) async {
    if (!_loaded || _roadmap.isEmpty) return MockData.staticRoadmapModules;

    final courseIds = await activeCourseIds(userId: userId, role: role);
    final repo = CourseModule.repository;
    final filtered = _roadmap.where((m) => courseIds.contains(m.courseId)).toList();
    if (filtered.isEmpty) return MockData.staticRoadmapModules;

    return filtered.map((m) {
      final course = repo.getCourse(m.courseId);
      final progress = course?.progressFor(userId) ?? 0;
      final status = progress >= 1
          ? RoadmapStatus.completed
          : progress > 0
              ? RoadmapStatus.inProgress
              : RoadmapStatus.notStarted;

      return RoadmapModule(
        title: m.title,
        description: m.description,
        status: status,
        progress: progress.clamp(0, 1),
        icon: m.icon,
        courseId: m.courseId,
        lectureId: m.lectureId,
        quizId: m.quizId,
      );
    }).toList();
  }

  Future<List<DailyTask>> dailyTasks({String? userId, UserRole role = UserRole.user}) async {
    if (!_loaded || _dailyTasks.isEmpty) return MockData.staticDailyTasks;

    final courseIds = await activeCourseIds(userId: userId, role: role);
    final filtered = _dailyTasks.where((t) => courseIds.contains(t.courseId)).take(4).toList();
    if (filtered.isEmpty) return MockData.staticDailyTasks;

    return filtered
        .map(
          (t) => DailyTask(
            id: t.id,
            title: t.title,
            isDone: false,
            deckId: t.deckId,
            courseId: t.courseId,
            quizId: t.quizId,
            type: t.type,
          ),
        )
        .toList();
  }

  List<FlashcardDeck> flashcardDecksForCourses(Set<String> courseIds) {
    if (!_loaded || _flashcardDecks.isEmpty) return MockData.staticFlashcardDecks;
    final filtered = _flashcardDecks.where((d) {
      final courseId = _deckCourseIds[d.id];
      return courseId != null && courseId.isNotEmpty && courseIds.contains(courseId);
    }).toList();
    return filtered.isNotEmpty ? filtered : MockData.staticFlashcardDecks;
  }
}

class CatalogRoadmapModule {
  const CatalogRoadmapModule({
    required this.id,
    required this.courseId,
    required this.title,
    required this.description,
    required this.order,
    required this.icon,
    this.lectureId,
    this.quizId,
  });

  final String id;
  final String courseId;
  final String? lectureId;
  final String? quizId;
  final String title;
  final String description;
  final int order;
  final IconData icon;

  factory CatalogRoadmapModule.fromJson(Map<String, dynamic> json) {
    return CatalogRoadmapModule(
      id: json['id'] as String,
      courseId: json['courseId'] as String,
      lectureId: json['lectureId'] as String?,
      quizId: json['quizId'] as String?,
      title: json['title'] as String,
      description: json['description'] as String,
      order: json['order'] as int? ?? 0,
      icon: _iconFromName(json['icon'] as String? ?? 'school'),
    );
  }

  static IconData _iconFromName(String name) => switch (name) {
        'foundation' => Icons.foundation,
        'edit_note' => Icons.edit_note,
        'business_center_outlined' => Icons.business_center_outlined,
        'hub_outlined' => Icons.hub_outlined,
        'code' => Icons.code,
        'translate' => Icons.translate,
        _ => Icons.school_outlined,
      };
}

class CatalogDailyTask {
  const CatalogDailyTask({
    required this.id,
    required this.courseId,
    required this.title,
    required this.type,
    required this.order,
    this.quizId,
    this.lectureId,
    this.deckId,
  });

  final String id;
  final String courseId;
  final String? quizId;
  final String? lectureId;
  final String? deckId;
  final String type;
  final String title;
  final int order;

  factory CatalogDailyTask.fromJson(Map<String, dynamic> json) {
    return CatalogDailyTask(
      id: json['id'] as String,
      courseId: json['courseId'] as String,
      quizId: json['quizId'] as String?,
      lectureId: json['lectureId'] as String?,
      deckId: json['deckId'] as String?,
      type: json['type'] as String? ?? 'read',
      title: json['title'] as String,
      order: json['order'] as int? ?? 0,
    );
  }
}
