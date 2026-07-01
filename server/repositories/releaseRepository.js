const { v4: uuidv4 } = require("uuid");

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
    const id = uuidv4();
    return { ...this.db.prepare("INSERT INTO releases (id, name, version) VALUES (?, ?, ?)").run(id, name, version), id };
  }

  delete(id) {
    return this.db.prepare("DELETE FROM releases WHERE id = ?").run(id);
  }
}

module.exports = ReleaseRepository;
