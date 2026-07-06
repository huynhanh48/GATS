import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/mock/mock_accounts.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';
import 'package:gats_academy/data/mock/models/course_models.dart';
import 'package:gats_academy/features/auth/models/user_role.dart';

export 'package:gats_academy/data/mock/models/course_models.dart';

enum RoadmapStatus { notStarted, inProgress, completed }

class RoadmapModule {
  const RoadmapModule({
    required this.title,
    required this.description,
    required this.status,
    required this.progress,
    required this.icon,
    this.courseId,
    this.lectureId,
    this.quizId,
  });

  final String title;
  final String description;
  final RoadmapStatus status;
  final double progress;
  final IconData icon;
  final String? courseId;
  final String? lectureId;
  final String? quizId;
}

class QuizItem {
  const QuizItem({
    required this.title,
    required this.courseName,
    required this.score,
    required this.date,
  });

  final String title;
  final String courseName;
  final int? score;
  final String date;
}

class AiReportData {
  const AiReportData({
    required this.strengths,
    required this.weaknesses,
    required this.weeklyMinutes,
    required this.suggestion,
  });

  final List<String> strengths;
  final List<String> weaknesses;
  final int weeklyMinutes;
  final String suggestion;
}

class DailyTask {
  const DailyTask({
    required this.id,
    required this.title,
    required this.isDone,
    this.deckId,
    this.courseId,
    this.quizId,
    this.type,
  });

  final String id;
  final String title;
  final bool isDone;
  final String? deckId;
  final String? courseId;
  final String? quizId;
  final String? type;
}

class RoutineStep {
  const RoutineStep({
    required this.time,
    required this.title,
    required this.description,
  });

  final String time;
  final String title;
  final String description;
}

class ChatMessage {
  ChatMessage({
    required this.text,
    required this.isUser,
    this.isTyping = false,
  });

  final String text;
  final bool isUser;
  final bool isTyping;
}

class BadgeItem {
  const BadgeItem({
    required this.name,
    required this.icon,
    required this.isUnlocked,
  });

  final String name;
  final IconData icon;
  final bool isUnlocked;
}

class HubProgress {
  const HubProgress({
    required this.level,
    required this.currentXp,
    required this.xpToNextLevel,
    required this.certXpRequired,
  });

  final int level;
  final int currentXp;
  final int xpToNextLevel;
  final int certXpRequired;
}

class FlashcardItem {
  const FlashcardItem({
    required this.id,
    required this.front,
    required this.back,
    this.hint,
  });

  final String id;
  final String front;
  final String back;
  final String? hint;
}

class FlashcardDeck {
  const FlashcardDeck({
    required this.id,
    required this.title,
    required this.moduleName,
    required this.cards,
    required this.dueToday,
  });

  final String id;
  final String title;
  final String moduleName;
  final List<FlashcardItem> cards;
  final int dueToday;
}

class LeaderboardEntry {
  const LeaderboardEntry({
    required this.rank,
    required this.name,
    required this.xp,
    required this.avatarColorValue,
    this.isCurrentUser = false,
  });

  final int rank;
  final String name;
  final int xp;
  final int avatarColorValue;
  final bool isCurrentUser;

  Color get avatarColor => Color(avatarColorValue);
}

class DailyReward {
  const DailyReward({
    required this.day,
    required this.xp,
    required this.claimed,
  });

  final int day;
  final int xp;
  final bool claimed;
}

class LearningStats {
  const LearningStats({
    required this.totalHoursThisWeek,
    required this.lessonsCompleted,
    required this.currentStreak,
    required this.quizzesPassed,
  });

  final double totalHoursThisWeek;
  final int lessonsCompleted;
  final int currentStreak;
  final int quizzesPassed;
}

class NotificationItem {
  const NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.icon,
    required this.timeAgo,
    this.isRead = false,
  });

  final String id;
  final String title;
  final String body;
  final IconData icon;
  final String timeAgo;
  final bool isRead;
}

class Achievement {
  const Achievement({
    required this.title,
    required this.description,
    required this.icon,
    required this.date,
    required this.type,
  });

  final String title;
  final String description;
  final IconData icon;
  final String date;
  final String type;
}

abstract final class MockData {
  static const streakDays = 5;
  static const continueCourse = 'Prompt cơ bản';
  static const continueProgress = 0.45;

  static const learningStats = LearningStats(
    totalHoursThisWeek: 4.5,
    lessonsCompleted: 12,
    currentStreak: 5,
    quizzesPassed: 3,
  );

  static const leaderboard = [
    LeaderboardEntry(rank: 1, name: 'Minh Anh', xp: 1250, avatarColorValue: 0xFF0070EB),
    LeaderboardEntry(rank: 2, name: 'Thanh Tùng', xp: 1100, avatarColorValue: 0xFFFF7622),
    LeaderboardEntry(rank: 3, name: 'Hà My', xp: 980, avatarColorValue: 0xFF7C3AED),
    LeaderboardEntry(rank: 4, name: 'Đức Anh', xp: 850, avatarColorValue: 0xFF059669),
    LeaderboardEntry(rank: 5, name: 'Học viên GATS', xp: 240, avatarColorValue: 0xFF0070EB, isCurrentUser: true),
    LeaderboardEntry(rank: 6, name: 'Thu Hương', xp: 210, avatarColorValue: 0xFFEC4899),
    LeaderboardEntry(rank: 7, name: 'Văn Khoa', xp: 180, avatarColorValue: 0xFFF59E0B),
    LeaderboardEntry(rank: 8, name: 'Ngọc Lan', xp: 150, avatarColorValue: 0xFF8B5CF6),
    LeaderboardEntry(rank: 9, name: 'Quang Hải', xp: 120, avatarColorValue: 0xFF06B6D4),
    LeaderboardEntry(rank: 10, name: 'Phương Linh', xp: 90, avatarColorValue: 0xFFEF4444),
  ];

  static const weeklyRewards = [
    DailyReward(day: 1, xp: 5, claimed: true),
    DailyReward(day: 2, xp: 5, claimed: true),
    DailyReward(day: 3, xp: 10, claimed: true),
    DailyReward(day: 4, xp: 5, claimed: true),
    DailyReward(day: 5, xp: 15, claimed: true),
    DailyReward(day: 6, xp: 5, claimed: false),
    DailyReward(day: 7, xp: 25, claimed: false),
  ];

  static const notifications = [
    NotificationItem(
      id: 'n1',
      title: 'Streak 5 ngày! 🔥',
      body: 'Tuyệt vời! Bạn đã học liên tục 5 ngày.',
      icon: Icons.local_fire_department,
      timeAgo: '2 giờ trước',
    ),
    NotificationItem(
      id: 'n2',
      title: 'Quiz mới',
      body: 'Quiz tuần 2 đã sẵn sàng trong khóa AI cho Dân văn phòng.',
      icon: Icons.quiz_outlined,
      timeAgo: '5 giờ trước',
    ),
    NotificationItem(
      id: 'n3',
      title: 'Flashcard nhắc ôn',
      body: 'Bạn có 5 thẻ cần ôn hôm nay.',
      icon: Icons.style_outlined,
      timeAgo: 'Hôm qua',
      isRead: true,
    ),
    NotificationItem(
      id: 'n4',
      title: 'Badge mới! 🏆',
      body: 'Bạn đã mở khóa huy hiệu "7 ngày liên tiếp".',
      icon: Icons.emoji_events,
      timeAgo: '2 ngày trước',
      isRead: true,
    ),
    NotificationItem(
      id: 'n5',
      title: 'Mentor nhắn tin',
      body: 'Mentor Nguyễn Văn A đã gửi tin nhắn trong nhóm chat.',
      icon: Icons.chat_bubble_outline,
      timeAgo: '3 ngày trước',
      isRead: true,
    ),
  ];

  static const achievements = [
    Achievement(
      title: 'Khởi đầu hành trình',
      description: 'Hoàn thành onboarding và đăng ký khóa đầu tiên',
      icon: Icons.rocket_launch,
      date: '25/06/2026',
      type: 'milestone',
    ),
    Achievement(
      title: 'Streak 3 ngày',
      description: 'Học liên tục 3 ngày không nghỉ',
      icon: Icons.local_fire_department,
      date: '28/06/2026',
      type: 'streak',
    ),
    Achievement(
      title: 'Quiz đầu tiên',
      description: 'Hoàn thành quiz "Prompt cơ bản" với 80% đúng',
      icon: Icons.check_circle,
      date: '29/06/2026',
      type: 'quiz',
    ),
    Achievement(
      title: 'Streak 5 ngày 🔥',
      description: 'Không bỏ lỡ ngày nào trong 5 ngày!',
      icon: Icons.whatshot,
      date: '01/07/2026',
      type: 'streak',
    ),
  ];

  static String rankTitle(int level) {
    if (level <= 1) return 'Tân binh';
    if (level <= 3) return 'Học viên';
    if (level <= 5) return 'Thành thạo';
    if (level <= 8) return 'Chuyên gia';
    return 'Bậc thầy';
  }

  static Future<String> userName() async {
    final user = await AuthPrefs.currentUser();
    return user?.displayName ?? 'Học viên GATS';
  }

  static List<CourseItem> coursesFor({String? userId, UserRole role = UserRole.user}) {
    return MockCourseStore.instance.courseItemsFor(userId, role: role);
  }

  static List<CourseItem> get courses =>
      MockCourseStore.instance.courseItemsFor(MockAccounts.user.id, role: UserRole.user);

  static const staticRoadmapModules = [
    RoadmapModule(
      title: 'Nền tảng AI',
      description: 'Hiểu khái niệm AI, ML và ứng dụng cơ bản',
      status: RoadmapStatus.completed,
      progress: 1.0,
      icon: Icons.foundation,
    ),
    RoadmapModule(
      title: 'Prompt cơ bản',
      description: 'Viết prompt hiệu quả cho công việc văn phòng',
      status: RoadmapStatus.inProgress,
      progress: 0.45,
      icon: Icons.edit_note,
    ),
    RoadmapModule(
      title: 'Ứng dụng công sở',
      description: 'Tự động hóa email, báo cáo, slide với AI',
      status: RoadmapStatus.notStarted,
      progress: 0.0,
      icon: Icons.business_center_outlined,
    ),
    RoadmapModule(
      title: 'AI nâng cao',
      description: 'Workflow, agent và tích hợp công cụ',
      status: RoadmapStatus.notStarted,
      progress: 0.0,
      icon: Icons.hub_outlined,
    ),
  ];

  static const quizzes = <QuizItem>[];

  static const aiReport = AiReportData(
    strengths: ['Prompt engineering', 'Tư duy logic'],
    weaknesses: ['Ứng dụng thực tế', 'Tốc độ hoàn thành quiz'],
    weeklyMinutes: 145,
    suggestion:
        'Nên dành 20 phút/ngày cho module "Ứng dụng công sở" để cân bằng lý thuyết và thực hành.',
  );

  static List<RoadmapModule> get roadmapModules => staticRoadmapModules;

  static const staticDailyTasks = [
    DailyTask(
      id: 'flashcard',
      title: 'Ôn lại 5 flashcard Prompt cơ bản',
      isDone: false,
      deckId: 'deck-prompt',
    ),
    DailyTask(id: 'read', title: 'Hoàn thành bài đọc: AI trong Excel', isDone: false),
    DailyTask(id: 'coach', title: 'Chat 1 câu hỏi với AI Coach', isDone: false),
  ];

  static const routineSteps = [
    RoutineStep(
      time: '07:00',
      title: 'Ôn quiz',
      description: '5 câu hỏi nhanh từ bài học hôm qua',
    ),
    RoutineStep(
      time: '12:00',
      title: 'Đọc bài',
      description: '15 phút đọc module đang học',
    ),
    RoutineStep(
      time: '20:00',
      title: 'AI Coach',
      description: 'Tóm tắt tiến độ và nhận gợi ý học tập',
    ),
  ];

  static List<DailyTask> get dailyTasks => staticDailyTasks;

  static const staticFlashcardDecks = [
    FlashcardDeck(
      id: 'deck-prompt',
      title: 'Prompt cơ bản',
      moduleName: 'Prompt cơ bản',
      dueToday: 5,
      cards: [
        FlashcardItem(
          id: 'p1',
          front: 'Zero-shot prompt là gì?',
          back: 'Prompt không kèm ví dụ, chỉ mô tả yêu cầu trực tiếp.',
          hint: 'Không có example',
        ),
        FlashcardItem(
          id: 'p2',
          front: 'Few-shot prompt?',
          back: 'Prompt kèm vài ví dụ mẫu để AI học theo pattern.',
        ),
        FlashcardItem(
          id: 'p3',
          front: 'Role prompting?',
          back: 'Gán vai trò cho AI (VD: "Bạn là chuyên gia Excel...").',
        ),
        FlashcardItem(
          id: 'p4',
          front: 'Chain-of-thought (CoT)?',
          back: 'Yêu cầu AI suy luận từng bước trước khi đưa câu trả lời.',
        ),
        FlashcardItem(
          id: 'p5',
          front: 'Temperature trong LLM?',
          back: 'Tham số điều chỉnh độ sáng tạo/ngẫu nhiên của output.',
        ),
        FlashcardItem(
          id: 'p6',
          front: 'System prompt?',
          back: 'Hướng dẫn nền định nghĩa hành vi tổng thể của AI.',
        ),
        FlashcardItem(
          id: 'p7',
          front: 'Prompt injection?',
          back: 'Tấn công khiến AI bỏ qua instruction gốc qua input độc hại.',
        ),
        FlashcardItem(
          id: 'p8',
          front: 'RAG là gì?',
          back: 'Retrieval-Augmented Generation — AI tra cứu tài liệu rồi trả lời.',
        ),
      ],
    ),
    FlashcardDeck(
      id: 'deck-ai-terms',
      title: 'Thuật ngữ AI',
      moduleName: 'Nền tảng AI',
      dueToday: 3,
      cards: [
        FlashcardItem(id: 't1', front: 'ML', back: 'Machine Learning — máy học từ dữ liệu.'),
        FlashcardItem(id: 't2', front: 'LLM', back: 'Large Language Model — mô hình ngôn ngữ lớn.'),
        FlashcardItem(id: 't3', front: 'Token', back: 'Đơn vị nhỏ nhất mà LLM xử lý (từ/mảnh từ).'),
        FlashcardItem(id: 't4', front: 'Fine-tuning', back: 'Huấn luyện thêm model trên dữ liệu chuyên biệt.'),
        FlashcardItem(id: 't5', front: 'Hallucination', back: 'AI tạo thông tin sai nhưng nghe có vẻ đúng.'),
        FlashcardItem(id: 't6', front: 'Embedding', back: 'Vector số biểu diễn ngữ nghĩa văn bản.'),
      ],
    ),
  ];

  static List<ChatMessage> get initialChatMessages => [
    ChatMessage(text: AppStrings.aiCoachWelcome, isUser: false),
  ];

  static const quickPrompts = [
    'Tôi nên học gì tiếp?',
    'Tóm tắt tiến độ tuần này',
    'Gợi ý bài tập hôm nay',
  ];

  static List<FlashcardDeck> get flashcardDecks => staticFlashcardDecks;

  static const badges = [
    BadgeItem(name: 'Khởi đầu', icon: Icons.eco_outlined, isUnlocked: true),
    BadgeItem(name: '7 ngày liên tiếp', icon: Icons.local_fire_department_outlined, isUnlocked: true),
    BadgeItem(name: 'Quiz master', icon: Icons.track_changes, isUnlocked: false),
    BadgeItem(name: 'Chuyên gia AI', icon: Icons.emoji_events_outlined, isUnlocked: false),
  ];

  static const hubProgress = HubProgress(
    level: 3,
    currentXp: 240,
    xpToNextLevel: 500,
    certXpRequired: 500,
  );

  static FlashcardDeck? deckById(String id) {
    for (final deck in flashcardDecks) {
      if (deck.id == id) return deck;
    }
    return null;
  }
}
