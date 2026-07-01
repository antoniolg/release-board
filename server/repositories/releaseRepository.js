class ReleaseRepository {
  constructor(db) {
    this.db = db;
  }

  findAll() {
    return this.db.prepare("SELECT * FROM releases ORDER BY created_at DESC").all();
  }

  findById(id) {
    return this.db.prepare("SELECT * FROM releases WHERE id = ?").get(id);
  }

  create(name, version) {
    return this.db.prepare("INSERT INTO releases (name, version) VALUES (?, ?)").run(name, version);
  }

  delete(id) {
    return this.db.prepare("DELETE FROM releases WHERE id = ?").run(id);
  }
}

module.exports = ReleaseRepository;
