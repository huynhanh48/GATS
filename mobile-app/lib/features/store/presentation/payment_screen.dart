import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/core/config/legal_urls.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/utils/price_formatter.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/data/api/coupon_api_service.dart';
import 'package:gats_academy/data/api/order_api_service.dart';
import 'package:gats_academy/features/course/course_module.dart';
import 'package:gats_academy/features/store/domain/payment_method.dart';
import 'package:gats_academy/features/store/presentation/widgets/checkout_success_dialog.dart';
import 'package:gats_academy/l10n/app_localizations.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  /// BE thật hiện ổn định với `bank_transfer` (Sepay QR).
  PaymentMethodId _selected = PaymentMethodId.qrCode;
  bool _processing = false;
  BeBankTransferPayment? _pendingQr;
  List<String> _pendingCourseIds = const [];
  Timer? _pollTimer;
  bool _polling = false;
  String? _statusHint;

  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _couponController = TextEditingController();
  final _cardNumberController = TextEditingController();
  final _cardNameController = TextEditingController();
  final _cardExpiryController = TextEditingController();
  final _cardCvvController = TextEditingController();

  CouponPreviewDto? _couponPreview;
  String? _couponError;
  bool _couponLoading = false;

  @override
  void initState() {
    super.initState();
    unawaited(_prefillCustomer());
  }

  Future<void> _prefillCustomer() async {
    final user = await AuthPrefs.currentUser();
    if (!mounted || user == null) return;
    if (_nameController.text.isEmpty) {
      _nameController.text = user.displayName;
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _nameController.dispose();
    _phoneController.dispose();
    _couponController.dispose();
    _cardNumberController.dispose();
    _cardNameController.dispose();
    _cardExpiryController.dispose();
    _cardCvvController.dispose();
    super.dispose();
  }

  bool get _needsCardForm =>
      _selected == PaymentMethodId.visa ||
      _selected == PaymentMethodId.creditCard;

  bool get _canPay {
    if (_pendingQr != null) return false;
    if (_nameController.text.trim().isEmpty) return false;
    if (_phoneController.text.trim().replaceAll(RegExp(r'\s+'), '').length <
        10) {
      return false;
    }
    if (!_needsCardForm) return true;
    return _cardNumberController.text.replaceAll(' ', '').length >= 16 &&
        _cardNameController.text.trim().isNotEmpty &&
        _cardExpiryController.text.length >= 4 &&
        _cardCvvController.text.length >= 3;
  }

  String? _backendPaymentMethod(PaymentMethodId id) {
    return switch (id) {
      PaymentMethodId.qrCode => 'bank_transfer',
      PaymentMethodId.momo => 'momo',
      PaymentMethodId.vnpay ||
      PaymentMethodId.visa ||
      PaymentMethodId.creditCard =>
        'vnpay',
      PaymentMethodId.applePay => null, // BE chưa hỗ trợ
    };
  }

  Future<void> _pay() async {
    if (_processing || !_canPay) return;

    final backendMethod = _backendPaymentMethod(_selected);
    if (backendMethod == null) {
      _snack('Phương thức này chưa hỗ trợ. Vui lòng chọn QR ngân hàng.');
      return;
    }

    final token = await AuthPrefs.accessToken();
    final user = await AuthPrefs.currentUser();
    if (token == null || user == null) {
      _snack(AppStrings.courseLoginToEnroll);
      return;
    }
    if (CartController.instance.items.isEmpty) {
      _snack(AppStrings.cartEmptyTitle);
      return;
    }

    setState(() {
      _processing = true;
      _statusHint = null;
    });

    try {
      final courseIds = CartController.instance.items.keys.toList();
      final couponCode = _couponPreview?.code.trim().isNotEmpty == true
          ? _couponPreview!.code
          : (_couponController.text.trim().isNotEmpty
              ? _couponController.text.trim()
              : null);
      final result = await OrderApiService.createFromCart(
        token: token,
        paymentMethod: backendMethod,
        customerName: _nameController.text,
        customerEmail: user.email,
        customerPhone: _phoneController.text,
        couponCode: couponCode,
      );

      // BE đã xóa item khỏi cart server khi tạo order.
      CartController.instance.clearLocal();

      if (!mounted) return;

      if (result.isBankTransferPending) {
        setState(() {
          _processing = false;
          _pendingQr = result.bankTransfer;
          _pendingCourseIds =
              result.courseIds.isNotEmpty ? result.courseIds : courseIds;
          _statusHint = 'Quét QR và chờ xác nhận thanh toán…';
        });
        _startPolling(token, result.bankTransfer!.txnRef);
        return;
      }

      if (result.isPaidImmediately) {
        await CourseModule.init();
        if (!mounted) return;
        setState(() => _processing = false);
        await _showSuccess(
          userId: user.id,
          courseIds:
              result.courseIds.isNotEmpty ? result.courseIds : courseIds,
        );
        return;
      }

      setState(() {
        _processing = false;
        _statusHint = result.paymentMessage ??
            'Đơn đã tạo nhưng cổng ${result.paymentMethod} chưa sẵn sàng. Dùng QR ngân hàng.';
      });
      _snack(_statusHint!);
    } catch (e) {
      if (!mounted) return;
      setState(() => _processing = false);
      _snack(_messageOf(e));
      // Có thể order chưa tạo — sync lại cart.
      unawaited(CartController.instance.syncFromApi());
    }
  }

  void _startPolling(String token, String txnRef) {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      unawaited(_pollOnce(token, txnRef));
    });
    unawaited(_pollOnce(token, txnRef));
  }

  Future<void> _pollOnce(String token, String txnRef) async {
    if (_polling || !mounted) return;
    _polling = true;
    try {
      final check = await OrderApiService.checkSepay(
        token: token,
        txnRef: txnRef,
      );
      if (!mounted) return;
      if (check.isPaid) {
        _pollTimer?.cancel();
        final user = await AuthPrefs.currentUser();
        await CourseModule.init();
        if (!mounted || user == null) return;
        setState(() {
          _pendingQr = null;
          _statusHint = null;
        });
        await _showSuccess(
          userId: user.id,
          courseIds: _pendingCourseIds,
        );
      } else if (mounted) {
        setState(() {
          _statusHint = check.message ?? 'Đang chờ thanh toán…';
        });
      }
    } catch (e) {
      debugPrint('Sepay poll: $e');
    } finally {
      _polling = false;
    }
  }

  Future<void> _showSuccess({
    required String userId,
    required List<String> courseIds,
  }) async {
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) => CheckoutSuccessDialog(
        userId: userId,
        courseIds: courseIds,
      ),
    );
  }

  void _snack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  static String _messageOf(Object e) {
    if (e is ApiException) return e.message;
    return e.toString();
  }

  double get _displayTotal {
    if (_pendingQr != null) return _pendingQr!.amount.toDouble();
    if (_couponPreview != null) return _couponPreview!.finalAmount.toDouble();
    return CartController.instance.totalPrice;
  }

  Future<void> _applyCoupon() async {
    final code = _couponController.text.trim();
    if (code.isEmpty) {
      setState(() {
        _couponError = 'Nhập mã giảm giá';
        _couponPreview = null;
      });
      return;
    }
    final token = await AuthPrefs.accessToken();
    if (token == null) {
      _snack(AppStrings.courseLoginToEnroll);
      return;
    }
    setState(() {
      _couponLoading = true;
      _couponError = null;
    });
    try {
      final preview = await CouponApiService.preview(
        token: token,
        code: code,
        orderAmount: CartController.instance.totalPrice.round(),
      );
      if (!mounted) return;
      setState(() {
        _couponPreview = preview;
        _couponLoading = false;
        _couponError = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _couponPreview = null;
        _couponLoading = false;
        _couponError = _messageOf(e);
      });
    }
  }

  void _clearCoupon() {
    setState(() {
      _couponController.clear();
      _couponPreview = null;
      _couponError = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final total = _displayTotal;
    final itemCount = _pendingQr != null
        ? _pendingCourseIds.length
        : CartController.instance.totalQuantity;

    return GatsThemedScaffold(
      appBar: AppBar(
        backgroundColor: gats.background,
        elevation: 0,
        title: Text(
          AppStrings.paymentTitle,
          style: AppTypography.style(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: gats.textPrimary,
          ),
        ),
      ),
      body: Stack(
        children: [
          ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
            children: [
              _OrderSummaryCard(
                totalLabel: formatVndPrice(total),
                itemCount: itemCount,
                discountLabel: _pendingQr == null && _couponPreview != null
                    ? 'Giảm ${formatVndPrice(_couponPreview!.discountAmount.toDouble())}'
                    : null,
              ),
              const SizedBox(height: 20),
              if (_pendingQr == null) ...[
                Text(
                  'Thông tin liên hệ',
                  style: AppTypography.style(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: gats.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                _ContactFields(
                  nameController: _nameController,
                  phoneController: _phoneController,
                  onChanged: () => setState(() {}),
                ),
                const SizedBox(height: 20),
                Text(
                  'Mã giảm giá',
                  style: AppTypography.style(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: gats.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                _CouponField(
                  controller: _couponController,
                  loading: _couponLoading,
                  error: _couponError,
                  applied: _couponPreview,
                  onApply: _applyCoupon,
                  onClear: _clearCoupon,
                  onChanged: () {
                    if (_couponPreview != null || _couponError != null) {
                      setState(() {
                        _couponPreview = null;
                        _couponError = null;
                      });
                    }
                  },
                ),
                const SizedBox(height: 20),
                Text(
                  AppStrings.paymentChooseMethod,
                  style: AppTypography.style(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: gats.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                ...PaymentMethodOption.checkoutDefaults.map(
                  (method) => _PaymentMethodTile(
                    method: method,
                    groupValue: _selected,
                    onTap: () => setState(() => _selected = method.id),
                  ),
                ),
                const SizedBox(height: 16),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
                  child: _buildMethodDetail(gats, total),
                ),
              ] else ...[
                _LiveQrPanel(payment: _pendingQr!),
                if (_statusHint != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _statusHint!,
                    textAlign: TextAlign.center,
                    style: TextStyle(color: gats.textSecondary, fontSize: 13),
                  ),
                ],
                const SizedBox(height: 8),
                const Center(
                  child: SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                ),
              ],
              if (_statusHint != null && _pendingQr == null) ...[
                const SizedBox(height: 12),
                Text(
                  _statusHint!,
                  style: TextStyle(color: gats.textSecondary, fontSize: 13),
                ),
              ],
            ],
          ),
          if (_pendingQr == null)
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: _PayBar(
                amount: formatVndPrice(total),
                enabled: _canPay && !_processing,
                processing: _processing,
                method: _selected,
                onPay: _pay,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMethodDetail(GatsThemeExtension gats, double total) {
    return switch (_selected) {
      PaymentMethodId.applePay => _InfoPanel(
          key: const ValueKey('apple'),
          icon: Icons.apple,
          color: const Color(0xFF111827),
          title: AppStrings.paymentApplePayHint,
          subtitle: 'Chưa hỗ trợ trên server — chọn QR ngân hàng.',
        ),
      PaymentMethodId.visa || PaymentMethodId.creditCard => _CardFormPanel(
          key: ValueKey(_selected),
          cardNumberController: _cardNumberController,
          cardNameController: _cardNameController,
          cardExpiryController: _cardExpiryController,
          cardCvvController: _cardCvvController,
          onChanged: () => setState(() {}),
        ),
      PaymentMethodId.momo => _InfoPanel(
          key: const ValueKey('momo'),
          icon: Icons.account_balance_wallet_outlined,
          color: const Color(0xFFA50064),
          title: AppStrings.paymentMomoHint,
          subtitle: 'Cổng MoMo trên BE đang chờ tích hợp đầy đủ.',
        ),
      PaymentMethodId.vnpay => _InfoPanel(
          key: const ValueKey('vnpay'),
          icon: Icons.storefront_outlined,
          color: const Color(0xFF0052A5),
          title: AppStrings.paymentVnpayHint,
          subtitle: 'Cổng VNPay trên BE đang chờ tích hợp đầy đủ.',
        ),
      PaymentMethodId.qrCode => _InfoPanel(
          key: const ValueKey('qr-hint'),
          icon: Icons.qr_code_2_rounded,
          color: const Color(0xFF059669),
          title: AppStrings.paymentQrHint,
          subtitle: AppStrings.paymentQrScanNote,
        ),
    };
  }
}

class _ContactFields extends StatelessWidget {
  const _ContactFields({
    required this.nameController,
    required this.phoneController,
    required this.onChanged,
  });

  final TextEditingController nameController;
  final TextEditingController phoneController;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    InputDecoration deco(String hint) => InputDecoration(
          hintText: hint,
          filled: true,
          fillColor: gats.surface,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        );

    return Column(
      children: [
        TextField(
          controller: nameController,
          onChanged: (_) => onChanged(),
          decoration: deco('Họ và tên'),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: phoneController,
          keyboardType: TextInputType.phone,
          onChanged: (_) => onChanged(),
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          decoration: deco('Số điện thoại'),
        ),
      ],
    );
  }
}

class _LiveQrPanel extends StatelessWidget {
  const _LiveQrPanel({required this.payment});

  final BeBankTransferPayment payment;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: gats.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: gats.divider.withValues(alpha: 0.5)),
      ),
      child: Column(
        children: [
          Text(
            AppStrings.paymentQrHint,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: gats.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            width: 220,
            height: 220,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: gats.divider),
            ),
            child: Image.network(
              payment.qrUrl,
              fit: BoxFit.contain,
              errorBuilder: (_, _, _) => const Center(
                child: Icon(Icons.qr_code_2, size: 64),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            formatVndPrice(payment.amount.toDouble()),
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: gats.lavenderAccent,
            ),
          ),
          const SizedBox(height: 8),
          if (payment.bankAccountName != null)
            Text(
              payment.bankAccountName!,
              style: TextStyle(fontSize: 13, color: gats.textPrimary),
            ),
          if (payment.bankName != null || payment.bankAccountNumber != null)
            Text(
              [
                if (payment.bankName != null) payment.bankName,
                if (payment.bankAccountNumber != null)
                  payment.bankAccountNumber,
              ].join(' · '),
              style: TextStyle(fontSize: 12, color: gats.textSecondary),
            ),
          const SizedBox(height: 6),
          SelectableText(
            'Nội dung: ${payment.transferContent ?? payment.txnRef}',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: gats.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            AppStrings.paymentQrScanNote,
            style: TextStyle(fontSize: 11, color: gats.textSecondary),
          ),
        ],
      ),
    );
  }
}

class _OrderSummaryCard extends StatelessWidget {
  const _OrderSummaryCard({
    required this.totalLabel,
    required this.itemCount,
    this.discountLabel,
  });

  final String totalLabel;
  final int itemCount;
  final String? discountLabel;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gats.isStarry
              ? [const Color(0xFF1E3A5F), const Color(0xFF0F172A)]
              : [const Color(0xFF0070EB), const Color(0xFF0052B4)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: AppShadows.elevated,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppStrings.paymentOrderSummary,
            style: const TextStyle(
              color: Colors.white70,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            totalLabel,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w800,
            ),
          ),
          if (discountLabel != null) ...[
            const SizedBox(height: 4),
            Text(
              discountLabel!,
              style: const TextStyle(color: Color(0xFFB8F0C8), fontSize: 13),
            ),
          ],
          const SizedBox(height: 4),
          Text(
            AppStrings.paymentItemCount.replaceFirst('%d', '$itemCount'),
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _CouponField extends StatelessWidget {
  const _CouponField({
    required this.controller,
    required this.loading,
    required this.error,
    required this.applied,
    required this.onApply,
    required this.onClear,
    required this.onChanged,
  });

  final TextEditingController controller;
  final bool loading;
  final String? error;
  final CouponPreviewDto? applied;
  final VoidCallback onApply;
  final VoidCallback onClear;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                textCapitalization: TextCapitalization.characters,
                onChanged: (_) => onChanged(),
                decoration: InputDecoration(
                  hintText: 'Nhập mã',
                  filled: true,
                  fillColor: gats.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: gats.divider),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: gats.divider),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            if (applied != null)
              OutlinedButton(
                onPressed: onClear,
                child: const Text('Xóa'),
              )
            else
              FilledButton(
                onPressed: loading ? null : onApply,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(88, 48),
                ),
                child: loading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Áp dụng'),
              ),
          ],
        ),
        if (error != null) ...[
          const SizedBox(height: 8),
          Text(error!, style: TextStyle(color: Colors.red.shade400, fontSize: 13)),
        ],
        if (applied != null) ...[
          const SizedBox(height: 8),
          Text(
            'Đã áp dụng ${applied!.code}',
            style: TextStyle(color: gats.lavenderAccent, fontSize: 13),
          ),
        ],
      ],
    );
  }
}

class _PaymentMethodTile extends StatelessWidget {
  const _PaymentMethodTile({
    required this.method,
    required this.groupValue,
    required this.onTap,
  });

  final PaymentMethodOption method;
  final PaymentMethodId groupValue;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final selected = method.id == groupValue;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: selected
            ? method.accentColor.withValues(alpha: 0.08)
            : gats.surface,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: selected
                    ? method.accentColor
                    : gats.divider.withValues(alpha: 0.5),
                width: selected ? 1.5 : 1,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: method.accentColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(method.icon, color: method.accentColor),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            method.title,
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              color: gats.textPrimary,
                            ),
                          ),
                          if (method.badge != null) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: method.accentColor.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                method.badge!,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: method.accentColor,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      Text(
                        method.subtitle,
                        style: TextStyle(
                          fontSize: 12,
                          color: gats.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  selected
                      ? Icons.radio_button_checked
                      : Icons.radio_button_off,
                  color: selected ? method.accentColor : gats.textSecondary,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _InfoPanel extends StatelessWidget {
  const _InfoPanel({
    super.key,
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    return Container(
      key: key,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: gats.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: gats.divider.withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: gats.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(fontSize: 12, color: gats.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CardFormPanel extends StatelessWidget {
  const _CardFormPanel({
    super.key,
    required this.cardNumberController,
    required this.cardNameController,
    required this.cardExpiryController,
    required this.cardCvvController,
    required this.onChanged,
  });

  final TextEditingController cardNumberController;
  final TextEditingController cardNameController;
  final TextEditingController cardExpiryController;
  final TextEditingController cardCvvController;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    InputDecoration deco(String hint) => InputDecoration(
          hintText: hint,
          filled: true,
          fillColor: gats.background,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        );

    return Container(
      key: key,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: gats.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: gats.divider.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppStrings.paymentCardDetails,
            style: TextStyle(
              fontWeight: FontWeight.w800,
              color: gats.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: cardNumberController,
            onChanged: (_) => onChanged(),
            keyboardType: TextInputType.number,
            decoration: deco(AppStrings.paymentCardNumber),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: cardNameController,
            onChanged: (_) => onChanged(),
            decoration: deco(AppStrings.paymentCardName),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: cardExpiryController,
                  onChanged: (_) => onChanged(),
                  decoration: deco(AppStrings.paymentCardExpiry),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: cardCvvController,
                  onChanged: (_) => onChanged(),
                  decoration: deco(AppStrings.paymentCardCvv),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Thẻ sẽ map sang VNPay — cổng chưa sẵn sàng trên BE.',
            style: TextStyle(fontSize: 11, color: gats.textSecondary),
          ),
        ],
      ),
    );
  }
}

class _PayBar extends StatelessWidget {
  const _PayBar({
    required this.amount,
    required this.enabled,
    required this.processing,
    required this.method,
    required this.onPay,
  });

  final String amount;
  final bool enabled;
  final bool processing;
  final PaymentMethodId method;
  final VoidCallback onPay;

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final l10n = AppLocalizations.of(context);
    final isApplePay = method == PaymentMethodId.applePay;

    return Container(
      padding: EdgeInsets.fromLTRB(
        20,
        14,
        20,
        14 + MediaQuery.paddingOf(context).bottom,
      ),
      decoration: BoxDecoration(
        color: gats.surface,
        border: Border(
          top: BorderSide(color: gats.divider.withValues(alpha: 0.6)),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton(
              onPressed: enabled ? onPay : null,
              style: FilledButton.styleFrom(
                backgroundColor:
                    isApplePay ? const Color(0xFF111827) : gats.lavenderAccent,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
              child: processing
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(
                      isApplePay
                          ? AppStrings.paymentPayWithApple
                          : '${AppStrings.paymentPayNow} · $amount',
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            alignment: WrapAlignment.center,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                l10n.paymentLegalPrefix,
                style: TextStyle(fontSize: 11, color: gats.textSecondary),
              ),
              GestureDetector(
                onTap: () => LegalUrls.open(context, LegalUrls.terms),
                child: Text(
                  l10n.legalTerms,
                  style: TextStyle(
                    fontSize: 11,
                    color: gats.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                ', ',
                style: TextStyle(fontSize: 11, color: gats.textSecondary),
              ),
              GestureDetector(
                onTap: () => LegalUrls.open(context, LegalUrls.payment),
                child: Text(
                  l10n.legalPayment,
                  style: TextStyle(
                    fontSize: 11,
                    color: gats.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                ' ${l10n.authLegalSignUpMiddle.trim()} ',
                style: TextStyle(fontSize: 11, color: gats.textSecondary),
              ),
              GestureDetector(
                onTap: () => LegalUrls.open(context, LegalUrls.refund),
                child: Text(
                  l10n.legalRefund,
                  style: TextStyle(
                    fontSize: 11,
                    color: gats.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                '.',
                style: TextStyle(fontSize: 11, color: gats.textSecondary),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
