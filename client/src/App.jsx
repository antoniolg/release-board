import { useState, useEffect, useCallback } from "react";
import { api } from "./api/client";
import Board from "./components/Board";
import ReleaseSelector from "./components/ReleaseSelector";
import ProgressBar from "./components/ProgressBar";

const LABELS = [
  { name: "Bug", color: "#ef4444" },
  { name: "Feature", color: "#6366f1" },
  { name: "Enhancement", color: "#8b5cf6" },
  { name: "Docs", color: "#06b6d4" },
  { name: "Testing", color: "#f59e0b" },
  { name: "Infra", color: "#84cc16" },
];

export default function App() {
  const [releases, setReleases] = useState([]);
  const [currentRelease, setCurrentRelease] = useState(null);
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);

  const loadReleases = useCallback(async () => {
    const data = await api.getReleases();
    setReleases(data);
    if (data.length && !currentRelease) {
      setCurrentRelease(data[0]);
    }
  }, [currentRelease]);

  const loadBoard = useCallback(async () => {
    if (!currentRelease) return;
    const [cols, crds] = await Promise.all([
      api.getColumns(currentRelease.id),
      api.getCardsByRelease(currentRelease.id),
    ]);
    setColumns(cols);
    setCards(crds);
  }, [currentRelease]);

  useEffect(() => {
    loadReleases();
  }, []);

  useEffect(() => {
    loadBoard();
  }, [currentRelease, loadBoard]);

  const handleCreateRelease = async (name, version) => {
    const rel = await api.createRelease({ name, version });
    await loadReleases();
    setCurrentRelease(rel);
  };

  const handleDeleteRelease = async (id) => {
    await api.deleteRelease(id);
    setCurrentRelease(null);
    await loadReleases();
  };

  const handleCreateColumn = async (name) => {
    await api.createColumn({ release_id: currentRelease.id, name });
    loadBoard();
  };

  const handleDeleteColumn = async (id) => {
    await api.deleteColumn(id);
    loadBoard();
  };

  const handleCreateCard = async (columnId, title) => {
    await api.createCard({ column_id: columnId, title });
    loadBoard();
  };

  const handleMoveCard = async (cardId, targetColumnId, position) => {
    await api.moveCard(cardId, { column_id: targetColumnId, position });
    loadBoard();
  };

  const handleUpdateCard = async (cardId, data) => {
    await api.updateCard(cardId, data);
    loadBoard();
    setEditingCard(null);
  };

  const handleDeleteCard = async (cardId) => {
    await api.deleteCard(cardId);
    loadBoard();
    setEditingCard(null);
  };

  const totalCards = cards.length;
  const doneCol = columns.find((c) => c.name.toLowerCase() === "done");
  const doneCards = doneCol
    ? cards.filter((c) => c.column_id === doneCol.id).length
    : 0;

  const allChecklist = cards.flatMap((c) => c.checklist || []);
  const totalChecks = allChecklist.length;
  const doneChecks = allChecklist.filter((c) => c.checked).length;

  if (!currentRelease && releases.length === 0) {
    return (
      <div className="empty-state">
        <h2>Release Board</h2>
        <p>Create your first release to get started.</p>
        <ReleaseSelector
          releases={releases}
          current={currentRelease}
          onSelect={setCurrentRelease}
          onCreate={handleCreateRelease}
          onDelete={handleDeleteRelease}
          empty
        />
      </div>
    );
  }

  return (
    <>
      <header className="header">
        <div className="header-left">
          <h1>Release Board</h1>
          <ReleaseSelector
            releases={releases}
            current={currentRelease}
            onSelect={setCurrentRelease}
            onCreate={handleCreateRelease}
            onDelete={handleDeleteRelease}
          />
        </div>
      </header>

      {currentRelease && (
        <>
          <ProgressBar
            doneCards={doneCards}
            totalCards={totalCards}
            doneChecks={doneChecks}
            totalChecks={totalChecks}
          />
          <Board
            columns={columns}
            cards={cards}
            labels={LABELS}
            onMoveCard={handleMoveCard}
            onCreateCard={handleCreateCard}
            onDeleteCard={handleDeleteCard}
            onEditCard={setEditingCard}
            onCreateColumn={handleCreateColumn}
            onDeleteColumn={handleDeleteColumn}
            editingCard={editingCard}
            onUpdateCard={handleUpdateCard}
            onCloseModal={() => setEditingCard(null)}
          />
        </>
      )}
    </>
  );
}
