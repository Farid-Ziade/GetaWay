# GetaWay v2 — progress log

This file is a simple checklist so you always know **what exists** and **what comes next**.

## How to read this

- **Done** — implemented in the repo (may still need hardening later).
- **In progress** — partially there or scaffold only.
- **Planned** — not in the codebase yet.

Roadmap phases match the main project plan (Phase 1–10).

---

## Phase 1 — Project setup

| Step | Description | Status |
|------|-------------|--------|
| 1.1 | Feature-based `lib/` folders (`app`, `core`, `features`, room for `shared`) | Done |
| 1.2 | Central theme (`AppTheme` + Material 3) | Done |
| 1.3 | Named routes + valid navigation after login button (no dead `/permission` route) | Done |
| 1.4 | Splash stays as entry; home placeholder for signed-in shell | Done |
| 1.5 | README + this file + architecture doc | Done |
| 1.6 | `.gitignore` includes `.env`; `.env.example` documents local env | Done |

---

## Phase 2 — Firebase setup

| Step | Description | Status |
|------|-------------|--------|
| 2.1 | Android: `android/app/google-services.json` + `lib/firebase_options.dart` (Android block) | Done (iOS not added yet) |
| 2.2 | `main.dart` uses `DefaultFirebaseOptions.currentPlatform` | Done |
| 2.3 | Firestore rules sketched before any user data (`docs/firestore_rules_sketch.md`) | Done |
| 2.4 | Add iOS (or Windows) via FlutterFire when you target those platforms | Planned |

---

## Phase 3 — Authentication

| Step | Description | Status |
|------|-------------|--------|
| 3.1 | Email/password sign-in and sign-up + mandatory link screen (`/link-account`) | Done |
| 3.2 | Phone SMS sign-in / sign-up + link to same user | Done |
| 3.3 | Password reset email (`sendPasswordResetEmail`) | Done |
| 3.4 | User-facing auth errors (mapped codes, no raw stack traces) | Done |
| 3.5 | Google Sign-In (+ link on “Complete your account”) | Done |
| 3.6 | Firebase Console checklist for providers + Android SHA | See `docs/firebase_phase3_setup.md` |

---

## Phases 4–10 (summary)

| Phase | Focus | Status |
|-------|--------|--------|
| 4 | Navigation flow (post-login, deep links if needed) | Planned |
| 5 | Maps + location permissions | Planned |
| 6 | Weather | Planned |
| 7 | Backend API | Planned |
| 8 | OpenAI **only** on backend | Planned |
| 9 | Saved trips + de-duplication logic | Planned |
| 10 | Optimization + security review | Planned |

---

## Last updated

Phase 3: email, phone, Google sign-in, required linking (phone + identity), password reset, Firebase setup doc (`docs/firebase_phase3_setup.md`).
