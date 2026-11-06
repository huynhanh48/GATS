const MobilePaths = {
  _: '/api',
  Mobile: {
    _: '/mobile',
    Bootstrap: '/bootstrap',
  },
  Flashcards: {
    _: '/flashcards',
    Due: '/due',
    ReviewsSync: '/reviews/sync',
    Stats: '/stats',
  },
  CourseFlashcardDecks: '/courses/:courseId/flashcard-decks',
} as const;

export default MobilePaths;
