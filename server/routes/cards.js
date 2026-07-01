const express = require("express");
const router = express.Router();
const { db } = require("../db");

router.get("/column/:columnId", (req, res) => {
  const cards = db.prepare("SELECT * FROM cards WHERE column_id = ? ORDER BY position").all(req.params.columnId);
  cards.forEach((c) => {
    c.labels = JSON.parse(c.labels || "[]");
    c.checklist = db.prepare("SELECT * FROM checklist_items WHERE card_id = ? ORDER BY position").all(c.id);
  });
  res.json(cards);
});

router.get("/release/:releaseId", (req, res) => {
  const cards = db.prepare(`
    SELECT c.* FROM cards c
    JOIN columns col ON c.column_id = col.id
    WHERE col.release_id = ?
    ORDER BY col.position, c.position
  `).all(req.params.releaseId);
  cards.forEach((c) => {
    c.labels = JSON.parse(c.labels || "[]");
    c.checklist = db.prepare("SELECT * FROM checklist_items WHERE card_id = ? ORDER BY position").all(c.id);
  });
  res.json(cards);
});

router.post("/", (req, res) => {
  const { column_id, title, description, priority, labels } = req.body;
  if (!column_id || !title) return res.status(400).json({ error: "column_id and title required" });
  const maxPos = db.prepare("SELECT COALESCE(MAX(position),-1) as p FROM cards WHERE column_id=?").get(column_id);
  const info = db.prepare("INSERT INTO cards (column_id, title, description, priority, labels, position) VALUES (?,?,?,?,?,?)").run(
    column_id, title, description || "", priority || "medium", JSON.stringify(labels || []), maxPos.p + 1
  );
  const card = db.prepare("SELECT * FROM cards WHERE id = ?").get(info.lastInsertRowid);
  card.labels = JSON.parse(card.labels);
  card.checklist = [];
  res.status(201).json(card);
});

router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM cards WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "not found" });
  const { title, description, priority, labels, column_id, position } = req.body;
  db.prepare("UPDATE cards SET title=?, description=?, priority=?, labels=?, column_id=?, position=? WHERE id=?").run(
    title ?? existing.title,
    description ?? existing.description,
    priority ?? existing.priority,
    labels ? JSON.stringify(labels) : existing.labels,
    column_id ?? existing.column_id,
    position ?? existing.position,
    req.params.id
  );
  const card = db.prepare("SELECT * FROM cards WHERE id = ?").get(req.params.id);
  card.labels = JSON.parse(card.labels);
  card.checklist = db.prepare("SELECT * FROM checklist_items WHERE card_id = ? ORDER BY position").all(card.id);
  res.json(card);
});

router.patch("/:id/move", (req, res) => {
  const { column_id, position } = req.body;
  const existing = db.prepare("SELECT * FROM cards WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "not found" });
  db.prepare("UPDATE cards SET column_id=?, position=? WHERE id=?").run(
    column_id ?? existing.column_id, position ?? existing.position, req.params.id
  );
  const card = db.prepare("SELECT * FROM cards WHERE id = ?").get(req.params.id);
  card.labels = JSON.parse(card.labels);
  card.checklist = db.prepare("SELECT * FROM checklist_items WHERE card_id = ? ORDER BY position").all(card.id);
  res.json(card);
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM cards WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
