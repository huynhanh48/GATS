class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode, this.body});

  final String message;
  final int? statusCode;
  final Map<String, dynamic>? body;

  @override
  String toString() => 'ApiException($statusCode): $message';
}
