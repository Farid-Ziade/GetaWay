# GetaWay Web

> AI-powered weekend getaway planner — web edition.

GetaWay helps you discover and plan the perfect weekend trip based on your location, budget, current weather, and past trips. Powered by OpenAI and Google Maps.

---

## Project Structure

```
GetaWay/
├── web/          ← React + Vite frontend
├── backend/      ← Node.js + Express API (OpenAI, Places proxy)
├── docs/         ← Full project documentation
├── assets/       ← Original Flutter assets (reference)
└── lib/          ← Original Flutter source (reference)
```

## Quick Start

### Frontend

```bash
cd web
cp .env.example .env.local
# Fill in .env.local with your Firebase and Maps keys
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

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Maps | Google Maps JavaScript API |
| Weather | OpenWeatherMap API |
| AI | OpenAI (backend only) |
| Backend | Node.js + Express |

## Security

- OpenAI API key is **never** in the frontend.
- All AI calls go through the authenticated Express backend.
- Firestore rules restrict users to their own data.
- See [docs/03_security_plan.md](docs/03_security_plan.md) for full details.

## Documentation

Full documentation lives in [`docs/`](docs/):

- [00 — Project Overview](docs/00_project_overview.md)
- [01 — Web Conversion Plan](docs/01_web_conversion_plan.md)
- [02 — Setup and Structure](docs/02_setup_and_structure.md)
- [03 — Security Plan](docs/03_security_plan.md)
- [04 — Authentication](docs/04_authentication.md)
- [05 — Maps and Location](docs/05_maps_and_location.md)
- [06 — Weather Integration](docs/06_weather_integration.md)
- [07 — Backend and OpenAI Security](docs/07_backend_and_openai_security.md)
- [08 — AI Trip Planner](docs/08_ai_trip_planner.md)
- [09 — Saved Trips](docs/09_saved_trips.md)
- [10 — UI/UX Notes](docs/10_ui_ux_notes.md)
- [11 — Progress Log](docs/11_progress_log.md)

## Current Phase

**Phase 1 complete** — project scaffolded.
**Next:** Phase 2 — Polished landing page and base UI system.
