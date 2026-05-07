const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function breakStoryIntoPanels(story, panelCount = 4, style = 'classic American comic') {
  if (!GEMINI_KEY) {
    throw new Error('Missing Gemini API key.');
  }

  const prompt = `You are a professional comic book writer and storyboard artist.
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
Story: ${story}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.candidates[0].content.parts[0].text;
  const clean = raw.replace(/```json|```/gi, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error('Gemini returned malformed JSON. Try again.');
  }
}

export async function generatePanelImage(imagePrompt, style = 'classic American comic') {
  const styledPrompt = `${style} art style, bold ink outlines, vivid colors, dramatic composition, professional comic book illustration: ${imagePrompt}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: styledPrompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Imagen error: ${response.status}`);
  }

  const data = await response.json();
  const imageBytes = data.predictions?.[0]?.bytesBase64Encoded;

  if (imageBytes) {
    return `data:image/png;base64,${imageBytes}`;
  }

  throw new Error('No image generated');
}
