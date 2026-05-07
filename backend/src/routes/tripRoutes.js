const express = require("express");

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(501).json({ message: "Trip endpoints will be implemented in Phase 9." });
});

module.exports = router;
