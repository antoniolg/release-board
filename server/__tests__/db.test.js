const { createDb } = require("../db");
const { createMigrator } = require("../migrations");

describe("createDb", () => {
  let db;
  afterEach(() => { if (db) db.close(); });

  it("creates an in-memory database", async () => {
    db = createDb(":memory:");
    await createMigrator(db).up();
    expect(db).toBeDefined();
  });

  it("creates all tables", async () => {
    db = createDb(":memory:");
    await createMigrator(db).up();
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    const tableNames = tables.map(t => t.name);
    expect(tableNames).toContain("releases");
    expect(tableNames).toContain("columns");
    expect(tableNames).toContain("cards");
    expect(tableNames).toContain("checklist_items");
  });

  it("enables foreign keys", () => {
    db = createDb(":memory:");
    const fk = db.pragma("foreign_keys", { simple: true });
    expect(fk).toBe(1);
  });
});
