# 00 - Project Overview

## Product
GetaWay Web helps users plan weekend getaways with location-aware and budget-aware recommendations.

## Core goals
- Secure authentication.
- Map and nearby places.
- Weather-aware recommendations.
- AI-generated plans through backend only.
- Saved user-specific trips with anti-repetition logic.

## Stack decision
- Frontend: React + Vite
- Backend: Node.js + Express

## Security baseline
- No OpenAI keys in frontend.
- `.env` files ignored by git.
- Input validation and rate limiting required before AI endpoints.
