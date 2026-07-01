const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const releases = db.prepare("SELECT * FROM releases ORDER BY created_at DESC").all();
  res.json(releases);
});

router.post("/", (req, res) => {
  const { name, version } = req.body;
  if (!name || !version) return res.status(400).json({ error: "name and version required" });

  const tx = db.transaction(() => {
    const info = db.prepare("INSERT INTO releases (name, version) VALUES (?, ?)").run(name, version);
    const defaultCols = [
      { name: "Backlog", color: "#6b7280", position: 0 },
      { name: "In Progress", color: "#f59e0b", position: 1 },
      { name: "Review", color: "#3b82f6", position: 2 },
      { name: "Done", color: "#10b981", position: 3 },
    ];
    const insertCol = db.prepare("INSERT INTO columns (release_id, name, color, position) VALUES (?, ?, ?, ?)");
    for (const col of defaultCols) {
      insertCol.run(info.lastInsertRowid, col.name, col.color, col.position);
    }
    return info.lastInsertRowid;
  });

  const id = tx();
  const release = db.prepare("SELECT * FROM releases WHERE id = ?").get(id);
  res.status(201).json(release);
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM releases WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
