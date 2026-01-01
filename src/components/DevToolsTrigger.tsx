// src/components/MiniDevTools/DevToolsTrigger.tsx
// Mëku Storybook Studio v2.1.0
// Wrench button to open Mini DevTools - toggle with CTRL+Alt+V

import React from 'react';
import { Wrench } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DevToolsTriggerProps {
  visible: boolean;
  onClick: () => void;
  isDevToolsOpen?: boolean;
}

export const DevToolsTrigger: React.FC<DevToolsTriggerProps> = ({
  visible,
  onClick,
  isDevToolsOpen = false,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            'mini-devtools-trigger',
            !visible && 'hidden'
          )}
          onClick={onClick}
          aria-label="Toggle Mini DevTools"
          aria-expanded={isDevToolsOpen}
        >
          <Wrench 
            className={cn(
              'transition-transform duration-200',
              isDevToolsOpen && 'rotate-45'
            )} 
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" sideOffset={8}>
        <p className="text-xs">
          {isDevToolsOpen ? 'Close' : 'Open'} DevTools
          <span className="ml-2 text-muted-foreground">Ctrl+Alt+V</span>
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
