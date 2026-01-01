import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MoreVertical, 
  SplitSquareHorizontal, 
  SplitSquareVertical, 
  Combine, 
  Trash2,
  Copy,
  Columns,
  Rows
} from 'lucide-react';
import { Node, SplitNode, LeafNode } from '@/types/nodes';
import { uid, DEFAULT_LEAF } from '@/utils/nodeUtils';

interface PanelOperationsMenuProps {
  selectedNode: Node | null;
  parentNode: SplitNode | null;
  onSplitPanel: (direction: 'horizontal' | 'vertical', count: number) => void;
  onMergePanel: () => void;
  onDeletePanel: () => void;
  onDuplicatePanel: () => void;
}

export const PanelOperationsMenu: React.FC<PanelOperationsMenuProps> = ({
  selectedNode,
  parentNode,
  onSplitPanel,
  onMergePanel,
  onDeletePanel,
  onDuplicatePanel
}) => {
  const canMerge = parentNode && parentNode.children.length > 1;
  const canDelete = parentNode && parentNode.children.length > 1;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Panel Operations</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        {/* Split Options */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <SplitSquareHorizontal className="h-4 w-4 mr-2" />
            Split Horizontal
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border-border">
            <DropdownMenuItem onClick={() => onSplitPanel('horizontal', 2)} className="cursor-pointer">
              <Rows className="h-4 w-4 mr-2" />
              2 Panels
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSplitPanel('horizontal', 3)} className="cursor-pointer">
              <Rows className="h-4 w-4 mr-2" />
              3 Panels
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSplitPanel('horizontal', 4)} className="cursor-pointer">
              <Rows className="h-4 w-4 mr-2" />
              4 Panels
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <SplitSquareVertical className="h-4 w-4 mr-2" />
            Split Vertical
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-popover border-border">
            <DropdownMenuItem onClick={() => onSplitPanel('vertical', 2)} className="cursor-pointer">
              <Columns className="h-4 w-4 mr-2" />
              2 Panels
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSplitPanel('vertical', 3)} className="cursor-pointer">
              <Columns className="h-4 w-4 mr-2" />
              3 Panels
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSplitPanel('vertical', 4)} className="cursor-pointer">
              <Columns className="h-4 w-4 mr-2" />
              4 Panels
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onDuplicatePanel} className="cursor-pointer">
          <Copy className="h-4 w-4 mr-2" />
          Duplicate Panel
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={onMergePanel} 
          disabled={!canMerge}
          className="cursor-pointer"
        >
          <Combine className="h-4 w-4 mr-2" />
          Merge with Sibling
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={onDeletePanel} 
          disabled={!canDelete}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Panel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Helper functions for panel operations
export const splitLeafNode = (
  node: LeafNode, 
  direction: 'horizontal' | 'vertical', 
  count: number
): SplitNode => {
  const sizes = Array(count).fill(1 / count);
  const children: LeafNode[] = [];
  
  // Keep the first child as the original node's copy
  children.push({ ...node, id: uid() });
  
  // Create additional empty leaves
  for (let i = 1; i < count; i++) {
    children.push(DEFAULT_LEAF());
  }
  
  return {
    kind: 'split',
    id: uid(),
    direction,
    sizes,
    children
  };
};

export const splitSplitNode = (
  node: SplitNode,
  direction: 'horizontal' | 'vertical',
  count: number
): SplitNode => {
  const sizes = Array(count).fill(1 / count);
  const children: Node[] = [];
  
  // Keep the first child as the original node
  children.push({ ...node, id: uid() });
  
  // Create additional empty leaves
  for (let i = 1; i < count; i++) {
    children.push(DEFAULT_LEAF());
  }
  
  return {
    kind: 'split',
    id: uid(),
    direction,
    sizes,
    children
  };
};

