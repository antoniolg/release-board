export default function ProgressBar({ doneCards, totalCards, doneChecks, totalChecks }) {
  const cardPct = totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0;
  const checkPct = totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;

  return (
    <div className="progress-section">
      <div className="progress-track">
        <div className="progress-track-header">
          <span>Cards: <strong>{doneCards}/{totalCards}</strong></span>
          <span>{cardPct}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${cardPct}%` }} />
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-track-header">
          <span>Checklist: <strong>{doneChecks}/{totalChecks}</strong></span>
          <span>{checkPct}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${checkPct}%` }} />
        </div>
      </div>
    </div>
  );
}
