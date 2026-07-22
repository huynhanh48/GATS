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

  /// Phase 1 production: chỉ QR ngân hàng / SePay.
  static const List<PaymentMethodOption> checkoutDefaults = [
    PaymentMethodOption(
      id: PaymentMethodId.qrCode,
      title: 'QR ngân hàng',
      subtitle: 'VietQR / SePay — chuyển khoản',
      icon: Icons.qr_code_2_rounded,
      accentColor: Color(0xFF059669),
      badge: 'Khuyên dùng',
    ),
  ];

  /// Đầy đủ (chỉ dùng khi feature-flag / debug gateway).
  static const List<PaymentMethodOption> allGateways = [
    ...checkoutDefaults,
    PaymentMethodOption(
      id: PaymentMethodId.momo,
      title: 'MoMo',
      subtitle: 'Sắp ra mắt',
      icon: Icons.account_balance_wallet_outlined,
      accentColor: Color(0xFFA50064),
      badge: 'Sắp ra mắt',
    ),
    PaymentMethodOption(
      id: PaymentMethodId.vnpay,
      title: 'VNPay',
      subtitle: 'Sắp ra mắt',
      icon: Icons.storefront_outlined,
      accentColor: Color(0xFF0052A5),
      badge: 'Sắp ra mắt',
    ),
    PaymentMethodOption(
      id: PaymentMethodId.visa,
      title: 'Visa',
      subtitle: 'Sắp ra mắt',
      icon: Icons.credit_card_rounded,
      accentColor: Color(0xFF1A1F71),
      badge: 'Sắp ra mắt',
    ),
    PaymentMethodOption(
      id: PaymentMethodId.creditCard,
      title: 'Thẻ tín dụng / ghi nợ',
      subtitle: 'Sắp ra mắt',
      icon: Icons.payment_rounded,
      accentColor: Color(0xFF0070EB),
    ),
    PaymentMethodOption(
      id: PaymentMethodId.applePay,
      title: 'Apple Pay',
      subtitle: 'Sắp ra mắt',
      icon: Icons.apple,
      accentColor: Color(0xFF111827),
    ),
  ];

  static const List<PaymentMethodOption> vietnamDefaults = checkoutDefaults;
}
