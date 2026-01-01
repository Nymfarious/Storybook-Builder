// src/types/textSync.ts
// Mëku Storybook Studio v2.1.0
// Text-audio sync types

export type HighlightColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange' | 'purple';

export interface WordEvent {
  id: string;
  wordIndex: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  highlight: HighlightColor;
  text: string;
}

export interface WordInfo {
  text: string;
  index: number;
  isStopWord: boolean;
  frequency: number;
  isAlreadyHighlighted: boolean;
}

export interface WordFilterOptions {
  minWordLength: number;
  excludeStopWords: boolean;
  maxFrequency: number;
  excludeNumbers: boolean;
  excludePunctuation: boolean;
}

export interface TextSyncConfig {
  readingSpeed: 'slow' | 'normal' | 'fast';
  wordsPerGroup: number;
  highlightColor: HighlightColor;
}

export interface PageTextSync {
  pageId: string;
  text: string;
  audioUrl?: string;
  audioDuration: number;
  wordEvents: WordEvent[];
}
