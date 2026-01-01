// src/stores/devLogsStore.ts
// Mëku Storybook Studio v2.1.0
// DevTools logging store with console interception

import { create } from 'zustand';

export type LogLevel = 'info' | 'warn' | 'error';

export interface DevLog {
  id: string;
  level: LogLevel;
  message: string;
  context?: any;
  timestamp: Date;
  read: boolean;
  source?: string;
}

interface DevLogsStore {
  logs: DevLog[];
  addLog: (log: Omit<DevLog, 'id' | 'timestamp' | 'read'>) => void;
  clearLogs: () => void;
  markAllRead: () => void;
  hasUnreadErrors: boolean;
  errorCount: number;
  warnCount: number;
}

export const useDevLogsStore = create<DevLogsStore>((set, get) => ({
  logs: [],
  hasUnreadErrors: false,
  errorCount: 0,
  warnCount: 0,
  
  addLog: (log) => {
    const newLog: DevLog = {
      ...log,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    
    set((state) => ({
      logs: [newLog, ...state.logs].slice(0, 100), // Keep last 100 logs
      hasUnreadErrors: log.level === 'error' ? true : state.hasUnreadErrors,
      errorCount: log.level === 'error' ? state.errorCount + 1 : state.errorCount,
      warnCount: log.level === 'warn' ? state.warnCount + 1 : state.warnCount,
    }));
  },
  
  clearLogs: () => set({ logs: [], hasUnreadErrors: false, errorCount: 0, warnCount: 0 }),
  
  markAllRead: () => set((state) => ({
    logs: state.logs.map(log => ({ ...log, read: true })),
    hasUnreadErrors: false,
  })),
}));

// Helper function for easy logging from anywhere
export function logDevEvent(level: LogLevel, message: string, context?: any, source?: string) {
  useDevLogsStore.getState().addLog({ level, message, context, source });
}

// Log app startup
logDevEvent('info', 'DevTools initialized', { version: '2.1.0' }, 'system');
