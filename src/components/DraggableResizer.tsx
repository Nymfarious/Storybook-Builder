import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SplitSquareHorizontal, SplitSquareVertical, X, Maximize2 } from 'lucide-react';

interface DraggableResizerProps {
  direction: 'horizontal' | 'vertical';
  sizes: number[];
  onSizesChange: (sizes: number[]) => void;
  onSplit?: (index: number, direction: 'horizontal' | 'vertical') => void;
  onMerge?: (index: number) => void;
  onDelete?: (index: number) => void;
  className?: string;
  children: React.ReactNode[];
}

interface ResizeHandle {
  index: number;
  position: number;
}

export const DraggableResizer: React.FC<DraggableResizerProps> = ({
  direction,
  sizes,
  onSizesChange,
  onSplit,
  onMerge,
  onDelete,
  className = '',
  children
}) => {
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState({ pos: 0, sizes: sizes });
  const [hoveredHandle, setHoveredHandle] = useState<number | null>(null);
  const [hoveredChild, setHoveredChild] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isHorizontal = direction === 'horizontal';

  const handleMouseDown = useCallback((handleIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(handleIndex);
    setDragStart({
      pos: isHorizontal ? e.clientX : e.clientY,
      sizes: [...sizes]
    });
  }, [sizes, isHorizontal]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging === null || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerSize = isHorizontal ? containerRect.width : containerRect.height;
    
    const currentPos = isHorizontal ? e.clientX : e.clientY;
    const delta = currentPos - dragStart.pos;
    const deltaPercent = (delta / containerSize) * 100;

    const newSizes = [...dragStart.sizes];
    const leftIndex = isDragging;
    const rightIndex = isDragging + 1;

    // Calculate new sizes
    const leftSize = Math.max(5, Math.min(95, newSizes[leftIndex] + deltaPercent));
    const rightSize = Math.max(5, Math.min(95, newSizes[rightIndex] - deltaPercent));

    // Only update if both sizes are within bounds
    if (leftSize >= 5 && rightSize >= 5) {
      newSizes[leftIndex] = leftSize;
      newSizes[rightIndex] = rightSize;
      onSizesChange(newSizes);
    }
  }, [isDragging, dragStart, isHorizontal, onSizesChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const renderHandle = (index: number) => {
    const isHovered = hoveredHandle === index;
    const isBeingDragged = isDragging === index;

    return (
      <div
        key={`handle-${index}`}
        className={`
          relative flex items-center justify-center
          ${isHorizontal ? 'w-2 h-full cursor-col-resize' : 'h-2 w-full cursor-row-resize'}
          ${isHovered || isBeingDragged ? 'bg-primary/30' : 'bg-border hover:bg-primary/20'}
          transition-colors duration-200 group
        `}
        onMouseDown={(e) => handleMouseDown(index, e)}
        onMouseEnter={() => setHoveredHandle(index)}
        onMouseLeave={() => setHoveredHandle(null)}
      >
        {/* Resize indicator */}
        <div className={`
          ${isHorizontal ? 'w-1 h-8' : 'h-1 w-8'}
          bg-primary/60 rounded-full opacity-0 group-hover:opacity-100
          transition-opacity duration-200
        `} />

        {/* Quick action buttons */}
        {isHovered && (
          <div className={`
            absolute ${isHorizontal ? 'top-2 left-1/2 -translate-x-1/2' : 'left-2 top-1/2 -translate-y-1/2'}
            flex ${isHorizontal ? 'flex-col' : 'flex-row'} gap-1 z-10
            bg-background border border-border rounded p-1 shadow-lg
          `}>
            {onSplit && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onSplit(index, 'horizontal')}
                  title="Split horizontally"
                >
                  <SplitSquareHorizontal className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onSplit(index, 'vertical')}
                  title="Split vertically"
                >
                  <SplitSquareVertical className="h-3 w-3" />
                </Button>
              </>
            )}
            {onMerge && children.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onMerge(index)}
                title="Merge panels"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderChild = (child: React.ReactNode, index: number) => {
    const isHovered = hoveredChild === index;

    return (
      <div
        key={`child-${index}`}
        className={`
          relative overflow-hidden
          ${isHovered ? 'ring-2 ring-primary/50' : ''}
          transition-all duration-200
        `}
        style={{
          [isHorizontal ? 'width' : 'height']: `${sizes[index]}%`,
          [isHorizontal ? 'height' : 'width']: '100%'
        }}
        onMouseEnter={() => setHoveredChild(index)}
        onMouseLeave={() => setHoveredChild(null)}
      >
        {child}

        {/* Child action buttons */}
        {isHovered && (onDelete || onSplit) && (
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            {onSplit && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-80 hover:opacity-100"
                  onClick={() => onSplit(index, 'horizontal')}
                  title="Split horizontally"
                >
                  <SplitSquareHorizontal className="h-3 w-3" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-80 hover:opacity-100"
                  onClick={() => onSplit(index, 'vertical')}
                  title="Split vertically"
                >
                  <SplitSquareVertical className="h-3 w-3" />
                </Button>
              </>
            )}
            {onDelete && children.length > 1 && (
              <Button
                variant="destructive"
                size="sm"
                className="h-7 w-7 p-0 opacity-80 hover:opacity-100"
                onClick={() => onDelete(index)}
                title="Delete panel"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`
        flex ${isHorizontal ? 'flex-row' : 'flex-col'} 
        w-full h-full ${className}
      `}
    >
      {children.map((child, index) => (
        <React.Fragment key={index}>
          {renderChild(child, index)}
          {index < children.length - 1 && renderHandle(index)}
        </React.Fragment>
      ))}
    </div>
  );
};