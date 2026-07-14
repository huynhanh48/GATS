import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/course/navigation/course_navigator.dart';
import 'package:gats_academy/features/home/presentation/my_courses_screen.dart';
import 'package:gats_academy/features/home/presentation/widgets/nested_tab_scroll.dart';

class QuizTab extends StatelessWidget {
  const QuizTab({super.key, this.userId, this.nestedScroll = false});

  final String? userId;
  final bool nestedScroll;

  List<({String courseId, String courseName, String quizTitle, int count})> _quizzes() {
    final store = CourseModule.repository;
    final quizzes = <({String courseId, String courseName, String quizTitle, int count})>[];

    for (final courseItem in store.listPublished(userId: userId)) {
      final course = store.getCourse(courseItem.id);
      if (course == null) continue;
      if (userId != null && !course.isOwnedBy(userId)) continue;
      for (final quiz in course.quizzes.where((q) => q.isPublished)) {
        quizzes.add((
          courseId: course.id,
          courseName: course.title,
          quizTitle: quiz.title,
          count: quiz.questionCount,
        ));
      }
    }
    return quizzes;
  }

  Widget _emptyState(BuildContext context) {
    return EmptyState(
      icon: Icons.quiz_outlined,
      title: AppStrings.quizEmptyTitle,
      description: AppStrings.quizEmptyDesc,
      action: OutlinedButton(
        onPressed: () => GatsMainNavigator.push(context, const MyCoursesScreen()),
        child: Text(AppStrings.exploreLibrary),
      ),
    );
  }

  Widget _quizCard(BuildContext context, ({String courseId, String courseName, String quizTitle, int count}) item) {
    return SectionCard(
      padding: EdgeInsets.zero,
      child: ListTile(
        leading: const Icon(Icons.quiz_outlined, color: AppColors.primary),
        title: Text(item.quizTitle),
        subtitle: Text('${item.courseName} · ${AppStrings.quizCountLabel.replaceFirst('%d', '${item.count}')}'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => CourseNavigator.open(
          context,
          courseId: item.courseId,
          mode: CourseOpenMode.learn,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final quizzes = _quizzes();

    if (nestedScroll) {
      if (quizzes.isEmpty) {
        return NestedTabScrollView(
          storageKey: 'home_quiz',
          slivers: [
            SliverFillRemaining(hasScrollBody: false, child: _emptyState(context)),
          ],
        );
      }

      return NestedTabScrollView(
        storageKey: 'home_quiz',
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            sliver: SliverList.separated(
              itemCount: quizzes.length,
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
              itemBuilder: (context, index) => _quizCard(context, quizzes[index]),
            ),
          ),
        ],
      );
    }

    if (quizzes.isEmpty) {
      return _emptyState(context);
    }

    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: quizzes.length,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) => _quizCard(context, quizzes[index]),
    );
  }
}
