# Auth cookie / CORS verification checklist

## Development (FE `:3001` → BE `:3000`)

Prerequisites:

- `BE/config/.env.development` has `FRONTEND_URL=http://localhost:3001,http://127.0.0.1:3001`
- `web-app/.env` has `NEXT_PUBLIC_API_URL=http://localhost:3000`
- Both servers running

- [ ] Network tab: `POST /api/user/login` has `Access-Control-Allow-Credentials: true` and `Access-Control-Allow-Origin` equal to the FE origin (not `*`)
- [ ] Response sets `Set-Cookie: access_token=...; Path=/; HttpOnly; SameSite=Lax` (no `Secure` in development)
- [ ] Login JSON body has `message` + `expiresAt` and **no** `token` field
- [ ] Application → Cookies → `localhost:3000` shows `access_token` (HttpOnly; not readable from JS / not in `localStorage`)
- [ ] `GET /api/user/me` sends cookie automatically (`withCredentials`) and returns `{ user: ... }`
- [ ] Reload FE: Header shows avatar after hydrate (`status` leaves `loading`) without flash of guest CTA then avatar combatting — guest CTA hidden while `status === "loading"`
- [ ] Logout: `POST /api/user/logout` clears cookie (`Set-Cookie` max-age=0 / expired) with matching `Path=/`; Header returns to login CTA
- [ ] Logged-in `GET` that returns 401 once flips UI to anonymous (no token in `localStorage`)
- [ ] Comments: login via modal → composer appears; logout → login prompt (no CustomEvent)

## Production checklist

- [ ] `FRONTEND_URL` lists exact FE origin(s), e.g. `https://app.example.com`
- [ ] Cookie: `Secure; HttpOnly; SameSite=Lax; Path=/`
- [ ] FE and API on different hosts: browser still sends cookie to API host only when request goes to that host (expected); session hydrate still uses `GET /me` with credentials
- [ ] Mutating request with wrong/missing Origin is rejected (`403`) by `originGuard`
- [ ] HTTPS everywhere so `Secure` cookies work

## CSRF stance

- Cross-site form POSTs do not send `SameSite=Lax` cookies on cross-site POST (Lax default).
- Cross-origin XHR from non-allowlisted origins fail CORS (`credentials` + explicit origin).
- Mutating requests with an Origin outside the allowlist are rejected by `originGuard`.
