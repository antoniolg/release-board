import { useState } from "react";

export default function ReleaseSelector({ releases, current, onSelect, onCreate, onDelete, empty }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");

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
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            + New
          </button>
          {current && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (confirm(`Delete "${current.name}"?`)) onDelete(current.id);
              }}
            >
              Delete
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            className="release-select"
            style={{ minWidth: 120 }}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <input
            className="release-select"
            style={{ minWidth: 80 }}
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
    </>
  );
}
