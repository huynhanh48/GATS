/// Endpoints thanh toán dự kiến — VNPay, MoMo, v.v.
abstract final class PaymentApiPaths {
  static const createIntent = '/api/payments/intent';
  static const vnpayCallback = '/api/payments/vnpay/callback';
  static const momoCallback = '/api/payments/momo/callback';
  static String status(String paymentId) => '/api/payments/$paymentId/status';
}
