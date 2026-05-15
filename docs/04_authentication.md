# 04 — Authentication

## Status: Phase 4 (not yet implemented)

## Planned Methods

| Method | Library | Status |
|---|---|---|
| Email + Password | Firebase Auth Web SDK | Planned — Phase 4 |
| Google Sign-In | Firebase Auth + GoogleAuthProvider | Planned — Phase 4 |
| Phone OTP | Firebase Auth (reCAPTCHA) | Deferred — Phase 4+ |

## Auth Flow

1. User visits `/login` or `/signup`
2. On success, Firebase sets a session cookie / ID token in memory
3. `onAuthStateChanged` listener in `AuthContext` updates global `user` state
4. `ProtectedRoute` component redirects unauthenticated users to `/login`
5. All backend requests include `Authorization: Bearer <idToken>` header
6. Backend verifies token with Firebase Admin SDK on every request

## Files

- `web/src/services/authService.js` — signUp, login, loginWithGoogle, logout, resetPassword
- `web/src/services/firebase.js` — Firebase app init (auth + db)
- `web/src/context/AuthContext.jsx` — global auth state via React context
- `web/src/components/ProtectedRoute.jsx` — route guard
- `web/src/pages/LoginPage.jsx` — UI (Phase 4)
- `web/src/pages/SignupPage.jsx` — UI (Phase 4)

## Security Decisions

- Passwords never logged or stored by our code (Firebase handles hashing)
- ID token refreshed automatically by Firebase SDK
- Token sent in Authorization header, not cookies, to avoid CSRF risk
- Password reset via Firebase `sendPasswordResetEmail` — we never handle reset tokens

## Next Step

Phase 2: Landing page. Phase 3: Firebase console setup. Phase 4: Full auth UI.
