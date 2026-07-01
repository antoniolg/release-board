const { db } = require("../db");
const ReleaseRepository = require("../repositories/releaseRepository");
const ColumnRepository = require("../repositories/columnRepository");
const CardRepository = require("../repositories/cardRepository");
const ChecklistRepository = require("../repositories/checklistRepository");
const ReleaseService = require("./releaseService");
const ColumnService = require("./columnService");
const CardService = require("./cardService");
const ChecklistService = require("./checklistService");

const releaseRepo = new ReleaseRepository(db);
const columnRepo = new ColumnRepository(db);
const cardRepo = new CardRepository(db);
const checklistRepo = new ChecklistRepository(db);

module.exports = {
  releaseService: new ReleaseService(releaseRepo, columnRepo, db),
  columnService: new ColumnService(columnRepo),
  cardService: new CardService(cardRepo, checklistRepo),
  checklistService: new ChecklistService(checklistRepo),
};
