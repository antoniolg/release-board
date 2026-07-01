const { createDb } = require("../db");
const { createMigrator } = require("../migrations");
const ReleaseRepository = require("../repositories/releaseRepository");
const ColumnRepository = require("../repositories/columnRepository");
const CardRepository = require("../repositories/cardRepository");
const ChecklistRepository = require("../repositories/checklistRepository");
const ReleaseService = require("../services/releaseService");
const ColumnService = require("../services/columnService");
const CardService = require("../services/cardService");
const ChecklistService = require("../services/checklistService");

describe("services", () => {
  let db;
  let releaseService, columnService, cardService, checklistService;

  beforeEach(async () => {
    db = createDb(":memory:");
    await createMigrator(db).up();

    const releaseRepo = new ReleaseRepository(db);
    const columnRepo = new ColumnRepository(db);
    const cardRepo = new CardRepository(db);
    const checklistRepo = new ChecklistRepository(db);

    releaseService = new ReleaseService(releaseRepo, columnRepo, db);
    columnService = new ColumnService(columnRepo);
    cardService = new CardService(cardRepo, checklistRepo);
    checklistService = new ChecklistService(checklistRepo);
  });

  afterEach(() => { if (db) db.close(); });

  describe("ReleaseService", () => {
    it("creates a release with default columns", () => {
      const release = releaseService.create("v1.0", "1.0.0");
      expect(release.name).toBe("v1.0");
      expect(release.version).toBe("1.0.0");
      const cols = columnService.getByRelease(release.id);
      expect(cols).toHaveLength(4);
      expect(cols.map(c => c.name)).toEqual(["Backlog", "In Progress", "Review", "Done"]);
    });

    it("lists all releases", () => {
      releaseService.create("v1", "1.0");
      releaseService.create("v2", "2.0");
      const releases = releaseService.getAll();
      expect(releases).toHaveLength(2);
    });

    it("deletes a release and cascades", () => {
      const release = releaseService.create("v1", "1.0");
      releaseService.delete(release.id);
      expect(releaseService.getAll()).toHaveLength(0);
      expect(columnService.getByRelease(release.id)).toHaveLength(0);
    });
  });

  describe("ColumnService", () => {
    it("creates a column", () => {
      const release = releaseService.create("v1", "1.0");
      const col = columnService.create(release.id, "Test Col", "#ff0000");
      expect(col.name).toBe("Test Col");
      expect(col.color).toBe("#ff0000");
    });

    it("updates a column", () => {
      const release = releaseService.create("v1", "1.0");
      const col = columnService.create(release.id, "Old Name");
      const updated = columnService.update(col.id, { name: "New Name" });
      expect(updated.name).toBe("New Name");
    });

    it("returns null when updating non-existent column", () => {
      const result = columnService.update(999, { name: "X" });
      expect(result).toBeNull();
    });
  });

  describe("CardService", () => {
    it("creates a card", () => {
      const release = releaseService.create("v1", "1.0");
      const cols = columnService.getByRelease(release.id);
      const card = cardService.create({ column_id: cols[0].id, title: "Test Card" });
      expect(card.title).toBe("Test Card");
      expect(card.checklist).toEqual([]);
    });

    it("moves a card", () => {
      const release = releaseService.create("v1", "1.0");
      const cols = columnService.getByRelease(release.id);
      const card = cardService.create({ column_id: cols[0].id, title: "Move me" });
      const moved = cardService.move(card.id, { column_id: cols[1].id, position: 0 });
      expect(moved.column_id).toBe(cols[1].id);
    });

    it("returns null when updating non-existent card", () => {
      const result = cardService.update(999, { title: "X" });
      expect(result).toBeNull();
    });
  });

  describe("ChecklistService", () => {
    it("creates a checklist item", () => {
      const release = releaseService.create("v1", "1.0");
      const cols = columnService.getByRelease(release.id);
      const card = cardService.create({ column_id: cols[0].id, title: "Card" });
      const item = checklistService.create({ card_id: card.id, text: "Do this" });
      expect(item.text).toBe("Do this");
      expect(item.checked).toBe(0);
    });

    it("toggles checked state", () => {
      const release = releaseService.create("v1", "1.0");
      const cols = columnService.getByRelease(release.id);
      const card = cardService.create({ column_id: cols[0].id, title: "Card" });
      const item = checklistService.create({ card_id: card.id, text: "Check me" });
      const updated = checklistService.update(item.id, { checked: true });
      expect(updated.checked).toBe(1);
    });
  });
});
