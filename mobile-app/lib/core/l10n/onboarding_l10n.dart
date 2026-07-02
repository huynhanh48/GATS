import 'package:gats_academy/features/onboarding/models/onboarding_answers.dart';
import 'package:gats_academy/l10n/app_localizations.dart';

/// Enum → chuỗi onboarding (dùng cùng [AppLocalizations] gen từ .arb).
extension OnboardingL10n on AppLocalizations {
  String titleForStep(QuizStepId step) => switch (step) {
        QuizStepId.language => onboardingTitleLanguage,
        QuizStepId.referral => onboardingTitleReferral,
        QuizStepId.level => onboardingTitleLevel,
        QuizStepId.profile => onboardingTitleProfile,
        QuizStepId.motivation => onboardingTitleMotivation,
        QuizStepId.interests => onboardingTitleInterests,
        QuizStepId.age => onboardingTitleAge,
        QuizStepId.dailyGoal => onboardingTitleDailyGoal,
        QuizStepId.purpose => onboardingTitlePurpose,
      };

  String subtitleForStep(QuizStepId step) => switch (step) {
        QuizStepId.language => onboardingSubtitleLanguage,
        QuizStepId.referral => onboardingSubtitleReferral,
        QuizStepId.level => onboardingSubtitleLevel,
        QuizStepId.profile => onboardingSubtitleProfile,
        QuizStepId.motivation => onboardingSubtitleMotivation,
        QuizStepId.interests => onboardingSubtitleInterests,
        QuizStepId.age => onboardingSubtitleAge,
        QuizStepId.dailyGoal => onboardingSubtitleDailyGoal,
        QuizStepId.purpose => onboardingSubtitlePurpose,
      };

  String coachForStep(QuizStepId step) => switch (step) {
        QuizStepId.language => onboardingCoachLanguage,
        QuizStepId.referral => onboardingCoachReferral,
        QuizStepId.level => onboardingCoachLevel,
        QuizStepId.profile => onboardingCoachProfile,
        QuizStepId.motivation => onboardingCoachMotivation,
        QuizStepId.interests => onboardingCoachInterests,
        QuizStepId.age => onboardingCoachAge,
        QuizStepId.dailyGoal => onboardingCoachDailyGoal,
        QuizStepId.purpose => onboardingCoachPurpose,
      };

  String languageLabel(AppLanguage language) => switch (language) {
        AppLanguage.english => languageEnglish,
        AppLanguage.vietnamese => languageVietnamese,
      };

  String languageSubtitle(AppLanguage language) => switch (language) {
        AppLanguage.english => languageEnglishSubtitle,
        AppLanguage.vietnamese => languageVietnameseSubtitle,
      };

  String languageEcho(AppLanguage? language) => switch (language) {
        AppLanguage.english => ackLanguageEchoEnglish,
        AppLanguage.vietnamese => ackLanguageEchoVietnamese,
        null => ackLanguageEchoEnglish,
      };

  String referralLabel(ReferralSource source) => switch (source) {
        ReferralSource.tiktok => referralTiktok,
        ReferralSource.facebook => referralFacebook,
        ReferralSource.youtube => referralYoutube,
        ReferralSource.friend => referralFriend,
        ReferralSource.search => referralSearch,
        ReferralSource.other => referralOther,
      };

  String skillLevelLabel(SkillLevel level) => switch (level) {
        SkillLevel.beginner => skillBeginner,
        SkillLevel.intermediate => skillIntermediate,
        SkillLevel.advanced => skillAdvanced,
      };

  String skillLevelSubtitle(SkillLevel level) => switch (level) {
        SkillLevel.beginner => skillBeginnerSubtitle,
        SkillLevel.intermediate => skillIntermediateSubtitle,
        SkillLevel.advanced => skillAdvancedSubtitle,
      };

  String userProfileLabel(UserProfile profile) => switch (profile) {
        UserProfile.student => profileStudent,
        UserProfile.officeWorker => profileOfficeWorker,
        UserProfile.freelancer => profileFreelancer,
        UserProfile.other => profileOther,
      };

  String userProfileSubtitle(UserProfile profile) => switch (profile) {
        UserProfile.student => profileStudentSubtitle,
        UserProfile.officeWorker => profileOfficeWorkerSubtitle,
        UserProfile.freelancer => profileFreelancerSubtitle,
        UserProfile.other => profileOtherSubtitle,
      };

  String motivationLabel(Motivation motivation) => switch (motivation) {
        Motivation.career => motivationCareer,
        Motivation.income => motivationIncome,
        Motivation.keepUp => motivationKeepUp,
        Motivation.curiosity => motivationCuriosity,
      };

  String motivationSubtitle(Motivation motivation) => switch (motivation) {
        Motivation.career => motivationCareerSubtitle,
        Motivation.income => motivationIncomeSubtitle,
        Motivation.keepUp => motivationKeepUpSubtitle,
        Motivation.curiosity => motivationCuriositySubtitle,
      };

  String interestLabel(AiInterest interest) => switch (interest) {
        AiInterest.chatbot => interestChatbot,
        AiInterest.contentWriting => interestContentWriting,
        AiInterest.dataAnalysis => interestDataAnalysis,
        AiInterest.imageGen => interestImageGen,
        AiInterest.automation => interestAutomation,
        AiInterest.coding => interestCoding,
      };

  String ageRangeLabel(AgeRange ageRange) => switch (ageRange) {
        AgeRange.under25 => ageUnder25,
        AgeRange.age26to35 => age26to35,
        AgeRange.age36to45 => age36to45,
        AgeRange.above45 => ageAbove45,
      };

  String dailyGoalLabel(DailyGoal goal) => switch (goal) {
        DailyGoal.casual => dailyGoalCasual,
        DailyGoal.regular => dailyGoalRegular,
        DailyGoal.serious => dailyGoalSerious,
        DailyGoal.intense => dailyGoalIntense,
      };

  String dailyGoalCaption(DailyGoal goal) => switch (goal) {
        DailyGoal.casual => dailyGoalCasualCaption,
        DailyGoal.regular => dailyGoalRegularCaption,
        DailyGoal.serious => dailyGoalSeriousCaption,
        DailyGoal.intense => dailyGoalIntenseCaption,
      };

  String purposeLabel(LearningPurpose purpose) => switch (purpose) {
        LearningPurpose.officeWork => purposeOfficeWork,
        LearningPurpose.skillUpgrade => purposeSkillUpgrade,
        LearningPurpose.careerChange => purposeCareerChange,
        LearningPurpose.personalInterest => purposePersonalInterest,
      };
}
