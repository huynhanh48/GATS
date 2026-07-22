import 'package:flutter/material.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/api/assignment_api_service.dart';

/// Nộp bài tập text/URL tối thiểu.
class AssignmentSubmitSheet extends StatefulWidget {
  const AssignmentSubmitSheet({
    super.key,
    required this.courseId,
    required this.lessonId,
  });

  final String courseId;
  final String lessonId;

  static Future<void> show(
    BuildContext context, {
    required String courseId,
    required String lessonId,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AssignmentSubmitSheet(
        courseId: courseId,
        lessonId: lessonId,
      ),
    );
  }

  @override
  State<AssignmentSubmitSheet> createState() => _AssignmentSubmitSheetState();
}

class _AssignmentSubmitSheetState extends State<AssignmentSubmitSheet> {
  AssignmentPayload? _assignment;
  String? _error;
  bool _loading = true;
  bool _submitting = false;
  final _textController = TextEditingController();
  final _urlController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _textController.dispose();
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final token = await AuthPrefs.accessToken();
      if (token == null) throw StateError('Chưa đăng nhập');
      final assignment = await AssignmentApiService.byLesson(
        courseId: widget.courseId,
        lessonId: widget.lessonId,
        token: token,
      );
      final latest = assignment.latestSubmission;
      if (latest?.textContent != null) {
        _textController.text = latest!.textContent!;
      }
      if (latest?.url != null) {
        _urlController.text = latest!.url!;
      }
      if (!mounted) return;
      setState(() {
        _assignment = assignment;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException
            ? e.message
            : 'Không có bài tập cho bài học này.';
      });
    }
  }

  Future<void> _submit() async {
    final assignment = _assignment;
    if (assignment == null) return;
    if (assignment.remainingSubmissions <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã hết lượt nộp.')),
      );
      return;
    }
    setState(() => _submitting = true);
    try {
      final token = await AuthPrefs.accessToken();
      if (token == null) throw StateError('Chưa đăng nhập');
      await AssignmentApiService.submit(
        assignmentId: assignment.id,
        token: token,
        textContent: assignment.allowsText ? _textController.text.trim() : null,
        url: assignment.allowsUrl ? _urlController.text.trim() : null,
      );
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã nộp bài tập.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e is ApiException ? e.message : 'Nộp bài thất bại.',
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final bottom = MediaQuery.viewInsetsOf(context).bottom;

    return Container(
      decoration: BoxDecoration(
        color: gats.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      padding: EdgeInsets.fromLTRB(
        AppSpacing.xl,
        AppSpacing.lg,
        AppSpacing.xl,
        bottom + AppSpacing.lg,
      ),
      child: _loading
          ? const SizedBox(
              height: 180,
              child: Center(child: CircularProgressIndicator()),
            )
          : _error != null
              ? Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(_error!, textAlign: TextAlign.center),
                    const SizedBox(height: AppSpacing.md),
                    TextButton(onPressed: _load, child: const Text('Thử lại')),
                  ],
                )
              : _buildForm(gats),
    );
  }

  Widget _buildForm(GatsThemeExtension gats) {
    final a = _assignment!;
    final latest = a.latestSubmission;
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            a.title ?? 'Bài tập',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: gats.textPrimary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Còn ${a.remainingSubmissions}/${a.maxSubmissions} lượt · tối đa ${a.maxScore} điểm',
            style: TextStyle(color: gats.textSecondary, fontSize: 13),
          ),
          if (latest != null) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Lần nộp gần nhất: ${latest.status}'
              '${latest.score != null ? ' · ${latest.score} điểm' : ''}',
              style: TextStyle(color: gats.lavenderAccent, fontSize: 13),
            ),
            if (latest.feedback != null && latest.feedback!.isNotEmpty)
              Text(
                'Feedback: ${latest.feedback}',
                style: TextStyle(color: gats.textSecondary, fontSize: 12),
              ),
          ],
          const SizedBox(height: AppSpacing.lg),
          if (a.allowsText) ...[
            TextField(
              controller: _textController,
              maxLines: 4,
              enabled: !_submitting && a.remainingSubmissions > 0,
              decoration: const InputDecoration(
                labelText: 'Nội dung bài làm',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
          if (a.allowsUrl) ...[
            TextField(
              controller: _urlController,
              enabled: !_submitting && a.remainingSubmissions > 0,
              decoration: const InputDecoration(
                labelText: 'URL bài làm',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
          SizedBox(
            height: 48,
            child: FilledButton(
              onPressed: (_submitting || a.remainingSubmissions <= 0)
                  ? null
                  : _submit,
              child: _submitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Nộp bài'),
            ),
          ),
        ],
      ),
    );
  }
}
