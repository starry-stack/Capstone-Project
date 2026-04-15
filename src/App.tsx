import { useState, useRef } from 'react';
import { BookOpen, Download, Layout, Send, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';
import { Card } from './components/ui/card';
import { ScrollArea } from './components/ui/scroll-area';
import { ComicPanel } from './components/ComicPanel';
import { Panel, ComicBook } from './types/comic';
import { parseStoryToPanels, generatePanelImage } from './services/geminiService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function App() {
  const [story, setStory] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [comic, setComic] = useState<ComicBook | null>(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const comicRef = useRef<HTMLDivElement>(null);

  const handleCreateComic = async () => {
    if (!story.trim()) return;
    
    setIsParsing(true);
    try {
      const result = await parseStoryToPanels(story);
      setComic({
        ...result,
        panels: result.panels.map(p => ({ ...p, isGenerating: false }))
      });
      
      // Start generating images automatically
      generateAllImages(result.panels);
    } catch (error) {
      console.error("Failed to create story:", error);
      alert("Something went wrong while generating your story. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const generateAllImages = async (panels: Panel[]) => {
    setIsGeneratingImages(true);
    
    const updatedPanels = [...panels];
    
    for (let i = 0; i < updatedPanels.length; i++) {
      // Mark as generating
      setComic(prev => prev ? {
        ...prev,
        panels: prev.panels.map((p, idx) => idx === i ? { ...p, isGenerating: true } : p)
      } : null);

      try {
        const imageUrl = await generatePanelImage(updatedPanels[i].visualDescription);
        setComic(prev => prev ? {
          ...prev,
          panels: prev.panels.map((p, idx) => idx === i ? { ...p, imageUrl, isGenerating: false } : p)
        } : null);
      } catch (error) {
        console.error(`Failed to generate image for panel ${i + 1}:`, error);
        setComic(prev => prev ? {
          ...prev,
          panels: prev.panels.map((p, idx) => idx === i ? { ...p, isGenerating: false } : p)
        } : null);
      }
    }
    
    setIsGeneratingImages(false);
  };

  const downloadComic = async () => {
    if (!comicRef.current) return;
    
    const canvas = await html2canvas(comicRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#f4f4f5'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`${comic?.title || 'comic'}.pdf`);
  };

  const reset = () => {
    setComic(null);
    setStory('');
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-yellow-200">
      {/* Header */}
      <header className="border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black p-1.5 rounded-lg">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter">ComicGen AI</h1>
          </div>
          
          {comic && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={reset}
                className="border-2 border-black font-bold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                New Story
              </Button>
              <Button 
                size="sm" 
                onClick={downloadComic}
                disabled={isGeneratingImages}
                className="bg-black text-white hover:bg-zinc-800 border-2 border-black font-bold"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!comic ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
                  Turn your story into a <span className="text-yellow-500">Comic</span>
                </h2>
                <p className="text-zinc-600">
                  Enter a short story, and our AI will handle the panels, dialogue, and illustrations.
                </p>
              </div>

              <Card className="comic-border p-6 bg-white">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                      Your Story
                    </label>
                    <Textarea 
                      placeholder="Once upon a time, in a neon-lit city of the future, a small robot discovered a forgotten garden..."
                      className="min-h-[200px] text-lg border-2 border-zinc-200 focus:border-black transition-colors"
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full h-14 bg-black text-white hover:bg-zinc-800 border-2 border-black text-lg font-bold uppercase tracking-tight"
                    onClick={handleCreateComic}
                    disabled={isParsing || !story.trim()}
                  >
                    {isParsing ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                        Analyzing Story...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Generate Comic
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: BookOpen, title: "Story Creating", desc: "ComicGen breaks your text into cinematic panels." },
                  { icon: Sparkles, title: "AI Art", desc: "Each panel is illustrated with unique AI-generated art." },
                  { icon: Download, title: "Export", desc: "Download your finished comic as a high-quality PDF." }
                ].map((feature, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-4">
                    <div className="bg-zinc-100 p-3 rounded-2xl mb-3">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold mb-1">{feature.title}</h3>
                    <p className="text-xs text-zinc-500">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="comic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                  {comic.title}
                </h2>
                {isGeneratingImages && (
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-zinc-500 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                    Generating Illustrations...
                  </div>
                )}
              </div>

              <div 
                ref={comicRef}
                className="bg-zinc-100 p-8 rounded-xl comic-border relative overflow-hidden"
              >
                <div className="absolute inset-0 halftone-bg pointer-events-none" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  {comic.panels.map((panel) => (
                    <ComicPanel key={panel.id} panel={panel} />
                  ))}
                </div>
                
                <div className="mt-12 pt-8 border-t-2 border-black/10 flex justify-between items-end">
                  <div className="text-xs font-bold uppercase tracking-widest opacity-50">
                    Generated by ComicGen AI
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black uppercase tracking-tighter">
                      The End
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t-2 border-black/5 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Powered by Google Gemini & React
        </p>
      </footer>
    </div>
  );
}
