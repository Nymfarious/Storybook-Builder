// src/lib/version.ts
// MeKu Storybook Builder - Version Constants

export const APP_VERSION = '2.3.0';
export const APP_NAME = 'MeKu Storybook Builder';
export const APP_CODENAME = 'Wordsmith';
export const BUILD_DATE = '2026-01-02';

export const VERSION_HISTORY = [
  { version: '2.3.0', date: '2026-01-02', name: 'Wordsmith', notes: 'Fixed undo/redo, fit-to-viewport, dynamic routing for GitHub Pages, blocked social media bots' },
  { version: '2.2.0', date: '2026-01-01', name: 'Storyteller', notes: 'Story player, timeline animations, tap reactions, particle effects' },
  { version: '2.1.1', date: '2026-01-01', name: 'Foundation', notes: 'Repo rename to MeKu-Storybook-Builder, base path fix' },
  { version: '2.1.0', date: '2025-01-01', name: 'Foundation', notes: 'Mini DevTools, API management, responsive panels' },
  { version: '2.0.0', date: '2024-12-28', name: 'Genesis', notes: 'Initial Lovable build with core UI' },
];

export const getVersionString = () => `v${APP_VERSION}`;
export const getFullVersionString = () => `${APP_NAME} v${APP_VERSION} "${APP_CODENAME}"`;
