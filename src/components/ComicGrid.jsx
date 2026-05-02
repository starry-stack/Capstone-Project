import React from "react"
// ============================================================
// src/components/ComicGrid.jsx
// Renders all panels in a comic book page layout.
// Exposes a ref for html2canvas capture.
// ============================================================

import { forwardRef } from 'react';
import ComicPanel from './ComicPanel';

const ComicGrid = forwardRef(function ComicGrid({ panels, totalPanels, title }, ref) {
  // Fill remaining slots with skeleton placeholders while loading
  const skeletonCount = Math.max(0, totalPanels - panels.length);
  const skeletons = Array.from({ length: skeletonCount }, (_, i) => ({
    id: `skeleton-${i}`,
    caption: '',
    dialogue: '',
    imageUrl: null,
    isSkeleton: true,
  }));

  const allPanels = [...panels, ...skeletons];
  const columns = allPanels.length <= 4 ? 2 : 3;

  return (
    <section className="comic-grid-section">
      {/* Comic book page wrapper — this is what gets downloaded */}
      <div className="comic-page" ref={ref}>

        {/* Page title banner */}
        <div className="comic-title-bar">
          <span className="title-bang">POW!</span>
          <h2 className="comic-page-title">{title || 'MY COMIC STORY'}</h2>
          <span className="title-bang">ZAP!</span>
        </div>

        {/* Panel grid */}
        <div
          className="panels-grid"
          style={{ '--grid-cols': columns }}
        >
          {allPanels.map((panel, idx) => (
            <ComicPanel
              key={panel.id ?? idx}
              panel={panel}
              index={idx}
              isLoading={panel.isSkeleton}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="comic-footer">
          <span>Generated with Story-to-Comic AI</span>
          <span>★ ★ ★</span>
          <span>Page 1</span>
        </div>
      </div>

      <style>{`
        .comic-grid-section {
          max-width: 1100px;
          margin: 0 auto;
        }

        .comic-page {
          background: var(--paper);
          border: 4px solid var(--ink);
          box-shadow: var(--shadow-lg);
          padding: 1.5rem;
          border-radius: 4px;
        }

        /* ── Title Banner ── */
        .comic-title-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--red);
          border: 3px solid var(--ink);
          padding: 0.5rem 1.5rem;
          margin-bottom: 1rem;
          border-radius: 2px;
        }

        .comic-page-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
          letter-spacing: 4px;
          color: white;
          text-shadow: 3px 3px 0 var(--ink);
          text-transform: uppercase;
          text-align: center;
          flex: 1;
        }

        .title-bang {
          font-family: var(--font-display);
          font-size: 1.4rem;
          color: var(--yellow);
          text-shadow: 2px 2px 0 var(--ink);
          letter-spacing: 1px;
          white-space: nowrap;
        }

        /* ── Panel Grid ── */
        .panels-grid {
          display: grid;
          grid-template-columns: repeat(var(--grid-cols, 2), 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        /* Make first panel span 2 columns for visual punch (only in 2-col layout) */
        .panels-grid[style*="--grid-cols: 2"] .comic-panel:first-child {
          grid-column: span 2;
        }

        /* ── Footer ── */
        .comic-footer {
          border-top: 2px solid var(--ink);
          padding-top: 0.5rem;
          display: flex;
          justify-content: space-between;
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: #666;
          font-style: italic;
        }

        @media (max-width: 600px) {
          .panels-grid {
            grid-template-columns: 1fr !important;
          }

          .panels-grid .comic-panel:first-child {
            grid-column: span 1 !important;
          }

          .comic-page-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </section>
  );
});

export default ComicGrid;
