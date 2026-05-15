# 02 — Setup and Structure

## Prerequisites

- Node.js 18+
- npm 9+
- A Firebase project with web app registered
- Google Cloud Console project with Maps JS API enabled

## Running the Web App (Development)

```bash
cd web
cp .env.example .env.local
# Fill in .env.local with your Firebase config and Maps key
npm install
npm run dev
# Runs on http://localhost:5173
```

## Running the Backend (Development)

```bash
cd backend
cp .env.example .env
# Fill in .env with your secrets (OpenAI key, Firebase service account, etc.)
npm install
npm run dev
# Runs on http://localhost:5000
```

## Building for Production

```bash
# Frontend
cd web && npm run build
# Output: web/dist/

# Backend
# Deploy src/ to your server or Cloud Functions
```

## Folder Structure

```
web/
├── public/
│   └── assets/images/        ← Logo, hero images
├── src/
│   ├── components/           ← Reusable UI (Button, Input, Modal, etc.)
│   ├── pages/                ← Route-level pages
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   └── Dashboard.jsx
│   ├── services/
│   │   ├── firebase.js       ← Firebase app init
│   │   ├── authService.js    ← Auth helpers
│   │   └── apiService.js     ← Calls backend only
│   ├── context/
│   │   └── AuthContext.jsx   ← Auth state for whole app
│   ├── hooks/                ← Custom hooks (useLocation, useWeather, etc.)
│   ├── styles/               ← Global CSS, design tokens
│   ├── App.jsx               ← Router + providers
│   └── main.jsx              ← Entry point
├── .env.example
└── vite.config.js

backend/
├── src/
│   ├── routes/
│   │   ├── planner.js        ← POST /api/planner/generate
│   │   └── places.js         ← GET /api/places/nearby
│   ├── middleware/
│   │   ├── auth.js           ← Firebase token verification
│   │   └── validate.js       ← Input validation
│   ├── firebaseAdmin.js      ← Firebase Admin SDK init
│   └── index.js              ← Express app entry
├── .env.example
└── package.json
```

## Environment Variables

### Frontend (`web/.env.local`)
All start with `VITE_` to be accessible in Vite builds.
See `web/.env.example` for full list.

### Backend (`backend/.env`)
Never commit. See `backend/.env.example` for full list.
