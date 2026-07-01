class ReleaseService {
  constructor(releaseRepo, columnRepo, db) {
    this.releaseRepo = releaseRepo;
    this.columnRepo = columnRepo;
    this.db = db;
  }

  getAll() {
    return this.releaseRepo.findAll();
  }

  create(name, version) {
    const tx = this.db.transaction(() => {
      const info = this.releaseRepo.create(name, version);
      const defaultCols = [
        { name: "Backlog", color: "#6b7280", position: 0 },
        { name: "In Progress", color: "#f59e0b", position: 1 },
        { name: "Review", color: "#3b82f6", position: 2 },
        { name: "Done", color: "#10b981", position: 3 },
      ];
      for (const col of defaultCols) {
        this.columnRepo.create(info.id, col.name, col.color, col.position);
      }
      return info.id;
    });

    const id = tx();
    return this.releaseRepo.findById(id);
  }

  delete(id) {
    return this.releaseRepo.delete(id);
  }
}

module.exports = ReleaseService;
