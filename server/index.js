const express = require("express");
const path = require("path");
const db = require("./db");
const { createMigrator } = require("./migrations");
const createApp = require("./createApp");

const PORT = process.env.PORT || 3001;

const app = createApp(db);

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

const clientBuild = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientBuild));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuild, "index.html"));
});

createMigrator(db).up().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
