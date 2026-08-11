import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/data/api/video_api_service.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/course/data/lecture_progress_store.dart';
import 'package:gats_academy/features/course/presentation/assignment_submit_sheet.dart';
import 'package:gats_academy/features/course/presentation/lesson_quiz_launcher.dart';
import 'package:gats_academy/features/course/presentation/widgets/learn_extras_panel.dart';
import 'package:gats_academy/features/post/presentation/widgets/post_rich_body.dart';
import 'package:video_player/video_player.dart';

/// Full-page lesson player (web-like): video on top, content + extras below.
class LessonPlayerScreen extends StatefulWidget {
  const LessonPlayerScreen({
    super.key,
    required this.courseId,
    required this.lectures,
    required this.initialLectureId,
    this.onMarkComplete,
  });

  final String courseId;
  final List<CourseLecture> lectures;
  final String initialLectureId;
  final Future<void> Function(CourseLecture lecture)? onMarkComplete;

  @override
  State<LessonPlayerScreen> createState() => _LessonPlayerScreenState();
}

class _LessonPlayerScreenState extends State<LessonPlayerScreen> {
  late String _lectureId;
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  bool _loadingVideo = true;
  String? _videoError;
  bool _marking = false;

  List<CourseLecture> get _lectures => widget.lectures;

  int get _index {
    final i = _lectures.indexWhere((l) => l.id == _lectureId);
    return i < 0 ? 0 : i;
  }

  CourseLecture get _lecture =>
      _lectures.isEmpty
          ? CourseLecture(id: _lectureId, title: '', durationMinutes: 0)
          : _lectures[_index.clamp(0, _lectures.length - 1)];

  LectureLearnState get _state =>
      LectureProgressStore.instance.stateOf(_lecture);

  bool get _hasPrev => _index > 0;
  bool get _hasNext => _index < _lectures.length - 1;

  @override
  void initState() {
    super.initState();
    _lectureId = widget.initialLectureId;
    LectureProgressStore.instance.addListener(_onProgress);
    _initPlayer();
  }

  @override
  void dispose() {
    LectureProgressStore.instance.removeListener(_onProgress);
    _disposePlayer();
    super.dispose();
  }

  void _onProgress() {
    if (mounted) setState(() {});
  }

  void _disposePlayer() {
    _chewieController?.dispose();
    _chewieController = null;
    _videoController?.dispose();
    _videoController = null;
  }

  Future<void> _goToLecture(String lectureId) async {
    if (lectureId == _lectureId) return;
    setState(() {
      _lectureId = lectureId;
      _loadingVideo = true;
      _videoError = null;
    });
    _disposePlayer();
    await _initPlayer();
  }

  Future<void> _initPlayer() async {
    final lecture = _lecture;
    // Quiz / assignment / text-only: skip video fetch when clearly non-video.
    if (lecture.isQuiz || lecture.isAssignment) {
      if (mounted) {
        setState(() {
          _loadingVideo = false;
          _videoError = null;
        });
      }
      return;
    }

    try {
      final token = await AuthPrefs.accessToken();
      final playback = await VideoApiService.getLessonPlayback(
        courseId: widget.courseId,
        lessonId: lecture.id,
        token: token,
      );

      if (!mounted) return;

      if (playback == null) {
        setState(() {
          _videoError = lecture.isText
              ? null
              : 'Video chưa khả dụng cho bài học này.';
          _loadingVideo = false;
        });
        return;
      }

      final controller = VideoPlayerController.networkUrl(
        Uri.parse(playback.playbackUrl),
      );
      await controller.initialize();
      if (!mounted) {
        await controller.dispose();
        return;
      }

      _videoController = controller;
      _chewieController = ChewieController(
        videoPlayerController: controller,
        aspectRatio: controller.value.aspectRatio == 0
            ? 16 / 9
            : controller.value.aspectRatio,
        autoPlay: false,
        looping: false,
      );
      setState(() {
        _loadingVideo = false;
        _videoError = null;
      });
    } catch (e) {
      debugPrint('LessonPlayerScreen: video init failed — $e');
      if (mounted) {
        setState(() {
          _videoError = 'Không tải được video. Thử lại sau.';
          _loadingVideo = false;
        });
      }
    }
  }

  Future<void> _markComplete() async {
    if (_marking) return;
    final lecture = _lecture;
    if (lecture.isQuiz || lecture.isAssignment) return;

    setState(() => _marking = true);
    try {
      final cb = widget.onMarkComplete;
      if (cb != null) {
        await cb(lecture);
      } else {
        await LectureProgressStore.instance.markComplete(lecture.id);
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppStrings.lectureMarkedDone)),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không lưu được tiến độ. Thử lại.')),
      );
    } finally {
      if (mounted) setState(() => _marking = false);
    }
  }

  Future<void> _openQuiz() async {
    final lecture = _lecture;
    final passed = await LessonQuizLauncher.open(
      context,
      courseId: widget.courseId,
      lessonId: lecture.id,
      title: lecture.title,
    );
    if (!mounted) return;
    if (passed == true) {
      await LectureProgressStore.instance.applyQuizPassed(lecture.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppStrings.lectureMarkedDone)),
      );
    } else if (passed == false) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Chưa đạt — làm lại quiz để hoàn thành bài.'),
        ),
      );
    }
  }

  Future<void> _openAssignment() async {
    await AssignmentSubmitSheet.show(
      context,
      courseId: widget.courseId,
      lessonId: _lecture.id,
    );
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final lecture = _lecture;
    final isCompleted = _state == LectureLearnState.completed;
    final total = _lectures.isEmpty ? 1 : _lectures.length;
    final showVideoSlot = !lecture.isQuiz && !lecture.isAssignment;

    return GatsThemedScaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              AppStrings.lectureLessonOf(_index + 1, total),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: gats.lavenderAccent,
              ),
            ),
            Text(
              lecture.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: gats.textPrimary,
              ),
            ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(
            minHeight: 4,
            value: total == 0 ? 0 : (_index + 1) / total,
            backgroundColor: gats.divider,
            valueColor: const AlwaysStoppedAnimation(AppColors.accent),
          ),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (showVideoSlot) _buildVideoArea(gats),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.lg,
                AppSpacing.xl,
              ),
              children: [
                _buildLessonOverview(gats, lecture, isCompleted, total),
                const SizedBox(height: AppSpacing.lg),
                if (lecture.isQuiz)
                  _ActionCard(
                    icon: Icons.quiz_outlined,
                    label: isCompleted
                        ? 'Làm lại quiz'
                        : 'Làm quiz để hoàn thành',
                    onPressed: _openQuiz,
                  ),
                if (lecture.isAssignment)
                  _ActionCard(
                    icon: Icons.assignment_outlined,
                    label: 'Nộp bài tập',
                    onPressed: _openAssignment,
                  ),
                if (lecture.content != null &&
                    lecture.content!.trim().isNotEmpty) ...[
                  Text(
                    'Nội dung bài học',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: gats.textPrimary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  PostRichBody(content: lecture.content!),
                  const SizedBox(height: AppSpacing.xl),
                ],
                LearnExtrasPanel(
                  key: ValueKey('extras-${lecture.id}'),
                  courseId: widget.courseId,
                  lessonId: lecture.id,
                ),
              ],
            ),
          ),
          _buildBottomBar(gats, isCompleted),
        ],
      ),
    );
  }

  Widget _buildVideoArea(GatsThemeExtension gats) {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: ColoredBox(
        color: Colors.black,
        child: _loadingVideo
            ? const Center(
                child: CircularProgressIndicator(color: Colors.white),
              )
            : _chewieController != null
                ? Chewie(controller: _chewieController!)
                : Center(
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      child: Text(
                        _videoError ??
                            'Bài này không có video — xem nội dung bên dưới.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.85),
                          fontSize: 14,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ),
      ),
    );
  }

  Widget _buildLessonOverview(
    GatsThemeExtension gats,
    CourseLecture lecture,
    bool isCompleted,
    int total,
  ) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: gats.surface,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: gats.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: gats.lavenderAccent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(
                  lecture.isQuiz
                      ? Icons.quiz_outlined
                      : lecture.isAssignment
                          ? Icons.assignment_outlined
                          : Icons.play_lesson_outlined,
                  color: gats.lavenderAccent,
                  size: 22,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Bài ${_index + 1} trên $total',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: gats.lavenderAccent,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      lecture.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 17,
                        height: 1.25,
                        fontWeight: FontWeight.w800,
                        color: gats.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              _MetaPill(
                icon: Icons.schedule_rounded,
                label: '${lecture.durationMinutes} phút',
                color: gats.textSecondary,
              ),
              _MetaPill(
                icon: isCompleted
                    ? Icons.check_circle_rounded
                    : Icons.timelapse_rounded,
                label: isCompleted
                    ? AppStrings.lectureStatusCompleted
                    : 'Đang học',
                color: isCompleted ? AppColors.success : AppColors.accent,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(GatsThemeExtension gats, bool isCompleted) {
    final lecture = _lecture;
    final canContinue = isCompleted && _hasNext;

    VoidCallback? primaryAction;
    IconData primaryIcon;
    String primaryLabel;

    if (_marking) {
      primaryAction = null;
      primaryIcon = Icons.check_rounded;
      primaryLabel = AppStrings.lectureMarkComplete;
    } else if (canContinue) {
      primaryAction = () => _goToLecture(_lectures[_index + 1].id);
      primaryIcon = Icons.arrow_forward_rounded;
      primaryLabel = 'Bài tiếp theo';
    } else if (isCompleted) {
      primaryAction = null;
      primaryIcon = Icons.check_rounded;
      primaryLabel = 'Đã hoàn thành khóa học';
    } else if (lecture.isQuiz) {
      primaryAction = _openQuiz;
      primaryIcon = Icons.quiz_outlined;
      primaryLabel = 'Làm quiz để hoàn thành';
    } else if (lecture.isAssignment) {
      primaryAction = _openAssignment;
      primaryIcon = Icons.assignment_outlined;
      primaryLabel = 'Nộp bài tập';
    } else {
      primaryAction = _markComplete;
      primaryIcon = Icons.check_rounded;
      primaryLabel = AppStrings.lectureMarkComplete;
    }

    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.lg,
          AppSpacing.sm,
          AppSpacing.lg,
          AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: gats.surface,
          border: Border(top: BorderSide(color: gats.divider)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: Row(
          children: [
            SizedBox(
              width: 48,
              height: 48,
              child: IconButton.outlined(
                tooltip: 'Bài trước',
                onPressed: _hasPrev
                    ? () => _goToLecture(_lectures[_index - 1].id)
                    : null,
                icon: const Icon(Icons.chevron_left_rounded),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: SizedBox(
                height: 48,
                child: FilledButton.icon(
                  onPressed: primaryAction,
                  icon: _marking
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Icon(primaryIcon),
                  label: Text(primaryLabel),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetaPill extends StatelessWidget {
  const _MetaPill({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: SizedBox(
        height: 48,
        width: double.infinity,
        child: FilledButton.icon(
          onPressed: onPressed,
          icon: Icon(icon),
          label: Text(label),
        ),
      ),
    );
  }
}
