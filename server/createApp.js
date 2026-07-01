const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const csrf = require("csurf");
const apiLimiter = require("./middleware/rateLimiter");
const authMiddleware = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");
const { createServices } = require("./services");
const ReleasesRouter = require("./routes/releases");
const ColumnsRouter = require("./routes/columns");
const CardsRouter = require("./routes/cards");
const ChecklistsRouter = require("./routes/checklists");

function createApp(db, { enableCsrf = true } = {}) {
  const app = express();
  const csrfProtection = enableCsrf ? csrf({ cookie: true }) : (req, res, next) => next();

  app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }));
  app.use(helmet());
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  app.use("/api", apiLimiter);
  app.use("/api", authMiddleware);

  if (enableCsrf) {
    app.get("/api/csrf-token", csrfProtection, (req, res) => {
      res.json({ csrfToken: req.csrfToken() });
    });
  }

  const services = createServices(db);

  app.use("/api/releases", csrfProtection, ReleasesRouter(services));
  app.use("/api/columns", csrfProtection, ColumnsRouter(services));
  app.use("/api/cards", csrfProtection, CardsRouter(services));
  app.use("/api/checklists", csrfProtection, ChecklistsRouter(services));

  app.use("/data", (req, res) => res.status(403).json({ error: "Forbidden" }));

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
