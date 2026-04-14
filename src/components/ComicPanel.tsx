import React from 'react';
import { Panel } from '../types/comic';
import { Skeleton } from './ui/skeleton';
import { motion } from 'motion/react';

interface ComicPanelProps {
  panel: Panel;
}

export const ComicPanel: React.FC<ComicPanelProps> = ({ panel }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col h-full"
    >
      <div className="comic-border bg-white overflow-hidden flex-1 flex flex-col min-h-[300px]">
        {/* Caption at top */}
        {panel.caption && (
          <div className="caption-box self-start m-2 z-10">
            {panel.caption}
          </div>
        )}

        {/* Image Area */}
        <div className="relative flex-1 bg-zinc-100 flex items-center justify-center overflow-hidden">
          {panel.isGenerating ? (
            <div className="w-full h-full p-4 space-y-4">
              <Skeleton className="w-full h-full bg-zinc-200" />
            </div>
          ) : panel.imageUrl ? (
            <img 
              src={panel.imageUrl} 
              alt={panel.visualDescription}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-zinc-400 text-xs text-center p-4">
              Waiting for generation...
            </div>
          )}
          
          {/* Dialogue Overlay */}
          {panel.dialogue && !panel.isGenerating && panel.imageUrl && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="speech-bubble inline-block max-w-[90%]">
                {panel.dialogue}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Panel Number */}
      <div className="mt-2 text-[10px] font-mono uppercase text-zinc-500 text-right">
        Panel {panel.panelNumber}
      </div>
    </motion.div>
  );
};
