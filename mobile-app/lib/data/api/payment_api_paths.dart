/// Paths khớp BE `src/common/paths/payment.ts`.
///
/// Luồng mua hiện tại: `POST /api/orders` (`paymentMethod: bank_transfer`)
/// → QR Sepay → `GET /api/payment/sepay/check?txnRef=`.
/// VNPay/MoMo return trên BE vẫn là placeholder.
abstract final class PaymentApiPaths {
  static const sepayCheck = '/api/payment/sepay/check';
  static const sepayWebhook = '/api/payment/sepay/webhook';
  static const vnpayReturn = '/api/payment/vnpay/return';
  static const momoReturn = '/api/payment/momo/return';
}
