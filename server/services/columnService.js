class ColumnService {
  constructor(columnRepo) {
    this.columnRepo = columnRepo;
  }

  getByRelease(releaseId) {
    return this.columnRepo.findByRelease(releaseId);
  }

  create(releaseId, name, color) {
    const maxPos = this.columnRepo.maxPosition(releaseId);
    const info = this.columnRepo.create(releaseId, name, color || "#6366f1", maxPos.p + 1);
    return this.columnRepo.findById(info.lastInsertRowid);
  }

  update(id, data) {
    const existing = this.columnRepo.findById(id);
    if (!existing) return null;
    this.columnRepo.update(id, data.name ?? existing.name, data.color ?? existing.color, data.position ?? existing.position);
    return this.columnRepo.findById(id);
  }

  delete(id) {
    return this.columnRepo.delete(id);
  }
}

module.exports = ColumnService;
