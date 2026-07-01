const express = require("express");
const validate = require("../middleware/validate");
const { releaseSchema } = require("../validators");

function createReleasesRouter({ releaseService }) {
  const router = express.Router();

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

  return router;
}

module.exports = createReleasesRouter;
