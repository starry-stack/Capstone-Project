import React from "react"
// ============================================================
// src/App.jsx
// Root component. Orchestrates all state via useComicGenerator hook.
// ============================================================

import { useRef } from 'react';
import { useComicGenerator } from './hooks/useComicGenerator';
import StoryInput from './components/StoryInput';
import ComicGrid from './components/ComicGrid';
import LoadingScreen from './components/LoadingScreen';
import DownloadButton from './components/DownloadButton';

export default function App() {
  const { panels, loading, currentPanel, totalPanels, error, done, generate, reset } = useComicGenerator();
  const comicRef = useRef(null);

  const hasContent = panels.length > 0;

  return (
    <div className="app">
      {/* ── Site Header ── */}
      <header className="site-header">
        <div className="header-inner">
          <div className="logo-area">
            <span className="logo-icon">📖</span>
            <div>
              <h1 className="site-title">COMIC-AI</h1>
              <p className="site-tagline">Turn any story into a comic book</p>
            </div>
          </div>
          <div className="header-badges">
            <span className="header-badge">GPT-4o</span>
            <span className="header-badge red">DALL-E 3</span>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="main-content">

        {/* Story Input — always visible unless a finished comic is shown */}
        {!done && (
          <StoryInput onGenerate={generate} loading={loading} />
        )}

        {/* Loading state */}
        {loading && (
          <LoadingScreen currentPanel={currentPanel} totalPanels={totalPanels} />
        )}

        {/* Error state */}
        {error && (
          <div className="error-banner" role="alert">
            <strong>⚠️ Something went wrong:</strong> {error}
            <button className="error-retry" onClick={reset}>Try Again</button>
          </div>
        )}

        {/* Comic preview — renders panels progressively */}
        {hasContent && (
          <>
            <div className="comic-section-header">
              <span className="badge green">PREVIEW</span>
              <h2 className="section-title">Your Comic</h2>
            </div>

            <ComicGrid
              ref={comicRef}
              panels={panels}
              totalPanels={totalPanels}
            />

            {/* Download + Reset — only when fully done */}
            {done && (
              <DownloadButton comicRef={comicRef} onReset={reset} />
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <p>Built with React + OpenAI · CSC AI/ML Capstone Project</p>
      </footer>

      <style>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .site-header {
          background: var(--ink);
          border-bottom: 4px solid var(--yellow);
          padding: 1rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          font-size: 2rem;
        }

        .site-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
          letter-spacing: 5px;
          color: var(--yellow);
          text-shadow: 3px 3px 0 var(--red);
          line-height: 1;
        }

        .site-tagline {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: #aaa;
          letter-spacing: 1px;
        }

        .header-badges {
          display: flex;
          gap: 0.5rem;
        }

        .header-badge {
          font-family: var(--font-display);
          font-size: 0.85rem;
          letter-spacing: 1px;
          padding: 4px 10px;
          background: var(--blue);
          color: white;
          border: 2px solid var(--yellow);
          border-radius: 2px;
        }

        .header-badge.red {
          background: var(--red);
        }

        /* ── Main ── */
        .main-content {
          flex: 1;
          padding: 2.5rem 1.5rem;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        .comic-section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .badge {
          background: var(--red);
          color: white;
          font-family: var(--font-display);
          font-size: 0.9rem;
          letter-spacing: 2px;
          padding: 4px 10px;
          border: 2px solid var(--ink);
          border-radius: 2px;
        }

        .badge.green {
          background: #2a8a3e;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 1.8rem;
          letter-spacing: 1px;
        }

        /* ── Error Banner ── */
        .error-banner {
          background: #fff0f0;
          border: 3px solid var(--red);
          border-radius: var(--radius);
          padding: 1rem 1.5rem;
          font-family: var(--font-body);
          color: var(--red);
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          box-shadow: var(--shadow);
        }

        .error-retry {
          margin-left: auto;
          padding: 6px 14px;
          background: var(--red);
          color: white;
          font-family: var(--font-display);
          font-size: 1rem;
          border: 2px solid var(--ink);
          border-radius: var(--radius);
          cursor: pointer;
        }

        /* ── Footer ── */
        .site-footer {
          background: var(--ink);
          color: #888;
          text-align: center;
          padding: 1rem;
          font-family: var(--font-body);
          font-size: 0.8rem;
          border-top: 3px solid var(--yellow);
        }
      `}</style>
    </div>
  );
}
