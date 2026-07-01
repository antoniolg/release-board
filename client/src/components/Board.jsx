import { useState } from "react";
import Column from "./Column";
import CardModal from "./CardModal";

export default function Board({
  columns,
  cards,
  labels,
  onMoveCard,
  onCreateCard,
  onDeleteCard,
  onEditCard,
  onCreateColumn,
  onDeleteColumn,
  editingCard,
  onUpdateCard,
  onCloseModal,
}) {
  const [dragCardId, setDragCardId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [newColName, setNewColName] = useState("");
  const [showNewCol, setShowNewCol] = useState(false);

  const handleDragStart = (e, cardId) => {
    setDragCardId(cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    setDragOverCol(null);
    if (dragCardId != null) {
      const colCards = cards.filter((c) => c.column_id === colId);
      onMoveCard(dragCardId, colId, colCards.length);
      setDragCardId(null);
    }
  };

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    onCreateColumn(newColName.trim());
    setNewColName("");
    setShowNewCol(false);
  };

  return (
    <>
      <div className="board">
        {columns.map((col) => {
          const colCards = cards.filter((c) => c.column_id === col.id);
          return (
            <Column
              key={col.id}
              column={col}
              cards={colCards}
              labels={labels}
              dragCardId={dragCardId}
              isDragOver={dragOverCol === col.id}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onCreateCard={onCreateCard}
              onDeleteCard={onDeleteCard}
              onEditCard={onEditCard}
              onDeleteColumn={onDeleteColumn}
            />
          );
        })}

        {showNewCol ? (
          <div className="column" style={{ padding: 16 }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddColumn();
              }}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              <input
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "8px 12px",
                  color: "var(--text)",
                  fontSize: 14,
                }}
                placeholder="Column name"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                autoFocus
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-primary btn-sm" type="submit">
                  Add
                </button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowNewCol(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button className="add-column-btn" onClick={() => setShowNewCol(true)}>
            + Add Column
          </button>
        )}
      </div>

      {editingCard && (
        <CardModal
          card={editingCard}
          labels={labels}
          onSave={onUpdateCard}
          onDelete={onDeleteCard}
          onClose={onCloseModal}
        />
      )}
    </>
  );
}
