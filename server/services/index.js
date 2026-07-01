const db = require("../db");
const ReleaseRepository = require("../repositories/releaseRepository");
const ColumnRepository = require("../repositories/columnRepository");
const CardRepository = require("../repositories/cardRepository");
const ChecklistRepository = require("../repositories/checklistRepository");
const ReleaseService = require("./releaseService");
const ColumnService = require("./columnService");
const CardService = require("./cardService");
const ChecklistService = require("./checklistService");

function createServices(database) {
  const releaseRepo = new ReleaseRepository(database);
  const columnRepo = new ColumnRepository(database);
  const cardRepo = new CardRepository(database);
  const checklistRepo = new ChecklistRepository(database);

  return {
    releaseService: new ReleaseService(releaseRepo, columnRepo, database),
    columnService: new ColumnService(columnRepo),
    cardService: new CardService(cardRepo, checklistRepo),
    checklistService: new ChecklistService(checklistRepo),
  };
}

const defaultServices = createServices(db);

module.exports = defaultServices;
module.exports.createServices = createServices;
