import 'package:gats_academy/core/network/api_client.dart';
import 'package:gats_academy/data/api/certificate_api_paths.dart';

class MyCertificateDto {
  const MyCertificateDto({
    required this.id,
    required this.certificateNumber,
    required this.courseId,
    required this.status,
    required this.issuedAt,
    this.courseTitle,
    this.courseSlug,
  });

  final String id;
  final String certificateNumber;
  final String courseId;
  final String status;
  final String issuedAt;
  final String? courseTitle;
  final String? courseSlug;

  bool get isIssued => status == 'issued';

  factory MyCertificateDto.fromJson(Map<String, dynamic> json) {
    return MyCertificateDto(
      id: json['id']?.toString() ?? '',
      certificateNumber: json['certificateNumber']?.toString() ?? '',
      courseId: json['courseId']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      issuedAt: json['issuedAt']?.toString() ?? '',
      courseTitle: json['courseTitle']?.toString(),
      courseSlug: json['courseSlug']?.toString(),
    );
  }
}

abstract final class CertificateApiService {
  static Future<List<MyCertificateDto>> listMine({required String token}) async {
    final json = await ApiClient.get(
      CertificateApiPaths.mine,
      token: token,
    );
    final data = json['data'];
    if (data is! List) return const [];
    return data
        .whereType<Map>()
        .map((e) => MyCertificateDto.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }
}
