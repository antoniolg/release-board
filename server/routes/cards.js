const express = require("express");
const validate = require("../middleware/validate");
const { cardSchema, cardUpdateSchema, cardMoveSchema } = require("../validators");

function createCardsRouter({ cardService }) {
  const router = express.Router();

  router.get("/column/:columnId", (req, res) => {
    const cards = cardService.getByColumn(Number(req.params.columnId));
    res.json(cards);
  });

  router.get("/release/:releaseId", (req, res) => {
    const cards = cardService.getByRelease(Number(req.params.releaseId));
    res.json(cards);
  });

  router.post("/", validate(cardSchema), (req, res) => {
    const card = cardService.create(req.body);
    res.status(201).json(card);
  });

  router.put("/:id", validate(cardUpdateSchema), (req, res) => {
    const card = cardService.update(Number(req.params.id), req.body);
    if (!card) return res.status(404).json({ error: "not found" });
    res.json(card);
  });

  router.patch("/:id/move", validate(cardMoveSchema), (req, res) => {
    const card = cardService.move(Number(req.params.id), req.body);
    if (!card) return res.status(404).json({ error: "not found" });
    res.json(card);
  });

  router.delete("/:id", (req, res) => {
    const info = cardService.delete(Number(req.params.id));
    if (info && info.changes === 0) {
      return res.status(404).json({ error: "not found" });
    }
    res.json({ ok: true });
  });

  return router;
}

module.exports = createCardsRouter;
