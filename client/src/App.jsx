import { useState, useEffect, useCallback } from "react";
import { api } from "./api/client";
import { LABELS } from "./constants";
import Board from "./components/Board";
import ReleaseSelector from "./components/ReleaseSelector";
import ProgressBar from "./components/ProgressBar";
import ErrorToast from "./components/ErrorToast";
import LoadingSpinner from "./components/LoadingSpinner";

export default function App() {
  const [releases, setReleases] = useState([]);
  const [currentRelease, setCurrentRelease] = useState(null);
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReleases = useCallback(async () => {
    try {
      const data = await api.getReleases();
      setReleases(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to load releases");
      return [];
    }
  }, []);

  const loadBoard = useCallback(async () => {
    if (!currentRelease) return;
    setLoading(true);
    try {
      const [cols, crds] = await Promise.all([
        api.getColumns(currentRelease.id),
        api.getCardsByRelease(currentRelease.id),
      ]);
      setColumns(cols);
      setCards(crds);
    } catch (err) {
      setError(err.message || "Failed to load board");
    } finally {
      setLoading(false);
    }
  }, [currentRelease]);

  useEffect(() => {
    loadReleases().then((data) => {
      setCurrentRelease((prev) => {
        if (!prev && data.length) return data[0];
        return prev;
      });
    });
  }, [loadReleases]);

  useEffect(() => {
    loadBoard();
  }, [currentRelease, loadBoard]);

  const handleCreateRelease = async (name, version) => {
    try {
      const rel = await api.createRelease({ name, version });
      await loadReleases();
      setCurrentRelease(rel);
    } catch (err) {
      setError(err.message || "Failed to create release");
    }
  };

  const handleDeleteRelease = async (id) => {
    try {
      await api.deleteRelease(id);
      setCurrentRelease(null);
      await loadReleases();
    } catch (err) {
      setError(err.message || "Failed to delete release");
    }
  };

  const handleCreateColumn = async (name) => {
    try {
      const newCol = await api.createColumn({ release_id: currentRelease.id, name });
      setColumns(prev => [...prev, newCol]);
    } catch (err) {
      setError(err.message || "Failed to create column");
      loadBoard();
    }
  };

  const handleDeleteColumn = async (id) => {
    const prevCols = columns;
    const prevCards = cards;
    setColumns(prev => prev.filter(c => c.id !== id));
    setCards(prev => prev.filter(c => c.column_id !== id));
    try {
      await api.deleteColumn(id);
    } catch (err) {
      setError(err.message || "Failed to delete column");
      setColumns(prevCols);
      setCards(prevCards);
    }
  };

  const handleCreateCard = async (columnId, title) => {
    try {
      const newCard = await api.createCard({ column_id: columnId, title });
      setCards(prev => [...prev, newCard]);
    } catch (err) {
      setError(err.message || "Failed to create card");
      loadBoard();
    }
  };

  const handleMoveCard = async (cardId, targetColumnId, position) => {
    const prevCards = cards;
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, column_id: targetColumnId, position } : c
    ));
    try {
      await api.moveCard(cardId, { column_id: targetColumnId, position });
    } catch (err) {
      setError(err.message || "Failed to move card");
      setCards(prevCards);
    }
  };

  const handleUpdateCard = async (cardId, data) => {
    try {
      const updated = await api.updateCard(cardId, data);
      setCards(prev => prev.map(c => c.id === cardId ? updated : c));
      setEditingCard(null);
    } catch (err) {
      setError(err.message || "Failed to update card");
      loadBoard();
    }
  };

  const handleDeleteCard = async (cardId) => {
    const prevCards = cards;
    setCards(prev => prev.filter(c => c.id !== cardId));
    setEditingCard(null);
    try {
      await api.deleteCard(cardId);
    } catch (err) {
      setError(err.message || "Failed to delete card");
      setCards(prevCards);
    }
  };

  const totalCards = cards.length;
  const doneCol = columns.find((c) => c.name.toLowerCase() === "done");
  const doneCards = doneCol
    ? cards.filter((c) => c.column_id === doneCol.id).length
    : 0;

  const allChecklist = cards.flatMap((c) => c.checklist || []);
  const totalChecks = allChecklist.length;
  const doneChecks = allChecklist.filter((c) => c.checked).length;

  if (loading && !columns.length) return <LoadingSpinner />;

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
        <ErrorToast message={error} onClose={() => setError(null)} />
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
      <ErrorToast message={error} onClose={() => setError(null)} />
    </>
  );
}
