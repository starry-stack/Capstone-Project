# CLAUDE.md — AI Agent Instructions for Story-to-Comic Generator

## Project Overview
A React/Vite web application that converts user-written text stories into illustrated comic books using OpenAI's GPT-4o (panel breakdown) and DALL-E 3 (image generation). Users can preview and download the final comic.

---

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Pure CSS with CSS variables (no Tailwind, no component libraries)
- **AI APIs**: OpenAI GPT-4o (text), DALL-E 3 (images)
- **Download**: html2canvas for comic export
- **Package Manager**: npm

---

## Project Structure
```
comic-generator/
├── CLAUDE.md                  ← You are here
├── .env                       ← API keys (never commit)
├── .env.example               ← Safe template to commit
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx               ← React entry point
    ├── App.jsx                ← Root component, orchestrates state
    ├── index.css              ← Global styles + CSS variables
    ├── components/
    │   ├── StoryInput.jsx     ← Textarea + options + generate button
    │   ├── ComicGrid.jsx      ← Lays out all panels in comic layout
    │   ├── ComicPanel.jsx     ← Single panel: image + caption + speech bubble
    │   ├── LoadingScreen.jsx  ← Animated loading state during generation
    │   └── DownloadButton.jsx ← Triggers html2canvas export
    ├── services/
    │   └── openai.js          ← All OpenAI API calls (GPT-4o + DALL-E 3)
    ├── hooks/
    │   └── useComicGenerator.js ← Custom hook: manages generation state/logic
    └── utils/
        └── download.js        ← html2canvas download helper
```

---

## Key Environment Variables
```
VITE_OPENAI_API_KEY=sk-...
```
Set in `.env`. Access in code via `import.meta.env.VITE_OPENAI_API_KEY`.
**Never hardcode. Never commit `.env`.**

---

## Core Data Flow
```
1. User types story → StoryInput.jsx
2. User clicks "Generate" → useComicGenerator.js hook
3. Hook calls openai.js → breakStoryIntoPanels(story, panelCount)
   └─ GPT-4o returns JSON array: [{ caption, dialogue, imagePrompt }, ...]
4. Hook calls openai.js → generatePanelImage(imagePrompt) for each panel
   └─ DALL-E 3 returns image URL per panel
5. Panels rendered in ComicGrid → ComicPanel components
6. User clicks Download → utils/download.js → html2canvas → saves PNG
```

---

## API Contracts

### `breakStoryIntoPanels(story: string, panelCount: number)`
**Returns**: `Promise<Panel[]>`
```json
[
  {
    "caption": "Short narrator text (max 20 words)",
    "dialogue": "Character speech bubble text (max 15 words)",
    "imagePrompt": "Detailed visual scene description for DALL-E"
  }
]
```
GPT-4o system prompt instructs: respond ONLY with a raw JSON array, no markdown fences.

### `generatePanelImage(imagePrompt: string)`
**Returns**: `Promise<string>` (image URL)
Uses DALL-E 3, `1024x1024`, style prefix: `"Comic book panel, bold ink outlines, halftone shading, vibrant colors: "`.

---

## Component Responsibilities

| Component | Props | Responsibility |
|-----------|-------|----------------|
| `StoryInput` | `onGenerate(story, panelCount)` | Collects story text + panel count (4/6/8), validates non-empty |
| `ComicGrid` | `panels[]`, `loading` | CSS grid layout, assigns ref for html2canvas |
| `ComicPanel` | `panel`, `index` | Renders image + caption box + speech bubble |
| `LoadingScreen` | `currentPanel`, `total` | Shows progress (panel X of Y) |
| `DownloadButton` | `targetRef` | Triggers html2canvas on the ref, downloads PNG |

---

## State Shape (in `useComicGenerator.js`)
```js
{
  panels: [],           // Array of { caption, dialogue, imagePrompt, imageUrl }
  loading: false,       // True during any API call
  currentPanel: 0,      // Which panel image is currently being generated
  totalPanels: 0,       // Total panels requested
  error: null,          // Error string or null
}
```

---

## Styling Conventions
- All colors via CSS variables in `index.css` (`:root`)
- Comic aesthetic: halftone dot background, bold black borders, `Bangers` display font, `Comic Neue` body font (both from Google Fonts)
- Panel borders: `4px solid #1a1a1a` with `box-shadow: 4px 4px 0 #1a1a1a`
- Speech bubbles: CSS `::before` pseudo-element for the tail
- No external CSS frameworks

---

## Common Tasks for AI Agents

### Add a new panel style option
1. Add option to `StoryInput.jsx` select dropdown
2. Pass style string to `useComicGenerator.js`
3. Prepend style descriptor to every `imagePrompt` in `openai.js`

### Change number of panels
The `panelCount` prop flows from `StoryInput` → `useComicGenerator` → `breakStoryIntoPanels`. Default is 4.

### Fix a broken API call
All API logic is isolated in `src/services/openai.js`. Check console for the raw error. Common issues:
- `401`: Bad API key in `.env`
- `429`: Rate limit hit — add delay between DALL-E calls
- JSON parse error: GPT-4o returned markdown fences — strip with `.replace(/```json|```/g, '')`

### Add PDF export
Replace `html2canvas` PNG download in `utils/download.js` with `jsPDF`:
```js
npm install jspdf
// Then use jspdf.addImage() with the canvas data
```

---

## Running the Project
```bash
npm install
cp .env.example .env   # then add your key
npm run dev            # starts at http://localhost:5173
npm run build          # production build
```

---

## Do Not
- Do not commit `.env`
- Do not call OpenAI APIs outside of `src/services/openai.js`
- Do not use inline styles — use CSS classes defined in component-level `<style>` blocks or `index.css`
- Do not add unnecessary dependencies — keep the bundle lean
