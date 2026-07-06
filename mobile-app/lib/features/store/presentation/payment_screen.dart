import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/services/cart_controller.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/utils/price_formatter.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/features/store/domain/payment_method.dart';
import 'package:gats_academy/features/store/presentation/widgets/checkout_success_dialog.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  PaymentMethodId _selected = PaymentMethodId.momo;
  bool _processing = false;

  final _cardNumberController = TextEditingController();
  final _cardNameController = TextEditingController();
  final _cardExpiryController = TextEditingController();
  final _cardCvvController = TextEditingController();

  @override
  void dispose() {
    _cardNumberController.dispose();
    _cardNameController.dispose();
    _cardExpiryController.dispose();
    _cardCvvController.dispose();
    super.dispose();
  }

  bool get _needsCardForm =>
      _selected == PaymentMethodId.visa || _selected == PaymentMethodId.creditCard;

  bool get _canPay {
    if (!_needsCardForm) return true;
    return _cardNumberController.text.replaceAll(' ', '').length >= 16 &&
        _cardNameController.text.trim().isNotEmpty &&
        _cardExpiryController.text.length >= 4 &&
        _cardCvvController.text.length >= 3;
  }

  Future<void> _pay() async {
    if (_processing || !_canPay) return;
    setState(() => _processing = true);

    // Mock xử lý cổng thanh toán — thay bằng API VNPay/MoMo sau.
    await Future<void>.delayed(const Duration(milliseconds: 1400));

    if (!mounted) return;
    setState(() => _processing = false);

    final user = await AuthPrefs.currentUser();
    final userId = user?.id ?? 'mock_user';
    final courseIds = CartController.instance.items.keys.toList();

    if (!mounted) return;
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) => CheckoutSuccessDialog(userId: userId, courseIds: courseIds),
    );
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;
    final total = CartController.instance.totalPrice;
    final itemCount = CartController.instance.totalQuantity;

    return GatsThemedScaffold(
      appBar: AppBar(
        backgroundColor: gats.background,
        elevation: 0,
        title: Text(
          AppStrings.paymentTitle,
          style: AppTypography.style(fontSize: 18, fontWeight: FontWeight.w800, color: gats.textPrimary),
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
              ),
              const SizedBox(height: 20),
              Text(
                AppStrings.paymentChooseMethod,
                style: AppTypography.style(fontSize: 16, fontWeight: FontWeight.w800, color: gats.textPrimary),
              ),
              const SizedBox(height: 12),
              ...PaymentMethodOption.vietnamDefaults.map(
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
            ],
          ),
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
        subtitle: AppStrings.paymentSecureNote,
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
        subtitle: AppStrings.paymentRedirectNote,
      ),
      PaymentMethodId.vnpay => _InfoPanel(
        key: const ValueKey('vnpay'),
        icon: Icons.storefront_outlined,
        color: const Color(0xFF0052A5),
        title: AppStrings.paymentVnpayHint,
        subtitle: AppStrings.paymentRedirectNote,
      ),
      PaymentMethodId.qrCode => _QrPanel(
        key: const ValueKey('qr'),
        amount: formatVndPrice(total),
      ),
    };
  }
}

class _OrderSummaryCard extends StatelessWidget {
  const _OrderSummaryCard({required this.totalLabel, required this.itemCount});

  final String totalLabel;
  final int itemCount;

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
            style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            totalLabel,
            style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          Text(
            AppStrings.paymentItemCount.replaceFirst('%d', '$itemCount'),
            style: const TextStyle(color: Colors.white70, fontSize: 12),
          ),
        ],
      ),
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
    final selected = groupValue == method.id;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Ink(
            decoration: BoxDecoration(
              color: gats.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: selected ? gats.lavenderAccent : gats.divider.withValues(alpha: 0.6),
                width: selected ? 2 : 1,
              ),
              boxShadow: selected ? null : (gats.isStarry ? null : AppShadows.card),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: method.accentColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(method.icon, color: method.accentColor, size: 22),
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
                              fontSize: 14,
                              color: gats.textPrimary,
                            ),
                          ),
                          if (method.badge != null) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: method.accentColor.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                method.badge!,
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: method.accentColor,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        method.subtitle,
                        style: TextStyle(fontSize: 11, color: gats.textSecondary, height: 1.3),
                      ),
                    ],
                  ),
                ),
                Radio<PaymentMethodId>(
                  value: method.id,
                  groupValue: groupValue,
                  onChanged: (_) => onTap(),
                  activeColor: gats.lavenderAccent,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
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
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: gats.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: gats.divider.withValues(alpha: 0.5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontWeight: FontWeight.w700, color: gats.textPrimary, height: 1.4)),
                const SizedBox(height: 4),
                Text(subtitle, style: TextStyle(fontSize: 12, color: gats.textSecondary, height: 1.4)),
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
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        );

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: gats.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: gats.divider.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(AppStrings.paymentCardDetails, style: TextStyle(fontWeight: FontWeight.w800, color: gats.textPrimary)),
          const SizedBox(height: 12),
          TextField(
            controller: cardNumberController,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(19)],
            decoration: deco(AppStrings.paymentCardNumber),
            onChanged: (_) => onChanged(),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: cardNameController,
            textCapitalization: TextCapitalization.characters,
            decoration: deco(AppStrings.paymentCardName),
            onChanged: (_) => onChanged(),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: cardExpiryController,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(4)],
                  decoration: deco(AppStrings.paymentCardExpiry),
                  onChanged: (_) => onChanged(),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: cardCvvController,
                  keyboardType: TextInputType.number,
                  obscureText: true,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(4)],
                  decoration: deco(AppStrings.paymentCardCvv),
                  onChanged: (_) => onChanged(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Icon(Icons.lock_outline, size: 14, color: gats.textSecondary),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  AppStrings.paymentSecureNote,
                  style: TextStyle(fontSize: 11, color: gats.textSecondary),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QrPanel extends StatelessWidget {
  const _QrPanel({super.key, required this.amount});

  final String amount;

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
          Text(AppStrings.paymentQrHint, style: TextStyle(fontWeight: FontWeight.w700, color: gats.textPrimary)),
          const SizedBox(height: 16),
          Container(
            width: 180,
            height: 180,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: gats.divider),
            ),
            child: CustomPaint(painter: _MockQrPainter()),
          ),
          const SizedBox(height: 12),
          Text(amount, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: gats.lavenderAccent)),
          const SizedBox(height: 6),
          Text(AppStrings.paymentQrScanNote, style: TextStyle(fontSize: 11, color: gats.textSecondary)),
        ],
      ),
    );
  }
}

class _MockQrPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = const Color(0xFF111827);
    const cell = 8.0;
    for (double y = 0; y < size.height; y += cell) {
      for (double x = 0; x < size.width; x += cell) {
        if ((x + y).toInt() % (cell * 2) < cell) {
          canvas.drawRect(Rect.fromLTWH(x, y, cell - 1, cell - 1), paint);
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
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
    final isApplePay = method == PaymentMethodId.applePay;

    return Container(
      padding: EdgeInsets.fromLTRB(20, 14, 20, 14 + MediaQuery.paddingOf(context).bottom),
      decoration: BoxDecoration(
        color: gats.surface,
        border: Border(top: BorderSide(color: gats.divider.withValues(alpha: 0.6))),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, -4)),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(AppStrings.cartTotal, style: TextStyle(color: gats.textSecondary, fontWeight: FontWeight.w600)),
              Text(amount, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: gats.lavenderAccent)),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: isApplePay ? Colors.black : gats.lavenderAccent,
                foregroundColor: Colors.white,
                disabledBackgroundColor: gats.divider,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
              ),
              onPressed: enabled ? onPay : null,
              child: processing
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (isApplePay) ...[
                          const Icon(Icons.apple, size: 22),
                          const SizedBox(width: 6),
                        ],
                        Text(
                          isApplePay ? AppStrings.paymentPayWithApple : AppStrings.paymentPayNow,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
