import { useState } from "react";
import Card from "./Card";
import ConfirmDialog from "./ConfirmDialog";

export default function Column({
  column,
  cards,
  labels,
  dragCardId,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onCreateCard,
  onDeleteCard,
  onEditCard,
  onDeleteColumn,
}) {
  const [newTitle, setNewTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onCreateCard(column.id, newTitle.trim());
    setNewTitle("");
    setShowForm(false);
  };

  return (
    <div
      className="column"
      onDragOver={(e) => onDragOver(e, column.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <div className="column-header">
        <div className="column-header-left">
          <div className="column-dot" style={{ background: column.color }} />
          <span className="column-name">{column.name}</span>
          <span className="column-count">{cards.length}</span>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setConfirmDelete(true)}
          title="Delete column"
        >
          &times;
        </button>
      </div>

      <div className={`column-cards ${isDragOver ? "drag-over" : ""}`}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            labels={labels}
            isDragging={dragCardId === card.id}
            onDragStart={onDragStart}
            onClick={() => onEditCard(card)}
            onDelete={() => onDeleteCard(card.id)}
          />
        ))}
      </div>

      <div className="column-footer">
        {showForm ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
            className="column-new-card-form"
          >
            <input
              className="column-new-card-input"
              placeholder="Card title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <button className="btn btn-primary btn-sm" type="submit">
              Add
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowForm(false)}>
              &times;
            </button>
          </form>
        ) : (
          <button
            className="btn btn-ghost btn-sm column-add-btn"
            onClick={() => setShowForm(true)}
          >
            + Add card
          </button>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete column "${column.name}"?`}
          onConfirm={() => {
            setConfirmDelete(false);
            onDeleteColumn(column.id);
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
