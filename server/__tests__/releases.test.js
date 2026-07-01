const { createDb } = require("../db");
const { createMigrator } = require("../migrations");
const { v4: uuidv4 } = require("uuid");

describe("releases API", () => {
  let db;

  beforeAll(async () => {
    db = createDb(":memory:");
    await createMigrator(db).up();
  });

  afterAll(() => { if (db) db.close(); });

  it("can insert and retrieve a release", () => {
    const id = uuidv4();
    db.prepare("INSERT INTO releases (id, name, version) VALUES (?, ?, ?)").run(id, "Test Release", "1.0.0");
    const release = db.prepare("SELECT * FROM releases WHERE id = ?").get(id);
    expect(release.name).toBe("Test Release");
    expect(release.version).toBe("1.0.0");
  });

  it("can insert release with default columns", () => {
    const id = uuidv4();
    db.prepare("INSERT INTO releases (id, name, version) VALUES (?, ?, ?)").run(id, "v2", "2.0");
    const cols = ["Backlog", "In Progress", "Review", "Done"];
    const insertCol = db.prepare("INSERT INTO columns (id, release_id, name, color, position) VALUES (?, ?, ?, ?, ?)");
    cols.forEach((name, i) => insertCol.run(uuidv4(), id, name, "#000", i));
    const result = db.prepare("SELECT * FROM columns WHERE release_id = ?").all(id);
    expect(result).toHaveLength(4);
  });
});
