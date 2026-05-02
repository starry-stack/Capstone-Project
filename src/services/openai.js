// ============================================================
// src/services/openai.js
// All OpenAI API interactions live here.
// GPT-4o  → story breakdown into panel data
// DALL-E 3 → image generation per panel
// ============================================================

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const BASE_URL = 'https://api.openai.com/v1';

// ── Shared fetch wrapper ──────────────────────────────────────
async function openAIFetch(endpoint, body) {
  if (!API_KEY || API_KEY === 'sk-your-key-here') {
    throw new Error('Missing OpenAI API key. Add VITE_OPENAI_API_KEY to your .env file.');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI error: ${response.status}`);
  }

  return response.json();
}

// ── 1. Story → Panel Descriptions ───────────────────────────
/**
 * Uses GPT-4o to break a story into comic panels.
 * @param {string} story     - The user's full story text
 * @param {number} panelCount - How many panels to create (4 | 6 | 8)
 * @param {string} style     - Art style descriptor (e.g. "superhero", "manga")
 * @returns {Promise<Array<{caption: string, dialogue: string, imagePrompt: string}>>}
 */
export async function breakStoryIntoPanels(story, panelCount = 4, style = 'classic American comic') {
  const systemPrompt = `
You are a professional comic book writer and storyboard artist.
Given a story, break it into exactly ${panelCount} sequential comic panels.

Rules:
- Each panel must advance the narrative.
- Keep captions concise (narrator voice, max 20 words).
- Keep dialogue punchy and natural (max 15 words).
- Write imagePrompt as a rich, specific visual scene for an AI image generator.
- Maintain consistent character descriptions across all imagePrompts.
- Style: ${style} art style.

Respond ONLY with a valid JSON array. No markdown, no explanation, no code fences.

Required format:
[
  {
    "caption": "Narrator text for this panel",
    "dialogue": "What a character says (or empty string if silent panel)",
    "imagePrompt": "Detailed visual description of the scene for image generation"
  }
]
`.trim();

  const data = await openAIFetch('/chat/completions', {
    model: 'gpt-4o',
    temperature: 0.8,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: story },
    ],
  });

  const raw = data.choices[0].message.content;
  // Strip any accidental markdown fences
  const clean = raw.replace(/```json|```/gi, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error('GPT-4o returned malformed JSON. Try again.');
  }
}

// ── 2. Image Prompt → DALL-E 3 Image ────────────────────────
/**
 * Generates a comic panel image using DALL-E 3.
 * @param {string} imagePrompt - Scene description from GPT-4o
 * @param {string} style       - Art style to prepend for visual consistency
 * @returns {Promise<string>}  - URL of the generated image
 */
export async function generatePanelImage(imagePrompt, style = 'classic American comic') {
  const styledPrompt = `
${style} art style, bold ink outlines, halftone dot shading, vivid saturated colors,
dramatic perspective, professional comic book illustration:
${imagePrompt}
  `.trim();

  const data = await openAIFetch('/images/generations', {
    model: 'dall-e-3',
    prompt: styledPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    response_format: 'url',
  });

  return data.data[0].url;
}
