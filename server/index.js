const express = require("express");
const cors = require("cors");
const path = require("path");
const apiLimiter = require("./middleware/rateLimiter");
const authMiddleware = require("./middleware/auth");
const releasesRouter = require("./routes/releases");
const columnsRouter = require("./routes/columns");
const cardsRouter = require("./routes/cards");
const checklistsRouter = require("./routes/checklists");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", apiLimiter);
app.use("/api", authMiddleware);

app.use("/api/releases", releasesRouter);
app.use("/api/columns", columnsRouter);
app.use("/api/cards", cardsRouter);
app.use("/api/checklists", checklistsRouter);

const clientBuild = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientBuild));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuild, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
