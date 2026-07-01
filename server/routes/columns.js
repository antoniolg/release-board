const express = require("express");
const router = express.Router();
const db = require("../db");
const validate = require("../middleware/validate");
const { columnSchema } = require("../validators");

router.get("/:releaseId", (req, res) => {
  const cols = db
    .prepare("SELECT * FROM columns WHERE release_id = ? ORDER BY position")
    .all(req.params.releaseId);
  res.json(cols);
});

router.post("/", validate(columnSchema), (req, res) => {
  const { release_id, name, color } = req.body;
  const maxPos = db.prepare("SELECT COALESCE(MAX(position),-1) as p FROM columns WHERE release_id=?").get(release_id);
  const info = db.prepare("INSERT INTO columns (release_id, name, color, position) VALUES (?,?,?,?)").run(
    release_id, name, color || "#6366f1", maxPos.p + 1
  );
  const col = db.prepare("SELECT * FROM columns WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(col);
});

router.put("/:id", validate(columnSchema.partial()), (req, res) => {
  const { name, color, position } = req.body;
  const existing = db.prepare("SELECT * FROM columns WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "not found" });
  db.prepare("UPDATE columns SET name=?, color=?, position=? WHERE id=?").run(
    name ?? existing.name, color ?? existing.color, position ?? existing.position, req.params.id
  );
  const col = db.prepare("SELECT * FROM columns WHERE id = ?").get(req.params.id);
  res.json(col);
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM columns WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
