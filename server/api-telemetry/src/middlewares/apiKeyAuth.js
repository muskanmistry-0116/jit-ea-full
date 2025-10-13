module.exports = function (req, res, next) {
  const apiKey = req.header("x-api-key");

  // You can load this from .env or config instead of hardcoding
  const validApiKey = process.env.API_KEY || "my-secret-key";

  if (!apiKey) {
    return res.status(401).json({ message: "Missing API key" });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({ message: "Invalid API key" });
  }

  next();
};
