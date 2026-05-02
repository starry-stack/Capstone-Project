import React from "react"
// ============================================================
// src/components/ComicPanel.jsx
// A single comic panel: image, caption bar, speech bubble.
// ============================================================

export default function ComicPanel({ panel, index, isLoading }) {
  const { caption, dialogue, imageUrl } = panel;

  return (
    <article className="comic-panel" aria-label={`Panel ${index + 1}`}>
      {/* Panel number badge */}
      <div className="panel-number">{index + 1}</div>

      {/* Image area */}
      <div className="panel-image-wrapper">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={caption}
            className="panel-image"
            loading="lazy"
          />
        ) : (
          <div className="panel-placeholder">
            <div className="placeholder-spinner" />
            <span>Drawing...</span>
          </div>
        )}
      </div>

      {/* Speech bubble (only if dialogue exists) */}
      {dialogue && (
        <div className="speech-bubble" role="note" aria-label="dialogue">
          {dialogue}
        </div>
      )}

      {/* Caption bar at bottom */}
      {caption && (
        <div className="panel-caption">
          {caption}
        </div>
      )}

      <style>{`
        .comic-panel {
          position: relative;
          border: 3px solid var(--ink);
          background: var(--panel-bg);
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          break-inside: avoid;
          animation: panelIn 0.4s ease both;
        }

        @keyframes panelIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .panel-number {
          position: absolute;
          top: 6px;
          left: 6px;
          z-index: 10;
          background: var(--yellow);
          color: var(--ink);
          font-family: var(--font-display);
          font-size: 1rem;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--ink);
          border-radius: 50%;
        }

        .panel-image-wrapper {
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: var(--sky);
          flex-shrink: 0;
        }

        .panel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .comic-panel:hover .panel-image {
          transform: scale(1.03);
        }

        .panel-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: repeating-linear-gradient(
            45deg,
            var(--sky),
            var(--sky) 10px,
            #d4e8f8 10px,
            #d4e8f8 20px
          );
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--blue);
        }

        .placeholder-spinner {
          width: 36px;
          height: 36px;
          border: 4px solid var(--ink);
          border-top-color: var(--yellow);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Speech Bubble ── */
        .speech-bubble {
          position: absolute;
          top: 10px;
          right: 10px;
          background: white;
          border: 2px solid var(--ink);
          border-radius: 16px;
          padding: 6px 10px;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 0.75rem;
          max-width: 55%;
          line-height: 1.3;
          z-index: 10;
          box-shadow: 2px 2px 0 var(--ink);
        }

        .speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 16px;
          border: 5px solid transparent;
          border-top-color: var(--ink);
        }

        .speech-bubble::before {
          content: '';
          position: absolute;
          bottom: -7px;
          left: 17px;
          border: 4px solid transparent;
          border-top-color: white;
          z-index: 1;
        }

        /* ── Caption Bar ── */
        .panel-caption {
          padding: 0.6rem 0.75rem;
          background: var(--yellow);
          border-top: 2px solid var(--ink);
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 0.8rem;
          line-height: 1.4;
          color: var(--ink);
        }
      `}</style>
    </article>
  );
}
