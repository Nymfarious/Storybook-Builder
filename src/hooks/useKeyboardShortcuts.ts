// src/hooks/useKeyboardShortcuts.ts
// Mëku Storybook Studio v2.1.0
// Keyboard shortcuts including Mini DevTools toggle

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutHandlers {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitToView?: () => void;
  onToggleDevTools?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { ctrlKey, metaKey, shiftKey, altKey, key } = e;
    const cmdOrCtrl = ctrlKey || metaKey;

    // CTRL + Alt + V → Toggle Mini DevTools
    if (cmdOrCtrl && altKey && key.toLowerCase() === 'v') {
      e.preventDefault();
      handlers.onToggleDevTools?.();
      return;
    }

    // CTRL/CMD + Z → Undo
    if (cmdOrCtrl && !shiftKey && key.toLowerCase() === 'z') {
      e.preventDefault();
      handlers.onUndo?.();
      return;
    }

    // CTRL/CMD + Shift + Z → Redo
    if (cmdOrCtrl && shiftKey && key.toLowerCase() === 'z') {
      e.preventDefault();
      handlers.onRedo?.();
      return;
    }

    // CTRL/CMD + Y → Redo (alternative)
    if (cmdOrCtrl && key.toLowerCase() === 'y') {
      e.preventDefault();
      handlers.onRedo?.();
      return;
    }

    // CTRL/CMD + S → Save
    if (cmdOrCtrl && key.toLowerCase() === 's') {
      e.preventDefault();
      handlers.onSave?.();
      return;
    }

    // CTRL/CMD + = or + → Zoom In
    if (cmdOrCtrl && (key === '=' || key === '+')) {
      e.preventDefault();
      handlers.onZoomIn?.();
      return;
    }

    // CTRL/CMD + - → Zoom Out
    if (cmdOrCtrl && key === '-') {
      e.preventDefault();
      handlers.onZoomOut?.();
      return;
    }

    // CTRL/CMD + 0 → Fit to View
    if (cmdOrCtrl && key === '0') {
      e.preventDefault();
      handlers.onFitToView?.();
      return;
    }

    // CTRL/CMD + D → Duplicate
    if (cmdOrCtrl && key.toLowerCase() === 'd') {
      e.preventDefault();
      handlers.onDuplicate?.();
      return;
    }

    // Delete or Backspace → Delete selected
    if (key === 'Delete' || key === 'Backspace') {
      // Only if not in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
        e.preventDefault();
        handlers.onDelete?.();
      }
      return;
    }

    // Escape → Deselect / Close
    if (key === 'Escape') {
      handlers.onEscape?.();
      return;
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Separate hook for scroll-based zoom
export function useScrollZoom(
  containerRef: React.RefObject<HTMLElement>,
  onZoom: (delta: number) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const handleWheel = (e: WheelEvent) => {
      // CTRL + scroll → Zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        onZoom(delta);
        return;
      }

      // Shift + scroll → Horizontal scroll (side to side)
      if (e.shiftKey) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
        return;
      }

      // Regular scroll → Vertical scroll (default behavior)
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [containerRef, onZoom, enabled]);
}

// Hook for tracking Mini DevTools visibility
export function useMiniDevToolsVisibility(initialVisible: boolean = false) {
  const [visible, setVisible] = useState(initialVisible);

  const toggle = useCallback(() => {
    setVisible(prev => !prev);
  }, []);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  return { visible, toggle, show, hide };
}

// Need to import useState for the last hook
import { useState } from 'react';

/* 
KEYBOARD SHORTCUTS REFERENCE:
============================
CTRL + Alt + V     → Toggle Mini DevTools (wrench icon)
CTRL/CMD + Z       → Undo
CTRL/CMD + Shift+Z → Redo
CTRL/CMD + Y       → Redo (alternative)
CTRL/CMD + S       → Save
CTRL/CMD + =       → Zoom In
CTRL/CMD + -       → Zoom Out
CTRL/CMD + 0       → Fit to View
CTRL/CMD + D       → Duplicate
Delete/Backspace   → Delete selected
Escape             → Deselect / Close modal

SCROLL BEHAVIORS:
=================
CTRL + Scroll      → Zoom in/out
Shift + Scroll     → Horizontal scroll (side to side)
Regular Scroll     → Vertical scroll
*/
