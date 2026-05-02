import React from "react"
// ============================================================
// src/components/LoadingScreen.jsx
// Shows animated progress while panels are being generated.
// ============================================================

export default function LoadingScreen({ currentPanel, totalPanels }) {
  const phase = currentPanel === 0 ? 'Writing script...' : `Drawing panel ${currentPanel} of ${totalPanels}...`;
  const progress = totalPanels > 0 ? Math.round((currentPanel / totalPanels) * 100) : 5;

  return (
    <div className="loading-screen" role="status" aria-live="polite">
      {/* Animated comic "action" words */}
      <div className="action-words">
        <span className="action pow">POW!</span>
        <span className="action zap">ZAP!</span>
        <span className="action boom">BOOM!</span>
        <span className="action wham">WHAM!</span>
      </div>

      <div className="loading-card">
        <div className="loading-icon">✏️</div>
        <h3 className="loading-title">Creating Your Comic</h3>
        <p className="loading-phase">{phase}</p>

        {/* Progress bar */}
        <div className="progress-track" aria-label={`${progress}% complete`}>
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="loading-tip">
          💡 Tip: The more descriptive your story, the better the panels!
        </p>
      </div>

      <style>{`
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          max-width: 500px;
          margin: 0 auto 3rem;
        }

        /* ── Floating action words ── */
        .action-words {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .action {
          font-family: var(--font-display);
          font-size: 2rem;
          letter-spacing: 2px;
          border: 3px solid var(--ink);
          padding: 4px 12px;
          border-radius: 4px;
          animation: wobble 1s ease-in-out infinite alternate;
        }

        .pow  { background: var(--yellow); animation-delay: 0s; }
        .zap  { background: var(--red); color: white; animation-delay: 0.2s; }
        .boom { background: var(--blue); color: white; animation-delay: 0.4s; }
        .wham { background: var(--ink); color: var(--yellow); animation-delay: 0.6s; }

        @keyframes wobble {
          from { transform: rotate(-3deg) scale(1); }
          to   { transform: rotate(3deg) scale(1.05); }
        }

        /* ── Card ── */
        .loading-card {
          width: 100%;
          background: white;
          border: 3px solid var(--ink);
          box-shadow: var(--shadow-lg);
          border-radius: var(--radius);
          padding: 2rem;
          text-align: center;
        }

        .loading-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          animation: pulse 1.2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.15); }
        }

        .loading-title {
          font-family: var(--font-display);
          font-size: 1.8rem;
          letter-spacing: 2px;
          margin-bottom: 0.5rem;
        }

        .loading-phase {
          font-family: var(--font-body);
          font-size: 1rem;
          color: #555;
          margin-bottom: 1.25rem;
        }

        /* ── Progress Bar ── */
        .progress-track {
          width: 100%;
          height: 18px;
          background: #eee;
          border: 2px solid var(--ink);
          border-radius: 9px;
          overflow: hidden;
          margin-bottom: 1.25rem;
        }

        .progress-fill {
          height: 100%;
          background: repeating-linear-gradient(
            45deg,
            var(--red),
            var(--red) 10px,
            #c41010 10px,
            #c41010 20px
          );
          border-radius: 9px;
          transition: width 0.6s ease;
        }

        .loading-tip {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: #888;
          font-style: italic;
          border-top: 1px dashed #ccc;
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
}
