const express = require("express");
const validate = require("../middleware/validate");
const { columnSchema } = require("../validators");

function createColumnsRouter({ columnService }) {
  const router = express.Router();

  router.get("/:releaseId", (req, res) => {
    const cols = columnService.getByRelease(req.params.releaseId);
    res.json(cols);
  });

  router.post("/", validate(columnSchema), (req, res) => {
    const col = columnService.create(req.body.release_id, req.body.name, req.body.color);
    res.status(201).json(col);
  });

  router.put("/:id", validate(columnSchema.partial()), (req, res) => {
    const col = columnService.update(req.params.id, req.body);
    if (!col) return res.status(404).json({ error: "not found" });
    res.json(col);
  });

  router.delete("/:id", (req, res) => {
    const info = columnService.delete(req.params.id);
    if (info && info.changes === 0) {
      return res.status(404).json({ error: "not found" });
    }
    res.json({ ok: true });
  });

  return router;
}

module.exports = createColumnsRouter;
