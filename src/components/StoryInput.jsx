import React from "react"
// ============================================================
// src/components/StoryInput.jsx
// Story entry form: textarea, panel count, art style, generate button.
// ============================================================

import { useState } from 'react';

const STYLES = [
  { value: 'classic American comic book', label: '🦸 Superhero' },
  { value: 'manga black and white', label: '⛩️ Manga' },
  { value: 'retro 1950s pulp comic', label: '📰 Retro Pulp' },
  { value: 'whimsical childrens comic', label: '🌈 Kids Comic' },
  { value: 'dark noir graphic novel', label: '🌑 Noir' },
];

const PANEL_COUNTS = [4, 6, 8];

const PLACEHOLDER = `Once upon a time, in a city that never slept, a young inventor stumbled upon an ancient map hidden beneath the floorboards of her workshop. The map pointed to a forgotten library buried deep underground — a place that held the secrets of a civilization lost to time. Armed with her tools and boundless curiosity, she descended into the dark, unaware that she was not alone...`;

export default function StoryInput({ onGenerate, loading }) {
  const [story, setStory] = useState('');
  const [panelCount, setPanelCount] = useState(4);
  const [style, setStyle] = useState(STYLES[0].value);

  const handleSubmit = () => {
    const trimmed = story.trim();
    if (!trimmed) {
      alert('Please enter a story first!');
      return;
    }
    if (trimmed.split(' ').length < 10) {
      alert('Your story is a little short. Add more detail for better results!');
      return;
    }
    onGenerate(trimmed, panelCount, style);
  };

  return (
    <div className="input-card">
      {/* Header badge */}
      <div className="input-header">
        <span className="badge">STEP 1</span>
        <h2 className="input-title">Write Your Story</h2>
      </div>

      <textarea
        className="story-textarea"
        value={story}
        onChange={e => setStory(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={7}
        disabled={loading}
        maxLength={3000}
        aria-label="Enter your story"
      />

      <div className="char-count">
        {story.length} / 3000 characters
      </div>

      {/* Options row */}
      <div className="options-row">
        <div className="option-group">
          <label className="option-label">PANELS</label>
          <div className="panel-count-buttons">
            {PANEL_COUNTS.map(n => (
              <button
                key={n}
                className={`count-btn ${panelCount === n ? 'active' : ''}`}
                onClick={() => setPanelCount(n)}
                disabled={loading}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="option-group">
          <label className="option-label">ART STYLE</label>
          <select
            className="style-select"
            value={style}
            onChange={e => setStyle(e.target.value)}
            disabled={loading}
          >
            {STYLES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        className="generate-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? '⚡ GENERATING...' : '⚡ GENERATE COMIC'}
      </button>

      <style>{`
        .input-card {
          background: white;
          border: 3px solid var(--ink);
          box-shadow: var(--shadow-lg);
          padding: 2rem;
          border-radius: var(--radius);
          max-width: 780px;
          margin: 0 auto 3rem;
        }

        .input-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
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

        .input-title {
          font-family: var(--font-display);
          font-size: 1.8rem;
          letter-spacing: 1px;
          color: var(--ink);
        }

        .story-textarea {
          width: 100%;
          border: 3px solid var(--ink);
          border-radius: var(--radius);
          padding: 1rem;
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.6;
          resize: vertical;
          background: var(--paper);
          color: var(--ink);
          transition: border-color 0.2s;
        }

        .story-textarea:focus {
          outline: none;
          border-color: var(--blue);
          box-shadow: 3px 3px 0 var(--blue);
        }

        .story-textarea:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .char-count {
          text-align: right;
          font-size: 0.78rem;
          color: #888;
          margin-top: 0.25rem;
          margin-bottom: 1.25rem;
          font-family: var(--font-body);
        }

        .options-row {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          align-items: flex-end;
        }

        .option-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .option-label {
          font-family: var(--font-display);
          font-size: 0.85rem;
          letter-spacing: 2px;
          color: #555;
        }

        .panel-count-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .count-btn {
          width: 44px;
          height: 44px;
          font-family: var(--font-display);
          font-size: 1.2rem;
          border: 3px solid var(--ink);
          border-radius: var(--radius);
          background: white;
          color: var(--ink);
          transition: all 0.15s;
        }

        .count-btn:hover:not(:disabled) {
          background: var(--yellow);
          box-shadow: 3px 3px 0 var(--ink);
          transform: translate(-1px, -1px);
        }

        .count-btn.active {
          background: var(--yellow);
          box-shadow: 3px 3px 0 var(--ink);
        }

        .count-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .style-select {
          height: 44px;
          padding: 0 1rem;
          border: 3px solid var(--ink);
          border-radius: var(--radius);
          font-family: var(--font-body);
          font-size: 1rem;
          background: white;
          color: var(--ink);
          cursor: pointer;
          min-width: 160px;
        }

        .style-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .generate-btn {
          width: 100%;
          padding: 1rem;
          background: var(--red);
          color: white;
          font-family: var(--font-display);
          font-size: 1.6rem;
          letter-spacing: 3px;
          border: 3px solid var(--ink);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          transition: all 0.15s;
        }

        .generate-btn:hover:not(:disabled) {
          background: var(--ink);
          transform: translate(-2px, -2px);
          box-shadow: var(--shadow-lg);
        }

        .generate-btn:disabled {
          background: #999;
          cursor: not-allowed;
          transform: none;
          box-shadow: 2px 2px 0 #555;
        }
      `}</style>
    </div>
  );
}
