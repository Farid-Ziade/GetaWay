# 07 - Backend and OpenAI Security

## Backend role
- Receives trip-generation input.
- Applies validation and rate limiting.
- Calls OpenAI with secret key stored in backend `.env`.

## Rules
- Never call OpenAI directly from frontend.
- Never return raw stack traces to UI.
- Add structured logs without secrets.
