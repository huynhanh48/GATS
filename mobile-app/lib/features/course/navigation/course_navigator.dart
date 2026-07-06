import 'package:flutter/material.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/course/presentation/course_detail_screen.dart';
import 'package:gats_academy/features/store/presentation/course_store_detail_screen.dart';

enum CourseOpenMode { browse, learn, purchase }

abstract final class CourseNavigator {
  /// - [CourseOpenMode.learn] hoặc đã mua → [CourseDetailScreen] (học thẳng)
  /// - Chưa mua + browse → [CourseStoreDetailScreen] (preview)
  static Future<void> open(
    BuildContext context, {
    required String courseId,
    CourseOpenMode mode = CourseOpenMode.browse,
  }) async {
    final repo = CourseModule.repository;
    if (repo.getCourse(courseId) == null) return;

    final user = await AuthPrefs.currentUser();
    final userId = user?.id;
    final role = user?.role ?? UserRole.user;
    final owned = repo.isOwned(courseId, userId, role: role);

    final Widget screen;
    if (mode == CourseOpenMode.learn || owned) {
      screen = CourseDetailScreen(courseId: courseId);
    } else {
      screen = CourseStoreDetailScreen(courseId: courseId);
    }

    if (!context.mounted) return;
    await GatsMainNavigator.push(context, screen);
  }
}
