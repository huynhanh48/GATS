import 'package:flutter/foundation.dart';
import 'package:gats_academy/data/mock/mock_course_store.dart';

class CartController extends ChangeNotifier {
  CartController._();
  static final CartController instance = CartController._();

  // Maps course ID -> quantity of seat licenses
  final Map<String, int> _items = {};

  // Set of wishlisted course IDs
  final Set<String> _wishlist = {};

  Map<String, int> get items => Map.unmodifiable(_items);
  Set<String> get wishlist => Set.unmodifiable(_wishlist);

  int get totalQuantity => _items.values.fold(0, (sum, qty) => sum + qty);

  double get totalPrice {
    double total = 0.0;
    _items.forEach((courseId, qty) {
      final course = MockCourseStore.instance.courseById(courseId);
      if (course != null) {
        total += course.effectivePrice * qty;
      }
    });
    return total;
  }

  bool isInCart(String courseId) => _items.containsKey(courseId);
  int getQuantity(String courseId) => _items[courseId] ?? 0;

  void addToCart(String courseId, {int quantity = 1}) {
    if (quantity <= 0) return;
    _items[courseId] = (_items[courseId] ?? 0) + quantity;
    notifyListeners();
  }

  void updateQuantity(String courseId, int quantity) {
    if (quantity <= 0) {
      removeFromCart(courseId);
    } else {
      _items[courseId] = quantity;
      notifyListeners();
    }
  }

  void removeFromCart(String courseId) {
    if (_items.containsKey(courseId)) {
      _items.remove(courseId);
      notifyListeners();
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

  void clearCart() {
    _items.clear();
    notifyListeners();
  }

  /// Enroll user to all courses in the cart and clear it.
  void checkout(String userId) {
    _items.forEach((courseId, _) {
      MockCourseStore.instance.enrollUser(courseId, userId);
    });
    clearCart();
  }
}
