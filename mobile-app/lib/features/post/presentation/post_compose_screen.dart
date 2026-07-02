import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/mock_post_store.dart';
import 'package:gats_academy/data/mock/models/post_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';

class PostComposeScreen extends StatefulWidget {
  const PostComposeScreen({
    super.key,
    required this.authorId,
    required this.authorName,
    required this.authorRole,
    this.fixedCourseId,
    this.allowGlobal = false,
  });

  final String authorId;
  final String authorName;
  final UserRole authorRole;
  final String? fixedCourseId;
  final bool allowGlobal;

  @override
  State<PostComposeScreen> createState() => _PostComposeScreenState();
}

class _PostComposeScreenState extends State<PostComposeScreen> {
  final _titleController = TextEditingController();
  final _bodyController = TextEditingController();
  PostScope _scope = PostScope.course;
  String? _courseId;

  @override
  void initState() {
    super.initState();
    _courseId = widget.fixedCourseId;
    if (widget.allowGlobal && widget.fixedCourseId == null) {
      _scope = PostScope.global;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _bodyController.dispose();
    super.dispose();
  }

  void _publish() {
    final title = _titleController.text.trim();
    final body = _bodyController.text.trim();
    if (title.isEmpty || body.isEmpty) return;

    final scope = widget.fixedCourseId != null ? PostScope.course : _scope;
    final courseId = scope == PostScope.course
        ? (widget.fixedCourseId ?? _courseId)
        : null;

    if (scope == PostScope.course && courseId == null) return;

    MockPostStore.instance.addPost(
      title: title,
      body: body,
      authorId: widget.authorId,
      authorName: widget.authorName,
      authorRole: widget.authorRole,
      scope: scope,
      courseId: courseId,
    );

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppStrings.postPublished)),
    );
    Navigator.of(context).pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final courses = widget.authorRole == UserRole.admin
        ? MockCourseStore.instance.publishedCourses()
        : MockCourseStore.instance.coursesForUser(widget.authorId, role: UserRole.mentor);

    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.postComposeTitle),
        actions: [
          TextButton(onPressed: _publish, child: Text(AppStrings.postComposePublish)),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          if (widget.allowGlobal && widget.fixedCourseId == null) ...[
            SegmentedButton<PostScope>(
              segments: const [
                ButtonSegment(value: PostScope.global, label: Text('GATS')),
                ButtonSegment(value: PostScope.course, label: Text('Khóa')),
              ],
              selected: {_scope},
              onSelectionChanged: (s) => setState(() => _scope = s.first),
            ),
            const SizedBox(height: AppSpacing.lg),
          ],
          if (_scope == PostScope.course && widget.fixedCourseId == null) ...[
            DropdownMenu<String>(
              label: Text(AppStrings.postComposeCourse),
              initialSelection: _courseId ?? courses.firstOrNull?.id,
              dropdownMenuEntries: [
                for (final c in courses)
                  DropdownMenuEntry(value: c.id, label: c.title),
              ],
              onSelected: (id) => setState(() => _courseId = id),
            ),
            const SizedBox(height: AppSpacing.lg),
          ],
          TextField(
            controller: _titleController,
            decoration: InputDecoration(
              labelText: AppStrings.postComposeHintTitle,
              border: const OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          TextField(
            controller: _bodyController,
            minLines: 8,
            maxLines: 16,
            decoration: InputDecoration(
              labelText: AppStrings.postComposeHintBody,
              alignLabelWithHint: true,
              border: const OutlineInputBorder(),
            ),
          ),
        ],
      ),
    );
  }
}
