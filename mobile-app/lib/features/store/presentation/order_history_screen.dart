import 'package:flutter/material.dart';
import 'package:gats_academy/core/constants/app_strings.dart';
import 'package:gats_academy/core/navigation/gats_main_navigator.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/core/theme/app_theme.dart';
import 'package:gats_academy/core/utils/price_formatter.dart';
import 'package:gats_academy/core/widgets/section_card.dart';
import 'package:gats_academy/core/widgets/starry_sky_background.dart';
import 'package:gats_academy/data/api/order_api_service.dart';

class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> {
  late Future<List<BeOrderSummary>> _future;
  final Set<String> _cancelling = {};

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<BeOrderSummary>> _load() async {
    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) {
      throw ApiException(AppStrings.ordersLoginRequired);
    }
    return OrderApiService.listMine(token: token);
  }

  Future<void> _reload() {
    final future = _load();
    setState(() {
      _future = future;
    });
    return future;
  }

  Future<void> _cancel(BeOrderSummary order) async {
    final token = await AuthPrefs.accessToken();
    if (token == null) return;
    setState(() => _cancelling.add(order.id));
    try {
      await OrderApiService.cancel(token: token, orderId: order.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppStrings.ordersCancelSuccess)),
      );
      await _reload();
    } catch (e) {
      if (!mounted) return;
      final msg = e is ApiException ? e.message : e.toString();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    } finally {
      if (mounted) setState(() => _cancelling.remove(order.id));
    }
  }

  static String _statusLabel(String status) {
    return switch (status) {
      'pending' => AppStrings.ordersStatusPending,
      'paid' => AppStrings.ordersStatusPaid,
      'cancelled' || 'canceled' => AppStrings.ordersStatusCancelled,
      'failed' => AppStrings.ordersStatusFailed,
      _ => status,
    };
  }

  @override
  Widget build(BuildContext context) {
    final gats = context.gatsColors;

    return GatsThemedScaffold(
      appBar: AppBar(
        backgroundColor: gats.isStarry ? Colors.transparent : gats.background,
        surfaceTintColor: Colors.transparent,
        title: Text(
          AppStrings.ordersMineTitle,
          style: AppTypography.style(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: gats.textPrimary,
          ),
        ),
      ),
      body: FutureBuilder<List<BeOrderSummary>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            final msg = snapshot.error is ApiException
                ? (snapshot.error as ApiException).message
                : snapshot.error.toString();
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(msg, textAlign: TextAlign.center),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: _reload,
                      child: Text(AppStrings.ordersRetry),
                    ),
                  ],
                ),
              ),
            );
          }

          final orders = snapshot.data ?? const [];
          if (orders.isEmpty) {
            return Center(
              child: EmptyState(
                icon: Icons.receipt_long_outlined,
                title: AppStrings.ordersEmptyTitle,
                description: AppStrings.ordersEmptyDescription,
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _reload,
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
              itemCount: orders.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final order = orders[index];
                final cancelling = _cancelling.contains(order.id);
                return SectionCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              formatVndPrice(order.totalAmount.toDouble()),
                              style: AppTypography.style(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: gats.textPrimary,
                              ),
                            ),
                          ),
                          Text(
                            _statusLabel(order.status),
                            style: TextStyle(
                              color: order.isPaid
                                  ? const Color(0xFF2E7D32)
                                  : order.isPending
                                      ? gats.lavenderAccent
                                      : gats.textSecondary,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                      if (order.itemTitles.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          order.itemTitles.join(', '),
                          style: TextStyle(color: gats.textSecondary, fontSize: 13),
                        ),
                      ],
                      const SizedBox(height: 6),
                      Text(
                        [
                          if (order.paymentMethod.isNotEmpty)
                            order.paymentMethod,
                          if (order.couponCode != null &&
                              order.couponCode!.isNotEmpty)
                            AppStrings.ordersCouponCode(order.couponCode!),
                          if (order.createdAt != null) order.createdAt!,
                        ].join(' · '),
                        style: TextStyle(
                          color: gats.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                      if (order.isPending) ...[
                        const SizedBox(height: 12),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: cancelling ? null : () => _cancel(order),
                            child: cancelling
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : Text(AppStrings.ordersCancel),
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

void openOrderHistory(BuildContext context) {
  GatsMainNavigator.push(context, const OrderHistoryScreen());
}
