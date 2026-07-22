# Mobile Wave 2 smoke — run from mobile-app:
#   powershell -File scripts/ci_smoke.ps1
# Optional APK: $env:MOBILE_SMOKE_APK=1
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "== flutter pub get =="
flutter pub get
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "== flutter analyze =="
flutter analyze --no-fatal-infos
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "== flutter test =="
flutter test test/progress_and_auth_wave2_test.dart
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($env:MOBILE_SMOKE_APK -eq "1") {
  Write-Host "== flutter build apk --debug =="
  flutter build apk --debug
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "OK — mobile smoke passed"
