function placeholderAiController(_req, res) {
  res.status(501).json({ message: "AI controller is not implemented yet." });
}

module.exports = { placeholderAiController };
