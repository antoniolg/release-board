class ChecklistService {
  constructor(checklistRepo) {
    this.checklistRepo = checklistRepo;
  }

  getByCard(cardId) {
    return this.checklistRepo.findByCard(cardId);
  }

  create(data) {
    const maxPos = this.checklistRepo.maxPosition(data.card_id);
    const info = this.checklistRepo.create(data.card_id, data.text, maxPos.p + 1);
    return this.checklistRepo.findById(info.lastInsertRowid);
  }

  update(id, data) {
    const existing = this.checklistRepo.findById(id);
    if (!existing) return null;
    this.checklistRepo.update(id, data.text ?? existing.text, data.checked !== undefined ? (data.checked ? 1 : 0) : existing.checked, data.position ?? existing.position);
    return this.checklistRepo.findById(id);
  }

  delete(id) {
    return this.checklistRepo.delete(id);
  }
}

module.exports = ChecklistService;
