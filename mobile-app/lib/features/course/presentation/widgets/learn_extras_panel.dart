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
  int _selectedTab = 0;

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

    return Container(
      decoration: BoxDecoration(
        color: gats.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: gats.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.md,
              AppSpacing.md,
              AppSpacing.md,
              0,
            ),
            child: Row(
              children: [
                _ExtrasTab(
                  icon: Icons.edit_note_rounded,
                  label: 'Ghi chú',
                  count: _notes.length,
                  selected: _selectedTab == 0,
                  onTap: () => setState(() => _selectedTab = 0),
                ),
                const SizedBox(width: AppSpacing.sm),
                _ExtrasTab(
                  icon: Icons.forum_outlined,
                  label: 'Hỏi đáp',
                  count: _questions.length,
                  selected: _selectedTab == 1,
                  onTap: () => setState(() => _selectedTab = 1),
                ),
                const SizedBox(width: AppSpacing.sm),
                _ExtrasTab(
                  icon: Icons.bookmark_outline_rounded,
                  label: 'Đã lưu',
                  count: _bookmarks.length,
                  selected: _selectedTab == 2,
                  onTap: () => setState(() => _selectedTab = 2),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: switch (_selectedTab) {
              0 => _buildNotes(gats),
              1 => _buildQuestions(gats),
              _ => _buildBookmarks(gats),
            },
          ),
        ],
      ),
    );
  }

  Widget _buildNotes(GatsThemeExtension gats) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _noteController,
          minLines: 1,
          maxLines: 3,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => _addNote(),
          decoration: InputDecoration(
            labelText: 'Ghi chú cho bài học này',
            hintText: 'Viết điều bạn muốn ghi nhớ…',
            prefixIcon: const Icon(Icons.edit_note_rounded),
            suffixIcon: IconButton(
              tooltip: 'Lưu ghi chú',
              icon: const Icon(Icons.add_circle_rounded),
              onPressed: _addNote,
            ),
          ),
        ),
        if (_notes.isEmpty)
          _EmptyExtras(
            icon: Icons.lightbulb_outline_rounded,
            text: 'Ghi lại ý chính để xem lại nhanh trên mọi thiết bị.',
            color: gats.lavenderAccent,
          )
        else ...[
          const SizedBox(height: AppSpacing.sm),
          ..._notes.take(3).map(
                (note) => ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 4),
                  minTileHeight: 52,
                  leading: Icon(
                    Icons.notes_rounded,
                    color: gats.lavenderAccent,
                  ),
                  title: Text(
                    note.content,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: IconButton(
                    tooltip: 'Xóa ghi chú',
                    icon: const Icon(Icons.delete_outline_rounded),
                    onPressed: () async {
                      final token = await _token();
                      if (token == null) return;
                      await LearnExtrasApiService.deleteNote(
                        noteId: note.id,
                        token: token,
                      );
                      await _load();
                    },
                  ),
                ),
              ),
        ],
      ],
    );
  }

  Widget _buildQuestions(GatsThemeExtension gats) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _questionController,
          minLines: 1,
          maxLines: 3,
          textInputAction: TextInputAction.send,
          onSubmitted: (_) => _ask(),
          decoration: InputDecoration(
            labelText: 'Hỏi về nội dung bài học',
            hintText: 'Nhập câu hỏi của bạn…',
            prefixIcon: const Icon(Icons.help_outline_rounded),
            suffixIcon: IconButton(
              tooltip: 'Gửi câu hỏi',
              icon: const Icon(Icons.send_rounded),
              onPressed: _ask,
            ),
          ),
        ),
        if (_questions.isEmpty)
          _EmptyExtras(
            icon: Icons.forum_outlined,
            text: 'Chưa có câu hỏi nào cho bài học này.',
            color: gats.lavenderAccent,
          )
        else ...[
          const SizedBox(height: AppSpacing.sm),
          ..._questions.take(5).map(
                (question) => ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 4),
                  minTileHeight: 56,
                  leading: Icon(
                    question.isResolved
                        ? Icons.check_circle_rounded
                        : Icons.help_outline_rounded,
                    color: question.isResolved
                        ? AppColors.success
                        : AppColors.accent,
                  ),
                  title: Text(
                    question.content,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  subtitle: Text(
                    question.isResolved
                        ? 'Đã được giải đáp'
                        : (question.userName ?? 'Đang chờ giải đáp'),
                  ),
                ),
              ),
        ],
      ],
    );
  }

  Widget _buildBookmarks(GatsThemeExtension gats) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SizedBox(
          height: 48,
          child: FilledButton.icon(
            onPressed: _addBookmark,
            icon: const Icon(Icons.bookmark_add_rounded),
            label: const Text('Lưu bài học này'),
          ),
        ),
        _EmptyExtras(
          icon: _bookmarks.isEmpty
              ? Icons.bookmark_border_rounded
              : Icons.bookmarks_rounded,
          text: _bookmarks.isEmpty
              ? 'Lưu bài học để quay lại nhanh khi cần ôn tập.'
              : 'Bạn đã lưu ${_bookmarks.length} dấu trang cho bài học này.',
          color: gats.lavenderAccent,
        ),
      ],
    );
  }
}

class _ExtrasTab extends StatelessWidget {
  const _ExtrasTab({
    required this.icon,
    required this.label,
    required this.count,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final int count;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final color = selected ? gats.lavenderAccent : gats.textSecondary;
    return Expanded(
      child: Material(
        color: selected
            ? gats.lavenderAccent.withValues(alpha: 0.12)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(AppRadius.sm),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppRadius.sm),
          child: SizedBox(
            height: 52,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 19, color: color),
                const SizedBox(height: 3),
                Text(
                  '$label ($count)',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _EmptyExtras extends StatelessWidget {
  const _EmptyExtras({
    required this.icon,
    required this.text,
    required this.color,
  });

  final IconData icon;
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
      child: Column(
        children: [
          Icon(icon, size: 28, color: color.withValues(alpha: 0.7)),
          const SizedBox(height: AppSpacing.sm),
          Text(
            text,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              height: 1.4,
              color: context.gatsColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
