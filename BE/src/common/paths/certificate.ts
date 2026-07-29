const CertificatePaths = {
  _: '/api',
  Certificate: {
    _: '/certificates',
    Mine: '/mine',
    Verify: '/verify/:certificateNumber',
    AdminList: '/admin',
    AdminIssue: '/admin/issue',
    AdminRevoke: '/admin/:id/revoke',
    AdminReissue: '/admin/:id/reissue',
  },
} as const;

export default CertificatePaths;
