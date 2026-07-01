const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DEFAULT_DB_PATH = path.join(__dirname, "data", "releases.db");

function createDb(dbPath) {
  dbPath = dbPath || DEFAULT_DB_PATH;

  if (dbPath !== ":memory:") {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const { createMigrator } = require("./migrations");
  const migrator = createMigrator(db);
  migrator.up();

  return db;
}

module.exports = createDb();
module.exports.createDb = createDb;
