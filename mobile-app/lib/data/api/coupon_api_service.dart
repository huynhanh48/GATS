import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/coupon_api_paths.dart';

class CouponPreviewDto {
  const CouponPreviewDto({
    required this.code,
    required this.type,
    required this.value,
    required this.discountAmount,
    required this.finalAmount,
  });

  final String code;
  final String type;
  final num value;
  final int discountAmount;
  final int finalAmount;

  factory CouponPreviewDto.fromJson(Map<String, dynamic> json) {
    return CouponPreviewDto(
      code: json['code']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      value: (json['value'] as num?) ?? 0,
      discountAmount: (json['discountAmount'] as num?)?.toInt() ?? 0,
      finalAmount: (json['finalAmount'] as num?)?.toInt() ?? 0,
    );
  }
}

abstract final class CouponApiService {
  static Future<CouponPreviewDto> preview({
    required String token,
    required String code,
    required int orderAmount,
  }) async {
    final json = await ApiClient.post(
      CouponApiPaths.preview,
      token: token,
      body: {
        'code': code.trim(),
        'orderAmount': orderAmount,
      },
    );
    final data = json['data'];
    if (data is Map<String, dynamic>) {
      return CouponPreviewDto.fromJson(data);
    }
    if (data is Map) {
      return CouponPreviewDto.fromJson(Map<String, dynamic>.from(data));
    }
    throw StateError('Coupon preview trống');
  }
}
