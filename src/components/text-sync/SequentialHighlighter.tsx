// src/components/text-sync/SequentialHighlighter.tsx
// Mëku Storybook Studio v2.1.0
// UI for creating word-level text-audio synchronization

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wand2, Clock, Zap, SkipForward, Trash2 } from 'lucide-react';
import { WordEvent, HighlightColor } from '@/types/textSync';
import { getHighlightableWords, getWordSequence, defaultFilterOptions } from './wordFilter';
import { WordHighlighter } from './WordHighlighter';

interface SequentialHighlighterProps {
  text: string;
  wordEvents: WordEvent[];
  audioDuration: number;
  onWordEventsChange: (events: WordEvent[]) => void;
}

const HIGHLIGHT_COLORS: { value: HighlightColor; label: string }[] = [
  { value: 'yellow', label: 'Yellow' },
  { value: 'pink', label: 'Pink' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Purple' }
];

const READING_SPEEDS = [
  { value: 'slow', label: 'Slow Reader', wordsPerSecond: 1.5 },
  { value: 'normal', label: 'Normal Reader', wordsPerSecond: 2.5 },
  { value: 'fast', label: 'Fast Reader', wordsPerSecond: 3.5 }
];

export const SequentialHighlighter: React.FC<SequentialHighlighterProps> = ({
  text,
  wordEvents,
  audioDuration,
  onWordEventsChange
}) => {
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [highlightColor, setHighlightColor] = useState<HighlightColor>('yellow');
  const [readingSpeed, setReadingSpeed] = useState('normal');
  const [wordsPerHighlight, setWordsPerHighlight] = useState(3);

  const existingHighlights = new Set(wordEvents.map(event => event.wordIndex));
  const highlightableWords = getHighlightableWords(text, existingHighlights);

  const handleWordClick = useCallback((wordIndex: number) => {
    if (selectionStart === null) {
      setSelectionStart(wordIndex);
      setSelectionEnd(wordIndex);
    } else if (selectionEnd === null || wordIndex === selectionStart) {
      setSelectionEnd(wordIndex);
    } else {
      // Start new selection
      setSelectionStart(wordIndex);
      setSelectionEnd(wordIndex);
    }
  }, [selectionStart, selectionEnd]);

  const createSequentialHighlights = useCallback(() => {
    if (!highlightableWords.length) return;

    const speed = READING_SPEEDS.find(s => s.value === readingSpeed)?.wordsPerSecond || 2.5;
    const timePerWord = 1 / speed;
    
    let currentTime = 0;
    const newEvents: WordEvent[] = [];
    
    // Group words into chunks
    for (let i = 0; i < highlightableWords.length; i += wordsPerHighlight) {
      const wordGroup = highlightableWords.slice(i, i + wordsPerHighlight);
      const startTime = currentTime;
      const duration = wordGroup.length * timePerWord;
      const endTime = Math.min(startTime + duration, audioDuration);
      
      wordGroup.forEach((wordInfo, groupIndex) => {
        const wordStartTime = startTime + (groupIndex * timePerWord);
        const wordEndTime = Math.min(wordStartTime + timePerWord, endTime);
        
        newEvents.push({
          id: `seq-${wordInfo.index}-${Date.now()}`,
          wordIndex: wordInfo.index,
          startTime: wordStartTime,
          endTime: wordEndTime,
          highlight: highlightColor,
          text: wordInfo.text
        });
      });
      
      currentTime = endTime + 0.1; // Small gap between groups
    }
    
    // Remove existing events for these words and add new ones
    const filteredEvents = wordEvents.filter(event => 
      !newEvents.some(newEvent => newEvent.wordIndex === event.wordIndex)
    );
    
    onWordEventsChange([...filteredEvents, ...newEvents]);
  }, [highlightableWords, readingSpeed, wordsPerHighlight, highlightColor, audioDuration, wordEvents, onWordEventsChange]);

  const createSelectionHighlight = useCallback(() => {
    if (selectionStart === null || selectionEnd === null) return;

    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    const sequence = getWordSequence(text, start, end);
    
    const speed = READING_SPEEDS.find(s => s.value === readingSpeed)?.wordsPerSecond || 2.5;
    const timePerWord = 1 / speed;
    
    // Find a good start time (after existing highlights)
    const existingEndTimes = wordEvents.map(e => e.endTime);
    const startTime = existingEndTimes.length > 0 ? Math.max(...existingEndTimes) + 0.2 : 0;
    
    const newEvents: WordEvent[] = sequence.wordIndexes.map((wordIndex, i) => {
      const words = text.split(/(\s+)/).filter(word => word.trim().length > 0);
      return {
        id: `sel-${wordIndex}-${Date.now()}`,
        wordIndex,
        startTime: startTime + (i * timePerWord),
        endTime: startTime + ((i + 1) * timePerWord),
        highlight: highlightColor,
        text: words[wordIndex]
      };
    });

    // Remove existing events for these words and add new ones
    const filteredEvents = wordEvents.filter(event => 
      !newEvents.some(newEvent => newEvent.wordIndex === event.wordIndex)
    );
    
    onWordEventsChange([...filteredEvents, ...newEvents]);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [selectionStart, selectionEnd, text, readingSpeed, highlightColor, wordEvents, onWordEventsChange]);

  const clearAllHighlights = useCallback(() => {
    onWordEventsChange([]);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [onWordEventsChange]);

  const selectionPreview = selectionStart !== null && selectionEnd !== null 
    ? getWordSequence(text, Math.min(selectionStart, selectionEnd), Math.max(selectionStart, selectionEnd))
    : null;

  return (
    <div className="space-y-4">
      {/* Controls Card */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Text-Audio Sync
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Reading Speed</Label>
              <Select value={readingSpeed} onValueChange={setReadingSpeed}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {READING_SPEEDS.map(speed => (
                    <SelectItem key={speed.value} value={speed.value} className="text-xs">
                      {speed.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs">Highlight Color</Label>
              <Select value={highlightColor} onValueChange={(v) => setHighlightColor(v as HighlightColor)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HIGHLIGHT_COLORS.map(color => (
                    <SelectItem key={color.value} value={color.value} className="text-xs">
                      {color.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs">Words/Group</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={wordsPerHighlight}
                onChange={(e) => setWordsPerHighlight(parseInt(e.target.value) || 1)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              onClick={createSequentialHighlights}
              className="h-8 text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Auto-Generate ({highlightableWords.length} words)
            </Button>
            
            {selectionPreview && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={createSelectionHighlight}
                className="h-8 text-xs"
              >
                <SkipForward className="h-3 w-3 mr-1" />
                Highlight Selection ({selectionPreview.wordIndexes.length})
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={clearAllHighlights}
              className="h-8 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>

          {selectionPreview && (
            <div className="p-2 bg-muted/50 rounded-lg">
              <span className="text-xs text-muted-foreground">Selected: </span>
              <Badge variant="outline" className="text-xs">
                {selectionPreview.text}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Text Preview */}
      {text && (
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Text Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-background/50 border rounded-lg p-4 max-h-48 overflow-y-auto">
              <WordHighlighter
                text={text}
                wordEvents={wordEvents}
                currentTime={0}
                isPlaying={false}
                editMode={true}
                onWordClick={handleWordClick}
                className="text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click words to select a range for highlighting
            </p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {wordEvents.length > 0 && (
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline ({wordEvents.length} events)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {wordEvents
                  .sort((a, b) => a.startTime - b.startTime)
                  .map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                    >
                      <Badge className={`word-highlight-${event.highlight} text-xs`}>
                        {event.text}
                      </Badge>
                      <span className="text-muted-foreground">
                        {event.startTime.toFixed(1)}s - {event.endTime.toFixed(1)}s
                      </span>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SequentialHighlighter;
