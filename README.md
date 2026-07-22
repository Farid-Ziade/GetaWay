# GetaWay

> AI-powered weekend getaway planner — web edition.

GetaWay helps you discover and plan the perfect 2-day weekend trip based on your location, budget, current weather, and past trips. The AI generates a personalised itinerary using real nearby venues and avoids places you've already visited.

Live at **getaway.services**

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
