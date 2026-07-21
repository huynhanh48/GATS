const LeadPaths = {
  _: '/api',
  Lead: {
    _: '/leads',
    Create: '/',
    List: '/',
    Get: '/:id',
    Update: '/:id',
  },
} as const;

export default LeadPaths;
