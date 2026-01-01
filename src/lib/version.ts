// src/lib/version.ts
// Mëku Storybook Studio - Version Constants

export const APP_VERSION = '2.1.0';
export const APP_NAME = 'Mëku Storybook Studio';
export const APP_CODENAME = 'Foundation';
export const BUILD_DATE = '2025-01-01';

export const VERSION_HISTORY = [
  { version: '2.1.0', date: '2025-01-01', name: 'Foundation', notes: 'Mini DevTools, API management, responsive panels' },
  { version: '2.0.0', date: '2024-12-28', name: 'Genesis', notes: 'Initial Lovable build with core UI' },
];

export const getVersionString = () => `v${APP_VERSION}`;
export const getFullVersionString = () => `${APP_NAME} v${APP_VERSION} "${APP_CODENAME}"`;
