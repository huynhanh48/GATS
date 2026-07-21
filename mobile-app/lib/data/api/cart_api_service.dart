import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/course_api_paths.dart';

class BeCartItem {
  const BeCartItem({
    required this.id,
    required this.courseId,
    required this.quantity,
    required this.finalPrice,
    required this.lineTotal,
    this.title,
    this.thumbnail,
  });

  final String id;
  final String courseId;
  final int quantity;
  final int finalPrice;
  final int lineTotal;
  final String? title;
  final String? thumbnail;

  factory BeCartItem.fromJson(Map<String, dynamic> json) {
    final course = json['course'];
    final courseMap = course is Map ? Map<String, dynamic>.from(course) : null;
    return BeCartItem(
      id: json['id']?.toString() ?? '',
      courseId: json['courseId']?.toString() ?? '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      finalPrice: (json['finalPrice'] as num?)?.toInt() ?? 0,
      lineTotal: (json['lineTotal'] as num?)?.toInt() ?? 0,
      title: courseMap?['title']?.toString(),
      thumbnail: courseMap?['thumbnail']?.toString(),
    );
  }
}

class BeCart {
  const BeCart({
    required this.id,
    required this.items,
    required this.totalAmount,
    required this.itemCount,
  });

  final String id;
  final List<BeCartItem> items;
  final int totalAmount;
  final int itemCount;

  factory BeCart.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    final items = rawItems is List
        ? rawItems
            .whereType<Map>()
            .map((e) => BeCartItem.fromJson(Map<String, dynamic>.from(e)))
            .where((e) => e.id.isNotEmpty && e.courseId.isNotEmpty)
            .toList()
        : <BeCartItem>[];
    return BeCart(
      id: json['id']?.toString() ?? '',
      items: items,
      totalAmount: (json['totalAmount'] as num?)?.toInt() ?? 0,
      itemCount: (json['itemCount'] as num?)?.toInt() ?? items.length,
    );
  }
}

/// Gọi BE `/api/cart`.
abstract final class CartApiService {
  static Future<BeCart> getCart({required String token}) async {
    final json = await ApiClient.get(CartApiPaths.cart, token: token);
    return _parseCart(json);
  }

  static Future<BeCart> addItem({
    required String courseId,
    required String token,
  }) async {
    final json = await ApiClient.post(
      CartApiPaths.cart,
      body: {'courseId': courseId, 'quantity': 1},
      token: token,
    );
    return _parseCart(json);
  }

  static Future<BeCart> removeItem({
    required String itemId,
    required String token,
  }) async {
    final json = await ApiClient.delete(
      CartApiPaths.item(itemId),
      token: token,
    );
    return _parseCart(json);
  }

  static Future<BeCart> clearCart({required String token}) async {
    final json = await ApiClient.delete(CartApiPaths.cart, token: token);
    return _parseCart(json);
  }

  static BeCart _parseCart(Map<String, dynamic> json) {
    final cart = json['cart'];
    if (cart is Map) {
      return BeCart.fromJson(Map<String, dynamic>.from(cart));
    }
    return const BeCart(id: '', items: [], totalAmount: 0, itemCount: 0);
  }
}
