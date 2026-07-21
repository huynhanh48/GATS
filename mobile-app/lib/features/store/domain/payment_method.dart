import 'package:flutter/material.dart';

enum PaymentMethodId {
  applePay,
  visa,
  creditCard,
  momo,
  qrCode,
  vnpay,
}

class PaymentMethodOption {
  const PaymentMethodOption({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.accentColor,
    this.badge,
  });

  final PaymentMethodId id;
  final String title;
  final String subtitle;
  final IconData icon;
  final Color accentColor;
  final String? badge;

  /// Thứ tự checkout: QR (Sepay) trước — đây là luồng BE đang hoạt động.
  static const List<PaymentMethodOption> checkoutDefaults = [
    PaymentMethodOption(
      id: PaymentMethodId.qrCode,
      title: 'QR ngân hàng',
      subtitle: 'VietQR / Sepay — khuyến nghị',
      icon: Icons.qr_code_2_rounded,
      accentColor: Color(0xFF059669),
      badge: 'Khuyên dùng',
    ),
    PaymentMethodOption(
      id: PaymentMethodId.momo,
      title: 'MoMo',
      subtitle: 'Ví điện tử MoMo',
      icon: Icons.account_balance_wallet_outlined,
      accentColor: Color(0xFFA50064),
      badge: 'MoMo',
    ),
    PaymentMethodOption(
      id: PaymentMethodId.vnpay,
      title: 'VNPay',
      subtitle: 'Cổng thanh toán VNPay',
      icon: Icons.storefront_outlined,
      accentColor: Color(0xFF0052A5),
      badge: 'VNPay',
    ),
    PaymentMethodOption(
      id: PaymentMethodId.visa,
      title: 'Visa',
      subtitle: 'Thẻ Visa nội địa & quốc tế',
      icon: Icons.credit_card_rounded,
      accentColor: Color(0xFF1A1F71),
      badge: 'Visa',
    ),
    PaymentMethodOption(
      id: PaymentMethodId.creditCard,
      title: 'Thẻ tín dụng / ghi nợ',
      subtitle: 'Mastercard, JCB, thẻ ngân hàng Việt Nam',
      icon: Icons.payment_rounded,
      accentColor: Color(0xFF0070EB),
    ),
    PaymentMethodOption(
      id: PaymentMethodId.applePay,
      title: 'Apple Pay',
      subtitle: 'Chưa hỗ trợ trên server',
      icon: Icons.apple,
      accentColor: Color(0xFF111827),
    ),
  ];

  static const List<PaymentMethodOption> vietnamDefaults = checkoutDefaults;
}
