// src/components/MiniDevTools/MiniDevToolsPanel.tsx
// Mëku Storybook Studio v2.1.0
// Slide-out DevTools drawer with icon rail navigation

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  GripHorizontal,
  Info,
  Volume2,
  Film,
  FileText,
  Package,
  Network,
  Bot,
  TestTube,
  Map,
  Palette,
  AlertCircle,
  Shield,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// DevTools section definitions
const SECTIONS = [
  { id: 'overview', icon: Info, label: 'Overview', description: 'App info, version, environment' },
  { id: 'audio', icon: Volume2, label: 'Audio', description: 'Mute toggles, volume, test routes' },
  { id: 'video', icon: Film, label: 'Video/Animation', description: 'Rive status, FPS, debug mode' },
  { id: 'content', icon: FileText, label: 'Text/Content', description: 'JSON inspector, validation' },
  { id: 'libraries', icon: Package, label: 'Libraries', description: 'Dependencies with versions' },
  { id: 'apis', icon: Network, label: 'APIs', description: 'Registry, connection tests' },
  { id: 'agents', icon: Bot, label: 'MCP/Agents', description: 'Agent list, mock prompts' },
  { id: 'data', icon: TestTube, label: 'Data & Test', description: 'Seed data, health checks' },
  { id: 'flowchart', icon: Map, label: 'Flowchart', description: 'App route mapping' },
  { id: 'tokens', icon: Palette, label: 'UI Tokens', description: 'Colors, typography, themes' },
  { id: 'logs', icon: AlertCircle, label: 'Logs', description: 'Error console, warnings', hasNotification: true },
  { id: 'security', icon: Shield, label: 'Security', description: 'Edge functions, RLS, secrets' },
  { id: 'pipeline', icon: Activity, label: 'Pipeline', description: 'Generation history, lineage' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

interface MiniDevToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Panel height constraints
const MIN_HEIGHT_PERCENT = 33;
const DEFAULT_HEIGHT_PERCENT = 50;
const MAX_HEIGHT_PERCENT = 75;

export const MiniDevToolsPanel: React.FC<MiniDevToolsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT_PERCENT);

  // Drag handler for resizing
  const handleDragResize = (e: any, info: any) => {
    const windowHeight = window.innerHeight;
    const newHeightPx = (panelHeight / 100) * windowHeight - info.delta.y;
    const newHeightPercent = Math.max(
      MIN_HEIGHT_PERCENT, 
      Math.min(MAX_HEIGHT_PERCENT, (newHeightPx / windowHeight) * 100)
    );
    setPanelHeight(newHeightPercent);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl z-[9998] flex flex-col"
          style={{ height: `${panelHeight}%` }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Resize Handle */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0}
            dragMomentum={false}
            onDrag={handleDragResize}
            className="absolute -top-2 left-0 right-0 h-4 flex justify-center items-center cursor-row-resize z-10"
            title="Drag to resize panel"
          >
            <GripHorizontal className="w-8 h-8 text-muted-foreground/50 hover:text-primary transition-colors" />
          </motion.div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <h3 className="text-sm font-semibold">Mini DevTools</h3>
              <span className="text-xs text-muted-foreground">Mëku Storybook Studio</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-7 w-7"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Icon Rail */}
            <div className="w-12 bg-card/30 border-r border-border flex flex-col items-center py-2 gap-1 overflow-y-auto custom-scrollbar">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <Tooltip key={section.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          'relative w-9 h-9 flex items-center justify-center rounded-md transition-all',
                          isActive 
                            ? 'bg-primary/20 text-primary' 
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {section.hasNotification && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      <p className="font-medium">{section.label}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 overflow-auto custom-scrollbar">
              <SectionContent sectionId={activeSection} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Section content renderer
const SectionContent: React.FC<{ sectionId: SectionId }> = ({ sectionId }) => {
  const section = SECTIONS.find(s => s.id === sectionId);
  
  switch (sectionId) {
    case 'overview':
      return <OverviewSection />;
    case 'tokens':
      return <UITokensSection />;
    case 'logs':
      return <LogsSection />;
    default:
      return (
        <div className="text-center py-12 text-muted-foreground">
          <section.icon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">{section?.label}</p>
          <p className="text-xs mt-1">Coming soon...</p>
        </div>
      );
  }
};

// Overview Section
const OverviewSection: React.FC = () => (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold">Overview</h4>
    
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <InfoCard label="App Name" value="Mëku Storybook Studio" />
      <InfoCard label="Version" value="2.1.0" />
      <InfoCard label="Environment" value={import.meta.env.MODE || 'development'} />
      <InfoCard label="Build" value={import.meta.env.VITE_BUILD_ID || 'dev'} />
      <InfoCard label="AppVerse" value="Mëku Suite" />
      <InfoCard label="Status" value="Active" valueColor="text-green-500" />
    </div>

    <div className="mt-6">
      <h5 className="text-sm font-medium mb-2">Quick Links</h5>
      <div className="flex flex-wrap gap-2">
        <QuickLink href="https://replicate.com/account" label="Replicate Dashboard" />
        <QuickLink href="https://supabase.com/dashboard" label="Supabase" />
        <QuickLink href="#" label="Docs" disabled />
      </div>
    </div>
  </div>
);

// UI Tokens Section
const UITokensSection: React.FC = () => (
  <div className="space-y-4">
    <h4 className="text-lg font-semibold">UI Tokens</h4>
    
    <div>
      <h5 className="text-sm font-medium mb-2">Canvas Colors</h5>
      <div className="flex gap-2">
        <ColorSwatch color="#f5f0e6" label="Parchment" />
        <ColorSwatch color="#fffef9" label="Cream" />
        <ColorSwatch color="#fffff5" label="Ivory" />
        <ColorSwatch color="#f0e9d8" label="Aged" />
      </div>
    </div>

    <div>
      <h5 className="text-sm font-medium mb-2">Brand Colors</h5>
      <div className="flex gap-2">
        <ColorSwatch color="#8b5cf6" label="Purple" />
        <ColorSwatch color="#06b6d4" label="Cyan" />
        <ColorSwatch color="#7c3aed" label="Purple Dark" />
      </div>
    </div>
  </div>
);

// Logs Section
const LogsSection: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="text-lg font-semibold">Logs</h4>
      <Button variant="outline" size="sm">Clear</Button>
    </div>
    
    <div className="bg-background/50 rounded-lg border border-border p-3 font-mono text-xs space-y-1 max-h-64 overflow-auto">
      <LogLine level="info" message="App initialized" time="00:00:01" />
      <LogLine level="info" message="Provider registry loaded" time="00:00:02" />
      <LogLine level="warn" message="No API keys configured" time="00:00:02" />
    </div>
  </div>
);

// Helper Components
const InfoCard: React.FC<{ label: string; value: string; valueColor?: string }> = ({ 
  label, value, valueColor 
}) => (
  <div className="bg-background/50 rounded-lg border border-border p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={cn("text-sm font-medium mt-0.5", valueColor)}>{value}</p>
  </div>
);

const QuickLink: React.FC<{ href: string; label: string; disabled?: boolean }> = ({ 
  href, label, disabled 
}) => (
  <a
    href={disabled ? undefined : href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "text-xs px-2 py-1 rounded border",
      disabled 
        ? "border-border text-muted-foreground cursor-not-allowed opacity-50"
        : "border-primary/30 text-primary hover:bg-primary/10 transition-colors"
    )}
  >
    {label}
  </a>
);

const ColorSwatch: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div 
        className="w-10 h-10 rounded-lg border border-border cursor-pointer hover:scale-105 transition-transform"
        style={{ backgroundColor: color }}
      />
    </TooltipTrigger>
    <TooltipContent>
      <p>{label}</p>
      <p className="text-xs text-muted-foreground font-mono">{color}</p>
    </TooltipContent>
  </Tooltip>
);

const LogLine: React.FC<{ level: 'info' | 'warn' | 'error'; message: string; time: string }> = ({
  level, message, time
}) => (
  <div className="flex gap-2">
    <span className="text-muted-foreground">[{time}]</span>
    <span className={cn(
      level === 'info' && 'text-blue-400',
      level === 'warn' && 'text-yellow-400',
      level === 'error' && 'text-red-400'
    )}>
      {level.toUpperCase()}
    </span>
    <span>{message}</span>
  </div>
);
