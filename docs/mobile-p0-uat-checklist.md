# Mobile P0 UAT Checklist

Derived from `docs/backend-mobile-experience-requirements.md` §11.

## Endpoints to verify

| Area | Endpoint |
|---|---|
| Auth refresh | `POST /api/user/refresh` |
| Sessions | `GET/DELETE /api/user/sessions…` |
| Apple | `POST /api/user/auth/apple` |
| Progress sync | `POST /api/progress/sync`, `GET /api/progress/changes` |
| Idempotency | Header `Idempotency-Key` on order/enroll/quiz/assignment/progress |
| Devices | `POST/PATCH/DELETE /api/user/devices` |
| Notifications | `GET /api/notifications`, `POST …/read`, `…/read-all`, `…/:id/read` |
| Bootstrap | `GET /api/mobile/bootstrap` |
| Daily check-in | `GET/POST /api/user/daily-checkin` |
| Flashcards | `GET /api/flashcards/due`, `POST …/reviews/sync` |
| Onboarding | `GET/PUT /api/user/onboarding` |

## Acceptance

- [ ] Open app on 4G: Home useful content within ~2s (bootstrap)
- [ ] Token expires mid-lesson: silent refresh, no forced logout
- [ ] Offline mark complete → reconnect syncs once (`eventId` dedupe)
- [ ] Double-tap create order with same Idempotency-Key → one order
- [ ] Switch device: progress / streak match after sync
- [ ] Payment success unlocks course without re-login
- [ ] Onboarding API error: app fallback still works
- [ ] Push deep link only allowlisted routes
- [ ] Unpublish course while cached: access denied clearly
- [ ] Errors return `{ error: { code, message, retryable }, meta.requestId }`
- [ ] Crash report can include last `x-request-id`

## Env

```env
JWT_EXPIRES_IN=30m
APPLE_CLIENT_ID=...
# FCM later: FCM_SERVER_KEY / service account
```

## Migrate

```bash
cd BE && npm run db:migrate:versioned
# or apply migrations/20260728140000_mobile_experience/migration.sql
```

## Implementation status (dev)

P0/P1 backend contracts are implemented in code. Run migration before UAT.
FCM delivery is stubbed (`push_outbox` → marked `sent`); wire real FCM before production push.
