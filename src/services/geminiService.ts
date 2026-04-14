import { GoogleGenAI, Type } from "@google/genai";
import { Panel } from "../types/comic";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function parseStoryToPanels(story: string): Promise<{ title: string; panels: Panel[] }> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert the following story into a comic book format with 4 to 8 panels. 
    For each panel, provide a detailed visual description for an image generator, and any dialogue or captions.
    
    Story: ${story}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          panels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                panelNumber: { type: Type.INTEGER },
                visualDescription: { type: Type.STRING, description: "Detailed prompt for image generation" },
                dialogue: { type: Type.STRING, description: "Speech bubbles content" },
                caption: { type: Type.STRING, description: "Narrative text at top/bottom" },
              },
              required: ["panelNumber", "visualDescription", "dialogue"],
            },
          },
        },
        required: ["title", "panels"],
      },
    },
  });

  const result = JSON.parse(response.text);
  return {
    title: result.title,
    panels: result.panels.map((p: any, index: number) => ({
      ...p,
      id: `panel-${index}`,
    })),
  };
}

export async function generatePanelImage(description: string): Promise<string> {
  // Using gemini-2.5-flash-image for generation
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Comic book style illustration, vibrant colors, dynamic composition, high detail: ${description}`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
}
