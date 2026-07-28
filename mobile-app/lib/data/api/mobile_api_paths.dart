/// Mobile aggregate endpoints — BE `src/common/paths/mobile.ts`.
abstract final class MobileApiPaths {
  static const bootstrap = '/api/mobile/bootstrap';
}

abstract final class FlashcardApiPaths {
  static const due = '/api/flashcards/due';
  static const reviewsSync = '/api/flashcards/reviews/sync';
  static const stats = '/api/flashcards/stats';
  static String courseDecks(String courseId) =>
      '/api/courses/$courseId/flashcard-decks';
}

abstract final class DeviceApiPaths {
  static const devices = '/api/user/devices';
  static String device(String deviceId) => '/api/user/devices/$deviceId';
}

abstract final class OnboardingApiPaths {
  static const onboarding = '/api/user/onboarding';
}
