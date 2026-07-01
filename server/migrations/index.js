const { Umzug } = require("umzug");
const path = require("path");
const fs = require("fs");

function createMigrator(db) {
  return new Umzug({
    migrations: {
        glob: ["*.js", { cwd: __dirname, ignore: ["index.js"] }],
      resolve({ name, path: filePath, context }) {
        const migration = require(filePath);
        return {
          name,
          up: async () => migration.up({ context }),
          down: async () => migration.down({ context }),
        };
      },
    },
    context: db,
    storage: {
      async executed() {
        db.exec(
          "CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY)"
        );
        return db
          .prepare("SELECT name FROM migrations ORDER BY name")
          .all()
          .map((r) => r.name);
      },
      async logMigration({ name }) {
        db.prepare("INSERT INTO migrations (name) VALUES (?)").run(name);
      },
      async unlogMigration({ name }) {
        db.prepare("DELETE FROM migrations WHERE name = ?").run(name);
      },
    },
    logger: console,
  });
}

module.exports = { createMigrator };
