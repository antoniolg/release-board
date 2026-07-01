const express = require("express");
const router = express.Router();
const { columnService } = require("../services");
const validate = require("../middleware/validate");
const { columnSchema } = require("../validators");

router.get("/:releaseId", (req, res) => {
  const cols = columnService.getByRelease(Number(req.params.releaseId));
  res.json(cols);
});

router.post("/", validate(columnSchema), (req, res) => {
  const col = columnService.create(req.body.release_id, req.body.name, req.body.color);
  res.status(201).json(col);
});

router.put("/:id", validate(columnSchema.partial()), (req, res) => {
  const col = columnService.update(Number(req.params.id), req.body);
  if (!col) return res.status(404).json({ error: "not found" });
  res.json(col);
});

router.delete("/:id", (req, res) => {
  columnService.delete(Number(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
