# 03 - Security Plan

## Non-negotiables
- Never expose OpenAI keys in frontend.
- Keep `.env` out of git.
- Validate every backend request body/query.
- Add backend rate limiting before AI endpoints.
- Return user-friendly errors only.

## Data safety
- User data must be scoped per user ID.
- Do not log passwords, access tokens, OTP codes, or keys.
- Ask location permission only when required by feature flow.
