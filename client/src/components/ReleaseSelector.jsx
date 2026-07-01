import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

export default function ReleaseSelector({ releases, current, onSelect, onCreate, onDelete, empty }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !version.trim()) return;
    onCreate(name.trim(), version.trim());
    setName("");
    setVersion("");
    setShowForm(false);
  };

  if (empty && !showForm) {
    return (
      <button className="btn btn-primary" onClick={() => setShowForm(true)}>
        + New Release
      </button>
    );
  }

  return (
    <>
      <select
        className="release-select"
        value={current?.id || ""}
        onChange={(e) => {
          const rel = releases.find((r) => r.id === Number(e.target.value));
          onSelect(rel);
        }}
      >
        {releases.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name} v{r.version}
          </option>
        ))}
      </select>

      {!showForm ? (
        <div className="release-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            + New
          </button>
          {current && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="release-form">
          <input
            className="release-select release-form-name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <input
            className="release-select release-form-version"
            placeholder="v1.0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" type="submit">
            Create
          </button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </form>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${current.name}"?`}
          onConfirm={() => {
            setConfirmDelete(false);
            onDelete(current.id);
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
