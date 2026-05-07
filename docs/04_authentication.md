# 04 - Authentication

## Implemented in Phase 2
- Email/password signup and login using Firebase Auth web SDK.
- Google sign-in using Firebase popup provider.
- Password reset email trigger from login page.
- Phone OTP sign-in using Firebase `signInWithPhoneNumber` and reCAPTCHA verifier.
- Basic protected route (`/dashboard`) and logout support.

## Main files
- `frontend/src/core/config/firebase.js`
- `frontend/src/features/auth/services/authService.js`
- `frontend/src/features/auth/services/AuthContext.jsx`
- `frontend/src/shared/components/ProtectedRoute.jsx`
- `frontend/src/features/auth/pages/LoginPage.jsx`
- `frontend/src/features/auth/pages/SignupPage.jsx`
- `frontend/src/features/auth/pages/DashboardPage.jsx`

## Security decisions
- Auth providers use Firebase-managed flows (no custom password storage).
- No auth secrets are hardcoded; Firebase config comes from environment variables.
- ReCAPTCHA is required before requesting phone OTP.
- Errors shown to users are generic/friendly (no raw stack traces).

## Known limitations
- Phone OTP on web requires proper Firebase phone auth + reCAPTCHA domain setup.
- UI is baseline branded, not final polished design.

## Next step
- Phase 3: location permission + map screen foundation.
