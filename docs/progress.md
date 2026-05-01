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
| 2.1 | Firebase project linked to app | Partial (`google-services.json`, `firebase_options.dart` exist) |
| 2.2 | Document / confirm `DefaultFirebaseOptions` in `main.dart` if you want explicit options | Planned (optional; Android often uses `google-services.json`) |

---

## Phase 3 — Authentication

| Step | Description | Status |
|------|-------------|--------|
| 3.1 | Email/password sign-in and sign-up wired to `AuthService` | Planned |
| 3.2 | Google Sign-In | Planned |
| 3.3 | Phone OTP | Planned |
| 3.4 | Password reset (replace placeholder snackbar) | Planned |
| 3.5 | User-friendly error handling (no raw exception leakage) | Planned |

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

Phase 1 completed: project structure, routing fix, theme extraction, documentation, `.env` gitignore pattern.
