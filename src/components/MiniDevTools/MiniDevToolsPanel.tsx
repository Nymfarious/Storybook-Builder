// src/components/MiniDevTools/MiniDevToolsPanel.tsx
// Mëku Storybook Studio v2.1.0
// Main DevTools drawer with all panels

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Eye, 
  Volume2, 
  Film, 
  FileText, 
  Code, 
  Network, 
  Bot, 
  TestTube, 
  Map, 
  Palette, 
  AlertCircle, 
  Shield, 
  Activity,
  GripHorizontal,
  X,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDevLogsStore } from '@/stores/devLogsStore';

// Panel components - import these as you add them
import { APIsPanel } from './panels/APIsPanel';
import { AgentsPanel } from './panels/AgentsPanel';
import { FlowchartPanel } from './panels/FlowchartPanel';
import { LogsPanel } from './panels/LogsPanel';
// Placeholder panels - replace with real ones as you build them
// import { OverviewPanel } from './panels/OverviewPanel';
// import { AudioPanel } from './panels/AudioPanel';
// import { VideoPanel } from './panels/VideoPanel';
// import { TextSyncPanel } from './panels/TextSyncPanel';
// import { LibrariesPanel } from './panels/LibrariesPanel';
// import { DataTestPanel } from './panels/DataTestPanel';
// import { UITokensPanel } from './panels/UITokensPanel';
// import { SecurityPanel } from './panels/SecurityPanel';
// import { PipelinePanel } from './panels/PipelinePanel';

interface DevToolsSection {
  id: string;
  label: string;
  icon: React.ElementType;
  component?: React.ComponentType;
  badge?: number | string;
}

interface MiniDevToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniDevToolsPanel({ isOpen, onClose }: MiniDevToolsPanelProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [panelHeight, setPanelHeight] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const { hasUnreadErrors, errorCount, warnCount } = useDevLogsStore();

  // Define all sections
  const sections: DevToolsSection[] = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'video', label: 'Video/Animation', icon: Film },
    { id: 'text', label: 'Text Sync', icon: FileText },
    { id: 'libraries', label: 'Libraries', icon: Code },
    { id: 'apis', label: 'API Keys', icon: Key, component: APIsPanel },
    { id: 'agents', label: 'AI Agents', icon: Bot, component: AgentsPanel },
    { id: 'data', label: 'Data & Test', icon: TestTube },
    { id: 'flowchart', label: 'Route Map', icon: Map, component: FlowchartPanel },
    { id: 'tokens', label: 'UI Tokens', icon: Palette },
    { 
      id: 'logs', 
      label: 'Logs', 
      icon: AlertCircle, 
      component: LogsPanel,
      badge: errorCount > 0 ? errorCount : warnCount > 0 ? warnCount : undefined 
    },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'pipeline', label: 'Pipeline', icon: Activity },
  ];

  // Handle drag resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = panelHeight;
    e.preventDefault();
  }, [panelHeight]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = dragStartY.current - e.clientY;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.max(25, Math.min(85, dragStartHeight.current + deltaPercent));
    setPanelHeight(newHeight);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach global mouse listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Get current section's component
  const ActiveComponent = sections.find(s => s.id === activeSection)?.component;

  // Render placeholder for sections without components yet
  const renderPlaceholder = (sectionId: string) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        {React.createElement(sections.find(s => s.id === sectionId)?.icon || Eye, { 
          className: "h-8 w-8 text-muted-foreground" 
        })}
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {sections.find(s => s.id === sectionId)?.label}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        This panel is coming soon. Check back after the next update!
      </p>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-card/95 backdrop-blur-xl border-t border-border",
        "shadow-2xl shadow-black/20",
        "transition-transform duration-300 ease-out",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}
      style={{ height: `${panelHeight}vh` }}
    >
      {/* Drag Handle */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-6 cursor-ns-resize",
          "flex items-center justify-center",
          "hover:bg-muted/50 transition-colors",
          isDragging && "bg-muted/50"
        )}
        onMouseDown={handleMouseDown}
      >
        <GripHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-1 right-2 h-6 w-6 p-0 z-10"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Main Layout */}
      <div className="flex h-full pt-6">
        {/* Icon Rail */}
        <div className="w-12 flex-shrink-0 border-r border-border bg-muted/30">
          <ScrollArea className="h-full">
            <div className="flex flex-col items-center py-2 gap-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <Tooltip key={section.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          "relative w-9 h-9 rounded-lg flex items-center justify-center",
                          "transition-all duration-150",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-md" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        
                        {/* Badge */}
                        {section.badge && (
                          <span className={cn(
                            "absolute -top-1 -right-1 min-w-[16px] h-4 px-1",
                            "rounded-full text-[10px] font-medium",
                            "flex items-center justify-center",
                            section.id === 'logs' && errorCount > 0
                              ? "bg-red-500 text-white"
                              : "bg-amber-500 text-white"
                          )}>
                            {section.badge}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">
                      {section.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {ActiveComponent ? (
                <ActiveComponent />
              ) : (
                renderPlaceholder(activeSection)
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

export default MiniDevToolsPanel;
