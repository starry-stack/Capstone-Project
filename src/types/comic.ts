export interface Panel {
  id: string;
  panelNumber: number;
  visualDescription: string;
  dialogue: string;
  caption?: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

export interface ComicBook {
  title: string;
  panels: Panel[];
}
