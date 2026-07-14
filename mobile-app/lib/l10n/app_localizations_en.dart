// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'GATS Academy';

  @override
  String get onboardingNext => 'Next';

  @override
  String get onboardingFinish => 'See recommendations';

  @override
  String get onboardingTitleLanguage => 'Choose your language';

  @override
  String get onboardingTitleReferral => 'Where did you hear about GATS?';

  @override
  String get onboardingTitleLevel => 'What is your AI level?';

  @override
  String get onboardingTitleProfile => 'What best describes you?';

  @override
  String get onboardingTitleMotivation => 'What motivates you to learn AI?';

  @override
  String get onboardingTitleInterests =>
      'Which AI skills do you want to master?';

  @override
  String get onboardingTitleAge => 'What is your age range?';

  @override
  String get onboardingTitleDailyGoal =>
      'How long do you want to learn each day?';

  @override
  String get onboardingTitlePurpose => 'What is your learning goal?';

  @override
  String get onboardingTitleReminder => 'Daily learning reminder';

  @override
  String get onboardingSubtitleReminder =>
      'We\'ll nudge you at the time you pick — you can change this in Settings';

  @override
  String get onboardingCoachReminder =>
      'Consistency beats intensity. Pick a time that works every day!';

  @override
  String get onboardingReminderEnable => 'Enable daily reminder';

  @override
  String get onboardingReminderNoThanks => 'No thanks';

  @override
  String get onboardingReminderContinue => 'Continue';

  @override
  String ackReminderEcho(String time) {
    return 'Reminder at $time — see you then!';
  }

  @override
  String get ackReminderSkippedEcho =>
      'No problem — you can turn reminders on later in Settings.';

  @override
  String get dailyReminderTitle => 'GATS Academy';

  @override
  String get dailyReminderBody =>
      'Time to learn! Check in and keep your streak going.';

  @override
  String get onboardingSubtitleLanguage =>
      'You can change this later in Settings';

  @override
  String get languagePickerTitle => 'Choose your language';

  @override
  String get languagePickerSubtitle => 'You can change this later in Settings';

  @override
  String get languagePickerContinue => 'Continue';

  @override
  String get welcomeHeadline => 'Learn Practical AI';

  @override
  String get welcomeBody => 'Interactive practice to build real AI skills.';

  @override
  String get entryContinue => 'Continue';

  @override
  String get entrySignIn => 'Sign in';

  @override
  String get onboardingIntroCoach =>
      'Let\'s build a learning path just for you.';

  @override
  String get onboardingSubtitleReferral => 'Help us make GATS better for you';

  @override
  String get onboardingSubtitleLevel =>
      'Pick the closest match - there is no wrong answer';

  @override
  String get onboardingSubtitleProfile =>
      'This helps us understand your learning context';

  @override
  String get onboardingSubtitleMotivation =>
      'Motivation helps you stay consistent';

  @override
  String get onboardingSubtitleInterests =>
      'Choose one or more - you can update this later';

  @override
  String get onboardingSubtitleAge => 'This helps us tune content and pacing';

  @override
  String get onboardingSubtitleDailyGoal =>
      'Start small and build up as you go';

  @override
  String get onboardingSubtitlePurpose =>
      'Your roadmap will adapt to this goal';

  @override
  String get onboardingCoachLanguage =>
      'First, choose the language you feel most comfortable learning in.';

  @override
  String get onboardingCoachReferral =>
      'Where did you first hear about GATS Academy?';

  @override
  String get onboardingCoachLevel =>
      'Where are you with AI right now? It is totally fine to be new!';

  @override
  String get onboardingCoachProfile =>
      'Tell me what you do so I can shape the roadmap around you.';

  @override
  String get onboardingCoachMotivation =>
      'What brought you here? I want to understand your motivation.';

  @override
  String get onboardingCoachInterests =>
      'Pick every skill you want to improve - the more signal, the better.';

  @override
  String get onboardingCoachAge =>
      'Knowing your age range helps me recommend a better pace.';

  @override
  String get onboardingCoachDailyGoal =>
      'A small daily goal is how consistency turns into progress.';

  @override
  String get onboardingCoachPurpose =>
      'A clear goal makes the roadmap sharper.';

  @override
  String get languageEnglish => 'English';

  @override
  String get languageVietnamese => 'Tiếng Việt';

  @override
  String get languageEnglishSubtitle => 'Displayed in English';

  @override
  String get languageVietnameseSubtitle => 'Displayed in Vietnamese';

  @override
  String get referralTiktok => 'TikTok';

  @override
  String get referralFacebook => 'Facebook';

  @override
  String get referralYoutube => 'YouTube';

  @override
  String get referralFriend => 'A friend recommended it';

  @override
  String get referralSearch => 'Google / search';

  @override
  String get referralOther => 'Somewhere else';

  @override
  String get skillBeginner => 'Beginner';

  @override
  String get skillIntermediate => 'Intermediate';

  @override
  String get skillAdvanced => 'Advanced';

  @override
  String get skillBeginnerSubtitle => 'New to AI';

  @override
  String get skillIntermediateSubtitle => 'Used ChatGPT basics';

  @override
  String get skillAdvancedSubtitle => 'Want workflows and automation';

  @override
  String get profileStudent => 'Student';

  @override
  String get profileOfficeWorker => 'Office worker';

  @override
  String get profileFreelancer => 'Freelancer';

  @override
  String get profileOther => 'Other';

  @override
  String get profileStudentSubtitle => 'College or university learner';

  @override
  String get profileOfficeWorkerSubtitle => 'Working at a company or office';

  @override
  String get profileFreelancerSubtitle => 'Independent, remote, or solo work';

  @override
  String get profileOtherSubtitle => 'Not in the groups above';

  @override
  String get motivationCareer => 'Career growth';

  @override
  String get motivationIncome => 'Increase income';

  @override
  String get motivationKeepUp => 'Do not fall behind';

  @override
  String get motivationCuriosity => 'Curious to explore';

  @override
  String get motivationCareerSubtitle => 'Open new opportunities at work';

  @override
  String get motivationIncomeSubtitle => 'Earn more from AI skills';

  @override
  String get motivationKeepUpSubtitle => 'Keep up with technology trends';

  @override
  String get motivationCuriositySubtitle =>
      'Learn because it feels interesting';

  @override
  String get interestChatbot => 'ChatGPT & chatbots';

  @override
  String get interestContentWriting => 'Content writing';

  @override
  String get interestDataAnalysis => 'Data analysis';

  @override
  String get interestImageGen => 'AI image generation';

  @override
  String get interestAutomation => 'Automation';

  @override
  String get interestCoding => 'Coding with AI';

  @override
  String get ageUnder25 => 'Under 25';

  @override
  String get age26to35 => '26 - 35';

  @override
  String get age36to45 => '36 - 45';

  @override
  String get ageAbove45 => 'Above 45';

  @override
  String get dailyGoalCasual => '5 minutes / day';

  @override
  String get dailyGoalRegular => '10 minutes / day';

  @override
  String get dailyGoalSerious => '15 minutes / day';

  @override
  String get dailyGoalIntense => '30 minutes / day';

  @override
  String get dailyGoalCasualCaption => 'Casual';

  @override
  String get dailyGoalRegularCaption => 'Steady';

  @override
  String get dailyGoalSeriousCaption => 'Serious';

  @override
  String get dailyGoalIntenseCaption => 'Breakthrough';

  @override
  String get purposeOfficeWork => 'AI for office work';

  @override
  String get purposeSkillUpgrade => 'Upgrade my skills';

  @override
  String get purposeCareerChange => 'Change careers / find a job';

  @override
  String get purposePersonalInterest => 'Personal interest';

  @override
  String get ackHeadline => 'Saved!';

  @override
  String get ackHeadlineGreat => 'Great!';

  @override
  String get ackHeadlineNoted => 'Got it!';

  @override
  String get ackHeadlineMilestone => 'You are halfway there!';

  @override
  String get ackHeadlineCommitment => 'Excellent commitment!';

  @override
  String get ackAnalyzingHeadline => 'Analyzing...';

  @override
  String get ackLanguageEchoEnglish =>
      'English - your learning language is set';

  @override
  String get ackLanguageEchoVietnamese =>
      'Tiếng Việt - your learning language is set';

  @override
  String ackReferralEcho(String value) {
    return '$value - thanks for finding GATS';
  }

  @override
  String ackLevelEcho(String value) {
    return '$value - I will tune your learning pace';
  }

  @override
  String ackProfileEcho(String value) {
    return '$value - your context is saved';
  }

  @override
  String ackMotivationEcho(String value) {
    return '$value - that is a meaningful motivation!';
  }

  @override
  String ackInterestsEcho(int count) {
    return '$count skills selected - I will prioritize these';
  }

  @override
  String ackAgeEcho(String value) {
    return '$value - saved, thank you!';
  }

  @override
  String ackDailyGoalEcho(String value) {
    return '$value - I will keep lessons bite-sized';
  }

  @override
  String ackPurposeEcho(String value) {
    return '$value - analyzing matching courses';
  }

  @override
  String get ackSocialReferral => 'Join 10,000+ learners studying AI every day';

  @override
  String get ackSocialMilestone => '92% of learners complete this setup';

  @override
  String get ackSocialDailyGoal => 'Daily learning can improve retention by 3x';

  @override
  String get onboardingResultsCongratsTitle => 'Congratulations!';

  @override
  String get onboardingCoachResult =>
      'Great! I found the right courses for you.';

  @override
  String onboardingResultHeadline(int count) {
    return 'We found $count matching courses';
  }

  @override
  String get onboardingResultSubtitle => 'Based on your answers';

  @override
  String onboardingMatchBadge(int percent) {
    return '$percent% match';
  }

  @override
  String get course1Title => 'AI for Office Workers';

  @override
  String get course1Description => 'From zero to AI mastery in daily work';

  @override
  String get course1Tag => 'AI for the workplace';

  @override
  String get course2Title => 'Prompt Engineering';

  @override
  String get course2Description =>
      'Write professional prompts for every situation';

  @override
  String get course2Tag => 'AI for the workplace';

  @override
  String get course3Title => 'Automation with AI';

  @override
  String get course3Description => 'Build workflows that save hours every week';

  @override
  String get course3Tag => 'Automation';

  @override
  String get aiCoachName => 'GATS Coach';

  @override
  String get rateUsAppBarTitle => 'Reviews';

  @override
  String rateUsBasedOnReviews(String count) {
    return 'Based on $count reviews';
  }

  @override
  String get reviewFilterExcellent => 'Excellent';

  @override
  String get reviewFilterGood => 'Good';

  @override
  String get reviewFilterAverage => 'Average';

  @override
  String get reviewFilterNeedsImprovement => 'Needs improvement';

  @override
  String get rateUsContextLine =>
      'You just received a personal AI roadmap — see what other learners say';

  @override
  String get rateUsNoReviewsForFilter => 'No reviews in this group yet';

  @override
  String get rateUsLater => 'Later';

  @override
  String get reviewDialogTitle => 'Would you mind rating GATS Academy?';

  @override
  String get reviewDialogBody =>
      'Your feedback helps us improve the AI learning experience for office workers.';

  @override
  String get reviewDialogRate => 'Rate';

  @override
  String get reviewDialogNoThanks => 'No, thanks';

  @override
  String get loadingCongratsBody => 'Your learning roadmap is ready';

  @override
  String get loadingPersonalizing => 'Analyzing your learning goals';

  @override
  String get loadingCourses => 'Matching the right courses';

  @override
  String get loadingFlashcards => 'Creating today\'s flashcards';

  @override
  String get loadingReady => 'Ready to start!';

  @override
  String get review1Body =>
      'A clear AI roadmap I could apply to office work right away.';

  @override
  String get review1TimeAgo => '2 weeks ago';

  @override
  String get review2Body =>
      'Flashcards and quizzes help me remember prompts faster. AI Coach suggests great lessons.';

  @override
  String get review2TimeAgo => '1 month ago';

  @override
  String get review3Body =>
      'The Prompt Engineering course is easy to follow. Mentors reply quickly in the group chat.';

  @override
  String get review3TimeAgo => '3 weeks ago';

  @override
  String get review4Body =>
      'Solid app — hoping for more Excel + AI practice exercises.';

  @override
  String get review4TimeAgo => '1 week ago';

  @override
  String get courseLandingLearnOutcomes => 'What you\'ll learn';

  @override
  String get courseLandingAbout => 'About this course';

  @override
  String get courseLandingCurriculum => 'Course content';

  @override
  String courseLandingLessonCount(int count) {
    return '$count lessons';
  }

  @override
  String get courseLandingPreviewFree => 'Free preview';

  @override
  String get courseLandingRequirements => 'Requirements';

  @override
  String courseLandingStudents(int count) {
    return '$count students';
  }

  @override
  String courseLandingLastUpdated(String date) {
    return 'Updated $date';
  }

  @override
  String durationMinutes(int minutes) {
    return '$minutes min';
  }

  @override
  String durationHours(int hours) {
    return '$hours hr';
  }

  @override
  String durationHoursMinutes(int hours, int minutes) {
    return '$hours hr $minutes min';
  }

  @override
  String get splashTagline => 'AI FOR THE WORKPLACE';

  @override
  String get authPostOnboardingTitle =>
      'Sign up for free to discover your learning path';

  @override
  String get authPostOnboardingSkip => 'Continue without signing in';

  @override
  String get authContinueEmail => 'Continue with email';

  @override
  String get authEmailLabel => 'Email';

  @override
  String get authPasswordLabel => 'Password';

  @override
  String get authForgotPassword => 'Forgot password?';

  @override
  String get authLoginButton => 'Sign in';

  @override
  String get authSignUpButton => 'Sign up';

  @override
  String get authLoginTitle => 'Sign in now!';

  @override
  String get authLoginSubtitle => 'Sign in to continue your courses';

  @override
  String get authSignUpTitle => 'Create your account!';

  @override
  String get authSignUpSubtitle => 'Start your AI learning journey with GATS';

  @override
  String get authRememberMe => 'Remember me';

  @override
  String get authOrContinueWith => 'Or continue with';

  @override
  String get authNoAccount => 'Don\'t have an account?';

  @override
  String get authHasAccount => 'Already have an account?';

  @override
  String get authSignUpLink => 'SIGN UP';

  @override
  String get authSignInLink => 'SIGN IN';

  @override
  String get authGoogle => 'Google';

  @override
  String get authApple => 'Apple';

  @override
  String get authMomo => 'MoMo';

  @override
  String get authOrDivider => 'or';

  @override
  String get authMockNotice =>
      'Mock auth — use a demo account below or any email (defaults to learner).';

  @override
  String get authDemoAccounts => 'Demo accounts';

  @override
  String get authSignOut => 'Sign out';

  @override
  String get authNotSignedIn =>
      'Not signed in — please log in with your account';

  @override
  String authSignedInAs(String identity) {
    return 'Signed in as: $identity';
  }

  @override
  String authRoleLabel(String role) {
    return 'Role: $role';
  }

  @override
  String get comingSoon => 'Coming soon';

  @override
  String get roleGuest => 'Guest';

  @override
  String get roleUser => 'Learner';

  @override
  String get roleMentor => 'Mentor';

  @override
  String get roleAdmin => 'Admin';

  @override
  String get authMethodEmail => 'Email';

  @override
  String get authMethodDemo => 'Demo';

  @override
  String get authDefaultDisplayName => 'GATS Learner';

  @override
  String authErrorWrongDemoPassword(String password) {
    return 'Demo password: $password';
  }

  @override
  String get authErrorInvalidEmail => 'Please enter a valid email';

  @override
  String get authErrorPasswordTooShortLogin =>
      'Password must be at least 4 characters';

  @override
  String get authErrorPasswordTooShortSignup =>
      'Sign-up password must be at least 6 characters';

  @override
  String get authTabSignIn => 'Sign in';

  @override
  String get authTabSignUp => 'Sign up';

  @override
  String get authFullNameLabel => 'Full name';

  @override
  String get authConfirmPasswordLabel => 'Confirm password';

  @override
  String get authPasswordHintSignup => 'At least 6 characters';

  @override
  String get authAgreeTerms => 'I agree to the Terms & Conditions';

  @override
  String get authErrorNameRequired => 'Please enter your name';

  @override
  String get authErrorPasswordMismatch => 'Passwords do not match';

  @override
  String get authErrorTermsRequired => 'Please accept the Terms & Conditions';

  @override
  String get authExistingUserPrompt => 'Existing user?';

  @override
  String get authFirstNameLabel => 'First name';

  @override
  String get authLastNameLabel => 'Last name';

  @override
  String get authAgeLabel => 'Age';

  @override
  String get authLegalSignUpPrefix =>
      'By tapping \'Sign up\', I agree to GATS Academy\'s ';

  @override
  String get authTermsLink => 'Terms';

  @override
  String get authLegalSignUpMiddle => ' and ';

  @override
  String get authPrivacyLink => 'Privacy Policy';

  @override
  String get authErrorFirstNameRequired => 'Please enter your first name';

  @override
  String get authErrorLastNameRequired => 'Please enter your last name';

  @override
  String get authErrorAgeRequired => 'Please enter your age';

  @override
  String get authErrorAgeInvalid => 'Please enter a valid age';

  @override
  String get authErrorNetwork =>
      'Network error. Check your connection and try again.';

  @override
  String get authErrorUnauthorized => 'Invalid email or password';

  @override
  String get authErrorServer => 'Something went wrong. Please try again.';

  @override
  String get authSocialCancelled => 'Sign-in cancelled';

  @override
  String get authSocialTokenMissing =>
      'Could not get a token from the provider. Check OAuth setup.';

  @override
  String get authSocialFailed => 'Social sign-in failed';

  @override
  String get authSocialGoogleConfigHint =>
      'Google Sign-In is misconfigured. In Google Cloud Console, create a Web application OAuth client, copy its Client ID to GOOGLE_SERVER_CLIENT_ID (.env) and default_web_client_id (strings.xml). Android (package + SHA-1) and Web clients must be in the same project.';

  @override
  String get authRegisterSuccessVerify =>
      'Account created. Enter the verification code from your email.';

  @override
  String get authVerifyEmailTitle => 'Verify your email';

  @override
  String get authVerifyEmailSubtitle =>
      'Paste the verification token sent to your inbox.';

  @override
  String get authVerifyEmailTokenLabel => 'Verification token';

  @override
  String get authVerifyEmailButton => 'Verify and continue';

  @override
  String get entryGreeting => 'Hello ;)';

  @override
  String get entrySubtitle => 'Are you ready to learn AI?';

  @override
  String get entryStart => 'Start';

  @override
  String get languagePickerVietnamese => 'Tiếng Việt';

  @override
  String get languagePickerEnglish => 'English';

  @override
  String get languagePickerVietnameseHint => 'Displayed in Vietnamese';

  @override
  String get languagePickerEnglishHint => 'Displayed in English';

  @override
  String get entrySkip => 'Skip';

  @override
  String get entryGuestHint => 'Want to explore first?';

  @override
  String get welcomeTitle => 'MASTER AI';

  @override
  String get welcomeSubtitle =>
      'Learn AI step-by-step — unlock your office future';

  @override
  String get welcomeTagline => 'Transform your skills — anytime, anywhere';

  @override
  String get authTabLogin => 'Sign In';

  @override
  String get navHome => 'Home';

  @override
  String get navDaily => 'Daily';

  @override
  String get navLibrary => 'Library';

  @override
  String get navCoach => 'Coach';

  @override
  String get navHub => 'Hub';

  @override
  String get navStore => 'Store';

  @override
  String get tabRoadmap => 'Roadmap';

  @override
  String get tabQuiz => 'Quiz';

  @override
  String get tabAiReport => 'AI Report';

  @override
  String homeGreeting(String name) {
    return 'Hello, $name';
  }

  @override
  String get homeSubtitle => 'What do you want to learn today?';

  @override
  String get homePromoTitle => 'Continue learning AI';

  @override
  String get homePromoSubtitle => 'Complete the Basic Prompt module today';

  @override
  String get homePromoBadge => 'LEARNING';

  @override
  String get homeCategories => 'Categories';

  @override
  String get homePopularCourses => 'Popular Courses';

  @override
  String get homeFeaturedPosts => 'Featured Articles';

  @override
  String get homeLearningTools => 'Learning & Progress';

  @override
  String get homeMyCourses => 'My Courses';

  @override
  String get homeYourCourses => 'Your Courses';

  @override
  String get homeYourCoursesEmpty => 'You haven\'t purchased any courses yet.';

  @override
  String get homeYourCoursesBrowse => 'Browse store';

  @override
  String get seeAll => 'See all';

  @override
  String get libraryFilterAll => 'All';

  @override
  String get libraryFilterOngoing => 'Ongoing';

  @override
  String get libraryFilterDone => 'Completed';

  @override
  String get libraryAllCourses => 'All Courses';

  @override
  String get statusNotStarted => 'Not started';

  @override
  String get statusInProgress => 'In progress';

  @override
  String get statusCompleted => 'Completed';

  @override
  String get continueLearning => 'Continue learning';

  @override
  String get continueButton => 'Continue';

  @override
  String get quizEmptyTitle => 'No quizzes yet';

  @override
  String get quizEmptyDesc =>
      'Quizzes will appear as you study courses (every 10-15 minutes).';

  @override
  String get exploreLibrary => 'Explore library';

  @override
  String get dailyTasksTitle => 'Today\'s Tasks';

  @override
  String get dailyRoutineTitle => 'Daily Routine';

  @override
  String get routineEdit => 'Edit';

  @override
  String get routineEditorTitle => 'Design Routine';

  @override
  String get routineSave => 'Save';

  @override
  String get routineAddNode => 'Add node';

  @override
  String get routineEditorHint =>
      'Drag node · Tap right port to connect · Hold to delete';

  @override
  String get routineConnectHint => 'Tap left port of target node to connect';

  @override
  String get routineCancelConnect => 'Cancel';

  @override
  String get routinePreviewSubtitle => 'Personal learning workflow — n8n style';

  @override
  String get flashcardSectionTitle => 'Study Flashcards';

  @override
  String flashcardDue(int count) {
    return '$count cards to review today';
  }

  @override
  String get startFlashcard => 'Start studying';

  @override
  String get vpsBanner =>
      'Want to automate your routine? Contact us to rent a company VPS.';

  @override
  String get flashcardTapFlip => 'Tap to flip';

  @override
  String get flashcardUnknown => 'Not memorized';

  @override
  String get flashcardKnown => 'Memorized';

  @override
  String get flashcardSessionDone => 'Session completed!';

  @override
  String flashcardXpEarned(int xp) {
    return '+$xp XP';
  }

  @override
  String get libraryEmptyTitle => 'Courses coming soon';

  @override
  String get libraryEmptyDesc =>
      'AI courses library for office workers is being prepared.';

  @override
  String get featuredCourse => 'Featured';

  @override
  String get aiCoachWelcome =>
      'Hello! I am your AI Coach. I will assist you based on your learning progress.';

  @override
  String get aiCoachMockReply =>
      'I am analyzing your learning progress. Please continue completing the active module!';

  @override
  String get aiCoachInputHint => 'Ask AI Coach...';

  @override
  String get hubXpTitle => 'Experience';

  @override
  String get hubBadgesTitle => 'Badges';

  @override
  String get hubCertTitle => 'Certificates';

  @override
  String hubCertLocked(int xp) {
    return 'Need $xp more XP to unlock certificate exam';
  }

  @override
  String get hubCertReady =>
      'You have enough XP! Ready for the certificate exam.';

  @override
  String get hubCertButton => 'Start certificate exam';

  @override
  String get settingsTitle => 'Settings';

  @override
  String get settingsAccount => 'Account';

  @override
  String get settingsNotifications => 'Notifications';

  @override
  String get settingsLanguage => 'Language';

  @override
  String get settingsDarkMode => 'Dark Mode';

  @override
  String get settingsDarkModeSubtitle => 'Starry night — sleep app style';

  @override
  String get settingsAbout => 'About App';

  @override
  String get settingsReplayOnboarding => 'Reset onboarding';

  @override
  String get settingsSignOutSuccess =>
      'Signed out. Restart the app to return to entry screen.';

  @override
  String get settingsReplaySuccess =>
      'Onboarding reset. Restart the app to replay the flow.';

  @override
  String get tagOfficeAi => 'AI for workplace';

  @override
  String streakDays(int days) {
    return '$days days streak';
  }

  @override
  String get onboardingWelcome => 'Welcome to GATS Academy';

  @override
  String get onboardingSubtitle => 'Tell us more about yourself';

  @override
  String get onboardingStart => 'Start';

  @override
  String get onboardingSkip => 'Skip';

  @override
  String get onboardingWelcomeSlide1Title => 'Personalized AI roadmap';

  @override
  String get onboardingWelcomeSlide1Body =>
      'Courses are suggested based on your level and goals — no waste of time.';

  @override
  String get onboardingWelcomeSlide2Title => 'Daily practice with flashcards';

  @override
  String get onboardingWelcomeSlide2Body =>
      'Review short, remember long. Just a few minutes a day is enough to progress.';

  @override
  String get onboardingWelcomeSlide3Title => 'AI Coach 24/7 companion';

  @override
  String get onboardingWelcomeSlide3Body =>
      'Q&A, lesson recommendations and progress tracking — always ready when you need.';

  @override
  String get onboardingCoachWelcome =>
      'Hi! I am GATS Coach. Let\'s design your roadmap together!';

  @override
  String get onboardingReferralTitle => 'Where did you hear about GATS?';

  @override
  String get onboardingReferralSubtitle => 'Help us serve you better';

  @override
  String get onboardingLevelTitle => 'What is your AI level?';

  @override
  String get onboardingLevelSubtitle =>
      'Choose the closest match — there is no wrong answer';

  @override
  String get onboardingProfileTitle => 'What best describes you?';

  @override
  String get onboardingProfileSubtitle =>
      'Help us understand your learning context';

  @override
  String get onboardingMotivationTitle => 'What motivates you to learn AI?';

  @override
  String get onboardingMotivationSubtitle =>
      'Motivation helps you stay consistent';

  @override
  String get onboardingInterestsTitle =>
      'Which AI skills do you want to master?';

  @override
  String get onboardingInterestsSubtitle =>
      'Choose one or more — you can change this later';

  @override
  String get onboardingAgeTitle => 'What is your age range?';

  @override
  String get onboardingAgeSubtitle =>
      'Helps us suggest suitable content and pace';

  @override
  String get onboardingDailyGoalTitle =>
      'How long do you want to learn each day?';

  @override
  String get onboardingDailyGoalSubtitle =>
      'Start small, increase as you get used to it';

  @override
  String get onboardingPurposeTitle => 'What is your learning goal?';

  @override
  String get onboardingPurposeSubtitle =>
      'Your roadmap will adapt to this goal';

  @override
  String get onboardingAckHeadline => 'Saved!';

  @override
  String get onboardingAckHeadlineGreat => 'Great!';

  @override
  String get onboardingAckHeadlineNoted => 'Got it!';

  @override
  String get onboardingAckHeadlineMilestone => 'You are halfway there!';

  @override
  String get onboardingAckHeadlineCommitment => 'Excellent commitment!';

  @override
  String get onboardingAckAnalyzingHeadline => 'Analyzing...';

  @override
  String onboardingAckReferralEcho(String value) {
    return '$value — thank you for finding GATS';
  }

  @override
  String onboardingAckLevelEcho(String value) {
    return '$value — saving to adjust your pace';
  }

  @override
  String onboardingAckProfileEcho(String value) {
    return '$value — saving your profile details';
  }

  @override
  String onboardingAckMotivationEcho(String value) {
    return '$value — that\'s a very meaningful motivation!';
  }

  @override
  String onboardingAckInterestsEcho(int count) {
    return '$count skills selected — I will prioritize these';
  }

  @override
  String onboardingAckAgeEcho(String value) {
    return '$value — saved, thank you!';
  }

  @override
  String onboardingAckDailyGoalEcho(String value) {
    return '$value — I will keep lessons bite-sized';
  }

  @override
  String onboardingAckPurposeEcho(String value) {
    return '$value — analyzing to recommend the right courses';
  }

  @override
  String get onboardingAckSocialReferral =>
      'Join 10,000+ learners studying AI every day';

  @override
  String get onboardingAckSocialMilestone =>
      '92% of learners complete this setup';

  @override
  String get onboardingAckSocialDailyGoal =>
      'Daily learning can improve retention by 3x';

  @override
  String get onboardingResultTitle => 'Recommended courses for you';

  @override
  String get onboardingToRateUs => 'Next';

  @override
  String get rateUsTitle => 'GATS Learners Community';

  @override
  String get rateUsSubtitle => 'See what other learners say about GATS Academy';

  @override
  String get rateUsSocialProof => '10,000+ AI learners';

  @override
  String get rateUsStoreRating => '4.8★ on App Store';

  @override
  String get loadingTitle => 'Creating your learning path';

  @override
  String get loadingCongratsTitle => 'Congratulations!';

  @override
  String get rateSheetTitle => 'Do you like GATS Academy?';

  @override
  String get rateSheetSubtitle =>
      'Your rating helps us improve the learning experience';

  @override
  String get rateSheetCta => 'Rate now';

  @override
  String get rateSheetLater => 'Later';

  @override
  String get reviewOpenedPlayStore =>
      'Opening Google Play so you can rate the app.';

  @override
  String get reviewNativeUnavailable =>
      'In-app rating only works for apps installed from Google Play. Opening the store page instead.';

  @override
  String get settingsRateApp => 'Rate App';

  @override
  String get courseTabOverview => 'Overview';

  @override
  String get courseTabLectures => 'Lectures';

  @override
  String get courseTabQuiz => 'Quiz';

  @override
  String get courseTabPosts => 'Posts';

  @override
  String get courseTabChat => 'Group Chat';

  @override
  String get courseTabGroup => 'Group';

  @override
  String get courseNotFound => 'Course not found';

  @override
  String get courseEnroll => 'Enroll in course';

  @override
  String get courseEnrollFree => 'Join for free';

  @override
  String courseEnrolled(String name) {
    return 'Enrolled in $name';
  }

  @override
  String get courseAlreadyEnrolled => 'You are already enrolled in this course';

  @override
  String get courseEnrollToView => 'Enroll to view course content';

  @override
  String get courseLoginToEnroll => 'Sign in to enroll in this course';

  @override
  String get courseMentorBadge => 'You are mentoring this course';

  @override
  String get courseChatLocked =>
      'GroupChat is only for enrolled students or mentors of the course';

  @override
  String get courseQuizPublished => 'Quiz assigned to students';

  @override
  String get lectureStatusCompleted => 'Completed';

  @override
  String get lectureStatusCurrent => 'In progress';

  @override
  String get lectureStatusUpcoming => 'Not started';

  @override
  String lectureLearningCaption(String title) {
    return 'Learning: $title';
  }

  @override
  String get lectureStartCaption => 'Start with lesson 1';

  @override
  String get lectureAllDoneCaption => 'You have finished every lecture';

  @override
  String lectureMeta(int count, int minutes) {
    return '$count lessons · $minutes min';
  }

  @override
  String lectureProgressCount(int done, int total) {
    return '$done/$total lessons done';
  }

  @override
  String get lectureContinue => 'Continue learning';

  @override
  String get lectureStartNext => 'Start next lesson';

  @override
  String get lectureMarkComplete => 'Mark as complete';

  @override
  String get lectureStartLearning => 'Start lesson';

  @override
  String lectureLessonOf(int index, int total) {
    return 'Lesson $index / $total';
  }

  @override
  String get lecturesEmptyTitle => 'No lectures yet';

  @override
  String get lecturesEmptyDesc => 'Course content is being prepared.';

  @override
  String get lectureMarkedDone => 'Lecture marked as complete';

  @override
  String get lecturePlayerSoon =>
      'The lesson player is coming soon — you can still mark lessons as done.';

  @override
  String get groupChatEmpty => 'No messages yet — say hi to the class!';

  @override
  String get groupChatHint => 'Type a message...';

  @override
  String get groupChatOnePerCourse => '1 course = 1 chat room';

  @override
  String get mentorNavCourses => 'My Courses';

  @override
  String get mentorNavChats => 'Group Chats';

  @override
  String get mentorShellSubtitle => 'Mentor — manage lectures & student chats';

  @override
  String get mentorNoCourses => 'No assigned courses yet';

  @override
  String get adminNavCourses => 'Courses';

  @override
  String get adminNavUsers => 'Learners';

  @override
  String get adminNavMentors => 'Mentors';

  @override
  String get adminNavPosts => 'Posts & Articles';

  @override
  String get adminShellSubtitle => 'Admin — operate platform';

  @override
  String get adminAssignMentorHint =>
      'Assign mentor ↔ course in production build (web admin).';

  @override
  String get adminPostCompose => 'Post a GATS announcement';

  @override
  String get adminPostsEmpty => 'No posts yet';

  @override
  String get postHomeSectionTitle => 'Articles & News';

  @override
  String get postFeedEmpty => 'No posts yet';

  @override
  String get postSeeAll => 'See all';

  @override
  String postByAuthor(String author) {
    return 'By $author';
  }

  @override
  String get postPreviewLocked => 'Enroll in course to read full article';

  @override
  String get postPreviewLogin => 'Sign in and enroll to read full article';

  @override
  String get postEnrollCta => 'Enroll to read full article';

  @override
  String get postEnrollFreeCta => 'Join for free to read full article';

  @override
  String get postComposeTitle => 'Post Article';

  @override
  String get postComposeHintTitle => 'Title';

  @override
  String get postComposeHintBody => 'Article content...';

  @override
  String get postComposePublish => 'Publish';

  @override
  String get postComposeGlobal => 'Global announcement (GATS)';

  @override
  String get postComposeCourse => 'Course-specific article';

  @override
  String get postCommentsTitle => 'Comments';

  @override
  String postCommentsCount(int count) {
    return '$count comments';
  }

  @override
  String get postCommentsEmpty => 'No comments yet — be the first!';

  @override
  String get postCommentHint => 'Write a comment...';

  @override
  String get postCommentSend => 'Send';

  @override
  String get postCommentLogin => 'Sign in to comment';

  @override
  String get postPublished => 'Article published';

  @override
  String get postEmptyCourse => 'No articles in this course yet';

  @override
  String get postMentorCompose => 'Post to class';

  @override
  String postTimeAgo(String time) {
    return '$time ago';
  }

  @override
  String homeStreakBadge(int days) {
    return '🔥 $days days';
  }

  @override
  String get homeContinueLearning => 'Continue learning';

  @override
  String get homeContinueButton => 'Continue';

  @override
  String get homeStatsHours => 'Hours';

  @override
  String get homeStatsLessons => 'Lessons';

  @override
  String get homeStatsStreak => 'Streak';

  @override
  String get homeLeaderboard => 'Leaderboard';

  @override
  String get homeYourRank => 'Your Rank';

  @override
  String get homeXpUnit => 'XP';

  @override
  String get dailyRewardTitle => 'Daily Reward';

  @override
  String get dailyRewardSubtitle => 'Open app daily to claim XP!';

  @override
  String get dailyRewardClaim => 'Claim';

  @override
  String get dailyRewardClaimed => 'Claimed!';

  @override
  String dailyRewardDay(int day) {
    return 'Day $day';
  }

  @override
  String get streakCalendarTitle => 'This Week';

  @override
  String get streakMotivation1 => 'Great! Keep it up! 🔥';

  @override
  String get streakMotivation2 => 'Your streak is hot! 💪';

  @override
  String get streakMotivation3 => 'Let\'s start the journey! 🚀';

  @override
  String get streakBonusTask => 'Bonus: Chat with AI Coach';

  @override
  String dailyXpToday(int xp) {
    return 'XP today: +$xp';
  }

  @override
  String get hubRank => 'Rank';

  @override
  String get hubAchievements => 'Achievements';

  @override
  String get hubViewAll => 'View all';

  @override
  String get hubRankTanBinh => 'Novice';

  @override
  String get hubRankHocVien => 'Learner';

  @override
  String get hubRankThanhThao => 'Proficient';

  @override
  String get hubRankChuyenGia => 'Expert';

  @override
  String get hubRankBacThay => 'Master';

  @override
  String get coachWelcomeCardTitle => 'AI Coach is ready';

  @override
  String get coachWelcomeCardBody =>
      'Ask anything about your learning path, assignments, or AI concepts.';

  @override
  String get coachThinking => 'GATS Coach is thinking...';

  @override
  String get librarySearchHint => 'Search by title or description...';

  @override
  String get libraryNoResults => 'No courses found';

  @override
  String get libraryNoResultsDesc => 'Try another keyword or clear filters';

  @override
  String get libraryGridView => 'Grid';

  @override
  String get libraryListView => 'List';

  @override
  String get quickActionTitle => 'Quick Actions';

  @override
  String get quickActionPosts => 'Articles';

  @override
  String get quickActionSearchCourses => 'Search Courses';

  @override
  String get quickActionFlashcard => 'Study Flashcards';

  @override
  String get quickActionCoach => 'Coach Chat';

  @override
  String get quickActionContinue => 'Continue Learning';

  @override
  String get quickActionStore => 'Course Store';

  @override
  String get quickActionHub => 'Hub';

  @override
  String get courseSearchTitle => 'Search & Filter Courses';

  @override
  String get courseSearchHint => 'Search AI courses, programming...';

  @override
  String courseSearchResultCount(int count) {
    return '$count courses';
  }

  @override
  String get courseSearchEmpty =>
      'No matching courses found.\\nTry changing keywords or filters.';

  @override
  String get headerSubtitleHome => 'Hello, GATS Learner';

  @override
  String get headerSubtitleDaily => 'Exercises & learning routine';

  @override
  String get headerSubtitleLibrary => 'AI courses for office work';

  @override
  String get headerSubtitleAiCoach => 'Personalized mentor';

  @override
  String get headerSubtitleHub => 'Progress & rewards';

  @override
  String get headerSubtitleStore => 'Browse and buy AI courses';

  @override
  String get onboardingBrowseMoreCourses => 'Browse more courses';

  @override
  String get storeTitle => 'Course Store';

  @override
  String get storeSearchHint => 'Search courses...';

  @override
  String get storePromoAI => 'Mega Offer: 40% Off!';

  @override
  String get storePromoAISub => 'Master the best workplace AI skills';

  @override
  String get storeFilterTitle => 'Search Filters';

  @override
  String get storeFilterCategory => 'Topic / Category';

  @override
  String get storeFilterApply => 'Apply Filters';

  @override
  String get storeFeatured => 'Featured Recommendations';

  @override
  String get storeBestSellers => 'Best Sellers';

  @override
  String get storeSeeAll => 'See All';

  @override
  String get storeFree => 'Free';

  @override
  String storeAddedToCart(String title) {
    return 'Added \"$title\" to cart!';
  }

  @override
  String get storeViewCart => 'View Cart';

  @override
  String get storeWishlistTooltip => 'Wishlist';

  @override
  String get storeCartTooltip => 'Cart';

  @override
  String storeHoursOfLearning(int hours) {
    return '$hours hours of learning';
  }

  @override
  String storeReviewsCount(int count) {
    return '($count reviews)';
  }

  @override
  String get storeCourseDetailTitle => 'Course Details';

  @override
  String storeSyllabusTitle(int count) {
    return 'Syllabus ($count lectures)';
  }

  @override
  String get storeSyllabusPreviewNote =>
      'Purchase the course to unlock all lectures, quizzes, and group chat.';

  @override
  String get storeLecturePreview => 'Preview';

  @override
  String get storePurchased => 'Purchased';

  @override
  String get storeReviewsTitle => 'Student Reviews';

  @override
  String get storeAddToCart => 'Add to Cart';

  @override
  String storeAddedSeatsToCart(int seats, String title) {
    return 'Added $seats seats of \"$title\" to cart!';
  }

  @override
  String get storeCourseNotFound => 'Course not found';

  @override
  String get cartTitle => 'My Cart';

  @override
  String get cartEmptyTitle => 'Your Cart is Empty';

  @override
  String get cartEmptyDesc =>
      'Explore the store and pick the best courses for yourself!';

  @override
  String get cartContinueShopping => 'Continue Shopping';

  @override
  String get cartTotal => 'Total';

  @override
  String get cartCheckout => 'Proceed to Checkout';

  @override
  String get wishlistTitle => 'My Wishlist';

  @override
  String get wishlistEmptyTitle => 'No Wishlist Items Yet';

  @override
  String get wishlistEmptyDesc =>
      'Explore the store and tap the heart to save your favorite courses!';

  @override
  String get wishlistAddAll => 'Add All to Cart';

  @override
  String get wishlistAllAdded => 'Added all wishlist courses to cart!';

  @override
  String get checkoutSuccessTitle => 'Checkout Successful!';

  @override
  String get checkoutSuccessDesc =>
      'Congratulations on owning your new courses. Let\'s start your learning path today!';

  @override
  String get checkoutStartLearning => 'Start Learning Now';

  @override
  String get paymentTitle => 'Payment';

  @override
  String get paymentChooseMethod => 'Choose payment method';

  @override
  String get paymentOrderSummary => 'Order summary';

  @override
  String paymentItemCount(int count) {
    return '$count item(s) in cart';
  }

  @override
  String get paymentPayNow => 'Pay now';

  @override
  String get paymentPayWithApple => 'Pay with Apple Pay';

  @override
  String get paymentApplePayHint =>
      'Confirm with Face ID, Touch ID or passcode on your Apple device.';

  @override
  String get paymentMomoHint =>
      'You will be redirected to the MoMo app to complete payment.';

  @override
  String get paymentVnpayHint =>
      'You will be redirected to VNPay secure gateway.';

  @override
  String get paymentRedirectNote =>
      'Mock payment — real gateway integration coming soon.';

  @override
  String get paymentQrHint => 'Scan QR with your banking app';

  @override
  String get paymentQrScanNote =>
      'Supports VietQR · Napas247 · most Vietnamese banks';

  @override
  String get paymentSecureNote =>
      'Your payment information is encrypted and secure.';

  @override
  String get paymentCardDetails => 'Card details';

  @override
  String get paymentCardNumber => 'Card number';

  @override
  String get paymentCardName => 'Name on card';

  @override
  String get paymentCardExpiry => 'MM/YY';

  @override
  String get paymentCardCvv => 'CVV';

  @override
  String get mentorSearchHint => 'Search assigned courses...';

  @override
  String get adminStatusPublished => 'Published';

  @override
  String get adminStatusDraft => 'Draft';

  @override
  String get adminGroupChatLabel => 'Group Chat';

  @override
  String get adminMentorLabel => 'Mentor';

  @override
  String adminAssignedCourses(String courses) {
    return 'Assigned courses: $courses';
  }

  @override
  String quizCountLabel(int count) {
    return '$count questions';
  }

  @override
  String get reportMinsPerWeek => 'Learning mins/week';

  @override
  String get reportStreakDays => 'Streak days';

  @override
  String get reportStrengths => 'Strengths';

  @override
  String get reportImprovement => 'Areas to improve';

  @override
  String get reportReviewSuggestions => 'Review Suggestions';

  @override
  String coursePercentCompleted(int percent) {
    return '$percent% completed';
  }

  @override
  String courseLessonsCount(int lessons) {
    return '$lessons lessons';
  }

  @override
  String get filterAll => 'All';

  @override
  String get filterOfficeAi => 'AI for Office';

  @override
  String get filterProgramming => 'Programming';

  @override
  String get filterMarketing => 'Marketing';

  @override
  String get filterLanguages => 'Languages';

  @override
  String get filterSoftSkills => 'Soft Skills';

  @override
  String get filterAutomation => 'Automation';

  @override
  String get chipAll => 'All';

  @override
  String get chipLearning => 'Learning';

  @override
  String get chipNew => 'New';

  @override
  String get chipFree => 'Free';

  @override
  String get notificationsScreenTitle => 'Notifications';

  @override
  String get notificationsToday => 'Today';

  @override
  String get notificationsYesterday => 'Yesterday';

  @override
  String get notificationsTestSection => 'Test notifications';

  @override
  String get notificationsTestBanner => 'In-app banner';

  @override
  String get notificationsTestPush => 'System push now';

  @override
  String get notificationsTestPushDelayed => 'Push in 5 seconds';

  @override
  String get notificationsTestHint =>
      'While the app is open, push appears as a top banner. Minimize the app to see it in the system notification shade.';

  @override
  String get notificationsPermissionDenied =>
      'Permission denied. Enable notifications in system Settings.';

  @override
  String get notificationsTestScheduled =>
      'Push in 5 seconds — minimize the app now!';

  @override
  String get notificationsTestSent => 'Test notification sent.';

  @override
  String get notificationsEmpty => 'No notifications yet';

  @override
  String get headerSubtitleNotifications => 'News & learning reminders';
}
