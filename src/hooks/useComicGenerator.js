// ============================================================
// src/hooks/useComicGenerator.js
// Manages all generation state and orchestrates API calls.
// ============================================================

import { useState, useCallback } from 'react';
import { breakStoryIntoPanels, generatePanelImage } from '../services/openai';

const INITIAL_STATE = {
  panels: [],
  loading: false,
  currentPanel: 0,
  totalPanels: 0,
  error: null,
  done: false,
};

export function useComicGenerator() {
  const [state, setState] = useState(INITIAL_STATE);

  const generate = useCallback(async (story, panelCount, style) => {
    setState({ ...INITIAL_STATE, loading: true, totalPanels: panelCount });

    try {
      // Step 1: Break story into panel data via GPT-4o
      const panelData = await breakStoryIntoPanels(story, panelCount, style);

      // Step 2: Generate images one at a time (sequential to avoid rate limits)
      const completedPanels = [];
      for (let i = 0; i < panelData.length; i++) {
        setState(prev => ({ ...prev, currentPanel: i + 1 }));

        const imageUrl = await generatePanelImage(panelData[i].imagePrompt, style);

        completedPanels.push({
          ...panelData[i],
          imageUrl,
          id: i,
        });

        // Update panels progressively so UI renders as each one completes
        setState(prev => ({
          ...prev,
          panels: [...completedPanels],
        }));
      }

      setState(prev => ({
        ...prev,
        loading: false,
        done: true,
        currentPanel: panelData.length,
      }));

    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Something went wrong. Please try again.',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { ...state, generate, reset };
}
