import React from "react"
// ============================================================
// src/components/DownloadButton.jsx
// Triggers html2canvas PNG export of the comic grid.
// ============================================================

import { useState } from 'react';
import { downloadComicAsPNG } from '../utils/download';

export default function DownloadButton({ comicRef, onReset }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadComicAsPNG(comicRef, 'my-comic-story');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="action-bar">
      <button
        className="download-btn"
        onClick={handleDownload}
        disabled={downloading}
        aria-label="Download comic as PNG"
      >
        {downloading ? '⏳ Preparing...' : '⬇ DOWNLOAD COMIC'}
      </button>

      <button
        className="reset-btn"
        onClick={onReset}
        aria-label="Start over with a new story"
      >
        ↩ NEW STORY
      </button>

      <style>{`
        .action-bar {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin: 2rem 0 3rem;
        }

        .download-btn {
          padding: 0.9rem 2rem;
          background: var(--blue);
          color: white;
          font-family: var(--font-display);
          font-size: 1.4rem;
          letter-spacing: 2px;
          border: 3px solid var(--ink);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          transition: all 0.15s;
        }

        .download-btn:hover:not(:disabled) {
          background: var(--ink);
          transform: translate(-2px, -2px);
          box-shadow: var(--shadow-lg);
        }

        .download-btn:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .reset-btn {
          padding: 0.9rem 1.5rem;
          background: white;
          color: var(--ink);
          font-family: var(--font-display);
          font-size: 1.4rem;
          letter-spacing: 2px;
          border: 3px solid var(--ink);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          transition: all 0.15s;
        }

        .reset-btn:hover {
          background: var(--yellow);
          transform: translate(-2px, -2px);
          box-shadow: var(--shadow-lg);
        }
      `}</style>
    </div>
  );
}
