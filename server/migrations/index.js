const path = require("path");

const MIGRATIONS_DIR = __dirname;

function createMigrator(db) {
  const migrationFiles = require("fs")
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d+_.*\.js$/.test(f))
    .sort();

  return {
    up() {
      db.exec(`CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY)`);

      const executed = new Set(
        db
          .prepare("SELECT name FROM migrations ORDER BY name")
          .all()
          .map((r) => r.name)
      );

      for (const file of migrationFiles) {
        const name = path.basename(file, ".js");
        if (!executed.has(name)) {
          const migration = require(path.join(MIGRATIONS_DIR, file));
          db.exec("BEGIN");
          try {
            migration.up({ context: db });
            db.prepare("INSERT INTO migrations (name) VALUES (?)").run(name);
            db.exec("COMMIT");
            console.log(`Migration applied: ${name}`);
          } catch (err) {
            db.exec("ROLLBACK");
            throw err;
          }
        }
      }
    },
  };
}

module.exports = { createMigrator };
