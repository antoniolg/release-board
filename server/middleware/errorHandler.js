function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }

  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? "Internal server error" : err.message;

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
