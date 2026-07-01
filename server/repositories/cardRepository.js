class CardRepository {
  constructor(db) {
    this.db = db;
  }

  findByColumn(columnId) {
    return this.db.prepare("SELECT * FROM cards WHERE column_id = ? ORDER BY position").all(columnId);
  }

  findByRelease(releaseId) {
    return this.db.prepare(`
      SELECT c.* FROM cards c JOIN columns col ON c.column_id = col.id
      WHERE col.release_id = ? ORDER BY col.position, c.position
    `).all(releaseId);
  }

  findById(id) {
    return this.db.prepare("SELECT * FROM cards WHERE id = ?").get(id);
  }

  create(columnId, title, description, priority, labels, position) {
    return this.db.prepare("INSERT INTO cards (column_id, title, description, priority, labels, position) VALUES (?,?,?,?,?,?)").run(columnId, title, description, priority, JSON.stringify(labels), position);
  }

  update(id, title, description, priority, labels, columnId, position) {
    return this.db.prepare("UPDATE cards SET title=?, description=?, priority=?, labels=?, column_id=?, position=? WHERE id=?").run(title, description, priority, labels, columnId, position, id);
  }

  delete(id) {
    return this.db.prepare("DELETE FROM cards WHERE id = ?").run(id);
  }

  maxPosition(columnId) {
    return this.db.prepare("SELECT COALESCE(MAX(position),-1) as p FROM cards WHERE column_id=?").get(columnId);
  }
}

module.exports = CardRepository;
