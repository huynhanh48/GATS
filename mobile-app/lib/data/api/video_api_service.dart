import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/course_api_paths.dart';

class LessonPlayback {
  const LessonPlayback({
    required this.playbackUrl,
    required this.playbackType,
    required this.videoId,
  });

  final String playbackUrl;
  /// `hls` | `mp4`
  final String playbackType;
  final String videoId;

  bool get isHls => playbackType.toLowerCase() == 'hls';
}

/// Gọi BE video lesson + playback (không gắn Bearer lên URL S3).
abstract final class VideoApiService {
  /// `GET .../lessons/:lessonId/video` rồi `GET .../videos/:videoId/playback`.
  static Future<LessonPlayback?> getLessonPlayback({
    required String courseId,
    required String lessonId,
    String? token,
  }) async {
    final lessonJson = await ApiClient.get(
      VideoApiPaths.lessonVideo(courseId, lessonId),
      token: token,
    );
    final lessonData = lessonJson['data'];
    if (lessonData is! Map) return null;

    final videoId = lessonData['videoId']?.toString();
    if (videoId == null || videoId.isEmpty) return null;

    final status = lessonData['status']?.toString();
    if (status != null && status != 'ready') {
      // Vẫn thử playback — BE sẽ 422 nếu chưa ready.
    }

    final playbackJson = await ApiClient.get(
      VideoApiPaths.playback(courseId, videoId),
      token: token,
    );
    final data = playbackJson['data'];
    if (data is! Map) return null;

    final url = data['playbackUrl']?.toString();
    if (url == null || url.isEmpty) return null;

    return LessonPlayback(
      playbackUrl: url,
      playbackType: data['playbackType']?.toString() ?? 'hls',
      videoId: videoId,
    );
  }
}
