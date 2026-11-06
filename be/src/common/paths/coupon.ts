const CouponPaths = {
  _: '/api',
  Coupon: {
    _: '/coupons',
    List: '/',
    Create: '/',
    Get: '/:id',
    Update: '/:id',
    Delete: '/:id',
    Preview: '/preview',
  },
} as const;

export default CouponPaths;
