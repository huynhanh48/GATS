import 'package:flutter/material.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/api/learn_extras_api_service.dart';

/// Notes / bookmarks / Q&A — mirror Web LearnExtrasPanel (tối giản).
class LearnExtrasPanel extends StatefulWidget {
  const LearnExtrasPanel({
    super.key,
    required this.courseId,
    required this.lessonId,
  });

  final String courseId;
  final String lessonId;

  @override
  State<LearnExtrasPanel> createState() => _LearnExtrasPanelState();
}

class _LearnExtrasPanelState extends State<LearnExtrasPanel> {
  bool _loading = true;
  String? _error;
  List<LessonNoteDto> _notes = const [];
  List<LessonBookmarkDto> _bookmarks = const [];
  List<LessonQuestionDto> _questions = const [];
  final _noteController = TextEditingController();
  final _questionController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _noteController.dispose();
    _questionController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final token = await AuthPrefs.accessToken();
      if (token == null) {
        setState(() {
          _loading = false;
          _error = 'Đăng nhập để dùng ghi chú / Q&A.';
        });
        return;
      }
      final results = await Future.wait([
        LearnExtrasApiService.listNotes(
          courseId: widget.courseId,
          lessonId: widget.lessonId,
          token: token,
        ),
        LearnExtrasApiService.listBookmarks(
          courseId: widget.courseId,
          lessonId: widget.lessonId,
          token: token,
        ),
        LearnExtrasApiService.listQuestions(
          courseId: widget.courseId,
          lessonId: widget.lessonId,
          token: token,
        ),
      ]);
      if (!mounted) return;
      setState(() {
        _notes = results[0] as List<LessonNoteDto>;
        _bookmarks = results[1] as List<LessonBookmarkDto>;
        _questions = results[2] as List<LessonQuestionDto>;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Không tải extras.';
      });
    }
  }

  Future<String?> _token() => AuthPrefs.accessToken();

  Future<void> _addNote() async {
    final text = _noteController.text.trim();
    if (text.isEmpty) return;
    final token = await _token();
    if (token == null) return;
    try {
      await LearnExtrasApiService.addNote(
        courseId: widget.courseId,
        lessonId: widget.lessonId,
        token: token,
        content: text,
      );
      _noteController.clear();
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e is ApiException ? e.message : 'Lỗi ghi chú')),
      );
    }
  }

  Future<void> _addBookmark() async {
    final token = await _token();
    if (token == null) return;
    try {
      await LearnExtrasApiService.addBookmark(
        courseId: widget.courseId,
        lessonId: widget.lessonId,
        token: token,
        label: 'Bookmark',
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e is ApiException ? e.message : 'Lỗi bookmark'),
        ),
      );
    }
  }

  Future<void> _ask() async {
    final text = _questionController.text.trim();
    if (text.isEmpty) return;
    final token = await _token();
    if (token == null) return;
    try {
      await LearnExtrasApiService.askQuestion(
        courseId: widget.courseId,
        lessonId: widget.lessonId,
        token: token,
        content: text,
      );
      _questionController.clear();
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e is ApiException ? e.message : 'Lỗi Q&A')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    if (_loading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
      );
    }

    if (_error != null) {
      return Padding(
        padding: const EdgeInsets.only(bottom: AppSpacing.md),
        child: Column(
          children: [
            Text(_error!, style: TextStyle(color: gats.textSecondary, fontSize: 13)),
            TextButton(onPressed: _load, child: const Text('Thử lại')),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Ghi chú & Q&A',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 15,
            color: gats.textPrimary,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        TextField(
          controller: _noteController,
          minLines: 1,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: 'Thêm ghi chú…',
            border: const OutlineInputBorder(),
            suffixIcon: IconButton(
              icon: const Icon(Icons.add),
              onPressed: _addNote,
            ),
          ),
        ),
        if (_notes.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.sm),
          ..._notes.take(3).map(
                (n) => ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  title: Text(n.content, maxLines: 2, overflow: TextOverflow.ellipsis),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline, size: 18),
                    onPressed: () async {
                      final token = await _token();
                      if (token == null) return;
                      await LearnExtrasApiService.deleteNote(
                        noteId: n.id,
                        token: token,
                      );
                      await _load();
                    },
                  ),
                ),
              ),
        ],
        const SizedBox(height: AppSpacing.sm),
        OutlinedButton.icon(
          onPressed: _addBookmark,
          icon: const Icon(Icons.bookmark_add_outlined, size: 18),
          label: Text('Bookmark (${_bookmarks.length})'),
        ),
        const SizedBox(height: AppSpacing.md),
        TextField(
          controller: _questionController,
          minLines: 1,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: 'Đặt câu hỏi…',
            border: const OutlineInputBorder(),
            suffixIcon: IconButton(
              icon: const Icon(Icons.send),
              onPressed: _ask,
            ),
          ),
        ),
        if (_questions.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.sm),
          ..._questions.take(5).map(
                (q) => ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(
                    q.isResolved ? Icons.check_circle : Icons.help_outline,
                    size: 18,
                    color: q.isResolved
                        ? gats.lavenderAccent
                        : gats.textSecondary,
                  ),
                  title: Text(q.content, maxLines: 2, overflow: TextOverflow.ellipsis),
                  subtitle: q.userName != null ? Text(q.userName!) : null,
                ),
              ),
        ],
        const SizedBox(height: AppSpacing.md),
      ],
    );
  }
}
