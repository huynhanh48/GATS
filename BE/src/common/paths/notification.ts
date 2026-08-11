const NotificationPaths = {
  _: '/api',
  Notification: {
    _: '/notifications',
    List: '/',
    MarkRead: '/read',
    MarkOneRead: '/:id/read',
    MarkAllRead: '/read-all',
    Compose: '/compose',
  },
} as const;

export default NotificationPaths;
