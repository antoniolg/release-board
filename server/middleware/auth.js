function authMiddleware(req, res, next) {
  const apiKey = process.env.API_KEY;
  
  // If no API_KEY is set, skip auth (development mode)
  if (!apiKey) {
    return next();
  }

  const providedKey = req.headers["x-api-key"] || req.query.api_key;
  
  if (!providedKey) {
    return res.status(401).json({ error: "API key required" });
  }

  if (providedKey !== apiKey) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  next();
}

module.exports = authMiddleware;
