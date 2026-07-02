import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/features/course/presentation/course_detail_screen.dart';
import 'package:gats_academy/features/home/presentation/widgets/nested_tab_scroll.dart';

class QuizTab extends StatelessWidget {
  const QuizTab({super.key, this.userId, this.nestedScroll = false});

  final String? userId;
  final bool nestedScroll;

  List<({String courseId, String courseName, String quizTitle, int count})> _quizzes() {
    final store = MockCourseStore.instance;
    final quizzes = <({String courseId, String courseName, String quizTitle, int count})>[];

    for (final course in store.publishedCourses()) {
      if (userId != null && !course.isEnrolledBy(userId)) continue;
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

  Widget _emptyState() {
    return EmptyState(
      icon: Icons.quiz_outlined,
      title: AppStrings.quizEmptyTitle,
      description: AppStrings.quizEmptyDesc,
      action: OutlinedButton(onPressed: () {}, child: Text(AppStrings.exploreLibrary)),
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
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => CourseDetailScreen(courseId: item.courseId),
          ),
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
            SliverFillRemaining(hasScrollBody: false, child: _emptyState()),
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
      return _emptyState();
    }

    return ListView.separated(
      padding: const EdgeInsets.all(AppSpacing.lg),
      itemCount: quizzes.length,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) => _quizCard(context, quizzes[index]),
    );
  }
}
