# 07 — Backend and OpenAI Security

## Architecture Rule

**OpenAI is never called from the frontend.** All AI calls go through the backend, which verifies the user's Firebase token before processing.

## Request Flow

```
Frontend (React)
  → sends: { lat, lng, budget, nearbyPlaces, savedTrips } + Authorization: Bearer <token>
  → POST /api/planner/generate

Backend (Express)
  → verifyToken (Firebase Admin) → validatePlannerRequest
  → fetches weather (OpenWeatherMap)
  → builds prompt
  → calls OpenAI gpt-4o-mini
  → returns { plan }
```

## Rate Limiting

| Endpoint | Limit |
|---|---|
| All routes | 200 req / 15 min (global) |
| `/api/planner/generate` | 20 req / hour (per IP) |

## Input Validation

- `lat` / `lng`: must be valid numeric coordinates within real-world range
- `budget`: must be a positive finite number ≤ 1,000,000
- Request body: max 10 KB (Express body parser limit)
- All validated in `backend/src/middleware/validate.js`

## Error Handling

- All errors caught in global Express error handler
- Raw error messages never sent to client
- Client always receives a generic friendly message
- Internal errors logged server-side without PII

## Environment Variables

See `backend/.env.example` for full list. Never committed to git.

## Files

- `backend/src/index.js` — Express app, global middleware, error handler
- `backend/src/middleware/auth.js` — Firebase token verification
- `backend/src/middleware/validate.js` — Input validation
- `backend/src/routes/planner.js` — OpenAI integration
- `backend/src/routes/places.js` — Google Places proxy
- `backend/src/firebaseAdmin.js` — Firebase Admin SDK init
