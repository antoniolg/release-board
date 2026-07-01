const express = require("express");
const router = express.Router();
const { releaseService } = require("../services");
const validate = require("../middleware/validate");
const { releaseSchema } = require("../validators");

router.get("/", (req, res) => {
  const releases = releaseService.getAll();
  res.json(releases);
});

router.post("/", validate(releaseSchema), (req, res) => {
  const release = releaseService.create(req.body.name, req.body.version);
  res.status(201).json(release);
});

router.delete("/:id", (req, res) => {
  releaseService.delete(Number(req.params.id));
  res.json({ ok: true });
});

module.exports = router;
