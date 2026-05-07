# GetaWay Web

Production-focused web platform for planning weekend getaways with secure auth,
maps, weather-aware recommendations, AI-generated trip plans, and saved trips.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Auth provider (planned Phase 2): Firebase Auth for Google, phone OTP, reset email

## Repository structure

- `frontend/`: React web application
- `backend/`: Express API service
- `docs/`: phase-by-phase architecture, security, and implementation notes

## Phase status

- Phase 0: analysis complete
- Phase 1: web setup complete (current)
- Phase 2: authentication baseline complete
- Phase 3+: pending confirmation

## Quick start

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

## Authentication implemented

- Email/password signup and login
- Google sign-in
- Password reset email
- Phone OTP (web, Firebase + reCAPTCHA)
- Protected dashboard route + logout
