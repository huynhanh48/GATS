import 'package:gats_academy/core/services/daily_reminder_prefs.dart';

enum SkillLevel { beginner, intermediate, advanced }

enum AgeRange { under25, age26to35, age36to45, above45 }

enum LearningPurpose { officeWork, skillUpgrade, careerChange, personalInterest }

enum UserProfile { student, officeWorker, freelancer, other }

enum ReferralSource { tiktok, facebook, youtube, friend, search, other }

enum Motivation { career, income, keepUp, curiosity }

enum AiInterest { chatbot, contentWriting, dataAnalysis, imageGen, automation, coding }

enum DailyGoal { casual, regular, serious, intense }

enum AppLanguage { english, vietnamese }

/// Thứ tự các bước quiz onboarding (retention-optimized).
enum QuizStepId { language, referral, level, profile, motivation, interests, age, dailyGoal, purpose, reminder }

class OnboardingAnswers {
  const OnboardingAnswers({
    this.language,
    this.referral,
    this.level,
    this.profile,
    this.motivation,
    this.interests = const {},
    this.ageRange,
    this.dailyGoal,
    this.purpose,
    this.dailyReminderEnabled = true,
    this.reminderHour = DailyReminderPrefs.defaultHour,
    this.reminderMinute = DailyReminderPrefs.defaultMinute,
  });

  final AppLanguage? language;
  final ReferralSource? referral;
  final SkillLevel? level;
  final UserProfile? profile;
  final Motivation? motivation;
  final Set<AiInterest> interests;
  final AgeRange? ageRange;
  final DailyGoal? dailyGoal;
  final LearningPurpose? purpose;
  final bool dailyReminderEnabled;
  final int reminderHour;
  final int reminderMinute;

  bool get isComplete =>
      language != null &&
      referral != null &&
      level != null &&
      profile != null &&
      motivation != null &&
      interests.isNotEmpty &&
      ageRange != null &&
      dailyGoal != null &&
      purpose != null;

  OnboardingAnswers copyWith({
    AppLanguage? language,
    ReferralSource? referral,
    SkillLevel? level,
    UserProfile? profile,
    Motivation? motivation,
    Set<AiInterest>? interests,
    AgeRange? ageRange,
    DailyGoal? dailyGoal,
    LearningPurpose? purpose,
    bool? dailyReminderEnabled,
    int? reminderHour,
    int? reminderMinute,
  }) {
    return OnboardingAnswers(
      language: language ?? this.language,
      referral: referral ?? this.referral,
      level: level ?? this.level,
      profile: profile ?? this.profile,
      motivation: motivation ?? this.motivation,
      interests: interests ?? this.interests,
      ageRange: ageRange ?? this.ageRange,
      dailyGoal: dailyGoal ?? this.dailyGoal,
      purpose: purpose ?? this.purpose,
      dailyReminderEnabled: dailyReminderEnabled ?? this.dailyReminderEnabled,
      reminderHour: reminderHour ?? this.reminderHour,
      reminderMinute: reminderMinute ?? this.reminderMinute,
    );
  }

  OnboardingAnswers toggleInterest(AiInterest interest) {
    final next = Set<AiInterest>.from(interests);
    if (!next.add(interest)) {
      next.remove(interest);
    }
    return copyWith(interests: next);
  }

  Map<String, dynamic> toJson() => {
        if (language != null) 'language': language!.name,
        if (referral != null) 'referral': referral!.name,
        if (level != null) 'level': level!.name,
        if (profile != null) 'profile': profile!.name,
        if (motivation != null) 'motivation': motivation!.name,
        'interests': interests.map((e) => e.name).toList(),
        if (ageRange != null) 'ageRange': ageRange!.name,
        if (dailyGoal != null) 'dailyGoal': dailyGoal!.name,
        if (purpose != null) 'purpose': purpose!.name,
        'dailyReminderEnabled': dailyReminderEnabled,
        'reminderHour': reminderHour,
        'reminderMinute': reminderMinute,
      };

  factory OnboardingAnswers.fromJson(Map<String, dynamic> json) {
    T? readEnum<T extends Enum>(List<T> values, Object? raw) {
      if (raw is! String) return null;
      try {
        return values.byName(raw);
      } catch (_) {
        return null;
      }
    }

    final rawInterests = json['interests'];
    final interests = <AiInterest>{};
    if (rawInterests is List) {
      for (final item in rawInterests) {
        final interest = readEnum(AiInterest.values, item);
        if (interest != null) interests.add(interest);
      }
    }

    return OnboardingAnswers(
      language: readEnum(AppLanguage.values, json['language']),
      referral: readEnum(ReferralSource.values, json['referral']),
      level: readEnum(SkillLevel.values, json['level']),
      profile: readEnum(UserProfile.values, json['profile']),
      motivation: readEnum(Motivation.values, json['motivation']),
      interests: interests,
      ageRange: readEnum(AgeRange.values, json['ageRange']),
      dailyGoal: readEnum(DailyGoal.values, json['dailyGoal']),
      purpose: readEnum(LearningPurpose.values, json['purpose']),
      dailyReminderEnabled: json['dailyReminderEnabled'] as bool? ?? true,
      reminderHour: json['reminderHour'] as int? ?? DailyReminderPrefs.defaultHour,
      reminderMinute: json['reminderMinute'] as int? ?? DailyReminderPrefs.defaultMinute,
    );
  }
}

extension SkillLevelLabel on SkillLevel {
  String get label => switch (this) {
        SkillLevel.beginner => 'Mới bắt đầu',
        SkillLevel.intermediate => 'Trung bình',
        SkillLevel.advanced => 'Nâng cao',
      };
}

extension UserProfileLabel on UserProfile {
  String get label => switch (this) {
        UserProfile.student => 'Sinh viên',
        UserProfile.officeWorker => 'Nhân viên văn phòng',
        UserProfile.freelancer => 'Làm tự do',
        UserProfile.other => 'Khác',
      };
}

extension AgeRangeLabel on AgeRange {
  String get label => switch (this) {
        AgeRange.under25 => 'Dưới 25',
        AgeRange.age26to35 => '26 – 35',
        AgeRange.age36to45 => '36 – 45',
        AgeRange.above45 => 'Trên 45',
      };
}

extension LearningPurposeLabel on LearningPurpose {
  String get label => switch (this) {
        LearningPurpose.officeWork => 'AI trong công việc văn phòng',
        LearningPurpose.skillUpgrade => 'Nâng cao kỹ năng',
        LearningPurpose.careerChange => 'Chuyển ngành / tìm việc',
        LearningPurpose.personalInterest => 'Sở thích cá nhân',
      };
}

extension ReferralSourceLabel on ReferralSource {
  String get label => switch (this) {
        ReferralSource.tiktok => 'TikTok',
        ReferralSource.facebook => 'Facebook',
        ReferralSource.youtube => 'YouTube',
        ReferralSource.friend => 'Bạn bè giới thiệu',
        ReferralSource.search => 'Google / tìm kiếm',
        ReferralSource.other => 'Nơi khác',
      };
}

extension MotivationLabel on Motivation {
  String get label => switch (this) {
        Motivation.career => 'Thăng tiến sự nghiệp',
        Motivation.income => 'Tăng thu nhập',
        Motivation.keepUp => 'Không tụt lại phía sau',
        Motivation.curiosity => 'Tò mò, muốn khám phá',
      };
}

extension AiInterestLabel on AiInterest {
  String get label => switch (this) {
        AiInterest.chatbot => 'ChatGPT & Chatbot',
        AiInterest.contentWriting => 'Viết nội dung',
        AiInterest.dataAnalysis => 'Phân tích dữ liệu',
        AiInterest.imageGen => 'Tạo ảnh AI',
        AiInterest.automation => 'Tự động hoá',
        AiInterest.coding => 'Lập trình với AI',
      };
}

extension DailyGoalLabel on DailyGoal {
  String get label => switch (this) {
        DailyGoal.casual => '5 phút / ngày',
        DailyGoal.regular => '10 phút / ngày',
        DailyGoal.serious => '15 phút / ngày',
        DailyGoal.intense => '30 phút / ngày',
      };

  String get caption => switch (this) {
        DailyGoal.casual => 'Thong thả',
        DailyGoal.regular => 'Đều đặn',
        DailyGoal.serious => 'Nghiêm túc',
        DailyGoal.intense => 'Bứt phá',
      };
}
