import 'runtime_env_stub.dart' if (dart.library.io) 'runtime_env_io.dart' as impl;

/// True when running under `flutter test` (VM only; always false on web).
bool get isFlutterTest => impl.isFlutterTest;
