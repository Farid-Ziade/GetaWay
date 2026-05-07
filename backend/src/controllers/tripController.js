function placeholderTripController(_req, res) {
  res.status(501).json({ message: "Trip controller is not implemented yet." });
}

module.exports = { placeholderTripController };
