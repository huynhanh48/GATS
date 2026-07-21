import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/data/mock/mock_post_store.dart';
import 'package:gats_academy/data/mock/models/post_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';
import 'package:gats_academy/features/course/course_module.dart';

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
  bool _publishing = false;

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

  Future<void> _publish() async {
    final title = _titleController.text.trim();
    final body = _bodyController.text.trim();
    if (title.isEmpty || body.isEmpty || _publishing) return;

    final scope = widget.fixedCourseId != null ? PostScope.course : _scope;
    final courseId = scope == PostScope.course
        ? (widget.fixedCourseId ?? _courseId)
        : null;

    // BE chưa gắn post ↔ courseId — compose course-scoped vẫn publish global.
    if (scope == PostScope.course &&
        courseId == null &&
        widget.fixedCourseId == null &&
        !widget.allowGlobal) {
      return;
    }

    setState(() => _publishing = true);
    final ok = await MockPostStore.instance.addPost(
      title: title,
      body: body,
      authorId: widget.authorId,
      authorName: widget.authorName,
      authorRole: widget.authorRole,
      scope: PostScope.global,
      courseId: courseId,
    );
    if (!mounted) return;
    setState(() => _publishing = false);

    if (!ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đăng bài thất bại. Kiểm tra quyền / đăng nhập.')),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppStrings.postPublished)),
    );
    Navigator.of(context).pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final all = CourseModule.repository.listPublishedCourses();
    final courses = widget.authorRole == UserRole.admin
        ? all
        : all.where((c) => c.mentorId == widget.authorId).toList();

    return GatsThemedScaffold(
      appBar: AppBar(
        title: Text(AppStrings.postComposeTitle),
        actions: [
          TextButton(
            onPressed: _publishing ? null : _publish,
            child: _publishing
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(AppStrings.postComposePublish),
          ),
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
