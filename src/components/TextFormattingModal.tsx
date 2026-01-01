import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  CaseSensitive,
  LetterText
} from 'lucide-react';

interface TextProps {
  text: string;
  fontSize: number;
  color: string;
  fontWeight: string;
  textAlign: "left" | "center" | "right" | "justify";
  fontFamily: string;
  lineHeight: number;
  letterSpacing: number;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  textShadow: string;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  wordSpacing: number;
  textBackground: string;
  textBackgroundOpacity: number;
  fontWeight100: number;
  textGradient: string;
}

interface TextFormattingModalProps {
  textProps: TextProps;
  onChange: (updates: Partial<TextProps>) => void;
}

const FONT_FAMILIES = [
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "'Comic Sans MS', cursive", label: "Comic Sans MS" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'Lora', serif", label: "Lora" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Oswald', sans-serif", label: "Oswald" },
  { value: "'Raleway', sans-serif", label: "Raleway" },
];

const TEXT_SHADOWS = [
  { value: "none", label: "None" },
  { value: "1px 1px 2px rgba(0,0,0,0.3)", label: "Subtle" },
  { value: "2px 2px 4px rgba(0,0,0,0.5)", label: "Medium" },
  { value: "3px 3px 6px rgba(0,0,0,0.7)", label: "Strong" },
  { value: "0 0 10px rgba(255,255,255,0.8)", label: "Glow (Light)" },
  { value: "0 0 10px rgba(0,0,0,0.8)", label: "Glow (Dark)" },
];

export const TextFormattingModal: React.FC<TextFormattingModalProps> = ({
  textProps,
  onChange
}) => {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Type className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Text Formatting</p>
        </TooltipContent>
      </Tooltip>
      
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Text Formatting
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="font" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="font">Font</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>
          
          {/* Font Tab */}
          <TabsContent value="font" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Font Family</Label>
              <Select
                value={textProps.fontFamily}
                onValueChange={(value) => onChange({ fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem 
                      key={font.value} 
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Font Size</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[textProps.fontSize]}
                    onValueChange={([value]) => onChange({ fontSize: value })}
                    min={8}
                    max={96}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={textProps.fontSize}
                    onChange={(e) => onChange({ fontSize: parseInt(e.target.value) || 16 })}
                    className="w-16"
                    min={8}
                    max={96}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Font Weight</Label>
                <Slider
                  value={[textProps.fontWeight100]}
                  onValueChange={([value]) => onChange({ 
                    fontWeight100: value,
                    fontWeight: value >= 600 ? 'bold' : 'normal'
                  })}
                  min={100}
                  max={900}
                  step={100}
                />
                <div className="text-xs text-muted-foreground text-center">
                  {textProps.fontWeight100}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Text Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={textProps.color}
                  onChange={(e) => onChange({ color: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={textProps.color}
                  onChange={(e) => onChange({ color: e.target.value })}
                  placeholder="#374151"
                  className="flex-1"
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Style Tab */}
          <TabsContent value="style" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Text Alignment</Label>
              <div className="flex gap-2">
                {[
                  { value: 'left', icon: AlignLeft },
                  { value: 'center', icon: AlignCenter },
                  { value: 'right', icon: AlignRight },
                  { value: 'justify', icon: AlignJustify },
                ].map(({ value, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={textProps.textAlign === value ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => onChange({ textAlign: value as TextProps['textAlign'] })}
                    className="h-10 w-10"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Text Decoration</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Bold className="h-4 w-4" />
                    <span className="text-sm">Bold</span>
                  </div>
                  <Switch
                    checked={textProps.fontWeight === 'bold'}
                    onCheckedChange={(checked) => onChange({ 
                      fontWeight: checked ? 'bold' : 'normal',
                      fontWeight100: checked ? 700 : 400
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Italic className="h-4 w-4" />
                    <span className="text-sm">Italic</span>
                  </div>
                  <Switch
                    checked={textProps.italic}
                    onCheckedChange={(checked) => onChange({ italic: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Underline className="h-4 w-4" />
                    <span className="text-sm">Underline</span>
                  </div>
                  <Switch
                    checked={textProps.underline}
                    onCheckedChange={(checked) => onChange({ underline: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Strikethrough className="h-4 w-4" />
                    <span className="text-sm">Strikethrough</span>
                  </div>
                  <Switch
                    checked={textProps.strikethrough}
                    onCheckedChange={(checked) => onChange({ strikethrough: checked })}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Text Transform</Label>
              <Select
                value={textProps.textTransform}
                onValueChange={(value: TextProps['textTransform']) => onChange({ textTransform: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="uppercase">UPPERCASE</SelectItem>
                  <SelectItem value="lowercase">lowercase</SelectItem>
                  <SelectItem value="capitalize">Capitalize</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          {/* Spacing Tab */}
          <TabsContent value="spacing" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Line Height</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[textProps.lineHeight]}
                  onValueChange={([value]) => onChange({ lineHeight: value })}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12 text-center">
                  {textProps.lineHeight.toFixed(1)}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Letter Spacing</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[textProps.letterSpacing]}
                  onValueChange={([value]) => onChange({ letterSpacing: value })}
                  min={-2}
                  max={10}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-16 text-center">
                  {textProps.letterSpacing.toFixed(1)}px
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Word Spacing</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[textProps.wordSpacing]}
                  onValueChange={([value]) => onChange({ wordSpacing: value })}
                  min={-5}
                  max={20}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-16 text-center">
                  {textProps.wordSpacing.toFixed(1)}px
                </span>
              </div>
            </div>
          </TabsContent>
          
          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Text Shadow</Label>
              <Select
                value={textProps.textShadow}
                onValueChange={(value) => onChange({ textShadow: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_SHADOWS.map((shadow) => (
                    <SelectItem key={shadow.value} value={shadow.value}>
                      {shadow.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Text Background</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={textProps.textBackground === 'transparent' ? '#ffffff' : textProps.textBackground}
                  onChange={(e) => onChange({ textBackground: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={textProps.textBackground}
                  onChange={(e) => onChange({ textBackground: e.target.value })}
                  placeholder="transparent"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Background Opacity</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[textProps.textBackgroundOpacity]}
                  onValueChange={([value]) => onChange({ textBackgroundOpacity: value })}
                  min={0}
                  max={1}
                  step={0.05}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12 text-center">
                  {Math.round(textProps.textBackgroundOpacity * 100)}%
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Text Gradient (CSS)</Label>
              <Input
                type="text"
                value={textProps.textGradient}
                onChange={(e) => onChange({ textGradient: e.target.value })}
                placeholder="linear-gradient(90deg, #ff0000, #0000ff)"
              />
              <p className="text-xs text-muted-foreground">
                Enter a CSS gradient for gradient text effect
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Live Preview */}
        <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30">
          <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
          <div
            style={{
              fontFamily: textProps.fontFamily,
              fontSize: `${Math.min(textProps.fontSize, 32)}px`,
              fontWeight: textProps.fontWeight100,
              color: textProps.textGradient ? 'transparent' : textProps.color,
              textAlign: textProps.textAlign,
              lineHeight: textProps.lineHeight,
              letterSpacing: `${textProps.letterSpacing}px`,
              wordSpacing: `${textProps.wordSpacing}px`,
              fontStyle: textProps.italic ? 'italic' : 'normal',
              textDecoration: [
                textProps.underline ? 'underline' : '',
                textProps.strikethrough ? 'line-through' : ''
              ].filter(Boolean).join(' ') || 'none',
              textTransform: textProps.textTransform,
              textShadow: textProps.textShadow,
              background: textProps.textGradient || (
                textProps.textBackground !== 'transparent' 
                  ? `${textProps.textBackground}${Math.round(textProps.textBackgroundOpacity * 255).toString(16).padStart(2, '0')}`
                  : 'transparent'
              ),
              backgroundClip: textProps.textGradient ? 'text' : 'padding-box',
              WebkitBackgroundClip: textProps.textGradient ? 'text' : 'padding-box',
              padding: textProps.textBackground !== 'transparent' ? '4px 8px' : 0,
              borderRadius: '4px'
            }}
          >
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
