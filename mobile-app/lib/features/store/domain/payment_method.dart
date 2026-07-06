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

  static const List<PaymentMethodOption> vietnamDefaults = [
    PaymentMethodOption(
      id: PaymentMethodId.applePay,
      title: 'Apple Pay',
      subtitle: 'Thanh toán nhanh trên iPhone / iPad',
      icon: Icons.apple,
      accentColor: Color(0xFF111827),
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
      id: PaymentMethodId.momo,
      title: 'MoMo',
      subtitle: 'Ví điện tử MoMo',
      icon: Icons.account_balance_wallet_outlined,
      accentColor: Color(0xFFA50064),
      badge: 'MoMo',
    ),
    PaymentMethodOption(
      id: PaymentMethodId.qrCode,
      title: 'QR Code',
      subtitle: 'Quét mã VietQR / Napas247',
      icon: Icons.qr_code_2_rounded,
      accentColor: Color(0xFF059669),
    ),
    PaymentMethodOption(
      id: PaymentMethodId.vnpay,
      title: 'VNPay',
      subtitle: 'Cổng thanh toán VNPay',
      icon: Icons.storefront_outlined,
      accentColor: Color(0xFF0052A5),
      badge: 'VNPay',
    ),
  ];
}
