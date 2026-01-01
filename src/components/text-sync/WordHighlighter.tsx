// src/components/text-sync/WordHighlighter.tsx
// Mëku Storybook Studio v2.1.0
// Displays text with word-level highlighting synchronized to audio

import React, { useEffect, useRef } from 'react';
import { WordEvent } from '@/types/textSync';
import { cn } from '@/lib/utils';

interface WordHighlighterProps {
  text: string;
  wordEvents: WordEvent[];
  currentTime: number;
  isPlaying: boolean;
  onWordClick?: (wordIndex: number) => void;
  editMode?: boolean;
  className?: string;
}

// CSS classes for highlight colors
const HIGHLIGHT_CLASSES: Record<string, string> = {
  yellow: 'bg-yellow-200/80 dark:bg-yellow-500/30',
  pink: 'bg-pink-200/80 dark:bg-pink-500/30',
  blue: 'bg-blue-200/80 dark:bg-blue-500/30',
  green: 'bg-green-200/80 dark:bg-green-500/30',
  orange: 'bg-orange-200/80 dark:bg-orange-500/30',
  purple: 'bg-purple-200/80 dark:bg-purple-500/30',
};

export const WordHighlighter: React.FC<WordHighlighterProps> = ({
  text,
  wordEvents,
  currentTime,
  isPlaying,
  onWordClick,
  editMode = false,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const words = text.split(/(\s+)/).filter(word => word.trim().length > 0);
  
  // Find active word event based on current playback time
  const getActiveWordEvent = (wordIndex: number): WordEvent | null => {
    return wordEvents.find(event => 
      event.wordIndex === wordIndex && 
      currentTime >= event.startTime && 
      currentTime <= event.endTime
    ) || null;
  };

  // Get any word event for this index (for showing assigned highlights)
  const getWordEvent = (wordIndex: number): WordEvent | null => {
    return wordEvents.find(event => event.wordIndex === wordIndex) || null;
  };

  // Auto-scroll to active word during playback
  useEffect(() => {
    if (isPlaying && containerRef.current) {
      const activeElement = containerRef.current.querySelector('.word-active');
      if (activeElement) {
        activeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    }
  }, [currentTime, isPlaying]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "text-content leading-relaxed text-lg font-medium",
        className
      )}
    >
      {words.map((word, index) => {
        const wordEvent = getWordEvent(index);
        const isActive = getActiveWordEvent(index) !== null;
        const highlightClass = wordEvent ? HIGHLIGHT_CLASSES[wordEvent.highlight] : '';
        
        return (
          <span
            key={index}
            className={cn(
              'inline-block px-0.5 rounded transition-all duration-150',
              // Base highlight if assigned
              wordEvent && highlightClass,
              // Active state - currently being spoken
              isActive && 'word-active scale-105 ring-2 ring-primary shadow-md',
              // Edit mode hover state
              editMode && 'cursor-pointer hover:bg-accent/30 hover:scale-105',
              // Already has highlight indicator in edit mode
              editMode && wordEvent && 'ring-1 ring-offset-1 ring-muted-foreground/30'
            )}
            onClick={() => editMode && onWordClick?.(index)}
            data-word-index={index}
            style={{
              userSelect: editMode ? 'none' : 'auto'
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export default WordHighlighter;
