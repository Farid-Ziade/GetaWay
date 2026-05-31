# GetaWay

> AI-powered weekend getaway planner — web edition.

GetaWay helps you discover and plan the perfect 2-day weekend trip based on your location, budget, current weather, and past trips. The AI generates a personalised itinerary using real nearby venues and avoids places you've already visited.

Live at **[getaway-d6987.web.app](https://getaway-d6987.web.app)**

---

## Features

- **AI itinerary generation** — 2-day weekend plan with 4-5 activities per day, tailored to your location and budget
- **Real venue suggestions** — uses Google Places API to find and name actual nearby restaurants, parks, museums, and attractions
- **Weather-aware planning** — OpenWeatherMap integration adjusts suggestions based on live conditions (rain → indoors, hot → beach, snow → ski resorts)
- **Budget enforcement** — real-world cost estimates per activity; total is trimmed to stay within your budget
- **Smart routing** — zones venues geographically so Day 1 and Day 2 activities don't zigzag
- **Saved trips** — previously visited places are tracked and excluded from future plans (or flagged as revisits)
- **Google Maps integration** — activity cards link directly to the venue on Google Maps
- **City autocomplete** — city search with live suggestions
- **Email/password and Google Sign-In** — Firebase Authentication with email verification flow
- **Cross-device verification** — if you verify your email on your phone, the desktop tab auto-redirects to login

---

## Project Structure

```
GetaWay/
├── web/          ← React + Vite frontend (Firebase Hosting)
└── backend/      ← Node.js + Express API (Railway)
```

---

## Quick Start

### Frontend

```bash
cd web
cp .env.example .env.local
# Fill in .env.local with your Firebase keys and backend URL
npm install
npm run dev
# http://localhost:5173
```

### Backend

```bash
cd backend
cp .env.example .env
# Fill in .env with your secrets
npm install
npm run dev
# http://localhost:5000
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Maps | Google Maps JavaScript API + Places API (New) |
| Weather | OpenWeatherMap API |
| AI | Groq — Llama 4 Scout (backend only) |
| Backend | Node.js + Express, deployed on Railway |
| Hosting | Firebase Hosting |

---

## Security

- Groq and Google Places API keys are **never** in the frontend.
- All AI and Places calls go through the authenticated Express backend.
- Every backend route requires a valid Firebase ID token.
- Firestore rules restrict users to their own data.

---

## Environment Variables

### `web/.env.local`

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=
VITE_API_BASE_URL=https://your-backend.up.railway.app
```

### `backend/.env`

```
GROQ_API_KEY=
GOOGLE_PLACES_API_KEY=
OPENWEATHERMAP_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
PORT=5000
```
