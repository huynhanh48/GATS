/// Paths khớp BE `src/common/paths/certificate.ts`.
abstract final class CertificateApiPaths {
  static const mine = '/api/certificates/mine';
  static String verify(String certificateNumber) =>
      '/api/certificates/verify/$certificateNumber';
}
