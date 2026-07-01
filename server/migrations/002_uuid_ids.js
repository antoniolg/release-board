const { v4: uuidv4 } = require("uuid");

function up({ context: db }) {
  db.exec("ALTER TABLE releases ADD COLUMN uuid TEXT");
  db.exec("ALTER TABLE columns ADD COLUMN uuid TEXT");
  db.exec("ALTER TABLE cards ADD COLUMN uuid TEXT");
  db.exec("ALTER TABLE checklist_items ADD COLUMN uuid TEXT");

  const releases = db.prepare("SELECT id FROM releases").all();
  const updateRelease = db.prepare("UPDATE releases SET uuid = ? WHERE id = ?");
  for (const r of releases) updateRelease.run(uuidv4(), r.id);

  const columns = db.prepare("SELECT id FROM columns").all();
  const updateColumn = db.prepare("UPDATE columns SET uuid = ? WHERE id = ?");
  for (const c of columns) updateColumn.run(uuidv4(), c.id);

  const cards = db.prepare("SELECT id FROM cards").all();
  const updateCard = db.prepare("UPDATE cards SET uuid = ? WHERE id = ?");
  for (const c of cards) updateCard.run(uuidv4(), c.id);

  const items = db.prepare("SELECT id FROM checklist_items").all();
  const updateItem = db.prepare("UPDATE checklist_items SET uuid = ? WHERE id = ?");
  for (const i of items) updateItem.run(uuidv4(), i.id);

  db.exec(`
    CREATE TABLE releases_new (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    INSERT INTO releases_new (id, name, version, created_at)
      SELECT uuid, name, version, created_at FROM releases;

    CREATE TABLE columns_new (
      id TEXT PRIMARY KEY,
      release_id TEXT NOT NULL,
      name TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      color TEXT DEFAULT '#6366f1',
      FOREIGN KEY (release_id) REFERENCES releases_new(id) ON DELETE CASCADE
    );
    INSERT INTO columns_new (id, release_id, name, position, color)
      SELECT c.uuid, r.uuid, c.name, c.position, c.color
      FROM columns c JOIN releases r ON c.release_id = r.id;

    CREATE TABLE cards_new (
      id TEXT PRIMARY KEY,
      column_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','critical')),
      labels TEXT DEFAULT '[]',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (column_id) REFERENCES columns_new(id) ON DELETE CASCADE
    );
    INSERT INTO cards_new (id, column_id, title, description, priority, labels, position, created_at)
      SELECT ca.uuid, co.uuid, ca.title, ca.description, ca.priority, ca.labels, ca.position, ca.created_at
      FROM cards ca JOIN columns co ON ca.column_id = co.id;

    CREATE TABLE checklist_items_new (
      id TEXT PRIMARY KEY,
      card_id TEXT NOT NULL,
      text TEXT NOT NULL,
      checked INTEGER DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (card_id) REFERENCES cards_new(id) ON DELETE CASCADE
    );
    INSERT INTO checklist_items_new (id, card_id, text, checked, position)
      SELECT ci.uuid, ca.uuid, ci.text, ci.checked, ci.position
      FROM checklist_items ci JOIN cards ca ON ci.card_id = ca.id;
  `);

  db.exec(`
    DROP TABLE checklist_items;
    DROP TABLE cards;
    DROP TABLE columns;
    DROP TABLE releases;
    ALTER TABLE releases_new RENAME TO releases;
    ALTER TABLE columns_new RENAME TO columns;
    ALTER TABLE cards_new RENAME TO cards;
    ALTER TABLE checklist_items_new RENAME TO checklist_items;
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_columns_release_id ON columns(release_id);
    CREATE INDEX IF NOT EXISTS idx_cards_column_id ON cards(column_id);
    CREATE INDEX IF NOT EXISTS idx_checklist_items_card_id ON checklist_items(card_id);
  `);
}

function down({ context: db }) {
  throw new Error("UUID migration is not reversible");
}

module.exports = { up, down };
