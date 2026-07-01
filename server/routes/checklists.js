const express = require("express");
const router = express.Router();
const { checklistService } = require("../services");
const validate = require("../middleware/validate");
const { checklistItemSchema, checklistItemUpdateSchema } = require("../validators");

router.get("/:cardId", (req, res) => {
  const items = checklistService.getByCard(Number(req.params.cardId));
  res.json(items);
});

router.post("/", validate(checklistItemSchema), (req, res) => {
  const item = checklistService.create(req.body);
  res.status(201).json(item);
});

router.put("/:id", validate(checklistItemUpdateSchema), (req, res) => {
  const item = checklistService.update(Number(req.params.id), req.body);
  if (!item) return res.status(404).json({ error: "not found" });
  res.json(item);
});

router.delete("/:id", (req, res) => {
  checklistService.delete(Number(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
