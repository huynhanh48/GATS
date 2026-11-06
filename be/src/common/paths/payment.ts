const PaymentPaths = {
  _: '/api',
  Payment: {
    _: '/payment',
    SepayWebhook: '/sepay/webhook',
    /** SePay Payment Gateway IPN (X-Secret-Key) */
    SepayIpn: '/sepay/ipn',
    SepayCheck: '/sepay/check',
    VnpayReturn: '/vnpay/return',
    MomoReturn: '/momo/return',
  },
} as const;

export default PaymentPaths;
