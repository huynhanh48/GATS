const OrderPaths = {
  _: '/api',
  Order: {
    _: '/orders',
    List: '/',
    Create: '/',
    Get: '/:orderId',
    Cancel: '/:orderId/cancel',
  },
} as const;

export default OrderPaths;
