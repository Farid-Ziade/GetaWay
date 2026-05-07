# 02 - Setup and Structure

## Current structure
- `frontend/`: React + Vite app shell, route shell, global theme.
- `backend/`: Express server with health endpoint and feature folder skeleton.
- `docs/`: architecture and phase documentation.

## Phase 1 implementation summary

### What was built
- Fresh web-first project structure (`frontend`, `backend`, `docs`).
- React app shell with base routes (`/` and `/login`).
- Global responsive base styling.
- Express server with secure defaults (`helmet`, CORS policy, JSON body limit).
- Health endpoint: `GET /api/health`.

### Why built this way
- Keeps the architecture simple for student-friendly learning.
- Creates clear separation of concerns before adding complex features.
- Provides a stable base for Phase 2 authentication work.

### Files created/edited
- Frontend app shell and route files under `frontend/src/app`.
- Basic pages under `frontend/src/features/auth/pages` and `frontend/src/features/map/pages`.
- Backend server and folder skeleton under `backend/src`.
- Env templates and gitignore files for frontend/backend and root.
- Root docs and README updates.

### Security decisions
- Added `.env` ignore rules (root, frontend, backend).
- Added backend CORS allowlist via `FRONTEND_ORIGIN`.
- Added `helmet` and request body size limit.
- OpenAI keys planned for backend-only env usage.

### How to test
1. Start backend and call `GET http://localhost:5000/api/health`.
2. Start frontend and open `http://localhost:5173`.
3. Navigate between Home and Login from top nav.

### Known limitations
- No authentication implementation yet (Phase 2).
- No map, weather, AI, or trip persistence logic yet.

### Next step
- Phase 2: implement Firebase web auth (email/password, Google, reset, phone OTP if practical).

### Suggested commit message
`chore: bootstrap React frontend and Express backend for GetaWay Web phase 1`

---

## Phase 2 implementation summary

### What was built
- Firebase web auth integration.
- Auth pages: login, signup, dashboard.
- Auth methods: email/password, Google, reset email, phone OTP.
- Route protection using auth context and protected route component.
- Branded baseline UI closer to GetaWay theme.

### Why it was built this way
- Keeps auth implementation simple and understandable for a student project.
- Uses one auth platform (Firebase) to avoid hybrid complexity.
- Keeps backend ready for upcoming AI/security phases without mixing concerns.

### Files created/edited
- `frontend/src/core/config/firebase.js`
- `frontend/src/features/auth/services/authService.js`
- `frontend/src/features/auth/services/AuthContext.jsx`
- `frontend/src/shared/components/ProtectedRoute.jsx`
- `frontend/src/features/auth/pages/LoginPage.jsx`
- `frontend/src/features/auth/pages/SignupPage.jsx`
- `frontend/src/features/auth/pages/DashboardPage.jsx`
- `frontend/src/app/App.jsx`
- `frontend/src/app/routes.jsx`
- `frontend/src/main.jsx`
- `frontend/src/styles/global.css`

### Security decisions
- Firebase SDK handles credential flows securely.
- `.env`-based config with no secret keys committed.
- Friendly UI error messaging only; no raw internal errors.
- Protected route blocks dashboard when unauthenticated.

### How to test
1. Add Firebase web config values in `frontend/.env` (based on `.env.example`).
2. Run frontend (`npm run dev`).
3. Test signup, login, logout, Google login, reset email.
4. Test phone OTP with valid E.164 phone number format.
5. Verify unauthenticated access to `/dashboard` redirects to `/login`.

### Known limitations
- Full visual polish is deferred to Phase 10.
- OTP reliability depends on Firebase phone auth and authorized domains.

### Next step
- Phase 3: location permission flow + map base screen.

### Suggested commit message
`feat(auth): add Firebase web auth with email, Google, reset, and phone OTP`

## Run commands

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```
