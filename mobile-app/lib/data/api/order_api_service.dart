import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/course_api_paths.dart';
import 'package:gats_academy/data/api/payment_api_paths.dart';

class BeOrderSummary {
  const BeOrderSummary({
    required this.id,
    required this.status,
    required this.totalAmount,
    required this.paymentMethod,
    this.couponCode,
    this.createdAt,
    this.txnRef,
    this.txnStatus,
    this.itemTitles = const [],
  });

  final String id;
  final String status;
  final int totalAmount;
  final String paymentMethod;
  final String? couponCode;
  final String? createdAt;
  final String? txnRef;
  final String? txnStatus;
  final List<String> itemTitles;

  bool get isPending => status == 'pending';
  bool get isPaid => status == 'paid';

  factory BeOrderSummary.fromJson(Map<String, dynamic> json) {
    final items = json['items'];
    final titles = items is List
        ? items
            .whereType<Map>()
            .map((e) => e['courseName']?.toString() ?? '')
            .where((t) => t.isNotEmpty)
            .toList()
        : <String>[];
    return BeOrderSummary(
      id: json['id']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      totalAmount: (json['totalAmount'] as num?)?.toInt() ?? 0,
      paymentMethod: json['paymentMethod']?.toString() ?? '',
      couponCode: json['couponCode']?.toString(),
      createdAt: json['createdAt']?.toString(),
      txnRef: json['txnRef']?.toString(),
      txnStatus: json['txnStatus']?.toString(),
      itemTitles: titles,
    );
  }
}

class BeBankTransferPayment {
  const BeBankTransferPayment({
    required this.txnRef,
    required this.amount,
    required this.qrUrl,
    this.transferContent,
    this.bankName,
    this.bankAccountNumber,
    this.bankAccountName,
  });

  final String txnRef;
  final int amount;
  final String qrUrl;
  final String? transferContent;
  final String? bankName;
  final String? bankAccountNumber;
  final String? bankAccountName;

  factory BeBankTransferPayment.fromJson(Map<String, dynamic> json) {
    return BeBankTransferPayment(
      txnRef: json['txnRef']?.toString() ?? '',
      amount: (json['amount'] as num?)?.toInt() ?? 0,
      qrUrl: json['qrUrl']?.toString() ?? '',
      transferContent: json['transferContent']?.toString(),
      bankName: json['bankName']?.toString(),
      bankAccountNumber: json['bankAccountNumber']?.toString(),
      bankAccountName: json['bankAccountName']?.toString(),
    );
  }
}

class BeCreateOrderResult {
  const BeCreateOrderResult({
    required this.orderId,
    required this.courseIds,
    required this.paymentMethod,
    required this.paymentStatus,
    this.bankTransfer,
    this.paymentMessage,
  });

  final String orderId;
  final List<String> courseIds;
  final String paymentMethod;
  final String paymentStatus;
  final BeBankTransferPayment? bankTransfer;
  final String? paymentMessage;

  bool get isBankTransferPending =>
      paymentMethod == 'bank_transfer' &&
      paymentStatus == 'pending' &&
      bankTransfer != null &&
      bankTransfer!.qrUrl.isNotEmpty;

  bool get isPaidImmediately => paymentStatus == 'success';
}

class BeSepayCheckResult {
  const BeSepayCheckResult({
    required this.success,
    required this.status,
    required this.txnRef,
    this.orderId,
    this.amount,
    this.message,
  });

  final bool success;
  final String status;
  final String txnRef;
  final String? orderId;
  final int? amount;
  final String? message;

  bool get isPaid => success && status.toUpperCase() == 'PAID';

  factory BeSepayCheckResult.fromJson(Map<String, dynamic> json) {
    return BeSepayCheckResult(
      success: json['success'] == true,
      status: json['status']?.toString() ?? 'PENDING',
      txnRef: json['txnRef']?.toString() ?? '',
      orderId: json['orderId']?.toString(),
      amount: (json['amount'] as num?)?.toInt(),
      message: json['message']?.toString(),
    );
  }
}

/// Gọi BE `/api/orders` + `/api/payment/sepay/check`.
abstract final class OrderApiService {
  static Future<BeCreateOrderResult> createFromCart({
    required String token,
    required String paymentMethod,
    String? customerName,
    String? customerEmail,
    String? customerPhone,
    String? couponCode,
  }) async {
    final body = {
      'fromCart': true,
      'paymentMethod': paymentMethod,
      if (customerName != null && customerName.trim().isNotEmpty)
        'customerName': customerName.trim(),
      if (customerEmail != null && customerEmail.trim().isNotEmpty)
        'customerEmail': customerEmail.trim(),
      if (customerPhone != null && customerPhone.trim().isNotEmpty)
        'customerPhone': customerPhone.trim(),
      if (couponCode != null && couponCode.trim().isNotEmpty)
        'couponCode': couponCode.trim(),
    };
    // Stable across double-tap of the same checkout payload.
    final idempotencyKey = 'order-${body.toString().hashCode}';
    final json = await ApiClient.post(
      OrderApiPaths.orders,
      body: body,
      token: token,
      headers: {'Idempotency-Key': idempotencyKey},
    );
    return _parseCreateResult(json);
  }

  static Future<List<BeOrderSummary>> listMine({required String token}) async {
    final json = await ApiClient.get(OrderApiPaths.orders, token: token);
    final data = json['data'];
    if (data is! List) return const [];
    return data
        .whereType<Map>()
        .map((e) => BeOrderSummary.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  static Future<void> cancel({
    required String token,
    required String orderId,
  }) async {
    await ApiClient.post(OrderApiPaths.cancel(orderId), token: token);
  }

  static Future<BeSepayCheckResult> checkSepay({
    required String token,
    required String txnRef,
  }) async {
    final json = await ApiClient.get(
      PaymentApiPaths.sepayCheck,
      token: token,
      query: {'txnRef': txnRef},
    );
    return BeSepayCheckResult.fromJson(json);
  }

  static BeCreateOrderResult _parseCreateResult(Map<String, dynamic> json) {
    final order = json['order'];
    final orderMap =
        order is Map ? Map<String, dynamic>.from(order) : <String, dynamic>{};
    final items = orderMap['items'];
    final courseIds = items is List
        ? items
            .whereType<Map>()
            .map((e) => e['courseId']?.toString())
            .whereType<String>()
            .where((id) => id.isNotEmpty)
            .toList()
        : <String>[];

    final payment = json['payment'];
    final paymentMap = payment is Map
        ? Map<String, dynamic>.from(payment)
        : <String, dynamic>{};
    final method = paymentMap['method']?.toString() ??
        orderMap['paymentMethod']?.toString() ??
        '';
    final status = paymentMap['status']?.toString() ?? 'pending';

    BeBankTransferPayment? bank;
    if (method == 'bank_transfer') {
      bank = BeBankTransferPayment.fromJson(paymentMap);
      if (bank.qrUrl.isEmpty || bank.txnRef.isEmpty) bank = null;
    }

    return BeCreateOrderResult(
      orderId: orderMap['id']?.toString() ?? '',
      courseIds: courseIds,
      paymentMethod: method,
      paymentStatus: status,
      bankTransfer: bank,
      paymentMessage: paymentMap['message']?.toString(),
    );
  }
}
