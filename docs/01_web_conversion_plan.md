# 01 — Web Conversion Plan

## What Was Kept from Flutter

| Flutter Asset | Web Equivalent |
|---|---|
| Firebase project `getaway-d6987` | Reused — add a web app in Firebase Console |
| `GetaWay_Logo.png`, `Login.png`, `google_logo.png` | Copied to `web/public/assets/images/` |
| Auth flow design (email + Google) | Rebuilt in React / Firebase Web SDK |
| Password strength UX | Rebuilt in React |
| Motivational splash concept | Recreated as CSS animation on landing page |
| Product vision | Fully carried over |

## What Was Replaced

| Flutter Thing | Reason |
|---|---|
| All Dart code | Web stack replaces it entirely |
| `pubspec.yaml`, `android/` | Android-only, not needed for web |
| `firebase_options.dart` (Android) | Replaced by Firebase Web SDK env vars |
| `google-services.json` | Android-only |
| `intl_phone_field` Flutter package | Not needed in Phase 1; phone OTP deferred |

## Phase Plan

| Phase | Description |
|---|---|
| 0 | Analyze project (done) |
| 1 | Scaffold web + backend + docs (done) |
| 2 | Polished landing page + base UI system |
| 3 | Firebase setup (register web app, Firestore rules) |
| 4 | Authentication (email + Google Sign-In) |
| 5 | Protected dashboard / home |
| 6 | Location permission flow |
| 7 | Google Maps integration |
| 8 | Nearby places |
| 9 | Weather integration |
| 10 | Backend hardening |
| 11 | Secure OpenAI AI planner |
| 12 | Budget-based updates |
| 13 | Saved trips + repeat avoidance |
| 14 | Optimization, testing, security review, final docs |
