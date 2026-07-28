# Mobile P0 UAT Checklist

Derived from `docs/backend-mobile-experience-requirements.md` §11.

## Endpoints

| Area | Endpoint |
|---|---|
| Auth refresh | `POST /api/user/refresh` |
| Progress | `POST /api/progress/sync`, `GET /api/progress/changes` |
| Idempotency | Header `Idempotency-Key` (reserve/in-progress) |
| Devices | `POST/PATCH/DELETE /api/user/devices` |
| Bootstrap | `GET /api/mobile/bootstrap` |
| Daily check-in | `GET/POST /api/user/daily-checkin` |
| Flashcards | `GET /api/flashcards/due`, `POST …/reviews/sync` |
| Onboarding | `GET/PUT /api/user/onboarding` |

## Acceptance

- [x] Home loads `/api/mobile/bootstrap` with cache fallback
- [x] Silent 401 → refresh in `ApiClient`
- [x] Progress outbox: started/position/heartbeat/completed + delta pull
- [x] Idempotency reserve (concurrent same key)
- [ ] Switch device UAT (manual on staging)
- [ ] Payment entitlement UAT (manual)
- [x] Onboarding PUT + reco events
- [x] Push deep-link allowlist + FCM when `FCM_SERVICE_ACCOUNT_JSON` set
- [x] Error envelope + `meta.requestId`
- [x] Device register on login / unregister on logout

## Deploy (VPS)

History already exists — after pull/rebuild expect:

- `20260728130000_user_onboarding`
- `20260728140000_mobile_experience`
- `20260728150000_idempotency_status`

```bash
cd ~/GATS-ACADEMY && git pull
docker compose -p gats-academy -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

## Env (optional)

```env
MOBILE_MIN_ANDROID_VERSION=1.0.0
MOBILE_MIN_IOS_VERSION=1.0.0
MOBILE_FEATURE_FLAGS={"flashcards":true}
FCM_SERVICE_ACCOUNT_JSON={...}
FCM_PROJECT_ID=your-gcp-project
```
