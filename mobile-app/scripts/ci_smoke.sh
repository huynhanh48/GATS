#!/usr/bin/env bash
# Mobile Wave 2 smoke — analyze + unit tests (+ optional debug APK).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== flutter pub get =="
flutter pub get

echo "== flutter analyze =="
flutter analyze --no-fatal-infos

echo "== flutter test =="
flutter test test/progress_and_auth_wave2_test.dart

if [[ "${MOBILE_SMOKE_APK:-0}" == "1" ]]; then
  echo "== flutter build apk --debug =="
  flutter build apk --debug
fi

echo "OK — mobile smoke passed"
