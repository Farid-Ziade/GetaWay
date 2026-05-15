# 05 — Maps and Location

## Status: Phases 6–7 (not yet implemented)

## Plan

- Phase 6: Ask user for location permission with a clear, friendly explanation
- Phase 7: Display Google Map centered on user's location with nearby place markers

## Libraries

- `@react-google-maps/api` — React wrapper for Google Maps JavaScript API
- Browser `navigator.geolocation` API — to get user's coordinates

## Location Permission Flow

1. After login, show a permission request screen explaining why location is needed
2. Call `navigator.geolocation.getCurrentPosition()`
3. Store coordinates in React state (not in Firestore or localStorage unless explicitly needed)
4. Pass coordinates to backend for places + AI planner requests

## Security Decisions

- Location is never stored in Firestore unless user explicitly saves a trip
- Precise coordinates are sent to the backend (over HTTPS) but not logged
- Backend validates lat/lng range before using them
- Maps JS API key restricted to production domain in Google Cloud Console

## Known Limitations

- No offline map support
- Geolocation accuracy depends on device and browser
