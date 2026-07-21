import 'package:flutter/foundation.dart';
import 'package:gats_academy/core/network/api_exception.dart';
import 'package:gats_academy/core/services/auth_prefs.dart';
import 'package:gats_academy/data/api/cart_api_service.dart';
import 'package:gats_academy/features/course/course_module.dart';

/// Giỏ hàng sync với BE `/api/cart`. Wishlist vẫn local (BE chưa có).
///
/// BE chỉ cho quantity = 1 / khóa (digital).
class CartController extends ChangeNotifier {
  CartController._();
  static final CartController instance = CartController._();

  /// courseId → quantity (luôn 1 khi sync từ BE).
  final Map<String, int> _items = {};

  /// courseId → cart item UUID (để DELETE `/api/cart/items/:id`).
  final Map<String, String> _itemIds = {};

  /// courseId → đơn giá VND từ BE (ưu tiên hơn catalog local).
  final Map<String, int> _unitPrices = {};

  final Set<String> _wishlist = {};

  bool _loading = false;
  String? lastError;

  Map<String, int> get items => Map.unmodifiable(_items);
  Set<String> get wishlist => Set.unmodifiable(_wishlist);
  bool get isLoading => _loading;

  int get totalQuantity => _items.values.fold(0, (sum, qty) => sum + qty);

  double get totalPrice {
    double total = 0;
    for (final entry in _items.entries) {
      final bePrice = _unitPrices[entry.key];
      if (bePrice != null) {
        total += bePrice * entry.value;
        continue;
      }
      final course = CourseModule.repository.getCourse(entry.key);
      if (course != null) {
        total += course.effectivePrice * entry.value;
      }
    }
    return total;
  }

  bool isInCart(String courseId) => _items.containsKey(courseId);
  int getQuantity(String courseId) => _items[courseId] ?? 0;

  /// Sync giỏ từ BE sau login / app start.
  Future<void> syncFromApi() async {
    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) {
      _items.clear();
      _itemIds.clear();
      _unitPrices.clear();
      notifyListeners();
      return;
    }
    _loading = true;
    lastError = null;
    notifyListeners();
    try {
      final cart = await CartApiService.getCart(token: token);
      _applyCart(cart);
    } catch (e) {
      lastError = _messageOf(e);
      debugPrint('CartController.syncFromApi: $e');
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> addToCart(String courseId, {int quantity = 1}) async {
    lastError = null;
    final token = await AuthPrefs.accessToken();
    if (token == null || token.isEmpty) {
      lastError = 'Vui lòng đăng nhập để thêm vào giỏ hàng';
      notifyListeners();
      throw ApiException(lastError!);
    }

    // Optimistic — BE quantity max 1.
    _items[courseId] = 1;
    notifyListeners();

    try {
      final cart = await CartApiService.addItem(
        courseId: courseId,
        token: token,
      );
      _applyCart(cart);
      notifyListeners();
    } catch (e) {
      lastError = _messageOf(e);
      debugPrint('CartController.addToCart: $e');
      try {
        final cart = await CartApiService.getCart(token: token);
        _applyCart(cart);
      } catch (_) {
        _items.remove(courseId);
        _itemIds.remove(courseId);
        _unitPrices.remove(courseId);
      }
      notifyListeners();
      rethrow;
    }
  }

  /// BE không hỗ trợ seat > 1 — giảm về 0 = xóa; tăng bị bỏ qua.
  Future<void> updateQuantity(String courseId, int quantity) async {
    if (quantity <= 0) {
      await removeFromCart(courseId);
      return;
    }
    if (!_items.containsKey(courseId)) return;
    _items[courseId] = 1;
    notifyListeners();
  }

  Future<void> removeFromCart(String courseId) async {
    lastError = null;
    final itemId = _itemIds[courseId];
    _items.remove(courseId);
    _itemIds.remove(courseId);
    _unitPrices.remove(courseId);
    notifyListeners();

    final token = await AuthPrefs.accessToken();
    if (token == null || itemId == null || itemId.isEmpty) return;

    try {
      final cart = await CartApiService.removeItem(
        itemId: itemId,
        token: token,
      );
      _applyCart(cart);
      notifyListeners();
    } catch (e) {
      lastError = _messageOf(e);
      debugPrint('CartController.removeFromCart: $e');
      await syncFromApi();
    }
  }

  void toggleWishlist(String courseId) {
    if (_wishlist.contains(courseId)) {
      _wishlist.remove(courseId);
    } else {
      _wishlist.add(courseId);
    }
    notifyListeners();
  }

  bool isInWishlist(String courseId) => _wishlist.contains(courseId);

  /// Xóa local ngay (sau khi tạo order BE đã clear cart server-side).
  void clearLocal() {
    _items.clear();
    _itemIds.clear();
    _unitPrices.clear();
    notifyListeners();
  }

  Future<void> clearCart() async {
    clearLocal();
    final token = await AuthPrefs.accessToken();
    if (token == null) return;
    try {
      await CartApiService.clearCart(token: token);
    } catch (e) {
      debugPrint('CartController.clearCart: $e');
    }
  }

  void _applyCart(BeCart cart) {
    _items.clear();
    _itemIds.clear();
    _unitPrices.clear();
    for (final item in cart.items) {
      _items[item.courseId] = 1;
      _itemIds[item.courseId] = item.id;
      _unitPrices[item.courseId] = item.finalPrice;
    }
  }

  static String _messageOf(Object e) {
    if (e is ApiException) return e.message;
    return e.toString();
  }
}
