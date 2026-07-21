const NotificationPaths = {
  _: '/api',
  Notification: {
    _: '/notifications',
    List: '/',
    MarkRead: '/read',
    Compose: '/compose',
  },
} as const;

export default NotificationPaths;
