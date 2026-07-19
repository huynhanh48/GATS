import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/course/data/lecture_progress_store.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';

class LecturePreviewSheet extends StatefulWidget {
  const LecturePreviewSheet({
    super.key,
    required this.lecture,
    required this.index,
    required this.total,
    required this.state,
    required this.onMarkComplete,
  });

  final CourseLecture lecture;
  final int index;
  final int total;
  final LectureLearnState state;
  final Future<void> Function() onMarkComplete;

  static Future<void> show(
    BuildContext context, {
    required CourseLecture lecture,
    required int index,
    required int total,
    required LectureLearnState state,
    required Future<void> Function() onMarkComplete,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => LecturePreviewSheet(
        lecture: lecture,
        index: index,
        total: total,
        state: state,
        onMarkComplete: onMarkComplete,
      ),
    );
  }

  @override
  State<LecturePreviewSheet> createState() => _LecturePreviewSheetState();
}

class _LecturePreviewSheetState extends State<LecturePreviewSheet> {
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initPlayer();
  }

  Future<void> _initPlayer() async {
    try {
      // Gọi API lấy thông tin video của lesson (mock URL tạm thời nếu BE chưa có)
      // Sử dụng S3 public URL thông qua HLS thay vì MP4
      // Thực tế: fetch /api/videos/lesson/${widget.lecture.id}
      final token = await AuthPrefs.accessToken();
      
      _videoController = VideoPlayerController.networkUrl(
        Uri.parse('https://s3-hn1-r1.longvan.net/s3-video-gats/video-test.mp4'), // Sử dụng test video
        httpHeaders: {'Authorization': 'Bearer $token'},
      );
      
      await _videoController!.initialize();
      _chewieController = ChewieController(
        videoPlayerController: _videoController!,
        aspectRatio: _videoController!.value.aspectRatio,
        autoPlay: true,
        looping: false,
      );
    } catch (e) {
      debugPrint('Error init video: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _videoController?.dispose();
    _chewieController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final bottom = MediaQuery.paddingOf(context).bottom;
    final isCompleted = widget.state == LectureLearnState.completed;

    return Container(
      decoration: BoxDecoration(
        color: gats.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
      ),
      padding: EdgeInsets.fromLTRB(AppSpacing.xl, AppSpacing.lg, AppSpacing.xl, bottom + AppSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: gats.divider,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            AppStrings.lectureLessonOf(widget.index + 1, widget.total),
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: gats.lavenderAccent,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            widget.lecture.title,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: gats.textPrimary,
              height: 1.25,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            '${widget.lecture.durationMinutes} phút',
            style: TextStyle(
              fontSize: 14,
              color: gats.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          if (_isLoading)
            const SizedBox(
              height: 200,
              child: Center(child: CircularProgressIndicator()),
            )
          else if (_chewieController != null)
            Container(
              height: 220,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              clipBehavior: Clip.hardEdge,
              child: Chewie(controller: _chewieController!),
            )
          else
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: gats.background,
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: gats.divider.withValues(alpha: 0.7)),
              ),
              child: Row(
                children: [
                  Icon(Icons.error_outline_rounded, color: gats.lavenderAccent, size: 20),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      'Video chưa khả dụng cho bài học này.',
                      style: TextStyle(
                        fontSize: 13,
                        color: gats.textSecondary,
                        height: 1.35,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: AppSpacing.xl),
          if (!isCompleted) ...[
            const SizedBox(height: AppSpacing.md),
            SizedBox(
              height: 52,
              child: OutlinedButton(
                onPressed: () async {
                  await widget.onMarkComplete();
                  if (!context.mounted) return;
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(AppStrings.lectureMarkedDone)),
                  );
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: gats.lavenderAccent,
                  side: BorderSide(color: gats.lavenderAccent),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                  ),
                ),
                child: Text(AppStrings.lectureMarkComplete),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
