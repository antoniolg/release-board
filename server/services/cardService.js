class CardService {
  constructor(cardRepo, checklistRepo) {
    this.cardRepo = cardRepo;
    this.checklistRepo = checklistRepo;
  }

  getByColumn(columnId) {
    const cards = this.cardRepo.findByColumn(columnId);
    return cards.map(c => this._enrichCard(c));
  }

  getByRelease(releaseId) {
    const cards = this.cardRepo.findByRelease(releaseId);
    return cards.map(c => this._enrichCard(c));
  }

  create(data) {
    const maxPos = this.cardRepo.maxPosition(data.column_id);
    const info = this.cardRepo.create(data.column_id, data.title, data.description || "", data.priority || "medium", data.labels || [], maxPos.p + 1);
    const card = this.cardRepo.findById(info.lastInsertRowid);
    return { ...this._parseCard(card), checklist: [] };
  }

  update(id, data) {
    const existing = this.cardRepo.findById(id);
    if (!existing) return null;
    this.cardRepo.update(id, data.title ?? existing.title, data.description ?? existing.description, data.priority ?? existing.priority, data.labels ? JSON.stringify(data.labels) : existing.labels, data.column_id ?? existing.column_id, data.position ?? existing.position);
    return this._enrichCard(this.cardRepo.findById(id));
  }

  move(id, data) {
    const existing = this.cardRepo.findById(id);
    if (!existing) return null;
    this.cardRepo.update(id, existing.title, existing.description, existing.priority, existing.labels, data.column_id ?? existing.column_id, data.position ?? existing.position);
    return this._enrichCard(this.cardRepo.findById(id));
  }

  delete(id) {
    return this.cardRepo.delete(id);
  }

  _enrichCard(card) {
    const parsed = this._parseCard(card);
    parsed.checklist = this.checklistRepo.findByCard(card.id);
    return parsed;
  }

  _parseCard(card) {
    return { ...card, labels: JSON.parse(card.labels || "[]") };
  }
}

module.exports = CardService;
