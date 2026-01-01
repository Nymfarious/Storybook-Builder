// src/components/MiniDevTools/index.tsx
// Mëku Storybook Studio v2.1.0
// Mini DevTools - Combined export with provider

import React, { useState, useEffect, useCallback } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DevToolsTrigger } from './DevToolsTrigger';
import { MiniDevToolsPanel } from './MiniDevToolsPanel';

export { DevToolsTrigger } from './DevToolsTrigger';
export { MiniDevToolsPanel } from './MiniDevToolsPanel';

interface MiniDevToolsProps {
  /** Initial visibility of the wrench button */
  initialVisible?: boolean;
  /** Callback when DevTools opens/closes */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * MiniDevTools - Complete component with trigger and panel
 * 
 * Usage:
 * ```tsx
 * // In your App.tsx or layout component
 * import { MiniDevTools } from '@/components/MiniDevTools';
 * 
 * function App() {
 *   return (
 *     <div>
 *       <YourAppContent />
 *       <MiniDevTools />
 *     </div>
 *   );
 * }
 * ```
 * 
 * Keyboard shortcut: CTRL + Alt + V to toggle visibility
 */
export const MiniDevTools: React.FC<MiniDevToolsProps> = ({
  initialVisible = true,
  onOpenChange,
}) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isOpen, setIsOpen] = useState(false);

  // Handle CTRL + Alt + V keyboard shortcut
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { ctrlKey, metaKey, altKey, key } = e;
    const cmdOrCtrl = ctrlKey || metaKey;

    if (cmdOrCtrl && altKey && key.toLowerCase() === 'v') {
      e.preventDefault();
      setIsVisible(prev => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Notify parent of open state changes
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <TooltipProvider>
      <DevToolsTrigger 
        visible={isVisible} 
        onClick={handleToggle}
        isDevToolsOpen={isOpen}
      />
      <MiniDevToolsPanel 
        isOpen={isOpen} 
        onClose={handleClose} 
      />
    </TooltipProvider>
  );
};

// Default export for convenience
export default MiniDevTools;
