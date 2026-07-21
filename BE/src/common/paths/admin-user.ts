const AdminUserPaths = {
  _: '/api',
  AdminUsers: {
    _: '/admin/users',
    List: '/',
    Get: '/:id',
    ResendVerification: '/:id/resend-verification',
    SendPasswordReset: '/:id/send-password-reset',
    RevokeSessions: '/:id/revoke-sessions',
    Lock: '/:id/lock',
    Unlock: '/:id/unlock',
  },
} as const;

export default AdminUserPaths;
