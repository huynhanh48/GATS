import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_vi.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('vi'),
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'GATS Academy'**
  String get appName;

  /// No description provided for @onboardingNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get onboardingNext;

  /// No description provided for @onboardingFinish.
  ///
  /// In en, this message translates to:
  /// **'See recommendations'**
  String get onboardingFinish;

  /// No description provided for @onboardingTitleLanguage.
  ///
  /// In en, this message translates to:
  /// **'Choose your language'**
  String get onboardingTitleLanguage;

  /// No description provided for @onboardingTitleReferral.
  ///
  /// In en, this message translates to:
  /// **'Where did you hear about GATS?'**
  String get onboardingTitleReferral;

  /// No description provided for @onboardingTitleLevel.
  ///
  /// In en, this message translates to:
  /// **'What is your AI level?'**
  String get onboardingTitleLevel;

  /// No description provided for @onboardingTitleProfile.
  ///
  /// In en, this message translates to:
  /// **'What best describes you?'**
  String get onboardingTitleProfile;

  /// No description provided for @onboardingTitleMotivation.
  ///
  /// In en, this message translates to:
  /// **'What motivates you to learn AI?'**
  String get onboardingTitleMotivation;

  /// No description provided for @onboardingTitleInterests.
  ///
  /// In en, this message translates to:
  /// **'Which AI skills do you want to master?'**
  String get onboardingTitleInterests;

  /// No description provided for @onboardingTitleAge.
  ///
  /// In en, this message translates to:
  /// **'What is your age range?'**
  String get onboardingTitleAge;

  /// No description provided for @onboardingTitleDailyGoal.
  ///
  /// In en, this message translates to:
  /// **'How long do you want to learn each day?'**
  String get onboardingTitleDailyGoal;

  /// No description provided for @onboardingTitlePurpose.
  ///
  /// In en, this message translates to:
  /// **'What is your learning goal?'**
  String get onboardingTitlePurpose;

  /// No description provided for @onboardingTitleReminder.
  ///
  /// In en, this message translates to:
  /// **'Daily learning reminder'**
  String get onboardingTitleReminder;

  /// No description provided for @onboardingSubtitleReminder.
  ///
  /// In en, this message translates to:
  /// **'We\'ll nudge you at the time you pick — you can change this in Settings'**
  String get onboardingSubtitleReminder;

  /// No description provided for @onboardingCoachReminder.
  ///
  /// In en, this message translates to:
  /// **'Consistency beats intensity. Pick a time that works every day!'**
  String get onboardingCoachReminder;

  /// No description provided for @onboardingReminderEnable.
  ///
  /// In en, this message translates to:
  /// **'Enable daily reminder'**
  String get onboardingReminderEnable;

  /// No description provided for @onboardingReminderNoThanks.
  ///
  /// In en, this message translates to:
  /// **'No thanks'**
  String get onboardingReminderNoThanks;

  /// No description provided for @onboardingReminderContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get onboardingReminderContinue;

  /// No description provided for @ackReminderEcho.
  ///
  /// In en, this message translates to:
  /// **'Reminder at {time} — see you then!'**
  String ackReminderEcho(String time);

  /// No description provided for @ackReminderSkippedEcho.
  ///
  /// In en, this message translates to:
  /// **'No problem — you can turn reminders on later in Settings.'**
  String get ackReminderSkippedEcho;

  /// No description provided for @dailyReminderTitle.
  ///
  /// In en, this message translates to:
  /// **'GATS Academy'**
  String get dailyReminderTitle;

  /// No description provided for @dailyReminderBody.
  ///
  /// In en, this message translates to:
  /// **'Time to learn! Check in and keep your streak going.'**
  String get dailyReminderBody;

  /// No description provided for @onboardingSubtitleLanguage.
  ///
  /// In en, this message translates to:
  /// **'You can change this later in Settings'**
  String get onboardingSubtitleLanguage;

  /// No description provided for @languagePickerTitle.
  ///
  /// In en, this message translates to:
  /// **'Choose your language'**
  String get languagePickerTitle;

  /// No description provided for @languagePickerSubtitle.
  ///
  /// In en, this message translates to:
  /// **'You can change this later in Settings'**
  String get languagePickerSubtitle;

  /// No description provided for @languagePickerContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get languagePickerContinue;

  /// No description provided for @welcomeHeadline.
  ///
  /// In en, this message translates to:
  /// **'Learn Practical AI'**
  String get welcomeHeadline;

  /// No description provided for @welcomeBody.
  ///
  /// In en, this message translates to:
  /// **'Interactive practice to build real AI skills.'**
  String get welcomeBody;

  /// No description provided for @entryContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get entryContinue;

  /// No description provided for @entrySignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get entrySignIn;

  /// No description provided for @onboardingIntroCoach.
  ///
  /// In en, this message translates to:
  /// **'Let\'s build a learning path just for you.'**
  String get onboardingIntroCoach;

  /// No description provided for @onboardingSubtitleReferral.
  ///
  /// In en, this message translates to:
  /// **'Help us make GATS better for you'**
  String get onboardingSubtitleReferral;

  /// No description provided for @onboardingSubtitleLevel.
  ///
  /// In en, this message translates to:
  /// **'Pick the closest match - there is no wrong answer'**
  String get onboardingSubtitleLevel;

  /// No description provided for @onboardingSubtitleProfile.
  ///
  /// In en, this message translates to:
  /// **'This helps us understand your learning context'**
  String get onboardingSubtitleProfile;

  /// No description provided for @onboardingSubtitleMotivation.
  ///
  /// In en, this message translates to:
  /// **'Motivation helps you stay consistent'**
  String get onboardingSubtitleMotivation;

  /// No description provided for @onboardingSubtitleInterests.
  ///
  /// In en, this message translates to:
  /// **'Choose one or more - you can update this later'**
  String get onboardingSubtitleInterests;

  /// No description provided for @onboardingSubtitleAge.
  ///
  /// In en, this message translates to:
  /// **'This helps us tune content and pacing'**
  String get onboardingSubtitleAge;

  /// No description provided for @onboardingSubtitleDailyGoal.
  ///
  /// In en, this message translates to:
  /// **'Start small and build up as you go'**
  String get onboardingSubtitleDailyGoal;

  /// No description provided for @onboardingSubtitlePurpose.
  ///
  /// In en, this message translates to:
  /// **'Your roadmap will adapt to this goal'**
  String get onboardingSubtitlePurpose;

  /// No description provided for @onboardingCoachLanguage.
  ///
  /// In en, this message translates to:
  /// **'First, choose the language you feel most comfortable learning in.'**
  String get onboardingCoachLanguage;

  /// No description provided for @onboardingCoachReferral.
  ///
  /// In en, this message translates to:
  /// **'Where did you first hear about GATS Academy?'**
  String get onboardingCoachReferral;

  /// No description provided for @onboardingCoachLevel.
  ///
  /// In en, this message translates to:
  /// **'Where are you with AI right now? It is totally fine to be new!'**
  String get onboardingCoachLevel;

  /// No description provided for @onboardingCoachProfile.
  ///
  /// In en, this message translates to:
  /// **'Tell me what you do so I can shape the roadmap around you.'**
  String get onboardingCoachProfile;

  /// No description provided for @onboardingCoachMotivation.
  ///
  /// In en, this message translates to:
  /// **'What brought you here? I want to understand your motivation.'**
  String get onboardingCoachMotivation;

  /// No description provided for @onboardingCoachInterests.
  ///
  /// In en, this message translates to:
  /// **'Pick every skill you want to improve - the more signal, the better.'**
  String get onboardingCoachInterests;

  /// No description provided for @onboardingCoachAge.
  ///
  /// In en, this message translates to:
  /// **'Knowing your age range helps me recommend a better pace.'**
  String get onboardingCoachAge;

  /// No description provided for @onboardingCoachDailyGoal.
  ///
  /// In en, this message translates to:
  /// **'A small daily goal is how consistency turns into progress.'**
  String get onboardingCoachDailyGoal;

  /// No description provided for @onboardingCoachPurpose.
  ///
  /// In en, this message translates to:
  /// **'A clear goal makes the roadmap sharper.'**
  String get onboardingCoachPurpose;

  /// No description provided for @languageEnglish.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get languageEnglish;

  /// No description provided for @languageVietnamese.
  ///
  /// In en, this message translates to:
  /// **'Tiếng Việt'**
  String get languageVietnamese;

  /// No description provided for @languageEnglishSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Use English for the app and onboarding'**
  String get languageEnglishSubtitle;

  /// No description provided for @languageVietnameseSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Use Vietnamese for the app and onboarding'**
  String get languageVietnameseSubtitle;

  /// No description provided for @referralTiktok.
  ///
  /// In en, this message translates to:
  /// **'TikTok'**
  String get referralTiktok;

  /// No description provided for @referralFacebook.
  ///
  /// In en, this message translates to:
  /// **'Facebook'**
  String get referralFacebook;

  /// No description provided for @referralYoutube.
  ///
  /// In en, this message translates to:
  /// **'YouTube'**
  String get referralYoutube;

  /// No description provided for @referralFriend.
  ///
  /// In en, this message translates to:
  /// **'A friend recommended it'**
  String get referralFriend;

  /// No description provided for @referralSearch.
  ///
  /// In en, this message translates to:
  /// **'Google / search'**
  String get referralSearch;

  /// No description provided for @referralOther.
  ///
  /// In en, this message translates to:
  /// **'Somewhere else'**
  String get referralOther;

  /// No description provided for @skillBeginner.
  ///
  /// In en, this message translates to:
  /// **'Beginner'**
  String get skillBeginner;

  /// No description provided for @skillIntermediate.
  ///
  /// In en, this message translates to:
  /// **'Intermediate'**
  String get skillIntermediate;

  /// No description provided for @skillAdvanced.
  ///
  /// In en, this message translates to:
  /// **'Advanced'**
  String get skillAdvanced;

  /// No description provided for @skillBeginnerSubtitle.
  ///
  /// In en, this message translates to:
  /// **'New to AI'**
  String get skillBeginnerSubtitle;

  /// No description provided for @skillIntermediateSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Used ChatGPT basics'**
  String get skillIntermediateSubtitle;

  /// No description provided for @skillAdvancedSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Want workflows and automation'**
  String get skillAdvancedSubtitle;

  /// No description provided for @profileStudent.
  ///
  /// In en, this message translates to:
  /// **'Student'**
  String get profileStudent;

  /// No description provided for @profileOfficeWorker.
  ///
  /// In en, this message translates to:
  /// **'Office worker'**
  String get profileOfficeWorker;

  /// No description provided for @profileFreelancer.
  ///
  /// In en, this message translates to:
  /// **'Freelancer'**
  String get profileFreelancer;

  /// No description provided for @profileOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get profileOther;

  /// No description provided for @profileStudentSubtitle.
  ///
  /// In en, this message translates to:
  /// **'College or university learner'**
  String get profileStudentSubtitle;

  /// No description provided for @profileOfficeWorkerSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Working at a company or office'**
  String get profileOfficeWorkerSubtitle;

  /// No description provided for @profileFreelancerSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Independent, remote, or solo work'**
  String get profileFreelancerSubtitle;

  /// No description provided for @profileOtherSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Not in the groups above'**
  String get profileOtherSubtitle;

  /// No description provided for @motivationCareer.
  ///
  /// In en, this message translates to:
  /// **'Career growth'**
  String get motivationCareer;

  /// No description provided for @motivationIncome.
  ///
  /// In en, this message translates to:
  /// **'Increase income'**
  String get motivationIncome;

  /// No description provided for @motivationKeepUp.
  ///
  /// In en, this message translates to:
  /// **'Do not fall behind'**
  String get motivationKeepUp;

  /// No description provided for @motivationCuriosity.
  ///
  /// In en, this message translates to:
  /// **'Curious to explore'**
  String get motivationCuriosity;

  /// No description provided for @motivationCareerSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Open new opportunities at work'**
  String get motivationCareerSubtitle;

  /// No description provided for @motivationIncomeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Earn more from AI skills'**
  String get motivationIncomeSubtitle;

  /// No description provided for @motivationKeepUpSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Keep up with technology trends'**
  String get motivationKeepUpSubtitle;

  /// No description provided for @motivationCuriositySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Learn because it feels interesting'**
  String get motivationCuriositySubtitle;

  /// No description provided for @interestChatbot.
  ///
  /// In en, this message translates to:
  /// **'ChatGPT & chatbots'**
  String get interestChatbot;

  /// No description provided for @interestContentWriting.
  ///
  /// In en, this message translates to:
  /// **'Content writing'**
  String get interestContentWriting;

  /// No description provided for @interestDataAnalysis.
  ///
  /// In en, this message translates to:
  /// **'Data analysis'**
  String get interestDataAnalysis;

  /// No description provided for @interestImageGen.
  ///
  /// In en, this message translates to:
  /// **'AI image generation'**
  String get interestImageGen;

  /// No description provided for @interestAutomation.
  ///
  /// In en, this message translates to:
  /// **'Automation'**
  String get interestAutomation;

  /// No description provided for @interestCoding.
  ///
  /// In en, this message translates to:
  /// **'Coding with AI'**
  String get interestCoding;

  /// No description provided for @ageUnder25.
  ///
  /// In en, this message translates to:
  /// **'Under 25'**
  String get ageUnder25;

  /// No description provided for @age26to35.
  ///
  /// In en, this message translates to:
  /// **'26 - 35'**
  String get age26to35;

  /// No description provided for @age36to45.
  ///
  /// In en, this message translates to:
  /// **'36 - 45'**
  String get age36to45;

  /// No description provided for @ageAbove45.
  ///
  /// In en, this message translates to:
  /// **'Above 45'**
  String get ageAbove45;

  /// No description provided for @dailyGoalCasual.
  ///
  /// In en, this message translates to:
  /// **'5 minutes / day'**
  String get dailyGoalCasual;

  /// No description provided for @dailyGoalRegular.
  ///
  /// In en, this message translates to:
  /// **'10 minutes / day'**
  String get dailyGoalRegular;

  /// No description provided for @dailyGoalSerious.
  ///
  /// In en, this message translates to:
  /// **'15 minutes / day'**
  String get dailyGoalSerious;

  /// No description provided for @dailyGoalIntense.
  ///
  /// In en, this message translates to:
  /// **'30 minutes / day'**
  String get dailyGoalIntense;

  /// No description provided for @dailyGoalCasualCaption.
  ///
  /// In en, this message translates to:
  /// **'Casual'**
  String get dailyGoalCasualCaption;

  /// No description provided for @dailyGoalRegularCaption.
  ///
  /// In en, this message translates to:
  /// **'Steady'**
  String get dailyGoalRegularCaption;

  /// No description provided for @dailyGoalSeriousCaption.
  ///
  /// In en, this message translates to:
  /// **'Serious'**
  String get dailyGoalSeriousCaption;

  /// No description provided for @dailyGoalIntenseCaption.
  ///
  /// In en, this message translates to:
  /// **'Breakthrough'**
  String get dailyGoalIntenseCaption;

  /// No description provided for @purposeOfficeWork.
  ///
  /// In en, this message translates to:
  /// **'AI for office work'**
  String get purposeOfficeWork;

  /// No description provided for @purposeSkillUpgrade.
  ///
  /// In en, this message translates to:
  /// **'Upgrade my skills'**
  String get purposeSkillUpgrade;

  /// No description provided for @purposeCareerChange.
  ///
  /// In en, this message translates to:
  /// **'Change careers / find a job'**
  String get purposeCareerChange;

  /// No description provided for @purposePersonalInterest.
  ///
  /// In en, this message translates to:
  /// **'Personal interest'**
  String get purposePersonalInterest;

  /// No description provided for @ackHeadline.
  ///
  /// In en, this message translates to:
  /// **'Saved!'**
  String get ackHeadline;

  /// No description provided for @ackHeadlineGreat.
  ///
  /// In en, this message translates to:
  /// **'Great!'**
  String get ackHeadlineGreat;

  /// No description provided for @ackHeadlineNoted.
  ///
  /// In en, this message translates to:
  /// **'Got it!'**
  String get ackHeadlineNoted;

  /// No description provided for @ackHeadlineMilestone.
  ///
  /// In en, this message translates to:
  /// **'You are halfway there!'**
  String get ackHeadlineMilestone;

  /// No description provided for @ackHeadlineCommitment.
  ///
  /// In en, this message translates to:
  /// **'Excellent commitment!'**
  String get ackHeadlineCommitment;

  /// No description provided for @ackAnalyzingHeadline.
  ///
  /// In en, this message translates to:
  /// **'Analyzing...'**
  String get ackAnalyzingHeadline;

  /// No description provided for @ackLanguageEchoEnglish.
  ///
  /// In en, this message translates to:
  /// **'English - your learning language is set'**
  String get ackLanguageEchoEnglish;

  /// No description provided for @ackLanguageEchoVietnamese.
  ///
  /// In en, this message translates to:
  /// **'Tiếng Việt - your learning language is set'**
  String get ackLanguageEchoVietnamese;

  /// No description provided for @ackReferralEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} - thanks for finding GATS'**
  String ackReferralEcho(String value);

  /// No description provided for @ackLevelEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} - I will tune your learning pace'**
  String ackLevelEcho(String value);

  /// No description provided for @ackProfileEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} - your context is saved'**
  String ackProfileEcho(String value);

  /// No description provided for @ackMotivationEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} - that is a meaningful motivation!'**
  String ackMotivationEcho(String value);

  /// No description provided for @ackInterestsEcho.
  ///
  /// In en, this message translates to:
  /// **'{count} skills selected - I will prioritize these'**
  String ackInterestsEcho(int count);

  /// No description provided for @ackAgeEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} - saved, thank you!'**
  String ackAgeEcho(String value);

  /// No description provided for @ackDailyGoalEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} - I will keep lessons bite-sized'**
  String ackDailyGoalEcho(String value);

  /// No description provided for @ackPurposeEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} - analyzing matching courses'**
  String ackPurposeEcho(String value);

  /// No description provided for @ackSocialReferral.
  ///
  /// In en, this message translates to:
  /// **'Join 10,000+ learners studying AI every day'**
  String get ackSocialReferral;

  /// No description provided for @ackSocialMilestone.
  ///
  /// In en, this message translates to:
  /// **'92% of learners complete this setup'**
  String get ackSocialMilestone;

  /// No description provided for @ackSocialDailyGoal.
  ///
  /// In en, this message translates to:
  /// **'Daily learning can improve retention by 3x'**
  String get ackSocialDailyGoal;

  /// No description provided for @onboardingResultsCongratsTitle.
  ///
  /// In en, this message translates to:
  /// **'Congratulations!'**
  String get onboardingResultsCongratsTitle;

  /// No description provided for @onboardingCoachResult.
  ///
  /// In en, this message translates to:
  /// **'Great! I found the right courses for you.'**
  String get onboardingCoachResult;

  /// No description provided for @onboardingResultHeadline.
  ///
  /// In en, this message translates to:
  /// **'We found {count} matching courses'**
  String onboardingResultHeadline(int count);

  /// No description provided for @onboardingResultSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Based on your answers'**
  String get onboardingResultSubtitle;

  /// No description provided for @onboardingMatchBadge.
  ///
  /// In en, this message translates to:
  /// **'{percent}% match'**
  String onboardingMatchBadge(int percent);

  /// No description provided for @course1Title.
  ///
  /// In en, this message translates to:
  /// **'AI for Office Workers'**
  String get course1Title;

  /// No description provided for @course1Description.
  ///
  /// In en, this message translates to:
  /// **'From zero to AI mastery in daily work'**
  String get course1Description;

  /// No description provided for @course1Tag.
  ///
  /// In en, this message translates to:
  /// **'AI for the workplace'**
  String get course1Tag;

  /// No description provided for @course2Title.
  ///
  /// In en, this message translates to:
  /// **'Prompt Engineering'**
  String get course2Title;

  /// No description provided for @course2Description.
  ///
  /// In en, this message translates to:
  /// **'Write professional prompts for every situation'**
  String get course2Description;

  /// No description provided for @course2Tag.
  ///
  /// In en, this message translates to:
  /// **'AI for the workplace'**
  String get course2Tag;

  /// No description provided for @course3Title.
  ///
  /// In en, this message translates to:
  /// **'Automation with AI'**
  String get course3Title;

  /// No description provided for @course3Description.
  ///
  /// In en, this message translates to:
  /// **'Build workflows that save hours every week'**
  String get course3Description;

  /// No description provided for @course3Tag.
  ///
  /// In en, this message translates to:
  /// **'Automation'**
  String get course3Tag;

  /// No description provided for @aiCoachName.
  ///
  /// In en, this message translates to:
  /// **'GATS Coach'**
  String get aiCoachName;

  /// No description provided for @rateUsAppBarTitle.
  ///
  /// In en, this message translates to:
  /// **'Reviews'**
  String get rateUsAppBarTitle;

  /// No description provided for @rateUsBasedOnReviews.
  ///
  /// In en, this message translates to:
  /// **'Based on {count} reviews'**
  String rateUsBasedOnReviews(String count);

  /// No description provided for @reviewFilterExcellent.
  ///
  /// In en, this message translates to:
  /// **'Excellent'**
  String get reviewFilterExcellent;

  /// No description provided for @reviewFilterGood.
  ///
  /// In en, this message translates to:
  /// **'Good'**
  String get reviewFilterGood;

  /// No description provided for @reviewFilterAverage.
  ///
  /// In en, this message translates to:
  /// **'Average'**
  String get reviewFilterAverage;

  /// No description provided for @reviewFilterNeedsImprovement.
  ///
  /// In en, this message translates to:
  /// **'Needs improvement'**
  String get reviewFilterNeedsImprovement;

  /// No description provided for @rateUsContextLine.
  ///
  /// In en, this message translates to:
  /// **'You just received a personal AI roadmap — see what other learners say'**
  String get rateUsContextLine;

  /// No description provided for @rateUsNoReviewsForFilter.
  ///
  /// In en, this message translates to:
  /// **'No reviews in this group yet'**
  String get rateUsNoReviewsForFilter;

  /// No description provided for @rateUsLater.
  ///
  /// In en, this message translates to:
  /// **'Later'**
  String get rateUsLater;

  /// No description provided for @reviewDialogTitle.
  ///
  /// In en, this message translates to:
  /// **'Would you mind rating GATS Academy?'**
  String get reviewDialogTitle;

  /// No description provided for @reviewDialogBody.
  ///
  /// In en, this message translates to:
  /// **'Your feedback helps us improve the AI learning experience for office workers.'**
  String get reviewDialogBody;

  /// No description provided for @reviewDialogRate.
  ///
  /// In en, this message translates to:
  /// **'Rate'**
  String get reviewDialogRate;

  /// No description provided for @reviewDialogNoThanks.
  ///
  /// In en, this message translates to:
  /// **'No, thanks'**
  String get reviewDialogNoThanks;

  /// No description provided for @loadingCongratsBody.
  ///
  /// In en, this message translates to:
  /// **'Your learning roadmap is ready'**
  String get loadingCongratsBody;

  /// No description provided for @loadingPersonalizing.
  ///
  /// In en, this message translates to:
  /// **'Analyzing your learning goals'**
  String get loadingPersonalizing;

  /// No description provided for @loadingCourses.
  ///
  /// In en, this message translates to:
  /// **'Matching the right courses'**
  String get loadingCourses;

  /// No description provided for @loadingFlashcards.
  ///
  /// In en, this message translates to:
  /// **'Creating today\'s flashcards'**
  String get loadingFlashcards;

  /// No description provided for @loadingReady.
  ///
  /// In en, this message translates to:
  /// **'Ready to start!'**
  String get loadingReady;

  /// No description provided for @review1Body.
  ///
  /// In en, this message translates to:
  /// **'A clear AI roadmap I could apply to office work right away.'**
  String get review1Body;

  /// No description provided for @review1TimeAgo.
  ///
  /// In en, this message translates to:
  /// **'2 weeks ago'**
  String get review1TimeAgo;

  /// No description provided for @review2Body.
  ///
  /// In en, this message translates to:
  /// **'Flashcards and quizzes help me remember prompts faster. AI Coach suggests great lessons.'**
  String get review2Body;

  /// No description provided for @review2TimeAgo.
  ///
  /// In en, this message translates to:
  /// **'1 month ago'**
  String get review2TimeAgo;

  /// No description provided for @review3Body.
  ///
  /// In en, this message translates to:
  /// **'The Prompt Engineering course is easy to follow. Mentors reply quickly in the group chat.'**
  String get review3Body;

  /// No description provided for @review3TimeAgo.
  ///
  /// In en, this message translates to:
  /// **'3 weeks ago'**
  String get review3TimeAgo;

  /// No description provided for @review4Body.
  ///
  /// In en, this message translates to:
  /// **'Solid app — hoping for more Excel + AI practice exercises.'**
  String get review4Body;

  /// No description provided for @review4TimeAgo.
  ///
  /// In en, this message translates to:
  /// **'1 week ago'**
  String get review4TimeAgo;

  /// No description provided for @courseLandingLearnOutcomes.
  ///
  /// In en, this message translates to:
  /// **'What you\'ll learn'**
  String get courseLandingLearnOutcomes;

  /// No description provided for @courseLandingAbout.
  ///
  /// In en, this message translates to:
  /// **'About this course'**
  String get courseLandingAbout;

  /// No description provided for @courseLandingCurriculum.
  ///
  /// In en, this message translates to:
  /// **'Course content'**
  String get courseLandingCurriculum;

  /// No description provided for @courseLandingLessonCount.
  ///
  /// In en, this message translates to:
  /// **'{count} lessons'**
  String courseLandingLessonCount(int count);

  /// No description provided for @courseLandingPreviewFree.
  ///
  /// In en, this message translates to:
  /// **'Free preview'**
  String get courseLandingPreviewFree;

  /// No description provided for @courseLandingRequirements.
  ///
  /// In en, this message translates to:
  /// **'Requirements'**
  String get courseLandingRequirements;

  /// No description provided for @courseLandingStudents.
  ///
  /// In en, this message translates to:
  /// **'{count} students'**
  String courseLandingStudents(int count);

  /// No description provided for @courseLandingLastUpdated.
  ///
  /// In en, this message translates to:
  /// **'Updated {date}'**
  String courseLandingLastUpdated(String date);

  /// No description provided for @durationMinutes.
  ///
  /// In en, this message translates to:
  /// **'{minutes} min'**
  String durationMinutes(int minutes);

  /// No description provided for @durationHours.
  ///
  /// In en, this message translates to:
  /// **'{hours} hr'**
  String durationHours(int hours);

  /// No description provided for @durationHoursMinutes.
  ///
  /// In en, this message translates to:
  /// **'{hours} hr {minutes} min'**
  String durationHoursMinutes(int hours, int minutes);

  /// No description provided for @splashTagline.
  ///
  /// In en, this message translates to:
  /// **'AI FOR THE WORKPLACE'**
  String get splashTagline;

  /// No description provided for @authPostOnboardingTitle.
  ///
  /// In en, this message translates to:
  /// **'Sign up for free to discover your learning path'**
  String get authPostOnboardingTitle;

  /// No description provided for @authPostOnboardingSkip.
  ///
  /// In en, this message translates to:
  /// **'Continue without signing in'**
  String get authPostOnboardingSkip;

  /// No description provided for @authContinueEmail.
  ///
  /// In en, this message translates to:
  /// **'Continue with email'**
  String get authContinueEmail;

  /// No description provided for @authEmailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get authEmailLabel;

  /// No description provided for @authPasswordLabel.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authPasswordLabel;

  /// No description provided for @authForgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot password?'**
  String get authForgotPassword;

  /// No description provided for @authLoginButton.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get authLoginButton;

  /// No description provided for @authSignUpButton.
  ///
  /// In en, this message translates to:
  /// **'Sign up'**
  String get authSignUpButton;

  /// No description provided for @authLoginTitle.
  ///
  /// In en, this message translates to:
  /// **'Sign in now!'**
  String get authLoginTitle;

  /// No description provided for @authLoginSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Sign in to continue your courses'**
  String get authLoginSubtitle;

  /// No description provided for @authSignUpTitle.
  ///
  /// In en, this message translates to:
  /// **'Create your account!'**
  String get authSignUpTitle;

  /// No description provided for @authSignUpSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Start your AI learning journey with GATS'**
  String get authSignUpSubtitle;

  /// No description provided for @authRememberMe.
  ///
  /// In en, this message translates to:
  /// **'Remember me'**
  String get authRememberMe;

  /// No description provided for @authOrContinueWith.
  ///
  /// In en, this message translates to:
  /// **'Or continue with'**
  String get authOrContinueWith;

  /// No description provided for @authNoAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account?'**
  String get authNoAccount;

  /// No description provided for @authHasAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get authHasAccount;

  /// No description provided for @authSignUpLink.
  ///
  /// In en, this message translates to:
  /// **'SIGN UP'**
  String get authSignUpLink;

  /// No description provided for @authSignInLink.
  ///
  /// In en, this message translates to:
  /// **'SIGN IN'**
  String get authSignInLink;

  /// No description provided for @authGoogle.
  ///
  /// In en, this message translates to:
  /// **'Google'**
  String get authGoogle;

  /// No description provided for @authApple.
  ///
  /// In en, this message translates to:
  /// **'Apple'**
  String get authApple;

  /// No description provided for @authMomo.
  ///
  /// In en, this message translates to:
  /// **'MoMo'**
  String get authMomo;

  /// No description provided for @authOrDivider.
  ///
  /// In en, this message translates to:
  /// **'or'**
  String get authOrDivider;

  /// No description provided for @authMockNotice.
  ///
  /// In en, this message translates to:
  /// **'Mock auth — use a demo account below or any email (defaults to learner).'**
  String get authMockNotice;

  /// No description provided for @authDemoAccounts.
  ///
  /// In en, this message translates to:
  /// **'Demo accounts'**
  String get authDemoAccounts;

  /// No description provided for @authSignOut.
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get authSignOut;

  /// No description provided for @authNotSignedIn.
  ///
  /// In en, this message translates to:
  /// **'Not signed in — please log in with your account'**
  String get authNotSignedIn;

  /// No description provided for @authSignedInAs.
  ///
  /// In en, this message translates to:
  /// **'Signed in as: {identity}'**
  String authSignedInAs(String identity);

  /// No description provided for @authRoleLabel.
  ///
  /// In en, this message translates to:
  /// **'Role: {role}'**
  String authRoleLabel(String role);

  /// No description provided for @comingSoon.
  ///
  /// In en, this message translates to:
  /// **'Coming soon'**
  String get comingSoon;

  /// No description provided for @roleGuest.
  ///
  /// In en, this message translates to:
  /// **'Guest'**
  String get roleGuest;

  /// No description provided for @roleUser.
  ///
  /// In en, this message translates to:
  /// **'Learner'**
  String get roleUser;

  /// No description provided for @roleMentor.
  ///
  /// In en, this message translates to:
  /// **'Mentor'**
  String get roleMentor;

  /// No description provided for @roleAdmin.
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get roleAdmin;

  /// No description provided for @authMethodEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get authMethodEmail;

  /// No description provided for @authMethodDemo.
  ///
  /// In en, this message translates to:
  /// **'Demo'**
  String get authMethodDemo;

  /// No description provided for @authDefaultDisplayName.
  ///
  /// In en, this message translates to:
  /// **'GATS Learner'**
  String get authDefaultDisplayName;

  /// No description provided for @authErrorWrongDemoPassword.
  ///
  /// In en, this message translates to:
  /// **'Demo password: {password}'**
  String authErrorWrongDemoPassword(String password);

  /// No description provided for @authErrorInvalidEmail.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid email'**
  String get authErrorInvalidEmail;

  /// No description provided for @authErrorPasswordTooShortLogin.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 4 characters'**
  String get authErrorPasswordTooShortLogin;

  /// No description provided for @authErrorPasswordTooShortSignup.
  ///
  /// In en, this message translates to:
  /// **'Sign-up password must be at least 6 characters'**
  String get authErrorPasswordTooShortSignup;

  /// No description provided for @authTabSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in'**
  String get authTabSignIn;

  /// No description provided for @authTabSignUp.
  ///
  /// In en, this message translates to:
  /// **'Sign up'**
  String get authTabSignUp;

  /// No description provided for @authFullNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Full name'**
  String get authFullNameLabel;

  /// No description provided for @authConfirmPasswordLabel.
  ///
  /// In en, this message translates to:
  /// **'Confirm password'**
  String get authConfirmPasswordLabel;

  /// No description provided for @authPasswordHintSignup.
  ///
  /// In en, this message translates to:
  /// **'At least 6 characters'**
  String get authPasswordHintSignup;

  /// No description provided for @authAgreeTerms.
  ///
  /// In en, this message translates to:
  /// **'I agree to the Terms & Conditions'**
  String get authAgreeTerms;

  /// No description provided for @authErrorNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Please enter your name'**
  String get authErrorNameRequired;

  /// No description provided for @authErrorPasswordMismatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get authErrorPasswordMismatch;

  /// No description provided for @authErrorTermsRequired.
  ///
  /// In en, this message translates to:
  /// **'Please accept the Terms & Conditions'**
  String get authErrorTermsRequired;

  /// No description provided for @authExistingUserPrompt.
  ///
  /// In en, this message translates to:
  /// **'Existing user?'**
  String get authExistingUserPrompt;

  /// No description provided for @authFirstNameLabel.
  ///
  /// In en, this message translates to:
  /// **'First name'**
  String get authFirstNameLabel;

  /// No description provided for @authLastNameLabel.
  ///
  /// In en, this message translates to:
  /// **'Last name'**
  String get authLastNameLabel;

  /// No description provided for @authAgeLabel.
  ///
  /// In en, this message translates to:
  /// **'Age'**
  String get authAgeLabel;

  /// No description provided for @authLegalSignUpPrefix.
  ///
  /// In en, this message translates to:
  /// **'By tapping \'Sign up\', I agree to GATS Academy\'s '**
  String get authLegalSignUpPrefix;

  /// No description provided for @authTermsLink.
  ///
  /// In en, this message translates to:
  /// **'Terms'**
  String get authTermsLink;

  /// No description provided for @authLegalSignUpMiddle.
  ///
  /// In en, this message translates to:
  /// **' and '**
  String get authLegalSignUpMiddle;

  /// No description provided for @authPrivacyLink.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy'**
  String get authPrivacyLink;

  /// No description provided for @authErrorFirstNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Please enter your first name'**
  String get authErrorFirstNameRequired;

  /// No description provided for @authErrorLastNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Please enter your last name'**
  String get authErrorLastNameRequired;

  /// No description provided for @authErrorAgeRequired.
  ///
  /// In en, this message translates to:
  /// **'Please enter your age'**
  String get authErrorAgeRequired;

  /// No description provided for @authErrorAgeInvalid.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid age'**
  String get authErrorAgeInvalid;

  /// No description provided for @authErrorNetwork.
  ///
  /// In en, this message translates to:
  /// **'Network error. Check your connection and try again.'**
  String get authErrorNetwork;

  /// No description provided for @authErrorUnauthorized.
  ///
  /// In en, this message translates to:
  /// **'Invalid email or password'**
  String get authErrorUnauthorized;

  /// No description provided for @authErrorServer.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong. Please try again.'**
  String get authErrorServer;

  /// No description provided for @authSocialCancelled.
  ///
  /// In en, this message translates to:
  /// **'Sign-in cancelled'**
  String get authSocialCancelled;

  /// No description provided for @authSocialTokenMissing.
  ///
  /// In en, this message translates to:
  /// **'Could not get a token from the provider. Check OAuth setup.'**
  String get authSocialTokenMissing;

  /// No description provided for @authSocialFailed.
  ///
  /// In en, this message translates to:
  /// **'Social sign-in failed'**
  String get authSocialFailed;

  /// No description provided for @authSocialGoogleConfigHint.
  ///
  /// In en, this message translates to:
  /// **'Google Sign-In is misconfigured. In Google Cloud Console, create a Web application OAuth client, copy its Client ID to GOOGLE_SERVER_CLIENT_ID (.env) and default_web_client_id (strings.xml). Android (package + SHA-1) and Web clients must be in the same project.'**
  String get authSocialGoogleConfigHint;

  /// No description provided for @authRegisterSuccessVerify.
  ///
  /// In en, this message translates to:
  /// **'Account created. Enter the verification code from your email.'**
  String get authRegisterSuccessVerify;

  /// No description provided for @authVerifyEmailTitle.
  ///
  /// In en, this message translates to:
  /// **'Verify your email'**
  String get authVerifyEmailTitle;

  /// No description provided for @authVerifyEmailSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Paste the verification token sent to your inbox.'**
  String get authVerifyEmailSubtitle;

  /// No description provided for @authVerifyEmailTokenLabel.
  ///
  /// In en, this message translates to:
  /// **'Verification token'**
  String get authVerifyEmailTokenLabel;

  /// No description provided for @authVerifyEmailButton.
  ///
  /// In en, this message translates to:
  /// **'Verify and continue'**
  String get authVerifyEmailButton;

  /// No description provided for @entryGreeting.
  ///
  /// In en, this message translates to:
  /// **'Hello ;)'**
  String get entryGreeting;

  /// No description provided for @entrySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Are you ready to learn AI?'**
  String get entrySubtitle;

  /// No description provided for @entryStart.
  ///
  /// In en, this message translates to:
  /// **'Start'**
  String get entryStart;

  /// No description provided for @languagePickerVietnamese.
  ///
  /// In en, this message translates to:
  /// **'Tiếng Việt'**
  String get languagePickerVietnamese;

  /// No description provided for @languagePickerEnglish.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get languagePickerEnglish;

  /// No description provided for @languagePickerVietnameseHint.
  ///
  /// In en, this message translates to:
  /// **'Use Vietnamese for the app and onboarding'**
  String get languagePickerVietnameseHint;

  /// No description provided for @languagePickerEnglishHint.
  ///
  /// In en, this message translates to:
  /// **'Use English for the app and onboarding'**
  String get languagePickerEnglishHint;

  /// No description provided for @entrySkip.
  ///
  /// In en, this message translates to:
  /// **'Skip'**
  String get entrySkip;

  /// No description provided for @entryGuestHint.
  ///
  /// In en, this message translates to:
  /// **'Want to explore first?'**
  String get entryGuestHint;

  /// No description provided for @welcomeTitle.
  ///
  /// In en, this message translates to:
  /// **'MASTER AI'**
  String get welcomeTitle;

  /// No description provided for @welcomeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Learn AI step-by-step — unlock your office future'**
  String get welcomeSubtitle;

  /// No description provided for @welcomeTagline.
  ///
  /// In en, this message translates to:
  /// **'Transform your skills — anytime, anywhere'**
  String get welcomeTagline;

  /// No description provided for @authTabLogin.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get authTabLogin;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navDaily.
  ///
  /// In en, this message translates to:
  /// **'Daily'**
  String get navDaily;

  /// No description provided for @navLibrary.
  ///
  /// In en, this message translates to:
  /// **'Library'**
  String get navLibrary;

  /// No description provided for @navCoach.
  ///
  /// In en, this message translates to:
  /// **'Coach'**
  String get navCoach;

  /// No description provided for @navHub.
  ///
  /// In en, this message translates to:
  /// **'Hub'**
  String get navHub;

  /// No description provided for @navStore.
  ///
  /// In en, this message translates to:
  /// **'Store'**
  String get navStore;

  /// No description provided for @tabRoadmap.
  ///
  /// In en, this message translates to:
  /// **'Roadmap'**
  String get tabRoadmap;

  /// No description provided for @tabQuiz.
  ///
  /// In en, this message translates to:
  /// **'Quiz'**
  String get tabQuiz;

  /// No description provided for @tabAiReport.
  ///
  /// In en, this message translates to:
  /// **'AI Report'**
  String get tabAiReport;

  /// No description provided for @homeGreeting.
  ///
  /// In en, this message translates to:
  /// **'Hello, {name}'**
  String homeGreeting(String name);

  /// No description provided for @homeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'What do you want to learn today?'**
  String get homeSubtitle;

  /// No description provided for @homePromoTitle.
  ///
  /// In en, this message translates to:
  /// **'Continue learning AI'**
  String get homePromoTitle;

  /// No description provided for @homePromoSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Complete the Basic Prompt module today'**
  String get homePromoSubtitle;

  /// No description provided for @homePromoBadge.
  ///
  /// In en, this message translates to:
  /// **'LEARNING'**
  String get homePromoBadge;

  /// No description provided for @homeCategories.
  ///
  /// In en, this message translates to:
  /// **'Categories'**
  String get homeCategories;

  /// No description provided for @homePopularCourses.
  ///
  /// In en, this message translates to:
  /// **'Popular Courses'**
  String get homePopularCourses;

  /// No description provided for @homeMyCourses.
  ///
  /// In en, this message translates to:
  /// **'My Courses'**
  String get homeMyCourses;

  /// No description provided for @homeYourCourses.
  ///
  /// In en, this message translates to:
  /// **'Your Courses'**
  String get homeYourCourses;

  /// No description provided for @homeYourCoursesEmpty.
  ///
  /// In en, this message translates to:
  /// **'You haven\'t purchased any courses yet.'**
  String get homeYourCoursesEmpty;

  /// No description provided for @homeYourCoursesBrowse.
  ///
  /// In en, this message translates to:
  /// **'Browse store'**
  String get homeYourCoursesBrowse;

  /// No description provided for @seeAll.
  ///
  /// In en, this message translates to:
  /// **'See all'**
  String get seeAll;

  /// No description provided for @libraryFilterAll.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get libraryFilterAll;

  /// No description provided for @libraryFilterOngoing.
  ///
  /// In en, this message translates to:
  /// **'Ongoing'**
  String get libraryFilterOngoing;

  /// No description provided for @libraryFilterDone.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get libraryFilterDone;

  /// No description provided for @libraryAllCourses.
  ///
  /// In en, this message translates to:
  /// **'All Courses'**
  String get libraryAllCourses;

  /// No description provided for @statusNotStarted.
  ///
  /// In en, this message translates to:
  /// **'Not started'**
  String get statusNotStarted;

  /// No description provided for @statusInProgress.
  ///
  /// In en, this message translates to:
  /// **'In progress'**
  String get statusInProgress;

  /// No description provided for @statusCompleted.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get statusCompleted;

  /// No description provided for @continueLearning.
  ///
  /// In en, this message translates to:
  /// **'Continue learning'**
  String get continueLearning;

  /// No description provided for @continueButton.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get continueButton;

  /// No description provided for @quizEmptyTitle.
  ///
  /// In en, this message translates to:
  /// **'No quizzes yet'**
  String get quizEmptyTitle;

  /// No description provided for @quizEmptyDesc.
  ///
  /// In en, this message translates to:
  /// **'Quizzes will appear as you study courses (every 10-15 minutes).'**
  String get quizEmptyDesc;

  /// No description provided for @exploreLibrary.
  ///
  /// In en, this message translates to:
  /// **'Explore library'**
  String get exploreLibrary;

  /// No description provided for @dailyTasksTitle.
  ///
  /// In en, this message translates to:
  /// **'Today\'s Tasks'**
  String get dailyTasksTitle;

  /// No description provided for @dailyRoutineTitle.
  ///
  /// In en, this message translates to:
  /// **'Daily Routine'**
  String get dailyRoutineTitle;

  /// No description provided for @routineEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get routineEdit;

  /// No description provided for @routineEditorTitle.
  ///
  /// In en, this message translates to:
  /// **'Design Routine'**
  String get routineEditorTitle;

  /// No description provided for @routineSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get routineSave;

  /// No description provided for @routineAddNode.
  ///
  /// In en, this message translates to:
  /// **'Add node'**
  String get routineAddNode;

  /// No description provided for @routineEditorHint.
  ///
  /// In en, this message translates to:
  /// **'Drag node · Tap right port to connect · Hold to delete'**
  String get routineEditorHint;

  /// No description provided for @routineConnectHint.
  ///
  /// In en, this message translates to:
  /// **'Tap left port of target node to connect'**
  String get routineConnectHint;

  /// No description provided for @routineCancelConnect.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get routineCancelConnect;

  /// No description provided for @routinePreviewSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Personal learning workflow — n8n style'**
  String get routinePreviewSubtitle;

  /// No description provided for @flashcardSectionTitle.
  ///
  /// In en, this message translates to:
  /// **'Study Flashcards'**
  String get flashcardSectionTitle;

  /// No description provided for @flashcardDue.
  ///
  /// In en, this message translates to:
  /// **'{count} cards to review today'**
  String flashcardDue(int count);

  /// No description provided for @startFlashcard.
  ///
  /// In en, this message translates to:
  /// **'Start studying'**
  String get startFlashcard;

  /// No description provided for @vpsBanner.
  ///
  /// In en, this message translates to:
  /// **'Want to automate your routine? Contact us to rent a company VPS.'**
  String get vpsBanner;

  /// No description provided for @flashcardTapFlip.
  ///
  /// In en, this message translates to:
  /// **'Tap to flip'**
  String get flashcardTapFlip;

  /// No description provided for @flashcardUnknown.
  ///
  /// In en, this message translates to:
  /// **'Not memorized'**
  String get flashcardUnknown;

  /// No description provided for @flashcardKnown.
  ///
  /// In en, this message translates to:
  /// **'Memorized'**
  String get flashcardKnown;

  /// No description provided for @flashcardSessionDone.
  ///
  /// In en, this message translates to:
  /// **'Session completed!'**
  String get flashcardSessionDone;

  /// No description provided for @flashcardXpEarned.
  ///
  /// In en, this message translates to:
  /// **'+{xp} XP'**
  String flashcardXpEarned(int xp);

  /// No description provided for @libraryEmptyTitle.
  ///
  /// In en, this message translates to:
  /// **'Courses coming soon'**
  String get libraryEmptyTitle;

  /// No description provided for @libraryEmptyDesc.
  ///
  /// In en, this message translates to:
  /// **'AI courses library for office workers is being prepared.'**
  String get libraryEmptyDesc;

  /// No description provided for @featuredCourse.
  ///
  /// In en, this message translates to:
  /// **'Featured'**
  String get featuredCourse;

  /// No description provided for @aiCoachWelcome.
  ///
  /// In en, this message translates to:
  /// **'Hello! I am your AI Coach. I will assist you based on your learning progress.'**
  String get aiCoachWelcome;

  /// No description provided for @aiCoachMockReply.
  ///
  /// In en, this message translates to:
  /// **'I am analyzing your learning progress. Please continue completing the active module!'**
  String get aiCoachMockReply;

  /// No description provided for @aiCoachInputHint.
  ///
  /// In en, this message translates to:
  /// **'Ask AI Coach...'**
  String get aiCoachInputHint;

  /// No description provided for @hubXpTitle.
  ///
  /// In en, this message translates to:
  /// **'Experience'**
  String get hubXpTitle;

  /// No description provided for @hubBadgesTitle.
  ///
  /// In en, this message translates to:
  /// **'Badges'**
  String get hubBadgesTitle;

  /// No description provided for @hubCertTitle.
  ///
  /// In en, this message translates to:
  /// **'Certificates'**
  String get hubCertTitle;

  /// No description provided for @hubCertLocked.
  ///
  /// In en, this message translates to:
  /// **'Need {xp} more XP to unlock certificate exam'**
  String hubCertLocked(int xp);

  /// No description provided for @hubCertReady.
  ///
  /// In en, this message translates to:
  /// **'You have enough XP! Ready for the certificate exam.'**
  String get hubCertReady;

  /// No description provided for @hubCertButton.
  ///
  /// In en, this message translates to:
  /// **'Start certificate exam'**
  String get hubCertButton;

  /// No description provided for @settingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settingsTitle;

  /// No description provided for @settingsAccount.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get settingsAccount;

  /// No description provided for @settingsNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get settingsNotifications;

  /// No description provided for @settingsLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get settingsLanguage;

  /// No description provided for @settingsDarkMode.
  ///
  /// In en, this message translates to:
  /// **'Dark Mode'**
  String get settingsDarkMode;

  /// No description provided for @settingsDarkModeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Starry night — sleep app style'**
  String get settingsDarkModeSubtitle;

  /// No description provided for @settingsAbout.
  ///
  /// In en, this message translates to:
  /// **'About App'**
  String get settingsAbout;

  /// No description provided for @settingsReplayOnboarding.
  ///
  /// In en, this message translates to:
  /// **'Reset onboarding'**
  String get settingsReplayOnboarding;

  /// No description provided for @settingsSignOutSuccess.
  ///
  /// In en, this message translates to:
  /// **'Signed out. Restart the app to return to entry screen.'**
  String get settingsSignOutSuccess;

  /// No description provided for @settingsReplaySuccess.
  ///
  /// In en, this message translates to:
  /// **'Onboarding reset. Restart the app to replay the flow.'**
  String get settingsReplaySuccess;

  /// No description provided for @tagOfficeAi.
  ///
  /// In en, this message translates to:
  /// **'AI for workplace'**
  String get tagOfficeAi;

  /// No description provided for @streakDays.
  ///
  /// In en, this message translates to:
  /// **'{days} days streak'**
  String streakDays(int days);

  /// No description provided for @onboardingWelcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome to GATS Academy'**
  String get onboardingWelcome;

  /// No description provided for @onboardingSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Tell us more about yourself'**
  String get onboardingSubtitle;

  /// No description provided for @onboardingStart.
  ///
  /// In en, this message translates to:
  /// **'Start'**
  String get onboardingStart;

  /// No description provided for @onboardingSkip.
  ///
  /// In en, this message translates to:
  /// **'Skip'**
  String get onboardingSkip;

  /// No description provided for @onboardingWelcomeSlide1Title.
  ///
  /// In en, this message translates to:
  /// **'Personalized AI roadmap'**
  String get onboardingWelcomeSlide1Title;

  /// No description provided for @onboardingWelcomeSlide1Body.
  ///
  /// In en, this message translates to:
  /// **'Courses are suggested based on your level and goals — no waste of time.'**
  String get onboardingWelcomeSlide1Body;

  /// No description provided for @onboardingWelcomeSlide2Title.
  ///
  /// In en, this message translates to:
  /// **'Daily practice with flashcards'**
  String get onboardingWelcomeSlide2Title;

  /// No description provided for @onboardingWelcomeSlide2Body.
  ///
  /// In en, this message translates to:
  /// **'Review short, remember long. Just a few minutes a day is enough to progress.'**
  String get onboardingWelcomeSlide2Body;

  /// No description provided for @onboardingWelcomeSlide3Title.
  ///
  /// In en, this message translates to:
  /// **'AI Coach 24/7 companion'**
  String get onboardingWelcomeSlide3Title;

  /// No description provided for @onboardingWelcomeSlide3Body.
  ///
  /// In en, this message translates to:
  /// **'Q&A, lesson recommendations and progress tracking — always ready when you need.'**
  String get onboardingWelcomeSlide3Body;

  /// No description provided for @onboardingCoachWelcome.
  ///
  /// In en, this message translates to:
  /// **'Hi! I am GATS Coach. Let\'s design your roadmap together!'**
  String get onboardingCoachWelcome;

  /// No description provided for @onboardingReferralTitle.
  ///
  /// In en, this message translates to:
  /// **'Where did you hear about GATS?'**
  String get onboardingReferralTitle;

  /// No description provided for @onboardingReferralSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Help us serve you better'**
  String get onboardingReferralSubtitle;

  /// No description provided for @onboardingLevelTitle.
  ///
  /// In en, this message translates to:
  /// **'What is your AI level?'**
  String get onboardingLevelTitle;

  /// No description provided for @onboardingLevelSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Choose the closest match — there is no wrong answer'**
  String get onboardingLevelSubtitle;

  /// No description provided for @onboardingProfileTitle.
  ///
  /// In en, this message translates to:
  /// **'What best describes you?'**
  String get onboardingProfileTitle;

  /// No description provided for @onboardingProfileSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Help us understand your learning context'**
  String get onboardingProfileSubtitle;

  /// No description provided for @onboardingMotivationTitle.
  ///
  /// In en, this message translates to:
  /// **'What motivates you to learn AI?'**
  String get onboardingMotivationTitle;

  /// No description provided for @onboardingMotivationSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Motivation helps you stay consistent'**
  String get onboardingMotivationSubtitle;

  /// No description provided for @onboardingInterestsTitle.
  ///
  /// In en, this message translates to:
  /// **'Which AI skills do you want to master?'**
  String get onboardingInterestsTitle;

  /// No description provided for @onboardingInterestsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Choose one or more — you can change this later'**
  String get onboardingInterestsSubtitle;

  /// No description provided for @onboardingAgeTitle.
  ///
  /// In en, this message translates to:
  /// **'What is your age range?'**
  String get onboardingAgeTitle;

  /// No description provided for @onboardingAgeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Helps us suggest suitable content and pace'**
  String get onboardingAgeSubtitle;

  /// No description provided for @onboardingDailyGoalTitle.
  ///
  /// In en, this message translates to:
  /// **'How long do you want to learn each day?'**
  String get onboardingDailyGoalTitle;

  /// No description provided for @onboardingDailyGoalSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Start small, increase as you get used to it'**
  String get onboardingDailyGoalSubtitle;

  /// No description provided for @onboardingPurposeTitle.
  ///
  /// In en, this message translates to:
  /// **'What is your learning goal?'**
  String get onboardingPurposeTitle;

  /// No description provided for @onboardingPurposeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Your roadmap will adapt to this goal'**
  String get onboardingPurposeSubtitle;

  /// No description provided for @onboardingAckHeadline.
  ///
  /// In en, this message translates to:
  /// **'Saved!'**
  String get onboardingAckHeadline;

  /// No description provided for @onboardingAckHeadlineGreat.
  ///
  /// In en, this message translates to:
  /// **'Great!'**
  String get onboardingAckHeadlineGreat;

  /// No description provided for @onboardingAckHeadlineNoted.
  ///
  /// In en, this message translates to:
  /// **'Got it!'**
  String get onboardingAckHeadlineNoted;

  /// No description provided for @onboardingAckHeadlineMilestone.
  ///
  /// In en, this message translates to:
  /// **'You are halfway there!'**
  String get onboardingAckHeadlineMilestone;

  /// No description provided for @onboardingAckHeadlineCommitment.
  ///
  /// In en, this message translates to:
  /// **'Excellent commitment!'**
  String get onboardingAckHeadlineCommitment;

  /// No description provided for @onboardingAckAnalyzingHeadline.
  ///
  /// In en, this message translates to:
  /// **'Analyzing...'**
  String get onboardingAckAnalyzingHeadline;

  /// No description provided for @onboardingAckReferralEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} — thank you for finding GATS'**
  String onboardingAckReferralEcho(String value);

  /// No description provided for @onboardingAckLevelEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} — saving to adjust your pace'**
  String onboardingAckLevelEcho(String value);

  /// No description provided for @onboardingAckProfileEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} — saving your profile details'**
  String onboardingAckProfileEcho(String value);

  /// No description provided for @onboardingAckMotivationEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} — that\'s a very meaningful motivation!'**
  String onboardingAckMotivationEcho(String value);

  /// No description provided for @onboardingAckInterestsEcho.
  ///
  /// In en, this message translates to:
  /// **'{count} skills selected — I will prioritize these'**
  String onboardingAckInterestsEcho(int count);

  /// No description provided for @onboardingAckAgeEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} — saved, thank you!'**
  String onboardingAckAgeEcho(String value);

  /// No description provided for @onboardingAckDailyGoalEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} — I will keep lessons bite-sized'**
  String onboardingAckDailyGoalEcho(String value);

  /// No description provided for @onboardingAckPurposeEcho.
  ///
  /// In en, this message translates to:
  /// **'{value} — analyzing to recommend the right courses'**
  String onboardingAckPurposeEcho(String value);

  /// No description provided for @onboardingAckSocialReferral.
  ///
  /// In en, this message translates to:
  /// **'Join 10,000+ learners studying AI every day'**
  String get onboardingAckSocialReferral;

  /// No description provided for @onboardingAckSocialMilestone.
  ///
  /// In en, this message translates to:
  /// **'92% of learners complete this setup'**
  String get onboardingAckSocialMilestone;

  /// No description provided for @onboardingAckSocialDailyGoal.
  ///
  /// In en, this message translates to:
  /// **'Daily learning can improve retention by 3x'**
  String get onboardingAckSocialDailyGoal;

  /// No description provided for @onboardingResultTitle.
  ///
  /// In en, this message translates to:
  /// **'Recommended courses for you'**
  String get onboardingResultTitle;

  /// No description provided for @onboardingToRateUs.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get onboardingToRateUs;

  /// No description provided for @rateUsTitle.
  ///
  /// In en, this message translates to:
  /// **'GATS Learners Community'**
  String get rateUsTitle;

  /// No description provided for @rateUsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'See what other learners say about GATS Academy'**
  String get rateUsSubtitle;

  /// No description provided for @rateUsSocialProof.
  ///
  /// In en, this message translates to:
  /// **'10,000+ AI learners'**
  String get rateUsSocialProof;

  /// No description provided for @rateUsStoreRating.
  ///
  /// In en, this message translates to:
  /// **'4.8★ on App Store'**
  String get rateUsStoreRating;

  /// No description provided for @loadingTitle.
  ///
  /// In en, this message translates to:
  /// **'Creating your learning path'**
  String get loadingTitle;

  /// No description provided for @loadingCongratsTitle.
  ///
  /// In en, this message translates to:
  /// **'Congratulations!'**
  String get loadingCongratsTitle;

  /// No description provided for @rateSheetTitle.
  ///
  /// In en, this message translates to:
  /// **'Do you like GATS Academy?'**
  String get rateSheetTitle;

  /// No description provided for @rateSheetSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Your rating helps us improve the learning experience'**
  String get rateSheetSubtitle;

  /// No description provided for @rateSheetCta.
  ///
  /// In en, this message translates to:
  /// **'Rate now'**
  String get rateSheetCta;

  /// No description provided for @rateSheetLater.
  ///
  /// In en, this message translates to:
  /// **'Later'**
  String get rateSheetLater;

  /// No description provided for @reviewOpenedPlayStore.
  ///
  /// In en, this message translates to:
  /// **'Opening Google Play so you can rate the app.'**
  String get reviewOpenedPlayStore;

  /// No description provided for @reviewNativeUnavailable.
  ///
  /// In en, this message translates to:
  /// **'In-app rating only works for apps installed from Google Play. Opening the store page instead.'**
  String get reviewNativeUnavailable;

  /// No description provided for @settingsRateApp.
  ///
  /// In en, this message translates to:
  /// **'Rate App'**
  String get settingsRateApp;

  /// No description provided for @courseTabOverview.
  ///
  /// In en, this message translates to:
  /// **'Overview'**
  String get courseTabOverview;

  /// No description provided for @courseTabLectures.
  ///
  /// In en, this message translates to:
  /// **'Lectures'**
  String get courseTabLectures;

  /// No description provided for @courseTabQuiz.
  ///
  /// In en, this message translates to:
  /// **'Quiz'**
  String get courseTabQuiz;

  /// No description provided for @courseTabPosts.
  ///
  /// In en, this message translates to:
  /// **'Posts'**
  String get courseTabPosts;

  /// No description provided for @courseTabChat.
  ///
  /// In en, this message translates to:
  /// **'Group Chat'**
  String get courseTabChat;

  /// No description provided for @courseTabGroup.
  ///
  /// In en, this message translates to:
  /// **'Group'**
  String get courseTabGroup;

  /// No description provided for @courseNotFound.
  ///
  /// In en, this message translates to:
  /// **'Course not found'**
  String get courseNotFound;

  /// No description provided for @courseEnroll.
  ///
  /// In en, this message translates to:
  /// **'Enroll in course'**
  String get courseEnroll;

  /// No description provided for @courseEnrollFree.
  ///
  /// In en, this message translates to:
  /// **'Join for free'**
  String get courseEnrollFree;

  /// No description provided for @courseEnrolled.
  ///
  /// In en, this message translates to:
  /// **'Enrolled in {name}'**
  String courseEnrolled(String name);

  /// No description provided for @courseAlreadyEnrolled.
  ///
  /// In en, this message translates to:
  /// **'You are already enrolled in this course'**
  String get courseAlreadyEnrolled;

  /// No description provided for @courseEnrollToView.
  ///
  /// In en, this message translates to:
  /// **'Enroll to view course content'**
  String get courseEnrollToView;

  /// No description provided for @courseLoginToEnroll.
  ///
  /// In en, this message translates to:
  /// **'Sign in to enroll in this course'**
  String get courseLoginToEnroll;

  /// No description provided for @courseMentorBadge.
  ///
  /// In en, this message translates to:
  /// **'You are mentoring this course'**
  String get courseMentorBadge;

  /// No description provided for @courseChatLocked.
  ///
  /// In en, this message translates to:
  /// **'GroupChat is only for enrolled students or mentors of the course'**
  String get courseChatLocked;

  /// No description provided for @courseQuizPublished.
  ///
  /// In en, this message translates to:
  /// **'Quiz assigned to students'**
  String get courseQuizPublished;

  /// No description provided for @groupChatEmpty.
  ///
  /// In en, this message translates to:
  /// **'No messages yet — say hi to the class!'**
  String get groupChatEmpty;

  /// No description provided for @groupChatHint.
  ///
  /// In en, this message translates to:
  /// **'Type a message...'**
  String get groupChatHint;

  /// No description provided for @groupChatOnePerCourse.
  ///
  /// In en, this message translates to:
  /// **'1 course = 1 chat room'**
  String get groupChatOnePerCourse;

  /// No description provided for @mentorNavCourses.
  ///
  /// In en, this message translates to:
  /// **'My Courses'**
  String get mentorNavCourses;

  /// No description provided for @mentorNavChats.
  ///
  /// In en, this message translates to:
  /// **'Group Chats'**
  String get mentorNavChats;

  /// No description provided for @mentorShellSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Mentor — manage lectures & student chats'**
  String get mentorShellSubtitle;

  /// No description provided for @mentorNoCourses.
  ///
  /// In en, this message translates to:
  /// **'No assigned courses yet'**
  String get mentorNoCourses;

  /// No description provided for @adminNavCourses.
  ///
  /// In en, this message translates to:
  /// **'Courses'**
  String get adminNavCourses;

  /// No description provided for @adminNavUsers.
  ///
  /// In en, this message translates to:
  /// **'Learners'**
  String get adminNavUsers;

  /// No description provided for @adminNavMentors.
  ///
  /// In en, this message translates to:
  /// **'Mentors'**
  String get adminNavMentors;

  /// No description provided for @adminNavPosts.
  ///
  /// In en, this message translates to:
  /// **'Posts & Articles'**
  String get adminNavPosts;

  /// No description provided for @adminShellSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Admin — operate platform'**
  String get adminShellSubtitle;

  /// No description provided for @adminAssignMentorHint.
  ///
  /// In en, this message translates to:
  /// **'Assign mentor ↔ course in production build (web admin).'**
  String get adminAssignMentorHint;

  /// No description provided for @adminPostCompose.
  ///
  /// In en, this message translates to:
  /// **'Post a GATS announcement'**
  String get adminPostCompose;

  /// No description provided for @adminPostsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No posts yet'**
  String get adminPostsEmpty;

  /// No description provided for @postHomeSectionTitle.
  ///
  /// In en, this message translates to:
  /// **'Articles & News'**
  String get postHomeSectionTitle;

  /// No description provided for @postFeedEmpty.
  ///
  /// In en, this message translates to:
  /// **'No posts yet'**
  String get postFeedEmpty;

  /// No description provided for @postSeeAll.
  ///
  /// In en, this message translates to:
  /// **'See all'**
  String get postSeeAll;

  /// No description provided for @postByAuthor.
  ///
  /// In en, this message translates to:
  /// **'By {author}'**
  String postByAuthor(String author);

  /// No description provided for @postPreviewLocked.
  ///
  /// In en, this message translates to:
  /// **'Enroll in course to read full article'**
  String get postPreviewLocked;

  /// No description provided for @postPreviewLogin.
  ///
  /// In en, this message translates to:
  /// **'Sign in and enroll to read full article'**
  String get postPreviewLogin;

  /// No description provided for @postEnrollCta.
  ///
  /// In en, this message translates to:
  /// **'Enroll to read full article'**
  String get postEnrollCta;

  /// No description provided for @postEnrollFreeCta.
  ///
  /// In en, this message translates to:
  /// **'Join for free to read full article'**
  String get postEnrollFreeCta;

  /// No description provided for @postComposeTitle.
  ///
  /// In en, this message translates to:
  /// **'Post Article'**
  String get postComposeTitle;

  /// No description provided for @postComposeHintTitle.
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get postComposeHintTitle;

  /// No description provided for @postComposeHintBody.
  ///
  /// In en, this message translates to:
  /// **'Article content...'**
  String get postComposeHintBody;

  /// No description provided for @postComposePublish.
  ///
  /// In en, this message translates to:
  /// **'Publish'**
  String get postComposePublish;

  /// No description provided for @postComposeGlobal.
  ///
  /// In en, this message translates to:
  /// **'Global announcement (GATS)'**
  String get postComposeGlobal;

  /// No description provided for @postComposeCourse.
  ///
  /// In en, this message translates to:
  /// **'Course-specific article'**
  String get postComposeCourse;

  /// No description provided for @postPublished.
  ///
  /// In en, this message translates to:
  /// **'Article published'**
  String get postPublished;

  /// No description provided for @postEmptyCourse.
  ///
  /// In en, this message translates to:
  /// **'No articles in this course yet'**
  String get postEmptyCourse;

  /// No description provided for @postMentorCompose.
  ///
  /// In en, this message translates to:
  /// **'Post to class'**
  String get postMentorCompose;

  /// No description provided for @postTimeAgo.
  ///
  /// In en, this message translates to:
  /// **'{time} ago'**
  String postTimeAgo(String time);

  /// No description provided for @homeStreakBadge.
  ///
  /// In en, this message translates to:
  /// **'🔥 {days} days'**
  String homeStreakBadge(int days);

  /// No description provided for @homeContinueLearning.
  ///
  /// In en, this message translates to:
  /// **'Continue learning'**
  String get homeContinueLearning;

  /// No description provided for @homeContinueButton.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get homeContinueButton;

  /// No description provided for @homeStatsHours.
  ///
  /// In en, this message translates to:
  /// **'Hours'**
  String get homeStatsHours;

  /// No description provided for @homeStatsLessons.
  ///
  /// In en, this message translates to:
  /// **'Lessons'**
  String get homeStatsLessons;

  /// No description provided for @homeStatsStreak.
  ///
  /// In en, this message translates to:
  /// **'Streak'**
  String get homeStatsStreak;

  /// No description provided for @homeLeaderboard.
  ///
  /// In en, this message translates to:
  /// **'Leaderboard'**
  String get homeLeaderboard;

  /// No description provided for @homeYourRank.
  ///
  /// In en, this message translates to:
  /// **'Your Rank'**
  String get homeYourRank;

  /// No description provided for @homeXpUnit.
  ///
  /// In en, this message translates to:
  /// **'XP'**
  String get homeXpUnit;

  /// No description provided for @dailyRewardTitle.
  ///
  /// In en, this message translates to:
  /// **'Daily Reward'**
  String get dailyRewardTitle;

  /// No description provided for @dailyRewardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Open app daily to claim XP!'**
  String get dailyRewardSubtitle;

  /// No description provided for @dailyRewardClaim.
  ///
  /// In en, this message translates to:
  /// **'Claim'**
  String get dailyRewardClaim;

  /// No description provided for @dailyRewardClaimed.
  ///
  /// In en, this message translates to:
  /// **'Claimed!'**
  String get dailyRewardClaimed;

  /// No description provided for @dailyRewardDay.
  ///
  /// In en, this message translates to:
  /// **'Day {day}'**
  String dailyRewardDay(int day);

  /// No description provided for @streakCalendarTitle.
  ///
  /// In en, this message translates to:
  /// **'This Week'**
  String get streakCalendarTitle;

  /// No description provided for @streakMotivation1.
  ///
  /// In en, this message translates to:
  /// **'Great! Keep it up! 🔥'**
  String get streakMotivation1;

  /// No description provided for @streakMotivation2.
  ///
  /// In en, this message translates to:
  /// **'Your streak is hot! 💪'**
  String get streakMotivation2;

  /// No description provided for @streakMotivation3.
  ///
  /// In en, this message translates to:
  /// **'Let\'s start the journey! 🚀'**
  String get streakMotivation3;

  /// No description provided for @streakBonusTask.
  ///
  /// In en, this message translates to:
  /// **'Bonus: Chat with AI Coach'**
  String get streakBonusTask;

  /// No description provided for @dailyXpToday.
  ///
  /// In en, this message translates to:
  /// **'XP today: +{xp}'**
  String dailyXpToday(int xp);

  /// No description provided for @hubRank.
  ///
  /// In en, this message translates to:
  /// **'Rank'**
  String get hubRank;

  /// No description provided for @hubAchievements.
  ///
  /// In en, this message translates to:
  /// **'Achievements'**
  String get hubAchievements;

  /// No description provided for @hubViewAll.
  ///
  /// In en, this message translates to:
  /// **'View all'**
  String get hubViewAll;

  /// No description provided for @hubRankTanBinh.
  ///
  /// In en, this message translates to:
  /// **'Novice'**
  String get hubRankTanBinh;

  /// No description provided for @hubRankHocVien.
  ///
  /// In en, this message translates to:
  /// **'Learner'**
  String get hubRankHocVien;

  /// No description provided for @hubRankThanhThao.
  ///
  /// In en, this message translates to:
  /// **'Proficient'**
  String get hubRankThanhThao;

  /// No description provided for @hubRankChuyenGia.
  ///
  /// In en, this message translates to:
  /// **'Expert'**
  String get hubRankChuyenGia;

  /// No description provided for @hubRankBacThay.
  ///
  /// In en, this message translates to:
  /// **'Master'**
  String get hubRankBacThay;

  /// No description provided for @coachWelcomeCardTitle.
  ///
  /// In en, this message translates to:
  /// **'AI Coach is ready'**
  String get coachWelcomeCardTitle;

  /// No description provided for @coachWelcomeCardBody.
  ///
  /// In en, this message translates to:
  /// **'Ask anything about your learning path, assignments, or AI concepts.'**
  String get coachWelcomeCardBody;

  /// No description provided for @coachThinking.
  ///
  /// In en, this message translates to:
  /// **'GATS Coach is thinking...'**
  String get coachThinking;

  /// No description provided for @librarySearchHint.
  ///
  /// In en, this message translates to:
  /// **'Search by title or description...'**
  String get librarySearchHint;

  /// No description provided for @libraryNoResults.
  ///
  /// In en, this message translates to:
  /// **'No courses found'**
  String get libraryNoResults;

  /// No description provided for @libraryNoResultsDesc.
  ///
  /// In en, this message translates to:
  /// **'Try another keyword or clear filters'**
  String get libraryNoResultsDesc;

  /// No description provided for @libraryGridView.
  ///
  /// In en, this message translates to:
  /// **'Grid'**
  String get libraryGridView;

  /// No description provided for @libraryListView.
  ///
  /// In en, this message translates to:
  /// **'List'**
  String get libraryListView;

  /// No description provided for @quickActionTitle.
  ///
  /// In en, this message translates to:
  /// **'Quick Actions'**
  String get quickActionTitle;

  /// No description provided for @quickActionPosts.
  ///
  /// In en, this message translates to:
  /// **'Articles'**
  String get quickActionPosts;

  /// No description provided for @quickActionSearchCourses.
  ///
  /// In en, this message translates to:
  /// **'Search Courses'**
  String get quickActionSearchCourses;

  /// No description provided for @quickActionFlashcard.
  ///
  /// In en, this message translates to:
  /// **'Study Flashcards'**
  String get quickActionFlashcard;

  /// No description provided for @quickActionCoach.
  ///
  /// In en, this message translates to:
  /// **'Coach Chat'**
  String get quickActionCoach;

  /// No description provided for @quickActionContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue Learning'**
  String get quickActionContinue;

  /// No description provided for @quickActionStore.
  ///
  /// In en, this message translates to:
  /// **'Course Store'**
  String get quickActionStore;

  /// No description provided for @quickActionHub.
  ///
  /// In en, this message translates to:
  /// **'Hub'**
  String get quickActionHub;

  /// No description provided for @courseSearchTitle.
  ///
  /// In en, this message translates to:
  /// **'Search & Filter Courses'**
  String get courseSearchTitle;

  /// No description provided for @courseSearchHint.
  ///
  /// In en, this message translates to:
  /// **'Search AI courses, programming...'**
  String get courseSearchHint;

  /// No description provided for @courseSearchResultCount.
  ///
  /// In en, this message translates to:
  /// **'{count} courses'**
  String courseSearchResultCount(int count);

  /// No description provided for @courseSearchEmpty.
  ///
  /// In en, this message translates to:
  /// **'No matching courses found.\\nTry changing keywords or filters.'**
  String get courseSearchEmpty;

  /// No description provided for @headerSubtitleHome.
  ///
  /// In en, this message translates to:
  /// **'Hello, GATS Learner'**
  String get headerSubtitleHome;

  /// No description provided for @headerSubtitleDaily.
  ///
  /// In en, this message translates to:
  /// **'Exercises & learning routine'**
  String get headerSubtitleDaily;

  /// No description provided for @headerSubtitleLibrary.
  ///
  /// In en, this message translates to:
  /// **'AI courses for office work'**
  String get headerSubtitleLibrary;

  /// No description provided for @headerSubtitleAiCoach.
  ///
  /// In en, this message translates to:
  /// **'Personalized mentor'**
  String get headerSubtitleAiCoach;

  /// No description provided for @headerSubtitleHub.
  ///
  /// In en, this message translates to:
  /// **'Progress & rewards'**
  String get headerSubtitleHub;

  /// No description provided for @headerSubtitleStore.
  ///
  /// In en, this message translates to:
  /// **'Browse and buy AI courses'**
  String get headerSubtitleStore;

  /// No description provided for @onboardingBrowseMoreCourses.
  ///
  /// In en, this message translates to:
  /// **'Browse more courses'**
  String get onboardingBrowseMoreCourses;

  /// No description provided for @storeTitle.
  ///
  /// In en, this message translates to:
  /// **'Course Store'**
  String get storeTitle;

  /// No description provided for @storeSearchHint.
  ///
  /// In en, this message translates to:
  /// **'Search courses...'**
  String get storeSearchHint;

  /// No description provided for @storePromoAI.
  ///
  /// In en, this message translates to:
  /// **'Mega Offer: 40% Off!'**
  String get storePromoAI;

  /// No description provided for @storePromoAISub.
  ///
  /// In en, this message translates to:
  /// **'Master the best workplace AI skills'**
  String get storePromoAISub;

  /// No description provided for @storeFilterTitle.
  ///
  /// In en, this message translates to:
  /// **'Search Filters'**
  String get storeFilterTitle;

  /// No description provided for @storeFilterCategory.
  ///
  /// In en, this message translates to:
  /// **'Topic / Category'**
  String get storeFilterCategory;

  /// No description provided for @storeFilterApply.
  ///
  /// In en, this message translates to:
  /// **'Apply Filters'**
  String get storeFilterApply;

  /// No description provided for @storeFeatured.
  ///
  /// In en, this message translates to:
  /// **'Featured Recommendations'**
  String get storeFeatured;

  /// No description provided for @storeBestSellers.
  ///
  /// In en, this message translates to:
  /// **'Best Sellers'**
  String get storeBestSellers;

  /// No description provided for @storeSeeAll.
  ///
  /// In en, this message translates to:
  /// **'See All'**
  String get storeSeeAll;

  /// No description provided for @storeFree.
  ///
  /// In en, this message translates to:
  /// **'Free'**
  String get storeFree;

  /// No description provided for @storeAddedToCart.
  ///
  /// In en, this message translates to:
  /// **'Added \"{title}\" to cart!'**
  String storeAddedToCart(String title);

  /// No description provided for @storeViewCart.
  ///
  /// In en, this message translates to:
  /// **'View Cart'**
  String get storeViewCart;

  /// No description provided for @storeWishlistTooltip.
  ///
  /// In en, this message translates to:
  /// **'Wishlist'**
  String get storeWishlistTooltip;

  /// No description provided for @storeCartTooltip.
  ///
  /// In en, this message translates to:
  /// **'Cart'**
  String get storeCartTooltip;

  /// No description provided for @storeHoursOfLearning.
  ///
  /// In en, this message translates to:
  /// **'{hours} hours of learning'**
  String storeHoursOfLearning(int hours);

  /// No description provided for @storeReviewsCount.
  ///
  /// In en, this message translates to:
  /// **'({count} reviews)'**
  String storeReviewsCount(int count);

  /// No description provided for @storeCourseDetailTitle.
  ///
  /// In en, this message translates to:
  /// **'Course Details'**
  String get storeCourseDetailTitle;

  /// No description provided for @storeSyllabusTitle.
  ///
  /// In en, this message translates to:
  /// **'Syllabus ({count} lectures)'**
  String storeSyllabusTitle(int count);

  /// No description provided for @storeSyllabusPreviewNote.
  ///
  /// In en, this message translates to:
  /// **'Purchase the course to unlock all lectures, quizzes, and group chat.'**
  String get storeSyllabusPreviewNote;

  /// No description provided for @storeLecturePreview.
  ///
  /// In en, this message translates to:
  /// **'Preview'**
  String get storeLecturePreview;

  /// No description provided for @storePurchased.
  ///
  /// In en, this message translates to:
  /// **'Purchased'**
  String get storePurchased;

  /// No description provided for @storeReviewsTitle.
  ///
  /// In en, this message translates to:
  /// **'Student Reviews'**
  String get storeReviewsTitle;

  /// No description provided for @storeAddToCart.
  ///
  /// In en, this message translates to:
  /// **'Add to Cart'**
  String get storeAddToCart;

  /// No description provided for @storeAddedSeatsToCart.
  ///
  /// In en, this message translates to:
  /// **'Added {seats} seats of \"{title}\" to cart!'**
  String storeAddedSeatsToCart(int seats, String title);

  /// No description provided for @storeCourseNotFound.
  ///
  /// In en, this message translates to:
  /// **'Course not found'**
  String get storeCourseNotFound;

  /// No description provided for @cartTitle.
  ///
  /// In en, this message translates to:
  /// **'My Cart'**
  String get cartTitle;

  /// No description provided for @cartEmptyTitle.
  ///
  /// In en, this message translates to:
  /// **'Your Cart is Empty'**
  String get cartEmptyTitle;

  /// No description provided for @cartEmptyDesc.
  ///
  /// In en, this message translates to:
  /// **'Explore the store and pick the best courses for yourself!'**
  String get cartEmptyDesc;

  /// No description provided for @cartContinueShopping.
  ///
  /// In en, this message translates to:
  /// **'Continue Shopping'**
  String get cartContinueShopping;

  /// No description provided for @cartTotal.
  ///
  /// In en, this message translates to:
  /// **'Total'**
  String get cartTotal;

  /// No description provided for @cartCheckout.
  ///
  /// In en, this message translates to:
  /// **'Proceed to Checkout'**
  String get cartCheckout;

  /// No description provided for @wishlistTitle.
  ///
  /// In en, this message translates to:
  /// **'My Wishlist'**
  String get wishlistTitle;

  /// No description provided for @wishlistEmptyTitle.
  ///
  /// In en, this message translates to:
  /// **'No Wishlist Items Yet'**
  String get wishlistEmptyTitle;

  /// No description provided for @wishlistEmptyDesc.
  ///
  /// In en, this message translates to:
  /// **'Explore the store and tap the heart to save your favorite courses!'**
  String get wishlistEmptyDesc;

  /// No description provided for @wishlistAddAll.
  ///
  /// In en, this message translates to:
  /// **'Add All to Cart'**
  String get wishlistAddAll;

  /// No description provided for @wishlistAllAdded.
  ///
  /// In en, this message translates to:
  /// **'Added all wishlist courses to cart!'**
  String get wishlistAllAdded;

  /// No description provided for @checkoutSuccessTitle.
  ///
  /// In en, this message translates to:
  /// **'Checkout Successful!'**
  String get checkoutSuccessTitle;

  /// No description provided for @checkoutSuccessDesc.
  ///
  /// In en, this message translates to:
  /// **'Congratulations on owning your new courses. Let\'s start your learning path today!'**
  String get checkoutSuccessDesc;

  /// No description provided for @checkoutStartLearning.
  ///
  /// In en, this message translates to:
  /// **'Start Learning Now'**
  String get checkoutStartLearning;

  /// No description provided for @paymentTitle.
  ///
  /// In en, this message translates to:
  /// **'Payment'**
  String get paymentTitle;

  /// No description provided for @paymentChooseMethod.
  ///
  /// In en, this message translates to:
  /// **'Choose payment method'**
  String get paymentChooseMethod;

  /// No description provided for @paymentOrderSummary.
  ///
  /// In en, this message translates to:
  /// **'Order summary'**
  String get paymentOrderSummary;

  /// No description provided for @paymentItemCount.
  ///
  /// In en, this message translates to:
  /// **'{count} item(s) in cart'**
  String paymentItemCount(int count);

  /// No description provided for @paymentPayNow.
  ///
  /// In en, this message translates to:
  /// **'Pay now'**
  String get paymentPayNow;

  /// No description provided for @paymentPayWithApple.
  ///
  /// In en, this message translates to:
  /// **'Pay with Apple Pay'**
  String get paymentPayWithApple;

  /// No description provided for @paymentApplePayHint.
  ///
  /// In en, this message translates to:
  /// **'Confirm with Face ID, Touch ID or passcode on your Apple device.'**
  String get paymentApplePayHint;

  /// No description provided for @paymentMomoHint.
  ///
  /// In en, this message translates to:
  /// **'You will be redirected to the MoMo app to complete payment.'**
  String get paymentMomoHint;

  /// No description provided for @paymentVnpayHint.
  ///
  /// In en, this message translates to:
  /// **'You will be redirected to VNPay secure gateway.'**
  String get paymentVnpayHint;

  /// No description provided for @paymentRedirectNote.
  ///
  /// In en, this message translates to:
  /// **'Mock payment — real gateway integration coming soon.'**
  String get paymentRedirectNote;

  /// No description provided for @paymentQrHint.
  ///
  /// In en, this message translates to:
  /// **'Scan QR with your banking app'**
  String get paymentQrHint;

  /// No description provided for @paymentQrScanNote.
  ///
  /// In en, this message translates to:
  /// **'Supports VietQR · Napas247 · most Vietnamese banks'**
  String get paymentQrScanNote;

  /// No description provided for @paymentSecureNote.
  ///
  /// In en, this message translates to:
  /// **'Your payment information is encrypted and secure.'**
  String get paymentSecureNote;

  /// No description provided for @paymentCardDetails.
  ///
  /// In en, this message translates to:
  /// **'Card details'**
  String get paymentCardDetails;

  /// No description provided for @paymentCardNumber.
  ///
  /// In en, this message translates to:
  /// **'Card number'**
  String get paymentCardNumber;

  /// No description provided for @paymentCardName.
  ///
  /// In en, this message translates to:
  /// **'Name on card'**
  String get paymentCardName;

  /// No description provided for @paymentCardExpiry.
  ///
  /// In en, this message translates to:
  /// **'MM/YY'**
  String get paymentCardExpiry;

  /// No description provided for @paymentCardCvv.
  ///
  /// In en, this message translates to:
  /// **'CVV'**
  String get paymentCardCvv;

  /// No description provided for @mentorSearchHint.
  ///
  /// In en, this message translates to:
  /// **'Search assigned courses...'**
  String get mentorSearchHint;

  /// No description provided for @adminStatusPublished.
  ///
  /// In en, this message translates to:
  /// **'Published'**
  String get adminStatusPublished;

  /// No description provided for @adminStatusDraft.
  ///
  /// In en, this message translates to:
  /// **'Draft'**
  String get adminStatusDraft;

  /// No description provided for @adminGroupChatLabel.
  ///
  /// In en, this message translates to:
  /// **'Group Chat'**
  String get adminGroupChatLabel;

  /// No description provided for @adminMentorLabel.
  ///
  /// In en, this message translates to:
  /// **'Mentor'**
  String get adminMentorLabel;

  /// No description provided for @adminAssignedCourses.
  ///
  /// In en, this message translates to:
  /// **'Assigned courses: {courses}'**
  String adminAssignedCourses(String courses);

  /// No description provided for @quizCountLabel.
  ///
  /// In en, this message translates to:
  /// **'{count} questions'**
  String quizCountLabel(int count);

  /// No description provided for @reportMinsPerWeek.
  ///
  /// In en, this message translates to:
  /// **'Learning mins/week'**
  String get reportMinsPerWeek;

  /// No description provided for @reportStreakDays.
  ///
  /// In en, this message translates to:
  /// **'Streak days'**
  String get reportStreakDays;

  /// No description provided for @reportStrengths.
  ///
  /// In en, this message translates to:
  /// **'Strengths'**
  String get reportStrengths;

  /// No description provided for @reportImprovement.
  ///
  /// In en, this message translates to:
  /// **'Areas to improve'**
  String get reportImprovement;

  /// No description provided for @reportReviewSuggestions.
  ///
  /// In en, this message translates to:
  /// **'Review Suggestions'**
  String get reportReviewSuggestions;

  /// No description provided for @coursePercentCompleted.
  ///
  /// In en, this message translates to:
  /// **'{percent}% completed'**
  String coursePercentCompleted(int percent);

  /// No description provided for @courseLessonsCount.
  ///
  /// In en, this message translates to:
  /// **'{lessons} lessons'**
  String courseLessonsCount(int lessons);

  /// No description provided for @filterAll.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get filterAll;

  /// No description provided for @filterOfficeAi.
  ///
  /// In en, this message translates to:
  /// **'AI for Office'**
  String get filterOfficeAi;

  /// No description provided for @filterProgramming.
  ///
  /// In en, this message translates to:
  /// **'Programming'**
  String get filterProgramming;

  /// No description provided for @filterMarketing.
  ///
  /// In en, this message translates to:
  /// **'Marketing'**
  String get filterMarketing;

  /// No description provided for @filterLanguages.
  ///
  /// In en, this message translates to:
  /// **'Languages'**
  String get filterLanguages;

  /// No description provided for @filterSoftSkills.
  ///
  /// In en, this message translates to:
  /// **'Soft Skills'**
  String get filterSoftSkills;

  /// No description provided for @filterAutomation.
  ///
  /// In en, this message translates to:
  /// **'Automation'**
  String get filterAutomation;

  /// No description provided for @chipAll.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get chipAll;

  /// No description provided for @chipLearning.
  ///
  /// In en, this message translates to:
  /// **'Learning'**
  String get chipLearning;

  /// No description provided for @chipNew.
  ///
  /// In en, this message translates to:
  /// **'New'**
  String get chipNew;

  /// No description provided for @chipFree.
  ///
  /// In en, this message translates to:
  /// **'Free'**
  String get chipFree;

  /// No description provided for @notificationsScreenTitle.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notificationsScreenTitle;

  /// No description provided for @notificationsToday.
  ///
  /// In en, this message translates to:
  /// **'Today'**
  String get notificationsToday;

  /// No description provided for @notificationsYesterday.
  ///
  /// In en, this message translates to:
  /// **'Yesterday'**
  String get notificationsYesterday;

  /// No description provided for @notificationsTestSection.
  ///
  /// In en, this message translates to:
  /// **'Test notifications'**
  String get notificationsTestSection;

  /// No description provided for @notificationsTestBanner.
  ///
  /// In en, this message translates to:
  /// **'In-app banner'**
  String get notificationsTestBanner;

  /// No description provided for @notificationsTestPush.
  ///
  /// In en, this message translates to:
  /// **'System push now'**
  String get notificationsTestPush;

  /// No description provided for @notificationsTestPushDelayed.
  ///
  /// In en, this message translates to:
  /// **'Push in 5 seconds'**
  String get notificationsTestPushDelayed;

  /// No description provided for @notificationsTestHint.
  ///
  /// In en, this message translates to:
  /// **'Tap \"Push in 5 seconds\" then minimize the app to see it in the status bar.'**
  String get notificationsTestHint;

  /// No description provided for @notificationsPermissionDenied.
  ///
  /// In en, this message translates to:
  /// **'Permission denied. Enable notifications in system Settings.'**
  String get notificationsPermissionDenied;

  /// No description provided for @notificationsTestScheduled.
  ///
  /// In en, this message translates to:
  /// **'Push in 5 seconds — minimize the app now!'**
  String get notificationsTestScheduled;

  /// No description provided for @notificationsTestSent.
  ///
  /// In en, this message translates to:
  /// **'Test notification sent.'**
  String get notificationsTestSent;

  /// No description provided for @notificationsEmpty.
  ///
  /// In en, this message translates to:
  /// **'No notifications yet'**
  String get notificationsEmpty;

  /// No description provided for @headerSubtitleNotifications.
  ///
  /// In en, this message translates to:
  /// **'News & learning reminders'**
  String get headerSubtitleNotifications;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'vi'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'vi':
      return AppLocalizationsVi();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
