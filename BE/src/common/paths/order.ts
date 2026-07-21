const OrderPaths = {
  _: '/api',
  Order: {
    _: '/orders',
    List: '/',
    Create: '/',
    /** Staff-only — register before `/:orderId` */
    AdminList: '/admin',
    AdminExportCsv: '/admin/export.csv',
    AdminExceptions: '/admin/exceptions',
    AdminExceptionResolve: '/admin/exceptions/:exceptionId/resolve',
    AdminGet: '/admin/:orderId',
    AdminUpdateStatus: '/admin/:orderId/status',
    AdminRepairEnrollment: '/admin/:orderId/repair-enrollment',
    AdminExpireStale: '/admin/expire-stale',
    Get: '/:orderId',
    Cancel: '/:orderId/cancel',
  },
} as const;

export default OrderPaths;
