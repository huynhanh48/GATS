const LeadPaths = {
  _: '/api',
  Lead: {
    _: '/leads',
    Create: '/',
    List: '/',
    ExportCsv: '/admin/export.csv',
    Get: '/:id',
    Update: '/:id',
  },
} as const;

export default LeadPaths;
