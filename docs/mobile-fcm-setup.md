# Mobile FCM / Firebase setup (P0 before store push)

Real push requires a Firebase project + platform config files (not committed):

1. Firebase Console → create project → add Android `com.gat.academy` and iOS bundle id.
2. Download:
   - `android/app/google-services.json`
   - `ios/Runner/GoogleService-Info.plist`
3. Android: add to `android/settings.gradle.kts` / app plugin:
   - `id("com.google.gms.google-services")` on the app module
4. iOS: enable Push Notifications + Background Modes; upload APNs key to Firebase;
   set `aps-environment` entitlement; add Sign in with Apple if using Apple login.
5. Rebuild app → login → confirm `POST /api/user/devices` includes non-null `pushToken`.
6. Set VPS `FCM_SERVICE_ACCOUNT_JSON` + `FCM_PROJECT_ID` so BE can deliver outbox.

Without step 2–5, `PushTokenService.getToken()` returns null and device register still works for session tracking only.
