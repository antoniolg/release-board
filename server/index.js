const express = require("express");
const cors = require("cors");
const path = require("path");
const releasesRouter = require("./routes/releases");
const columnsRouter = require("./routes/columns");
const cardsRouter = require("./routes/cards");
const checklistsRouter = require("./routes/checklists");

const app = express();
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.use("/api/releases", releasesRouter);
app.use("/api/columns", columnsRouter);
app.use("/api/cards", cardsRouter);
app.use("/api/checklists", checklistsRouter);

app.use("/data", (req, res) => res.status(403).json({ error: "Forbidden" }));

const clientBuild = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientBuild));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuild, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
