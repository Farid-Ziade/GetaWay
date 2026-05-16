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
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { lat, lng, budget, location, nearbyPlaces = [], savedTrips = [] } = req.body;

    const budgetLabel  = budget ? `$${parseFloat(budget).toFixed(0)}` : 'flexible';
    const locationLine = location
      ? `The user is in or near: ${location}.${lat != null ? ` Coordinates: (${lat}, ${lng}).` : ''}`
      : `The user is near coordinates (${lat}, ${lng}).`;
    const placesDesc   =
      nearbyPlaces.length > 0
        ? `Nearby places of interest: ${nearbyPlaces.slice(0, 10).map((p) => p.name).join(', ')}.`
        : '';
    const avoidDesc    =
      savedTrips.length > 0
        ? `Avoid repeating these past trips: ${savedTrips.slice(0, 5).join(', ')}.`
        : '';

    const prompt = `You are a weekend getaway planner. ${locationLine}
Budget: ${budgetLabel}.
${placesDesc}
${avoidDesc}

Generate a practical, enjoyable 2-day weekend itinerary with 4-5 activities per day.
Return ONLY valid JSON in this exact structure — no markdown, no extra keys:
{
  "title": "Short descriptive trip title",
  "totalCost": "Estimated total e.g. $185",
  "days": [
    {
      "label": "Day 1 · Saturday",
      "activities": [
        {
          "time": "9:00 AM",
          "title": "Activity name",
          "desc": "One to two sentence description.",
          "cost": "~$20 or Free",
          "type": "food"
        }
      ]
    },
    {
      "label": "Day 2 · Sunday",
      "activities": []
    }
  ]
}
The "type" field must be one of: food, sightseeing, adventure, activity.
Keep the sum of all activity costs within the budget of ${budgetLabel}.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.7,
    });
    const plan = JSON.parse(response.choices[0].message.content);
    res.json({ plan });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
