// src/utils/wordFilter.ts
// Mëku Storybook Studio v2.1.0
// Word filtering and analysis for text-audio sync

import { WordInfo, WordFilterOptions } from '@/types/textSync';

// Common stop words to avoid highlighting
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'would', 'i', 'you', 'your',
  'we', 'our', 'they', 'their', 'them', 'this', 'these', 'those',
  'what', 'where', 'when', 'why', 'how', 'who', 'which', 'can',
  'could', 'should', 'would', 'have', 'had', 'do', 'does', 'did',
  'am', 'are', 'was', 'were', 'been', 'being', 'get', 'got', 'go',
  'goes', 'went', 'come', 'came', 'make', 'made', 'take', 'took',
  'see', 'saw', 'look', 'looked', 'say', 'said', 'tell', 'told',
  'give', 'gave', 'put', 'if', 'then', 'than', 'but', 'or', 'so',
  'not', 'no', 'yes', 'up', 'down', 'out', 'off', 'over', 'under',
  'again', 'here', 'there', 'now', 'just', 'only', 'also', 'too',
  'very', 'much', 'many', 'more', 'most', 'some', 'any', 'all',
  'both', 'each', 'few', 'other', 'another', 'such', 'own', 'same',
  'new', 'old', 'first', 'last', 'long', 'good', 'great', 'little',
  'right', 'left', 'big', 'small', 'she', 'her', 'him', 'his'
]);

export const defaultFilterOptions: WordFilterOptions = {
  minWordLength: 3,
  excludeStopWords: true,
  maxFrequency: 3,
  excludeNumbers: true,
  excludePunctuation: true,
};

/**
 * Analyze all words in text and return metadata about each
 */
export const analyzeWords = (
  text: string, 
  existingHighlights: Set<number> = new Set()
): WordInfo[] => {
  const words = text.split(/(\s+)/).filter(word => word.trim().length > 0);
  const wordFrequency = new Map<string, number>();
  
  // Count word frequencies
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (cleanWord) {
      wordFrequency.set(cleanWord, (wordFrequency.get(cleanWord) || 0) + 1);
    }
  });
  
  return words.map((word, index) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    return {
      text: word,
      index,
      isStopWord: STOP_WORDS.has(cleanWord),
      frequency: wordFrequency.get(cleanWord) || 0,
      isAlreadyHighlighted: existingHighlights.has(index),
    };
  });
};

/**
 * Get words that are suitable for highlighting based on filters
 */
export const getHighlightableWords = (
  text: string, 
  existingHighlights: Set<number> = new Set(),
  options: Partial<WordFilterOptions> = {}
): WordInfo[] => {
  const opts = { ...defaultFilterOptions, ...options };
  const wordInfos = analyzeWords(text, existingHighlights);
  
  return wordInfos.filter(wordInfo => {
    const cleanWord = wordInfo.text.toLowerCase().replace(/[^\w]/g, '');
    
    // Skip if already highlighted
    if (wordInfo.isAlreadyHighlighted) return false;
    
    // Skip if too short
    if (cleanWord.length < opts.minWordLength) return false;
    
    // Skip stop words if enabled
    if (opts.excludeStopWords && wordInfo.isStopWord) return false;
    
    // Skip high frequency words
    if (wordInfo.frequency > opts.maxFrequency) return false;
    
    // Skip numbers if enabled
    if (opts.excludeNumbers && /^\d+$/.test(cleanWord)) return false;
    
    // Skip pure punctuation if enabled
    if (opts.excludePunctuation && /^[^\w]+$/.test(wordInfo.text)) return false;
    
    return true;
  });
};

/**
 * Get a sequence of word indexes between start and end
 */
export const getWordSequence = (
  text: string,
  startIndex: number,
  endIndex: number
): { wordIndexes: number[]; text: string } => {
  const words = text.split(/(\s+)/).filter(word => word.trim().length > 0);
  const wordIndexes: number[] = [];
  
  for (let i = startIndex; i <= Math.min(endIndex, words.length - 1); i++) {
    wordIndexes.push(i);
  }
  
  const sequenceText = wordIndexes.map(i => words[i]).join(' ');
  
  return { wordIndexes, text: sequenceText };
};

/**
 * Split text into words (excluding whitespace)
 */
export const splitIntoWords = (text: string): string[] => {
  return text.split(/(\s+)/).filter(word => word.trim().length > 0);
};
