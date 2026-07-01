const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/:cardId", (req, res) => {
  const items = db.prepare("SELECT * FROM checklist_items WHERE card_id = ? ORDER BY position").all(req.params.cardId);
  res.json(items);
});

router.post("/", (req, res) => {
  const { card_id, text } = req.body;
  if (!card_id || !text) return res.status(400).json({ error: "card_id and text required" });
  const maxPos = db.prepare("SELECT COALESCE(MAX(position),-1) as p FROM checklist_items WHERE card_id=?").get(card_id);
  const info = db.prepare("INSERT INTO checklist_items (card_id, text, position) VALUES (?,?,?)").run(card_id, text, maxPos.p + 1);
  const item = db.prepare("SELECT * FROM checklist_items WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(item);
});

router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM checklist_items WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "not found" });
  const { text, checked, position } = req.body;
  db.prepare("UPDATE checklist_items SET text=?, checked=?, position=? WHERE id=?").run(
    text ?? existing.text,
    checked !== undefined ? (checked ? 1 : 0) : existing.checked,
    position ?? existing.position,
    req.params.id
  );
  const item = db.prepare("SELECT * FROM checklist_items WHERE id = ?").get(req.params.id);
  res.json(item);
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM checklist_items WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
