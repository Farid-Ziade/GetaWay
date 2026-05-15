const express = require('express');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../middleware/auth');
const { validatePlannerRequest } = require('../middleware/validate');

const router = express.Router();

// Stricter rate limit for AI endpoint (costly calls)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI request limit reached. Please wait before trying again.' },
});

// All planner routes require authentication
router.use(verifyToken);
router.use(aiLimiter);

/**
 * POST /api/planner/generate
 * Body: { lat, lng, budget, weather, nearbyPlaces, savedTrips }
 * Returns an AI-generated weekend getaway plan.
 *
 * OpenAI is called here — never in the frontend.
 */
router.post('/generate', validatePlannerRequest, async (req, res, next) => {
  try {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { lat, lng, budget, weather, nearbyPlaces = [], savedTrips = [] } = req.body;

    const budgetLabel = budget ? `$${parseFloat(budget).toFixed(0)}` : 'flexible';
    const weatherDesc = weather?.description || 'unknown weather';
    const placesDesc =
      nearbyPlaces.length > 0
        ? nearbyPlaces.slice(0, 10).map((p) => p.name).join(', ')
        : 'no nearby places provided';
    const avoidDesc =
      savedTrips.length > 0
        ? `Avoid repeating these past trips: ${savedTrips.slice(0, 5).join(', ')}.`
        : '';

    const prompt = `You are a weekend getaway planner. The user is near coordinates (${lat}, ${lng}).
Current weather: ${weatherDesc}.
Budget: ${budgetLabel}.
Nearby places of interest: ${placesDesc}.
${avoidDesc}

Generate a practical, enjoyable 2-day weekend getaway plan. Include:
- Day 1 and Day 2 schedules
- Specific activity suggestions appropriate for the weather
- Estimated costs per activity (total within budget)
- A short title for the trip

Respond in JSON format:
{
  "title": "...",
  "summary": "...",
  "days": [
    { "day": 1, "activities": [{ "time": "...", "activity": "...", "cost": "..." }] },
    { "day": 2, "activities": [{ "time": "...", "activity": "...", "cost": "..." }] }
  ],
  "totalEstimatedCost": "..."
}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
      temperature: 0.7,
    });

    const plan = JSON.parse(response.choices[0].message.content);
    res.json({ plan });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
