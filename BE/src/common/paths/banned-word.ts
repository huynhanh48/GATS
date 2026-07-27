const BannedWordPaths = {
  _: '/api',
  BannedWord: {
    _: '/banned-words',
    List: '/',
    Create: '/',
    Update: '/:id',
    Delete: '/:id',
  },
} as const;

export default BannedWordPaths;
