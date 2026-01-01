// src/lib/timelineLogger.ts
// Mëku Storybook Studio v2.1.0
// Timeline event logging - simplified version
// TODO: Connect to MiniDevTools logs panel when ready

export type TimelineSeverity = 'info' | 'warn' | 'error';

export interface TimelineLogEntry {
  action: string;
  severity: TimelineSeverity;
  component: 'TimelineCore' | 'Playback' | 'Cut' | 'Mend' | 'Clip' | 'Preview';
  details?: Record<string, any>;
  timestamp: Date;
}

// Track error count for severity dot system
let errorCount = 0;
let warnCount = 0;

// Store for log entries (can be accessed by DevTools)
const logEntries: TimelineLogEntry[] = [];
const MAX_ENTRIES = 100;

export const getTimelineErrorCount = () => errorCount;
export const getTimelineWarnCount = () => warnCount;
export const getLogEntries = () => [...logEntries];

export const resetTimelineCounts = () => {
  errorCount = 0;
  warnCount = 0;
};

export const clearLogs = () => {
  logEntries.length = 0;
  resetTimelineCounts();
};

export const logTimelineEvent = (
  severity: TimelineSeverity,
  action: string,
  details?: Record<string, any>
) => {
  // Track counts
  if (severity === 'error') errorCount++;
  if (severity === 'warn') warnCount++;

  // Create entry
  const entry: TimelineLogEntry = {
    action,
    severity,
    component: 'TimelineCore',
    details,
    timestamp: new Date(),
  };

  // Store entry
  logEntries.unshift(entry);
  if (logEntries.length > MAX_ENTRIES) {
    logEntries.pop();
  }

  // Console log with color coding
  const prefix = '[Timeline]';
  const style = severity === 'error' 
    ? 'color: #ef4444' 
    : severity === 'warn' 
      ? 'color: #f59e0b' 
      : 'color: #3b82f6';
  
  console.log(`%c${prefix} ${action}`, style, details || '');
};

// Convenience functions for common events
export const logClipAdded = (trackType: string, startTime: number, duration: number) => {
  logTimelineEvent('info', `Clip added to ${trackType} track at ${startTime.toFixed(1)}s`, {
    trackType,
    startTime,
    duration,
  });
};

export const logClipRemoved = (trackType: string, clipLabel: string) => {
  logTimelineEvent('info', `Clip "${clipLabel}" removed from ${trackType} track`, {
    trackType,
    clipLabel,
  });
};

export const logCutOperation = (type: 'inside' | 'outside', durationRemoved: number) => {
  logTimelineEvent('info', `Cut ${type}: removed ${durationRemoved.toFixed(1)}s`, {
    operation: 'cut',
    type,
    durationRemoved,
  });
};

export const logMendComplete = (position: number) => {
  logTimelineEvent('info', 'Mend complete - timeline stitched', {
    operation: 'mend',
    position,
    duration: 0.3,
  });
};

export const logPlaybackError = (error: string, details?: Record<string, any>) => {
  logTimelineEvent('error', `Playback error: ${error}`, {
    ...details,
    error,
  });
};

export const logAudioError = (clipLabel: string, error: string) => {
  logTimelineEvent('error', `Audio error for "${clipLabel}": ${error}`, {
    clipLabel,
    error,
  });
};
