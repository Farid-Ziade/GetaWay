# 06 — Weather Integration

## Status: Phase 9 (not yet implemented)

## API

- **OpenWeatherMap** — free tier, `api.openweathermap.org/data/2.5/weather`
- Called from the **backend** to avoid exposing the key in the frontend

## Plan

1. Backend receives lat/lng from authenticated request
2. Backend fetches current weather from OpenWeatherMap
3. Weather description is included in the OpenAI prompt context
4. AI avoids suggesting weather-inappropriate activities (e.g., swimming in rain)

## Weather-Aware AI Behavior

The AI prompt explicitly instructs the model to:
- Not suggest outdoor water activities in cold or rainy weather
- Suggest indoor alternatives on bad weather days
- Prioritize sunny/clear days for outdoor exploration

## Security

- OpenWeatherMap API key stored in `backend/.env` only
- Never returned to the frontend in raw form
- Only the weather description (e.g., "clear sky, 22°C") is passed to the AI prompt

## Files to Create

- `backend/src/services/weatherService.js` — fetch and cache weather data
- Weather data injected into planner prompt in `backend/src/routes/planner.js`
