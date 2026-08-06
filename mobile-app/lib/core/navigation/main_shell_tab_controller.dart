import 'package:flutter/foundation.dart';

/// Điều hướng tab [MainShell] từ màn con (vd. Daily → Coach).
class MainShellTabController extends ChangeNotifier {
  MainShellTabController._();
  static final MainShellTabController instance = MainShellTabController._();

  int? _pendingIndex;

  /// Yêu cầu chuyển tab — [MainShell] lắng nghe và apply.
  void goTo(int tabIndex) {
    _pendingIndex = tabIndex;
    notifyListeners();
  }

  int? takePending() {
    final index = _pendingIndex;
    _pendingIndex = null;
    return index;
  }
}
