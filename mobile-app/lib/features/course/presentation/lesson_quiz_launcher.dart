import 'package:flutter/material.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/quiz_api_service.dart';
import 'package:gats_academy/features/course/presentation/quiz_take_screen.dart';

/// Quiz gắn lesson — load byLesson rồi dùng màn [QuizTakeScreen].
abstract final class LessonQuizLauncher {
  static Future<void> open(
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
        return;
      }
      final quiz = await QuizApiService.byLesson(
        courseId: courseId,
        lessonId: lessonId,
        token: token,
      );
      if (!context.mounted) return;
      await QuizTakeScreen.open(
        context,
        quizId: quiz.id,
        title: title ?? quiz.title,
      );
    } catch (e) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            e is ApiException ? e.message : 'Không mở được quiz bài học.',
          ),
        ),
      );
    }
  }
}
