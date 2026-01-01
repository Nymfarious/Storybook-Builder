// src/hooks/useResponsivePanel.ts
// Mëku Storybook Studio v2.1.0
// Smart panel resizing with icon-only mode switching

import { useState, useEffect, useCallback, RefObject } from 'react';

export type PanelDisplayMode = 'full' | 'compact' | 'icon-only';

interface ResponsivePanelConfig {
  fullThreshold?: number;      // Width above which full text+icon displays
  compactThreshold?: number;   // Width above which compact (smaller text) displays
  iconOnlyThreshold?: number;  // Width below which only icons display
}

interface ResponsivePanelState {
  mode: PanelDisplayMode;
  width: number;
  textScale: number;           // 0.0 to 1.0 - for smooth text scaling
  showLabels: boolean;
  iconSize: 'sm' | 'md' | 'lg';
}

const DEFAULT_CONFIG: ResponsivePanelConfig = {
  fullThreshold: 200,
  compactThreshold: 140,
  iconOnlyThreshold: 80,
};

export function useResponsivePanel(
  containerRef: RefObject<HTMLElement>,
  config: ResponsivePanelConfig = {}
): ResponsivePanelState {
  const { fullThreshold, compactThreshold, iconOnlyThreshold } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const [state, setState] = useState<ResponsivePanelState>({
    mode: 'full',
    width: 250,
    textScale: 1,
    showLabels: true,
    iconSize: 'md',
  });

  const calculateState = useCallback((width: number): ResponsivePanelState => {
    // Icon-only mode - very narrow
    if (width < iconOnlyThreshold!) {
      return {
        mode: 'icon-only',
        width,
        textScale: 0,
        showLabels: false,
        iconSize: 'sm',
      };
    }

    // Compact mode - smaller text, may hide some labels
    if (width < compactThreshold!) {
      const progress = (width - iconOnlyThreshold!) / (compactThreshold! - iconOnlyThreshold!);
      return {
        mode: 'compact',
        width,
        textScale: 0.5 + progress * 0.25, // 0.5 to 0.75
        showLabels: width > (iconOnlyThreshold! + 20),
        iconSize: 'sm',
      };
    }

    // Transitioning to full mode
    if (width < fullThreshold!) {
      const progress = (width - compactThreshold!) / (fullThreshold! - compactThreshold!);
      return {
        mode: 'compact',
        width,
        textScale: 0.75 + progress * 0.25, // 0.75 to 1.0
        showLabels: true,
        iconSize: 'md',
      };
    }

    // Full mode
    return {
      mode: 'full',
      width,
      textScale: 1,
      showLabels: true,
      iconSize: 'md',
    };
  }, [fullThreshold, compactThreshold, iconOnlyThreshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setState(calculateState(width));
      }
    });

    observer.observe(container);
    
    // Initial calculation
    setState(calculateState(container.offsetWidth));

    return () => observer.disconnect();
  }, [containerRef, calculateState]);

  return state;
}

// Utility hook for text that scales with panel
export function useScaledText(baseSize: number, textScale: number): string {
  const scaled = Math.round(baseSize * textScale);
  return `${Math.max(scaled, 9)}px`; // Minimum 9px
}

// CSS class generator for responsive elements
export function getResponsiveClasses(state: ResponsivePanelState): string {
  const classes = [`panel-mode-${state.mode}`];
  
  if (!state.showLabels) {
    classes.push('hide-labels');
  }
  
  classes.push(`icon-${state.iconSize}`);
  
  return classes.join(' ');
}
