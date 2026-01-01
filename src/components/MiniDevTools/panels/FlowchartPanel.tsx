// src/components/MiniDevTools/panels/FlowchartPanel.tsx
// Mëku Storybook Studio v2.1.0
// Visual route map with draggable nodes

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowNode {
  id: string;
  label: string;
  type: 'page' | 'feature' | 'modal' | 'external';
  x: number;
  y: number;
  route?: string;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

// Mëku Storybook routes
const INITIAL_NODES: FlowNode[] = [
  { id: 'home', label: 'Home', type: 'page', x: 50, y: 100, route: '/' },
  { id: 'auth', label: 'Auth', type: 'page', x: 50, y: 200, route: '/auth' },
  { id: 'builder', label: 'Builder', type: 'page', x: 200, y: 50, route: '/graphic-novel-builder' },
  { id: 'assets', label: 'Assets', type: 'page', x: 200, y: 150, route: '/assets' },
  { id: 'props', label: 'Props', type: 'page', x: 200, y: 250, route: '/props' },
  { id: 'saved', label: 'Saved Pages', type: 'page', x: 350, y: 100, route: '/saved-pages' },
  { id: 'storybook', label: 'Storybook', type: 'page', x: 350, y: 200, route: '/storybook/:id' },
  { id: 'settings', label: 'Settings', type: 'modal', x: 500, y: 100, route: '/settings' },
  { id: 'devtools', label: 'DevTools', type: 'feature', x: 500, y: 200 },
  { id: 'timeline', label: 'Timeline', type: 'feature', x: 350, y: 300 },
];

const EDGES: FlowEdge[] = [
  { from: 'home', to: 'builder', label: 'create' },
  { from: 'home', to: 'assets', label: 'manage' },
  { from: 'builder', to: 'saved', label: 'save' },
  { from: 'builder', to: 'storybook', label: 'preview' },
  { from: 'builder', to: 'timeline', label: 'edit' },
  { from: 'assets', to: 'props' },
  { from: 'saved', to: 'storybook' },
  { from: 'home', to: 'settings' },
  { from: 'auth', to: 'home', label: 'login' },
  { from: 'builder', to: 'devtools' },
];

const SVG_WIDTH = 600;
const SVG_HEIGHT = 350;

const TYPE_COLORS = {
  page: { fill: 'fill-blue-500/20', stroke: 'stroke-blue-500', badge: 'default' },
  feature: { fill: 'fill-purple-500/20', stroke: 'stroke-purple-500', badge: 'secondary' },
  modal: { fill: 'fill-amber-500/20', stroke: 'stroke-amber-500', badge: 'outline' },
  external: { fill: 'fill-green-500/20', stroke: 'stroke-green-500', badge: 'outline' },
} as const;

export function FlowchartPanel() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleMouseDown = (nodeId: string) => {
    setDraggedNode(nodeId);
    setSelectedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedNode) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;
    const x = Math.max(40, Math.min(SVG_WIDTH - 40, (e.clientX - rect.left) * scaleX));
    const y = Math.max(20, Math.min(SVG_HEIGHT - 20, (e.clientY - rect.top) * scaleY));

    setNodes((prev) =>
      prev.map((node) => (node.id === draggedNode ? { ...node, x, y } : node))
    );
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const resetPositions = () => {
    setNodes(INITIAL_NODES);
  };

  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  const selectedNodeData = selectedNode ? getNodeById(selectedNode) : null;

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Route Map</CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 ml-2"
                onClick={resetPositions}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="w-full overflow-hidden rounded-lg bg-background/50 border border-border"
            style={{ height: `${SVG_HEIGHT * zoom}px` }}
          >
            <svg
              className="w-full h-full cursor-move"
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Grid pattern */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-border/30"
                  />
                </pattern>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="currentColor" className="text-border" />
                </marker>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Edges */}
              {EDGES.map((edge, i) => {
                const fromNode = getNodeById(edge.from);
                const toNode = getNodeById(edge.to);
                if (!fromNode || !toNode) return null;

                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;

                return (
                  <g key={i}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-border"
                      markerEnd="url(#arrowhead)"
                    />
                    {edge.label && (
                      <text
                        x={midX}
                        y={midY - 5}
                        fontSize="9"
                        fill="currentColor"
                        className="text-muted-foreground"
                        textAnchor="middle"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const colors = TYPE_COLORS[node.type];
                const isSelected = selectedNode === node.id;
                const isDragging = draggedNode === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseDown={() => handleMouseDown(node.id)}
                    className={cn(
                      'cursor-grab',
                      isDragging && 'cursor-grabbing'
                    )}
                  >
                    <rect
                      x="-40"
                      y="-18"
                      width="80"
                      height="36"
                      rx="6"
                      className={cn(
                        colors.fill,
                        colors.stroke,
                        isSelected && 'stroke-2'
                      )}
                      strokeWidth={isSelected ? 2 : 1.5}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fontWeight="500"
                      fill="currentColor"
                      className="text-foreground pointer-events-none select-none"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(TYPE_COLORS).map(([type, config]) => (
              <Badge key={type} variant={config.badge as any} className="text-xs">
                {type}
              </Badge>
            ))}
            <span className="text-xs text-muted-foreground ml-auto">
              Drag nodes to rearrange
            </span>
          </div>

          {/* Selected Node Info */}
          {selectedNodeData && (
            <div className="mt-3 p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={TYPE_COLORS[selectedNodeData.type].badge as any}>
                  {selectedNodeData.label}
                </Badge>
                {selectedNodeData.route && (
                  <code className="text-xs text-muted-foreground bg-background px-1 rounded">
                    {selectedNodeData.route}
                  </code>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
