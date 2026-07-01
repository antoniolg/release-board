import { useState } from "react";
import Card from "./Card";

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
          onClick={() => {
            if (confirm(`Delete column "${column.name}"?`)) onDeleteColumn(column.id);
          }}
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
            style={{ display: "flex", gap: 6 }}
          >
            <input
              style={{
                flex: 1,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "6px 10px",
                color: "var(--text)",
                fontSize: 13,
              }}
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
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", justifyContent: "flex-start" }}
            onClick={() => setShowForm(true)}
          >
            + Add card
          </button>
        )}
      </div>
    </div>
  );
}
