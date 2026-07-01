class ChecklistRepository {
  constructor(db) {
    this.db = db;
  }

  findByCard(cardId) {
    return this.db.prepare("SELECT * FROM checklist_items WHERE card_id = ? ORDER BY position").all(cardId);
  }

  findById(id) {
    return this.db.prepare("SELECT * FROM checklist_items WHERE id = ?").get(id);
  }

  create(cardId, text, position) {
    return this.db.prepare("INSERT INTO checklist_items (card_id, text, position) VALUES (?,?,?)").run(cardId, text, position);
  }

  update(id, text, checked, position) {
    return this.db.prepare("UPDATE checklist_items SET text=?, checked=?, position=? WHERE id=?").run(text, checked, position, id);
  }

  delete(id) {
    return this.db.prepare("DELETE FROM checklist_items WHERE id = ?").run(id);
  }

  maxPosition(cardId) {
    return this.db.prepare("SELECT COALESCE(MAX(position),-1) as p FROM checklist_items WHERE card_id=?").get(cardId);
  }
}

module.exports = ChecklistRepository;
