const express = require("express");
const router = express.Router();
const { checklistService } = require("../services");

router.get("/:cardId", (req, res) => {
  const items = checklistService.getByCard(req.params.cardId);
  res.json(items);
});

router.post("/", (req, res) => {
  const { card_id, text } = req.body;
  if (!card_id || !text) return res.status(400).json({ error: "card_id and text required" });

  const item = checklistService.create({ card_id, text });
  res.status(201).json(item);
});

router.put("/:id", (req, res) => {
  const { text, checked, position } = req.body;
  const item = checklistService.update(req.params.id, { text, checked, position });
  if (!item) return res.status(404).json({ error: "not found" });
  res.json(item);
});

router.delete("/:id", (req, res) => {
  checklistService.delete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
