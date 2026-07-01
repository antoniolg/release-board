export default function Card({ card, labels, isDragging, onDragStart, onClick, onDelete }) {
  const checklist = card.checklist || [];
  const doneChecks = checklist.filter((c) => c.checked).length;
  const totalChecks = checklist.length;

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`card ${isDragging ? "dragging" : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      onClick={onClick}
    >
      <div className="card-top">
        <span className="card-title">{card.title}</span>
        <button className="card-delete" onClick={handleDelete} title="Delete card">
          &times;
        </button>
      </div>

      {card.description && <div className="card-desc">{card.description}</div>}

      {card.labels.length > 0 && (
        <div className="card-labels">
          {card.labels.map((labelName) => {
            const lbl = labels.find((l) => l.name === labelName);
            return (
              <span key={labelName} className="label" style={{ background: lbl?.color || "#6b7280" }}>
                {labelName}
              </span>
            );
          })}
        </div>
      )}

      <div className="card-meta">
        <span className={`priority-badge priority-${card.priority}`}>{card.priority}</span>
        {totalChecks > 0 && (
          <span className="checklist-progress">
            <span className="checklist-bar">
              <span className="checklist-bar-fill" style={{ width: `${(doneChecks / totalChecks) * 100}%` }} />
            </span>
            {doneChecks}/{totalChecks}
          </span>
        )}
      </div>
    </div>
  );
}
