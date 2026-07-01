const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const csrf = require("csurf");
const path = require("path");
const apiLimiter = require("./middleware/rateLimiter");
const authMiddleware = require("./middleware/auth");
const releasesRouter = require("./routes/releases");
const columnsRouter = require("./routes/columns");
const cardsRouter = require("./routes/cards");
const checklistsRouter = require("./routes/checklists");

const app = express();
const PORT = process.env.PORT || 3001;

const csrfProtection = csrf({ cookie: true });

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(helmet());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", apiLimiter);
app.use("/api", authMiddleware);

app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/api/releases", csrfProtection, releasesRouter);
app.use("/api/columns", csrfProtection, columnsRouter);
app.use("/api/cards", csrfProtection, cardsRouter);
app.use("/api/checklists", csrfProtection, checklistsRouter);

const clientBuild = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientBuild));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuild, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
