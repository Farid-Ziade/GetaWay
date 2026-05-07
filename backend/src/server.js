const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const aiRoutes = require("./routes/aiRoutes");
const tripRoutes = require("./routes/tripRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  }),
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "getaway-backend" });
});

app.use("/api/ai", aiRoutes);
app.use("/api/trips", tripRoutes);

app.listen(port, () => {
  // Keep startup logs minimal and avoid printing sensitive config values.
  console.log(`GetaWay backend running on port ${port}`);
});
