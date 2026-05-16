require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const plannerRoutes = require('./routes/planner');
const placesRoutes = require('./routes/places');

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
// In production, lock this to your Firebase Hosting domain
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5175')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── Global rate limiter (generous — per-route limiters added later) ───────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/planner', plannerRoutes);
app.use('/api/places', placesRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// ── Error handler (never expose raw stack traces to clients) ──────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Log internally (replace with a real logger in production)
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`GetaWay backend listening on port ${PORT}`);
});
