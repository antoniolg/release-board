class ColumnRepository {
  constructor(db) {
    this.db = db;
  }

  findByRelease(releaseId) {
    return this.db.prepare("SELECT * FROM columns WHERE release_id = ? ORDER BY position").all(releaseId);
  }

  findById(id) {
    return this.db.prepare("SELECT * FROM columns WHERE id = ?").get(id);
  }

  create(releaseId, name, color, position) {
    return this.db.prepare("INSERT INTO columns (release_id, name, color, position) VALUES (?,?,?,?)").run(releaseId, name, color, position);
  }

  update(id, name, color, position) {
    return this.db.prepare("UPDATE columns SET name=?, color=?, position=? WHERE id=?").run(name, color, position, id);
  }

  delete(id) {
    return this.db.prepare("DELETE FROM columns WHERE id = ?").run(id);
  }

  maxPosition(releaseId) {
    return this.db.prepare("SELECT COALESCE(MAX(position),-1) as p FROM columns WHERE release_id=?").get(releaseId);
  }
}

module.exports = ColumnRepository;
