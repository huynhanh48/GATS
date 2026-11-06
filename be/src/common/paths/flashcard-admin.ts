const FlashcardAdminPaths = {
  _: '/api',
  Decks: {
    _: '/flashcard-decks',
    Get: '/:deckId',
    Update: '/:deckId',
    Delete: '/:deckId',
    Cards: '/:deckId/cards',
    Import: '/:deckId/cards/import',
    AiSources: '/:deckId/ai-sources',
    AiGenerate: '/:deckId/cards/ai-generate',
  },
  Cards: {
    _: '/flashcards',
    Update: '/:cardId',
    Delete: '/:cardId',
  },
} as const;

export default FlashcardAdminPaths;
