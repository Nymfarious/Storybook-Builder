// src/components/builder/InspectorPanel.tsx
// Mëku Storybook Studio v2.1.0
// Updated with smaller static text, responsive behavior, hover tooltips

import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EnhancedLeafInspector } from '@/components/EnhancedLeafInspector';
import { SplitInspector } from '@/components/editor';
import { Node, SplitNode, LeafNode } from '@/types/nodes';
import { Character } from '@/types';
import { useResponsivePanel, getResponsiveClasses } from '@/hooks/useResponsivePanel';
import { 
  Layers, 
  Image, 
  Type, 
  Wand2, 
  Settings,
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InspectorPanelProps {
  selectedPage: number;
  selectedNode: Node | null;
  characters: Character[];
  isGenerating: boolean;
  
  // AI generation props
  aiPrompt: string;
  setAiPrompt: (value: string) => void;
  manualImageUrl: string;
  setManualImageUrl: (value: string) => void;
  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
  referenceImageUrl: string;
  setReferenceImageUrl: (value: string) => void;
  referenceImages: string[];
  setReferenceImages: (value: string[]) => void;
  aspectRatio: string;
  setAspectRatio: (value: string) => void;
  seed: number | null;
  setSeed: (value: number | null) => void;
  guidanceScale: number;
  setGuidanceScale: (value: number) => void;
  inferenceSteps: number;
  setInferenceSteps: (value: number) => void;
  imageStrength: number;
  setImageStrength: (value: number) => void;
  outputFormat: string;
  setOutputFormat: (value: string) => void;
  safetyTolerance: number;
  setSafetyTolerance: (value: number) => void;
  promptUpsampling: boolean;
  setPromptUpsampling: (value: boolean) => void;
  
  // Callbacks
  onNodeChange: (updater: (node: Node) => Node) => void;
  onGenerateText: () => void;
  onGenerateImage: (characterId?: string) => void;
}

// Section header with responsive text + icon
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  label: string;
  showLabel: boolean;
  textScale: number;
}> = ({ icon, label, showLabel, textScale }) => {
  const fontSize = Math.max(9, Math.round(11 * textScale));
  
  if (!showLabel) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center p-1 text-muted-foreground">
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <h3 
      className="font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
      style={{ fontSize: `${fontSize}px` }}
    >
      {icon}
      <span className="truncate">{label}</span>
    </h3>
  );
};

// Info row with responsive shrinking
const InfoRow: React.FC<{
  label: string;
  value: string;
  textScale: number;
  showLabel: boolean;
}> = ({ label, value, textScale, showLabel }) => {
  const fontSize = Math.max(9, Math.round(11 * textScale));

  if (!showLabel) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <code 
            className="text-muted-foreground block truncate"
            style={{ fontSize: `${fontSize}px` }}
          >
            {value}
          </code>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{label}: {value}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-1" style={{ fontSize: `${fontSize}px` }}>
      <span className="text-muted-foreground/70">{label}:</span>
      <code className="text-muted-foreground truncate">{value}</code>
    </div>
  );
};

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedPage,
  selectedNode,
  characters,
  isGenerating,
  aiPrompt,
  setAiPrompt,
  manualImageUrl,
  setManualImageUrl,
  negativePrompt,
  setNegativePrompt,
  referenceImageUrl,
  setReferenceImageUrl,
  referenceImages,
  setReferenceImages,
  aspectRatio,
  setAspectRatio,
  seed,
  setSeed,
  guidanceScale,
  setGuidanceScale,
  inferenceSteps,
  setInferenceSteps,
  imageStrength,
  setImageStrength,
  outputFormat,
  setOutputFormat,
  safetyTolerance,
  setSafetyTolerance,
  promptUpsampling,
  setPromptUpsampling,
  onNodeChange,
  onGenerateText,
  onGenerateImage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelState = useResponsivePanel(containerRef, {
    fullThreshold: 220,
    compactThreshold: 160,
    iconOnlyThreshold: 100,
  });

  const { mode, textScale, showLabels } = panelState;

  // Determine content type icon
  const getNodeIcon = () => {
    if (!selectedNode) return <Layers className="w-3.5 h-3.5" />;
    if (selectedNode.kind === 'split') return <Layers className="w-3.5 h-3.5" />;
    const leaf = selectedNode as LeafNode;
    if (leaf.contentType === 'image') return <Image className="w-3.5 h-3.5" />;
    if (leaf.contentType === 'text') return <Type className="w-3.5 h-3.5" />;
    return <Layers className="w-3.5 h-3.5" />;
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "h-full border-l border-border bg-card shadow-card flex flex-col",
        getResponsiveClasses(panelState)
      )}
    >
      <div className="flex-1 overflow-y-auto">
        <div className={cn(
          "space-y-4",
          mode === 'icon-only' ? 'p-2' : 'p-3'
        )}>
          {/* Header section - always compact */}
          <div className="space-y-1">
            <SectionHeader 
              icon={<Settings className="w-3 h-3" />}
              label="Inspector"
              showLabel={showLabels}
              textScale={textScale}
            />
            
            <div className="space-y-0.5">
              <InfoRow 
                label="Page"
                value={`${selectedPage + 1}`}
                textScale={textScale}
                showLabel={showLabels}
              />
              {selectedNode && (
                <InfoRow 
                  label="Segment"
                  value={selectedNode.id.slice(0, 8)}
                  textScale={textScale}
                  showLabel={showLabels}
                />
              )}
            </div>
          </div>
          
          {/* Empty state */}
          {!selectedNode && (
            <Card className="bg-card/50 border-border/50">
              <CardContent className={cn(
                "text-center",
                mode === 'icon-only' ? 'p-2' : 'p-3'
              )}>
                {mode === 'icon-only' ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ChevronRight className="w-5 h-5 mx-auto text-muted-foreground/50" />
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Click a segment to edit</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <p 
                    className="text-muted-foreground"
                    style={{ fontSize: `${Math.max(10, Math.round(12 * textScale))}px` }}
                  >
                    Click a segment to edit
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Leaf node inspector */}
          {selectedNode && selectedNode.kind === "leaf" && (
            <EnhancedLeafInspector 
              node={selectedNode as LeafNode} 
              onChange={onNodeChange}
              onGenerateText={onGenerateText}
              aiPrompt={aiPrompt}
              setAiPrompt={setAiPrompt}
              characters={characters}
              onGenerateImage={onGenerateImage}
              isGenerating={isGenerating}
              manualImageUrl={manualImageUrl}
              setManualImageUrl={setManualImageUrl}
              negativePrompt={negativePrompt}
              setNegativePrompt={setNegativePrompt}
              referenceImageUrl={referenceImageUrl}
              setReferenceImageUrl={setReferenceImageUrl}
              referenceImages={referenceImages}
              setReferenceImages={setReferenceImages}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              seed={seed}
              setSeed={setSeed}
              guidanceScale={guidanceScale}
              setGuidanceScale={setGuidanceScale}
              inferenceSteps={inferenceSteps}
              setInferenceSteps={setInferenceSteps}
              imageStrength={imageStrength}
              setImageStrength={setImageStrength}
              outputFormat={outputFormat}
              setOutputFormat={setOutputFormat}
              safetyTolerance={safetyTolerance}
              setSafetyTolerance={setSafetyTolerance}
              promptUpsampling={promptUpsampling}
              setPromptUpsampling={setPromptUpsampling}
              // Pass responsive state for child components
              compactMode={mode !== 'full'}
              textScale={textScale}
            />
          )}
          
          {/* Split node inspector */}
          {selectedNode && selectedNode.kind === "split" && (
            <SplitInspector 
              node={selectedNode as SplitNode} 
              onChange={onNodeChange}
              compactMode={mode !== 'full'}
              textScale={textScale}
            />
          )}
        </div>
      </div>
    </div>
  );
};
