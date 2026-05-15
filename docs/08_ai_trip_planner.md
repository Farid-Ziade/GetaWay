# 08 — AI Trip Planner

## Status: Phase 11 (not yet implemented)

## Model

- `gpt-4o-mini` — fast, low-cost, sufficient for structured trip planning
- Response format: `json_object` — ensures parseable structured output

## Prompt Design

The prompt includes:
- User coordinates (city-level context, not exact address)
- Current weather description
- Budget (formatted as dollar amount)
- Up to 10 nearby places of interest
- List of past saved trips to avoid repeating

## Output Schema

```json
{
  "title": "string",
  "summary": "string",
  "days": [
    {
      "day": 1,
      "activities": [
        { "time": "string", "activity": "string", "cost": "string" }
      ]
    }
  ],
  "totalEstimatedCost": "string"
}
```

## Weather Awareness

- AI is instructed to avoid weather-inappropriate activities
- Examples: no beach trips in rain, no outdoor hikes in extreme heat

## Repeat Avoidance

- Firestore stores saved trip titles per user
- Saved trip titles are sent to backend with the generate request
- Prompt explicitly tells AI to avoid those destinations/experiences

## Security

- OpenAI API key: backend only, never in frontend
- User must be authenticated (Firebase token verified) before any AI call
- Rate limited: 20 AI requests per hour per IP
- Max tokens: 1000 (cost control)
