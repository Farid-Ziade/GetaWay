# 09 — Saved Trips

## Status: Phase 13 (not yet implemented)

## Firestore Schema

```
/users/{uid}/trips/{tripId}
  title: string
  summary: string
  days: array
  totalEstimatedCost: string
  savedAt: timestamp
  location: { lat: number, lng: number }  // approximate, not precise
  budget: number
```

## Security Rule

Users can only read/write documents under their own `/users/{uid}/` path.

```
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## Repeat Avoidance

- When generating a new plan, the frontend fetches the user's saved trip titles from Firestore
- Titles are sent to the backend as `savedTrips[]`
- Backend includes them in the OpenAI prompt: "Avoid repeating these past trips"

## UX

- User reviews generated plan before saving
- "Save Trip" button writes to Firestore
- "Saved Trips" page lists past trips with title, date, cost
- Empty state shown if no trips saved yet

## Known Limitations

- No deletion of saved trips yet (Phase 14)
- Trip data is not paginated yet (future improvement)
