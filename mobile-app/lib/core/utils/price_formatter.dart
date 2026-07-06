import 'package:gats_academy/core/constants/app_strings.dart';

/// Format a price as Vietnamese đồng with thousand separators.
///
/// Returns [AppStrings.storeFree] when [price] ≤ 0.
String formatVndPrice(double price) {
  if (price <= 0) return AppStrings.storeFree;
  final buffer = StringBuffer();
  final str = price.toInt().toString();
  final len = str.length;
  for (int i = 0; i < len; i++) {
    if (i > 0 && (len - i) % 3 == 0) {
      buffer.write('.');
    }
    buffer.write(str[i]);
  }
  buffer.write(' đ');
  return buffer.toString();
}
