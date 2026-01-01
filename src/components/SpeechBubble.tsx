import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Settings, Type, Palette, Move, RotateCw } from 'lucide-react';

export type BubbleType = 'speech' | 'thought' | 'scream' | 'whisper' | 'caption' | 'sfx';

export interface SpeechBubbleProps {
  id: string;
  text: string;
  bubbleType: BubbleType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    color: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    tailDirection: 'top' | 'bottom' | 'left' | 'right' | 'none';
    tailSize: number;
    padding: number;
    letterSpacing: number;
    lineHeight: number;
    textAlign: 'left' | 'center' | 'right';
    rotation: number;
    opacity: number;
  };
  isSelected?: boolean;
  isEditing?: boolean;
  onUpdate?: (updates: Partial<SpeechBubbleProps>) => void;
  onSelect?: () => void;
  onStartEdit?: () => void;
  onEndEdit?: () => void;
}

const BUBBLE_PRESETS: Record<BubbleType, Partial<SpeechBubbleProps['style']>> = {
  speech: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 2,
    borderRadius: 20,
    tailDirection: 'bottom',
    tailSize: 15,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    textAlign: 'center'
  },
  thought: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 2,
    borderRadius: 25,
    tailDirection: 'bottom',
    tailSize: 12,
    padding: 12,
    fontSize: 13,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    textAlign: 'center'
  },
  scream: {
    backgroundColor: '#ffff00',
    borderColor: '#ff0000',
    borderWidth: 3,
    borderRadius: 5,
    tailDirection: 'bottom',
    tailSize: 20,
    padding: 8,
    fontSize: 16,
    fontFamily: 'Impact, Arial Black, sans-serif',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  whisper: {
    backgroundColor: '#f0f0f0',
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 15,
    tailDirection: 'bottom',
    tailSize: 8,
    padding: 10,
    fontSize: 11,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    textAlign: 'center'
  },
  caption: {
    backgroundColor: '#000000',
    borderColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 5,
    tailDirection: 'none',
    tailSize: 0,
    padding: 8,
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    textAlign: 'center',
    color: '#ffffff'
  },
  sfx: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    tailDirection: 'none',
    tailSize: 0,
    padding: 4,
    fontSize: 18,
    fontFamily: 'Impact, Arial Black, sans-serif',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2
  }
};

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  id,
  text,
  bubbleType,
  position,
  size,
  style,
  isSelected = false,
  isEditing = false,
  onUpdate,
  onSelect,
  onStartEdit,
  onEndEdit
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    onSelect?.();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !onUpdate) return;
    
    onUpdate({
      position: {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleTextChange = (newText: string) => {
    onUpdate?.({ text: newText });
  };

  const handleDoubleClick = () => {
    onStartEdit?.();
  };

  const handleTextareaBlur = () => {
    onEndEdit?.();
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEndEdit?.();
    }
    if (e.key === 'Escape') {
      onEndEdit?.();
    }
  };

  const getBubblePath = () => {
    const { width, height } = size;
    const { borderRadius, tailDirection, tailSize } = style;
    
    if (tailDirection === 'none' || bubbleType === 'caption' || bubbleType === 'sfx') {
      return '';
    }

    const r = borderRadius;
    let path = '';

    // Create rounded rectangle with tail
    switch (tailDirection) {
      case 'bottom':
        path = `M${r},0 L${width-r},0 Q${width},0 ${width},${r} L${width},${height-r} Q${width},${height} ${width-r},${height} L${width/2 + tailSize},${height} L${width/2},${height + tailSize} L${width/2 - tailSize},${height} L${r},${height} Q0,${height} 0,${height-r} L0,${r} Q0,0 ${r},0 Z`;
        break;
      case 'top':
        path = `M${width/2 - tailSize},0 L${width/2},${-tailSize} L${width/2 + tailSize},0 L${width-r},0 Q${width},0 ${width},${r} L${width},${height-r} Q${width},${height} ${width-r},${height} L${r},${height} Q0,${height} 0,${height-r} L0,${r} Q0,0 ${r},0 Z`;
        break;
      case 'left':
        path = `M0,${height/2 - tailSize} L${-tailSize},${height/2} L0,${height/2 + tailSize} L0,${height-r} Q0,${height} ${r},${height} L${width-r},${height} Q${width},${height} ${width},${height-r} L${width},${r} Q${width},0 ${width-r},0 L${r},0 Q0,0 0,${r} Z`;
        break;
      case 'right':
        path = `M${width},${height/2 - tailSize} L${width + tailSize},${height/2} L${width},${height/2 + tailSize} L${width},${height-r} Q${width},${height} ${width-r},${height} L${r},${height} Q0,${height} 0,${height-r} L0,${r} Q0,0 ${r},0 L${width-r},0 Q${width},0 ${width},${r} Z`;
        break;
    }

    return path;
  };

  const bubbleStyle: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
    transform: `rotate(${style.rotation}deg)`,
    opacity: style.opacity,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isSelected ? 1000 : 1,
    userSelect: 'none'
  };

  const contentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: style.backgroundColor,
    border: `${style.borderWidth}px solid ${style.borderColor}`,
    borderRadius: bubbleType === 'sfx' ? 0 : style.borderRadius,
    padding: style.padding,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    color: style.color,
    textAlign: style.textAlign,
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    wordWrap: 'break-word'
  };

  const bubblePath = getBubblePath();

  return (
    <div
      ref={bubbleRef}
      style={bubbleStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className={`speech-bubble ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      {bubblePath && (
        <svg
          width={size.width + Math.abs(style.tailSize)}
          height={size.height + Math.abs(style.tailSize)}
          style={{
            position: 'absolute',
            top: style.tailDirection === 'top' ? -style.tailSize : 0,
            left: style.tailDirection === 'left' ? -style.tailSize : 0,
            zIndex: -1
          }}
        >
          <path
            d={bubblePath}
            fill={style.backgroundColor}
            stroke={style.borderColor}
            strokeWidth={style.borderWidth}
          />
        </svg>
      )}
      
      <div style={contentStyle}>
        {isEditing ? (
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={handleTextareaBlur}
            onKeyDown={handleTextareaKeyDown}
            className="w-full h-full resize-none border-none bg-transparent text-inherit font-inherit text-center focus:outline-none focus:ring-0"
            style={{
              fontSize: style.fontSize,
              fontFamily: style.fontFamily,
              fontWeight: style.fontWeight,
              color: style.color,
              textAlign: style.textAlign,
              letterSpacing: style.letterSpacing,
              lineHeight: style.lineHeight
            }}
            autoFocus
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {text || 'Double-click to edit'}
          </div>
        )}
      </div>
    </div>
  );
};

// Speech Bubble Inspector Component
interface SpeechBubbleInspectorProps {
  bubble: SpeechBubbleProps;
  onUpdate: (updates: Partial<SpeechBubbleProps>) => void;
}

export const SpeechBubbleInspector: React.FC<SpeechBubbleInspectorProps> = ({
  bubble,
  onUpdate
}) => {
  const applyPreset = (type: BubbleType) => {
    const preset = BUBBLE_PRESETS[type];
    onUpdate({
      bubbleType: type,
      style: { ...bubble.style, ...preset }
    });
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Speech Bubble
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bubble Type */}
        <div className="space-y-2">
          <Label>Bubble Type</Label>
          <Select value={bubble.bubbleType} onValueChange={(value: BubbleType) => applyPreset(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="speech">Speech</SelectItem>
              <SelectItem value="thought">Thought</SelectItem>
              <SelectItem value="scream">Scream</SelectItem>
              <SelectItem value="whisper">Whisper</SelectItem>
              <SelectItem value="caption">Caption</SelectItem>
              <SelectItem value="sfx">Sound Effect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Text Content */}
        <div className="space-y-2">
          <Label>Text</Label>
          <Textarea
            value={bubble.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Enter your text..."
            className="bg-background border-border"
          />
        </div>

        {/* Font Settings */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Font Settings
          </Label>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Size</Label>
              <Slider
                value={[bubble.style.fontSize]}
                onValueChange={([value]) => onUpdate({ style: { ...bubble.style, fontSize: value } })}
                min={8}
                max={48}
                step={1}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{bubble.style.fontSize}px</span>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Weight</Label>
              <Select 
                value={bubble.style.fontWeight} 
                onValueChange={(value) => onUpdate({ style: { ...bubble.style, fontWeight: value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="lighter">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </Label>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Text Color</Label>
              <Input
                type="color"
                value={bubble.style.color}
                onChange={(e) => onUpdate({ style: { ...bubble.style, color: e.target.value } })}
                className="h-8 w-full"
              />
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Background</Label>
              <Input
                type="color"
                value={bubble.style.backgroundColor}
                onChange={(e) => onUpdate({ style: { ...bubble.style, backgroundColor: e.target.value } })}
                className="h-8 w-full"
              />
            </div>
          </div>
        </div>

        {/* Tail Settings */}
        {bubble.bubbleType !== 'caption' && bubble.bubbleType !== 'sfx' && (
          <div className="space-y-3">
            <Label>Tail Direction</Label>
            <Select 
              value={bubble.style.tailDirection} 
              onValueChange={(value: any) => onUpdate({ style: { ...bubble.style, tailDirection: value } })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Transform */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            Transform
          </Label>
          
          <div className="space-y-2">
            <Label className="text-xs">Rotation</Label>
            <Slider
              value={[bubble.style.rotation]}
              onValueChange={([value]) => onUpdate({ style: { ...bubble.style, rotation: value } })}
              min={-180}
              max={180}
              step={1}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{bubble.style.rotation}°</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};