const PaymentPaths = {
  _: '/api',
  Payment: {
    _: '/payment',
    SepayWebhook: '/sepay/webhook',
    SepayCheck: '/sepay/check',
    VnpayReturn: '/vnpay/return',
    MomoReturn: '/momo/return',
  },
} as const;

export default PaymentPaths;
