import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Image } from 'lucide-react';
import { TextGenerationControls } from './TextGenerationControls';

interface LeafNode {
  kind: "leaf";
  id: string;
  contentType: "text" | "image";
  textProps: {
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
  };
  imageProps: {
    url: string;
    objectFit: "cover" | "contain" | "fill";
    opacity: number;
    borderRadius: number;
  };
  backgroundProps: {
    color: string;
    opacity: number;
  };
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

interface Character {
  id: string;
  name: string;
  notes: string;
  referenceImages: string[];
  createdAt: Date;
}

interface EnhancedLeafInspectorProps {
  node: LeafNode;
  onChange: (updater: (node: any) => any) => void;
  onGenerateText: () => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  characters: Character[];
  onGenerateImage: (characterId?: string) => void;
  isGenerating: boolean;
  manualImageUrl: string;
  setManualImageUrl: (url: string) => void;
  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;
  referenceImageUrl: string;
  setReferenceImageUrl: (url: string) => void;
  referenceImages: string[];
  setReferenceImages: (images: string[]) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  seed: number | null;
  setSeed: (seed: number | null) => void;
  guidanceScale: number;
  setGuidanceScale: (scale: number) => void;
  inferenceSteps: number;
  setInferenceSteps: (steps: number) => void;
  imageStrength: number;
  setImageStrength: (strength: number) => void;
  outputFormat: string;
  setOutputFormat: (format: string) => void;
  safetyTolerance: number;
  setSafetyTolerance: (tolerance: number) => void;
  promptUpsampling: boolean;
  setPromptUpsampling: (upsampling: boolean) => void;
}

export const EnhancedLeafInspector: React.FC<EnhancedLeafInspectorProps> = ({
  node,
  onChange,
  onGenerateText,
  aiPrompt,
  setAiPrompt,
  characters,
  onGenerateImage,
  isGenerating,
  manualImageUrl,
  setManualImageUrl,
  // Accept the additional props but don't use them in this simplified version
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
  setPromptUpsampling
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select
              value={node.contentType}
              onValueChange={(value: "text" | "image") => 
                onChange(n => ({ ...n, contentType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {node.contentType === "text" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Text Content</Label>
                <Textarea
                  value={node.textProps.text}
                  onChange={(e) => 
                    onChange(n => ({
                      ...n,
                      textProps: { ...n.textProps, text: e.target.value }
                    }))
                  }
                  rows={4}
                  placeholder="Enter your text here..."
                />
              </div>
              
              <TextGenerationControls
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                onGenerateText={onGenerateText}
              />
            </div>
          )}

          {node.contentType === "image" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Manual Image URL</Label>
                <Input
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <Button
                  onClick={() => {
                    if (manualImageUrl.trim()) {
                      onChange(n => ({
                        ...n,
                        imageProps: { ...n.imageProps, url: manualImageUrl }
                      }));
                      setManualImageUrl("");
                    }
                  }}
                  disabled={!manualImageUrl.trim()}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  Apply URL
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>AI Image Prompt</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  placeholder="Describe the image you want to generate..."
                />
              </div>
              
              <Button 
                onClick={() => onGenerateImage()}
                disabled={!aiPrompt.trim() || isGenerating}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Typography Controls */}
      {node.contentType === "text" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Input
                  type="number"
                  value={node.textProps.fontSize}
                  onChange={(e) => 
                    onChange(n => ({
                      ...n,
                      textProps: { ...n.textProps, fontSize: parseInt(e.target.value) || 16 }
                    }))
                  }
                  min={8}
                  max={72}
                />
              </div>
              <div className="space-y-2">
                <Label>Line Height</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={node.textProps.lineHeight}
                  onChange={(e) => 
                    onChange(n => ({
                      ...n,
                      textProps: { ...n.textProps, lineHeight: parseFloat(e.target.value) || 1.4 }
                    }))
                  }
                  min={0.5}
                  max={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={node.textProps.fontFamily}
                onValueChange={(value) => 
                  onChange(n => ({
                    ...n,
                    textProps: { ...n.textProps, fontFamily: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                  <SelectItem value="Georgia, serif">Georgia</SelectItem>
                  <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                  <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                  <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                  <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                  <SelectItem value="'Comic Sans MS', cursive">Comic Sans MS</SelectItem>
                  <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                  <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                  <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <Select
                value={node.textProps.textAlign}
                onValueChange={(value: "left" | "center" | "right" | "justify") => 
                  onChange(n => ({
                    ...n,
                    textProps: { ...n.textProps, textAlign: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Text Style Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={node.textProps.fontWeight === "bold"}
                  onCheckedChange={(checked) => 
                    onChange(n => ({
                      ...n,
                      textProps: { ...n.textProps, fontWeight: checked ? "bold" : "normal" }
                    }))
                  }
                />
                <Label className="text-xs">Bold</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={node.textProps.italic}
                  onCheckedChange={(checked) => 
                    onChange(n => ({
                      ...n,
                      textProps: { ...n.textProps, italic: checked }
                    }))
                  }
                />
                <Label className="text-xs">Italic</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={node.textProps.underline}
                  onCheckedChange={(checked) => 
                    onChange(n => ({
                      ...n,
                      textProps: { ...n.textProps, underline: checked }
                    }))
                  }
                />
                <Label className="text-xs">Underline</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={node.textProps.strikethrough}
                  onCheckedChange={(checked) => 
                    onChange(n => ({
                      ...n,
                      textProps: { ...n.textProps, strikethrough: checked }
                    }))
                  }
                />
                <Label className="text-xs">Strike</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={node.textProps.color}
                onChange={(e) => 
                  onChange(n => ({
                    ...n,
                    textProps: { ...n.textProps, color: e.target.value }
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Letter Spacing</Label>
              <Slider
                value={[node.textProps.letterSpacing]}
                onValueChange={([value]) => 
                  onChange(n => ({
                    ...n,
                    textProps: { ...n.textProps, letterSpacing: value }
                  }))
                }
                min={-2}
                max={5}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-center">
                {node.textProps.letterSpacing}px
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};