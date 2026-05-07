const express = require("express");

const router = express.Router();

router.post("/plan", (_req, res) => {
  res.status(501).json({ message: "AI planner endpoint will be implemented in Phase 7." });
});

module.exports = router;
