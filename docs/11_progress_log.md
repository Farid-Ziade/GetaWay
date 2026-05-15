# 11 — Progress Log

---

## Phase 0 — Analysis (Complete)

**Date:** 2026-05-15

**What was done:**
- Explored the full Flutter/Android project
- Identified all screens, features, dependencies, and security issues
- Proposed web tech stack and folder structure

**Decision:** React + Vite frontend, Node.js + Express backend, Firebase Auth + Firestore, Google Maps JS API, OpenWeatherMap, OpenAI (backend only).

---

## Phase 1 — Scaffold (Complete)

**Date:** 2026-05-15

**What was built:**
- `web/` — React + Vite app with Firebase, React Router, Google Maps packages
- `backend/` — Express app with cors, dotenv, express-rate-limit, firebase-admin, openai
- `web/src/services/firebase.js` — Firebase init (auth + db)
- `web/src/services/authService.js` — signUp, login, Google login, logout, resetPassword
- `web/src/services/apiService.js` — authenticated fetch wrapper for all backend calls
- `web/src/context/AuthContext.jsx` — global auth state
- `web/src/components/ProtectedRoute.jsx` — route guard
- `web/src/App.jsx` — BrowserRouter with public + protected routes
- `web/src/pages/` — placeholder pages (LandingPage, LoginPage, SignupPage, Dashboard)
- `backend/src/index.js` — Express app with CORS, rate limiting, error handling
- `backend/src/middleware/auth.js` — Firebase token verification
- `backend/src/middleware/validate.js` — lat/lng and budget validation
- `backend/src/firebaseAdmin.js` — Firebase Admin SDK init
- `backend/src/routes/planner.js` — POST /api/planner/generate (OpenAI)
- `backend/src/routes/places.js` — GET /api/places/nearby (Maps proxy)
- `web/.env.example` + `backend/.env.example` — placeholder env files
- `.gitignore` updated for web + backend
- `docs/` — all 12 documentation files
- `web/public/assets/images/` — Flutter assets copied (logo, login image, Google logo)

**Security decisions:**
- OpenAI key: backend only, never in frontend
- Firebase admin credentials: backend only via env var
- Firebase web config: frontend via VITE_ env vars (safe by design)
- All secrets gitignored
- Rate limiting on all routes + stricter limit on AI endpoint

**How to test:**
1. `cd web && npm run dev` — should serve React app on http://localhost:5173
2. Navigate to `/`, `/login`, `/signup` — placeholder pages should render
3. Navigate to `/dashboard` — should redirect to `/login` (ProtectedRoute)
4. `cd backend && npm run dev` — should start Express on port 5000
5. `curl http://localhost:5000/api/health` — should return `{"status":"ok",...}`

**Known limitations:**
- Placeholder pages only (no real UI yet — Phase 2)
- Firebase config not yet filled in (need to register web app — Phase 3)
- Backend .env not filled in (backend won't connect to Firebase/OpenAI without it)

**Next step:** Phase 2 — Polished landing page and base UI system.

**Suggested commit message:**
```
feat: scaffold React+Vite web app and Express backend for GetaWay Web

- Add web/ (React+Vite) with Firebase, React Router, Google Maps packages
- Add backend/ (Express) with auth middleware, rate limiting, OpenAI route
- Add .env.example for both web and backend
- Update .gitignore for web and backend secrets
- Copy Flutter image assets to web/public
- Add full docs/ structure (00–11)
```
