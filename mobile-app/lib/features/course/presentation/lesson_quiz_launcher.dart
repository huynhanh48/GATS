import 'package:flutter/material.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/quiz_api_service.dart';
import 'package:gats_academy/features/course/presentation/quiz_take_screen.dart';

/// Quiz gắn lesson — load byLesson rồi dùng màn [QuizTakeScreen].
abstract final class LessonQuizLauncher {
  /// Returns `true` if passed, `false` if submitted but not passed, `null` if closed without result.
  static Future<bool?> open(
    BuildContext context, {
    required String courseId,
    required String lessonId,
    String? title,
  }) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      final token = await AuthPrefs.accessToken();
      if (token == null) {
        messenger.showSnackBar(
          const SnackBar(content: Text('Vui lòng đăng nhập.')),
        );
        return null;
      }
      final quiz = await QuizApiService.byLesson(
        courseId: courseId,
        lessonId: lessonId,
        token: token,
      );
      if (!context.mounted) return null;
      final result = await QuizTakeScreen.open(
        context,
        quizId: quiz.id,
        title: title ?? quiz.title,
      );
      return result?.passed;
    } catch (e) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            e is ApiException ? e.message : 'Không mở được quiz bài học.',
          ),
        ),
      );
      return null;
    }
  }
}
