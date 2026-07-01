const { createDb } = require("../db");
const { createMigrator } = require("../migrations");

describe("releases API", () => {
  let db;

  beforeAll(async () => {
    db = createDb(":memory:");
    await createMigrator(db).up();
  });

  afterAll(() => { if (db) db.close(); });

  it("can insert and retrieve a release", () => {
    const info = db.prepare("INSERT INTO releases (name, version) VALUES (?, ?)").run("Test Release", "1.0.0");
    const release = db.prepare("SELECT * FROM releases WHERE id = ?").get(info.lastInsertRowid);
    expect(release.name).toBe("Test Release");
    expect(release.version).toBe("1.0.0");
  });

  it("can insert release with default columns", () => {
    const info = db.prepare("INSERT INTO releases (name, version) VALUES (?, ?)").run("v2", "2.0");
    const cols = ["Backlog", "In Progress", "Review", "Done"];
    const insertCol = db.prepare("INSERT INTO columns (release_id, name, color, position) VALUES (?, ?, ?, ?)");
    cols.forEach((name, i) => insertCol.run(info.lastInsertRowid, name, "#000", i));
    const result = db.prepare("SELECT * FROM columns WHERE release_id = ?").all(info.lastInsertRowid);
    expect(result).toHaveLength(4);
  });
});
