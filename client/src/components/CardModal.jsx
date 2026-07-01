import { useState, useEffect } from "react";
import { api } from "../api/client";
import { LABELS as AVAILABLE_LABELS } from "../constants";
import ConfirmDialog from "./ConfirmDialog";

export default function CardModal({ card, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [priority, setPriority] = useState(card.priority);
  const [selectedLabels, setSelectedLabels] = useState(card.labels || []);
  const [checklist, setChecklist] = useState(card.checklist || []);
  const [newCheckText, setNewCheckText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggleLabel = (name) => {
    setSelectedLabels((prev) =>
      prev.includes(name) ? prev.filter((l) => l !== name) : [...prev, name]
    );
  };

  const handleSave = () => {
    onSave(card.id, { title, description, priority, labels: selectedLabels });
  };

  const handleAddCheck = async (e) => {
    e.preventDefault();
    if (!newCheckText.trim()) return;
    const item = await api.createChecklistItem({ card_id: card.id, text: newCheckText.trim() });
    setChecklist((prev) => [...prev, item]);
    setNewCheckText("");
  };

  const handleToggleCheck = async (item) => {
    const updated = await api.updateChecklistItem(item.id, { checked: !item.checked });
    setChecklist((prev) => prev.map((c) => (c.id === item.id ? updated : c)));
  };

  const handleDeleteCheck = async (itemId) => {
    await api.deleteChecklistItem(itemId);
    setChecklist((prev) => prev.filter((c) => c.id !== itemId));
  };

  const doneChecks = checklist.filter((c) => c.checked).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Card</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label>Labels</label>
            <div className="labels-editor">
              {AVAILABLE_LABELS.map((lbl) => (
                <span
                  key={lbl.name}
                  className={`label ${selectedLabels.includes(lbl.name) ? "active" : ""}`}
                  style={{ background: lbl.color }}
                  onClick={() => toggleLabel(lbl.name)}
                >
                  {lbl.name}
                </span>
              ))}
            </div>
          </div>

          <div className="checklist-section">
            <h3>
              Checklist {doneChecks}/{checklist.length}
            </h3>

            {checklist.map((item) => (
              <div key={item.id} className="checklist-item">
                <input
                  type="checkbox"
                  checked={!!item.checked}
                  onChange={() => handleToggleCheck(item)}
                />
                <span className={item.checked ? "checked" : ""}>{item.text}</span>
                <button className="checklist-delete" onClick={() => handleDeleteCheck(item.id)}>
                  &times;
                </button>
              </div>
            ))}

            <form className="add-checklist" onSubmit={handleAddCheck}>
              <input
                placeholder="New item..."
                value={newCheckText}
                onChange={(e) => setNewCheckText(e.target.value)}
              />
              <button className="btn btn-primary btn-sm" type="submit">
                Add
              </button>
            </form>
          </div>

          <div className="card-modal-footer">
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setConfirmDelete(true)}
            >
              Delete Card
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          message="Delete this card?"
          onConfirm={() => {
            setConfirmDelete(false);
            onDelete(card.id);
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
