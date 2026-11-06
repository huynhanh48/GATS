const ModerationPaths = {
  _: '/api',
  Moderation: {
    _: '/moderation',
    Queue: '/comments',
    UpdateStatus: '/comments/:id/status',
  },
} as const;

export default ModerationPaths;
