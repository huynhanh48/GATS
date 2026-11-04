const MembershipPaths = {
  _: '/api',
  Public: {
    _: '/memberships',
    Plans: '/plans',
  },
  Admin: {
    _: '/admin/memberships',
    Plans: '/plans',
    Plan: '/plans/:id',
    Members: '/members',
    Grant: '/grant',
    Extend: '/:id/extend',
    Revoke: '/:id/revoke',
  },
} as const;

export default MembershipPaths;
