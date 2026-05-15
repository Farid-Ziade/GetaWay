# 03 — Security Plan

## Principles

1. **Least privilege** — every key and service has the minimum access it needs.
2. **Defense in depth** — multiple layers: Firestore rules, backend auth, rate limiting, input validation.
3. **No secret in frontend** — OpenAI key, Maps server key, and Firebase Admin credentials are backend-only.
4. **User data isolation** — Firestore rules ensure users can only read/write their own documents.

## API Key Strategy

| Key | Where | Why |
|---|---|---|
| Firebase web config | Frontend (`VITE_FIREBASE_*`) | Firebase web SDK config is public by design; security enforced by rules |
| Google Maps public key | Frontend (`VITE_GOOGLE_MAPS_PUBLIC_KEY`) | Restricted to your domain in Google Cloud Console |
| Google Maps server key | Backend only (`GOOGLE_MAPS_SERVER_KEY`) | For Places API proxy; restricted to backend IP |
| OpenAI API key | Backend only (`OPENAI_API_KEY`) | Never exposed to browser |
| Firebase Admin (service account) | Backend only (`FIREBASE_SERVICE_ACCOUNT_JSON`) | For token verification and admin access |

## Firestore Security Rules (to implement in Phase 3)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Backend Security Measures

- Firebase ID token verified on every protected route (`middleware/auth.js`)
- Input validated on every route (`middleware/validate.js`)
- Rate limiting: global 200 req/15 min; AI endpoint 20 req/hour per IP
- CORS locked to allowed origins
- Request body size limited to 10 KB
- Error handler never exposes raw error messages or stack traces to clients

## What Is Logged (Backend)

- Route access errors (no PII, no tokens, no keys, no raw location)
- Server startup events

## What Is Never Logged

- Passwords
- API keys or tokens
- Full precise user coordinates
- Personal user data

## Google Cloud Console

- Maps JS API key: restrict to your production domain
- Maps server key: restrict to backend server IP
- Enable only the APIs you use (Maps JS, Places, Geocoding)

## Git Safety

- `.env`, `.env.local`, `backend/.env` — gitignored
- `google-services.json` — gitignored
- `.env.example` files only contain placeholder values, never real keys

## Known Limitations (to address later)

- Phone OTP not yet implemented (reCAPTCHA required for web)
- Rate limiting is IP-based, not user-based (can be bypassed by VPN)
- No HTTPS enforced locally (handled by Firebase Hosting in production)
- No CSP headers yet (Phase 14)
