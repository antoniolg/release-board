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

  findByReleaseWithChecklists(releaseId) {
    const cards = this.db.prepare(`
      SELECT c.* FROM cards c
      JOIN columns col ON c.column_id = col.id
      WHERE col.release_id = ?
      ORDER BY col.position, c.position
    `).all(releaseId);

    if (cards.length === 0) return [];

    const cardIds = cards.map(c => c.id);
    const placeholders = cardIds.map(() => "?").join(",");
    const allChecklists = this.db.prepare(
      `SELECT * FROM checklist_items WHERE card_id IN (${placeholders}) ORDER BY position`
    ).all(...cardIds);

    const checklistsByCard = {};
    for (const item of allChecklists) {
      if (!checklistsByCard[item.card_id]) checklistsByCard[item.card_id] = [];
      checklistsByCard[item.card_id].push(item);
    }

    return cards.map(c => ({
      ...c,
      labels: JSON.parse(c.labels || "[]"),
      checklist: checklistsByCard[c.id] || [],
    }));
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
